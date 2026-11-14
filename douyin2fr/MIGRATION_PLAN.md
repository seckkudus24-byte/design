# Plan de migration — Douyin → France AI en site web (iPhone uniquement)

Statut : **proposition, à valider**. Aucune modification importante du code ni aucun service payant
avant votre accord.

## 1. Analyse de l'existant (conservé tel quel)

| Fonctionnalité demandée | État actuel | Ce qui manque |
|---|---|---|
| 1. Import depuis la galerie iPhone | ✅ PWA Safari, envoi par morceaux de 16 Mo avec reprise | — |
| 2. Vidéos ≤ 5 min | ✅ vérifié à l'import, testé sur 5 min complètes | — |
| 3. Détection des sous-titres | ✅ chinois (OCR PP-OCR) ; option « tout texte » | mode **multilingue** fiable (ne pas effacer enseignes/logos) |
| 4. Suppression + reconstruction | ✅ moteur temporel + LaMa (qualité mesurée, limites sur sujets en mouvement) | amélioration future (modèle vidéo GPU) |
| 5. Traduction en français | ❌ | transcription + traduction + éditeur de texte |
| 6. Voix française | ❌ | synthèse vocale, mixage, synchronisation |
| 7. Sous-titres français personnalisables | ❌ | style, position, SRT, incrustation |
| 8. Téléchargement MP4 | ✅ + « Enregistrer dans Photos » | — |
| Progression en temps réel | ✅ % + temps restant | — |
| Stockage temporaire sécurisé | ✅ mot de passe, effacement après 2 jours | — |
| Backend GPU à l'usage | ✅ préparé (Modal), testé en simulation | premier déploiement réel |

Code réutilisé sans réécriture : `d2f/` (vidéo, OCR, masques, inpainting), `server/` (API, file
d'attente, exécution locale ou GPU distante), `server/static/` (interface PWA), `deploy/modal_app.py`,
le workflow GitHub Actions et les 13 tests.

## 2. Architecture cible

```
iPhone Safari ──▶ Interface (Cloudflare Pages, gratuit)   https://douyin2fr.pages.dev
                      │ appels API (HTTPS + mot de passe)
                      ▼
                  API (Modal, petit conteneur CPU)         file d'attente, progression, téléchargements
                      │
                      ▼
                  Traitements (Modal, GPU L4 à la seconde)  OCR · suppression · Whisper · traduction · voix · montage
                      │
                  Stockage temporaire (Volume Modal, privé, effacé après 2 jours)
Déploiement : GitHub Actions lancé à la main depuis l'iPhone (aucun ordinateur)
```

## 3. Modèles open source proposés (licences compatibles usage commercial)

| Étape | Modèle | Licence | Remarque |
|---|---|---|---|
| Texte incrusté (chinois) | PP-OCR (déjà en place) | Apache-2.0 | le texte reconnu donne déjà les dialogues + horaires, souvent sans transcription audio |
| Texte incrusté (autres langues) | PP-OCR multilingue | Apache-2.0 | + règles « sous-titre » (ligne stable, même zone) pour épargner enseignes et logos |
| Transcription audio | Whisper large-v3-turbo (faster-whisper) | MIT | si pas de sous-titres incrustés ou pour vérifier |
| Traduction naturelle | Qwen2.5-7B-Instruct | Apache-2.0 | français idiomatique, tient le contexte ; tourne sur le GPU L4 |
| Séparation voix / musique | Demucs | MIT | retire la voix chinoise, garde musique et bruitages |
| Voix française | Piper (voix H/F) ou Kokoro | MIT / Apache-2.0 | licence à vérifier voix par voix |
| Sous-titres FR, montage, export | FFmpeg + libass | LGPL | police, couleur, contour, position, SRT, 9:16 / 16:9 / 1:1 |

Écartés (usage non commercial) : NLLB-200, XTTS-v2, F5-TTS, MiniMax-Remover, ProPainter.

## 4. Services, coûts et limites des offres gratuites

| Service | Rôle | Gratuit | Limites de l'offre gratuite | Payant si… |
|---|---|---|---|---|
| GitHub | code + déploiement | oui | Actions : 2 000 min/mois (dépôt privé) ; un déploiement ≈ 5 min | jamais pour cet usage |
| Cloudflare Pages | interface web | oui | 500 publications/mois, bande passante statique non limitée, 1 publication à la fois | jamais pour cet usage |
| Modal (Starter) | API + GPU + stockage | 30 $/mois de crédits | crédits non reportables ; 10 GPU simultanés max ; démarrage à froid du GPU (≈ 10–60 s) ; au-delà des crédits : ajouter un moyen de paiement | uniquement si > ~30–60 vidéos de 5 min/mois |
| Nom de domaine | adresse personnalisée | — | inutile (`*.pages.dev` et `*.modal.run` fournis en HTTPS) | optionnel ≈ 10–15 €/an |

Coûts estimés par vidéo, toutes fonctions (GPU L4 ≈ 1,12 $/h tout compris, facturé à la seconde) :

| Vidéo | Suppression des sous-titres | + transcription, traduction, voix, montage | Total estimé |
|---|---|---|---|
| 1 min | 0,10 – 0,20 $ | ≈ 0,03 – 0,05 $ | **0,13 – 0,25 $** |
| 3 min | 0,30 – 0,60 $ | ≈ 0,05 – 0,10 $ | **0,35 – 0,70 $** |
| 5 min | 0,50 – 1,00 $ | ≈ 0,08 – 0,15 $ | **0,60 – 1,15 $** |

Estimations extrapolées des mesures CPU ; à confirmer au premier déploiement (le rapport de chaque
vidéo indique le matériel et les durées réelles). Option payante facultative : traduction par une API
de LLM commerciale (≈ 0,01 $ par vidéo) si la qualité de Qwen ne suffit pas — seulement avec votre accord.

## 5. Plan de migration par étapes (chacune testable depuis l'iPhone)

| Étape | Contenu | Prérequis de votre part |
|---|---|---|
| 0 | Fusion vers `master` ; comptes Modal + Cloudflare ; 3 secrets GitHub | validation de la PR, création des comptes |
| 1 | Mise en ligne de l'existant : API + GPU sur Modal, interface sur Cloudflare Pages (adresse API configurable, CORS) ; mesure réelle des durées et coûts GPU | lancer le workflow |
| 2 | Détection multilingue + règles « sous-titre » + choix de la langue source | — |
| 3 | Dialogues : texte OCR des sous-titres, Whisper en secours, traduction Qwen ; **éditeur** de traduction dans l'interface | — |
| 4 | Voix française (H/F, vitesse, volume), suppression de la voix d'origine (Demucs), synchronisation ; option « garder le son original » | — |
| 5 | Sous-titres FR personnalisables (aperçu), SRT, formats 9:16 / 16:9 / 1:1, export MP4 final | — |

Chaque étape conserve les précédentes et ajoute ses tests automatiques.
