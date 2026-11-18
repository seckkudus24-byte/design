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
**Distance (vérification finale) :** `npm run data` cherche la plus courte distance entre le contour de l'oblast et celui de la Russie continentale. Le calcul se fait sur les frontières **geoBoundaries gbOpen** (détaillées, ≈ 19 000 sommets pour l'oblast), avec un repli sur Natural Earth si elles sont indisponibles. Le script compare toutes les paires de sommets (sphère), puis calcule la distance précise entre les deux points retenus sur l'ellipsoïde **WGS84** (formule inverse de Vincenty).
- départ : **22,85524° E, 54,88788° N**, pointe est de l'oblast, sur la frontière lituanienne ;
- arrivée : **28,15743° E, 56,14318° N**, frontière de la Russie continentale avec la Biélorussie (région de Pskov), à 1–3 km du point triple Lettonie–Biélorussie–Russie.

| Contrôle | Distance |
|---|---|
| geoBoundaries, WGS84 (**valeur retenue**) | **362,8 km → « ≈ 363 km »** |
| départ geoBoundaries → point triple publié (56,170° N, 28,151° E) | 363,5 km |
| Natural Earth 1:10M (valeur précédente) | 364,4 km : contour simplifié, pointe est de l'oblast ≈ 2 km trop à l'ouest |

C'est une distance **à vol d'oiseau** : la ligne est tracée sur le grand cercle entre ces deux points. Ce n'est pas un trajet routier.

Le chiffre n'apparaît qu'une fois la ligne entièrement tracée : aucun compteur intermédiaire ne peut être lu comme une donnée. Il s'affiche en chiffres alignés : les chiffres elzéviriens de Playfair faisaient lire « 364 » comme « 304 » sur un téléphone.

**Scène 1 :** le pointillé avec « ? » a été retiré. Il n'était pas appelé par la narration, et il doublait la ligne de mesure de la scène 2.

**Caméra :** elle démarre déjà en mouvement et garde une dérive lente jusqu'à la dernière image. `node out/camcheck.mjs` analyse la trajectoire (après `npx esbuild scripts/camcheck.ts --bundle --platform=node --format=esm --outfile=out/camcheck.mjs --loader:.css=empty --loader:.woff=empty --loader:.woff2=empty`).

**Vérification d'un rendu :** `bash scripts/verify.sh out/kaliningrad_prototype.mp4` donne la résolution, la cadence, le nombre d'images, la durée, les codecs, le rapport d'aspect, les images noires, la sonie et les pics de mouvement.

**Livraison :** la vidéo est aussi fournie dans une archive, non versionnée : `cd rendu && zip -0 kaliningrad_prototype_1080x1920.zip kaliningrad_prototype.mp4 kaliningrad_prototype.srt verification.txt`. Un fichier compressé dans une archive n'est pas réencodé par les aperçus des messageries ou des applications, qui peuvent réduire une vidéo à 512 × 910 pour l'affichage.

---

# Épisode complet (scènes 1 à 13)

## Reproduire le rendu
```bash
npm run data            # données des scènes 1–2 (frontières, mesure 363 km)
npm run data:episode    # données des scènes 3–13 (lignes, zones historiques, cercle Iskander)
python3 scripts/archives_direct.py   # images d'archives (vignettes Wikimedia Commons) + licences
npm run voice           # voix off complète (scènes 3–13 : débit 0,94, même voix)
npm run music           # musique + effets (synthèse) et positions des effets
npm run render:episode  # → out/kaliningrad_episode1.mp4 + .srt
```
`render:episode` **réutilise les 478 images validées des scènes 1–2** (`out/proto/video_scenes_1_2.mp4`). Si ce fichier manque, il les re-rend depuis la composition « Prototype », qui est figée. La suite (composition « Episode ») est rendue par tranches reprenables (`out/ep/part_N.mp4`), puis l'audio est mixé par `scripts/mixaudio.mjs`, avec une musique qui s'efface sous la voix (compression déclenchée par la voix).

## Fichiers
| Fichier | Rôle |
|---|---|
| `src/config/narration.json` | Voix off des 13 scènes (texte du plan V2, découpé en segments ; `tts` = graphie phonétique pour Königsberg, Suwałki, Królewiec, Iskander, URSS) |
| `src/config/episode.ts` | Caméra et calques des scènes 3–13, raccord de vitesse avec la scène 2, étalonnage |
| `src/overlays/Episode.tsx` | Nouveaux éléments : tampons de date, archives épinglées, noms qui se désagrègent, zones historiques, flèches, anneau, flux, itinéraires, cercle de portée, frise, badge, noms empilés, écran de fin |
| `src/VideoEpisode.tsx` | Composition « Episode » ; le sépia « archives » ne s'applique qu'à la carte, les couleurs-codes restent justes |
| `scripts/geodata_episode.mjs` | Données des scènes 3–13 |
| `scripts/archives_direct.py` | Images d'archives et licences |
| `scripts/music.py`, `scripts/mixaudio.mjs` | Bande-son et mixage |

## Sources des données affichées
| Scène | Donnée | Source |
|---|---|---|
| 4 | 1255, 1701, Kant (1724–1804) | Plan V2 (F4–F6) : Wikipedia, Stanford Encyclopedia of Philosophy |
| 5 | Corridor polonais, frontières de 1930 | **historical-basemaps** (A. Ourednik, GPL-3.0), précision « échelle continentale » : affiché en **zones adoucies**, avec la mention « tracé simplifié » à l'écran |
| 6 | Août 1944, 6–9 avril 1945, capitulation le 9 avril | Plan V2 (F8–F9) ; directions d'attaque **schématiques** : 43ᵉ et 50ᵉ armées au nord et au nord-ouest, 11ᵉ armée de la Garde au sud (Wikipedia, *Battle of Königsberg*) |
| 7 | Potsdam, ligne de partage | Protocole de Potsdam (Avalon, FRUS) ; la ligne tracée est la **frontière actuelle oblast–Pologne**, fixée par l'accord polono-soviétique du **16 août 1945** ; règlement définitif : traité « 2+4 » (1990) |
| 8 | 4 juillet 1946, 1947–1948 | Plan V2 (F11–F12) ; flux sans chiffres |
| 9 | 7 avril 1946, 11 mars 1990, 6 sept. 1991, 26 déc. 1991 | Plan V2 (F11, F23) ; limites des républiques = frontières actuelles (inchangées en 1991) ; l'Ukraine fait partie de l'URSS |
| 10 | OTAN / UE, liaisons | Plan V2 (F15, F24) ; ferry **Baltiïsk – Oust-Louga** (Rosmorport, PortNews) ; vols par les **eaux internationales de la Baltique** depuis 2022 (Rosaviatsia, via Interfax / TASS) ; train via la Lituanie (document de transit facilité depuis 2003). Tracés schématiques |
| 11 | Baltiïsk, Iskander depuis 2018, 500 km | Plan V2 (F16–F17) ; cercle géodésique de 500 km centré sur **Tcherniakhovsk**, base de la 152ᵉ brigade de missiles de la Garde (Jamestown, Russian Defense Policy, 2018) |
| 12 | ≈ 104 km, ≈ 65 km | Frontière Pologne–Lituanie : 104,3 km (garde-frontières lituaniens) ; 65,4 km à vol d'oiseau oblast–Biélorussie, calculés (geoBoundaries + Natural Earth, WGS84) |
| 13 | Königsberg 1255–1946, Kaliningrad depuis 1946, Królewiec (2023) | Plan V2 (F4, F11, F20) |

## Images d'archives (Wikimedia Commons)
| Scène | Image | Auteur | Licence |
|---|---|---|---|
| 4 | Château de Königsberg, vers 1900 (photochrome) | inconnu | domaine public |
| 4 | Emmanuel Kant, 1768 | Johann Gottlieb Becker | domaine public |
| 6 | Königsberg après les raids, août 1944 | Fritz Krauskopf (1882–1945) | domaine public |
| 7 | Attlee, Truman et Staline à Potsdam, 1945 | photographe officiel (US) | domaine public |
| 8 | Mikhaïl Kalinine, années 1920 | inconnu | domaine public |
| 11 | Lanceur Iskander-M (exercice de 2018, lieu non précisé) | Алексей Иванов (mil.ru) | **CC BY 4.0** : crédit incrusté sous l'image |

Une légende factuelle est incrustée sous chaque image. Depuis cet environnement, Wikimedia limite l'API et les fichiers originaux (erreur 429) : le script télécharge les vignettes standard (500 à 1 280 px) et recopie les licences vérifiées lors de la sélection.

### Fichiers livrés (épisode)
- `rendu/kaliningrad_episode1_diffusion.mp4` : 1080×1920, 30 i/s, H.264 High (≈ 5,5 Mb/s) + AAC 48 kHz, −14 LUFS — version versionnée (limite GitHub 100 Mo).
- Master qualité maximale (CRF 18, ≈ 14 Mb/s, 210 Mo) : régénéré par `npm run render:episode` dans `out/kaliningrad_episode1.mp4` (non versionné, trop lourd pour GitHub).
- `rendu/kaliningrad_episode1.srt`, `rendu/episode1_planche_contact.jpg`, `rendu/verification_episode1.txt`.
