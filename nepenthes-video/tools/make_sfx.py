"""Fabrique (par synthèse) les effets sonores et ambiances de la vidéo du népenthès dans public/sfx/.

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


# ---------- sons du désert (vidéo ganga) ----------

def desert_wind(d=14):
    tt = t(d)
    x = filt(noise(d), "bandpass", [120, 700]) * (0.45 + 0.55 * np.sin(2 * np.pi * 0.09 * tt) ** 2)
    x += filt(noise(d), "bandpass", [1800, 3500]) * 0.05 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * tt))
    return loopable(x)


def sizzle(d=1.6):
    x = filt(noise(d), "highpass", 3000) * 0.4
    for at in rng.uniform(0, d - 0.05, 60):  # crépitements
        mix(x, filt(noise(0.01), "highpass", 2000) * rng.uniform(0.5, 1.2), at)
    tt = t(d)
    return x * np.minimum(1, tt / 0.2) * np.minimum(1, (d - tt) / 0.4)


def flap():
    """Un battement d'ailes."""
    d = 0.12
    return filt(noise(d), "bandpass", [250, 1800]) * np.sin(np.pi * t(d) / d) ** 2


def flaps(d=4, rate=7.0, voices=1):
    x = np.zeros(int(d * SR))
    for v in range(voices):
        at = rng.uniform(0, 1 / rate)
        while at < d - 0.15:
            mix(x, flap() * rng.uniform(0.6, 1.0), at)
            at += 1 / rate * rng.uniform(0.85, 1.15)
    return loopable(x, 0.2)


def chirp():
    """Piou de poussin."""
    out = np.zeros(int(0.5 * SR))
    for k in range(2):
        f0 = rng.uniform(3000, 3800)
        mix(out, sweep(f0, f0 * 1.25, 0.09) * np.sin(np.pi * t(0.09) / 0.09), k * 0.14)
    return out


def chirps(d=3.0):
    x = np.zeros(int(d * SR))
    at = 0.0
    while at < d - 0.5:
        mix(x, chirp() * rng.uniform(0.5, 1.0), at)
        at += rng.uniform(0.18, 0.45)
    return x


def screech():
    """Cri de faucon : kiii-aaaah descendant."""
    d = 0.9
    tt = t(d)
    f = 2600 * (1 - 0.35 * tt / d) * (1 + 0.03 * np.sin(2 * np.pi * 40 * tt))
    ph = np.cumsum(f) / SR
    x = np.sin(2 * np.pi * ph) + 0.5 * np.sin(4 * np.pi * ph) + 0.3 * filt(noise(d), "bandpass", [2000, 4000])
    return x * np.minimum(1, tt / 0.03) * np.exp(-tt / 0.45)


def snarl():
    """Grognement de chacal."""
    d = 0.8
    tt = t(d)
    x = filt(noise(d), "bandpass", [150, 900]) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 26 * tt)))
    x += np.sin(2 * np.pi * 95 * tt) * 0.3
    return x * np.sin(np.pi * tt / d)


def buzzer():
    """« Mauvaise réponse »."""
    tt = t(0.45)
    sq = np.sign(np.sin(2 * np.pi * 140 * tt)) + np.sign(np.sin(2 * np.pi * 147 * tt))
    return filt(sq, "lowpass", 1500) * np.minimum(1, np.minimum(tt, 0.45 - tt) / 0.01)


def rise():
    """Montée du thermomètre."""
    d = 1.4
    tt = t(d)
    x = sweep(300, 1400, d) + 0.4 * np.sign(np.sin(2 * np.pi * 8 * tt)) * sweep(600, 2800, d) * 0.3
    return x * np.minimum(1, tt / 0.05) * np.minimum(1, (d - tt) / 0.1)


def crack():
    out = np.zeros(int(0.4 * SR))
    for at in [0, 0.08, 0.15]:
        mix(out, filt(noise(0.03), "highpass", 1200) * env(int(0.03 * SR), 0.001, 0.008), at)
    return out


def slurp(d=3.0):
    """Gouttes bues : glouglous et petits « plic »."""
    x = filt(noise(d), "lowpass", 500) * 0.15
    at = 0.05
    while at < d - 0.2:
        f0 = rng.uniform(700, 1300)
        mix(x, sweep(f0, f0 * 1.9, 0.07) * env(int(0.07 * SR), 0.002, 0.025) * rng.uniform(0.5, 1), at)
        at += rng.uniform(0.12, 0.3)
    return loopable(x, 0.2)


def slosh(d=3.0):
    tt = t(d)
    x = filt(noise(d), "bandpass", [200, 1600]) * (0.3 + 0.7 * np.sin(2 * np.pi * 0.9 * tt) ** 2)
    for at in rng.uniform(0, d - 0.2, 14):
        f0 = rng.uniform(400, 900)
        mix(x, sweep(f0, f0 * 1.6, 0.06) * env(int(0.06 * SR), 0.002, 0.02) * 0.5, at)
    return loopable(x, 0.3)


def clock_tick(d=2.0):
    x = np.zeros(int(d * SR))
    for k in range(int(d * 4)):
        tk = filt(noise(0.015), "bandpass", [2500, 6000]) * env(int(0.015 * SR), 0.0005, 0.004)
        mix(x, tk * (1 if k % 2 == 0 else 0.6), k * 0.25)
    return x


def mystery():
    """Petit carillon mystérieux (« un secret… »)."""
    out = np.zeros(int(1.6 * SR))
    for k, f in enumerate([988, 1175, 1480, 1175]):
        tt = t(0.8)
        mix(out, np.sin(2 * np.pi * f * tt) * (1 + 0.3 * np.sin(2 * np.pi * 6 * tt)) * env(len(tt), 0.01, 0.3), k * 0.18)
    return out


def fanfare():
    out = np.zeros(int(1.5 * SR))
    for k, (m, d) in enumerate([(72, 0.15), (76, 0.15), (79, 0.15), (84, 0.8)]):
        f = 440 * 2 ** ((m - 69) / 12)
        tt = t(d)
        saw = 2 * ((f * tt) % 1) - 1
        mix(out, filt(saw, "lowpass", 2500) * np.minimum(1, tt / 0.01) * np.minimum(1, (d - tt) / 0.05), k * 0.16)
    return out


# ---------- sons de la forêt (vidéo polatouche) ----------

def knock():
    """Toc-toc-toc du pic."""
    out = np.zeros(int(0.7 * SR))
    for k in range(6):
        tt = t(0.04)
        tok = (np.sin(2 * np.pi * 900 * tt) + filt(noise(0.04), "bandpass", [600, 2500])) * env(len(tt), 0.001, 0.01)
        mix(out, tok, k * 0.09)
    return out


def hoot():
    """Hou-houuu de chouette."""
    out = np.zeros(int(1.6 * SR))
    for k, (f, d) in enumerate([(380, 0.25), (360, 0.7)]):
        tt = t(d)
        x = np.sin(2 * np.pi * f * tt * (1 - 0.06 * tt / d)) + 0.2 * filt(noise(d), "bandpass", [300, 600])
        mix(out, x * np.sin(np.pi * tt / d) ** 0.7, k * 0.45)
    return out


def shutter():
    out = np.zeros(int(0.35 * SR))
    for at in [0, 0.09]:
        mix(out, filt(noise(0.05), "bandpass", [1500, 7000]) * env(int(0.05 * SR), 0.001, 0.012), at)
    return out


def glide():
    """Long souffle du vol plané."""
    d = 1.6
    n = noise(d)
    out = filt(n, "bandpass", [500, 2600])
    tt = t(d)
    return out * np.sin(np.pi * tt / d) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * tt))


def frost():
    """Givre qui scintille."""
    out = np.zeros(int(1.4 * SR))
    for at in rng.uniform(0, 1.0, 18):
        f = rng.uniform(2500, 5000)
        tt = t(0.25)
        mix(out, np.sin(2 * np.pi * f * tt) * env(len(tt), 0.002, 0.06) * 0.6, at)
    return out + filt(noise(1.4), "highpass", 5000) * 0.05


def aww():
    """« Ooooh » attendri : glissando doux."""
    d = 1.2
    tt = t(d)
    f = 520 + 120 * np.sin(np.pi * tt / d)
    x = sum(np.sin(2 * np.pi * np.cumsum(f * m) / SR) / m for m in (1, 2, 3))
    return x * np.sin(np.pi * tt / d) ** 1.5


# ---------- sons de savane (vidéo phacochère) ----------

def grunt():
    """Grognement « grouik » de phacochère."""
    out = np.zeros(int(0.9 * SR))
    for k, (f0, d) in enumerate([(140, 0.18), (120, 0.3)]):
        tt = t(d)
        f = f0 * (1 + 0.15 * np.sin(np.pi * tt / d))
        saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
        v = filt(saw, "bandpass", [300, 1400]) + 0.5 * filt(noise(d), "bandpass", [200, 900])
        mix(out, v * np.sin(np.pi * tt / d) ** 0.6 * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 30 * tt))), k * 0.25)
    return out


def kiik(n=3):
    """Petits cris aigus de mangouste."""
    out = np.zeros(int((0.16 * n + 0.2) * SR))
    for k in range(n):
        f0 = rng.uniform(1800, 2600)
        tt = t(0.08)
        mix(out, sweep(f0, f0 * 0.7, 0.08) * np.sin(np.pi * tt / 0.08) + 0.2 * filt(noise(0.08), "highpass", 2000), k * 0.15)
    return out


def sniff():
    out = np.zeros(int(0.6 * SR))
    for at in [0, 0.12, 0.24]:
        d = 0.08
        mix(out, filt(noise(d), "bandpass", [1500, 6000]) * np.sin(np.pi * t(d) / d) ** 2, at)
    return out


def scratch(d=1.2):
    x = np.zeros(int(d * SR))
    at = 0.0
    while at < d - 0.12:
        mix(x, filt(noise(0.1), "bandpass", [800, 5000]) * np.sin(np.pi * t(0.1) / 0.1), at)
        at += 0.14
    return x


def mud():
    d = 0.8
    x = filt(noise(d), "lowpass", 900) * env(int(d * SR), 0.01, 0.2)
    for at in rng.uniform(0.05, 0.5, 8):
        f0 = rng.uniform(150, 400)
        mix(x, sweep(f0, f0 * 1.6, 0.1) * env(int(0.1 * SR), 0.003, 0.04) * 0.6, at)
    return x


def plop():
    """Tique arrachée."""
    return sweep(900, 250, 0.09) * env(int(0.09 * SR), 0.002, 0.03)


# ---------- sons doux (vidéo ouette d'Égypte) ----------

def piano_note(midi, length, vel):
    f = 440 * 2 ** ((midi - 69) / 12)
    tt = t(length)
    tone = sum(np.sin(2 * np.pi * f * h * tt) * a * np.exp(-tt * (1.2 + h * 0.9)) for h, a in [(1, 1), (2, 0.35), (3, 0.12), (4, 0.06)])
    return tone * np.minimum(1, tt / 0.004) * vel


def sad_piano(bpm=66, bars=8):
    """Piano lent et doux, la mineur – fa – do – sol."""
    beat = 60 / bpm
    d = bars * 4 * beat
    x = np.zeros(int(d * SR) + 3 * SR)
    chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
    melody = [[76, 74, 72, 71], [72, 69, 72, 74], [76, 79, 76, 72], [74, 71, 74, 76]]
    for b in range(bars):
        ch = chords[b % 4]
        mix(x, piano_note(ch[0] - 12, beat * 4, 0.5), b * 4 * beat)
        for i in range(4):  # arpège
            mix(x, piano_note(ch[i % 3] + 12 * (i // 3), beat * 2, 0.22), (b * 4 + i) * beat)
        for i, m in enumerate(melody[b % 4]):
            if b % 2 == 1 and i % 2 == 1:
                continue
            mix(x, piano_note(m, beat * 2.5, 0.3), (b * 4 + i) * beat + beat * 0.5)
    # réverbération simple
    out = x.copy()
    for dly, g in [(0.13, 0.35), (0.29, 0.25), (0.47, 0.15)]:
        out[int(dly * SR):] += x[: len(x) - int(dly * SR)] * g
    return loopable(out[: int(d * SR) + int(0.6 * SR)], 0.6)


def peep():
    """Pépiement doux d'oisillon."""
    out = np.zeros(int(0.45 * SR))
    for k in range(2):
        f0 = rng.uniform(2400, 2900)
        tt = t(0.07)
        mix(out, sweep(f0, f0 * 1.15, 0.07) * np.sin(np.pi * tt / 0.07) ** 2 * 0.7, k * 0.13)
    return out


def peeps(d=3.0):
    x = np.zeros(int(d * SR))
    at = 0.0
    while at < d - 0.45:
        mix(x, peep() * rng.uniform(0.4, 0.8), at)
        at += rng.uniform(0.3, 0.7)
    return x


def snow_steps(d=2.0):
    x = np.zeros(int(d * SR))
    for k in range(int(d / 0.45)):
        mix(x, filt(noise(0.12), "bandpass", [600, 3000]) * np.sin(np.pi * t(0.12) / 0.12) ** 2 * 0.5, k * 0.45)
    return x


def ice_creak():
    d = 1.4
    tt = t(d)
    f = 90 + 40 * np.sin(2 * np.pi * 0.7 * tt)
    x = filt(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), "bandpass", [150, 900]) * 0.3
    return x * np.sin(np.pi * tt / d) ** 2


def fire(d=6.0):
    x = filt(noise(d), "lowpass", 400) * 0.25
    for at in rng.uniform(0, d - 0.05, 90):
        mix(x, filt(noise(0.012), "bandpass", [1500, 6000]) * rng.uniform(0.2, 0.7), at)
    return loopable(x, 0.4)


def applause(d=3.0):
    x = np.zeros(int(d * SR))
    for at in rng.uniform(0, d - 0.05, 260):
        mix(x, filt(noise(0.02), "bandpass", [700, 4000]) * env(int(0.02 * SR), 0.001, 0.006) * rng.uniform(0.3, 1), at)
    tt = t(d)
    return x * np.minimum(1, tt / 0.3) * np.minimum(1, (d - tt) / 0.8)


def chime():
    tt = t(2.0)
    return sum(np.sin(2 * np.pi * f * tt) * a for f, a in [(880, 1), (1320, 0.4), (1760, 0.2)]) * env(len(tt), 0.005, 0.6)


def harp():
    """Petit glissando de harpe (transitions)."""
    out = np.zeros(int(1.2 * SR))
    for k, m in enumerate([69, 72, 76, 79, 81]):
        f = 440 * 2 ** ((m - 69) / 12)
        tt = t(0.8)
        mix(out, np.sin(2 * np.pi * f * tt) * env(len(tt), 0.003, 0.25) * 0.5, k * 0.05)
    return out


def soft_pop():
    return sweep(400, 800, 0.08) * np.sin(np.pi * t(0.08) / 0.08) ** 2


# ---------- sons rigolos et doux (vidéo népenthès) ----------

def flush():
    """Chasse d'eau cartoon, douce."""
    d = 1.6
    tt = t(d)
    x = filt(noise(d), "bandpass", [300, 2000]) * np.sin(np.pi * tt / d) ** 1.5
    x *= 0.6 + 0.4 * np.sin(2 * np.pi * (3 + 6 * tt / d) * tt)
    for at in rng.uniform(0.2, 1.3, 10):
        f0 = rng.uniform(300, 700)
        mix(x, sweep(f0, f0 * 1.8, 0.06) * env(int(0.06 * SR), 0.002, 0.02) * 0.4, at)
    return x


def plic():
    return sweep(1400, 2200, 0.05) * env(int(0.05 * SR), 0.001, 0.02)


def plouf():
    d = 0.5
    x = sweep(500, 140, d) * env(int(d * SR), 0.005, 0.12) * 0.8
    return x + filt(noise(d), "lowpass", 1200) * env(int(d * SR), 0.005, 0.06) * 0.3


def soft_rain(d=8.0):
    x = filt(noise(d), "bandpass", [1500, 6000]) * 0.15
    for at in rng.uniform(0, d - 0.05, 160):
        mix(x, plic() * rng.uniform(0.1, 0.35), at)
    return loopable(x, 0.4)


def squeak():
    out = np.zeros(int(0.5 * SR))
    for k in range(3):
        f0 = rng.uniform(3200, 4000)
        mix(out, sweep(f0, f0 * 1.1, 0.04) * np.sin(np.pi * t(0.04) / 0.04) * 0.6, k * 0.11)
    return out


def snore():
    d = 1.8
    tt = t(d)
    x = filt(noise(d), "bandpass", [120, 600]) * np.sin(np.pi * tt / 0.9) ** 2 * (tt < 0.9)
    out = np.zeros(int(d * SR))
    out += x
    mix(out, sweep(1200, 1800, 0.5) * np.sin(np.pi * t(0.5) / 0.5) * 0.15, 1.0)
    return out


def patter(d=1.5):
    x = np.zeros(int(d * SR))
    for k in range(int(d / 0.09)):
        mix(x, filt(noise(0.02), "bandpass", [1500, 5000]) * env(int(0.02 * SR), 0.001, 0.006) * 0.5, k * 0.09)
    return x


def lick():
    out = np.zeros(int(0.8 * SR))
    for k in range(3):
        mix(out, filt(noise(0.12), "bandpass", [800, 3000]) * np.sin(np.pi * t(0.12) / 0.12) ** 2 * 0.5, k * 0.25)
    return out


GANGA = [
    ("amb_wind", desert_wind), ("sizzle", sizzle), ("flap", flap), ("wings", lambda: flaps(4, 7, 1)),
    ("flock", lambda: flaps(4, 9, 14)), ("chirp", chirp), ("chirps", chirps), ("screech", screech), ("snarl", snarl),
    ("buzzer", buzzer), ("rise", rise), ("crack", crack), ("slurp", slurp), ("slosh", slosh), ("clock", clock_tick),
    ("mystery", mystery), ("fanfare", fanfare), ("music", music), ("whoosh", whoosh), ("pop", pop), ("boing", boing),
    ("splash", splash), ("thud", thud), ("sparkle", sparkle), ("ding", ding), ("tick", tick), ("click", click),
]


NEPENTHES = [
    ("amb_forest", savanna), ("music", music), ("rain", soft_rain), ("flush", flush), ("plic", plic), ("plouf", plouf),
    ("squeak", squeak), ("snore", snore), ("patter", patter), ("lick", lick), ("pop", soft_pop), ("boing", boing),
    ("sparkle", sparkle), ("ding", ding), ("chime", chime), ("harp", harp), ("plop", plop), ("wings", lambda: flaps(4, 9, 1)),
]

OUETTE = [
    ("music", sad_piano), ("amb_river", river), ("fire", fire), ("peep", peep), ("peeps", peeps),
    ("snow_steps", snow_steps), ("ice", ice_creak), ("applause", applause), ("chime", chime), ("harp", harp),
    ("pop", soft_pop), ("sparkle", sparkle), ("wings", lambda: flaps(4, 5, 1)),
]

PHACOCHERE = [
    ("amb_savanna", savanna), ("grunt", grunt), ("kiik", kiik), ("kiik_alarm", lambda: kiik(7)), ("sniff", sniff),
    ("scratch", scratch), ("chomp", chomp), ("growl", growl), ("mud", mud), ("plop", plop), ("aww", aww),
    ("buzzer", buzzer), ("mystery", mystery), ("music", music), ("whoosh", whoosh), ("pop", pop), ("boing", boing),
    ("sparkle", sparkle), ("ding", ding), ("click", click), ("fanfare", fanfare), ("alarm", alarm),
]

POLATOUCHE = [
    ("amb_forest", savanna), ("amb_night", night), ("amb_wind", desert_wind), ("knock", knock), ("hoot", hoot),
    ("shutter", shutter), ("glide", glide), ("frost", frost), ("aww", aww), ("chirp", chirp), ("buzzer", buzzer),
    ("mystery", mystery), ("music", music), ("whoosh", whoosh), ("pop", pop), ("boing", boing), ("thud", thud),
    ("sparkle", sparkle), ("ding", ding), ("click", click),
]

if __name__ == "__main__":
    for name, fn in NEPENTHES:
        save(name, fn())
