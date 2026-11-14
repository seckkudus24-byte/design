"""LaMa (Large Mask Inpainting, Apache-2.0) exécuté via ONNX Runtime.

Modèle : Carve/LaMa-ONNX (entrée fixe 512x512). On découpe des fenêtres
autour des zones à reconstruire pour travailler au plus près de la résolution
native (pas de flou dû à un redimensionnement global de l'image).
"""
from __future__ import annotations

import os

import cv2
import numpy as np

from .base import ImageInpainter

MODEL_REPO = "Carve/LaMa-ONNX"
MODEL_FILE = "lama_fp32.onnx"
SIZE = 512


def ensure_model(models_dir: str) -> str:
    path = os.path.join(models_dir, MODEL_FILE)
    if not os.path.exists(path):
        from huggingface_hub import hf_hub_download
        os.makedirs(models_dir, exist_ok=True)
        hf_hub_download(MODEL_REPO, MODEL_FILE, local_dir=models_dir)
    return path


class LamaInpainter(ImageInpainter):
    name = "lama"

    def __init__(self, models_dir: str = "models", threads: int | None = None, use_gpu: bool = False):
        import onnxruntime as ort

        opts = ort.SessionOptions()
        if threads:
            opts.intra_op_num_threads = threads
        providers = ["CPUExecutionProvider"]
        if use_gpu and "CUDAExecutionProvider" in ort.get_available_providers():
            providers.insert(0, "CUDAExecutionProvider")
        self.sess = ort.InferenceSession(ensure_model(models_dir), opts, providers=providers)
        self.calls = 0

    def _run512(self, crop: np.ndarray, mask: np.ndarray) -> np.ndarray:
        m2 = (mask > 0).astype(np.float32)
        # L'export ONNX n'efface pas lui-même la zone : on la met à zéro, comme à l'entraînement de LaMa.
        x = cv2.cvtColor(crop, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0 * (1.0 - m2[..., None])
        x = x.transpose(2, 0, 1)[None]
        m = m2[None, None]
        out = self.sess.run(None, {"image": x, "mask": m})[0][0].transpose(1, 2, 0)
        self.calls += 1
        return cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_RGB2BGR)

    def _window(self, img, mask, x0, y0, s):
        h, w = img.shape[:2]
        x0 = int(np.clip(x0, 0, max(0, w - s)))
        y0 = int(np.clip(y0, 0, max(0, h - s)))
        x1, y1 = min(w, x0 + s), min(h, y0 + s)
        crop, cm = img[y0:y1, x0:x1], mask[y0:y1, x0:x1]
        ch, cw = crop.shape[:2]
        # Remplissage par réflexion si l'image est plus petite que la fenêtre.
        pad = ((0, s - ch), (0, s - cw))
        crop_p = np.pad(crop, pad + ((0, 0),), mode="reflect") if (ch < s or cw < s) else crop
        # Le masque doit être reflété comme l'image, sinon les copies-miroir du texte
        # deviennent un « contexte » visible que LaMa recopie (texte fantôme).
        cm_p = np.pad(cm, pad, mode="reflect") if (ch < s or cw < s) else cm
        if s != SIZE:
            crop_r = cv2.resize(crop_p, (SIZE, SIZE), interpolation=cv2.INTER_AREA)
            cm_r = cv2.dilate(cv2.resize(cm_p, (SIZE, SIZE), interpolation=cv2.INTER_NEAREST),
                              np.ones((3, 3), np.uint8))
        else:
            crop_r, cm_r = crop_p, cm_p
        res = self._run512(crop_r, cm_r)
        if s != SIZE:
            res = cv2.resize(res, (s, s), interpolation=cv2.INTER_CUBIC)
        return res[:ch, :cw], (x0, y0, x1, y1)

    def __call__(self, img: np.ndarray, mask: np.ndarray) -> np.ndarray:
        out = img.copy()
        remaining = (mask > 0).astype(np.uint8)
        h, w = img.shape[:2]
        n, labels, stats, _ = cv2.connectedComponentsWithStats(
            cv2.dilate(remaining, np.ones((9, 25), np.uint8)), connectivity=8)
        for i in np.argsort(stats[1:, cv2.CC_STAT_LEFT]) + 1:
            bx, by, bw, bh = stats[i, :4]
            s = int(min(max(SIZE, np.ceil(bh * 2.5)), max(h, w)))
            s = max(s, 64)
            cy = by + bh / 2
            if bw <= int(s * 0.75):
                xs = [bx + bw / 2 - s / 2]
            else:  # zone large (sous-titre) : fenêtres glissantes de gauche à droite
                step = int(s * 0.6)
                xs = list(range(int(bx - s * 0.2), int(bx + bw - s * 0.8), step)) + [bx + bw + s * 0.2 - s]
            for j, x0 in enumerate(xs):
                sel = remaining.copy()
                if j < len(xs) - 1:  # ne garder que la partie gauche : la suite aura plus de contexte
                    cut = int(x0 + s * 0.8)
                    sel[:, max(0, cut):] = 0
                if not sel[by:by + bh, :].any():
                    continue
                res, (X0, Y0, X1, Y1) = self._window(out, remaining * 255, x0, cy - s / 2, s)
                region = sel[Y0:Y1, X0:X1] > 0
                out[Y0:Y1, X0:X1][region] = res[region]
                remaining[Y0:Y1, X0:X1][region] = 0
        if remaining.any():  # sécurité : jamais laisser de trou
            out = cv2.inpaint(out, remaining, 5, cv2.INPAINT_TELEA)
        return out
