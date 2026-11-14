"""Orchestration : analyse (détection) puis nettoyage (inpainting) d'une vidéo."""
from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass, field
from typing import Callable

import cv2
import numpy as np

from .detect import Box, SubtitleDetector
from .inpaint import get_image_inpainter
from .masks import MaskBuilder, draw_overlay
from .video_io import FrameReader, FrameWriter, VideoInfo, probe

Progress = Callable[[str, float, str], None]

METHODS = {
    "temporal": "Temporel (flux optique + LaMa) — recommandé",
    "temporal-fast": "Temporel (flux optique + diffusion) — rapide, sans IA d'image",
    "lama": "LaMa image par image — sans cohérence temporelle",
    "telea": "Diffusion OpenCV image par image — référence basse qualité",
}


@dataclass
class Analysis:
    video: str
    width: int
    height: int
    fps: float
    nb_frames: int
    stride: int
    keyframes: dict[int, list[Box]] = field(default_factory=dict)
    seconds: float = 0.0

    def to_json(self) -> dict:
        return {
            "video": self.video, "width": self.width, "height": self.height, "fps": self.fps,
            "nb_frames": self.nb_frames, "stride": self.stride, "seconds": self.seconds,
            "keyframes": {str(k): [b.to_dict() for b in v] for k, v in self.keyframes.items()},
        }

    @classmethod
    def from_json(cls, d: dict) -> "Analysis":
        a = cls(d["video"], d["width"], d["height"], d["fps"], d["nb_frames"], d["stride"],
                seconds=d.get("seconds", 0.0))
        a.keyframes = {int(k): [Box(**b) for b in v] for k, v in d["keyframes"].items()}
        return a

    def save(self, path: str):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.to_json(), f, ensure_ascii=False)

    @classmethod
    def load(cls, path: str) -> "Analysis":
        with open(path, encoding="utf-8") as f:
            return cls.from_json(json.load(f))

    def mask_builder(self, **kw) -> MaskBuilder:
        return MaskBuilder(self.keyframes, self.nb_frames, self.width, self.height, self.stride, **kw)

    def summary(self) -> dict:
        texts, seen = [], set()
        for k in sorted(self.keyframes):
            for b in self.keyframes[k]:
                if b.text not in seen:
                    seen.add(b.text)
                    texts.append({"t": round(k / self.fps, 2), "text": b.text})
        mb = self.mask_builder()
        return {"keyframes": len(self.keyframes),
                "frames_with_text": round(mb.coverage() * 100, 1),
                "lines": texts}


def _noop(*_):
    pass


def analyze(video: str, models_dir: str = "models", stride: int = 3, only_chinese: bool = True,
            region=None, progress: Progress = _noop, cancel=None) -> Analysis:
    info = probe(video)
    det = SubtitleDetector(models_dir=models_dir, only_chinese=only_chinese, region=region)
    a = Analysis(video, info.width, info.height, info.fps_float, info.nb_frames, stride)
    t0 = time.time()
    n = 0
    with FrameReader(info) as r:
        for i, frame in enumerate(r):
            if cancel and cancel():
                raise InterruptedError("Traitement annulé")
            if i % stride == 0:
                a.keyframes[i] = det.detect(frame)
                if i % (stride * 5) == 0:
                    progress("analyse", min(1.0, i / max(1, info.nb_frames)), f"Image {i}/{info.nb_frames}")
            n = i + 1
    a.nb_frames = n
    a.seconds = time.time() - t0
    progress("analyse", 1.0, "Analyse terminée")
    return a


def preview_frames(analysis: Analysis, out_dir: str, count: int = 6) -> list[str]:
    """Enregistre quelques images avec les zones détectées surlignées."""
    os.makedirs(out_dir, exist_ok=True)
    info = probe(analysis.video)
    mb = analysis.mask_builder()
    with_text = [k for k in sorted(analysis.keyframes) if analysis.keyframes[k]]
    if not with_text:
        with_text = sorted(analysis.keyframes)
    picks = set(with_text[int(j)] for j in np.linspace(0, len(with_text) - 1, min(count, len(with_text))))
    paths = []
    with FrameReader(info) as r:
        for i, frame in enumerate(r):
            if i in picks:
                p = os.path.join(out_dir, f"detect_{i:06d}.jpg")
                cv2.imwrite(p, draw_overlay(frame, mb.mask(i), mb.boxes(i)), [cv2.IMWRITE_JPEG_QUALITY, 88])
                paths.append(p)
            if i >= max(picks, default=0):
                break
    return paths


def make_engine(method: str, models_dir: str = "models"):
    from .inpaint.clip import PerFrameClipInpainter
    from .inpaint.flowprop import FlowPropInpainter

    if method == "temporal":
        return FlowPropInpainter(get_image_inpainter("lama", models_dir=models_dir))
    if method == "temporal-fast":
        return FlowPropInpainter(get_image_inpainter("telea"))
    if method in ("lama", "telea"):
        kw = {"models_dir": models_dir} if method == "lama" else {}
        return PerFrameClipInpainter(get_image_inpainter(method, **kw))
    raise ValueError(f"Méthode inconnue : {method}")


def _bands(masks: list[np.ndarray], margin: int, h: int, w: int):
    """Regroupe les zones masquées d'un clip en bandes horizontales recadrées."""
    union = np.zeros((h, w), bool)
    for m in masks:
        union |= m > 0
    rows = np.nonzero(union.any(1))[0]
    if len(rows) == 0:
        return []
    groups, start, prev = [], rows[0], rows[0]
    for r in rows[1:]:
        if r - prev > 2 * margin:
            groups.append((start, prev))
            start = r
        prev = r
    groups.append((start, prev))
    out = []
    for a, b in groups:
        y0, y1 = max(0, a - margin), min(h, b + 1 + margin)
        cols = np.nonzero(union[a:b + 1].any(0))[0]
        x0, x1 = max(0, cols[0] - margin), min(w, cols[-1] + 1 + margin)
        out.append((int(x0), int(y0), int(x1), int(y1)))
    return out


def clean(analysis: Analysis, out_path: str, method: str = "temporal", models_dir: str = "models",
          crf: int = 16, progress: Progress = _noop, cancel=None, mask_kw: dict | None = None,
          chunk: int = 150, overlap: int = 12, lookahead: int = 24) -> dict:
    """Supprime les sous-titres. La vidéo est traitée par clips de `chunk` images,
    recadrés sur les bandes de texte. Les `overlap` dernières images de chaque
    clip servent de référence au suivant (continuité), et `lookahead` images
    futures sont fournies comme sources supplémentaires."""
    info: VideoInfo = probe(analysis.video)
    mb = analysis.mask_builder(**(mask_kw or {}))
    engine = make_engine(method, models_dir)
    t0 = time.time()
    tmp = out_path + ".part.mp4"
    writer = FrameWriter(tmp, info, crf=crf, audio_from=analysis.video)
    W, H = info.width, info.height
    margin = max(32, int(0.05 * max(W, H)))
    total = max(1, analysis.nb_frames)
    state = {"written": 0}

    def process(carry, core, ahead):
        """carry : images finales précédentes ; core : à produire ; ahead : sources futures."""
        frames = [f for f, _ in carry] + [f for f, _ in core] + [f for f, _ in ahead]
        masks = [np.zeros((H, W), np.uint8)] * len(carry) + [m for _, m in core] + [m for _, m in ahead]
        out = [f.copy() for f, _ in core]
        bands = _bands(masks[len(carry):], margin, H, W)
        for bi, (x0, y0, x1, y1) in enumerate(bands):
            crops = [np.ascontiguousarray(f[y0:y1, x0:x1]) for f in frames]
            mcrops = [np.ascontiguousarray(m[y0:y1, x0:x1]) for m in masks]

            def prog(p, bi=bi):
                done = state["written"] + len(core) * (bi + p) / len(bands)
                progress("nettoyage", min(0.999, done / total), "Reconstruction")

            res = engine.inpaint_clip(crops, mcrops, known=len(carry), progress=prog)
            for i in range(len(core)):
                out[i][y0:y1, x0:x1] = res[len(carry) + i]
        return out

    carry: list = []
    pending: list = []  # (frame, mask)
    try:
        with FrameReader(info) as r:
            for i, frame in enumerate(r):
                if cancel and cancel():
                    raise InterruptedError("Traitement annulé")
                pending.append((frame, mb.mask(i)))
                if len(pending) >= chunk + lookahead:
                    core, ahead = pending[:chunk], pending[chunk:]
                    out = process(carry, core, ahead)
                    for f in out:
                        writer.write(f)
                    state["written"] += len(out)
                    carry = [(f, None) for f in out[-overlap:]]
                    pending = ahead
            if pending:
                out = process(carry, pending, [])
                for f in out:
                    writer.write(f)
                state["written"] += len(out)
        writer.close()
    except BaseException:
        writer.abort()
        if os.path.exists(tmp):
            os.remove(tmp)
        raise
    os.replace(tmp, out_path)
    stats = dict(getattr(engine, "stats", {}) or {})
    if hasattr(getattr(engine, "fallback", None), "calls"):
        stats["model_calls"] = engine.fallback.calls
    stats["seconds"] = round(time.time() - t0, 1)
    stats["method"] = method
    progress("nettoyage", 1.0, "Terminé")
    return stats
