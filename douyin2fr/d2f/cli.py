"""Ligne de commande.

  python -m d2f.cli analyze  video.mp4  [--stride 3]           -> video.analysis.json + aperçus
  python -m d2f.cli clean    video.mp4  -o propre.mp4 [--method temporal]
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time

from .pipeline import METHODS, Analysis, analyze, clean, preview_frames


_last = [0.0]


def _progress(stage, p, msg):
    if p < 1.0 and time.time() - _last[0] < 0.5:
        return
    _last[0] = time.time()
    sys.stderr.write(f"\r[{stage}] {p * 100:5.1f}%  {msg[:50]:<50}")
    sys.stderr.flush()
    if p >= 1.0:
        sys.stderr.write("\n")


def main(argv=None):
    ap = argparse.ArgumentParser(prog="d2f", description="Suppression des sous-titres chinois incrustés")
    ap.add_argument("--models", default=os.environ.get("D2F_MODELS", "models"))
    sub = ap.add_subparsers(dest="cmd", required=True)

    a = sub.add_parser("analyze", help="détecter les sous-titres")
    a.add_argument("video")
    a.add_argument("--stride", type=int, default=3, help="OCR une image sur N (défaut 3)")
    a.add_argument("--all-text", action="store_true", help="effacer tout texte, pas seulement le chinois")
    a.add_argument("--region", help="zone relative x0,y0,x1,y1 (ex. 0,0.3,1,0.9)")
    a.add_argument("--previews", default=None, help="dossier des images d'aperçu")

    c = sub.add_parser("clean", help="supprimer les sous-titres (analyse automatique si besoin)")
    c.add_argument("video")
    c.add_argument("-o", "--output", required=True)
    c.add_argument("--analysis", help="fichier .analysis.json existant")
    c.add_argument("--method", default="temporal", choices=list(METHODS))
    c.add_argument("--stride", type=int, default=3)
    c.add_argument("--crf", type=int, default=16)
    c.add_argument("--resolution", default="auto", choices=["auto", "1080p", "source"],
                   help="auto = 1080p minimum (défaut) ; 1080p = petit côté 1080 ; source = inchangé")

    args = ap.parse_args(argv)
    region = tuple(map(float, args.region.split(","))) if getattr(args, "region", None) else None
    if args.cmd == "analyze":
        res = analyze(args.video, args.models, args.stride, not args.all_text, region, _progress)
        path = os.path.splitext(args.video)[0] + ".analysis.json"
        res.save(path)
        print(json.dumps(res.summary(), ensure_ascii=False, indent=1))
        print(f"Analyse : {path} ({res.seconds:.1f} s)")
        if args.previews:
            for p in preview_frames(res, args.previews):
                print(p)
    else:
        if args.analysis:
            res = Analysis.load(args.analysis)
        else:
            res = analyze(args.video, args.models, args.stride, progress=_progress)
            res.save(os.path.splitext(args.output)[0] + ".analysis.json")
        t = time.time()
        stats = clean(res, args.output, args.method, args.models, args.crf, _progress,
                      resolution=args.resolution)
        print(json.dumps(stats, indent=1))
        print(f"Vidéo nettoyée : {args.output} ({time.time() - t:.1f} s)")


if __name__ == "__main__":
    from .video_io import VideoError
    try:
        main()
    except VideoError as e:
        sys.stderr.write(f"\nErreur : {e}\n")
        sys.exit(2)
