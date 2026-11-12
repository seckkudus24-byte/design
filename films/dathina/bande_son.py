"""Bande-son de DATHINA : repères musicaux et effets, placés d'après les plans de edl.json.

Tonalité : la mineur (rejet, solitude) -> do majeur (le garçon du banc) -> la majeur lumineux (transformation).
"""


def cues(c):
    put, T, sh, music, sfx, M, onset_peak = c.put, c.T, c.sh, c.music, c.sfx, c.M, c.onset_peak

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
    # --- Famille : nappe mineure, piano triste ; le père : impact sur « tu quittes cette maison ».
    t_f = T("menage")
    put(music, M.string_pad(["A2", "C3", "E3"], T("valise_large") - t_f + 0.8, 1300, 1.5, 1.0), t_f, -11)
    for note, dt in (("E4", 0.4), ("C4", 1.6), ("A3", 2.8), ("B3", 4.4), ("C4", 5.6), ("A3", 7.2),
                     ("E4", 10.6), ("D4", 11.8), ("C4", 13.0), ("A3", 14.4)):
        put(music, M.piano(note, 3.0, 0.7), t_f + dt, -11)
    put(sfx, M.impact(3.0, "A0"), T("valise_large"), -9)
    put(music, M.drone("A1", T("cv") - T("valise_large") + 0.6, 0.3, 0.6), T("valise_large"), -8)
    put(music, M.string_pad(["A2", "C3", "D#3"], T("cv") - T("valise_supplie") + 0.6, 900, 1.0, 0.6),
        T("valise_supplie"), -12)
    # --- Boulangerie puis trottoir : pulsation, montée, « dehors ! ».
    put(sfx, M.whoosh(0.6), T("cv") - 0.4, -12)
    put(music, M.pulse(T("defense") - T("cv"), 96, "A1", accel=True), T("cv"), -11)
    put(sfx, M.impact(2.5, "E1"), T("dehors"), -10)
    put(sfx, M.whoosh(0.6), T("trottoir") - 0.4, -12)
    put(music, M.riser(T("defense") - T("degage")), T("degage"), -10)
    put(music, M.drone("A1", T("defense") - T("trottoir") + 0.3, 0.5, 0.3), T("trottoir"), -9)
    # --- Le garçon intervient : impact, puis le thème tendre en do majeur.
    put(sfx, M.impact(3.0, "C1"), T("defense"), -8)
    t_b = T("banc_large")
    put(music, M.string_pad(["C3", "E3", "G3"], 6.5, 1600, 2.0, 2.0), T("defense") + 1.5, -13)
    put(music, M.string_pad(["A2", "C3", "E3", "G3"], T("peau_lit") - t_b + 0.5, 1700, 1.5, 1.2), t_b + 3.0, -12)
    for note, dt in (("G4", 0.3), ("E4", 1.1), ("C4", 1.9), ("D4", 3.4), ("E4", 4.6), ("G4", 5.4), ("A4", 6.6),
                     ("G4", 8.0), ("E4", 9.2), ("C5", 10.4), ("B4", 11.6), ("C5", 12.6)):
        put(music, M.piano(note, 3.0, 0.75), t_b + dt, -10)
    # --- Laverie : cœur, montée sur la fissure, impact et scintillement à la révélation.
    t_p, t_end = T("peau_lit"), T("revelation", "t1")
    put(music, M.heartbeat(T("peau_arrache") - t_p + 1.0, 68, 0.8), t_p, -12)
    put(music, M.drone("A1", T("peau_ralenti") - t_p + 0.5, 0.5, 0.5), t_p, -10)
    put(music, M.riser(T("peau_ralenti") - T("peau_arrache")), T("peau_arrache"), -8)
    p = sh["peau_arrache"]
    crack = onset_peak(p["src"], p["tin"] + 2.0, p["tout"])
    if crack is not None:
        print(f"fissure (scène 08) : attaque à {crack:.2f}s source -> {T('peau_arrache') + crack - p['tin']:.2f}s montage")
        put(sfx, M.impact(2.5, "A0"), T("peau_arrache") + crack - p["tin"], -12)
    put(sfx, M.impact(4.0, "A0"), T("peau_ralenti"), -5)
    put(sfx, M.sub_drop(2.0), T("peau_ralenti"), -9)
    put(music, M.shimmer(t_end - T("peau_ralenti") + c.edl["end_card"]["dur"], "A5"), T("peau_ralenti"), -6)
    put(music, M.string_pad(["A3", "C#4", "E4", "A4"], t_end - T("peau_ralenti") + c.edl["end_card"]["dur"], 3000,
                            0.6, 1.5), T("peau_ralenti"), -9)
