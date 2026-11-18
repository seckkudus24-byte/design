"""Tuile d'ombrage du relief (hillshade) précalculée à partir des tuiles d'altitude terrarium.
Usage : python3 -I scripts/shade.py z x y dossier_dem sortie.png
Entrée : 3×3 tuiles DEM (z/x/y.png) déjà en cache. Sortie : PNG RGBA (ombres noires,
lumières blanches, transparence ailleurs), superposé à l'imagerie satellite."""
import sys, math
from pathlib import Path
import numpy as np
from PIL import Image

z, x, y = map(int, sys.argv[1:4]); dem_dir = Path(sys.argv[4]); out = sys.argv[5]
n = 2 ** z

def elev(tx, ty):
    tx %= n
    p = dem_dir / f"{z}/{tx}/{ty}.png"
    if ty < 0 or ty >= n or not p.exists():
        return None
    a = np.asarray(Image.open(p).convert("RGB"), dtype=np.float64)
    return a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768

c = elev(x, y)
if c is None:
    Image.new("RGBA", (256, 256)).save(out); sys.exit(0)
big = np.zeros((258, 258))
big[1:-1, 1:-1] = c
for dx, dy in [(-1, -1), (0, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (0, 1), (1, 1)]:
    e = elev(x + dx, y + dy)
    if e is None:
        continue
    sy = slice(1, -1) if dy == 0 else (slice(0, 1) if dy < 0 else slice(-1, None))
    sx = slice(1, -1) if dx == 0 else (slice(0, 1) if dx < 0 else slice(-1, None))
    ey = slice(None) if dy == 0 else (slice(-1, None) if dy < 0 else slice(0, 1))
    ex = slice(None) if dx == 0 else (slice(-1, None) if dx < 0 else slice(0, 1))
    big[sy, sx] = e[ey, ex]
# bords sans voisin : recopie
big[0, :] = np.where(big[0, :] == 0, big[1, :], big[0, :]); big[-1, :] = np.where(big[-1, :] == 0, big[-2, :], big[-1, :])
big[:, 0] = np.where(big[:, 0] == 0, big[:, 1], big[:, 0]); big[:, -1] = np.where(big[:, -1] == 0, big[:, -2], big[:, -1])
big = np.maximum(big, 0)  # la mer reste plate

lat = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * (y + 0.5) / n))))
mpp = 40075016.686 * math.cos(math.radians(lat)) / (256 * n)
# exagération croissante aux petits zooms (relief lisible à l'échelle d'un pays)
exag = max(2.0, min(14.0, 2.0 + (10 - z) * 2.2))
dzdx = (big[1:-1, 2:] - big[1:-1, :-2]) / (2 * mpp) * exag
dzdy = (big[2:, 1:-1] - big[:-2, 1:-1]) / (2 * mpp) * exag
slope = np.arctan(np.hypot(dzdx, dzdy))
aspect = np.arctan2(dzdy, -dzdx)
alt, az = math.radians(40), math.radians(315)
zen = math.pi / 2 - alt
shade = math.cos(zen) * np.cos(slope) + math.sin(zen) * np.sin(slope) * np.cos(az - math.pi / 2 - aspect)
d = shade - math.cos(zen)
rgba = np.zeros((256, 256, 4), dtype=np.uint8)
dark = d < 0
rgba[..., 3] = np.clip(np.where(dark, -d * 520, d * 300), 0, 200).astype(np.uint8)
rgba[~dark, 0:3] = 255
Image.fromarray(rgba, "RGBA").save(out, optimize=True)
