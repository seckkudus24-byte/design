#!/usr/bin/env bash
# Vérification technique d'un rendu : bash scripts/verify.sh out/kaliningrad_prototype.mp4
set -euo pipefail
F="${1:-out/kaliningrad_prototype.mp4}"
echo "== Fichier : $F ($(du -h "$F" | cut -f1))"
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=codec_name,profile,width,height,sample_aspect_ratio,display_aspect_ratio,pix_fmt,r_frame_rate,avg_frame_rate,nb_read_frames -of default=nw=1 "$F"
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels -of default=nw=1 "$F"
ffprobe -v error -show_entries format=duration,bit_rate -of default=nw=1 "$F"
echo "== Images noires (aucune ligne = aucune) :"
ffmpeg -hide_banner -i "$F" -vf blackdetect=d=0.05:pix_th=0.06 -an -f null - 2>&1 | grep black_start || true
echo "== Sonie intégrée :"
ffmpeg -hide_banner -i "$F" -af ebur128 -vn -f null - 2>&1 | grep -E "^\s+I:" || true
echo "== Fluidité (écart moyen de luminance d'une image à l'autre) :"
ffmpeg -v error -i "$F" -vf "scale=270:480,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-" -an -f null - 2>/dev/null \
  | grep -oE "YAVG=[0-9.]+" | cut -d= -f2 | python3 -c "
import sys, statistics as s
d=[float(x) for x in sys.stdin]
print(f'médiane {s.median(d):.2f} · max {max(d):.2f} · pics > 2,5×médiane+1,5 : {[i+1 for i,v in enumerate(d) if v>2.5*s.median(d)+1.5]}')"
