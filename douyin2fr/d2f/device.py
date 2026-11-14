"""Choix du matériel : GPU NVIDIA (CUDA via onnxruntime-gpu) si disponible, sinon CPU.

D2F_DEVICE=auto (défaut) | gpu | cpu
Ce qui profite du GPU : l'OCR (détection + reconnaissance) et LaMa.
Le flux optique (DIS) reste sur CPU et est parallélisé sur tous les cœurs.
"""
from __future__ import annotations

import os


def gpu_available() -> bool:
    try:
        import onnxruntime as ort
        return "CUDAExecutionProvider" in ort.get_available_providers()
    except Exception:  # noqa: BLE001
        return False


def use_gpu() -> bool:
    mode = os.environ.get("D2F_DEVICE", "auto").lower()
    if mode == "cpu":
        return False
    if mode == "gpu":
        if not gpu_available():
            raise RuntimeError("D2F_DEVICE=gpu mais aucun GPU CUDA utilisable (installer onnxruntime-gpu).")
        return True
    return gpu_available()


def describe() -> dict:
    return {"gpu": use_gpu(), "cpu_threads": os.cpu_count()}
