"""Monte la vidéo TikTok à partir d'une timeline JSON.

timeline.json :
{
  "audio": "assets/voix.m4a",
  "shots": [
    {"image": "assets/images/1.jpg", "start": 0.0, "text": "TEXTE avec **MOT** rouge", "whip_in": false},
    ...
  ]
}
"start" = début de la phrase (s). "whip_in" = whip pan entre le plan précédent et celui-ci.
"speech_end" (facultatif) : fin de la voix ; la dernière image est tenue HOLD s puis fondue au noir.
"flashes" (facultatif) : numéros des images qui entrent avec un flash blanc.
"""
import json, os, re, subprocess, sys

W, H, FPS = 1080, 1920, 30
ZOOM = 0.08
WHIP = 0.15          # durée totale du whip pan
HOLD, FADE = 1.5, 0.5
FLASH = 0.1
RED = "&H002E26D7&"  # #D7262E en BGR
FONT_DIR = "assets/fonts"
FONT = "Anton"


def run(cmd):
    subprocess.run(cmd, check=True)


def frames(t):
    return int(round(t * FPS))


def audio_duration(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                   "-of", "default=nw=1:nk=1", path])
    return float(out)


def render_shot(image, n_frames, zoom_in, out):
    # Image agrandie pour un zoom fluide, recadrée pour remplir le 9:16 sans bandes.
    z = f"1+{ZOOM}*on/{n_frames}" if zoom_in else f"{1 + ZOOM}-{ZOOM}*on/{n_frames}"
    vf = (f"scale={W * 2}:{H * 2}:force_original_aspect_ratio=increase,crop={W * 2}:{H * 2},"
          f"zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n_frames}:s={W}x{H}:fps={FPS},setsar=1,"
          f"format=yuv420p")
    run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-i", image, "-vf", vf,
         "-frames:v", str(n_frames), "-c:v", "libx264", "-preset", "fast", "-crf", "16", out])


def ass_time(t):
    cs = int(round(t * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


def ass_text(text):
    text = text.upper()
    return re.sub(r"\*\*(.+?)\*\*", lambda m: "{\\c" + RED + "}" + m.group(1) + "{\\c&H000000&}", text)


def write_ass(shots, end, path):
    pop = r"{\fscx80\fscy80\t(0,130,\fscx105\fscy105)\t(130,200,\fscx100\fscy100)}"
    lines = [
        "[Script Info]", "ScriptType: v4.00+", f"PlayResX: {W}", f"PlayResY: {H}", "WrapStyle: 0", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, "
        "Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, "
        "MarginL, MarginR, MarginV, Encoding",
        f"Style: Main,{FONT},104,&H00000000,&H00000000,&H00FFFFFF,&H00000000,0,0,0,0,100,100,1,0,1,4,0,8,"
        f"70,70,{int(H * 0.12)},1",
        "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]
    for i, s in enumerate(shots):
        if not s.get("text"):
            continue
        t1 = shots[i + 1]["start"] if i + 1 < len(shots) else end
        lines.append(f"Dialogue: 0,{ass_time(s['start'])},{ass_time(t1)},Main,,0,0,0,,{pop}{ass_text(s['text'])}")
    open(path, "w").write("\n".join(lines) + "\n")


def main(timeline_path, audio, out_path, work="build"):
    """audio = piste finale déjà mixée (voir audio.py)."""
    tl = json.load(open(timeline_path, encoding="utf-8"))
    shots = tl["shots"]
    os.makedirs(work, exist_ok=True)
    end = tl["speech_end"] + HOLD + FADE if "speech_end" in tl else audio_duration(audio)
    shots[0]["start"] = 0.0  # la première image couvre le tout début
    half = WHIP / 2

    # Bornes de chaque plan en images, sans dérive cumulée.
    bounds = [frames(s["start"]) for s in shots] + [frames(end)]
    seg_files, seg_frames = [], []
    for i, s in enumerate(shots):
        a, b = bounds[i], bounds[i + 1]
        # Un whip pan chevauche la coupe : on rallonge les deux plans d'une demi-transition.
        if s.get("whip_in") and i > 0:
            a -= frames(half)
        if i + 1 < len(shots) and shots[i + 1].get("whip_in"):
            b += frames(half)
        n = b - a
        f = os.path.join(work, f"shot_{i + 1:02d}.mp4")
        render_shot(s["image"], n, zoom_in=(i % 2 == 0), out=f)
        seg_files.append(f)
        seg_frames.append(n)
        print(f"plan {i + 1:2d}: {a / FPS:6.2f}s -> {b / FPS:6.2f}s ({n} images)", flush=True)

    # Groupes de plans en coupe franche, reliés entre eux par des whip pans (xfade).
    inputs, fc = [], []
    for f in seg_files:
        inputs += ["-i", f]
    groups = [[0]]
    for i in range(1, len(shots)):
        if shots[i].get("whip_in"):
            groups.append([i])
        else:
            groups[-1].append(i)
    glabels = []
    for g_i, g in enumerate(groups):
        lbl = f"g{g_i}"
        if len(g) == 1:
            fc.append(f"[{g[0]}:v]null[{lbl}]")
        else:
            fc.append("".join(f"[{i}:v]" for i in g) + f"concat=n={len(g)}:v=1:a=0[{lbl}]")
        glabels.append((lbl, sum(seg_frames[i] for i in g)))
    cur, cur_len = glabels[0]
    whip_frames = frames(WHIP)
    whip_times = []
    for g_i in range(1, len(glabels)):
        lbl, n = glabels[g_i]
        offset = (cur_len - whip_frames) / FPS
        direction = "slideleft" if g_i % 2 else "slideright"
        out = f"x{g_i}"
        fc.append(f"[{cur}][{lbl}]xfade=transition={direction}:duration={whip_frames / FPS}:offset={offset}[{out}]")
        whip_times.append(offset)
        cur, cur_len = out, cur_len + n - whip_frames
    flashes = "".join(
        f",drawbox=t=fill:c=white@1:enable='between(t,{shots[n - 1]['start']:.3f},{shots[n - 1]['start'] + FLASH:.3f})'"
        for n in tl.get("flashes", []))
    fade = f",fade=t=out:st={end - FADE:.3f}:d={FADE}" if "speech_end" in tl else ""
    blur = "".join(f",avgblur=sizeX=60:sizeY=1:enable='between(t,{t:.3f},{t + WHIP:.3f})'" for t in whip_times)
    ass = os.path.join(work, "texte.ass")
    write_ass(shots, end, ass)
    fc.append(f"[{cur}]null{blur}{flashes},ass={ass}:fontsdir={FONT_DIR}{fade},format=yuv420p[v]")

    inputs += ["-i", audio]
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(fc),
         "-map", "[v]", "-map", f"{len(seg_files)}:a",
         "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-r", str(FPS), "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-ac", "2", "-movflags", "+faststart", "-t", f"{end:.3f}", out_path])
    print("OK ->", out_path)


if __name__ == "__main__":
    main(*sys.argv[1:])
