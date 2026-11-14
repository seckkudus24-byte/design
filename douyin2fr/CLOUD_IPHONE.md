# Douyin → France AI — 100 % cloud, piloté depuis un iPhone

Pour un utilisateur **sans ordinateur** : tout se fait dans Safari (ou l'app GitHub) sur l'iPhone.
**Aucun abonnement.** Seul le temps de GPU réellement utilisé est consommé, d'abord sur les
crédits gratuits mensuels de Modal.

> Rien n'est créé ni payé automatiquement : les étapes 1 à 4 ci-dessous sont faites par vous.

## Architecture

```
 iPhone (PWA installée sur l'écran d'accueil)
    │  HTTPS — https://<votre-compte>--douyin2fr.modal.run
    ▼
 Serveur web (conteneur CPU léger, Modal)          s'éteint seul après 20 min sans activité
  • interface, mot de passe, envoi par morceaux de 16 Mo (reprise si la 4G coupe)
  • file d'attente, progression en temps réel, téléchargement du MP4
    │  lance un traitement                        ▲ progression chaque seconde
    ▼                                             │
 Fonction GPU (NVIDIA L4 + 4 cœurs, Modal)       démarre pour chaque vidéo, s'arrête juste après
  • OCR chinois + LaMa sur GPU, flux optique sur les cœurs CPU
    │
    ▼
 Stockage temporaire (Volume Modal)              privé, vidéos effacées après 2 jours
```

- **Sécurité** : mot de passe obligatoire sur toute l'API (vidéos, résultats) ; HTTPS de bout en
  bout ; stockage privé au compte Modal ; effacement automatique toutes les 6 h des vidéos de plus
  de 2 jours.
- **Si le serveur web s'éteint pendant un traitement** (téléphone verrouillé longtemps), le calcul
  GPU continue ; à la réouverture de l'application, le résultat est récupéré sans relancer le calcul.
  Les vidéos *en attente* reprennent quand l'application est rouverte.

## Mise en place depuis l'iPhone (≈ 15 min, une seule fois)

1. **Fusionner le code sur la branche principale** du dépôt `design` (GitHub n'affiche le bouton
   « Run workflow » que pour la branche principale `master`) : je peux ouvrir la demande de
   fusion (pull request) si vous me le demandez ; vous la validez dans l'app GitHub.
2. **Créer un compte Modal** : [modal.com](https://modal.com) dans Safari → *Sign up* (par exemple
   avec votre compte GitHub). Plan **Starter, gratuit**, 30 $ de crédits de calcul par mois.
3. **Créer un jeton API Modal** : modal.com → *Settings* → *API Tokens* → *New Token*. Notez
   l'identifiant (`ak-…`) et le secret (`as-…`).
4. **Enregistrer 3 secrets dans GitHub** : github.com (Safari, « Version pour ordinateur ») → dépôt
   `design` → *Settings* → *Secrets and variables* → *Actions* → *New repository secret* :
   - `MODAL_TOKEN_ID` = l'identifiant `ak-…`
   - `MODAL_TOKEN_SECRET` = le secret `as-…`
   - `D2F_APP_PASSWORD` = un mot de passe long (12 caractères minimum) pour l'application
5. **Déployer** : app GitHub → dépôt `design` → *Actions* → « Déployer Douyin → France AI (Modal) »
   → *Run workflow* (action `deploy`, GPU `L4`). Après 5 à 10 min, le résumé du workflow affiche
   l'adresse `https://…modal.run`.
6. **Installer sur l'iPhone** : ouvrir l'adresse dans Safari → saisir le mot de passe → bouton
   Partager → *Sur l'écran d'accueil*.

Mettre à jour plus tard : relancer le workflow (`deploy`). Tout couper : workflow avec `stop`.

## Coût estimé par vidéo (GPU NVIDIA L4 chez Modal)

Tarifs relevés en novembre 2026 (à vérifier sur modal.com/pricing) : L4 ≈ 0,80 $/h ; 4 cœurs
≈ 0,19 $/h ; 16 Go de mémoire ≈ 0,13 $/h → **≈ 1,12 $ par heure de traitement**, facturé à la
seconde. Le serveur web coûte ≈ 0,06 $/h quand il est allumé.

Durées de traitement **estimées** à partir des mesures CPU de ce projet (le GPU accélère l'OCR et
LaMa ≈ 50 à 100 fois ; le flux optique reste sur les 4 cœurs) — **non mesurées sur GPU** :

| Vidéo | Scène calme (fond récupérable) | Scène très animée | Coût estimé |
|---|---|---|---|
| 1 min | ≈ 5 min | ≈ 10 min | **0,10 – 0,20 $** |
| 3 min | ≈ 15 min | ≈ 30 min | **0,30 – 0,60 $** |
| 5 min | ≈ 25 min | ≈ 50 min | **0,50 – 1,00 $** |

Avec les **30 $ de crédits gratuits mensuels**, cela représente environ 30 à 60 vidéos de 5 min
par mois sans rien payer. Au-delà, il faudra ajouter un moyen de paiement chez Modal (facturation
à l'usage, toujours sans abonnement) — à décider plus tard, avec votre accord.

Coûts fixes mensuels : **0 €** (pas de nom de domaine, stockage inclus jusqu'à 1 To, GitHub
Actions gratuit pour ce volume).

## Solutions étudiées

| Solution | Gratuit au départ | Paiement à l'usage | Pilotable depuis l'iPhone | Verdict |
|---|---|---|---|---|
| **Modal** (Starter) | 30 $/mois de crédits | oui, à la seconde | oui (GitHub Actions) | **retenue** : tout en un (web + GPU + stockage + HTTPS) |
| RunPod Serverless | non (crédit prépayé) | oui, à la seconde (≈ 0,58–0,69 $/h GPU 16–24 Go) | oui | plus de pièces à assembler (image Docker publiée, hébergement web et stockage séparés) |
| Hugging Face Spaces | non | — | oui | application Docker réservée à l'abonnement PRO (≈ 9 $/mois) |
| Pod GPU loué à l'heure | non | à l'heure, à éteindre soi-même | oui | risque d'oubli d'extinction ; adresse qui change |
| Oracle Cloud « Always Free » | oui | — | difficile | pas de GPU ; mise en place technique lourde |

## Limites connues

- La qualité visuelle est celle mesurée dans le README (défauts possibles sur sujets en mouvement).
- Le chemin GPU n'a pas encore pu être exécuté réellement : le premier déploiement servira de
  mesure (le rapport de chaque vidéo indique le matériel utilisé et les durées).
- Le téléchargement d'un très gros MP4 sur réseau mobile lent peut être long ; préférez le Wi-Fi.
