"""Cale les phrases sur les pauses de la voix (sans transcription).

Choisit, parmi les pauses détectées, les 30 qui découpent le mieux la voix
en 31 segments dont les durées suivent le nombre de syllabes de chaque phrase.
"""
import json, re, subprocess, sys

NUMBERS = {"2 000": "deux mille", "5 000": "cinq mille", "1876": "mille huit cent soixante seize",
           "400": "quatre cents", "2022": "deux mille vingt deux", "20e": "vingtième", "20": "vingt",
           "km": "kilomètres"}


def syllables(text):
    t = text.replace("**", "").lower()
    for k, v in NUMBERS.items():
        t = t.replace(k, v)
    return len(re.findall(r"[aeiouyàâéèêëîïôöùûüœ]+", t))


def pauses(audio, noise, dmin):
    err = subprocess.run(["ffmpeg", "-v", "info", "-i", audio, "-af", f"silencedetect=n={noise}dB:d={dmin}",
                          "-f", "null", "-"], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    return list(zip(st, en))


def main(audio, script, out, noise="-30", dmin="0.15"):
    lines = [l.strip() for l in open(script, encoding="utf-8") if l.strip()]
    syl = [syllables(l) for l in lines]
    ps = pauses(audio, noise, dmin)
    speech_end = ps[-1][0] if ps and ps[-1][1] >= float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", audio])) - 0.05 else None
    inner = ps[:-1] if speech_end else ps
    speech_end = speech_end or ps[-1][1]
    # Points de coupe candidats : début de la parole après chaque pause.
    cand = [(0.0, 0.0, 99.0)] + [(s, e, e - s) for s, e in inner] + [(speech_end, speech_end, 99.0)]
    n, m = len(lines), len(cand)
    rate = speech_end / sum(syl)
    INF = float("inf")
    best = [[INF] * m for _ in range(n + 1)]
    back = [[-1] * m for _ in range(n + 1)]
    best[0][0] = 0.0
    for k in range(1, n + 1):
        for j in range(1, m):
            for i in range(j):
                if best[k - 1][i] == INF:
                    continue
                dur = cand[j][0] - cand[i][1]   # parole entre deux pauses
                exp = syl[k - 1] * rate
                cost = (dur - exp) ** 2 / exp - 1.5 * min(cand[j][2], 0.5)
                if best[k - 1][i] + cost < best[k][j]:
                    best[k][j], back[k][j] = best[k - 1][i] + cost, i
    j, cuts = m - 1, []
    for k in range(n, 0, -1):
        i = back[k][j]
        cuts.append(cand[i])
        j = i
    cuts.reverse()
    starts = [c[1] for c in cuts]
    for k, (s, l) in enumerate(zip(starts, lines)):
        e = starts[k + 1] if k + 1 < n else speech_end
        print(f"{k + 1:2d}  {s:6.2f}s  ({e - s:4.1f}s, attendu {syl[k] * rate:4.1f}s)  {l.replace('**', '')}")
    print(f"fin de la voix : {speech_end:.2f}s")
    json.dump({"starts": starts, "speech_end": speech_end}, open(out, "w"), indent=1)


if __name__ == "__main__":
    main(*sys.argv[1:])
