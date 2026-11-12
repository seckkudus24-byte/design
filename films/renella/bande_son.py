"""Bande-son de RENELLA : repères musicaux et effets, placés d'après les plans de edl.json."""


def cues(c):
    put, T, sh, music, sfx, M, onset_peak = c.put, c.T, c.sh, c.music, c.sfx, c.M, c.onset_peak
    # --- Accroche : flamme, impact, sub.
    put(sfx, M.flame(1.5), 0.0, -14)
    a = sh["accroche"]
    spark = onset_peak(a["src"], a["tin"], a["tout"])
    if spark is not None:  # gerbe d'étincelles : attaque réelle de la scène source
        print(f"étincelles : attaque à {spark:.2f}s source -> {spark - a['tin']:.2f}s montage")
        put(sfx, M.impact(2.0, "A1"), spark - a["tin"], -12)
    put(sfx, M.impact(4.0, "D1"), T("menace_large"), -6)
    put(sfx, M.whoosh(0.5), T("menace_large") - 0.35, -14)
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
    put(sfx, M.wind(c.edl["total"] - t_n), t_n, -24)
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
    put(music, M.string_pad(["D3", "A3", "D4"], c.edl["end_card"]["dur"], 900, 0.05, 1.5), t_end, -16)
