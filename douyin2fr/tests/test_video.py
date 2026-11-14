"""Tests vidéo : limite de durée, taille d'export, synchronisation audio/vidéo."""
import os
import subprocess
import sys

import pytest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from d2f.video_io import VideoError, VideoInfo, check_duration, output_size, probe  # noqa: E402
from fractions import Fraction  # noqa: E402


def _info(w, h, dur=10.0):
    return VideoInfo("x", w, h, Fraction(30), int(dur * 30), dur, True, "aac")


def test_duration_limit():
    check_duration(_info(1080, 1920, 300.0))
    check_duration(_info(1080, 1920, 3.0))
    with pytest.raises(VideoError, match="5 minutes"):
        check_duration(_info(1080, 1920, 301.5))
    with pytest.raises(VideoError):
        check_duration(_info(1080, 1920, 0.1))


def test_output_size():
    assert output_size(_info(720, 1280), "auto") == (1080, 1920)     # agrandi en 1080p
    assert output_size(_info(1080, 1920), "auto") == (1080, 1920)
    assert output_size(_info(2160, 3840), "auto") == (2160, 3840)    # 4K conservé
    assert output_size(_info(2160, 3840), "1080p") == (1080, 1920)
    assert output_size(_info(720, 1280), "source") == (720, 1280)
    assert output_size(_info(1920, 1080), "auto") == (1920, 1080)


def _events(path):
    """Instant (s) du flash blanc (vidéo) et du bip (audio), dans la chronologie du fichier."""
    v = subprocess.run(["ffprobe", "-v", "error", "-f", "lavfi", f"movie={path},signalstats",
                        "-show_entries", "frame=pts_time:frame_tags=lavfi.signalstats.YAVG", "-of", "csv=p=0"],
                       capture_output=True, text=True, check=True).stdout.split()
    rows = lambda out: [l.split(",")[:2] for l in out if l.count(",") >= 1 and l.split(",")[1]]  # noqa: E731
    tv = next(float(t) for t, y in rows(v) if float(y) > 128)
    a = subprocess.run(["ffprobe", "-v", "error", "-f", "lavfi", f"amovie={path},astats=metadata=1:reset=1",
                        "-show_entries", "frame=pts_time:frame_tags=lavfi.astats.Overall.RMS_level", "-of", "csv=p=0"],
                       capture_output=True, text=True, check=True).stdout.split()
    ta = next(float(t) for t, r in rows(a) if r not in ("-inf", "inf") and float(r) > -30)
    return tv, ta


def test_audio_video_sync_preserved(tmp_path):
    """Flash et bip simultanés à 1,5 s, piste vidéo décalée de 0,4 s : l'écart doit être conservé."""
    from d2f.pipeline import Analysis, clean

    raw = tmp_path / "raw.mp4"
    subprocess.run([
        "ffmpeg", "-v", "error", "-f", "lavfi", "-i", "color=black:size=320x568:rate=25:duration=4",
        "-filter_complex",
        "[0:v]drawbox=c=white:t=fill:enable='between(t,1.5,1.58)'[v];"
        "aevalsrc=0:d=1.5:s=48000[s];sine=f=1000:d=0.2:sample_rate=48000[b];"
        "aevalsrc=0:d=2.3:s=48000[e];[s][b][e]concat=n=3:v=0:a=1[a]",
        "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", str(raw)],
        check=True)
    src = tmp_path / "src.mp4"  # décale la piste vidéo de 0,4 s (cas réel de fichiers de téléphone)
    subprocess.run(["ffmpeg", "-v", "error", "-itsoffset", "0.4", "-i", str(raw), "-i", str(raw),
                    "-map", "0:v", "-map", "1:a", "-c", "copy", str(src)], check=True)
    tv0, ta0 = _events(str(src))
    info = probe(str(src))
    a = Analysis(str(src), info.width, info.height, info.fps_float, info.nb_frames, 3)
    a.keyframes = {0: []}
    out = tmp_path / "out.mp4"
    clean(a, str(out), method="telea", resolution="source")
    tv1, ta1 = _events(str(out))
    assert abs((tv1 - ta1) - (tv0 - ta0)) < 0.05, (tv0, ta0, tv1, ta1)
