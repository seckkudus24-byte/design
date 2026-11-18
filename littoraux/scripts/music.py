"""Musique d'ambiance documentaire discrète + effet « whoosh » (synthèse, libre de droits).

Écrit public/audio/music.wav (durée = vidéo + marge) et public/audio/whoosh.wav.
"""
import json, wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
rng = np.random.default_rng(3)
out = ROOT / "public/audio"; out.mkdir(parents=True, exist_ok=True)

timings = json.loads((ROOT / "src/generated/timings.json").read_text())
cfg = json.loads((ROOT / "src/config/narration.json").read_text(encoding="utf-8"))
dur = 0.25 + sum(timings.values()) + sum(l.get("pauseAfter", cfg["gapAfter"]) for l in cfg["lines"]) + 2


def save(name, x):
    x = np.clip(x, -1, 1)
    st = (x * 32767).astype(np.int16)
    with wave.open(str(out / name), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(st.tobytes())


def lowpass(x, fc):
    k = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - k) * x[i] + k * acc; y[i] = acc
    return y


n = int(dur * SR); t = np.arange(n) / SR
bpm = 96; beat = 60 / bpm; bar = beat * 4
# progression en la mineur : Am – F – C – G (2 mesures chacun)
chords = [[57, 60, 64], [53, 57, 60], [48, 55, 60], [55, 59, 62]]
f = lambda m: 440 * 2 ** ((m - 69) / 12)
pad = np.zeros(n); bass = np.zeros(n); pulse = np.zeros(n)
seg = bar * 2
for ci in range(int(dur / seg) + 1):
    ch = chords[ci % 4]; a = int(ci * seg * SR); b = min(n, int((ci + 1) * seg * SR))
    if a >= n: break
    tt = t[a:b] - ci * seg
    env = np.minimum(1, tt / 0.8) * np.minimum(1, (seg - tt) / 0.6)
    for m in ch:
        for det in (-0.08, 0.08):
            pad[a:b] += np.sin(2 * np.pi * f(m + det) * t[a:b]) * env * 0.05
            pad[a:b] += np.sin(2 * np.pi * f(m + 12 + det) * t[a:b]) * env * 0.012
    bass[a:b] += np.sin(2 * np.pi * f(ch[0] - 12) * t[a:b]) * env * 0.12
# impulsion douce (croches) façon « documentaire »
for k in range(int(dur / (beat / 2))):
    a = int(k * beat / 2 * SR); L = int(0.18 * SR)
    if a + L >= n: break
    e = np.exp(-np.arange(L) / SR * 18)
    m = chords[int(k * beat / 2 / seg) % 4][k % 3] + 12
    pulse[a:a + L] += np.sin(2 * np.pi * f(m) * t[:L]) * e * (0.05 if k % 2 == 0 else 0.03)
# grosse caisse feutrée sur les temps 1 et 3
kick = np.zeros(n)
for k in range(int(dur / (beat * 2))):
    a = int(k * beat * 2 * SR); L = int(0.25 * SR)
    if a + L >= n: break
    tt = np.arange(L) / SR
    kick[a:a + L] += np.sin(2 * np.pi * (50 + 60 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 12) * 0.25
mix = lowpass(pad + pulse, 2600) + bass + kick
mix /= np.max(np.abs(mix)) / 0.7
L = mix * (1 + 0.15 * np.sin(2 * np.pi * 0.11 * t)); R = mix * (1 - 0.15 * np.sin(2 * np.pi * 0.11 * t))
save("music.wav", np.stack([L, R], 1))

# whoosh : bruit filtré balayé
m = int(0.7 * SR); tt = np.arange(m) / SR
noise = rng.standard_normal(m)
env = np.sin(np.pi * np.minimum(1, tt / 0.7)) ** 2 * np.exp(-tt * 1.5)
y = np.zeros(m); acc = 0.0
for i in range(m):
    fc = 300 + 5000 * np.sin(np.pi * tt[i] / 0.7) ** 2
    k = np.exp(-2 * np.pi * fc / SR); acc = (1 - k) * noise[i] + k * acc; y[i] = acc
y = y * env; y /= np.max(np.abs(y)) / 0.8
pan = np.linspace(-0.6, 0.6, m)
save("whoosh.wav", np.stack([y * (1 - pan) / 1.6, y * (1 + pan) / 1.6], 1))
print("musique", round(dur, 1), "s, whoosh ok")
