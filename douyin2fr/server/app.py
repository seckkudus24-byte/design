"""Serveur web local : python -m server.app  (http://127.0.0.1:8000)

Variables d'environnement :
  D2F_DATA    dossier de travail (défaut ./data)
  D2F_MODELS  dossier des modèles (défaut ./models)
  D2F_TOKEN   jeton d'accès optionnel (obligatoire si le serveur est exposé)
  D2F_HOST / D2F_PORT
  D2F_MAX_MB  taille max d'un import (défaut 2048)
"""
from __future__ import annotations

import os
import secrets
import tempfile

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from d2f.pipeline import METHODS
from d2f.video_io import MAX_DURATION_S, VideoError
from .jobs import JobManager

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.environ.get("D2F_DATA", os.path.join(ROOT, "data"))
MODELS = os.environ.get("D2F_MODELS", os.path.join(ROOT, "models"))
TOKEN = os.environ.get("D2F_TOKEN", "")
MAX_BYTES = int(os.environ.get("D2F_MAX_MB", "2048")) * 1024 * 1024

app = FastAPI(title="Douyin → France AI")
jobs = JobManager(DATA, MODELS)


@app.middleware("http")
async def auth(request: Request, call_next):
    if TOKEN and request.url.path.startswith("/api/"):
        given = request.headers.get("x-token") or request.query_params.get("token") or ""
        if not secrets.compare_digest(given, TOKEN):
            return JSONResponse({"detail": "Jeton d'accès invalide"}, status_code=401)
    resp = await call_next(request)
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["Referrer-Policy"] = "no-referrer"
    return resp


def _job(jid: str):
    if jid not in jobs.jobs:
        raise HTTPException(404, "Vidéo introuvable")
    return jobs.jobs[jid]


@app.get("/api/config")
def config():
    return {"methods": METHODS, "paused": jobs.paused, "token_required": bool(TOKEN),
            "max_duration_s": MAX_DURATION_S,
            "resolutions": {"auto": "1080p minimum (recommandé)", "1080p": "1080p exact", "source": "Résolution d'origine"}}


@app.get("/api/jobs")
def list_jobs():
    return {"jobs": jobs.list(), "paused": jobs.paused, "current": jobs.current}


@app.post("/api/jobs")
async def upload(files: list[UploadFile] = File(...), method: str = Form("temporal"),
                 auto_clean: bool = Form(False), resolution: str = Form("auto")):
    created, errors = [], []
    for uf in files:
        fd, tmp = tempfile.mkstemp(dir=jobs.data_dir, suffix=".upload")
        size = 0
        try:
            with os.fdopen(fd, "wb") as out:
                while chunk := await uf.read(1 << 20):
                    size += len(chunk)
                    if size > MAX_BYTES:
                        raise HTTPException(413, f"Fichier trop volumineux (> {MAX_BYTES >> 20} Mo)")
                    out.write(chunk)
            try:
                created.append(jobs.add(uf.filename or "video.mp4", tmp, method, auto_clean, resolution).public())
            except VideoError as e:
                errors.append(f"{uf.filename} : {e}")
        finally:
            if os.path.exists(tmp):
                os.remove(tmp)
    return {"jobs": created, "errors": errors}


@app.get("/api/jobs/{jid}")
def get_job(jid: str):
    return _job(jid).public()


@app.post("/api/jobs/{jid}/clean")
def start_clean(jid: str, method: str = Form("temporal"), resolution: str = Form("auto")):
    _job(jid)
    try:
        jobs.request_clean(jid, method, resolution)
    except ValueError as e:
        raise HTTPException(409, str(e))
    return jobs.jobs[jid].public()


@app.post("/api/jobs/{jid}/cancel")
def cancel(jid: str):
    _job(jid)
    jobs.cancel(jid)
    return {"ok": True}


@app.delete("/api/jobs/{jid}")
def delete(jid: str):
    _job(jid)
    jobs.delete(jid)
    return {"ok": True}


@app.post("/api/queue/{action}")
def queue(action: str):
    if action not in ("pause", "resume"):
        raise HTTPException(404)
    jobs.set_paused(action == "pause")
    return {"paused": jobs.paused}


@app.get("/api/jobs/{jid}/original")
def original(jid: str):
    _job(jid)
    return FileResponse(jobs.original(jid))


@app.get("/api/jobs/{jid}/result")
def result(jid: str, download: bool = False):
    job = _job(jid)
    p = jobs.path(jid, "result.mp4")
    if job.status != "done" or not os.path.exists(p):
        raise HTTPException(404, "Résultat non disponible")
    name = os.path.splitext(job.name)[0] + "_sans_sous-titres.mp4"
    return FileResponse(p, media_type="video/mp4", filename=name if download else None)


@app.get("/api/jobs/{jid}/preview/{name}")
def preview(jid: str, name: str):
    job = _job(jid)
    if name not in job.previews:
        raise HTTPException(404)
    return FileResponse(jobs.path(jid, os.path.join("previews", name)), media_type="image/jpeg")


app.mount("/", StaticFiles(directory=os.path.join(ROOT, "server", "static"), html=True), name="static")


def main():
    import uvicorn

    host = os.environ.get("D2F_HOST", "127.0.0.1")
    if host not in ("127.0.0.1", "localhost") and not TOKEN:
        raise SystemExit("Refus : exposer le serveur sur le réseau exige D2F_TOKEN.")
    uvicorn.run(app, host=host, port=int(os.environ.get("D2F_PORT", "8000")))


if __name__ == "__main__":
    main()
