"""Cherche des traces de texte chinois dans une vidéo nettoyée.

  python tests/residual_ocr.py resultat.mp4 [--step 6] [--min-score 0.3]

L'OCR est relancé avec un seuil plus bas que pour la détection (0,3 au lieu de
0,5) afin de repérer aussi des restes partiels ou estompés.
"""
import argparse
import json
import sys

sys.path.insert(0, __file__.rsplit("/tests/", 1)[0])
from d2f.detect import SubtitleDetector  # noqa: E402
from d2f.video_io import FrameReader, probe  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--step", type=int, default=6)
    ap.add_argument("--min-score", type=float, default=0.3)
    a = ap.parse_args()
    info = probe(a.video)
    det = SubtitleDetector(min_score=a.min_score)
    hits, checked = [], 0
    with FrameReader(info) as r:
        for i, f in enumerate(r):
            if i % a.step:
                continue
            checked += 1
            for b in det.detect(f):
                hits.append({"frame": i, "t": round(i / info.fps_float, 2), "text": b.text,
                             "score": round(b.score, 2), "box": [b.x0, b.y0, b.x1, b.y1]})
    print(json.dumps({"frames_checked": checked, "frames_with_chinese": len({h["frame"] for h in hits}),
                      "detections": hits}, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
