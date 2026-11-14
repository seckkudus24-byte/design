"""Fabrique une vidéo de test « style Douyin » à partir d'une vidéo propre.

On incruste des sous-titres chinois (blanc, contour noir épais, milieu d'écran)
sur une vidéo réelle SANS texte. La vidéo propre sert ensuite de vérité terrain
pour mesurer objectivement la qualité de suppression (voir evaluate.py).

Usage : python tests/make_test_video.py propre.mp4 sortie.mp4 [--pos 0.55]
"""
import argparse
import os
import subprocess
import tempfile

LINES = [
    "这把扇子真的太漂亮了",
    "你们看这个花纹 全是手工画的",
    "我在西班牙买的 只要十欧元",
    "打开的时候声音特别好听",
    "大家觉得值不值 评论区告诉我",
    "喜欢的话记得点赞关注哦",
    "下期给你们看更多好东西",
]


def ts(t):
    h, r = divmod(t, 3600)
    m, s = divmod(r, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def probe(path):
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height:format=duration", "-of", "csv=p=0:s=,", path,
    ], text=True).split()
    w, h = map(int, out[0].split(",")[:2])
    return w, h, float(out[1])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--pos", type=float, default=0.55, help="hauteur relative du texte (0=haut, 1=bas)")
    ap.add_argument("--dur", type=float, default=1.4, help="durée d'une ligne (s)")
    ap.add_argument("--font", default="WenQuanYi Zen Hei")
    a = ap.parse_args()

    w, h, duration = probe(a.src)
    size = int(min(w, h) * 0.062)
    outline = max(2, int(size * 0.09))
    y = int(h * a.pos)
    ass = [
        "[Script Info]", "ScriptType: v4.00+", f"PlayResX: {w}", f"PlayResY: {h}", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        f"Style: D,{a.font},{size},&H00FFFFFF,&H000000FF,&H00000000,&H64000000,1,0,0,0,100,100,2,0,1,{outline},1,5,20,20,0,1",
        "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]
    t, i = 0.3, 0
    while t + 0.3 < duration:
        end = min(t + a.dur, duration)
        text = LINES[i % len(LINES)]
        if i % 3 == 1:  # mot-clé jaune, comme sur Douyin
            text = text[:2] + "{\\c&H00D7FF&}" + text[2:5] + "{\\c&HFFFFFF&}" + text[5:]
        ass.append(f"Dialogue: 0,{ts(t)},{ts(end)},D,,0,0,0,,{{\\pos({w // 2},{y})}}{text}")
        t, i = end + 0.05, i + 1

    with tempfile.NamedTemporaryFile("w", suffix=".ass", delete=False, encoding="utf-8") as f:
        f.write("\n".join(ass) + "\n")
    try:
        subprocess.run([
            "ffmpeg", "-v", "error", "-y", "-i", a.src, "-vf", f"ass={f.name}",
            "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p",
            "-c:a", "copy", a.dst,
        ], check=True)
    finally:
        os.unlink(f.name)
    print(a.dst)


if __name__ == "__main__":
    main()
