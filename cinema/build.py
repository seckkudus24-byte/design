"""Montage complet d'un court-métrage TikTok à partir d'une liste de montage (EDL).

Usage : python3 cinema/build.py films/renella [étape]
  étapes : shots | audio | final | thumb | all (défaut)

Sorties dans <film>/build/ (intermédiaires) et export/ (livrables).
"""
import json, math, os, re, subprocess, sys
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
import shots as S
import score as M

FPS, W, H = 30, 1080, 1920
SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = os.path.join(ROOT, "assets", "fonts")

# ---------------------------------------------------------------- étalonnage
# Corrections douces : contraste maîtrisé, ombres légèrement froides, hautes lumières chaudes,
# saturation contenue pour ne pas dénaturer la peau des personnages.
LOOKS = {
    "jour": "colorbalance=rs=-0.03:bs=0.035:rh=0.02:bh=-0.025,"
            "curves=all='0/0 0.10/0.085 0.50/0.50 0.90/0.925 1/1',eq=contrast=1.04:saturation=0.97",
    "jour_int": "colorbalance=rs=-0.03:bs=0.035:rh=0.02:bh=-0.025,"
                "curves=all='0/0 0.10/0.09 0.45/0.49 0.85/0.90 1/1',eq=contrast=1.04:saturation=0.97",
    "crepuscule": "colorbalance=rs=-0.02:bs=0.05:rh=0.03:bh=-0.01,"
                  "curves=all='0/0 0.10/0.085 0.45/0.48 0.85/0.90 1/1',eq=contrast=1.04:saturation=1.0",
    "nuit": "colorbalance=rs=-0.02:bs=0.045:rh=0.035:bh=-0.03,"
            "curves=all='0/0 0.10/0.085 0.32/0.36 0.60/0.70 1/1',eq=contrast=1.03:saturation=1.02",
    "neon": "colorbalance=rs=-0.01:bs=0.02:rh=0.03:gh=-0.01:bh=-0.02,"
            "curves=all='0/0 0.10/0.085 0.45/0.47 0.85/0.90 1/1',eq=contrast=1.04:saturation=0.98",
    "bleu": "curves=all='0/0 0.10/0.08 0.40/0.44 0.70/0.79 1/1',eq=contrast=1.05:saturation=1.0",
}
POLISH = "hqdn3d=1.2:1.2:2.5:2.5,unsharp=5:5:0.45:5:5:0"
FLASH = 0.12       # transition « impact » : entrée depuis le blanc
DIP = 0.35         # fondu au noir : demi-durée


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)


def load(film):
    edl = json.load(open(os.path.join(film, "edl.json"), encoding="utf-8"))
    dlg = json.load(open(os.path.join(film, "dialogues.json"), encoding="utf-8"))["lines"]
    t = 0
    for i, s in enumerate(edl["shots"]):
        s["src"] = os.path.join(film, "scenes", s["scene"] + ".mp4")
        s["n"] = int(round((s["tout"] - s["tin"]) * s.get("slow", 1.0) * FPS))
        s["f0"] = t
        s["t0"] = t / FPS
        t += s["n"]
        s["t1"] = t / FPS
    edl["shot_frames"] = t
    edl["end_frames"] = int(round(edl["end_card"]["dur"] * FPS))
    edl["total"] = (t + edl["end_frames"]) / FPS
    return edl, dlg


def shot_vf(edl, i):
    s = edl["shots"][i]
    vf = [LOOKS[s["look"]], POLISH]
    dur = s["n"] / FPS
    if s.get("trans") == "impact":
        vf.append(f"fade=t=in:st=0:d={FLASH}:color=white")
    if s.get("trans") == "fondu_noir":
        vf.append(f"fade=t=in:st=0:d={DIP}")
    nxt = edl["shots"][i + 1] if i + 1 < len(edl["shots"]) else None
    if nxt and nxt.get("trans") == "fondu_noir":
        vf.append(f"fade=t=out:st={dur - DIP:.3f}:d={DIP}")
    return ",".join(vf)


def build_shots(film, edl):
    out_dir = os.path.join(film, "build", "shots")
    os.makedirs(out_dir, exist_ok=True)
    for i, s in enumerate(edl["shots"]):
        out = os.path.join(out_dir, f"{s['id']}.mp4")
        key = json.dumps({k: s.get(k) for k in ("scene", "tin", "tout", "slow", "z0", "z1", "c0", "c1", "shake",
                                                "punch", "look", "trans")}, sort_keys=True) + shot_vf(edl, i)
        stamp = out + ".key"
        if os.path.exists(out) and os.path.exists(stamp) and open(stamp).read() == key:
            continue
        n = S.render(s, out, shot_vf(edl, i))
        assert n == s["n"], (n, s["n"])
        open(stamp, "w").write(key)
        print(f"plan {i + 1:2d} {s['id']:<16} {s['t0']:6.2f}s -> {s['t1']:6.2f}s ({s['n']} images)", flush=True)


# ---------------------------------------------------------------- audio
def decode(src, t0, dur, af=None):
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{max(t0, 0):.4f}", "-t", f"{dur + 0.05:.4f}", "-i", src, "-vn"]
    if af:
        cmd += ["-af", af]
    cmd += ["-ac", "2", "-ar", str(SR), "-f", "f32le", "-"]
    x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2)
    n = int(round(dur * SR))
    if len(x) < n:
        x = np.concatenate([x, np.zeros((n - len(x), 2), np.float32)])
    return x[:n].astype(np.float64)


def fade_edges(x, fin, fout):
    a, b = int(fin * SR), int(fout * SR)
    if a:
        x[:a] *= np.sin(np.linspace(0, np.pi / 2, a))[:, None] ** 2
    if b:
        x[-b:] *= np.cos(np.linspace(0, np.pi / 2, b))[:, None] ** 2
    return x


def onset_peak(src, t0, t1):
    """Instant (s, dans la source) de l'attaque la plus forte entre t0 et t1 (librosa)."""
    import librosa
    y = decode(src, t0, t1 - t0).mean(axis=1).astype(np.float32)
    env = librosa.onset.onset_strength(y=y, sr=SR, hop_length=512)
    ons = librosa.onset.onset_detect(onset_envelope=env, sr=SR, hop_length=512, units="frames")
    if len(ons) == 0:
        return None
    best = max(ons, key=lambda f: env[f])
    return t0 + librosa.frames_to_time(best, sr=SR, hop_length=512)


def build_audio(film, edl):
    bd = os.path.join(film, "build")
    os.makedirs(bd, exist_ok=True)
    total = edl["total"]
    N = int(math.ceil(total * SR)) + SR
    dlg = np.zeros((N, 2))
    shots = edl["shots"]
    for i, s in enumerate(shots):
        dur = s["n"] / FPS
        src, a0 = s["src"], s["tin"]
        if s.get("audio"):
            src, a0 = os.path.join(film, "scenes", s["audio"][0] + ".mp4"), s["audio"][1]
        slow = s.get("slow", 1.0)
        if slow > 1:
            # Son du ralenti : ralenti sans changer la hauteur (rubberband), assourdi et réverbéré.
            x = decode(src, a0, s["tout"] - s["tin"], af=f"rubberband=tempo={1 / slow:.4f},lowpass=f=2500")
            x = M.reverb(x[:, 0], size=2.0, mix=0.45)[:int(dur * SR)] * 0.8
            x = np.concatenate([x, np.zeros((max(0, int(dur * SR) - len(x)), 2))])
        else:
            x = decode(src, a0, dur)
        prev_cont = i > 0 and shots[i - 1]["scene"] == s["scene"] and abs(shots[i - 1]["tout"] - s["tin"]) < 0.05 \
            and not s.get("audio") and not shots[i - 1].get("slow")
        fin = DIP if s.get("trans") == "fondu_noir" else (0.004 if prev_cont else 0.012)
        nxt = shots[i + 1] if i + 1 < len(shots) else None
        fout = DIP if nxt and nxt.get("trans") == "fondu_noir" else 0.012
        if i == len(shots) - 1:
            fout = 0.03
        x = fade_edges(x, fin, fout)
        a = int(round(s["t0"] * SR))
        dlg[a:a + len(x)] += x
    write_wav(os.path.join(bd, "dialogues_bruts.wav"), dlg[:int(total * SR)])

    # Nettoyage des voix (équivalent des traitements Audacity, faits avec FFmpeg) :
    # coupe-bas, réduction de bruit FFT légère, de-esser, compression douce.
    run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(bd, "dialogues_bruts.wav"), "-af",
         "highpass=f=70,afftdn=nr=6:nf=-50,deesser=i=0.25,"
         "acompressor=threshold=-22dB:ratio=2.2:attack=10:release=150:makeup=1.5",
         "-c:a", "pcm_f32le", os.path.join(bd, "dialogues.wav")])

    music, sfx = score_and_sfx(film, edl, N)
    write_wav(os.path.join(bd, "musique.wav"), music[:int(total * SR)])
    write_wav(os.path.join(bd, "effets.wav"), sfx[:int(total * SR)])

    # Mixage : la musique est compressée par les dialogues (sidechain), puis -14 LUFS / -1,5 dBTP.
    mix_graph = ("[1:a]volume=0.55[m];[0:a]asplit=2[d][key];"
                 "[m][key]sidechaincompress=threshold=0.02:ratio=5:attack=25:release=400:makeup=1[md];"
                 "[2:a]volume=0.8[fx];"
                 "[d][md][fx]amix=inputs=3:normalize=0:duration=longest[mix]")
    inputs = ["-i", os.path.join(bd, "dialogues.wav"), "-i", os.path.join(bd, "musique.wav"),
              "-i", os.path.join(bd, "effets.wav")]
    pre = os.path.join(bd, "mix_pre.wav")
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", mix_graph, "-map", "[mix]",
         "-c:a", "pcm_f32le", pre])
    # Normalisation en deux passes (mesure puis correction linéaire).
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af",
                           "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                          capture_output=True, text=True).stderr
    j = json.loads(meas[meas.rindex("{"):meas.rindex("}") + 1])
    run(["ffmpeg", "-v", "error", "-y", "-i", pre, "-af",
         f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
         f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:"
         f"linear=true,aresample={SR}", "-c:a", "pcm_s24le", os.path.join(bd, "mix.wav")])
    print("audio ->", os.path.join(bd, "mix.wav"))


def write_wav(path, x):
    x = np.clip(x, -1, 1).astype(np.float32)
    run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
         "-c:a", "pcm_f32le", path], input=x.tobytes())


def score_and_sfx(film, edl, N):
    """Partition (musique) et effets, placés d'après les plans de l'EDL."""
    music = np.zeros((N, 2))
    sfx = np.zeros((N, 2))
    sh = {s["id"]: s for s in edl["shots"]}

    def put(buf, x, t, gain_db=0.0):
        if x.ndim == 1:
            x = M.stereo(x)
        i = int(round(t * SR))
        if i < 0:
            x, i = x[-i:], 0
        n = min(len(x), N - i)
        buf[i:i + n] += x[:n] * 10 ** (gain_db / 20)

    T = lambda k, edge="t0": sh[k][edge]

    # --- Ouverture : cœur et nappe sombre sous les insultes, montée sur « Ce soir, j'arrache… »,
    # impact sur la fissure (attaque détectée par librosa), éclat lumineux, puis noir.
    t_o, t_e = T("ouverture_mots"), T("ouverture_peau", "t1")
    put(music, M.drone("C#2", t_e - t_o + 0.6, 0.4, 0.6), t_o, -9)
    put(music, M.heartbeat(T("ouverture_ce_soir") - t_o, 70, 0.8), t_o, -12)
    put(music, M.string_pad(["C#3", "E3", "G#3"], T("ouverture_ce_soir") - t_o + 1.0, 1100, 1.0, 1.0), t_o, -13)
    put(music, M.riser(T("ouverture_peau") - T("ouverture_ce_soir") + 0.3), T("ouverture_ce_soir"), -9)
    o = sh["ouverture_peau"]
    crack = onset_peak(o["src"], o["tin"], o["tin"] + 0.8)
    t_crack = T("ouverture_peau") + ((crack if crack is not None else o["tin"]) - o["tin"])
    print(f"fissure : attaque à {crack}s source -> {t_crack:.2f}s montage")
    put(sfx, M.impact(3.0, "C#1"), t_crack, -8)
    put(music, M.string_pad(["C#3", "G#3", "C#4", "E4"], t_e - t_crack + 0.8, 2600, 0.8, 0.8), t_crack, -10)
    put(sfx, M.whoosh(0.8), t_e - 0.8, -12)
    put(sfx, M.impact(4.0, "D1"), t_e, -5)
    put(sfx, M.sub_drop(2.0), t_e, -8)
    # --- Acte 1 : maison (drone de menace), marché (tendresse).
    put(music, M.drone("D2", T("marche_large") - T("menace_large") + 1.5, 0.8, 1.5), T("menace_large"), -6)
    put(music, M.string_pad(["D3", "F3", "A3"], 6.0, 1200, 2.5, 2.5), T("menace_renella"), -12)
    put(sfx, M.whoosh(0.6), T("marche_large") - 0.4, -12)
    put(music, M.string_pad(["A#2", "D3", "F3", "A3"], T("voleuse") - T("marche_large") + 0.6, 1600, 1.0, 1.0),
        T("marche_large"), -10)
    for k, (note, dt) in enumerate((("D4", 0.0), ("F4", 0.75), ("A4", 1.5), ("G4", 2.6), ("F4", 3.4),
                                    ("E4", 4.6), ("D4", 5.5), ("A3", 6.8))):
        put(music, M.piano(note, 3.0, 0.8), T("marche_pain") + 0.3 + dt, -9)
    # --- Le vol découvert : pulsation qui accélère, montée jusqu'à la chute.
    t_v, t_fall = T("voleuse"), T("chute_ralenti")
    put(music, M.pulse(t_fall - t_v, 100, "D2", accel=True), t_v, -8)
    put(music, M.riser(t_fall - T("citron")), T("citron"), -10)
    put(sfx, M.impact(3.0, "D1"), T("voleuse"), -12)
    # Chute : impact calé sur l'attaque réelle de la chute (librosa) dans la scène source.
    # Chute : impacts calés sur les attaques réelles détectées par librosa dans la scène source
    # (atterrissage dans la boue pendant « chute », pain qui s'écrase pendant le ralenti).
    s, r = sh["chute"], sh["chute_ralenti"]
    hit = onset_peak(s["src"], s["tin"], s["tout"])
    t_hit = T("chute") + ((hit if hit is not None else s["tin"]) - s["tin"])
    print(f"chute : attaque détectée à {hit}s source -> {t_hit:.2f}s montage")
    splat = onset_peak(r["src"], r["tin"] + 0.2, r["tout"])
    if splat is not None:
        t_splat = T("chute_ralenti") + (splat - r["tin"]) * r["slow"]
        print(f"pain écrasé : attaque à {splat:.2f}s source -> {t_splat:.2f}s montage (ralenti)")
        put(sfx, M.impact(3.0, "G1"), t_splat, -12)
    put(sfx, M.impact(4.5, "C#1"), t_hit, -4)
    put(sfx, M.sub_drop(2.5), t_hit, -8)
    put(music, M.string_pad(["D3", "D#3", "A3"], T("arretez") - T("chute_ralenti") + 0.5, 900, 1.5, 0.8),
        T("chute_ralenti"), -11)
    put(music, M.drone("D2", T("rencontre") - T("citron_moque") + 1.5, 1.0, 1.5), T("citron_moque"), -9)
    # Granito intervient.
    put(sfx, M.whoosh(0.5), T("arretez") - 0.35, -10)
    put(sfx, M.impact(3.0, "F1"), T("arretez"), -8)
    # --- Rencontre : thème tendre (Fa majeur / Ré mineur).
    t_r = T("rencontre")
    put(music, M.string_pad(["F3", "A3", "C4"], 7.0, 1500, 2.0, 2.5), t_r, -12)
    put(music, M.string_pad(["D3", "F3", "A3", "C4"], T("ruelle") - t_r - 5.5, 1500, 2.0, 1.5), t_r + 5.5, -12)
    for note, dt in (("A4", 0.6), ("C5", 1.4), ("F4", 2.4), ("E4", 5.8), ("D4", 6.6), ("A4", 8.0), ("F4", 9.0),
                     ("D4", 11.0), ("E4", 11.8), ("F4", 12.4)):
        put(music, M.piano(note, 3.0, 0.7), t_r + dt, -10)
    # --- Nuit : ruelle (vent, cœur), cabane (tension).
    t_n = T("ruelle")
    put(sfx, M.wind(edl["total"] - t_n), t_n, -24)
    put(music, M.heartbeat(T("baril") - t_n, 64), t_n, -10)
    put(music, M.drone("D2", T("photo") - t_n + 1.0, 2.0, 1.0), t_n, -8)
    put(music, M.string_pad(["D3", "D#3", "G#3"], T("baril") - T("trou_mur") + 0.5, 1000, 2.0, 0.5), T("trou_mur"), -12)
    s = sh["baril"]
    hit = onset_peak(s["src"], 0.0, 2.6)
    t_b = T("baril") + (hit or 0.0)
    print(f"baril : attaque détectée à {hit:.2f}s source -> {t_b:.2f}s montage")
    put(sfx, M.impact(3.5, "D1"), t_b, -9)
    put(music, M.string_pad(["D3", "F3", "G#3", "C4"], T("photo") - T("ombre") + 0.5, 1300, 2.5, 1.0), T("ombre"), -11)
    # Photo / larmes : piano triste.
    t_p = T("photo")
    put(music, M.string_pad(["A#2", "D3", "F3"], T("chalumeau") - t_p + 0.3, 1100, 1.5, 0.6), t_p, -11)
    for note, dt in (("F4", 0.3), ("E4", 1.2), ("D4", 2.1), ("A3", 3.4), ("A#3", 4.6), ("A3", 5.6), ("D4", 6.4)):
        put(music, M.piano(note, 3.0, 0.75), t_p + dt, -9)
    # --- Final : chalumeau, montée, coupe au noir.
    t_c, t_end = T("chalumeau"), T("j_arrive", "t1")
    put(sfx, M.impact(3.0, "D1"), t_c, -8)
    put(sfx, M.flame(t_end - t_c), t_c, -20)
    put(music, M.pulse(t_end - t_c, 92, "D2", accel=True), t_c, -9)
    put(music, M.drone("D2", t_end - t_c + 0.2, 1.0, 0.2), t_c, -8)
    put(music, M.riser(t_end - T("j_arrive") + 1.2), T("j_arrive") - 1.2, -8)
    put(sfx, M.impact(5.0, "D1"), t_end, -3)
    put(sfx, M.sub_drop(3.0), t_end, -6)
    put(music, M.string_pad(["D3", "A3", "D4"], edl["end_card"]["dur"], 900, 0.05, 1.5), t_end, -16)
    return music, sfx


# ---------------------------------------------------------------- sous-titres
def ass_time(t):
    cs = int(round(t * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


YELLOW = "&H0000D4FF&"


def ass_text(text):
    text = text.upper()
    text = re.sub(r" ([?!:;])", " \\1", text)   # espace insécable avant la ponctuation haute
    return re.sub(r"\*\*(.+?)\*\*", lambda m: "{\\c" + YELLOW + "}" + m.group(1) + "{\\c&HFFFFFF&}", text)


def subtitle_events(edl, dlg):
    ev = []
    for s in edl["shots"]:
        if s.get("slow", 1) > 1:
            continue
        scene, a0 = (s["audio"][0], s["audio"][1]) if s.get("audio") else (s["scene"], s["tin"])
        a1 = a0 + s["n"] / FPS
        for ln in dlg:
            if ln[0] != scene or ln[2] <= a0 or ln[1] >= a1:
                continue
            seen = max(ln[1], a0), min(ln[2], a1)
            if seen[1] - seen[0] < 0.25 and (ln[2] - ln[1]) > 0.5:
                continue  # fragment trop court de part et d'autre d'une coupe : déjà affiché ailleurs
            t0, t1 = s["t0"] + seen[0] - a0, s["t0"] + seen[1] - a0
            style = "Narr" if len(ln) > 4 and ln[4] == "N" else "Dlg"
            if ev and ev[-1][2] == ln[3] and abs(ev[-1][1] - t0) < 0.05:
                ev[-1][1] = t1
            else:
                ev.append([t0, t1, ln[3], style])
    ev.sort()
    for i, e in enumerate(ev):
        nxt = ev[i + 1][0] if i + 1 < len(ev) else e[1] + 1
        e[1] = min(max(e[1] + 0.15, e[0] + 0.6), nxt - 0.02)
    return ev


def write_ass(edl, dlg, path, with_dialogue=True):
    pop = r"{\fad(60,80)\fscx92\fscy92\t(0,90,\fscx100\fscy100)}"
    st = "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, " \
         "Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, " \
         "MarginL, MarginR, MarginV, Encoding"
    lines = ["[Script Info]", "ScriptType: v4.00+", f"PlayResX: {W}", f"PlayResY: {H}", "WrapStyle: 0",
             "ScaledBorderAndShadow: yes", "", "[V4+ Styles]", st,
             # Zone sûre TikTok : bas (~25 %) et rail droit (~150 px) occupés par l'interface.
             "Style: Dlg,Anton,96,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,0,0,0,0,100,100,1.5,0,1,6.5,2,2,100,160,560,1",
             "Style: Narr,Anton,86,&H00F0F0F0,&H00FFFFFF,&H00000000,&H96000000,0,1,0,0,100,100,1.5,0,1,5,2,2,110,170,560,1",
             "Style: Card,Anton,124,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,6,0,1,0,0,5,60,60,0,1",
             "Style: Small,Anton,56,&H00D2D2D2,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,4,0,1,0,0,5,60,60,0,1",
             "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    if with_dialogue:
        for t0, t1, text, style in subtitle_events(edl, dlg):
            lines.append(f"Dialogue: 0,{ass_time(t0)},{ass_time(t1)},{style},,0,0,0,,{pop}{ass_text(text)}")
    t0 = edl["shot_frames"] / FPS
    t1 = edl["total"]
    lines.append(f"Dialogue: 0,{ass_time(t0 + 0.25)},{ass_time(t1)},Card,,0,0,0,,"
                 r"{\fad(350,250)\pos(540,930)}" + edl["end_card"]["text"])
    lines.append(f"Dialogue: 0,{ass_time(t0 + 0.55)},{ass_time(t1)},Small,,0,0,0,,"
                 r"{\fad(350,250)\pos(540,1060)}" + edl["title"].upper())
    open(path, "w", encoding="utf-8").write("\n".join(lines) + "\n")


# ---------------------------------------------------------------- assemblage
def build_final(film, edl, dlg, name):
    bd = os.path.join(film, "build")
    shots_dir = os.path.join(bd, "shots")
    lst = os.path.join(bd, "concat.txt")
    with open(lst, "w") as f:
        for i, s in enumerate(edl["shots"]):
            path = os.path.abspath(os.path.join(shots_dir, f"{s['id']}.mp4"))
            f.write(f"file '{path}'\n")
    os.makedirs(os.path.join(ROOT, "export"), exist_ok=True)
    total = edl["total"]
    end_d = edl["end_frames"] / FPS
    for subs, suffix in ((True, ""), (False, "_sans_sous_titres")):
        ass = os.path.join(bd, f"texte{suffix}.ass")
        write_ass(edl, dlg, ass, with_dialogue=subs)
        out = os.path.join(ROOT, "export", f"{name}{suffix}.mp4")
        fc = (f"[0:v]setpts=PTS-STARTPTS[a];color=c=black:s={W}x{H}:r={FPS}:d={end_d:.3f},format=yuv420p[b];"
              f"[a][b]concat=n=2:v=1:a=0,"
              # Finition : vignettage léger et grain argentique fin (luminance seule, temporel).
              f"vignette=angle=0.32:mode=forward,noise=c0s=3:c0f=t+u,"
              f"ass={ass}:fontsdir={FONT_DIR},format=yuv420p[v]")
        run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst,
             "-i", os.path.join(bd, "mix.wav"), "-filter_complex", fc, "-map", "[v]", "-map", "1:a",
             "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-maxrate", "7500k", "-bufsize", "15M", "-profile:v", "high", "-level", "4.2",
             "-pix_fmt", "yuv420p", "-r", str(FPS), "-g", "60", "-bf", "2",
             "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
             "-c:a", "aac", "-b:a", "256k", "-ar", str(SR), "-ac", "2",
             "-movflags", "+faststart", "-t", f"{total:.3f}", out])
        print("OK ->", out)


def build_thumb(film, edl, name, shot_id="jamais", at=2.4):
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
    bd = os.path.join(film, "build")
    i = next(k for k, s in enumerate(edl["shots"]) if s["id"] == shot_id)
    src = os.path.join(bd, "shots", f"{shot_id}.mp4")
    png = os.path.join(bd, "thumb_src.png")
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{at}", "-i", src, "-frames:v", "1", png])
    im = Image.open(png).convert("RGB")
    # Dégradé sombre en bas pour la lisibilité du titre.
    grad = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(grad)
    for y in range(H // 2, H):
        d.line([(0, y), (W, y)], fill=int(200 * ((y - H / 2) / (H / 2)) ** 1.5))
    im = Image.composite(Image.new("RGB", (W, H), (0, 0, 0)), im, grad)
    font = ImageFont.truetype(os.path.join(FONT_DIR, "Anton-Regular.ttf"), 150)
    small = ImageFont.truetype(os.path.join(FONT_DIR, "Anton-Regular.ttf"), 70)
    dr = ImageDraw.Draw(im)
    def center(text, y, f, fill, stroke):
        w = dr.textlength(text, font=f)
        dr.text(((W - w) / 2, y), text, font=f, fill=fill, stroke_width=stroke, stroke_fill=(0, 0, 0))
    center("MON CŒUR,", 1260, font, (255, 255, 255), 8)
    center("JAMAIS.", 1430, font, (255, 212, 0), 8)
    center(edl["title"].upper(), 1640, small, (230, 230, 230), 5)
    out = os.path.join(ROOT, "export", f"{name}_miniature.jpg")
    im.save(out, quality=94)
    print("OK ->", out)


def main(film, step="all"):
    edl, dlg = load(film)
    name = os.path.basename(os.path.normpath(film))
    print(f"durée : {edl['total']:.2f}s ({len(edl['shots'])} plans)")
    if step in ("shots", "all"):
        build_shots(film, edl)
    if step in ("audio", "all"):
        build_audio(film, edl)
    if step in ("final", "all"):
        build_final(film, edl, dlg, name)
    if step in ("thumb", "all"):
        build_thumb(film, edl, name)


if __name__ == "__main__":
    main(*sys.argv[1:])
