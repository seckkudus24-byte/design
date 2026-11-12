# RENELLA — Épisode 1 (short TikTok)

Montage vertical 9:16, 1080 × 1920, 30 i/s, H.264 + AAC 256 kb/s, environ 90 s.

## Livrables (`export/`)

| Fichier | Contenu |
|---|---|
| `renella.mp4` | Version finale avec sous-titres |
| `renella_sans_sous_titres.mp4` | Même montage sans sous-titres (le carton final « À SUIVRE… » est conservé) |
| `renella_miniature.jpg` | Miniature verticale 1080 × 1920 |

## Reproduire le montage

```bash
pip install opencv-python-headless librosa faster-whisper   # numpy, scipy, Pillow requis
python3 cinema/build.py films/renella          # plans + audio + exports + miniature
python3 cinema/build.py films/renella shots    # une étape seule : shots | audio | final | thumb
```

Seuls les plans dont les réglages changent dans `edl.json` sont recalculés.

## Fichiers du projet

- `scenes/` : les 10 scènes sources, renommées dans l'ordre du récit (deux fichiers fournis étaient identiques ; une seule copie est gardée).
- `transcription_whisper.json` : transcription mot à mot (Whisper large-v3, faster-whisper, CPU int8).
- `dialogues.json` : sous-titres relus. Une seule correction de la transcription : « Le pain renaît là » → « Le pain, Renella. ». Accords au féminin (« attrapée », « prévenue »). Les paroles ne sont pas modifiées.
- `edl.json` : la liste de montage (29 plans) : entrées et sorties, cadrage numérique, ralenti, étalonnage, transitions.
- `../../cinema/` : le moteur de montage.
  - `shots.py` : rendu de chaque plan (FFmpeg + OpenCV).
  - `score.py` : musique et effets synthétisés.
  - `build.py` : audio, mixage, sous-titres, assemblage, miniature.

## Logiciels réellement utilisés

| Outil | Rôle |
|---|---|
| FFmpeg 6.1.1 | Décodage ; passage 24 → 30 i/s ; ralenti par interpolation de mouvement (`minterpolate`) ; étalonnage (`colorbalance`, `curves`, `eq`) ; débruitage et netteté ; fondus ; vignettage et grain ; sous-titres ASS (libass) ; nettoyage des voix (`highpass`, `afftdn`, `deesser`, `acompressor`) ; ducking de la musique (`sidechaincompress`) ; normalisation en deux passes (`loudnorm`, −14 LUFS, −1,5 dBTP) ; encodage x264. Détection des plans avec `scdet`. |
| OpenCV | Agrandissement 480p/720p → 1080 × 1920 (Lanczos) et mouvements de caméra au sous-pixel, en une seule passe de rééchantillonnage. |
| PySceneDetect | Repérage des changements de plans dans chaque scène (`AdaptiveDetector`). |
| Whisper (faster-whisper large-v3) | Transcription des dialogues avec horodatage de chaque mot. |
| Librosa | Détection des attaques sonores pour caler les impacts sur l'action : étincelles, chute dans la boue, pain écrasé, baril. |

Non utilisés car indisponibles dans l'environnement (pas d'écran ni de carte graphique) : DaVinci Resolve, Audacity, Blender, RIFE. Leurs rôles sont tenus par FFmpeg (étalonnage, traitement des voix, ralenti). MoviePy n'a pas été installé : FFmpeg suffit.

## Choix de réalisation

- **Accroche (0–1,4 s)** : flash-forward sur la flamme et la gerbe d'étincelles de la scène finale, pendant que Pomandro dit déjà « Tu rentres sans pain, je rallume le chalumeau » (son d'une autre source, montage décalé). Coupe sur un impact vers le plan large de la cabane.
- **Structure** : menace (0–9 s) → marché et vol (9–26 s) → chute au ralenti, Granito intervient (26–37 s) → rencontre (37–49 s) → fondu au noir, la nuit tombe (49 s) → la cabane, la violence, la photo (52–78 s) → le chalumeau, « Mon cœur… jamais », « J'arrive. » → coupe au noir sur un impact, puis « À SUIVRE… ».
- **Coupes** : seuls les temps morts sont retirés (début du plan large du marché, silences entre deux répliques, fin de la course dans la ruelle). Toutes les scènes sont présentes, dans l'ordre du scénario.
- **Ralenti** : un seul, ×1,6 (interpolation FFmpeg), quand le pain s'écrase dans la boue.
- **Étalonnage par ambiance** : jour, intérieur jour, crépuscule, nuit, bleu chalumeau. Les corrections restent douces : la peau et les couleurs des personnages ne changent pas.
- **Sous-titres** : Anton blanc avec contour noir, mots clés en jaune, narrateur en italique. Ils sont placés au-dessus de l'interface TikTok (marge basse 560 px, marge droite 170 px).
- **Son** : dialogues originaux nettoyés. La musique est originale et synthétisée (nappes de cordes, piano, pulsation, battements de cœur, montées, impacts) ; elle s'efface automatiquement sous les dialogues. S'y ajoutent le vent nocturne, le souffle du chalumeau et un whoosh sur les transitions.
