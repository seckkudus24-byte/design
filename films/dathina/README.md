# DATHINA — Épisode 1 (short TikTok)

Montage vertical 9:16, 1080 × 1920, 30 i/s, H.264 High (≈ 7,5 Mb/s) + AAC 256 kb/s 48 kHz, 87,4 s, −14 LUFS / −1,5 dBTP.

## Livrables (`export/`)

| Fichier | Contenu |
|---|---|
| `dathina.mp4` | Version finale avec sous-titres |
| `dathina_sans_sous_titres.mp4` | Même montage sans sous-titres (le carton final « À SUIVRE… » est conservé) |
| `dathina_miniature.jpg` | Miniature verticale 1080 × 1920 |

## Reproduire le montage

```bash
python3 cinema/build.py films/dathina          # plans + audio + exports + miniature
```

## Scènes (`scenes/`)

| Fichier | Contenu |
|---|---|
| `00_ouverture` | La laverie : elle lit le papier, « Ce soir, j'arrache cette vieille peau… » (accroche) |
| `01_menage` | Sa mère lui fait nettoyer le café renversé par sa sœur Frésita |
| `02_boutiques` | « Avec cette tête, tu gâcherais toutes nos photos » |
| `03_valise` | Son père la met dehors |
| `04_boulangerie` | La boulangère refuse son CV |
| `05_trottoir` | Deux garçons se moquent d'elle et la filment |
| `06_defense` | Le garçon litchi prend sa défense |
| `07_banc` | Sur le banc, au coucher du soleil, il lui donne son numéro |
| `08_peau` | La laverie : elle arrache sa peau et se transforme |

## Choix de réalisation

- **Accroche (0–11,8 s)** : la scène de la laverie est placée en tête, en flash-forward. La coupe tombe au sommet de la fissure, **avant de voir son nouveau visage**. Le spectateur veut savoir pourquoi elle fait ça.
- **Récit (11,8–74,9 s)** : les scènes 01 à 07 dans l'ordre, sans en supprimer aucune. On ne coupe que les temps morts.
  - Fondu au noir après l'accroche, puis coupe franche, parce que la mère parle dès la première image.
  - Impact à l'arrivée du père.
  - Whoosh vers la boulangerie et vers le trottoir.
  - Impact quand le garçon intervient.
  - Fondu au noir vers le banc.
- **Le banc** : le plan large est recadré en champ-contrechamp, avec des gros plans alternés sur lui puis sur elle, au rythme des répliques.
- **Final (74,9–85,6 s)** : retour à la laverie, par la deuxième prise de la transformation. Ralenti ×1,5 sur l'éclat, puis la révélation complète : visage doré, auréole, sourire.
- **Étalonnage** : néon (laverie), intérieur jour (maison), jour doré (rue, boulangerie, banc).
- **Musique originale synthétisée** :
  - la mineur pour le rejet ;
  - do majeur, piano tendre, pour la rencontre ;
  - la majeur lumineux, avec scintillements, pour la transformation.
  - Elle s'efface automatiquement sous les dialogues (sidechain).
- **Effets calés par librosa** sur les vraies attaques sonores : les fissures de la peau.

## Sous-titres

Transcription Whisper large-v3 relue (`dialogues.json`). On ne corrige que l'orthographe :
- « Nettoye » → « Nettoie » ;
- « Datina » → « Dathina » ;
- « gentille » → « gentil » : elle parle au garçon.

Un mot est incertain : Whisper a entendu « découvrais » (probabilité 0,73). Il est écrit « découvrirais », le conditionnel de la phrase. Les paroles ne sont pas modifiées.
