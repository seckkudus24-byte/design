"""Fusionne une tuile satellite (JPG) et sa tuile d'ombrage du relief (PNG RGBA) en un JPG.
Usage : python3 -I scripts/compose.py sat.jpg shade.png sortie.jpg"""
import sys
from PIL import Image
sat = Image.open(sys.argv[1]).convert("RGBA")
shade = Image.open(sys.argv[2]).convert("RGBA").resize(sat.size, Image.BILINEAR)
Image.alpha_composite(sat, shade).convert("RGB").save(sys.argv[3], quality=92)
