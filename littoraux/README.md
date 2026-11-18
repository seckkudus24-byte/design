# Littoraux : vidéo cartographique en français

Reproduction en français, dans le même style, d'un court format géographique : « les pays au littoral ridiculement court ».
Format vertical 1080 × 1920, 30 i/s, environ 41 s. Le projet utilise Remotion, React, MapLibre GL (globe et 3D), les frontières Natural Earth, la voix Piper TTS et FFmpeg.

- Analyse de la vidéo d'origine : [`docs/ANALYSE.md`](docs/ANALYSE.md)
- Script synchronisé : [`docs/SCRIPT.md`](docs/SCRIPT.md)

## Installation
```bash
npm install
pip install piper-tts            # voix off hors ligne
# voix française (environ 63 Mo) dans cache/voices/
mkdir -p cache/voices && cd cache/voices
for e in onnx onnx.json; do curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.$e; done
```

## Fabriquer la vidéo
```bash
npm run data     # frontières et littoraux Natural Earth → public/geo/
npm run voice    # voix off (une phrase par fichier) → public/voice/ + src/generated/timings.json
npm run music    # musique d'ambiance et whoosh (synthèse libre de droits) → public/audio/
npm run render   # → out/littoraux_fr.mp4 + out/littoraux_fr.srt
npm run studio   # aperçu interactif dans le navigateur (Remotion Studio)
node scripts/stills.mjs 5 12 30   # images de contrôle à 5 s, 12 s et 30 s → out/stills/
```
Les tuiles satellites sont mises en cache dans `cache/tiles/`. Un nouveau rendu ne retélécharge rien.

## Ce qu'on modifie, et où

| Pour… | Fichier |
|---|---|
| Changer le texte, la voix ou le débit | `src/config/narration.json` (`text` = sous-titre, `tts` = texte prononcé, `**mot**` = surligné), puis `npm run voice` |
| Changer les zooms, les vols et les durées de scène | `CAMERA` dans `src/config/scenes.ts` |
| Changer les pays, drapeaux, flèches, mesures, étiquettes et effets | `OVERLAYS` dans `src/config/scenes.ts` |
| Changer les couleurs, polices et la position des sous-titres | `src/config/style.ts` |
| Régler le rendu de l'imagerie (saturation, atmosphère du globe) | `src/config/carte.ts` |
| Ajouter un pays | ajouter son code dans `UNITS` (`scripts/geodata.mjs`) et dans `src/map/geo.ts`, puis son drapeau dans `src/flags.tsx` |

**Synchronisation.** Les temps s'écrivent par rapport aux phrases de la voix : `"l06"` (début de la phrase), `"l06@0.5"` (son milieu), `"l06:end+0.3"` (0,3 s après sa fin). Si le texte change, la voix est régénérée et **toute la vidéo se recale toute seule**.

**Types de calques :** `country` (contour lumineux, puis drapeau ou couleur ondulant, avec un `shift` animé possible), `label`, `coast` (littoral calculé automatiquement, avec texte de mesure), `arrows`, `measure`, `scribble`, `mask`, `face`.

## Fournisseur de cartes (clé API facultative)
Par défaut, l'imagerie vient de **Sentinel-2 cloudless 2020 d'EOX**, sans clé. C'est une mosaïque homogène et détaillée, sous licence **CC BY-NC-SA 4.0 : usage non commercial uniquement**. Le crédit est incrusté en bas de l'image.
Pour un usage commercial (vidéo monétisée), deux options :
- passer à la mosaïque 2016 (licence CC BY 4.0, quelques coutures de teinte) : `EOX_LAYER=s2cloudless_3857 npm run render`, puis adapter `credits` dans `src/config/style.ts` ;
- utiliser un fournisseur sous licence commerciale, avec votre clé :
```bash
MAP_PROVIDER=maptiler MAP_KEY=votre_cle npm run render
MAP_PROVIDER=mapbox   MAP_KEY=votre_cle npm run render
```

## Licences
- Imagerie : Sentinel-2 cloudless 2020 by EOX IT Services GmbH, CC BY-NC-SA 4.0, non commercial (contient des données Copernicus Sentinel 2020 modifiées). La version 2016 est sous CC BY 4.0.
- Frontières : Natural Earth, domaine public.
- Musique et effets : synthétisés par `scripts/music.py`.
- Remotion : gratuit pour les particuliers et les structures de 3 personnes ou moins (licence d'entreprise au-delà).

## Version 2 : améliorations visuelles
| Domaine | Fichier(s) | Changement |
|---|---|---|
| Fond satellite | `src/config/carte.ts`, `src/map/MapStage.tsx`, `scripts/tileserver.mjs` | Mosaïque EOX 2020 homogène (plus de couture de teinte), tuiles d'un niveau plus détaillé (`tileSize: 192`), suréchantillonnage ×1,25, atmosphère limitée au globe (plus de voile gris), étalonnage plus naturel |
| Caméra | `src/camera.ts` | Trajectoires de vol continues (van Wijk & Nuij, comme le `flyTo` des cartes web) : la caméra prend de l'altitude selon la distance puis redescend, sans arc artificiel ni vue d'océan vide ; courbes de vitesse adoucies |
| Cadrage | `MAP.raise` | La carte est dessinée plus haute que l'écran : le sujet reste au-dessus des sous-titres, sans fausser le chargement des tuiles |
| Pays | `src/overlays/Overlays.tsx`, `STYLE.flagOpacity` / `fillOpacity` | Drapeaux et couleurs semi-transparents (relief, forêts et villes visibles), ondulation discrète, contour fin à trois couches (halo, trait, filet clair) |
| Transitions | `src/Video.tsx` | Flashs blancs supprimés ; passage d'un pays à l'autre par vol de caméra et « whoosh » sonore ; zoom minimal relevé pour ne jamais montrer le noir de l'espace |
| Textes | `src/Subtitles.tsx`, `src/config/style.ts` | Sous-titres plus bas (zone sûre TikTok), plus fins, sur 900 px maximum ; étiquettes, mesures et textes de côte contraints à l'écran |
