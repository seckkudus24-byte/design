"""Bande-son de l'épisode (synthèse, libre de droits) → public/audio/
   music.wav (musique continue qui suit le récit), whoosh.wav, impact.wav, riser.wav, sfx.json (positions).
   Les instants viennent de la narration (src/config/narration.json + timings)."""
import json, wave
from pathlib import Path
import numpy as np
ROOT = Path(__file__).resolve().parent.parent
SR = 48000; rng = np.random.default_rng(11)
out = ROOT / "public/audio"; out.mkdir(parents=True, exist_ok=True)
cfg = json.loads((ROOT / "src/config/narration.json").read_text(encoding="utf-8"))
tm = json.loads((ROOT / "src/generated/timings.json").read_text())
seg, t = {}, cfg["lead"]
for s in cfg["segments"]:
    seg[s["id"]] = (t, t + tm[s["id"]]); t += tm[s["id"]] + s["pauseAfter"]
DUR = t + 0.3
S = lambda i: seg[i][0]; E = lambda i: seg[i][1]

def save(name, x):
    x = np.clip(x, -1, 1); st = (x * 32767).astype(np.int16)
    if st.ndim == 1: st = np.stack([st, st], 1)
    with wave.open(str(out / name), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y
def env(t, pts):  # enveloppe linéaire par morceaux [(temps, niveau)…]
    xs, ys = zip(*pts); return np.interp(t, xs, ys)

n = int(DUR * SR); tt = np.arange(n) / SR
f = lambda m: 440 * 2 ** ((m - 69) / 12)
def pad(notes, gain, t0, t1, fade=1.5):
    y = np.zeros(n); a, b = int(max(0, t0 - fade) * SR), int(min(DUR, t1 + fade) * SR)
    x = tt[a:b]; e = np.clip((x - (t0 - fade)) / fade, 0, 1) * np.clip(((t1 + fade) - x) / fade, 0, 1)
    for m in notes:
        for det in (-0.07, 0.06):
            y[a:b] += gain * np.sin(2 * np.pi * f(m + det) * x + rng.uniform(0, 6)) * e
    return y

# Harmonie : ré mineur (mystère) → si bémol (archives) → sol mineur (guerre) → ré mineur → fa majeur (1991) → ré mineur (tension) → ré final
sec = [
    (0.0, S("s3a"), [38, 45, 50, 53, 57], 0.045),        # 1–2 : ré mineur
    (S("s3a"), S("s6a"), [34, 41, 46, 50, 53], 0.042),    # 3–5 : si bémol, archives
    (S("s6a"), S("s7a"), [31, 38, 43, 46, 50], 0.05),     # 6 : sol mineur, guerre
    (S("s7a"), S("s9c"), [38, 45, 50, 53, 57], 0.04),     # 7–9 : ré mineur
    (S("s9c"), S("s11a"), [41, 48, 53, 57, 60], 0.04),    # 1991–2004 : fa majeur
    (S("s11a"), S("s13a"), [38, 45, 50, 53, 58], 0.045),  # 11–12 : tension (sixte mineure)
    (S("s13a"), DUR, [38, 45, 50, 53, 57, 62], 0.042),    # 13 : résolution
]
mus = sum(pad(nt, g, a, b, 1.2) for a, b, nt, g in sec)
mus += 0.03 * lp(rng.standard_normal(n), 700) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.05 * tt))
# pulsation sourde : absente au début, plus rapide pendant la guerre et la partie militaire
def pulses(t0, t1, period, gain):
    y = np.zeros(n); k = t0
    while k < t1 - 0.3:
        a = int(k * SR); L = int(0.55 * SR); x = np.arange(min(L, n - a)) / SR
        y[a:a + len(x)] += gain * np.sin(2 * np.pi * (44 + 32 * np.exp(-x * 18)) * x) * np.exp(-x * 6.5); k += period
    return y
mus += pulses(S("s2a"), S("s6a"), 2.0, 0.2) + pulses(S("s6a"), S("s7a"), 1.0, 0.26) + pulses(S("s7a"), S("s9c"), 2.0, 0.17)
mus += pulses(S("s11a"), S("s13a"), 1.0, 0.2)
# ostinato discret (croches) pour la tension militaire
osti = np.zeros(n); k = S("s11a"); notes = [62, 65, 62, 69]
i = 0
while k < S("s13a") - 0.2:
    a = int(k * SR); L = int(0.22 * SR); x = np.arange(min(L, n - a)) / SR
    osti[a:a + len(x)] += 0.035 * np.sin(2 * np.pi * f(notes[i % 4]) * x) * np.exp(-x * 14); k += 0.25; i += 1
mus += lp(osti, 3000)
mus /= np.max(np.abs(mus)) / 0.75
mus *= env(tt, [(0, 0), (1.2, 1), (DUR - 2.5, 1), (DUR, 0)])
L = mus * (1 + 0.1 * np.sin(tt * 0.4)); R = mus * (1 - 0.1 * np.sin(tt * 0.4))
save("music.wav", np.stack([L, R], 1))

# effets
m = int(3.2 * SR); x = np.arange(m) / SR; noise = rng.standard_normal(m); y = np.zeros(m); acc = 0.0
for i2 in range(m):
    fc = 200 + 1600 * np.sin(np.pi * x[i2] / 3.2) ** 2; a = np.exp(-2 * np.pi * fc / SR); acc = (1 - a) * noise[i2] + a * acc; y[i2] = acc
y *= np.sin(np.pi * x / 3.2) ** 2; y /= np.max(np.abs(y)) / 0.6
pan = np.linspace(-0.4, 0.4, m); save("whoosh.wav", np.stack([y * (1 - pan), y * (1 + pan)], 1) / 1.4)
m = int(2.5 * SR); x = np.arange(m) / SR
imp = np.sin(2 * np.pi * (38 + 60 * np.exp(-x * 9)) * x) * np.exp(-x * 2.2) + 0.25 * lp(rng.standard_normal(m), 300) * np.exp(-x * 4)
save("impact.wav", imp / np.max(np.abs(imp)) * 0.8)
m = int(3.0 * SR); x = np.arange(m) / SR; noise = lp(rng.standard_normal(m), 2500)
ris = (noise * 0.5 + 0.3 * np.sin(2 * np.pi * (200 + 300 * x / 3) * x)) * (x / 3) ** 2
save("riser.wav", ris / np.max(np.abs(ris)) * 0.5)
sfx = [{"f": "whoosh", "t": S("s1c") + 0.2 * (E("s1c") - S("s1c")) - 0.6, "v": 0.45}]
for k2 in ["s3a", "s5a", "s9a", "s10a", "s11a", "s12a"]: sfx.append({"f": "whoosh", "t": S(k2) - 0.5, "v": 0.32})
sfx.append({"f": "whoosh", "t": S("s13d") + 0.5, "v": 0.3})
sfx += [{"f": "impact", "t": S("s6b") + 0.1, "v": 0.5}, {"f": "impact", "t": S("s6c") + 0.2, "v": 0.45}, {"f": "riser", "t": S("s9c") + 0.3, "v": 0.4}]
(out / "sfx.json").write_text(json.dumps(sfx, indent=1))
print("bande-son :", round(DUR, 1), "s ;", len(sfx), "effets")
