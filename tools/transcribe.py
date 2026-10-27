import json, sys
from faster_whisper import WhisperModel
src, out = sys.argv[1], sys.argv[2]
model = WhisperModel("medium", device="cpu", compute_type="int8")
segs, info = model.transcribe(src, language="fr", word_timestamps=True, vad_filter=False)
words = []
for s in segs:
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text}")
    for w in s.words:
        words.append({"w": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})
json.dump(words, open(out, "w"), ensure_ascii=False, indent=1)
