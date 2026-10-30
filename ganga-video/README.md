# Vidéo TikTok : le ganga, l'oiseau-éponge

Projet Remotion : 1080×1920, 30 fps, 8 scènes cartoon calées mot à mot sur la voix off.

## Mettre ta voix

1. Dépose ton enregistrement dans **`public/voix.mp3`**.
2. Lance `npm run align` : le script `tools/align.py` minute chaque mot du script (`tools/script.txt`)
   et écrit `src/words.json`. Les scènes, les textes et toutes les animations (thermomètre à 45 °C,
   nuée de gangas, plumes en spirale, poussins qui boivent…) se déclenchent sur les mots prononcés.
   - Si `faster-whisper` est installé (`pip install faster-whisper`), ta voix est **transcrite** et le
     script est recalé sur la transcription (le plus précis).
   - Sinon, le script est calé sur les pauses de ta voix.
3. `npm run render` → `out/ganga.mp4`. La vidéo dure **exactement** la longueur de `voix.mp3`.

Sans `voix.mp3`, un minutage estimé (débit de parole moyen) est utilisé.

## Modifier

- Phrases à l'écran : `src/texts.ts` (`*mot*` = surligné en jaune).
- Si tu changes le texte lu, mets à jour `tools/script.txt` (une ligne `## id` par scène) puis relance `npm run align`.
- Les repères des animations sont des mots du script, par ex. `useCue('45')` dans `src/scenes/Nid.tsx`.

Si Remotion ne trouve pas de navigateur : `REMOTION_CHROME=/chemin/vers/chrome npm run render`.
