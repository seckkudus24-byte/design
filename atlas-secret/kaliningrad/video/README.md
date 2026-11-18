# ATLAS SECRET · Kaliningrad : prototype des scènes 1 et 2

Prototype visuel du plan de production V2 (scène 1, « le hook », de 0:00 à 0:06,5 ; scène 2, « localisation », de 0:06,5 à 0:16).
Format vertical 1080 × 1920, 30 i/s, environ 16 s.
Outils : Remotion (React), MapLibre GL (globe), imagerie satellite avec ombrage du relief, frontières Natural Earth 1:10M, voix Piper TTS et FFmpeg.

## Reproduire le rendu
```bash
cd atlas-secret/kaliningrad/video
npm install
pip install piper-tts pillow numpy          # voix off + calcul du relief
mkdir -p cache/voices && cd cache/voices && for e in onnx onnx.json; do \
  curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.$e; done && cd ../..
npm run data     # frontières, polygones, distance oblast → Russie continentale → public/geo/
npm run voice    # voix off segment par segment → public/voice/ + src/generated/timings.json
npm run music    # nappe sonore + souffle (synthèse, libre de droits) → public/audio/
npm run render   # → out/kaliningrad_prototype.mp4 + out/kaliningrad_prototype.srt
```
Autres commandes :
- `npm run stills -- 1.5 6 12` produit des images de contrôle dans `out/stills/`.
- `npm run studio` ouvre un aperçu interactif.

Le rendu se fait par tranches reprenables (`PARTS=2` par défaut ; `CONCURRENCY=4`). Sur une machine sans carte graphique, comptez environ 3 à 6 s par image. Les tuiles (imagerie, relief, ombrage) sont mises en cache dans `cache/tiles/`.

## Où modifier quoi
| Pour… | Fichier |
|---|---|
| Texte et découpage de la voix off, pauses | `src/config/narration.json`, puis `npm run voice` |
| Mouvements de caméra (images-clés calées sur la voix) | `CAMERA` dans `src/config/scenes.ts` |
| Pays colorés, étiquettes, titre, chiffre, mesure | `OVERLAYS` dans `src/config/scenes.ts` |
| Couleurs, polices, sous-titres, crédits | `src/config/style.ts` |
| Imagerie, relief, netteté, étalonnage | `src/config/carte.ts` |
| Fournisseur de tuiles | `scripts/tileserver.mjs` (variables d'environnement, voir ci-dessous) |

## Données, sources et licences
| Élément | Source | Licence / obligation |
|---|---|---|
| Imagerie satellite | **EOX Sentinel-2 cloudless 2016**, sans clé | **CC BY 4.0** : usage commercial permis, crédit obligatoire (incrusté en bas de l'image) |
| Relief (ombrage) | **AWS Terrain Tiles** (terrarium), sans clé, ombrage calculé par `scripts/shade.py` | Données ouvertes : attribution requise (Mapzen et sources SRTM, GMTED, ETOPO1, EU-DEM…) |
| Frontières, pays | **Natural Earth 1:10M** | Domaine public |
| Voix | Piper, voix « siwis » (fr_FR) | Voir la fiche du modèle sur Hugging Face |
| Musique, souffle | Synthèse (`scripts/music.py`) | Libre de droits |
| Polices | Oswald, Playfair Display, Montserrat | SIL Open Font License |

Choix éditoriaux sur les données :
- La **Crimée** n'est pas coloriée comme russe : elle reste internationalement reconnue comme ukrainienne, alors que Natural Earth la rattache à la Russie de fait.
- Seules les **frontières internationales reconnues** sont tracées : pas de lignes « disputées » ni « de contrôle ».
- La distance **363 km** est la plus courte distance à vol d'oiseau entre l'oblast et la Russie continentale (région de Pskov), calculée par `npm run data`.

Autres fournisseurs :
```bash
EOX_LAYER=s2cloudless-2020_3857 npm run render     # EOX 2020 : plus homogène, mais NON commercial (CC BY-NC-SA)
MAP_PROVIDER=maptiler MAP_KEY=votre_cle npm run render
MAP_PROVIDER=mapbox   MAP_KEY=votre_cle npm run render
```
Un fournisseur à clé exige d'adapter le crédit dans `src/config/style.ts` à ses conditions. Le relief fusionné ne fonctionne qu'avec les tuiles servies par `tileserver.mjs`.
