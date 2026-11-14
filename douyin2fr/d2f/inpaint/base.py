from __future__ import annotations

import cv2
import numpy as np


class ImageInpainter:
    """Reconstruit les pixels `mask>0` d'une image BGR uint8."""
    name = "base"

    def __call__(self, img: np.ndarray, mask: np.ndarray) -> np.ndarray:
        raise NotImplementedError


class TeleaInpainter(ImageInpainter):
    """Diffusion OpenCV (Telea). Très rapide mais flou : sert de référence."""
    name = "telea"

    def __call__(self, img, mask):
        return cv2.inpaint(img, (mask > 0).astype(np.uint8), 5, cv2.INPAINT_TELEA)


_REGISTRY = {}


def register(name, factory):
    _REGISTRY[name] = factory


def available_image_inpainters():
    return list(_REGISTRY)


def get_image_inpainter(name: str, **kw) -> ImageInpainter:
    if name not in _REGISTRY:
        raise ValueError(f"Moteur inconnu : {name} (disponibles : {', '.join(_REGISTRY)})")
    return _REGISTRY[name](**kw)


register("telea", lambda **kw: TeleaInpainter())


def _lama(**kw):
    from .lama import LamaInpainter
    return LamaInpainter(**kw)


register("lama", _lama)
