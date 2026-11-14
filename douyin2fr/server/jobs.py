"""File d'attente des traitements (une vidéo à la fois, ordre d'arrivée)."""
from __future__ import annotations

import json
import os
import shutil
import threading
import time
import traceback
import uuid
from dataclasses import asdict, dataclass, field

from d2f.pipeline import METHODS
from d2f.video_io import VideoError, check_duration, probe  # noqa: F401
from .runners import LocalRunner

# États : queued → analyzing → analyzed → (queued_clean → cleaning) → done
#         error / cancelled à tout moment


@dataclass
class Job:
    id: str
    name: str
    created: float
    status: str = "queued"
    stage: str = ""
    progress: float = 0.0
    message: str = ""
    error: str = ""
    method: str = "temporal"
    resolution: str = "auto"
    auto_clean: bool = False
    info: dict = field(default_factory=dict)
    summary: dict = field(default_factory=dict)
    previews: list = field(default_factory=list)
    stats: dict = field(default_factory=dict)
    timings: dict = field(default_factory=dict)
    remote_call: str = ""   # identifiant de l'appel GPU distant en cours (reprise après redémarrage)

    def public(self):
        d = asdict(self)
        d["has_result"] = self.status == "done"
        return d


class JobManager:
    def __init__(self, data_dir: str, models_dir: str, runner=None, autostart: bool = True):
        self.data_dir = os.path.abspath(data_dir)
        self.models_dir = models_dir
        self.runner = runner or LocalRunner(self.data_dir, models_dir)
        os.makedirs(self.data_dir, exist_ok=True)
        self.jobs: dict[str, Job] = {}
        self.queue: list[tuple[str, str]] = []  # (job_id, action)
        self.lock = threading.Lock()
        self.wake = threading.Event()
        self.paused = False
        self.current: str | None = None
        self._cancel: set[str] = set()
        self.retention_days = float(os.environ.get("D2F_RETENTION_DAYS", "7"))
        self._load()
        self._started = False
        if autostart:
            self.start()

    def start(self):
        """Démarre le traitement de la file (après avoir éventuellement choisi un autre `runner`)."""
        if not self._started:
            self._started = True
            threading.Thread(target=self._worker, daemon=True).start()
            threading.Thread(target=self._janitor, daemon=True).start()

    def _janitor(self):
        """Supprime les vidéos (originales et résultats) plus anciennes que D2F_RETENTION_DAYS."""
        while True:
            if self.retention_days > 0:
                limit = time.time() - self.retention_days * 86400
                for jid, job in list(self.jobs.items()):
                    if job.created < limit and self.current != jid and job.status not in ("queued", "queued_clean"):
                        self.delete(jid)
                for d in (self.data_dir, os.path.join(self.data_dir, "uploads")):  # envois interrompus
                    if not os.path.isdir(d):
                        continue
                    for f in os.listdir(d):
                        p = os.path.join(d, f)
                        if f.endswith((".upload", ".part", ".json")) and d != self.data_dir or f.endswith(".upload"):
                            if os.path.isfile(p) and os.path.getmtime(p) < time.time() - 86400:
                                os.remove(p)
            time.sleep(3600)

    # ------------------------------------------------------------ stockage
    def dir(self, jid):
        return os.path.join(self.data_dir, jid)

    def path(self, jid, name):
        return os.path.join(self.dir(jid), name)

    def original(self, jid):
        d = self.dir(jid)
        for f in os.listdir(d):
            if f.startswith("original."):
                return os.path.join(d, f)
        raise FileNotFoundError

    def _save(self, job: Job):
        tmp = self.path(job.id, "job.json.tmp")
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(asdict(job), f, ensure_ascii=False)
        os.replace(tmp, self.path(job.id, "job.json"))

    def _load(self):
        for jid in os.listdir(self.data_dir):
            if jid == "uploads":
                continue
            p = self.path(jid, "job.json")
            if not os.path.exists(p):
                continue
            try:
                with open(p, encoding="utf-8") as f:
                    d = json.load(f)
                job = Job(**{k: v for k, v in d.items() if k in Job.__dataclass_fields__})
            except Exception:
                continue
            if job.status in ("analyzing", "queued"):
                job.status, job.progress = "queued", 0.0
                self.queue.append((jid, "analyze"))
            elif job.status in ("cleaning", "queued_clean"):
                job.status, job.progress = "queued_clean", 0.0
                self.queue.append((jid, "clean"))
            self.jobs[jid] = job
        self.queue.sort(key=lambda q: self.jobs[q[0]].created)

    # ------------------------------------------------------------- actions
    def add(self, filename: str, src_path: str, method: str, auto_clean: bool,
            resolution: str = "auto") -> Job:
        """Ajoute une vidéo. Lève VideoError (fichier refusé et supprimé) si elle est
        illisible ou dépasse 5 minutes."""
        info = probe(src_path)
        check_duration(info)
        jid = uuid.uuid4().hex[:12]
        os.makedirs(self.dir(jid), mode=0o700)
        ext = os.path.splitext(filename)[1].lower()
        if ext not in (".mp4", ".mov", ".m4v", ".webm", ".mkv", ".avi"):
            ext = ".mp4"
        dst = self.path(jid, "original" + ext)
        shutil.move(src_path, dst)
        os.chmod(dst, 0o400)  # l'original n'est jamais modifié
        safe_name = os.path.basename(filename)[:120] or "video"
        job = Job(jid, safe_name, time.time(), method=method if method in METHODS else "temporal",
                  resolution=resolution if resolution in ("auto", "1080p", "source") else "auto",
                  auto_clean=auto_clean)
        job.info = {"width": info.width, "height": info.height, "fps": round(info.fps_float, 3),
                    "duration": round(info.duration, 2), "frames": info.nb_frames,
                    "audio": info.has_audio}
        with self.lock:
            self.jobs[jid] = job
            self._save(job)
            if job.status == "queued":
                self.queue.append((jid, "analyze"))
        self.runner.after_upload()
        self.wake.set()
        return job

    def request_clean(self, jid: str, method: str, resolution: str | None = None):
        with self.lock:
            job = self.jobs[jid]
            if job.status not in ("analyzed", "done", "error", "cancelled") or not os.path.exists(
                    self.path(jid, "analysis.json")):
                raise ValueError("La vidéo doit d'abord être analysée.")
            job.method = method if method in METHODS else job.method
            if resolution in ("auto", "1080p", "source"):
                job.resolution = resolution
            job.status, job.progress, job.error, job.message = "queued_clean", 0.0, "", ""
            self.queue.append((jid, "clean"))
            self._save(job)
        self.wake.set()

    def cancel(self, jid: str):
        with self.lock:
            job = self.jobs[jid]
            self.queue = [q for q in self.queue if q[0] != jid]
            if self.current == jid:
                self._cancel.add(jid)
            elif job.status in ("queued", "queued_clean"):
                job.status = "cancelled" if job.status == "queued" else "analyzed"
                self._save(job)

    def delete(self, jid: str):
        self.cancel(jid)
        for _ in range(50):
            if self.current != jid:
                break
            time.sleep(0.1)
        with self.lock:
            self.jobs.pop(jid, None)
        shutil.rmtree(self.dir(jid), ignore_errors=True)

    def set_paused(self, paused: bool):
        self.paused = paused
        self.wake.set()

    def list(self):
        with self.lock:
            return sorted((j.public() for j in self.jobs.values()), key=lambda j: j["created"])

    # -------------------------------------------------------------- worker
    def _next(self):
        with self.lock:
            if self.paused or not self.queue:
                return None
            return self.queue.pop(0)

    def _worker(self):
        while True:
            item = self._next()
            if item is None:
                self.wake.wait(1.0)
                self.wake.clear()
                continue
            jid, action = item
            job = self.jobs.get(jid)
            if job is None:
                continue
            self.current = jid
            try:
                self._run(job, action)
            except InterruptedError:
                job.status = "cancelled" if action == "analyze" else "analyzed"
                job.message = "Annulé"
            except Exception as e:  # noqa: BLE001
                job.status, job.error = "error", f"{type(e).__name__}: {e}"
                traceback.print_exc()
            finally:
                self._cancel.discard(jid)
                self.current = None
                if jid in self.jobs:
                    self._save(job)

    def save(self, job: Job):
        with self.lock:
            if job.id in self.jobs:
                self._save(job)

    def _run(self, job: Job, action: str):
        cancel = lambda: job.id in self._cancel  # noqa: E731

        def progress(stage, p, msg):
            job.stage, job.progress, job.message = stage, round(float(p), 4), msg

        job.status = "analyzing" if action == "analyze" else "cleaning"
        job.progress, job.error = 0.0, ""
        self.save(job)
        upd = self.runner.run(job, action, progress, cancel)
        for k, v in upd.items():
            if hasattr(job, k):
                setattr(job, k, v)
        if action == "analyze" and job.auto_clean:
            job.status = "queued_clean"
            with self.lock:
                self.queue.append((job.id, "clean"))
