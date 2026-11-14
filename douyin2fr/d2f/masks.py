"""Construction des masques image par image à partir des détections OCR.

L'OCR tourne sur des images-clés (une sur `stride`). Pour chaque image on
réunit les boîtes des images-clés voisines, ce qui couvre les changements de
sous-titre entre deux images-clés. On comble les « trous » de détection
(sous-titre manqué sur une image-clé) et on écarte les détections isolées peu
fiables. Mieux vaut un masque un peu trop large qu'un caractère oublié.
"""
from __future__ import annotations

import cv2
import numpy as np

from .detect import Box


def _match(b: Box, boxes: list[Box], thr: float) -> Box | None:
    best, best_iou = None, thr
    for o in boxes:
        v = b.iou(o)
        if v >= best_iou:
            best, best_iou = o, v
    return best


class MaskBuilder:
    def __init__(self, keyframe_boxes: dict[int, list[Box]], n_frames: int, width: int, height: int,
                 stride: int, pad_ratio: float = 0.22, pad_px: int = 4, extend: int = 1,
                 gap_fill: int = 2, singleton_min_score: float = 0.8):
        self.n_frames, self.w, self.h = n_frames, width, height
        self.stride, self.extend = stride, extend
        self.pad_ratio, self.pad_px = pad_ratio, pad_px
        keys = sorted(keyframe_boxes)
        dets = {k: list(keyframe_boxes[k]) for k in keys}

        # 1) Combler les trous : boîte présente en k_i et k_j mais absente entre les deux.
        for i, k in enumerate(keys):
            for j in range(i + 2, min(i + gap_fill + 2, len(keys))):
                for b in dets[k]:
                    m = _match(b, dets[keys[j]], 0.5)
                    if m is None:
                        continue
                    for mid in keys[i + 1:j]:
                        if _match(b, dets[mid], 0.3) is None:
                            dets[mid].append(Box(min(b.x0, m.x0), min(b.y0, m.y0), max(b.x1, m.x1),
                                                 max(b.y1, m.y1), b.text, min(b.score, m.score)))

        # 2) Écarter les détections isolées (une seule image-clé) peu sûres.
        clean = {}
        for i, k in enumerate(keys):
            nb = (dets[keys[i - 1]] if i > 0 else []) + (dets[keys[i + 1]] if i + 1 < len(keys) else [])
            clean[k] = [b for b in dets[k] if b.score >= singleton_min_score or _match(b, nb, 0.3)]
        self.dets = clean
        self.keys = np.array(keys, dtype=np.int64)

    def boxes(self, t: int) -> list[Box]:
        if len(self.keys) == 0:
            return []
        win = self.stride + self.extend
        lo = np.searchsorted(self.keys, t - win + 1, "left")
        hi = np.searchsorted(self.keys, t + win - 1, "right")
        out = []
        for k in self.keys[lo:hi]:
            out.extend(self.dets[int(k)])
        return out

    def padded(self, b: Box) -> tuple[int, int, int, int]:
        p = int(round(b.h * self.pad_ratio)) + self.pad_px
        return (max(0, b.x0 - p), max(0, b.y0 - p), min(self.w, b.x1 + p), min(self.h, b.y1 + p))

    def mask(self, t: int) -> np.ndarray:
        m = np.zeros((self.h, self.w), np.uint8)
        for b in self.boxes(t):
            x0, y0, x1, y1 = self.padded(b)
            m[y0:y1, x0:x1] = 255
        return m

    def coverage(self) -> float:
        """Part des images contenant au moins une zone à effacer."""
        if self.n_frames == 0:
            return 0.0
        return sum(1 for t in range(self.n_frames) if self.boxes(t)) / self.n_frames


def bbox(mask: np.ndarray):
    ys, xs = np.nonzero(mask)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def expand(b, margin: int, w: int, h: int):
    x0, y0, x1, y1 = b
    return max(0, x0 - margin), max(0, y0 - margin), min(w, x1 + margin), min(h, y1 + margin)


def draw_overlay(frame: np.ndarray, mask: np.ndarray, boxes: list[Box] | None = None) -> np.ndarray:
    """Aperçu : zones détectées en rouge semi-transparent."""
    out = frame.copy()
    red = np.zeros_like(frame)
    red[..., 2] = 255
    sel = mask > 0
    out[sel] = (0.55 * out[sel] + 0.45 * red[sel]).astype(np.uint8)
    for b in boxes or []:
        cv2.rectangle(out, (b.x0, b.y0), (b.x1, b.y1), (0, 0, 255), 2)
    return out
