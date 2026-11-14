"""Exécution d'un travail (analyse ou nettoyage) sur le dossier d'une vidéo.

Code partagé entre l'exécution locale (thread du serveur) et l'exécution distante
(fonction GPU dans le cloud) : les deux appellent `execute`, qui ne dépend que du
dossier du travail et renvoie les champs du travail à mettre à jour.
"""
from __future__ import annotations

import os
import time

from d2f.pipeline import Analysis, analyze, clean, preview_frames


def original_path(job_dir: str) -> str:
    for f in os.listdir(job_dir):
        if f.startswith("original."):
            return os.path.join(job_dir, f)
    raise FileNotFoundError("vidéo originale introuvable")


def execute(job_dir: str, models_dir: str, action: str, settings: dict, progress, cancel) -> dict:
    """`settings` : method, resolution, auto_clean. Renvoie les champs mis à jour du travail.
    Lève InterruptedError si `cancel()` devient vrai."""
    src = original_path(job_dir)
    upd: dict = {"timings": dict(settings.get("timings") or {})}
    if action == "analyze":
        t = time.time()
        a = analyze(src, models_dir, progress=progress, cancel=cancel)
        a.save(os.path.join(job_dir, "analysis.json"))
        progress("analyse", 1.0, "Préparation des aperçus")
        upd["summary"] = a.summary()
        upd["previews"] = [os.path.basename(p) for p in preview_frames(a, os.path.join(job_dir, "previews"))]
        upd["timings"]["analyze_s"] = round(time.time() - t, 1)
        upd["status"] = "analyzed"
    elif action == "clean":
        a = Analysis.load(os.path.join(job_dir, "analysis.json"))
        a.video = src
        t = time.time()
        upd["stats"] = clean(a, os.path.join(job_dir, "result.mp4"), settings.get("method", "temporal"),
                             models_dir, progress=progress, cancel=cancel,
                             resolution=settings.get("resolution", "auto"))
        upd["timings"]["clean_s"] = round(time.time() - t, 1)
        upd["status"] = "done"
    else:
        raise ValueError(action)
    upd["progress"] = 1.0
    return upd
