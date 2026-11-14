"""Mesure objective de la suppression avec une vérité terrain.

  python tests/evaluate.py propre.mp4 soustitree.mp4 analysis.json [resultat.mp4 ...]

- Couverture du masque : % des pixels modifiés par le texte incrusté qui sont
  bien dans le masque (100 % = aucun caractère oublié).
- PSNR / erreur moyenne dans la zone du texte entre le résultat et la vidéo
  propre d'origine (plus haut = plus fidèle).
- Option --window=10 : erreur par tranche de 10 s (qualité constante du début à la fin ?).
- Scintillement : variation image à image dans la zone reconstruite, comparée
  à celle de la vidéo propre (1.0 = aussi stable que l'original).
"""
import json
import sys

import cv2
import numpy as np

sys.path.insert(0, __file__.rsplit("/tests/", 1)[0])
from d2f.pipeline import Analysis  # noqa: E402
from d2f.video_io import FrameReader, probe  # noqa: E402


def frames(path):
    return iter(FrameReader(probe(path)))


def main():
    args = sys.argv[1:]
    window = 0
    if args and args[0].startswith("--window="):
        window = float(args.pop(0).split("=", 1)[1])  # secondes
    clean_p, sub_p, an_p, *results = args
    fps = probe(clean_p).fps_float
    per_win = {r: {} for r in results}
    mb = Analysis.load(an_p).mask_builder()
    gens = [frames(clean_p), frames(sub_p)] + [frames(r) for r in results]
    cover_hit = cover_tot = 0
    acc = {r: {"se": 0.0, "ae": 0.0, "n": 0, "flk": 0.0, "flk_ref": 0.0} for r in results}
    prev = None
    i = 0
    while True:
        fs = [next(g, None) for g in gens]
        if any(f is None for f in fs):
            break
        c, s, outs = fs[0], fs[1], fs[2:]
        diff = np.abs(c.astype(np.int16) - s.astype(np.int16)).max(2)
        text = diff > 30
        m = mb.mask(i) > 0
        cover_hit += int((text & m).sum())
        cover_tot += int(text.sum())
        if m.any():
            for r, o in zip(results, outs):
                d = c.astype(np.float32)[m] - o.astype(np.float32)[m]
                acc[r]["se"] += float((d ** 2).sum())
                acc[r]["ae"] += float(np.abs(d).sum())
                acc[r]["n"] += d.size
                if window:
                    w = int(i / fps // window)
                    pw = per_win[r].setdefault(w, [0.0, 0])
                    pw[0] += float(np.abs(d).sum())
                    pw[1] += d.size
                if prev is not None:
                    pc, po = prev[0], prev[1:]
                    acc[r]["flk"] += float(np.abs(o.astype(np.float32)[m] - po[results.index(r)].astype(np.float32)[m]).mean())
                    acc[r]["flk_ref"] += float(np.abs(c.astype(np.float32)[m] - pc.astype(np.float32)[m]).mean())
        prev = [c] + outs
        i += 1
    rep = {"frames": i, "mask_coverage_%": round(100 * cover_hit / max(1, cover_tot), 3),
           "text_pixels_missed": cover_tot - cover_hit}
    for r in results:
        a = acc[r]
        mse = a["se"] / max(1, a["n"])
        rep[r] = {"psnr_in_mask_dB": round(10 * np.log10(255 ** 2 / max(mse, 1e-6)), 2),
                  "mean_abs_err": round(a["ae"] / max(1, a["n"]), 2),
                  "flicker_ratio": round(a["flk"] / max(1e-6, a["flk_ref"]), 2)}
        if window:
            rep[r]["mean_abs_err_per_window"] = {
                f"{int(w * window)}s": round(v[0] / max(1, v[1]), 2) for w, v in sorted(per_win[r].items())}
    print(json.dumps(rep, indent=1))


if __name__ == "__main__":
    main()
