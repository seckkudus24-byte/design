"""Aligne le script (tools/script.txt) sur public/voix.mp3, mot par mot.

Chaque ligne du script commence par l'instant (s) où le bloc démarre dans la voix.
Dans un bloc, les mots sont répartis sur les passages parlés (les silences sont
sautés) en proportion de leur nombre de syllabes ; chaque fin de phrase ou de
virgule est recalée sur la pause de la voix la plus proche.
Sortie : src/subtitles.json  [{"w": mot, "s": début, "e": fin}, ...]
Usage : python3 tools/align_subs.py
"""
import json
import re
import subprocess

AUDIO = "public/voix.mp3"
SNAP = 0.9  # écart max (s) pour recaler une ponctuation sur une pause

dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", AUDIO],
                           capture_output=True, text=True).stdout)
log = subprocess.run(["ffmpeg", "-hide_banner", "-i", AUDIO, "-af", "silencedetect=noise=-32dB:d=0.12", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
sil = [(float(a), float(b)) for a, b in zip(re.findall(r"silence_start: ([\d.]+)", log), re.findall(r"silence_end: ([\d.]+)", log))]

blocks = []
for line in open("tools/script.txt", encoding="utf8"):
    if "|" in line:
        t, txt = line.split("|", 1)
        blocks.append((float(t), txt.strip()))


def speech(a, b):
    """Passages parlés entre a et b."""
    segs, cur = [], a
    for s, e in sil:
        if e <= a or s >= b:
            continue
        if s > cur:
            segs.append((cur, min(s, b)))
        cur = max(cur, e)
    if cur < b:
        segs.append((cur, b))
    return [(x, y) for x, y in segs if y - x > 0.05] or [(a, b)]


def weight(w):
    return max(1, len(re.findall(r"[aeiouyàâéèêëîïôûùœ]+", w.lower()))) + 0.3


def place(words, a, b):
    """Répartition proportionnelle sur le temps parlé ; renvoie [(s, e)]."""
    segs = speech(a, b)
    total = sum(y - x for x, y in segs)
    ws = [weight(w) for w in words]
    k = total / sum(ws)

    def at(t):  # temps parlé cumulé -> temps réel
        for x, y in segs:
            if t <= y - x:
                return x + t
            t -= y - x
        return segs[-1][1]

    out, acc = [], 0.0
    for wt in ws:
        out.append((at(acc), at(acc + wt * k)))
        acc += wt * k
    return out


def align(words, a, b):
    if not words:
        return []
    est = place(words, a, b)
    best = None
    for i, w in enumerate(words[:-1]):
        if not re.search(r"[.,:;!?…]$", w):
            continue
        t = est[i][1]
        for s, e in sil:
            if a + 0.3 < s and e < b - 0.3 and abs(s - t) < SNAP and (best is None or abs(s - t) < best[0]):
                best = (abs(s - t), i, s, e)
    if best is None:
        return est
    _, i, s, e = best
    return align(words[: i + 1], a, s) + align(words[i + 1:], e, b)


out = []
for n, (t, txt) in enumerate(blocks):
    end = blocks[n + 1][0] if n + 1 < len(blocks) else dur
    words = []
    for tok in txt.replace("« ", "«").replace(" »", "»").split():
        if words and re.fullmatch(r"[?!:;]+", tok):
            words[-1] += "\u00a0" + tok  # ponctuation française : reste collée au mot
        else:
            words.append(tok)
    for w, (s, e) in zip(words, align(words, t, end)):
        out.append({"w": w.replace("«", "« ").replace("»", " »"), "s": round(s, 2), "e": round(e, 2)})

json.dump(out, open("src/subtitles.json", "w", encoding="utf8"), ensure_ascii=False, indent=0)
print(f"{len(out)} mots alignés")
