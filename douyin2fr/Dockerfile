# Image de déploiement (cloud GPU ou CPU).
#
#   GPU NVIDIA (RunPod, Vast.ai, Lambda, OVH…) :
#     docker build -t douyin2fr --build-arg BASE=nvidia/cuda:12.4.1-cudnn-runtime-ubuntu22.04 --build-arg ORT=onnxruntime-gpu .
#     docker run --gpus all -p 8000:8000 -e D2F_TOKEN=un-long-secret -v d2f-data:/app/data douyin2fr
#   CPU seul :
#     docker build -t douyin2fr .
#     docker run -p 8000:8000 -e D2F_TOKEN=un-long-secret -v d2f-data:/app/data douyin2fr
ARG BASE=ubuntu:22.04
FROM ${BASE}
ARG ORT=onnxruntime
ENV DEBIAN_FRONTEND=noninteractive PYTHONUNBUFFERED=1 \
    D2F_HOST=0.0.0.0 D2F_PORT=8000 D2F_DATA=/app/data D2F_MODELS=/app/models
RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 python3-pip ffmpeg libgl1 libglib2.0-0 ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
# rapidocr_onnxruntime dépend du paquet « onnxruntime » (CPU) : on l'installe sans ses
# dépendances pour pouvoir utiliser onnxruntime-gpu à la place.
RUN pip3 install --no-cache-dir ${ORT} numpy opencv-python-headless huggingface_hub fastapi uvicorn \
        python-multipart Pillow pyclipper PyYAML Shapely six \
    && pip3 install --no-cache-dir --no-deps rapidocr_onnxruntime
COPY d2f ./d2f
COPY server ./server
COPY models/README.md ./models/
# Télécharge LaMa à la construction (démarrage instantané ensuite)
RUN python3 -c "from d2f.inpaint.lama import ensure_model; ensure_model('/app/models')"
EXPOSE 8000
CMD ["python3", "-m", "server.app"]
