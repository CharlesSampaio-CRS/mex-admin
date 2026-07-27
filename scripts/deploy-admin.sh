#!/bin/bash
set -e

# Diretório do script
PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJ_DIR="$PROJECT_ROOT/.."
OTHERS_ROOT="$(cd -- "$PROJECT_ROOT/../.." && pwd)"

EC2_INFO_FILE="$OTHERS_ROOT/deploy/ec2-info.txt"
KEY_FILE="$OTHERS_ROOT/secrets/mex-admin-service-key.pem"
NGINX_CONF_LOCAL="$OTHERS_ROOT/nginx/mex-landing.conf"
NGINX_CONF_REMOTE="/etc/nginx/sites-available/mex-landing.conf"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

if [ ! -f "$EC2_INFO_FILE" ]; then
  echo -e "${RED}❌ Arquivo ec2-info.txt não encontrado em $EC2_INFO_FILE${NC}"
  exit 1
fi
if [ ! -f "$KEY_FILE" ]; then
  echo -e "${RED}❌ Chave PEM não encontrada em $KEY_FILE${NC}"
  exit 1
fi
if [ ! -f "$NGINX_CONF_LOCAL" ]; then
  echo -e "${RED}❌ Nginx conf não encontrado em $NGINX_CONF_LOCAL${NC}"
  exit 1
fi
SERVER_IP=$(grep "^Public IP:" "$EC2_INFO_FILE" | awk '{print $3}')
if [ -z "$SERVER_IP" ]; then
  echo -e "${RED}❌ IP do servidor não encontrado em $EC2_INFO_FILE${NC}"
  exit 1
fi

echo -e "${YELLOW}▶ Instalando dependências...${NC}"
(cd "$PROJ_DIR" && npm install)

echo -e "${YELLOW}▶ Buildando projeto...${NC}"
(cd "$PROJ_DIR" && npm run build)

if [ ! -f "$PROJ_DIR/dist/index.html" ]; then
  echo -e "${RED}❌ Build sem dist/index.html — abortando.${NC}"
  exit 1
fi

echo -e "${YELLOW}▶ Enviando dist/ para o servidor...${NC}"
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ubuntu@"$SERVER_IP" \
  "sudo rm -rf /home/ubuntu/mex-admin/dist && sudo mkdir -p /home/ubuntu/mex-admin/dist && sudo chown -R ubuntu:ubuntu /home/ubuntu/mex-admin/ && sudo chmod -R u+rwX /home/ubuntu/mex-admin/"

# Envia conteúdo do dist (index.html + assets); tar evita globs/scp "." quebrados
tar -C "$PROJ_DIR/dist" -cf - . | ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ubuntu@"$SERVER_IP" \
  "tar -C /home/ubuntu/mex-admin/dist -xf -"

ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ubuntu@"$SERVER_IP" bash -s <<'REMOTE'
set -e
if [ ! -f /home/ubuntu/mex-admin/dist/index.html ]; then
  echo "❌ index.html ausente após scp"
  ls -la /home/ubuntu/mex-admin/dist/ || true
  exit 1
fi
sudo chown -R www-data:www-data /home/ubuntu/mex-admin/
sudo find /home/ubuntu/mex-admin/ -type d -exec chmod 755 {} \;
sudo find /home/ubuntu/mex-admin/ -type f -exec chmod 644 {} \;
sudo chmod o+x /home/ubuntu
sudo chmod -R o+rx /home/ubuntu/mex-admin
REMOTE

echo -e "${YELLOW}▶ Atualizando Nginx...${NC}"
scp -i "$KEY_FILE" -o StrictHostKeyChecking=no "$NGINX_CONF_LOCAL" ubuntu@"$SERVER_IP":/tmp/mex-landing.conf
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ubuntu@"$SERVER_IP" bash -s <<'REMOTE'
set -e
sudo mv /tmp/mex-landing.conf /etc/nginx/sites-available/mex-landing.conf
sudo ln -sf /etc/nginx/sites-available/mex-landing.conf /etc/nginx/sites-enabled/mex-landing.conf
sudo rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/nginx.conf /etc/nginx/sites-enabled/mex-admin.conf
sudo nginx -t
sudo systemctl reload nginx
echo "Nginx recarregado."
REMOTE

echo -e "${GREEN}✅ Deploy do mex-admin finalizado → https://mex.app.br/admin/${NC}"
