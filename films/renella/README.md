# RENELLA — Épisode 1 (short TikTok)

Montage vertical 9:16, 1080 × 1920, 30 i/s, H.264 High (≈ 7,5 Mb/s) + AAC 256 kb/s 48 kHz, ≈ 101,8 s, −14 LUFS / −1,5 dBTP.

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

- `scenes/` : les 11 scènes sources, renommées dans l'ordre du montage. `00_ouverture` est la scène d'ouverture ajoutée ensuite. Deux des fichiers fournis au départ étaient identiques ; une seule copie est gardée.
- `transcription_whisper.json` : transcription mot à mot (Whisper large-v3, faster-whisper, CPU int8).
- `dialogues.json` : sous-titres relus. Une seule correction de la transcription : « Le pain renaît là » → « Le pain, Renella. ». Accords au féminin (« attrapée », « prévenue »). Les paroles ne sont pas modifiées, même quand elles ne sont pas grammaticales (« Toute ma ville m'ont craché… »).
- `edl.json` : la liste de montage (32 plans) : entrées et sorties, cadrage numérique, ralenti, étalonnage, transitions.
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
| Librosa | Détection des attaques sonores pour caler les impacts sur l'action : fissure de la peau, chute dans la boue, pain écrasé, baril. |

Non utilisés car indisponibles dans l'environnement (pas d'écran ni de carte graphique) : DaVinci Resolve, Audacity, Blender, RIFE. Leurs rôles sont tenus par FFmpeg (étalonnage, traitement des voix, ralenti). MoviePy n'a pas été installé : FFmpeg suffit.

## Choix de réalisation

- **Ouverture et accroche (0–11,9 s)** : la scène de la laverie. Elle lit le papier en larmes (« Crasseuse. Moche. Monstre. »), puis annonce « Ce soir, j'arrache cette vieille peau… », et sa peau se fissure. Elle est découpée en 4 plans, avec un rapprochement de cadre à chaque coupe. La coupe tombe au sommet de la transformation, sur l'éclat de lumière, **avant son sourire final** : le spectateur ne connaît pas la fin et veut savoir pourquoi elle fait ça. Impact, coupe au noir, puis l'histoire commence.
- **Structure** : ouverture (0–12 s) → menace dans la cabane (12–20 s) → marché et vol (20–38 s) → chute au ralenti, Granito intervient (38–49 s) → rencontre (49–61 s) → fondu au noir, la nuit tombe → la cabane, la violence, la photo (64–90 s) → le chalumeau, « Mon cœur… jamais », « J'arrive. » → coupe au noir sur un impact, puis « À SUIVRE… ».
- **Coupes** : seuls les temps morts sont retirés (début du plan large du marché, silences entre deux répliques, fin de la course dans la ruelle). Toutes les scènes sont présentes, dans l'ordre du scénario.
- **Ralenti** : un seul, ×1,6 (interpolation FFmpeg), quand le pain s'écrase dans la boue.
- **Étalonnage par ambiance** : néon (laverie), jour, intérieur jour, crépuscule, nuit, bleu chalumeau. Les corrections restent douces : la peau et les couleurs des personnages ne changent pas.
- **Sous-titres** : Anton blanc avec contour noir, mots clés en jaune, narrateur en italique. Ils sont placés au-dessus de l'interface TikTok (marge basse 560 px, marge droite 170 px).
- **Son** : dialogues originaux nettoyés. La musique est originale et synthétisée (nappes de cordes, piano, pulsation, battements de cœur, montées, impacts) ; elle s'efface automatiquement sous les dialogues. S'y ajoutent le vent nocturne, le souffle du chalumeau et un whoosh sur les transitions.
