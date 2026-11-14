"""Lecture / écriture vidéo via FFmpeg (robuste : rotation, VFR, codecs exotiques)."""
from __future__ import annotations

import json
import subprocess
from dataclasses import dataclass
from fractions import Fraction

import numpy as np


class VideoError(RuntimeError):
    pass


@dataclass
class VideoInfo:
    path: str
    width: int
    height: int
    fps: Fraction
    nb_frames: int
    duration: float
    has_audio: bool
    audio_codec: str | None

    @property
    def fps_float(self) -> float:
        return float(self.fps)


def probe(path: str) -> VideoInfo:
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", path],
            check=True, capture_output=True, text=True,
        ).stdout
    except subprocess.CalledProcessError as e:
        raise VideoError(f"Fichier vidéo illisible : {e.stderr.strip()}") from e
    data = json.loads(out)
    v = next((s for s in data["streams"] if s["codec_type"] == "video"), None)
    if v is None:
        raise VideoError("Aucune piste vidéo trouvée.")
    a = next((s for s in data["streams"] if s["codec_type"] == "audio"), None)
    w, h = int(v["width"]), int(v["height"])
    # Rotation (vidéos de téléphone) : ffmpeg applique l'autorotation au décodage.
    rot = 0
    for sd in v.get("side_data_list", []) or []:
        if "rotation" in sd:
            rot = int(sd["rotation"])
    rot = int(v.get("tags", {}).get("rotate", rot))
    if abs(rot) % 180 == 90:
        w, h = h, w
    fps = Fraction(v.get("avg_frame_rate") or "0/1")
    if fps <= 0:
        fps = Fraction(v.get("r_frame_rate") or "30/1")
    if fps <= 0 or fps > 240:
        fps = Fraction(30)
    duration = float(data["format"].get("duration") or v.get("duration") or 0)
    nb = int(round(duration * float(fps))) if duration else int(v.get("nb_frames") or 0)
    return VideoInfo(path, w, h, fps, nb, duration, a is not None, a["codec_name"] if a else None)


class FrameReader:
    """Itère sur les images BGR (uint8, HxWx3) à fréquence constante."""

    def __init__(self, info: VideoInfo):
        self.info = info
        self._proc = subprocess.Popen(
            ["ffmpeg", "-v", "error", "-i", info.path, "-an", "-sn",
             "-vf", f"fps={info.fps.numerator}/{info.fps.denominator}",
             "-f", "rawvideo", "-pix_fmt", "bgr24", "pipe:1"],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, bufsize=10 ** 7,
        )
        self._size = info.width * info.height * 3

    def read(self) -> np.ndarray | None:
        buf = self._proc.stdout.read(self._size)
        if len(buf) < self._size:
            return None
        return np.frombuffer(buf, np.uint8).reshape(self.info.height, self.info.width, 3).copy()

    def __iter__(self):
        while (f := self.read()) is not None:
            yield f

    def close(self):
        if self._proc.poll() is None:
            self._proc.kill()
        self._proc.wait()

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.close()


MP4_AUDIO_OK = {"aac", "mp3", "alac", "ac3", "eac3", "opus", "flac"}


class FrameWriter:
    """Encode des images BGR en MP4 H.264 et recopie l'audio d'origine."""

    def __init__(self, path: str, info: VideoInfo, crf: int = 16, preset: str = "medium",
                 audio_from: str | None = None):
        cmd = ["ffmpeg", "-v", "error", "-y",
               "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{info.width}x{info.height}",
               "-r", f"{info.fps.numerator}/{info.fps.denominator}", "-i", "pipe:0"]
        if audio_from and info.has_audio:
            cmd += ["-i", audio_from, "-map", "0:v:0", "-map", "1:a:0"]
            cmd += ["-c:a", "copy"] if info.audio_codec in MP4_AUDIO_OK else ["-c:a", "aac", "-b:a", "192k"]
            cmd += ["-shortest"]
        cmd += ["-c:v", "libx264", "-crf", str(crf), "-preset", preset, "-pix_fmt", "yuv420p",
                "-movflags", "+faststart", path]
        self._proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)

    def write(self, frame: np.ndarray):
        self._proc.stdin.write(np.ascontiguousarray(frame).tobytes())

    def close(self):
        self._proc.stdin.close()
        err = self._proc.stderr.read().decode(errors="replace")
        if self._proc.wait() != 0:
            raise VideoError(f"Échec de l'encodage FFmpeg : {err.strip()}")

    def abort(self):
        if self._proc.poll() is None:
            self._proc.kill()
            self._proc.wait()
