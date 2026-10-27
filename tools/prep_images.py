"""Retouches des images avant montage (écrit dans build/images/)."""
import os, shutil, sys
import numpy as np
from PIL import Image, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
for f in os.listdir(src):
    shutil.copy(os.path.join(src, f), os.path.join(dst, f))

# Image 1 : efface « Hmm? » en le recouvrant du fond environnant.
im = Image.open(os.path.join(src, "1.jpg")).convert("RGB")
a = np.asarray(im).astype(float)
x0, y0, x1, y1 = 386, 310, 520, 370
ring = np.concatenate([a[y0 - 12:y0, x0:x1].reshape(-1, 3), a[y1:y1 + 12, x0:x1].reshape(-1, 3)])
a[y0:y1, x0:x1] = np.median(ring, axis=0)
patch = Image.fromarray(a.astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
out = Image.fromarray(a.astype(np.uint8))
out.paste(patch.crop((x0 - 4, y0 - 4, x1 + 4, y1 + 4)), (x0 - 4, y0 - 4))
out.save(os.path.join(dst, "1.jpg"), quality=95)

# Image 23 : garde uniquement le fond sombre, sans le cadre blanc.
im = Image.open(os.path.join(src, "23.jpg")).convert("RGB")
g = np.asarray(im.convert("L"))
ys, xs = np.where(g < 60)
m = 6  # marge pour retirer le trait du cadre
im.crop((xs.min() + m, ys.min() + m, xs.max() - m, ys.max() - m)).save(os.path.join(dst, "23.jpg"), quality=95)
