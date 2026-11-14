"""Déploiement 100 % cloud sur Modal (pensé pour un utilisateur qui n'a qu'un iPhone).

Architecture :
  iPhone (PWA Safari) ──HTTPS──▶ web   : petit conteneur CPU (FastAPI + interface), 1 seul,
                                          s'éteint seul après 20 min sans activité
                                   │ spawn()
                                   ▼
                                process : conteneur GPU NVIDIA L4 + 4 cœurs, démarré pour
                                          chaque traitement puis arrêté (facturé à la seconde)
  Stockage : Volume « d2f-data » (vidéos, résultats ; effacés après D2F_RETENTION_DAYS)
  Progression : Dict « d2f-state » (mise à jour chaque seconde par la fonction GPU)

Déploiement (depuis GitHub Actions, voir CLOUD_IPHONE.md) :
  modal secret create d2f-app D2F_TOKEN=<mot de passe de l'application>
  modal deploy deploy/modal_app.py
"""
import os
import pathlib

import modal

ROOT = pathlib.Path(__file__).resolve().parent.parent
GPU = os.environ.get("D2F_GPU", "L4")               # L4 (24 Go) : bon rapport prix/performance ; "T4" moins cher
RETENTION_DAYS = os.environ.get("D2F_RETENTION_DAYS", "2")

app = modal.App("douyin2fr")
volume = modal.Volume.from_name("d2f-data", create_if_missing=True)
state = modal.Dict.from_name("d2f-state", create_if_missing=True)


def _pinned():
    """Mêmes versions que celles testées (requirements.txt), sauf onnxruntime (CPU/GPU) et rapidocr."""
    out = []
    for line in (ROOT / "requirements.txt").read_text().splitlines():
        line = line.split("#")[0].strip()
        if line and not line.startswith(("onnxruntime", "rapidocr", "pytest")):
            out.append(line)
    return out + ["Pillow==12.3.0", "pyclipper==1.4.0", "PyYAML==6.0.3", "Shapely==2.2.0", "six==1.17.0"]


COMMON = _pinned()
ORT = "1.29.0"       # serveur web (CPU)
ORT_GPU = "1.23.2"   # dernière version construite pour CUDA 12 (la 1.29 exige CUDA 13)
IGNORE = ["**/__pycache__", "**/*.pyc"]


def _with_code(img: modal.Image) -> modal.Image:
    return (img.env({"PYTHONPATH": "/root/app", "D2F_MODELS": "/root/models", "D2F_DATA": "/data",
                     "D2F_RETENTION_DAYS": RETENTION_DAYS})
            .add_local_dir(ROOT / "d2f", "/root/app/d2f", ignore=IGNORE)
            .add_local_dir(ROOT / "server", "/root/app/server", ignore=IGNORE))


# Image GPU : CUDA 12 + cuDNN 9 installés par pip (extras de onnxruntime-gpu) ; LaMa intégré
gpu_image = _with_code(
    modal.Image.debian_slim(python_version="3.13")
    .apt_install("ffmpeg", "libgl1", "libglib2.0-0")
    .pip_install(*COMMON, f"onnxruntime-gpu[cuda,cudnn]=={ORT_GPU}")
    .pip_install("rapidocr_onnxruntime==1.2.3", extra_options="--no-deps")  # sinon il impose onnxruntime CPU
    .run_commands("python -c \"from huggingface_hub import hf_hub_download as d; "
                  "d('Carve/LaMa-ONNX', 'lama_fp32.onnx', local_dir='/root/models')\"")
)

# Image web : légère, sans GPU (accueil, envois, progression, téléchargements)
web_image = _with_code(
    modal.Image.debian_slim(python_version="3.13")
    .apt_install("ffmpeg", "libgl1", "libglib2.0-0")
    .pip_install(*COMMON, f"onnxruntime=={ORT}")
)


@app.function(image=gpu_image, gpu=GPU, cpu=4.0, memory=16384, volumes={"/data": volume},
              timeout=4 * 3600, max_containers=1)
def process(jid: str, action: str, settings: dict) -> dict:
    """Analyse ou nettoyage d'une vidéo sur GPU. Un seul à la fois (traitement par lots successif,
    coût maîtrisé). Le conteneur s'arrête dès la fin : rien n'est facturé entre deux vidéos."""
    import onnxruntime as ort

    ort.preload_dlls()  # charge CUDA/cuDNN installés par pip avant de créer les sessions
    from server.remote import process_job

    volume.reload()  # voit la vidéo que le serveur web vient d'enregistrer
    return process_job("/data", "/root/models", jid, action, settings, state, commit=volume.commit)


@app.function(image=web_image, volumes={"/data": volume}, secrets=[modal.Secret.from_name("d2f-app")],
              cpu=1.0, memory=2048, max_containers=1, scaledown_window=20 * 60, timeout=3600)
@modal.concurrent(max_inputs=64)
@modal.asgi_app(label="douyin2fr")
def web():
    os.environ["D2F_RUNNER"] = "modal"
    os.environ["D2F_BACKEND_LABEL"] = f"GPU cloud · {GPU}"
    import server.app as srv
    from server.runners import ModalRunner

    srv.jobs.runner = ModalRunner(process, state, volume, srv.jobs.save)
    srv.jobs.start()
    return srv.app


@app.function(image=web_image, volumes={"/data": volume}, schedule=modal.Period(hours=6), timeout=600)
def cleanup():
    """Efface les vidéos plus anciennes que D2F_RETENTION_DAYS (même si l'application n'est pas ouverte)."""
    import json
    import shutil
    import time

    volume.reload()
    limit = time.time() - float(RETENTION_DAYS) * 86400
    removed = 0
    for jid in os.listdir("/data"):
        p = os.path.join("/data", jid)
        meta = os.path.join(p, "job.json")
        try:
            created = json.load(open(meta)).get("created", 0) if os.path.exists(meta) else os.path.getmtime(p)
        except Exception:  # noqa: BLE001
            created = os.path.getmtime(p)
        if jid != "uploads" and created < limit and os.path.isdir(p):
            shutil.rmtree(p, ignore_errors=True)
            removed += 1
    up = "/data/uploads"
    if os.path.isdir(up):
        for f in os.listdir(up):
            if os.path.getmtime(os.path.join(up, f)) < time.time() - 86400:
                os.remove(os.path.join(up, f))
    volume.commit()
    return removed
