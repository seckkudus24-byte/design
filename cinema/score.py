"""Musique originale et habillage sonore synthétisés (numpy/scipy), 48 kHz stéréo.

Aucun fichier musical externe : chaque son est calculé ici. Les instruments sont volontairement
sobres (nappes de cordes synthétiques, piano doux, pulsation grave, battements de cœur,
montées et impacts) pour soutenir les dialogues sans les masquer.
"""
import numpy as np
from scipy import signal

SR = 48000
rng = np.random.default_rng(11)

NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}


def hz(name):
    """'D3' -> fréquence."""
    n, o = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((NOTE[n] + 12 * (o + 1) - 69) / 12)


def t_axis(d):
    return np.arange(int(d * SR)) / SR


def lp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), "low")
    return signal.lfilter(b, a, x, axis=0)


def hp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), "high")
    return signal.lfilter(b, a, x, axis=0)


def bp(x, f1, f2, order=2):
    b, a = signal.butter(order, [f1 / (SR / 2), f2 / (SR / 2)], "band")
    return signal.lfilter(b, a, x, axis=0)


def adsr(n, a, r):
    e = np.ones(n)
    a, r = int(a * SR), int(r * SR)
    if a:
        e[:a] = np.linspace(0, 1, a) ** 2
    if r:
        e[-r:] *= np.linspace(1, 0, r) ** 2
    return e


def norm(x, peak=1.0):
    m = np.max(np.abs(x)) + 1e-12
    return x / m * peak


def stereo(x, width=0.0, seed=0):
    """Mono -> stéréo ; width > 0 élargit par un léger décalage (effet Haas)."""
    if x.ndim == 2:
        return x
    d = int(width * 0.012 * SR)
    l = x
    r = np.concatenate([np.zeros(d), x[:len(x) - d]]) if d else x
    return np.stack([l, r], axis=1)


def reverb(x, size=2.5, mix=0.3, seed=3):
    """Réverbération par convolution avec une réponse impulsionnelle synthétique (bruit décroissant)."""
    r = np.random.default_rng(seed)
    n = int(size * SR)
    env = np.exp(-np.linspace(0, 7, n))
    ir = np.stack([r.standard_normal(n) * env, r.standard_normal(n) * env], axis=1)
    ir = lp(ir, 6000)
    ir /= np.sqrt(np.sum(ir ** 2, axis=0))
    x = stereo(x)
    wet = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[:len(x)] for c in range(2)], axis=1)
    return x * (1 - mix) + wet * mix * 1.5


# ---------- instruments ----------

def string_pad(notes, d, bright=1800, attack=1.5, release=2.0):
    """Nappe de cordes : dents de scie désaccordées, filtrées, vibrato lent."""
    t = t_axis(d)
    out = np.zeros(len(t))
    for k, nm in enumerate(notes):
        f = hz(nm)
        for det in (-0.12, 0.0, 0.13):
            vib = 1 + 0.003 * np.sin(2 * np.pi * (4.8 + k * 0.3) * t + det * 10)
            ph = 2 * np.pi * np.cumsum(f * 2 ** (det / 12) * vib) / SR
            out += signal.sawtooth(ph) * 0.33
    out = lp(out, bright, 2)
    out *= adsr(len(t), attack, release)
    return stereo(norm(out, 0.5), width=1.0)


def drone(note, d, attack=2.0, release=2.5):
    t = t_axis(d)
    f = hz(note)
    x = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t + 0.3) + 0.25 * signal.sawtooth(2 * np.pi * f * 1.003 * t)
    x = lp(x, 500)
    x *= 1 + 0.15 * np.sin(2 * np.pi * 0.17 * t)
    x *= adsr(len(t), attack, release)
    return stereo(norm(x, 0.6), width=0.6)


def piano(note, d=3.0, vel=1.0):
    t = t_axis(d)
    f = hz(note)
    x = sum(a * np.sin(2 * np.pi * f * h * t * (1 + 0.0004 * h * h)) * np.exp(-t * (1.6 + h * 0.9))
            for h, a in ((1, 1.0), (2, 0.45), (3, 0.25), (4, 0.12), (5, 0.06)))
    hammer = lp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 90) * 0.15
    x = (x + hammer) * adsr(len(t), 0.003, 0.3)
    return stereo(norm(x, 0.5 * vel), width=0.4)


def heartbeat(d, bpm=62, vel=1.0):
    out = np.zeros(int(d * SR))
    beat = 60 / bpm
    for s in np.arange(0, d - 0.3, beat):
        for off, a in ((0.0, 1.0), (0.24, 0.65)):
            n = int(0.18 * SR)
            tt = np.arange(n) / SR
            th = np.sin(2 * np.pi * (55 + 30 * np.exp(-tt * 40)) * tt) * np.exp(-tt * 22) * a
            i = int((s + off) * SR)
            out[i:i + n] += th[:len(out) - i]
    return stereo(norm(lp(out, 180), 0.8 * vel))


def pulse(d, bpm=96, note="D2", accel=False):
    """Pulsation grave ostinato (croches), avec accélération optionnelle."""
    out = np.zeros(int(d * SR))
    f = hz(note)
    t, k = 0.0, 0
    while t < d - 0.2:
        n = int(0.22 * SR)
        tt = np.arange(n) / SR
        x = (signal.sawtooth(2 * np.pi * f * tt) + np.sin(2 * np.pi * f / 2 * tt)) * np.exp(-tt * 14)
        i = int(t * SR)
        out[i:i + n] += x[:len(out) - i] * (1.0 if k % 2 == 0 else 0.6)
        b = bpm * (1 + 0.6 * t / d if accel else 1)
        t += 30 / b
        k += 1
    out = lp(out, 900)
    out *= adsr(len(out), 0.3, 0.2)
    return stereo(norm(out, 0.55), width=0.3)


def riser(d, f0=200, f1=3500):
    """Montée de tension : bruit filtré dont la fréquence et le volume montent, plus une note glissante."""
    t = t_axis(d)
    n = rng.standard_normal(len(t))
    p = t / d
    # Filtre passe-bande glissant, appliqué par blocs.
    out = np.zeros(len(t))
    blk = 2048
    for i in range(0, len(t), blk):
        fc = f0 * (f1 / f0) ** p[i]
        out[i:i + blk] = bp(n[i:i + blk + 4096], fc * 0.7, min(fc * 1.4, SR / 2 - 100))[:len(out[i:i + blk])]
    tone = signal.sawtooth(2 * np.pi * np.cumsum(110 * 2 ** (p * 2)) / SR) * 0.3
    x = (out + lp(tone, 2000)) * p ** 2.2
    return stereo(norm(x, 0.7), width=1.0)


def impact(d=3.5, note="D1"):
    """Impact cinématographique : sub grave + choc de bruit + queue réverbérée."""
    t = t_axis(d)
    f = hz(note)
    sub = np.sin(2 * np.pi * np.cumsum(f * (1 + 2.5 * np.exp(-t * 18))) / SR) * np.exp(-t * 1.4)
    hit = lp(rng.standard_normal(len(t)), 1800) * np.exp(-t * 14)
    brass = lp(sum(signal.sawtooth(2 * np.pi * hz(n) * t * (1 + dt)) for n in ("D2", "A2", "D3") for dt in (-0.002, 0.002)),
               700) * np.exp(-t * 1.1) * 0.25
    x = sub * 1.0 + hit * 0.6 + brass
    x *= adsr(len(t), 0.002, 0.6)
    return reverb(norm(x, 0.9), size=3.0, mix=0.35)


def sub_drop(d=2.0):
    t = t_axis(d)
    x = np.sin(2 * np.pi * np.cumsum(30 + 60 * np.exp(-t * 2.5)) / SR) * np.exp(-t * 1.5)
    return stereo(norm(x * adsr(len(t), 0.005, 0.4), 0.9))


def whoosh(d=0.6):
    t = t_axis(d)
    n = rng.standard_normal(len(t))
    p = t / d
    x = bp(n, 300, 5000) * np.sin(np.pi * p) ** 2
    return stereo(norm(x, 0.6), width=1.0)


def wind(d):
    """Vent / air nocturne de fond (ambiance)."""
    n = rng.standard_normal(int(d * SR))
    x = bp(n, 150, 900)
    t = t_axis(d)
    x *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t) * np.sin(2 * np.pi * 0.07 * t + 1)
    return stereo(norm(x * adsr(len(x), 1.0, 1.0), 0.5), width=1.0)


def flame(d):
    """Souffle de chalumeau : bruit large bande, grondement et sifflement."""
    n = rng.standard_normal(int(d * SR))
    x = bp(n, 400, 7000) * 0.6 + lp(n, 200) * 2.0
    t = t_axis(d)
    x *= 1 + 0.1 * np.sin(2 * np.pi * 9 * t)
    return stereo(norm(x * adsr(len(x), 0.08, 0.3), 0.6), width=0.5)


def tick_clock(d, period=1.0):
    out = np.zeros(int(d * SR))
    for k, s in enumerate(np.arange(0, d - 0.05, period / 2)):
        n = int(0.025 * SR)
        tt = np.arange(n) / SR
        c = (np.sin(2 * np.pi * 2300 * tt) + rng.standard_normal(n) * 0.3) * np.exp(-tt * 260) * (1 if k % 2 == 0 else 0.7)
        i = int(s * SR)
        out[i:i + n] += c[:len(out) - i]
    return stereo(norm(out, 0.5))


def shimmer(d, root="A5", seed=5):
    """Scintillement : cloches aiguës aléatoires sur une nappe haute (éclat lumineux, magie)."""
    r = np.random.default_rng(seed)
    t = t_axis(d)
    n = len(t)
    out = np.zeros(n)
    base = hz(root)
    ratios = (1, 1.25, 1.5, 2, 2.5, 3)
    for s in r.uniform(0, max(d - 0.3, 0.01), int(d * 9)):
        f = base * r.choice(ratios)
        m = int(0.9 * SR)
        tt = np.arange(m) / SR
        b = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2.76 * f * tt)) * np.exp(-tt * 5) * r.uniform(0.3, 1)
        i = int(s * SR)
        out[i:i + m] += b[:n - i]
    pad = sum(np.sin(2 * np.pi * base * k * t * (1 + 0.002 * np.sin(2 * np.pi * 5 * t))) for k in (0.5, 0.75, 1)) * 0.15
    x = (out + pad) * adsr(n, 0.4, min(1.5, d / 2))
    return reverb(norm(x, 0.6), size=3.5, mix=0.5)
