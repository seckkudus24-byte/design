"""Piste audio finale : voix normalisée à -14 LUFS (gain constant) + effets sonores synthétisés.

Les effets sont placés d'après timeline.json et réglés environ 18 dB sous la voix
(plus bas pour le pop et le tic-tac, qui doivent rester discrets).
"""
import json, re, subprocess, sys, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def env(n, attack, release):
    e = np.ones(n)
    a, r = int(attack * SR), int(release * SR)
    if a:
        e[:a] = np.linspace(0, 1, a)
    if r:
        e[-r:] *= np.exp(-np.linspace(0, 6, r))
    return e


def lowpass(x, cutoff):
    # Filtre passe-bas un pôle, appliqué deux fois.
    k = np.exp(-2 * np.pi * cutoff / SR)
    for _ in range(2):
        y = np.empty_like(x)
        acc = 0.0
        for i, v in enumerate(x):
            acc = (1 - k) * v + k * acc
            y[i] = acc
        x = y
    return x


def whoosh(d=0.45):
    n = int(d * SR)
    t = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    # Bruit filtré dont la brillance monte puis redescend.
    bright = noise - lowpass(noise, 300)
    dark = lowpass(noise, 900)
    sweep = np.sin(np.pi * t) ** 2
    return (dark * (1 - sweep) + bright * sweep) * np.sin(np.pi * t) ** 1.5


def pop(d=0.07):
    n = int(d * SR)
    t = np.arange(n) / SR
    f = 900 * np.exp(-t * 40) + 300
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 60)


def ding(d=1.2):
    n = int(d * SR)
    t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * 1318 * h * t) for h, a in ((1, 1), (2.76, 0.4), (5.4, 0.15)))
    return s * np.exp(-t * 4) * env(n, 0.003, 0)


def buzz(d=0.45):
    n = int(d * SR)
    t = np.arange(n) / SR
    sq = np.sign(np.sin(2 * np.pi * 110 * t)) + 0.5 * np.sign(np.sin(2 * np.pi * 116 * t))
    return lowpass(sq, 2500) * env(n, 0.01, 0.08)


def tick():
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    return (rng.standard_normal(n) * 0.5 + np.sin(2 * np.pi * 2500 * t)) * np.exp(-t * 300)


def ticktock(d):
    out = np.zeros(int(d * SR))
    for k, s in enumerate(np.arange(0, d - 0.05, 0.5)):
        c = tick() * (1.0 if k % 2 == 0 else 0.7)
        i = int(s * SR)
        out[i:i + len(c)] += c[:len(out) - i]
    return out


def rumble(d):
    n = int(d * SR)
    t = np.arange(n) / SR
    base = lowpass(rng.standard_normal(n), 80) * 8 + 0.6 * np.sin(2 * np.pi * 45 * t)
    return base * env(n, min(0.6, d / 3), min(0.8, d / 3))


def beep():
    out = np.zeros(int(0.5 * SR))
    for s in (0.0, 0.22):
        n = int(0.12 * SR)
        t = np.arange(n) / SR
        b = np.sin(2 * np.pi * 1760 * t) * env(n, 0.005, 0.03)
        i = int(s * SR)
        out[i:i + n] += b
    return out


def rms(x):
    return np.sqrt(np.mean(x ** 2) + 1e-12)


def read_wav(path):
    with wave.open(path) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
        return a.reshape(-1, w.getnchannels()).mean(axis=1)


def main(timeline, out_wav, work="build"):
    tl = json.load(open(timeline, encoding="utf-8"))
    shots, audio = tl["shots"], tl["audio"]
    end = tl["speech_end"] + 1.5 + 0.5  # 1,5 s de tenue puis 0,5 s de fondu au noir

    # Voix amenée à -14 LUFS par un gain constant ; un limiteur rapide ne rabote que
    # les quelques crêtes qui dépasseraient -1 dBTP (pas de compression du reste).
    probe = subprocess.run(["ffmpeg", "-hide_banner", "-i", audio, "-af", "ebur128", "-f", "null", "-"],
                           capture_output=True, text=True).stderr
    measured = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", probe)[-1])
    voice_wav = f"{work}/voix_norm.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", audio, "-af",
                    f"aresample={SR * 4},volume={-14 - measured:.2f}dB,"
                    f"alimiter=limit=0.891:attack=0.5:release=40:level=false,aresample={SR}",
                    "-ac", "1", "-c:a", "pcm_s16le", voice_wav], check=True)
    voice = read_wav(voice_wav)
    voice_level = rms(voice[np.abs(voice) > 0.02])  # niveau pendant la parole

    sfx = np.zeros(int(end * SR) + SR)

    def place(sound, t, db):
        sound = sound / rms(sound) * voice_level * 10 ** (db / 20)
        i = max(0, int(t * SR))
        sfx[i:i + len(sound)] += sound[:len(sfx) - i]

    starts = [s["start"] for s in shots]
    ends = starts[1:] + [tl["speech_end"]]
    for i, s in enumerate(shots):
        n = i + 1
        place(pop(), s["start"], -28)
        if s.get("whip_in"):
            place(whoosh(), s["start"] - 0.25, -18)
        if n in (9, 14):
            place(ding(), s["start"], -18)
        if n in (2, 8, 24):
            place(buzz(), s["start"], -20)
        if n == 3:
            place(ticktock(ends[i] - s["start"]), s["start"], -24)
        if n in (16, 23):
            place(rumble(ends[i] - s["start"] + 0.3), s["start"], -18)
        if n == 21:
            place(beep(), s["start"], -20)

    mix = sfx[:int(end * SR)].copy()
    mix[:len(voice)] += voice[:len(mix)]
    peak = np.max(np.abs(mix))
    if peak > 0.98:  # sécurité anti-saturation (ne touche que les effets)
        mix = sfx[:int(end * SR)] * (0.98 - np.max(np.abs(voice))) / np.max(np.abs(sfx)) * 0.9
        mix[:len(voice)] += voice[:len(mix)]
    pcm = np.repeat((np.clip(mix, -1, 1) * 32767).astype(np.int16), 2)  # stéréo (voix identique L/R)
    with wave.open(out_wav, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"audio -> {out_wav} ({end:.2f}s)")


if __name__ == "__main__":
    main(*sys.argv[1:])
