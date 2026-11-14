"""Vidéo de comparaison côte à côte (original | nettoyé), avec le son d'origine.

  python tests/make_comparison.py original.mp4 nettoye.mp4 comparaison.mp4 [--height 960]
  python tests/make_comparison.py original.mp4 nettoye.mp4 zoom.mp4 --crop x,y,w,h   # zoom sur une zone
"""
import argparse
import subprocess


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("orig")
    ap.add_argument("clean")
    ap.add_argument("out")
    ap.add_argument("--height", type=int, default=960)
    ap.add_argument("--crop", help="x,y,w,h en pixels de la source")
    ap.add_argument("--start", type=float, default=0)
    ap.add_argument("--duration", type=float, default=0)
    a = ap.parse_args()
    pre = ""
    if a.crop:
        x, y, w, h = a.crop.split(",")
        pre = f"crop={w}:{h}:{x}:{y},"
    font = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"
    lab = ("drawtext=fontfile=" + font + ":text='{t}':x=12:y=12:fontsize=h/22:fontcolor=white:"
           "box=1:boxcolor=black@0.6:boxborderw=8")
    fc = (f"[0:v]{pre}scale=-2:{a.height},{lab.format(t='ORIGINAL')}[a];"
          f"[1:v]{pre}scale=-2:{a.height},{lab.format(t='NETTOYE')}[b];"
          f"[a][b]hstack=inputs=2,pad=ceil(iw/2)*2:ceil(ih/2)*2[v]")
    cmd = ["ffmpeg", "-v", "error", "-y"]
    if a.start:
        cmd += ["-ss", str(a.start)]
    cmd += ["-i", a.orig]
    if a.start:
        cmd += ["-ss", str(a.start)]
    cmd += ["-i", a.clean, "-filter_complex", fc, "-map", "[v]", "-map", "0:a?"]
    if a.duration:
        cmd += ["-t", str(a.duration)]
    cmd += ["-c:v", "libx264", "-crf", "23", "-preset", "veryfast", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", a.out]
    subprocess.run(cmd, check=True)
    print(a.out)


if __name__ == "__main__":
    main()
