"""Voix off française (Piper TTS, hors ligne).

Lit src/config/narration.json, synthétise une phrase par fichier dans public/voice/,
et écrit src/generated/timings.json (durée de chaque phrase) qui cale toute la vidéo.
Usage : npm run voice   (ou PIPER=/chemin/vers/piper npm run voice)
"""
import json, os, subprocess, sys, wave, hashlib, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
cfg = json.loads((ROOT / "src/config/narration.json").read_text(encoding="utf-8"))
piper = os.environ.get("PIPER") or shutil.which("piper")
if not piper:
    sys.exit("piper introuvable : pip install piper-tts, ou définir PIPER=/chemin/piper")
voice = ROOT / "cache/voices" / (cfg["voice"] + ".onnx")
if not voice.exists():
    sys.exit(f"voix absente : {voice} (télécharger depuis huggingface.co/rhasspy/piper-voices)")

out = ROOT / "public/voice"; out.mkdir(parents=True, exist_ok=True)
tmp = ROOT / "cache/tts"; tmp.mkdir(parents=True, exist_ok=True)
timings = {}
for line in cfg["lines"]:
    text = line.get("tts") or line["text"].replace("**", "")
    ls = line.get("lengthScale", cfg["lengthScale"])
    key = hashlib.sha1(f"{cfg['voice']}|{ls}|{text}".encode()).hexdigest()[:10]
    raw = tmp / f"{line['id']}-{key}.wav"
    if not raw.exists():
        subprocess.run([piper, "-m", str(voice), "--length-scale", str(ls), "-f", str(raw)],
                       input=text.encode(), check=True, capture_output=True)
    dst = out / f"{line['id']}.wav"
    # Nettoyage : coupe les silences de début/fin, filtre passe-haut, compression légère.
    af = ("silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
          "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
          "highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,"
          "equalizer=f=3500:t=q:w=1:g=2.5")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", af, "-ar", "48000", str(dst)], check=True)
    with wave.open(str(dst)) as w:
        d = w.getnframes() / w.getframerate()
    timings[line["id"]] = round(d, 3)
    print(f"{line['id']}  {d:5.2f}s  {text}")

gen = ROOT / "src/generated"; gen.mkdir(exist_ok=True)
(gen / "timings.json").write_text(json.dumps(timings, indent=1))
print("total parole :", round(sum(timings.values()), 2), "s")
