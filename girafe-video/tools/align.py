"""Minutage mot à mot du script (tools/script.txt) sur la voix off public/voix.mp3.

Sortie : src/words.json = {"duration": durée de l'audio, "source": ..., "words": [{w, s, e, scene}]}

Trois méthodes, de la plus précise à la plus simple :
  1. "whisper" : transcription mot à mot avec faster-whisper (pip install faster-whisper ;
     le modèle est téléchargé au premier lancement), puis le script est recalé sur la transcription.
  2. "pauses"  : si la transcription est impossible, le script est réparti sur les passages parlés ;
     les changements de scène, fins de phrase et virgules sont recalés sur les pauses de la voix.
  3. "estimate": pas de voix.mp3 -> débit de parole estimé (pour travailler avant l'enregistrement).

Repères optionnels : une ligne du script peut commencer par « @12.7 » = instant (s) où ce passage
commence dans la voix (par ex. relevé sur la vidéo de lecture). Le calage sur les pauses se fait alors
bloc par bloc entre deux repères, ce qui évite toute dérive.

Passage inconnu : « {12} » = environ 12 syllabes dont le texte manque. Le temps est réservé
(aucun sous-titre ne s'affiche pendant ce passage) ; remplace-le par le vrai texte dès que possible.

Usage : python3 tools/align.py [--no-whisper]
"""
import difflib
import json
import os
import re
import subprocess
import sys
import unicodedata

AUDIO = "public/voix.mp3"
OUT = "src/words.json"


def load_script():
    words, scene = [], None
    for line in open("tools/script.txt", encoding="utf8"):
        line = line.strip()
        if line.startswith("## "):
            scene = line[3:].strip()
            continue
        anchor = None
        m = re.match(r"@([\d.]+)\s+(.*)", line)
        if m:
            anchor, line = float(m.group(1)), m.group(2)
        first = len(words)
        for tok in line.replace("« ", "«").replace(" »", "»").split():
            gap = re.fullmatch(r"\{(\d+)\}", tok)
            if gap:
                words.append({"w": "", "syl": int(gap.group(1)), "scene": scene})
            elif words and re.fullmatch(r"[?!:;]+", tok):
                words[-1]["w"] += " " + tok  # ponctuation française collée au mot
            else:
                words.append({"w": tok.replace("«", "« ").replace("»", " »"), "scene": scene})
        if anchor is not None and len(words) > first:
            words[first]["anchor"] = anchor
    return words


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))


def syllables(w):
    if isinstance(w, dict):
        return w["syl"] if "syl" in w else syllables(w["w"])
    return max(1, len(re.findall(r"[aeiouyàâéèêëîïôûùœ]+", w.lower()))) + (2 if re.search(r"\d", w) else 0)


def level(words, i):
    """Importance de la coupure après le mot i (3 = changement de scène)."""
    if i + 1 < len(words) and words[i + 1]["scene"] != words[i]["scene"]:
        return 3
    w = words[i]["w"]
    if re.search(r"[.!?…]$", w):
        return 2
    if re.search(r"[,:;]$", w):
        return 1
    return 0


# ---------- 1. transcription ----------

def whisper_times(words):
    from faster_whisper import WhisperModel

    model = WhisperModel(os.environ.get("WHISPER_MODEL", "small"), device="cpu", compute_type="int8")
    segs, _ = model.transcribe(AUDIO, language="fr", word_timestamps=True)
    heard = [(norm(w.word), w.start, w.end) for s in segs for w in s.words]
    heard = [h for h in heard if h[0]]
    a = [norm(w["w"]) for w in words]
    sm = difflib.SequenceMatcher(a=a, b=[h[0] for h in heard], autojunk=False)
    times = [None] * len(words)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            _, s, e = heard[blk.b + k]
            times[blk.a + k] = (s, e)
    # mots non reconnus : interpolés entre leurs voisins
    known = [i for i, x in enumerate(times) if x]
    if not known:
        raise RuntimeError("transcription inutilisable")
    for i in range(len(times)):
        if times[i] is None:
            prev = max([k for k in known if k < i], default=None)
            nxt = min([k for k in known if k > i], default=None)
            s = times[prev][1] if prev is not None else 0.0
            e = times[nxt][0] if nxt is not None else s + 0.4
            span = (nxt if nxt is not None else len(times)) - (prev if prev is not None else -1)
            pos = i - (prev if prev is not None else -1)
            t0 = s + (e - s) * (pos - 1) / span
            times[i] = (t0, s + (e - s) * pos / span)
    return times


# ---------- 2. pauses de la voix ----------

def silences():
    log = subprocess.run(["ffmpeg", "-hide_banner", "-i", AUDIO, "-af", "silencedetect=noise=-32dB:d=0.12", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    starts = re.findall(r"silence_start: ([\d.]+)", log)
    ends = re.findall(r"silence_end: ([\d.]+)", log)
    return [(float(a), float(b)) for a, b in zip(starts, ends)]


def pause_times(words, dur):
    sil = silences()

    def speech(a, b):
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

    def place(ws, a, b):
        segs = speech(a, b)
        total = sum(y - x for x, y in segs)
        wt = [syllables(w) + 0.3 for w in ws]
        k = total / sum(wt)

        def at(tt):
            for x, y in segs:
                if tt <= y - x:
                    return x + tt
                tt -= y - x
            return segs[-1][1]

        out, acc = [], 0.0
        for v in wt:
            out.append((at(acc), at(acc + v * k)))
            acc += v * k
        return out

    window = {3: 3.0, 2: 1.2, 1: 0.8}

    def align(ws, a, b):
        if not ws:
            return []
        est = place(ws, a, b)
        for lv in (3, 2, 1):
            best = None
            for i in range(len(ws) - 1):
                if level(ws, i) != lv:
                    continue
                t = est[i][1]
                for s, e in sil:
                    if a + 0.2 < s and e < b - 0.2 and abs(s - t) < window[lv]:
                        score = (e - s) - 0.25 * abs(s - t)
                        if best is None or score > best[0]:
                            best = (score, i, s, e)
            if best:
                _, i, s, e = best
                return align(ws[: i + 1], a, s) + align(ws[i + 1:], e, b)
        return est

    lead = sil[0][1] if sil and sil[0][0] < 0.05 else 0.0
    tail = sil[-1][0] if sil and sil[-1][1] > dur - 0.05 else dur
    # découpe en blocs aux repères « @temps », puis calage de chaque bloc
    cuts = [i for i, w in enumerate(words) if "anchor" in w and i > 0]
    bounds = [0] + cuts + [len(words)]
    times = []
    for a, b in zip(bounds, bounds[1:]):
        t0 = max(lead, words[a].get("anchor", lead))
        t1 = words[b]["anchor"] if b < len(words) else tail
        times += align(words[a:b], t0, t1)
    return times


# ---------- 3. estimation ----------

def estimate_times(words):
    t, out = 0.4, []
    for i, w in enumerate(words):
        d = syllables(w) * 0.12 + 0.05
        out.append((t, t + d))
        t += d + {3: 0.8, 2: 0.45, 1: 0.2, 0: 0.03}[level(words, i)]
    return out


def main():
    words = load_script()
    if os.path.exists(AUDIO):
        dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", AUDIO],
                                   capture_output=True, text=True).stdout)
        times, source = None, None
        if "--no-whisper" not in sys.argv:
            try:
                times, source = whisper_times(words), "whisper"
            except Exception as err:  # pas de faster-whisper ou modèle inaccessible
                print(f"Transcription impossible ({type(err).__name__}) : calage sur les pauses de la voix.")
        if times is None:
            times, source = pause_times(words, dur), "pauses"
    else:
        times, source = estimate_times(words), "estimate"
        dur = None
    out = [{"w": w["w"], "s": round(s, 2), "e": round(e, 2), "scene": w["scene"]} for w, (s, e) in zip(words, times)]
    json.dump({"duration": dur, "source": source, "words": out}, open(OUT, "w", encoding="utf8"), ensure_ascii=False, indent=0)
    print(f"{len(out)} mots, source = {source}, durée = {dur if dur else out[-1]['e']:.2f} s")
    scene = None
    for w in out:
        if w["scene"] != scene:
            scene = w["scene"]
            print(f"  {scene:<11} {w['s']:6.2f} s  « {w['w']} … »")


if __name__ == "__main__":
    main()
