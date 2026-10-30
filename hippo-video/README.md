# Vidéo TikTok : l'hippopotame qui fait vivre la rivière

Projet [Remotion](https://www.remotion.dev/) : 1080×1920, 30 fps, 8 scènes cartoon.

## Installation

```bash
cd hippo-video
npm install
```

## Ajouter ta voix off

1. Dépose ton enregistrement dans **`public/voix.mp3`** (le nom doit être exactement celui-là).
2. Lance `npm run sync` : le script repère les 7 plus longues pauses de ta voix et
   écrit le début de chaque scène dans `src/timings.json`.
   Laisse donc une petite pause (≈ 0,5 s) entre chaque section du script quand tu enregistres.
3. Vérifie dans le studio (`npm run studio`) que les changements de scène tombent au bon moment.
   Si besoin, corrige les secondes à la main dans `src/timings.json` :

   ```json
   { "starts": [0, 8.6, 18.4, 29.2, 41, 50.8, 61.6, 72.4] }
   ```

Sans `timings.json` rempli (`"starts": null`), les durées estimées de `src/scenes.ts` sont
étirées automatiquement pour couvrir toute la voix. Sans `voix.mp3`, la vidéo utilise les
durées estimées (85 s au total).

## Modifier les textes

Les phrases à l'écran sont dans `src/scenes.ts` (`text`). Entoure un mot d'étoiles
(`*rivière*`) pour le surligner en jaune.

## Rendu

```bash
npm run render        # → out/hippo.mp4
```

Si Remotion ne trouve pas de navigateur, indique un Chrome/Chromium existant :
`REMOTION_CHROME=/chemin/vers/chrome npm run render`.

## Structure

- `src/scenes/` : une scène par section (intro, géant, eau/terre, digestion, arroseur, attention, architecte, conclusion)
- `src/characters/` : hippo, lion, crocodile, poissons, algues, bonhomme bâton (SVG)
- `src/ui.tsx` : textes animés, bulles, eau, soleil/lune
- `tools/sync-voix.mjs` : calage des scènes sur la voix
