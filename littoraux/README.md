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
Par défaut, l'imagerie vient de **Sentinel-2 cloudless 2016 d'EOX**, sans clé, sous licence CC BY 4.0 (le crédit est incrusté). Pour utiliser MapTiler ou Mapbox :
```bash
MAP_PROVIDER=maptiler MAP_KEY=votre_cle npm run render
MAP_PROVIDER=mapbox   MAP_KEY=votre_cle npm run render
```

## Licences
- Imagerie : Sentinel-2 cloudless 2016, © EOX IT Services GmbH, CC BY 4.0 (contient des données Copernicus Sentinel modifiées).
- Frontières : Natural Earth, domaine public.
- Musique et effets : synthétisés par `scripts/music.py`.
- Remotion : gratuit pour les particuliers et les structures de 3 personnes ou moins (licence d'entreprise au-delà).
