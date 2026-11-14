# Douyin → France AI

Application de traitement vidéo qui **supprime les sous-titres chinois incrustés** dans des vidéos
Douyin et **reconstruit l'arrière-plan** caché derrière eux (video inpainting), avant les étapes
de traduction, voix et sous-titres français.

> **Vidéos acceptées : de quelques secondes à 5 minutes maximum** (au-delà, l'import est refusé
> avec un message clair). Toute l'architecture est dimensionnée pour cette durée.
>
> **État actuel (MVP v0.2)** : la fonctionnalité centrale — détection + suppression + reconstruction —
> est implémentée, testée et mesurée (voir « Résultats mesurés »). Traduction, voix, sous-titres FR et
> recadrage 9:16/16:9/1:1 **ne sont pas encore implémentés** (étapes 2 à 4 du plan).

À utiliser uniquement sur des vidéos que vous avez le droit de réutiliser.

---

## 1. Démarrage rapide

```bash
cd douyin2fr
pip install -r requirements.txt          # Python 3.10+ et FFmpeg requis
python -m server.app                     # → http://127.0.0.1:8000
```

Le modèle LaMa (≈ 200 Mo) est téléchargé automatiquement depuis Hugging Face au premier nettoyage.

En ligne de commande :

```bash
python -m d2f.cli analyze ma_video.mp4 --previews apercus/   # détection seule + images d'aperçu
python -m d2f.cli clean   ma_video.mp4 -o propre.mp4         # analyse + suppression
python -m d2f.cli clean   ma_video.mp4 -o propre.mp4 --method temporal-fast   # plus rapide, sans LaMa
python -m d2f.cli clean   ma_video.mp4 -o propre.mp4 --resolution source      # garder la résolution d'origine
```

Export : `--resolution auto` (défaut) = **1080p minimum** (une source 720p est agrandie en 1080p,
une source 4K reste en 4K), `1080p` = toujours 1080p, `source` = inchangé.

Options utiles : `--stride N` (OCR une image sur N, défaut 3), `--all-text` (effacer tout texte, pas
seulement le chinois), `--region 0,0.3,1,0.9` (ne chercher que dans une zone de l'écran).

Tester la qualité sur une vraie vidéo avec vérité terrain :

```bash
python tests/make_test_video.py video_propre.mp4 avec_sous_titres.mp4   # incruste du chinois
python -m d2f.cli analyze avec_sous_titres.mp4
python -m d2f.cli clean avec_sous_titres.mp4 -o resultat.mp4 --analysis avec_sous_titres.analysis.json
python tests/evaluate.py video_propre.mp4 avec_sous_titres.mp4 avec_sous_titres.analysis.json resultat.mp4
python -m pytest tests -q
```

---

## 2. Faisabilité technique

| Fonction | Faisable ? | Gratuit ? | Matériel |
|---|---|---|---|
| Détection des caractères chinois (OCR) | Oui, fiable | Oui (PP-OCR, Apache-2.0) | CPU suffit |
| Suppression + reconstruction vidéo | Oui ; parfait sur fond récupérable, **plausible mais pas parfait** quand le fond n'est jamais visible | Oui (LaMa Apache-2.0 + code maison) | CPU possible mais lent ; **GPU fortement conseillé** |
| Transcription chinoise (Whisper) | Oui | Oui (faster-whisper, MIT) | CPU OK (lent), GPU conseillé |
| Traduction chinois → français naturelle | Oui | Partiellement : NLLB/Opus-MT gratuits mais traduction plus littérale ; un LLM (API payante) donne un français bien plus naturel | — |
| Voix française | Oui | Oui (Piper, MIT, CPU) ; voix plus naturelles via API payante (ElevenLabs, Azure) | CPU OK |
| Sous-titres FR + SRT + export MP4 | Oui | Oui (FFmpeg/libass) | CPU |

**Limite physique à connaître** : quand un sous-titre reste longtemps au même endroit sur une scène
où rien ne bouge verticalement, les pixels derrière le texte n'ont *jamais* été filmés. Aucune IA ne
peut les « retrouver » : elle les **invente** de façon plausible. L'application récupère d'abord tout
ce qui a été réellement filmé (images voisines), et n'invente que le reste.

## 3. Technologies retenues

| Brique | Choix | Pourquoi |
|---|---|---|
| Décodage/encodage | **FFmpeg** (pipes) | Gère rotation des vidéos de téléphone, fréquence variable, tous les codecs ; audio d'origine recopié sans ré-encodage |
| Analyse d'image | **OpenCV** | Flux optique DIS (rapide sur CPU), morphologie |
| OCR chinois | **PP-OCR (PaddleOCR) via RapidOCR + ONNX Runtime** | Même qualité que PaddleOCR, sans dépendre de PaddlePaddle ; modèles chinois inclus |
| Inpainting d'image | **LaMa** (ONNX) | Référence open source, Apache-2.0 (usage commercial OK) |
| Cohérence temporelle | **Propagation bidirectionnelle par flux optique** (code maison, `d2f/inpaint/flowprop.py`) | Récupère le vrai arrière-plan dans les autres images ; évite scintillement et dérive |
| Interface | **FastAPI + HTML/JS** | Local, léger, file d'attente intégrée |

Évalué mais non intégré à ce stade : **ProPainter** (meilleur modèle vidéo open source, mais licence
**non commerciale** S-Lab, et PyTorch + GPU nécessaires) — prévu comme moteur optionnel interchangeable
(`ClipInpainter`). Son exécution n'a pas pu être testée dans l'environnement de développement.

## 4. Architecture

```
d2f/
  video_io.py        probe / lecture / écriture FFmpeg (audio d'origine conservé)
  detect.py          OCR + filtre « contient des idéogrammes chinois » + zone optionnelle
  masks.py           masques image par image : union des images-clés, comblement des trous, marge
  inpaint/
    base.py          registre des moteurs d'image (telea, lama)   ← remplaçables
    lama.py          LaMa ONNX, fenêtres glissantes à résolution native
    clip.py          interface des moteurs vidéo (ClipInpainter)  ← ProPainter s'y branchera
    flowprop.py      moteur vidéo temporel bidirectionnel (CPU)
  pipeline.py        analyse → masques → découpage en clips/bandes → moteur → encodage
  cli.py             ligne de commande
server/
  app.py, jobs.py    API + file d'attente (pause, annulation, statut, progression)
  static/            interface sombre : import multiple, aperçus de détection, avant/après, téléchargement
tests/               tests unitaires, générateur de vidéos de test, évaluation avec vérité terrain
```

Déroulé du nettoyage :

1. **Analyse** : OCR toutes les `stride` images ; on garde les boîtes dont le texte contient du chinois.
2. **Masques** : pour chaque image, union des boîtes des images-clés voisines (couvre les changements
   de sous-titre), trous de détection comblés, détections isolées douteuses écartées, marge de ~22 %
   de la hauteur du texte (contour noir, ombre, anticrénelage).
3. **Clips** : la vidéo est traitée par clips de 150 images (+ 24 images futures comme sources,
   + 12 images déjà finalisées du clip précédent pour la continuité), recadrés sur les bandes de texte.
4. **Moteur temporel** : (a) vrais pixels d'arrière-plan tirés des images ±1…±60 alignées par flux
   optique, chaque tuile validée sur l'anneau de pixels connus qui l'entoure ; (b) propagation avant et
   arrière avec un « âge » par pixel, fusion pondérée → pas de dérive ni de scintillement ; (c) LaMa
   uniquement pour ce qui n'a jamais été visible, puis propagé.
5. **Encodage** H.264 CRF 16, même résolution et cadence, audio d'origine recopié. L'original n'est
   jamais modifié (fichier en lecture seule dans le dossier de travail).

Protection des fichiers : serveur limité à `127.0.0.1` par défaut ; exposition réseau refusée sans
`D2F_TOKEN` ; identifiants de travaux aléatoires ; dossiers en `0700` ; taille d'import limitée
(`D2F_MAX_MB`) ; noms de fichiers jamais utilisés comme chemins.

---

## 5. Conception pour des vidéos de 5 minutes maximum

| Exigence | Solution |
|---|---|
| Durée 0,3 s – 5 min | Vérifiée à l'import (interface, API, ligne de commande) ; refus explicite au-delà |
| Toute la durée traitée | OCR sur 1 image sur 3 de toute la vidéo, masques image par image, aucune image sautée |
| Qualité constante | Traitement par **segments de 120 images** ; chaque segment reçoit les 12 dernières images *déjà nettoyées* du précédent (référence) et 24 images futures (sources) → pas de rupture aux jointures ; mêmes paramètres du début à la fin |
| Mémoire bornée | Lecture en flux (FFmpeg), seul le segment courant est en mémoire, recadré sur la bande de texte ; masques régénérés à la demande ; caches limités. Mémoire indépendante de la durée (mesures §6) |
| Pas de blocage | Erreurs FFmpeg redirigées vers un fichier (un tube non lu peut figer FFmpeg sur une longue vidéo) ; arrêt propre en cas d'erreur ; annulation prise en compte en quelques secondes, même au milieu d'un segment |
| Synchronisation audio/vidéo | Décodage à cadence constante sur la chronologie du fichier (fréquence variable des téléphones et retard de début de piste compensés) ; même nombre d'images et même cadence en sortie ; audio d'origine recopié sans réencodage. Vérifié par un test « flash + bip » avec piste vidéo décalée de 0,4 s |
| Sans GPU | Tout fonctionne sur CPU ; le moteur temporel limite les appels au modèle LaMa (le plus coûteux) aux zones jamais visibles |
| Progression | Pourcentage, image en cours et **temps restant estimé**, pour l'analyse et le nettoyage |

## 6. Résultats mesurés

Banc d'essai : 4 cœurs CPU, **sans GPU**. Vidéos réelles (sans texte) sur lesquelles on a incrusté
des sous-titres chinois style Douyin (blanc, contour noir, mot-clé jaune, milieu d'écran) avec
`tests/make_test_video.py` — la vidéo propre d'origine sert de vérité terrain (`tests/evaluate.py`).

| Vidéo | Méthode | Pixels de texte oubliés | Erreur moy. dans la zone (↓) | PSNR zone (↑) | Temps |
|---|---|---|---|---|---|
| Éventail, 1080×1920, 113 img., texte sur l'objet en mouvement | Diffusion OpenCV | 0 | 16,6 | 20,0 dB | 18 s |
| | **Temporel (défaut)** | 0 | **8,1** | **25,2 dB** | 89 s |
| Danseuse, 854×480, 90 img., caméra en mouvement, texte sur la personne et la foule | Diffusion OpenCV | 25 px / 1,3 M | 43,8 | 12,8 dB | 7 s |
| | **Temporel (défaut)** | 25 px / 1,3 M | **33,3** | **14,0 dB** | 99 s |

Lecture honnête :

- **Détection** : 100 % des pixels du texte couverts sur l'éventail, 99,998 % sur la danseuse ; texte
  chinois reconnu à l'identique. Aucune ligne n'est oubliée.
- **Éventail** : le texte disparaît sans trace visible ; ~85 % de la zone est reconstruite avec le
  *vrai* arrière-plan récupéré dans les autres images. Léger flou ponctuel sur les doigts en mouvement.
- **Danseuse** (cas difficile : foule texturée + panoramique) : plus aucun caractère, mais des
  **raccords en blocs et des zones floues restent visibles** à l'arrêt sur image. C'est le cas où
  un moteur vidéo neuronal (ProPainter, sur GPU) devrait apporter le plus. Prochaine priorité.
- Deux défauts trouvés et corrigés pendant les tests : texte fantôme recopié par LaMa (masque
  mal complété en bord de fenêtre) et dérive de la propagation dans un seul sens (passée en
  bidirectionnelle).

## 7. Coûts estimés

**Mesures CPU (4 cœurs)** — analyse ≈ 0,08 s/image en 1080p ; nettoyage ≈ 0,8 s/image (scène où
le fond est récupérable) à 2–4 s/image (scène difficile où LaMa travaille souvent, estimation
extrapolée de la danseuse en 480p). À 30 images/s :

| Durée | CPU local (4 cœurs) | GPU cloud *(estimation, non mesurée)* |
|---|---|---|
| 1 min | ≈ 25 min à 2 h | ≈ 8–20 min → 0,10 à 0,30 € |
| 3 min | ≈ 1 h 15 à 6 h | ≈ 25–60 min → 0,30 à 0,80 € |
| 5 min | ≈ 2 h à 10 h | ≈ 40–100 min → 0,50 à 1,30 € |

- **Coût local** : uniquement l'électricité (quelques centimes). Aucun abonnement.
- **Infrastructure** : un GPU cloud à la demande se loue ~0,40–0,80 €/h (RTX 4090 / A10 chez les
  loueurs à l'heure). Le gain GPU vient de LaMa (≈ 3,3 s par fenêtre sur CPU, quelques dizaines de ms
  sur GPU) ; le flux optique reste sur CPU dans cette version.
- **API** : **aucune** pour la suppression des sous-titres. Pour les étapes futures (ordre de grandeur
  à vérifier sur les grilles tarifaires au moment de l'intégration) : transcription Whisper local
  gratuit ; traduction par LLM via API < 0,02 € par minute de dialogue ; voix : Piper gratuit, ou
  API vocale premium ≈ 0,10–0,30 € par minute.

## 8. Plan de développement

1. ✅ **Suppression des sous-titres (MVP)** — détection, masques, reconstruction temporelle, interface,
   lots, comparaison avant/après, tests mesurés.
2. **Qualité de suppression** (priorité absolue)
   - moteur ProPainter optionnel (GPU, licence non commerciale — à valider selon votre usage) ;
   - `onnxruntime-gpu` pour LaMa ; flux optique RAFT sur GPU ;
   - édition manuelle des zones (ajouter/retirer une boîte, plage de temps) dans l'interface ;
   - banc d'essai élargi (vraies vidéos Douyin autorisées que vous fournirez).
3. **Transcription + traduction** : faster-whisper (local) → traduction (NLLB local ou LLM via API au
   choix) → éditeur de texte avant validation.
4. **Voix + sous-titres FR** : Piper (local) / API premium optionnelle ; voix H/F, vitesse, volume,
   mixage ou son d'origine ; sous-titres ASS stylés (police, couleur, contour, position) + export SRT.
5. **Export** : 9:16 / 16:9 / 1:1 (recadrage ou fond flou), 1080p, 4K si la source le permet.
6. **Durcissement** : comptes, quotas, nettoyage automatique des fichiers, déploiement GPU.
