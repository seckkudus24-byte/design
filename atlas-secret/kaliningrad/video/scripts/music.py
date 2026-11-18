"""Nappe sonore documentaire (synthèse, libre de droits) → public/audio/music.wav, whoosh.wav, pulse.wav"""
import json, wave
from pathlib import Path
import numpy as np
ROOT = Path(__file__).resolve().parent.parent
SR = 48000; rng = np.random.default_rng(11)
out = ROOT / "public/audio"; out.mkdir(parents=True, exist_ok=True)
cfg = json.loads((ROOT / "src/config/narration.json").read_text(encoding="utf-8"))
tm = json.loads((ROOT / "src/generated/timings.json").read_text())
dur = cfg["lead"] + sum(tm[s["id"]] + s["pauseAfter"] for s in cfg["segments"]) + 1.5

def save(name, x):
    x = np.clip(x, -1, 1); st = (x * 32767).astype(np.int16)
    with wave.open(str(out / name), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())

def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y

n = int(dur * SR); t = np.arange(n) / SR
f = lambda m: 440 * 2 ** ((m - 69) / 12)
# ré mineur grave, nappe lente qui « respire »
pad = np.zeros(n)
for m, g in [(38, .16), (45, .09), (50, .07), (53, .05), (57, .035)]:
    for det in (-0.06, 0.07):
        pad += g * np.sin(2 * np.pi * f(m + det) * t + rng.uniform(0, 6))
pad *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.07 * t)
air = lp(rng.standard_normal(n), 900) * 0.05 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.05 * t + 1))
# pulsation sourde toutes les 2 s à partir de la scène 2
pulse = np.zeros(n)
s2 = cfg["lead"] + sum(tm[s["id"]] + s["pauseAfter"] for s in cfg["segments"] if s["scene"] == 1)
k = s2
while k < dur - 1:
    a = int(k * SR); L = int(0.6 * SR); tt = np.arange(L) / SR
    pulse[a:a + L] += 0.22 * np.sin(2 * np.pi * (46 + 30 * np.exp(-tt * 18)) * tt) * np.exp(-tt * 6)
    k += 2.0
mix = pad + air + pulse
env = np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 1.5)
mix *= env; mix /= np.max(np.abs(mix)) / 0.7
save("music.wav", np.stack([mix * (1 + 0.1 * np.sin(t * 0.4)), mix * (1 - 0.1 * np.sin(t * 0.4))], 1))

# souffle du recul de caméra (scène 1)
m = int(3.2 * SR); tt = np.arange(m) / SR
noise = rng.standard_normal(m); y = np.zeros(m); acc = 0.0
for i in range(m):
    fc = 200 + 1600 * np.sin(np.pi * tt[i] / 3.2) ** 2; a = np.exp(-2 * np.pi * fc / SR); acc = (1 - a) * noise[i] + a * acc; y[i] = acc
y *= np.sin(np.pi * tt / 3.2) ** 2; y /= np.max(np.abs(y)) / 0.6
pan = np.linspace(-0.4, 0.4, m)
save("whoosh.wav", np.stack([y * (1 - pan), y * (1 + pan)], 1) / 1.4)
print("audio ok,", round(dur, 1), "s")
