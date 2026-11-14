"""Lecture / écriture vidéo via FFmpeg (robuste : rotation, VFR, codecs exotiques)."""
from __future__ import annotations

import json
import subprocess
import tempfile
from dataclasses import dataclass
from fractions import Fraction

import numpy as np


class VideoError(RuntimeError):
    pass


MAX_DURATION_S = 300.0   # l'application est conçue pour des vidéos de 5 min maximum
MIN_DURATION_S = 0.3


def check_duration(info: "VideoInfo"):
    if info.duration > MAX_DURATION_S + 0.5:
        m, s = divmod(int(round(info.duration)), 60)
        raise VideoError(f"Vidéo trop longue ({m} min {s:02d} s) : la durée maximale est de 5 minutes.")
    if info.duration < MIN_DURATION_S or info.nb_frames < 2:
        raise VideoError("Vidéo trop courte ou durée illisible.")


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
    video_start: float = 0.0
    audio_start: float = 0.0

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
    vs = float(v.get("start_time") or 0.0)
    as_ = float(a.get("start_time") or 0.0) if a else vs
    return VideoInfo(path, w, h, fps, nb, duration, a is not None, a["codec_name"] if a else None, vs, as_)


class FrameReader:
    """Itère sur les images BGR (uint8, HxWx3) à fréquence constante, sur la
    chronologie du fichier (comble un éventuel retard de la piste vidéo)."""

    def __init__(self, info: VideoInfo):
        self.info = info
        # stderr vers un fichier : un tube non lu peut bloquer FFmpeg sur une longue vidéo.
        self._err = tempfile.TemporaryFile()
        self._proc = subprocess.Popen(
            ["ffmpeg", "-v", "error", "-nostdin", "-i", info.path, "-an", "-sn", "-dn",
             "-vf", f"fps={info.fps.numerator}/{info.fps.denominator}", "-fps_mode", "cfr",
             "-f", "rawvideo", "-pix_fmt", "bgr24", "pipe:1"],
            stdout=subprocess.PIPE, stderr=self._err, bufsize=10 ** 7,
        )
        self._size = info.width * info.height * 3
        self.count = 0

    def read(self) -> np.ndarray | None:
        buf = self._proc.stdout.read(self._size)
        if len(buf) < self._size:
            self._check()
            return None
        self.count += 1
        return np.frombuffer(buf, np.uint8).reshape(self.info.height, self.info.width, 3).copy()

    def __iter__(self):
        while (f := self.read()) is not None:
            yield f

    def _check(self):
        code = self._proc.wait()
        if code != 0 and self.count == 0:
            self._err.seek(0)
            raise VideoError("Décodage impossible : " + self._err.read().decode(errors="replace").strip()[-400:])

    def close(self):
        if self._proc.poll() is None:
            self._proc.kill()
        self._proc.wait()
        self._err.close()

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.close()


MP4_AUDIO_OK = {"aac", "mp3", "alac", "ac3", "eac3", "opus", "flac"}


def output_size(info: VideoInfo, resolution: str = "auto") -> tuple[int, int]:
    """Taille d'export. 'source' : identique ; '1080p' : petit côté = 1080 ;
    'auto' : 1080p minimum (agrandit les vidéos 720p), garde la source si elle est plus grande."""
    w, h = info.width, info.height
    short = min(w, h)
    if resolution == "source" or (resolution == "auto" and short >= 1080):
        target = short
    else:
        target = 1080
    k = target / short
    even = lambda x: max(2, int(round(x / 2)) * 2)  # noqa: E731
    return even(w * k), even(h * k)


class FrameWriter:
    """Encode des images BGR en MP4 H.264 (même cadence) et recopie l'audio d'origine.

    Synchronisation : FrameReader produit une image par période à partir du début
    du fichier (décalage de début de piste et fréquence variable compensés), donc
    l'image n correspond exactement à l'instant n / fps de la piste audio recopiée."""

    def __init__(self, path: str, info: VideoInfo, crf: int = 16, preset: str = "medium",
                 audio_from: str | None = None, size: tuple[int, int] | None = None):
        cmd = ["ffmpeg", "-v", "error", "-y", "-nostdin",
               "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{info.width}x{info.height}",
               "-r", f"{info.fps.numerator}/{info.fps.denominator}", "-i", "pipe:0"]
        if audio_from and info.has_audio:
            cmd += ["-i", audio_from, "-map", "0:v:0", "-map", "1:a:0"]
            cmd += ["-c:a", "copy"] if info.audio_codec in MP4_AUDIO_OK else ["-c:a", "aac", "-b:a", "192k"]
        if size and tuple(size) != (info.width, info.height):
            cmd += ["-vf", f"scale={size[0]}:{size[1]}:flags=lanczos"]
        cmd += ["-c:v", "libx264", "-crf", str(crf), "-preset", preset, "-pix_fmt", "yuv420p",
                "-profile:v", "high", "-movflags", "+faststart", path]
        self._err = tempfile.TemporaryFile()
        self._proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=self._err)

    def write(self, frame: np.ndarray):
        try:
            self._proc.stdin.write(np.ascontiguousarray(frame).tobytes())
        except BrokenPipeError:
            self._err.seek(0)
            raise VideoError("FFmpeg s'est arrêté : " + self._err.read().decode(errors="replace").strip()[-400:])

    def close(self):
        self._proc.stdin.close()
        code = self._proc.wait()
        self._err.seek(0)
        err = self._err.read().decode(errors="replace")
        self._err.close()
        if code != 0:
            raise VideoError(f"Échec de l'encodage FFmpeg : {err.strip()[-400:]}")

    def abort(self):
        if self._proc.poll() is None:
            self._proc.kill()
            self._proc.wait()
