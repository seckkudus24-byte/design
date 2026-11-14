"""Serveur web local : python -m server.app  (http://127.0.0.1:8000)

Variables d'environnement :
  D2F_DATA    dossier de travail (défaut ./data)
  D2F_MODELS  dossier des modèles (défaut ./models)
  D2F_TOKEN   jeton d'accès optionnel (obligatoire si le serveur est exposé)
  D2F_HOST / D2F_PORT
  D2F_MAX_MB  taille max d'un import (défaut 2048)
  D2F_RETENTION_DAYS  suppression automatique des vidéos après N jours (défaut 7, 0 = jamais)
  D2F_DEVICE  auto | gpu | cpu
"""
from __future__ import annotations

import json
import os
import secrets
import tempfile
import threading

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from d2f.pipeline import METHODS
from d2f.device import describe
from d2f.video_io import MAX_DURATION_S, VideoError
from .jobs import JobManager

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.environ.get("D2F_DATA", os.path.join(ROOT, "data"))
MODELS = os.environ.get("D2F_MODELS", os.path.join(ROOT, "models"))
TOKEN = os.environ.get("D2F_TOKEN", "")
MAX_BYTES = int(os.environ.get("D2F_MAX_MB", "2048")) * 1024 * 1024

app = FastAPI(title="Douyin → France AI")
# D2F_RUNNER=modal : le déploiement cloud choisit l'exécuteur GPU distant puis appelle jobs.start()
jobs = JobManager(DATA, MODELS, autostart=os.environ.get("D2F_RUNNER", "local") == "local")
_up_lock = threading.Lock()


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


@app.get("/healthz")
def health():
    import shutil as _sh
    free = _sh.disk_usage(jobs.data_dir).free
    return {"ok": True, "current": jobs.current, "queued": len(jobs.queue), "disk_free_gb": round(free / 2**30, 1)}


@app.get("/api/config")
def config():
    return {"methods": METHODS, "paused": jobs.paused, "token_required": bool(TOKEN),
            "max_duration_s": MAX_DURATION_S,
            "device": {**describe(), "label": os.environ.get("D2F_BACKEND_LABEL", "")},
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


# ---------------------------------------------------------------- envoi par morceaux
# Les tunnels/proxys gratuits (Cloudflare : 100 Mo par requête) et les réseaux mobiles imposent
# d'envoyer les grosses vidéos en morceaux, avec reprise possible si la connexion coupe.
CHUNK = int(float(os.environ.get("D2F_CHUNK_MB", "16")) * 1024 * 1024)
UP_DIR = os.path.join(jobs.data_dir, "uploads")
os.makedirs(UP_DIR, exist_ok=True)


def _up_paths(uid: str):
    if not uid.isalnum() or len(uid) != 32:
        raise HTTPException(404, "Envoi inconnu")
    meta = os.path.join(UP_DIR, uid + ".json")
    if not os.path.exists(meta):
        raise HTTPException(404, "Envoi inconnu ou expiré")
    return meta, os.path.join(UP_DIR, uid + ".part")


@app.post("/api/uploads")
async def upload_init(request: Request):
    d = await request.json()
    size = int(d.get("size", 0))
    if size <= 0 or size > MAX_BYTES:
        raise HTTPException(413, f"Taille invalide ou fichier trop volumineux (> {MAX_BYTES >> 20} Mo)")
    uid = secrets.token_hex(16)
    meta = {"filename": str(d.get("filename") or "video.mp4")[:200], "size": size,
            "method": str(d.get("method") or "temporal"), "auto_clean": bool(d.get("auto_clean")),
            "resolution": str(d.get("resolution") or "auto"), "received": []}
    with open(os.path.join(UP_DIR, uid + ".part"), "wb") as f:
        f.truncate(size)
    with open(os.path.join(UP_DIR, uid + ".json"), "w") as f:
        json.dump(meta, f)
    return {"upload_id": uid, "chunk_size": CHUNK, "chunks": -(-size // CHUNK)}


@app.get("/api/uploads/{uid}")
def upload_status(uid: str):
    meta, _ = _up_paths(uid)
    with open(meta) as f:
        return json.load(f)


@app.put("/api/uploads/{uid}/{index}")
async def upload_chunk(uid: str, index: int, request: Request):
    meta_p, part = _up_paths(uid)
    with open(meta_p) as f:
        meta = json.load(f)
    n = -(-meta["size"] // CHUNK)
    if not 0 <= index < n:
        raise HTTPException(400, "Morceau hors limites")
    expected = min(CHUNK, meta["size"] - index * CHUNK)
    data = bytearray()
    async for c in request.stream():
        data += c
        if len(data) > expected:
            raise HTTPException(400, "Morceau trop grand")
    if len(data) != expected:
        raise HTTPException(400, f"Morceau incomplet ({len(data)}/{expected} octets)")
    with open(part, "r+b") as f:
        f.seek(index * CHUNK)
        f.write(data)
    with _up_lock:
        with open(meta_p) as f:
            meta = json.load(f)
        if index not in meta["received"]:
            meta["received"].append(index)
        with open(meta_p, "w") as f:
            json.dump(meta, f)
    return {"ok": True, "received": len(meta["received"]), "chunks": n}


@app.post("/api/uploads/{uid}/finish")
def upload_finish(uid: str):
    meta_p, part = _up_paths(uid)
    with open(meta_p) as f:
        meta = json.load(f)
    n = -(-meta["size"] // CHUNK)
    missing = sorted(set(range(n)) - set(meta["received"]))
    if missing:
        raise HTTPException(409, f"Morceaux manquants : {missing[:10]}")
    try:
        job = jobs.add(meta["filename"], part, meta["method"], meta["auto_clean"], meta["resolution"])
    except VideoError as e:
        raise HTTPException(422, f"{meta['filename']} : {e}")
    finally:
        for p in (part, meta_p):
            if os.path.exists(p):
                os.remove(p)
    return {"jobs": [job.public()], "errors": []}


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
