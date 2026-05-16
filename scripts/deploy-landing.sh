#!/bin/bash

# =============================================================================
# Deploy MEX Landing + Admin + Connect
# =============================================================================
# Este script faz o build do admin, organiza as rotas esperadas e copia os arquivos
# para a pasta de deploy local (exemplo: ../deploy-dist ou ../mex-unified/public).
#
# Rotas finais esperadas:
#   /              → landing.html
#   /admin         → SPA admin (build do mex-admin)
#   /connect       → connect.html (ou SPA connect)
# =============================================================================

set -e

# =============================================================================
# Deploy MEX Admin SPA para EC2
# =============================================================================
# Faz build local do admin, publica na EC2, aplica nginx, SSL e reload.
# =============================================================================

set -e


# Variáveis de ambiente (ajuste conforme necessário)
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
KEY_FILE="$SCRIPT_DIR/trading-service-key.pem"
SERVER_IP=$(grep "Public IP:" "$SCRIPT_DIR/../../trading-service/ec2-info.txt" | awk '{print $3}')
DOMAIN="mex.app.br"
EMAIL="admin@mex.app.br"

# 0. Testa conexão SSH antes de qualquer build
echo "[0/4] Testando conexão SSH com EC2..."
ssh -i "$KEY_FILE" -o BatchMode=yes -o ConnectTimeout=10 ubuntu@"$SERVER_IP" 'echo "Conexão SSH OK"' || { echo "Erro: Não foi possível conectar na EC2 via SSH. Verifique a chave e o IP."; exit 1; }

# Caminhos locais
ADMIN_DIR="$(dirname "$0")/.."
ADMIN_BUILD="../trading-service/static/admin"

# 1. Build do admin local
cd "$ADMIN_DIR"
echo "[1/4] Instalando dependências do admin..."
npm install

echo "[2/4] Build do admin..."
npm run build

# 2. Publica na EC2
echo "[3/4] Publicando build e aplicando configs na EC2..."
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ubuntu@"$SERVER_IP" DOMAIN="$DOMAIN" EMAIL="$EMAIL" bash << 'ENDSSH'
set -e

TRADING_DIR="/opt/trading-service"
ADMIN_DIR="/var/www/mex-admin"

# ── Atualiza repositório trading-service ──
if [ ! -d "$TRADING_DIR/.git" ]; then
	echo "   🚀 Clonando trading-service..."
	sudo mkdir -p "$TRADING_DIR"
	sudo chown ubuntu:ubuntu "$TRADING_DIR"
	git clone git@github-trading:CharlesSampaio-CRS/trading-service.git "$TRADING_DIR"
else
	echo "   🔄 git pull trading-service (master)..."
	cd "$TRADING_DIR" && git fetch origin && git reset --hard origin/master
fi

# ── Admin build: static/admin/ → /var/www/mex-admin/admin ──
sudo mkdir -p "$ADMIN_DIR/admin"
sudo rm -rf "$ADMIN_DIR/admin"/*
sudo chown -R ubuntu:ubuntu "$ADMIN_DIR"
ENDSSH

scp -i "$KEY_FILE" -r "$ADMIN_BUILD"/* ubuntu@"$SERVER_IP":/var/www/mex-admin/admin/

ssh -i "$KEY_FILE" ubuntu@"$SERVER_IP" DOMAIN="$DOMAIN" EMAIL="$EMAIL" bash << 'ENDSSH'
set -e
ADMIN_DIR="/var/www/mex-admin"
TRADING_DIR="/opt/trading-service"

# ── Nginx conf do git → servidor ──
sudo cp "$TRADING_DIR/nginx/mex.app.br.conf" /etc/nginx/sites-available/$DOMAIN
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/mex-landing
echo "   ⚙️  nginx conf aplicado de: $TRADING_DIR/nginx/mex.app.br.conf"

# ── SSL ──
if ! /snap/bin/certbot --version &> /dev/null 2>&1; then
	sudo apt-get remove -y certbot python3-certbot-nginx 2>/dev/null || true
	sudo snap install --classic certbot
	sudo ln -sf /snap/bin/certbot /usr/bin/certbot
fi

if sudo test -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem; then
	sudo certbot renew --quiet 2>&1 | grep -E "renewed|skipping|error" || true
	echo "   🔐 SSL ok (já existente)"
else
	sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect \
		2>&1 | grep -E "Congratulations|Successfully|already|error|Error" || true
	echo "   🔐 SSL gerado"
fi

# ── Reload nginx ──
sudo nginx -t && sudo systemctl enable nginx && sudo systemctl reload nginx
echo "   🔁 nginx recarregado"
ENDSSH

echo "[4/4] Deploy finalizado."
echo "Rotas SPA esperadas:"
echo "  /admin           → SPA admin (todas as rotas internas)"
echo "  /admin/connect   → SPA admin (rota interna do React)"
echo "  /admin/*        → SPA admin (React Router)"
