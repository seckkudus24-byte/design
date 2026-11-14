"""Interface commune des moteurs vidéo : on leur passe un « clip » recadré.

`inpaint_clip(frames, masks, known)` reçoit une liste d'images BGR uint8 de
même taille et leurs masques (uint8, >0 = à reconstruire). Les `known`
premières images sont déjà finales (issues du clip précédent) : elles servent
de référence pour assurer la continuité entre clips.
"""
from __future__ import annotations

from typing import Callable

import numpy as np

from .base import ImageInpainter


class ClipInpainter:
    name = "clip"

    def inpaint_clip(self, frames: list[np.ndarray], masks: list[np.ndarray], known: int = 0,
                     progress: Callable[[float], None] | None = None) -> list[np.ndarray]:
        raise NotImplementedError


class PerFrameClipInpainter(ClipInpainter):
    """Applique un moteur d'image indépendamment sur chaque image (aucune cohérence temporelle)."""

    def __init__(self, image_inpainter: ImageInpainter):
        self.inp = image_inpainter
        self.name = image_inpainter.name
        self.stats = {}

    def inpaint_clip(self, frames, masks, known=0, progress=None):
        out = []
        for i, (f, m) in enumerate(zip(frames, masks)):
            out.append(self.inp(f, m) if i >= known and m.any() else f)
            if progress:
                progress((i + 1) / len(frames))
        return out
