"""Contrôle de synchronisation voix / sous-titres : transcrit la bande-son finale (Whisper)
et compare le début de chaque phrase entendue au début du sous-titre correspondant (.srt).
Usage : python check_sync.py video.mp4 sous-titres.srt"""
import sys, re, subprocess, difflib
import numpy as np
from faster_whisper import WhisperModel
vid, srt = sys.argv[1], sys.argv[2]
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", vid, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
m = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = m.transcribe(a, language="fr", word_timestamps=True)
words = [(w.start, w.word.strip().lower()) for s in segs for w in s.words]
def t2s(x): h, mi, rest = x.split(":"); se, ms = rest.split(","); return int(h) * 3600 + int(mi) * 60 + int(se) + int(ms) / 1000
subs = []
for blk in open(srt, encoding="utf-8").read().strip().split("\n\n"):
    l = blk.split("\n"); a0 = t2s(l[1].split(" --> ")[0]); subs.append((a0, " ".join(l[2:])))
norm = lambda s: re.sub(r"[^a-zàâçéèêëîïôûùüÿœ0-9 ]", "", s.lower())
ecarts = []
for st, txt in subs:
    first = norm(txt).split()[:2]
    cand = [(abs(ws - st), ws) for ws, w in words if first and difflib.SequenceMatcher(None, norm(w), first[0]).ratio() > 0.7 and abs(ws - st) < 2.5]
    if cand:
        d, ws = min(cand); ecarts.append(ws - st)
        print(f"{st:7.2f}s  sous-titre | voix {ws:7.2f}s  écart {ws - st:+.2f}s  {txt[:50]}")
    else:
        print(f"{st:7.2f}s  sous-titre | voix non retrouvée  {txt[:50]}")
if ecarts:
    e = np.array(ecarts); print(f"\n{len(e)}/{len(subs)} phrases retrouvées · écart médian {np.median(e):+.2f}s · max {np.max(np.abs(e)):.2f}s")
