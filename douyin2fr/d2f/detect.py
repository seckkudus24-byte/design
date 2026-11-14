"""Détection des sous-titres chinois incrustés (OCR PP-OCR via ONNX Runtime).

Le moteur OCR détecte toutes les zones de texte, puis on ne garde que celles
dont le texte reconnu contient des caractères chinois (CJK). On peut aussi
restreindre la recherche à une zone de l'écran.
"""
from __future__ import annotations

import os
import re
from dataclasses import dataclass, asdict

import numpy as np

CJK_RE = re.compile(r"[㐀-䶿一-鿿豈-﫿]")


@dataclass
class Box:
    x0: int
    y0: int
    x1: int
    y1: int
    text: str = ""
    score: float = 1.0

    @property
    def w(self):
        return self.x1 - self.x0

    @property
    def h(self):
        return self.y1 - self.y0

    def iou(self, o: "Box") -> float:
        ix = max(0, min(self.x1, o.x1) - max(self.x0, o.x0))
        iy = max(0, min(self.y1, o.y1) - max(self.y0, o.y0))
        inter = ix * iy
        union = self.w * self.h + o.w * o.h - inter
        return inter / union if union > 0 else 0.0

    def to_dict(self):
        return asdict(self)


def is_chinese(text: str, min_ratio: float = 0.3) -> bool:
    chars = [c for c in text if not c.isspace()]
    if not chars:
        return False
    n = len(CJK_RE.findall(text))
    # au moins 2 idéogrammes, ou 1 seul s'il domine le texte (sous-titres mixtes « iPhone 只要 999 »)
    return n >= 2 or (n == 1 and n / len(chars) >= min_ratio)


class SubtitleDetector:
    """Détecteur OCR. `only_chinese=False` supprime tout texte détecté."""

    def __init__(self, models_dir: str | None = None, only_chinese: bool = True,
                 min_score: float = 0.5, region: tuple[float, float, float, float] | None = None,
                 limit_side_len: int = 960):
        import onnxruntime as ort
        import rapidocr_onnxruntime.utils as rutils
        from rapidocr_onnxruntime import RapidOCR

        from .device import cpu_count, use_gpu

        # RapidOCR ne règle pas le nombre de threads : on l'aligne sur les cœurs réellement disponibles.
        n_threads = cpu_count()

        class _Opts(ort.SessionOptions):
            def __init__(self):
                super().__init__()
                self.intra_op_num_threads = n_threads

        rutils.SessionOptions = _Opts

        kwargs = dict(det_limit_side_len=limit_side_len, det_limit_type="max",
                      det_box_thresh=0.5, det_unclip_ratio=1.8, text_score=min_score,
                      min_height=10, det_model_path=None, rec_model_path=None,
                      det_use_cuda=use_gpu(), rec_use_cuda=use_gpu())
        # Modèles PP-OCRv4 (meilleurs) s'ils ont été téléchargés, sinon PP-OCRv3 embarqués.
        if models_dir:
            det = os.path.join(models_dir, "ch_PP-OCRv4_det_infer.onnx")
            rec = os.path.join(models_dir, "ch_PP-OCRv4_rec_infer.onnx")
            if os.path.exists(det):
                kwargs["det_model_path"] = det
            if os.path.exists(rec):
                kwargs["rec_model_path"] = rec
        self.ocr = RapidOCR(**kwargs)
        self.only_chinese = only_chinese
        self.min_score = min_score
        self.region = region

    def detect(self, frame: np.ndarray) -> list[Box]:
        h, w = frame.shape[:2]
        ox = oy = 0
        img = frame
        if self.region:
            rx0, ry0, rx1, ry1 = self.region
            ox, oy = int(rx0 * w), int(ry0 * h)
            img = frame[oy:int(ry1 * h), ox:int(rx1 * w)]
        res, _ = self.ocr(img, use_cls=False)
        boxes: list[Box] = []
        for pts, text, score in res or []:
            score = float(score)
            if score < self.min_score:
                continue
            if self.only_chinese and not is_chinese(text):
                continue
            pts = np.asarray(pts, dtype=np.float32)
            x0, y0 = pts.min(0)
            x1, y1 = pts.max(0)
            boxes.append(Box(int(x0) + ox, int(y0) + oy, int(np.ceil(x1)) + ox,
                             int(np.ceil(y1)) + oy, text, score))
        return boxes
