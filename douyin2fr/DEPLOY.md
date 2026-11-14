# Déploiement — Douyin → France AI (PWA installable sur iPhone)

> **Rien n'est publié ni payé automatiquement.** Chaque option ci-dessous demande une action de
> votre part (création de compte, carte bancaire). Les prix sont des ordres de grandeur relevés en
> novembre 2026 : vérifiez-les sur le site de l'hébergeur avant de commander.

## Ce que fournit le projet

| Besoin | Fourni |
|---|---|
| HTTPS | Caddy + Let's Encrypt (`deploy/`), ou l'URL HTTPS de l'hébergeur GPU |
| iPhone / Safari | Interface mobile, import depuis Photos/Fichiers avec progression d'envoi |
| Installation sur l'écran d'accueil | Manifeste PWA, icônes, service worker, mode plein écran |
| Suivi en temps réel | Progression, image en cours, temps restant (rafraîchi chaque seconde) |
| Téléchargement | « Télécharger le MP4 » + « Enregistrer dans Photos / Partager » |
| Sécurité | Jeton d'accès obligatoire dès que le serveur est exposé ; vidéos supprimées après 7 jours |
| GPU distant | Image Docker GPU (`Dockerfile`) : OCR + LaMa sur CUDA automatiquement |

## Option A — GPU loué à la demande (recommandée pour démarrer)

Le serveur complet tourne sur une machine GPU que **vous allumez seulement quand vous en avez
besoin** (par ex. RunPod, Vast.ai). Aucun nom de domaine requis : l'hébergeur fournit une adresse
HTTPS du type `https://<id>-8000.proxy.runpod.net`.

1. Construire et publier l'image Docker (une seule fois, depuis un ordinateur) :
   ```bash
   docker build -t <votre-compte-docker>/douyin2fr:gpu \
     --build-arg BASE=nvidia/cuda:12.4.1-cudnn-runtime-ubuntu22.04 --build-arg ORT=onnxruntime-gpu .
   docker push <votre-compte-docker>/douyin2fr:gpu
   ```
2. Chez l'hébergeur, créer un « pod » : image ci-dessus, GPU RTX 4090 (ou L4/A5000), port HTTP 8000,
   volume persistant monté sur `/app/data` (20 Go suffisent), variable `D2F_TOKEN=<secret long>`.
3. Ouvrir sur l'iPhone : `https://<adresse-du-pod>/?token=<secret>`.
4. Arrêter le pod après usage (sinon il est facturé à l'heure).

Inconvénient : l'adresse ne répond que quand le pod est allumé.

## Option B — Serveur permanent avec votre nom de domaine

Pour une adresse fixe (`https://d2f.mondomaine.fr`) toujours disponible :

```bash
# Sur le serveur (Ubuntu avec Docker installé)
git clone <votre dépôt> && cd design/douyin2fr
cp deploy/.env.example deploy/.env       # renseigner DOMAIN et D2F_TOKEN
docker compose -f deploy/docker-compose.yml --env-file deploy/.env up -d --build
```

Le DNS de `DOMAIN` doit pointer vers l'IP du serveur ; Caddy obtient le certificat HTTPS tout seul.
Avec un GPU NVIDIA sur ce serveur, décommenter les lignes GPU dans `deploy/docker-compose.yml`.

## Option C — Votre propre ordinateur, accessible depuis l'iPhone

Gratuit, mais l'ordinateur doit rester allumé et le traitement se fait sur ses ressources.
- Même Wi-Fi : `D2F_HOST=0.0.0.0 D2F_TOKEN=<secret> python -m server.app`, puis
  `http://<ip-du-pc>:8000/?token=<secret>` (HTTP local : l'installation PWA complète exige HTTPS).
- Depuis Internet en HTTPS sans ouvrir de port : Cloudflare Tunnel (gratuit) vers `localhost:8000`.

## Installer l'application sur l'iPhone

1. Ouvrir l'adresse HTTPS dans **Safari** (avec `?token=…` la première fois, ou saisir le jeton
   quand il est demandé).
2. Bouton Partager → **« Sur l'écran d'accueil »** → Ajouter.
3. L'icône « Douyin→FR » s'ouvre en plein écran comme une application. Le jeton doit être saisi
   une fois dans l'application installée (iOS sépare son stockage de celui de Safari).

## Dépenses à prévoir (estimations)

| Poste | Option A (GPU à la demande) | Option B (serveur permanent) | Option C |
|---|---|---|---|
| Calcul | ≈ 0,35–0,90 $/h de GPU allumé (RTX 4090 « community » ≈ 0,34 $/h ; « secure » ≈ 0,69–0,89 $/h) | GPU permanent : ≈ 250–650 $/mois — déconseillé ; CPU 16 vCPU dédié : de l'ordre de 0,2–0,5 $/h, soit ≈ 150–350 $/mois s'il reste allumé | 0 € (électricité) |
| Stockage | Volume 20 Go : ≈ 1–4 $/mois | inclus | — |
| Nom de domaine | inutile | ≈ 10–15 €/an | inutile |
| **Exemple : 20 vidéos de 5 min/mois** | voir temps par vidéo au README §7 ; ordre de grandeur **5–15 $/mois** | **150 $/mois et plus** | **0 €** |

Les prix GPU viennent de comparatifs publiés en 2026 (RunPod) ; les tarifs Hetzner ont changé deux
fois en 2026 : à vérifier sur la page officielle avant commande.

## Avant toute mise en ligne (à faire avec vous)

- [ ] Choisir l'option (A, B ou C) et l'hébergeur
- [ ] Créer le compte / la carte de paiement (vous)
- [ ] Générer un jeton secret long et le garder privé
- [ ] Premier essai GPU : mesurer le temps réel d'une vidéo de 5 min et confirmer le coût
