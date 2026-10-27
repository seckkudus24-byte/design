"""Construit timeline.json : textes + débuts de phrase calés sur la voix.

Les repères approximatifs viennent des sous-titres incrustés dans la vidéo source
(ou, entre deux sous-titres, d'une lecture des pauses). Chacun est recalé sur la
fin de pause la plus proche (début réel de la parole), à ±0,3 s.
"""
import json, re, subprocess, sys

# Repère approximatif du début de chaque phrase (s), même ordre que script.txt.
CUES = [0.0, 6.1, 9.467, 11.567, 14.5, 17.633, 20.233, 22.1, 25.1, 27.367, 30.133, 32.73, 36.133,
        38.633, 41.967, 43.9, 45.7, 48.533, 51.033, 53.5, 56.1, 58.867, 62.7, 65.467, 68.8, 71.433,
        73.01, 74.767, 76.54, 77.933, 79.267]
WHIPS = {6, 11, 16, 21, 26}  # whip pan à l'entrée de ces images (5-6, 10-11, ...)
FLASHES = [9, 14]  # flash blanc à l'entrée de ces images


def pause_ends(audio):
    err = subprocess.run(["ffmpeg", "-v", "info", "-i", audio, "-af", "silencedetect=n=-30dB:d=0.06",
                          "-f", "null", "-"], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    return st, en


def main(audio, script, images, out):
    lines = [l.strip() for l in open(script, encoding="utf-8") if l.strip()]
    assert len(lines) == len(CUES), (len(lines), len(CUES))
    st, en = pause_ends(audio)
    shots = []
    for i, (cue, text) in enumerate(zip(CUES, lines)):
        near = [e for e in en if abs(e - cue) <= 0.3]
        start = 0.0 if i == 0 else (min(near, key=lambda e: abs(e - cue)) if near else cue)
        # Espaces insécables dans les nombres (« 2 000 », « 5 000 KM »).
        text = re.sub(r"(\d) (\d{3})", "\\1\u00a0\\2", text).replace("000 km", "000\u00a0km")
        # Espace insécable avant ? : ! (typographie française, pas de ponctuation seule en début de ligne).
        text = re.sub(r" ([?:!])", "\u00a0\\1", text)
        shots.append({"image": f"{images}/{i + 1}.jpg", "start": round(start, 3), "text": text,
                      "whip_in": (i + 1) in WHIPS})
        print(f"{i + 1:2d}  {start:6.2f}s  (repère {cue:6.2f})  {text}")
    speech_end = st[-1]
    json.dump({"audio": audio, "speech_end": speech_end, "flashes": FLASHES, "shots": shots},
              open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"fin de la voix : {speech_end:.2f}s")


if __name__ == "__main__":
    main(*sys.argv[1:])
