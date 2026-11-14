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

from d2f.pipeline import METHODS, Analysis, analyze, clean, preview_frames
from d2f.video_io import VideoError, probe

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
    auto_clean: bool = False
    info: dict = field(default_factory=dict)
    summary: dict = field(default_factory=dict)
    previews: list = field(default_factory=list)
    stats: dict = field(default_factory=dict)
    timings: dict = field(default_factory=dict)

    def public(self):
        d = asdict(self)
        d["has_result"] = self.status == "done"
        return d


class JobManager:
    def __init__(self, data_dir: str, models_dir: str):
        self.data_dir = os.path.abspath(data_dir)
        self.models_dir = models_dir
        os.makedirs(self.data_dir, exist_ok=True)
        self.jobs: dict[str, Job] = {}
        self.queue: list[tuple[str, str]] = []  # (job_id, action)
        self.lock = threading.Lock()
        self.wake = threading.Event()
        self.paused = False
        self.current: str | None = None
        self._cancel: set[str] = set()
        self._load()
        threading.Thread(target=self._worker, daemon=True).start()

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
            p = self.path(jid, "job.json")
            if not os.path.exists(p):
                continue
            try:
                with open(p, encoding="utf-8") as f:
                    job = Job(**json.load(f))
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
    def add(self, filename: str, src_path: str, method: str, auto_clean: bool) -> Job:
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
                  auto_clean=auto_clean)
        try:
            info = probe(dst)
            job.info = {"width": info.width, "height": info.height, "fps": round(info.fps_float, 3),
                        "duration": round(info.duration, 2), "frames": info.nb_frames,
                        "audio": info.has_audio}
        except VideoError as e:
            job.status, job.error = "error", str(e)
        with self.lock:
            self.jobs[jid] = job
            self._save(job)
            if job.status == "queued":
                self.queue.append((jid, "analyze"))
        self.wake.set()
        return job

    def request_clean(self, jid: str, method: str):
        with self.lock:
            job = self.jobs[jid]
            if job.status not in ("analyzed", "done", "error", "cancelled") or not os.path.exists(
                    self.path(jid, "analysis.json")):
                raise ValueError("La vidéo doit d'abord être analysée.")
            job.method = method if method in METHODS else job.method
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

    def _run(self, job: Job, action: str):
        cancel = lambda: job.id in self._cancel  # noqa: E731

        def progress(stage, p, msg):
            job.stage, job.progress, job.message = stage, round(float(p), 4), msg

        src = self.original(job.id)
        if action == "analyze":
            job.status = "analyzing"
            t = time.time()
            a = analyze(src, self.models_dir, progress=progress, cancel=cancel)
            a.save(self.path(job.id, "analysis.json"))
            job.summary = a.summary()
            progress("analyse", 1.0, "Préparation des aperçus")
            prev_dir = self.path(job.id, "previews")
            job.previews = [os.path.basename(p) for p in preview_frames(a, prev_dir)]
            job.timings["analyze_s"] = round(time.time() - t, 1)
            job.status, job.progress = "analyzed", 1.0
            if job.auto_clean:
                job.status = "queued_clean"
                with self.lock:
                    self.queue.append((job.id, "clean"))
        else:
            job.status = "cleaning"
            a = Analysis.load(self.path(job.id, "analysis.json"))
            a.video = src
            t = time.time()
            job.stats = clean(a, self.path(job.id, "result.mp4"), job.method, self.models_dir,
                              progress=progress, cancel=cancel)
            job.timings["clean_s"] = round(time.time() - t, 1)
            job.status, job.progress = "done", 1.0
