#!/usr/bin/env bash
# Douyin → France AI — lancement sur votre ordinateur (macOS / Linux), accessible depuis l'iPhone.
#   ./start.sh            → serveur local + adresse HTTPS publique (Cloudflare Tunnel, gratuit)
#   ./start.sh --local    → uniquement sur cet ordinateur (http://127.0.0.1:8000)
# Ctrl+C arrête tout.
set -euo pipefail
cd "$(dirname "$0")"
PORT="${D2F_PORT:-8000}"
say() { printf '\n\033[1;35m▶ %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31m✖ %s\033[0m\n' "$*"; exit 1; }

# 1) Prérequis
command -v python3 >/dev/null || die "Python 3.10+ est requis : https://www.python.org/downloads/"
python3 -c 'import sys; sys.exit(sys.version_info < (3, 10))' || die "Python 3.10 ou plus récent est requis."
if ! command -v ffmpeg >/dev/null; then
  if [ "$(uname)" = "Darwin" ]; then die "FFmpeg manquant. Installez-le : brew install ffmpeg   (Homebrew : https://brew.sh)"
  else die "FFmpeg manquant. Installez-le : sudo apt install ffmpeg"; fi
fi

# 2) Environnement Python isolé (une seule fois)
if [ ! -f .venv/.ok ] || [ requirements.txt -nt .venv/.ok ]; then
  say "Installation des dépendances (première fois : quelques minutes)…"
  python3 -m venv .venv
  .venv/bin/pip install -q --upgrade pip
  .venv/bin/pip install -q -r requirements.txt qrcode
  touch .venv/.ok
fi
PY=.venv/bin/python

# 3) Jeton d'accès (créé une fois, gardé dans .d2f_token)
if [ ! -s .d2f_token ]; then
  (umask 077; "$PY" -c 'import secrets; print(secrets.token_urlsafe(18))' > .d2f_token)
fi
TOKEN="$(cat .d2f_token)"

# 4) Modèle LaMa (≈ 200 Mo, une seule fois)
"$PY" -c "from d2f.inpaint.lama import ensure_model; ensure_model('models')" >/dev/null

# 5) Serveur
say "Démarrage du serveur…"
D2F_TOKEN="$TOKEN" D2F_PORT="$PORT" D2F_HOST=127.0.0.1 D2F_DATA="${D2F_DATA:-$PWD/data}" \
  "$PY" -m server.app > server.log 2>&1 &
SERVER=$!
TUNNEL=""
cleanup() { kill $SERVER ${TUNNEL:+$TUNNEL} 2>/dev/null || true; }
trap cleanup EXIT INT TERM
for _ in $(seq 60); do curl -fs "http://127.0.0.1:$PORT/healthz" >/dev/null 2>&1 && break; sleep 1; done
curl -fs "http://127.0.0.1:$PORT/healthz" >/dev/null || die "Le serveur n'a pas démarré (voir server.log)."
LOCAL="http://127.0.0.1:$PORT/?token=$TOKEN"

if [ "${1:-}" = "--local" ]; then
  say "Prêt : $LOCAL"
  wait $SERVER; exit
fi

# 6) Tunnel HTTPS Cloudflare (gratuit, sans compte)
CF="$(command -v cloudflared || true)"
if [ -z "$CF" ]; then
  mkdir -p bin; CF=bin/cloudflared
  if [ ! -x "$CF" ]; then
    say "Téléchargement de cloudflared…"
    ARCH="$(uname -m)"; case "$ARCH" in x86_64|amd64) A=amd64;; arm64|aarch64) A=arm64;; *) die "Architecture $ARCH non gérée : installez cloudflared vous-même.";; esac
    BASE=https://github.com/cloudflare/cloudflared/releases/latest/download
    if [ "$(uname)" = "Darwin" ]; then
      curl -fsSL "$BASE/cloudflared-darwin-$A.tgz" | tar -xz -C bin
    else
      curl -fsSL -o "$CF" "$BASE/cloudflared-linux-$A"
    fi
    chmod +x "$CF"
  fi
fi
say "Ouverture de l'adresse HTTPS…"
"$CF" tunnel --no-autoupdate --url "http://127.0.0.1:$PORT" > tunnel.log 2>&1 &
TUNNEL=$!
URL=""
for _ in $(seq 60); do
  # l'adresse attribuée (jamais « api.trycloudflare.com », qui apparaît dans les messages d'erreur)
  URL="$(grep -Eo 'https://[a-z0-9-]+\.trycloudflare\.com' tunnel.log | grep -v '://api\.' | head -1 || true)"
  [ -n "$URL" ] && break
  kill -0 "$TUNNEL" 2>/dev/null || break   # cloudflared s'est arrêté (pas d'accès Internet…)
  grep -q "failed to request quick Tunnel" tunnel.log && break
  sleep 1
done
if [ -z "$URL" ]; then
  say "Tunnel indisponible (voir tunnel.log). L'application reste accessible ici : $LOCAL"
  wait $SERVER; exit
fi
PUBLIC="$URL/?token=$TOKEN"
say "Application en ligne — ouvrez cette adresse dans Safari sur l'iPhone :"
echo "   $PUBLIC"
"$PY" - "$PUBLIC" <<'PYEOF' 2>/dev/null || true
import sys, qrcode
q = qrcode.QRCode(border=1); q.add_data(sys.argv[1]); q.print_ascii(invert=True)
PYEOF
echo "   (Scannez le QR code avec l'appareil photo de l'iPhone. Ctrl+C pour arrêter.)"
echo "   ⚠ Cette adresse change à chaque lancement : voir DEPLOY.md pour une adresse fixe."
wait $SERVER
