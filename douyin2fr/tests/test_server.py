"""File d'attente : exécution locale et exécution distante simulée (même code que la fonction GPU)."""
import os
import subprocess
import sys
import threading
import time
import types

import pytest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
MODELS = os.path.join(ROOT, "models")


@pytest.fixture(scope="module")
def video(tmp_path_factory):
    d = tmp_path_factory.mktemp("v")
    src, sub = d / "src.mp4", d / "sub.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "testsrc2=size=480x640:rate=24:duration=3",
                    "-f", "lavfi", "-i", "sine=frequency=440:duration=3", "-shortest",
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", str(src)], check=True)
    subprocess.run([sys.executable, os.path.join(ROOT, "tests", "make_test_video.py"), str(src), str(sub),
                    "--pos", "0.75"], check=True, capture_output=True)
    return str(sub)


def _copy(video, tmp):
    import shutil
    p = os.path.join(tmp, "up.mp4")
    shutil.copy(video, p)
    return p


def _wait(jm, jid, states, timeout=300):
    t = time.time()
    while time.time() - t < timeout:
        j = jm.jobs[jid]
        if j.status in states:
            return j
        time.sleep(0.3)
    raise AssertionError(f"état final non atteint : {jm.jobs[jid].status}")


# --------------------------------------------------------------- Modal simulé
class FakeVolume:
    def __init__(self):
        self.commits = self.reloads = 0

    def commit(self):
        self.commits += 1

    def reload(self):
        self.reloads += 1


class FakeCall:
    registry = {}

    def __init__(self, fn):
        self.object_id = f"fc-{len(FakeCall.registry)}"
        FakeCall.registry[self.object_id] = self
        self.cancelled = False
        self._res, self._done = None, threading.Event()
        threading.Thread(target=lambda: (setattr(self, "_res", fn()), self._done.set()), daemon=True).start()

    def get(self, timeout=None):
        if not self._done.wait(timeout):
            raise TimeoutError
        return self._res

    def cancel(self):
        self.cancelled = True


class FakeProcess:
    def __init__(self, data_dir, state, volume):
        self.data_dir, self.state, self.volume, self.spawned = data_dir, state, volume, 0

    def spawn(self, jid, action, settings):
        from server.remote import process_job
        self.spawned += 1
        return FakeCall(lambda: process_job(self.data_dir, MODELS, jid, action, settings, self.state,
                                            commit=self.volume.commit))


@pytest.fixture
def fake_modal(monkeypatch):
    mod = types.ModuleType("modal")
    mod.FunctionCall = types.SimpleNamespace(from_id=lambda i: FakeCall.registry[i])
    monkeypatch.setitem(sys.modules, "modal", mod)
    return mod


def _manager(tmp, runner_factory=None):
    from server.jobs import JobManager
    jm = JobManager(os.path.join(tmp, "data"), MODELS)
    if runner_factory:
        jm.runner = runner_factory(jm)
    return jm


def test_local_runner_full_flow(video, tmp_path):
    jm = _manager(str(tmp_path))
    job = jm.add("ma vidéo.mp4", _copy(video, str(tmp_path)), "temporal-fast", auto_clean=True, resolution="source")
    j = _wait(jm, job.id, {"done", "error"})
    assert j.status == "done", j.error
    assert os.path.getsize(jm.path(job.id, "result.mp4")) > 0
    assert j.summary["lines"] and j.stats["px_total"] > 0


def test_remote_runner_full_flow(video, tmp_path, fake_modal):
    from server.runners import ModalRunner
    state, vol = {}, FakeVolume()
    holder = {}

    def factory(jm):
        holder["proc"] = FakeProcess(jm.data_dir, state, vol)
        return ModalRunner(holder["proc"], state, vol, jm.save)

    jm = _manager(str(tmp_path), factory)
    job = jm.add("v.mp4", _copy(video, str(tmp_path)), "temporal-fast", auto_clean=True, resolution="source")
    j = _wait(jm, job.id, {"done", "error"})
    assert j.status == "done", j.error
    assert holder["proc"].spawned == 2          # analyse puis nettoyage, chacun sur le « GPU »
    assert vol.commits >= 3 and vol.reloads >= 2  # vidéo publiée avant, résultats relus après
    assert j.remote_call == ""


def test_remote_reattach_after_web_restart(video, tmp_path, fake_modal):
    """Le conteneur web redémarre pendant un traitement : l'appel GPU en cours est repris, pas relancé."""
    from server.runners import ModalRunner
    from server.jobs import JobManager
    state, vol = {}, FakeVolume()
    data = os.path.join(str(tmp_path), "data")
    jm = JobManager(data, MODELS)
    jm.set_paused(True)
    job = jm.add("v.mp4", _copy(video, str(tmp_path)), "temporal-fast", auto_clean=False)
    proc = FakeProcess(data, state, vol)
    running = proc.spawn(job.id, "analyze", {"method": "temporal-fast"})  # appel lancé avant le « redémarrage »
    job.status, job.remote_call = "analyzing", running.object_id
    jm._save(job)
    jm2 = JobManager(data, MODELS)  # nouveau conteneur web
    jm2.runner = ModalRunner(proc, state, vol, jm2.save)
    j = _wait(jm2, job.id, {"analyzed", "error"})
    assert j.status == "analyzed", j.error
    assert proc.spawned == 1, "l'analyse ne doit pas être relancée"


def test_remote_cancel(video, tmp_path, fake_modal):
    from server.runners import ModalRunner
    state, vol = {}, FakeVolume()
    holder = {}

    def factory(jm):
        holder["proc"] = FakeProcess(jm.data_dir, state, vol)
        return ModalRunner(holder["proc"], state, vol, jm.save)

    jm = _manager(str(tmp_path), factory)
    job = jm.add("v.mp4", _copy(video, str(tmp_path)), "temporal", auto_clean=False)
    _wait(jm, job.id, {"analyzed"})
    jm.request_clean(job.id, "temporal", "source")
    _wait(jm, job.id, {"cleaning"})
    time.sleep(0.5)
    jm.cancel(job.id)
    j = _wait(jm, job.id, {"analyzed", "done", "error"}, timeout=120)
    assert j.status == "analyzed" and j.message == "Annulé", (j.status, j.message, j.error)
    assert not os.path.exists(jm.path(job.id, "result.mp4"))
