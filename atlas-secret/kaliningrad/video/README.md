# ATLAS SECRET · Kaliningrad : prototype des scènes 1 et 2 (version 2)

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

## Version 2 : ce qui a changé
| Domaine | Changement | Fichier |
|---|---|---|
| Caméra | Trajectoire **continue**, sans arrêt aux images-clés (interpolation cubique monotone de la position, du zoom, de l'inclinaison et de la rotation). Départ en vue large de l'Europe du Nord, approche progressive de Kaliningrad avec un glissement latéral, puis élévation vers une vue cartographique plus large. | `src/camera.ts` (`cameraSpline`), `CAMERA` dans `src/config/scenes.ts` |
| Scène 1 | Russie continentale identifiable dès l'ouverture ; pointillé avec « ? » ; révélation de l'oblast (contour lumineux, puis ambre) avec un léger assombrissement alentour (isolement) ; titre en Playfair Display, fondu et resserrement de l'espacement, sans effet lettre par lettre. | `OVERLAYS`, `Overlays.tsx` (`Title`, `Spot`) |
| Scène 2 | Noms des pays progressifs ; chiffre « 1 million » en typographie éditoriale ; distance tracée sur le **grand cercle** (géodésique réelle) avec compteur, puis la mention « À vol d'oiseau · distance la plus courte entre les frontières, pas un trajet routier ». | `Overlays.tsx` (`Stat`, `Measure`) |
| Étiquettes | Une étiquette dont le lieu sort du cadre s'efface au lieu de se coller au bord de l'écran. | `Overlays.tsx` (`Label`) |
| Sous-titres | Montserrat 50 px, contour léger et ombre douce ; centrés à 72,5 % de la hauteur, 820 px de large au maximum (zone sûre TikTok). | `src/Subtitles.tsx`, `src/config/style.ts` |
| Netteté | Tuiles plus fines (`tileSize` 192) et suréchantillonnage ×1,25. | `src/config/carte.ts` |

Vérification géographique de la ligne de distance (`npm run data` puis contrôle sur le grand cercle) : 363 km de l'oblast à la Russie continentale. La ligne traverse la Lituanie (≈ 240 km), puis la Lettonie, et arrive au point où se rejoignent les frontières lettone, biélorusse et russe.

## Version 3 : précision et contrôle technique
**Distance :** les deux points sont calculés par `npm run data` (plus courte distance entre les sommets des frontières Natural Earth 1:10M) :
- départ : 22,821° E, 54,885° N, pointe est de l'oblast, sur la frontière lituanienne ;
- arrivée : 28,149° E, 56,142° N, frontière de la Russie continentale (région de Pskov), près du tripoint Lettonie–Biélorussie–Russie.

| Méthode | Distance |
|---|---|
| Ellipsoïde WGS84, formule de Vincenty (**valeur affichée**) | **364,4 km** |
| Sphère (haversine) | 363,3 km |
| Contrôle avec les données 1:50M | 364,8 km (WGS84) |

Le chiffre n'apparaît qu'une fois la ligne entièrement tracée : aucun compteur intermédiaire ne peut être lu comme une donnée. Il s'affiche en chiffres alignés : les chiffres elzéviriens de Playfair faisaient lire « 364 » comme « 304 » sur un téléphone.

**Scène 1 :** le pointillé avec « ? » a été retiré. Il n'était pas appelé par la narration, et il doublait la ligne de mesure de la scène 2.

**Caméra :** elle démarre déjà en mouvement et garde une dérive lente jusqu'à la dernière image. `node out/camcheck.mjs` analyse la trajectoire (après `npx esbuild scripts/camcheck.ts --bundle --platform=node --format=esm --outfile=out/camcheck.mjs --loader:.css=empty --loader:.woff=empty --loader:.woff2=empty`).

**Vérification d'un rendu :** `bash scripts/verify.sh out/kaliningrad_prototype.mp4` donne la résolution, la cadence, le nombre d'images, la durée, les codecs, le rapport d'aspect, les images noires, la sonie et les pics de mouvement.

**Livraison :** la vidéo est aussi fournie dans une archive, non versionnée : `cd rendu && zip -0 kaliningrad_prototype_1080x1920.zip kaliningrad_prototype.mp4 kaliningrad_prototype.srt verification.txt`. Un fichier compressé dans une archive n'est pas réencodé par les aperçus des messageries ou des applications, qui peuvent réduire une vidéo à 512 × 910 pour l'affichage.
