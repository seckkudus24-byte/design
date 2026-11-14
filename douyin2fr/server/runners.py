"""Où s'exécutent les traitements.

- LocalRunner : sur la machine du serveur (ordinateur, VPS, conteneur GPU).
- ModalRunner : dans une fonction GPU Modal facturée à la seconde ; le serveur web
  (petit conteneur CPU) ne fait que piloter et afficher la progression.
"""
from __future__ import annotations

import time

from .worker_core import execute


class LocalRunner:
    name = "local"

    def __init__(self, data_dir: str, models_dir: str):
        self.data_dir, self.models_dir = data_dir, models_dir

    def run(self, job, action: str, progress, cancel) -> dict:
        import os
        return execute(os.path.join(self.data_dir, job.id), self.models_dir, action, _settings(job),
                       progress, cancel)

    def after_upload(self):
        pass


def _settings(job) -> dict:
    return {"method": job.method, "resolution": job.resolution, "auto_clean": job.auto_clean,
            "timings": job.timings}


class ModalRunner:
    """Délègue à la fonction GPU `process` (voir deploy/modal_app.py).

    Progression : dictionnaire partagé Modal (`state`), mis à jour chaque seconde par la
    fonction GPU. Fichiers : volume partagé, synchronisé par commit()/reload().
    Si le conteneur web redémarre pendant un traitement, l'appel en cours est
    retrouvé grâce à son identifiant (`job.remote_call`) au lieu d'être relancé."""
    name = "modal-gpu"

    def __init__(self, process_fn, state, volume, save_job):
        self.process_fn, self.state, self.volume, self.save_job = process_fn, state, volume, save_job

    def after_upload(self):
        self.volume.commit()  # rend la vidéo importée visible pour la fonction GPU

    def run(self, job, action: str, progress, cancel) -> dict:
        import modal

        call = None
        if job.remote_call:
            try:
                call = modal.FunctionCall.from_id(job.remote_call)
            except Exception:  # noqa: BLE001
                call = None
        if call is None:
            self.volume.commit()
            self.state[f"cancel:{job.id}"] = False
            call = self.process_fn.spawn(job.id, action, _settings(job))
            job.remote_call = call.object_id
            self.save_job(job)
        try:
            while True:
                try:
                    result = call.get(timeout=1.0)
                    break
                except TimeoutError:
                    pass
                p = self.state.get(f"progress:{job.id}")
                if p:
                    progress(p["stage"], p["progress"], p["message"])
                if cancel():
                    self.state[f"cancel:{job.id}"] = True  # la fonction GPU s'arrête proprement…
                    try:
                        call.get(timeout=30)
                    except Exception:  # noqa: BLE001
                        pass
                    call.cancel()  # …sinon on la coupe (la facturation s'arrête)
                    raise InterruptedError("Traitement annulé")
        finally:
            job.remote_call = ""
        for _ in range(10):  # rend visibles les fichiers produits par la fonction GPU
            try:
                self.volume.reload()
                break
            except Exception:  # noqa: BLE001  (fichier ouvert pendant un téléchargement : on réessaie)
                time.sleep(2)
        if isinstance(result, dict) and result.get("error"):
            if result.get("cancelled"):
                raise InterruptedError("Traitement annulé")
            raise RuntimeError(result["error"])
        return result
