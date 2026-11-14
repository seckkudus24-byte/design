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


def cpu_count() -> int:
    """Cœurs réellement utilisables. Dans un conteneur (Docker, Spaces, pods GPU),
    os.cpu_count() renvoie les cœurs de la machine hôte : trop de threads ralentit tout.
    Ordre : D2F_THREADS, quota cgroup (cpu.max), affinité CPU, os.cpu_count()."""
    env = os.environ.get("D2F_THREADS")
    if env and env.isdigit() and int(env) > 0:
        return int(env)
    n = len(os.sched_getaffinity(0)) if hasattr(os, "sched_getaffinity") else (os.cpu_count() or 1)
    for path in ("/sys/fs/cgroup/cpu.max",):
        try:
            quota, period = open(path).read().split()[:2]
            if quota != "max":
                n = min(n, max(1, -(-int(quota) // int(period))))
        except (OSError, ValueError):
            pass
    try:  # cgroup v1
        q = int(open("/sys/fs/cgroup/cpu/cpu.cfs_quota_us").read())
        per = int(open("/sys/fs/cgroup/cpu/cpu.cfs_period_us").read())
        if q > 0:
            n = min(n, max(1, -(-q // per)))
    except (OSError, ValueError):
        pass
    return max(1, n)


def describe() -> dict:
    return {"gpu": use_gpu(), "cpu_threads": cpu_count()}
