# Image pour Hugging Face Spaces (SDK Docker, port 7860, utilisateur non-root 1000).
FROM python:3.13-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user PATH=/home/user/.local/bin:$PATH PYTHONUNBUFFERED=1 \
    D2F_HOST=0.0.0.0 D2F_PORT=7860 D2F_DATA=/home/user/data D2F_MODELS=/home/user/app/models \
    D2F_RETENTION_DAYS=2 D2F_MAX_MB=1024
WORKDIR /home/user/app
COPY --chown=user requirements.txt .
RUN grep -v pytest requirements.txt > req.txt && pip install --no-cache-dir --user -r req.txt
COPY --chown=user d2f ./d2f
COPY --chown=user server ./server
RUN mkdir -p models data && python -c "from d2f.inpaint.lama import ensure_model; ensure_model('models')"
EXPOSE 7860
CMD ["python", "-m", "server.app"]
