"""Voix off (Piper TTS, hors ligne) : un fichier par segment dans public/voice/,
durées dans src/generated/timings.json. Usage : PIPER=/chemin/piper npm run voice"""
import json, os, subprocess, sys, wave, hashlib, shutil
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
cfg = json.loads((ROOT / "src/config/narration.json").read_text(encoding="utf-8"))
piper = os.environ.get("PIPER") or shutil.which("piper")
if not piper: sys.exit("piper introuvable : pip install piper-tts, ou PIPER=/chemin/piper")
voice = ROOT / "cache/voices" / (cfg["voice"] + ".onnx")
if not voice.exists(): sys.exit(f"voix absente : {voice} (huggingface.co/rhasspy/piper-voices)")
out = ROOT / "public/voice"; out.mkdir(parents=True, exist_ok=True)
tmp = ROOT / "cache/tts"; tmp.mkdir(parents=True, exist_ok=True)
tm = {}
for s in cfg["segments"]:
    text = s.get("tts") or s["text"].replace("**", "")
    ls = s.get("lengthScale", cfg["lengthScale"])
    raw = tmp / (s["id"] + "-" + hashlib.sha1(f"{cfg['voice']}|{ls}|{text}".encode()).hexdigest()[:10] + ".wav")
    if not raw.exists():
        subprocess.run([piper, "-m", str(voice), "--length-scale", str(ls), "-f", str(raw)], input=text.encode(), check=True, capture_output=True)
    dst = out / f"{s['id']}.wav"
    af = ("silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
          "highpass=f=70,lowshelf=f=180:g=2,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,equalizer=f=3500:t=q:w=1:g=2")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", af, "-ar", "48000", str(dst)], check=True)
    with wave.open(str(dst)) as w: d = w.getnframes() / w.getframerate()
    tm[s["id"]] = round(d, 3); print(f"{s['id']}  {d:5.2f}s  {text}")
(ROOT / "src/generated").mkdir(exist_ok=True)
(ROOT / "src/generated/timings.json").write_text(json.dumps(tm, indent=1))
t = cfg["lead"]; 
for s in cfg["segments"]:
    if s["id"] == "s2a": print("début scène 2 :", round(t, 2), "s")
    t += tm[s["id"]] + s.get("pauseAfter", 0.3)
print("fin :", round(t, 2), "s")
