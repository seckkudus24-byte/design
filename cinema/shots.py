"""Rendu d'un plan : extrait d'une scène source -> segment 1080x1920 à 30 i/s.

Chaîne réellement exécutée pour chaque plan :
  1. FFmpeg décode l'extrait à la résolution d'origine et le passe à 30 i/s
     (fps=30, sans interpolation ; ou minterpolate pour un ralenti).
  2. OpenCV applique en une seule passe de rééchantillonnage (Lanczos) le
     recadrage, l'agrandissement vers 1080x1920 et le mouvement de caméra
     numérique (push-in, travelling, léger tremblé), au sous-pixel près.
  3. FFmpeg applique l'étalonnage du plan puis encode un segment intermédiaire
     de haute qualité (x264 CRF 10).
"""
import math, subprocess
import numpy as np
import cv2

W, H, FPS = 1080, 1920, 30


def probe_size(src):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                   "stream=width,height", "-of", "csv=p=0", src]).decode().strip()
    w, h = out.split(",")[:2]
    return int(w), int(h)


def ease(p, kind="inout"):
    p = min(max(p, 0.0), 1.0)
    if kind == "linear":
        return p
    if kind == "out":
        return 1 - (1 - p) ** 3
    if kind == "in":
        return p ** 3
    return p * p * (3 - 2 * p)  # smoothstep


def lerp(a, b, t):
    return a + (b - a) * t


def shake_offset(i, amp, seed):
    """Tremblé caméra portée : somme de sinusoïdes lentes (pas de bruit image par image)."""
    if not amp:
        return 0.0, 0.0
    t = i / FPS
    r = np.random.default_rng(seed).uniform(0, 2 * math.pi, 6)
    dx = math.sin(1.3 * t + r[0]) + 0.6 * math.sin(2.9 * t + r[1]) + 0.3 * math.sin(6.1 * t + r[2])
    dy = math.sin(1.1 * t + r[3]) + 0.6 * math.sin(2.3 * t + r[4]) + 0.3 * math.sin(5.3 * t + r[5])
    return amp * dx / 1.9, amp * dy / 1.9


def render(shot, out, grade_vf):
    """shot : dict avec src, tin, tout, et en option :
       slow (facteur de ralenti, ex. 2.0), z0/z1 (zoom début/fin, 1 = plein cadre),
       c0/c1 ([x, y] centre normalisé du cadrage début/fin), ease, shake (pixels), punch (zoom bref à l'entrée).
    """
    src, tin, tout = shot["src"], shot["tin"], shot["tout"]
    slow = shot.get("slow", 1.0)
    sw, sh = probe_size(src)
    dur_out = (tout - tin) * slow
    n = int(round(dur_out * FPS))
    if slow > 1:
        # Ralenti par interpolation de mouvement (FFmpeg minterpolate, compensation de mouvement).
        vf = (f"setpts={slow}*PTS,minterpolate=fps={FPS}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1")
    else:
        vf = f"fps={FPS}"
    dec = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", f"{tin:.4f}", "-t", f"{tout - tin + 0.5:.4f}", "-i", src,
                            "-an", "-vf", vf, "-pix_fmt", "bgr24", "-f", "rawvideo", "-"],
                           stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}",
                            "-r", str(FPS), "-i", "-", "-vf", grade_vf + ",format=yuv420p",
                            "-c:v", "libx264", "-preset", "medium", "-crf", "10", "-r", str(FPS), out],
                           stdin=subprocess.PIPE)
    z0, z1 = shot.get("z0", 1.0), shot.get("z1", shot.get("z0", 1.0))
    c0 = shot.get("c0", [0.5, 0.5])
    c1 = shot.get("c1", c0)
    kind = shot.get("ease", "inout")
    amp = shot.get("shake", 0)
    punch = shot.get("punch", 0)  # ex. 0.06 : léger « coup de zoom » amorti à l'entrée du plan
    base = max(W / sw, H / sh)
    fsize = sw * sh * 3
    last = None
    for i in range(n):
        buf = dec.stdout.read(fsize)
        if len(buf) < fsize:
            if last is None:
                raise RuntimeError(f"aucune image lue dans {src}")
            frame = last  # fin de source atteinte : on tient la dernière image (quelques images au plus)
        else:
            frame = np.frombuffer(buf, np.uint8).reshape(sh, sw, 3)
            last = frame
        p = ease(i / max(n - 1, 1), kind)
        z = lerp(z0, z1, p)
        if punch:
            z *= 1 + punch * math.exp(-i / (0.12 * FPS))
        cx, cy = lerp(c0[0], c1[0], p), lerp(c0[1], c1[1], p)
        s = base * z
        # Centre du cadrage contraint pour ne jamais sortir de l'image source.
        hw, hh = W / (2 * s), H / (2 * s)
        x = min(max(cx * sw, hw), sw - hw)
        y = min(max(cy * sh, hh), sh - hh)
        dx, dy = shake_offset(i, amp, hash(out) & 0xffff)
        x = min(max(x + dx / s, hw), sw - hw)
        y = min(max(y + dy / s, hh), sh - hh)
        M = np.array([[s, 0, W / 2 - s * x], [0, s, H / 2 - s * y]], dtype=np.float64)
        img = cv2.warpAffine(frame, M, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)
        enc.stdin.write(img.tobytes())
    enc.stdin.close()
    dec.stdout.close()
    dec.kill()
    if enc.wait() != 0:
        raise RuntimeError(f"encodage échoué : {out}")
    return n
