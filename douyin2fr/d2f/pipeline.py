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
from .video_io import FrameReader, FrameWriter, VideoInfo, check_duration, output_size, probe

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


def _eta(t0: float, p: float) -> str:
    el = time.time() - t0
    if p < 0.02 or el < 5:
        return ""
    rest = el * (1 - p) / p
    return f" · reste ≈ {int(rest // 60)} min {int(rest % 60):02d} s" if rest >= 60 else f" · reste ≈ {int(rest)} s"


def analyze(video: str, models_dir: str = "models", stride: int = 3, only_chinese: bool = True,
            region=None, progress: Progress = _noop, cancel=None) -> Analysis:
    info = probe(video)
    check_duration(info)
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
                    p = min(0.999, i / max(1, info.nb_frames))
                    progress("analyse", p, f"Image {i}/{info.nb_frames}" + _eta(t0, p))
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


def make_engine(method: str, models_dir: str = "models", workers: int | None = None):
    from .inpaint.clip import PerFrameClipInpainter
    from .inpaint.flowprop import FlowPropInpainter

    if method == "temporal":
        return FlowPropInpainter(get_image_inpainter("lama", models_dir=models_dir), workers=workers)
    if method == "temporal-fast":
        return FlowPropInpainter(get_image_inpainter("telea"), workers=workers)
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


def global_bands(mb, n_frames: int, margin: int, h: int, w: int):
    """Bandes horizontales couvrant toutes les zones de texte de la vidéo."""
    union = np.zeros((h, w), np.uint8)
    for t in range(n_frames):
        for b in mb.boxes(t):
            x0, y0, x1, y1 = mb.padded(b)
            union[y0:y1, x0:x1] = 255
    return _bands([union], margin, h, w)


def clean(analysis: Analysis, out_path: str, method: str = "temporal", models_dir: str = "models",
          crf: int = 16, progress: Progress = _noop, cancel=None, mask_kw: dict | None = None,
          chunk: int = 120, history: int = 30, lookahead: int = 48, tail: int = 12,
          resolution: str = "auto", workers: int | None = None) -> dict:
    """Supprime les sous-titres sur toute la vidéo (≤ 5 min).

    Mémoire : seules les *bandes* de l'image qui contiennent du texte sont gardées
    en mémoire (pas les images entières). Une seconde lecture de la vidéo source
    fournit les images complètes au moment de l'écriture.

    Segments : chaque segment de `chunk` images reçoit `history` images déjà
    nettoyées du segment précédent (continuité, sources propres) et `lookahead`
    images futures (sources). Les `tail` premières images futures sont aussi
    reconstruites pour que la propagation arrière arrive « chaude » en fin de segment.
    Le son d'origine est recopié tel quel, à la même cadence (synchronisation)."""
    info: VideoInfo = probe(analysis.video)
    check_duration(info)
    mb = analysis.mask_builder(**(mask_kw or {}))
    engine = make_engine(method, models_dir, workers)
    t0 = time.time()
    W, H = info.width, info.height
    total = max(1, analysis.nb_frames)
    margin = max(32, int(0.05 * max(W, H)))
    bands = global_bands(mb, total, margin, H, W)
    size = output_size(info, resolution)
    tmp = out_path + ".part.mp4"
    writer = FrameWriter(tmp, info, crf=crf, audio_from=analysis.video, size=size)
    state = {"written": 0}

    def check_cancel():
        if cancel and cancel():
            raise InterruptedError("Traitement annulé")

    # Par bande : historique d'images nettoyées, images en attente (indice, recadrage brut)
    hist = [[] for _ in bands]
    pend = [[] for _ in bands]

    def run_segment(core_n: int):
        """Nettoie les `core_n` premières images en attente et les écrit."""
        results = [[None] * core_n for _ in bands]
        for bi, (x0, y0, x1, y1) in enumerate(bands):
            items = pend[bi][:core_n + lookahead]
            idx = [i for i, _ in items]
            if not any(mb.boxes(i) for i in idx[:core_n + tail]):
                continue  # aucune zone à effacer dans cette bande pour ce segment
            frames = hist[bi] + [c for _, c in items]
            masks = [np.zeros((y1 - y0, x1 - x0), np.uint8)] * len(hist[bi]) + \
                [mb.mask_crop(i, x0, y0, x1, y1) for i in idx]

            def prog(p, bi=bi):
                check_cancel()
                done = (state["written"] + core_n * (bi + p) / len(bands)) / total
                progress("nettoyage", min(0.999, done), f"Image {int(done * total)}/{total}" + _eta(t0, done))

            res = engine.inpaint_clip(frames, masks, known=len(hist[bi]), progress=prog,
                                      n_targets=min(len(items), core_n + tail))
            results[bi] = res[len(hist[bi]):len(hist[bi]) + core_n]
        # Écriture : image complète relue depuis la source + bandes nettoyées
        for k in range(core_n):
            frame = next(src_iter)
            for bi, (x0, y0, x1, y1) in enumerate(bands):
                r = results[bi][k]
                if r is not None:
                    frame[y0:y1, x0:x1] = r
            writer.write(frame)
        state["written"] += core_n
        for bi in range(len(bands)):
            done_items = [r if r is not None else c for r, (_, c) in zip(results[bi], pend[bi][:core_n])]
            hist[bi] = (hist[bi] + done_items)[-history:] if history else []
            pend[bi] = pend[bi][core_n:]

    try:
        with FrameReader(info) as reader, FrameReader(info) as src:
            src_iter = iter(src)
            n = 0
            for i, frame in enumerate(reader):
                check_cancel()
                for bi, (x0, y0, x1, y1) in enumerate(bands):
                    pend[bi].append((i, frame[y0:y1, x0:x1].copy()))
                n = i + 1
                if not bands:
                    writer.write(next(src_iter))
                    state["written"] += 1
                    if i % 30 == 0:
                        progress("nettoyage", min(0.999, n / total), "Copie (aucun texte)")
                elif len(pend[0]) >= chunk + lookahead:
                    run_segment(chunk)
            while bands and pend[0]:
                run_segment(min(chunk, len(pend[0])))
        progress("nettoyage", 0.999, "Finalisation du MP4")
        writer.close()
    except BaseException:
        writer.abort()
        if os.path.exists(tmp):
            os.remove(tmp)
        raise
    os.replace(tmp, out_path)
    stats = dict(getattr(engine, "stats", {}) or {})
    stats.update({k: round(v, 1) for k, v in getattr(engine, "timing", {}).items()})
    if hasattr(getattr(engine, "fallback", None), "calls"):
        stats["model_calls"] = engine.fallback.calls
    stats.update(frames_written=state["written"], output_size=f"{size[0]}x{size[1]}",
                 bands=len(bands), seconds=round(time.time() - t0, 1), method=method)
    progress("nettoyage", 1.0, "Terminé")
    return stats
