"""Fabrique (par synthèse) les effets sonores et ambiances de la vidéo dans public/sfx/.

Aucun fichier téléchargé : tout est généré avec numpy/scipy puis encodé en MP3 par ffmpeg.
Usage : python3 tools/make_sfx.py   (nécessite numpy, scipy et ffmpeg)
"""
import os
import subprocess
import tempfile
import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
OUT = "public/sfx"
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(d * SR)) / SR


def noise(d):
    return rng.standard_normal(int(d * SR))


def filt(x, kind, f, order=2):
    sos = butter(order, f, btype=kind, fs=SR, output="sos")
    return sosfilt(sos, x)


def env(n, a=0.005, r=0.1):
    """Enveloppe attaque linéaire + déclin exponentiel."""
    x = np.arange(n) / SR
    e = np.minimum(1, x / max(a, 1e-4)) * np.exp(-np.maximum(0, x - a) / r)
    return e


def sweep(f0, f1, d, shape="exp"):
    tt = t(d)
    f = f0 * (f1 / f0) ** (tt / d) if shape == "exp" else f0 + (f1 - f0) * tt / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def mix(base, x, at):
    i = int(at * SR)
    j = min(len(base), i + len(x))
    base[i:j] += x[: j - i]
    return base


def loopable(x, fade=0.5):
    """Fond enchaîné en boucle sans clic : la fin se fond dans le début."""
    n = int(fade * SR)
    head, body = x[:n], x[n:]
    ramp = np.linspace(0, 1, n)
    body[-n:] = body[-n:] * (1 - ramp) + head * ramp
    return body


def save(name, x, peak=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    os.makedirs(OUT, exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        tmp = f.name
    with wave.open(tmp, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp, "-b:a", "128k", f"{OUT}/{name}.mp3"], check=True)
    os.remove(tmp)
    print(f"{name}.mp3  {len(x) / SR:.1f}s")


# ---------- ambiances (boucles) ----------

def river(d=14):
    x = filt(noise(d), "lowpass", 700) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.21 * t(d)))
    x += filt(noise(d), "bandpass", [1500, 4000]) * 0.08
    for at in rng.uniform(0, d - 0.3, 45):  # glouglous
        f0 = rng.uniform(350, 900)
        b = sweep(f0, f0 * rng.uniform(1.3, 2), 0.08) * env(int(0.08 * SR), 0.003, 0.025)
        mix(x, b * rng.uniform(0.3, 0.8), at)
    return loopable(x)


def bird(f):
    d = rng.uniform(0.07, 0.14)
    tt = t(d)
    fm = f * (1 + 0.25 * np.sin(2 * np.pi * rng.uniform(25, 45) * tt)) * np.linspace(1.1, 0.9, len(tt))
    return np.sin(2 * np.pi * np.cumsum(fm) / SR) * np.sin(np.pi * tt / d) ** 2


def savanna(d=14):
    x = filt(noise(d), "bandpass", [150, 900]) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.13 * t(d)) ** 2) * 0.6
    at = 0.3
    while at < d - 1:
        f = rng.uniform(2200, 4200)
        for k in range(rng.integers(2, 5)):
            mix(x, bird(f * rng.uniform(0.9, 1.1)) * 0.35, at + k * 0.16)
        at += rng.uniform(0.9, 2.2)
    return loopable(x)


def night(d=14):
    x = filt(noise(d), "lowpass", 300) * 0.25
    for carrier, period, off in [(4400, 0.62, 0.0), (5100, 0.81, 0.3)]:
        at = off
        while at < d - 0.3:
            for k in range(4):  # un chant de grillon = 4 impulsions
                p = np.sin(2 * np.pi * carrier * t(0.018)) * np.sin(np.pi * t(0.018) / 0.018)
                mix(x, p * 0.25, at + k * 0.03)
            at += period
    at = 1.5
    while at < d - 1:  # grenouille
        tt = t(0.22)
        r = np.sign(np.sin(2 * np.pi * 170 * tt)) * (0.5 + 0.5 * np.sin(2 * np.pi * 28 * tt))
        mix(x, filt(r, "lowpass", 900) * env(len(tt), 0.01, 0.08) * 0.35, at)
        at += rng.uniform(2.5, 4.5)
    return loopable(x)


def underwater(d=14):
    x = filt(noise(d), "lowpass", 260) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.17 * t(d)))
    for at in rng.uniform(0, d - 0.3, 60):  # bulles
        f0 = rng.uniform(300, 700)
        b = sweep(f0, f0 * 2.4, 0.06) * env(int(0.06 * SR), 0.002, 0.02)
        mix(x, b * rng.uniform(0.2, 0.5), at)
    return loopable(x)


def tension(d=12):
    tt = t(d)
    x = sum(np.sin(2 * np.pi * f * tt + p) for f, p in [(55, 0), (82.4, 1), (110.5, 2)])
    x *= 0.6 + 0.4 * np.sin(2 * np.pi * 1.5 * tt)
    x += filt(noise(d), "lowpass", 200) * 0.6
    return loopable(x)


def music(bpm=104, bars=8):
    """Petite boucle de marimba joyeuse (do – la mineur – fa – sol)."""
    beat = 60 / bpm
    d = bars * 4 * beat
    x = np.zeros(int(d * SR) + SR)

    def note(midi, length, vel):
        f = 440 * 2 ** ((midi - 69) / 12)
        tt = t(length)
        tone = np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * 4 * f * tt) * np.exp(-tt / 0.03)
        return tone * env(len(tt), 0.003, 0.22) * vel

    chords = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]]
    scale = [72, 74, 76, 79, 81, 84]
    for b in range(bars):
        ch = chords[b % 4]
        for i in range(4):
            mix(x, note(ch[0] - 12 + (7 if i % 2 else 0), beat, 0.55), (b * 4 + i) * beat)
        for i in [1, 3]:
            for m in ch:
                mix(x, note(m + 12, beat * 0.5, 0.18), (b * 4 + i) * beat)
        for i in range(8):
            if rng.random() < 0.7:
                mix(x, note(int(rng.choice(scale)), beat, 0.32), (b * 4) * beat + i * beat / 2)
    return x[: int(d * SR)]


# ---------- bruitages ponctuels ----------

def whoosh():
    d = 0.45
    n = noise(d)
    out = np.zeros_like(n)
    for k, f in enumerate(np.geomspace(300, 3500, 9)):
        seg = slice(int(k * len(n) / 9), int((k + 1) * len(n) / 9))
        out[seg] = filt(n, "bandpass", [f * 0.7, f * 1.3])[seg]
    return out * np.sin(np.pi * t(d) / d) ** 1.5


def pop():
    return sweep(500, 1400, 0.07) * env(int(0.07 * SR), 0.002, 0.03)


def boing():
    d = 0.6
    tt = t(d)
    f = 220 * (1 + 0.35 * np.sin(2 * np.pi * 14 * tt) * np.exp(-tt / 0.25)) * np.linspace(1.3, 0.8, len(tt))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.005, 0.2)


def splash():
    d = 0.9
    x = filt(noise(d), "bandpass", [400, 5000]) * env(int(d * SR), 0.01, 0.18)
    for at in rng.uniform(0.05, 0.6, 14):
        f0 = rng.uniform(600, 1500)
        mix(x, sweep(f0, f0 * 1.8, 0.05) * env(int(0.05 * SR), 0.002, 0.015) * 0.5, at)
    return x


def splat():
    d = 0.35
    x = filt(noise(d), "lowpass", 1400) * env(int(d * SR), 0.004, 0.07)
    return x + sweep(300, 90, d) * env(int(d * SR), 0.004, 0.05) * 0.6


def honk():
    """« HOOONK » d'hippo : grognement grave à formants, en 3 coups."""
    out = np.zeros(int(1.6 * SR))
    for k, (f0, d) in enumerate([(120, 0.28), (110, 0.28), (95, 0.75)]):
        tt = t(d)
        f = f0 * (1 + 0.04 * np.sin(2 * np.pi * 6 * tt))
        ph = np.cumsum(f) / SR
        saw = 2 * (ph % 1) - 1
        v = filt(saw, "bandpass", [350, 700]) + 0.6 * filt(saw, "bandpass", [900, 1400])
        v += filt(noise(d), "bandpass", [200, 600]) * 0.3
        mix(out, v * np.sin(np.pi * tt / d) ** 0.5, k * 0.33)
    return out


def growl():
    d = 0.9
    tt = t(d)
    x = filt(noise(d), "lowpass", 500) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * tt))
    x += np.sin(2 * np.pi * 70 * tt) * 0.4
    return x * np.sin(np.pi * tt / d)


def yelp():
    return sweep(500, 1300, 0.25) * env(int(0.25 * SR), 0.01, 0.12)


def snap():
    d = 0.12
    return filt(noise(d), "highpass", 1500) * env(int(d * SR), 0.001, 0.015) + np.sin(2 * np.pi * 160 * t(d)) * env(int(d * SR), 0.001, 0.03)


def thud():
    d = 0.3
    return np.sin(2 * np.pi * np.cumsum(np.linspace(90, 45, int(d * SR))) / SR) * env(int(d * SR), 0.003, 0.07)


def chomp():
    out = np.zeros(int(0.5 * SR))
    for at in [0, 0.06, 0.13]:
        mix(out, filt(noise(0.05), "bandpass", [800, 4500]) * env(int(0.05 * SR), 0.001, 0.012), at)
    return out


def sparkle():
    out = np.zeros(int(1.0 * SR))
    for k, f in enumerate([1568, 2093, 2637, 3136]):
        tt = t(0.5)
        mix(out, (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2.01 * f * tt)) * env(len(tt), 0.002, 0.12), k * 0.07)
    return out


def ding():
    tt = t(1.2)
    return (np.sin(2 * np.pi * 1318 * tt) + 0.5 * np.sin(2 * np.pi * 1976 * tt) + 0.2 * np.sin(2 * np.pi * 3520 * tt)) * env(len(tt), 0.002, 0.35)


def tick():
    return np.sin(2 * np.pi * 2400 * t(0.02)) * env(int(0.02 * SR), 0.001, 0.005)


def alarm():
    out = np.zeros(int(1.2 * SR))
    for k in range(4):
        f = 880 if k % 2 == 0 else 660
        tt = t(0.25)
        sq = np.sign(np.sin(2 * np.pi * f * tt))
        mix(out, filt(sq, "lowpass", 3000) * np.minimum(1, np.minimum(tt, 0.25 - tt) / 0.01), k * 0.3)
    return out


def sad():
    """« Wah wah wah waaah » de trombone."""
    out = np.zeros(int(2.6 * SR))
    for k, (f0, d) in enumerate([(233, 0.4), (220, 0.4), (208, 0.4), (196, 1.1)]):
        tt = t(d)
        f = f0 * (1 + (0.03 * np.sin(2 * np.pi * 6 * tt) if k == 3 else 0))
        saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
        e = np.minimum(1, tt / 0.05) * np.minimum(1, (d - tt) / 0.08)
        mix(out, filt(saw, "lowpass", 1200) * e, k * 0.45)
    return out


def flow():
    d = 3.0
    tt = t(d)
    x = filt(noise(d), "bandpass", [300, 2500]) * np.minimum(1, tt / 0.4) * np.minimum(1, (d - tt) / 0.6)
    for at in rng.uniform(0, d - 0.2, 30):
        f0 = rng.uniform(400, 1000)
        mix(x, sweep(f0, f0 * 1.6, 0.07) * env(int(0.07 * SR), 0.002, 0.02) * 0.6, at)
    return x


def spray():
    """Queue-hélice : vrombissement + éclaboussures."""
    d = 2.0
    tt = t(d)
    x = filt(noise(d), "bandpass", [200, 1600]) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 14 * tt)))
    for at in rng.uniform(0, d - 0.2, 20):
        mix(x, splat()[: int(0.15 * SR)] * 0.5, at)
    return loopable(x, 0.3)


def click():
    d = 0.05
    return filt(noise(d), "highpass", 2000) * env(int(d * SR), 0.0005, 0.006)


if __name__ == "__main__":
    for name, fn in [
        ("amb_river", river), ("amb_savanna", savanna), ("amb_night", night), ("amb_underwater", underwater),
        ("amb_tension", tension), ("music", music), ("whoosh", whoosh), ("pop", pop), ("boing", boing),
        ("splash", splash), ("splat", splat), ("honk", honk), ("growl", growl), ("yelp", yelp), ("snap", snap),
        ("thud", thud), ("chomp", chomp), ("sparkle", sparkle), ("ding", ding), ("tick", tick), ("alarm", alarm),
        ("sad", sad), ("flow", flow), ("spray", spray), ("click", click),
    ]:
        save(name, fn())
