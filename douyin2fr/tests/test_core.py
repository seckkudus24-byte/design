"""Tests rapides : python -m pytest tests -q"""
import os
import subprocess
import sys

import numpy as np
import pytest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from d2f.detect import Box, is_chinese  # noqa: E402
from d2f.inpaint.flowprop import FlowPropInpainter  # noqa: E402
from d2f.inpaint.base import TeleaInpainter  # noqa: E402
from d2f.masks import MaskBuilder  # noqa: E402
from d2f.pipeline import _bands  # noqa: E402


def test_is_chinese():
    assert is_chinese("这把扇子真的太漂亮了")
    assert is_chinese("iPhone 15 只要 999")
    assert not is_chinese("HELLO 2024")
    assert not is_chinese("")


def test_mask_builder_union_and_gap_fill():
    b = Box(100, 200, 300, 240, "你好", 0.9)
    dets = {0: [b], 3: [], 6: [b], 9: []}  # trou en 3 → comblé
    mb = MaskBuilder(dets, 12, 640, 480, stride=3)
    assert mb.boxes(3), "la détection manquée doit être comblée"
    m = mb.mask(4)
    assert m[220, 200] == 255
    # marge autour de la boîte
    assert m[200 - 5, 100 - 5] == 255
    # loin de la boîte : rien
    assert m[10, 10] == 0


def test_singleton_low_score_dropped():
    dets = {0: [], 3: [Box(10, 10, 50, 30, "字", 0.55)], 6: []}
    mb = MaskBuilder(dets, 9, 100, 100, stride=3)
    assert not mb.boxes(3)


def test_bands_split():
    h, w = 400, 300
    m1 = np.zeros((h, w), np.uint8)
    m1[20:40, 50:250] = 255
    m1[330:350, 60:200] = 255
    bands = _bands([m1], 16, h, w)
    assert len(bands) == 2
    x0, y0, x1, y1 = bands[0]
    assert y0 <= 20 - 16 + 1 and y1 >= 40 + 16 - 1


def test_flowprop_recovers_real_background():
    """Fond texturé qui défile + texte fixe : le moteur doit retrouver le vrai fond."""
    rng = np.random.default_rng(0)
    big = (rng.random((200, 400, 3)) * 255).astype(np.uint8)
    big = np.ascontiguousarray(np.repeat(np.repeat(big, 2, 0), 2, 1)[:200, :400])  # texture
    frames, masks, truth = [], [], []
    for t in range(20):
        f = np.roll(big, 3 * t, axis=0)[:120, :200].copy()  # défilement vertical
        truth.append(f.copy())
        m = np.zeros(f.shape[:2], np.uint8)
        m[50:70, 40:160] = 255
        f[54:66, 44:156] = 255  # « texte » blanc
        frames.append(f)
        masks.append(m)
    eng = FlowPropInpainter(TeleaInpainter(), flow_scale=1.0)
    out = eng.inpaint_clip(frames, masks)
    errs = [np.abs(out[t][masks[t] > 0].astype(float) - truth[t][masks[t] > 0]).mean() for t in range(20)]
    telea = [np.abs(TeleaInpainter()(frames[t], masks[t])[masks[t] > 0].astype(float)
                    - truth[t][masks[t] > 0]).mean() for t in range(20)]
    assert eng.stats["px_direct"] > 0.5 * eng.stats["px_total"]
    assert np.mean(errs) < 0.5 * np.mean(telea)


@pytest.mark.skipif(subprocess.run(["which", "ffmpeg"], capture_output=True).returncode != 0,
                    reason="ffmpeg absent")
def test_end_to_end(tmp_path):
    """Vidéo synthétique + sous-titres chinois → analyse → nettoyage → plus de texte détecté."""
    from d2f.detect import SubtitleDetector
    from d2f.pipeline import analyze, clean
    from d2f.video_io import FrameReader, probe

    src = tmp_path / "src.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "testsrc2=size=480x640:rate=24:duration=2",
                    "-f", "lavfi", "-i", "sine=frequency=440:duration=2", "-shortest",
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", str(src)], check=True)
    sub = tmp_path / "sub.mp4"
    subprocess.run([sys.executable, os.path.join(ROOT, "tests", "make_test_video.py"), str(src), str(sub),
                    "--pos", "0.75"], check=True, capture_output=True)
    a = analyze(str(sub), os.path.join(ROOT, "models"), stride=3)
    assert sum(len(v) for v in a.keyframes.values()) > 0, "aucun sous-titre chinois détecté"
    out = tmp_path / "out.mp4"
    stats = clean(a, str(out), method="temporal-fast")
    info = probe(str(out))
    assert info.has_audio and info.width == 480 and info.height == 640
    assert stats["px_total"] > 0
    det = SubtitleDetector(models_dir=os.path.join(ROOT, "models"))
    with FrameReader(info) as r:
        left = sum(len(det.detect(f)) for i, f in enumerate(r) if i % 6 == 0)
    assert left == 0, f"{left} sous-titre(s) encore détecté(s) après nettoyage"
