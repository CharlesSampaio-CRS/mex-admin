#!/bin/bash
set -e

# Diretório do script
PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJ_DIR="$PROJECT_ROOT/.."

EC2_INFO_FILE="$PROJECT_ROOT/ec2-info.txt"
KEY_FILE="$PROJECT_ROOT/mex-admin-service-key.pem"
NGINX_CONF_LOCAL="../mex-landing/scripts/mex-landing.conf"
NGINX_CONF_REMOTE="/etc/nginx/sites-available/mex-landing.conf"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; RED='\033[0;31m'; NC='\033[0m'

# Valida arquivos necessários
if [ ! -f "$EC2_INFO_FILE" ]; then
  echo -e "${RED}❌ Arquivo ec2-info.txt não encontrado em $EC2_INFO_FILE${NC}"
  exit 1
fi
if [ ! -f "$KEY_FILE" ]; then
  echo -e "${RED}❌ Chave PEM não encontrada em $KEY_FILE${NC}"
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


# Remove conteúdo antigo e garante permissões
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ubuntu@"$SERVER_IP" "sudo rm -rf /home/ubuntu/mex-admin/dist && sudo mkdir -p /home/ubuntu/mex-admin/dist && sudo chown -R ubuntu:ubuntu /home/ubuntu/mex-admin/ && sudo chmod -R u+rwX /home/ubuntu/mex-admin/"

scp -i "$KEY_FILE" -o StrictHostKeyChecking=no -r "$PROJ_DIR/dist/"* ubuntu@"$SERVER_IP":/home/ubuntu/mex-admin/dist/
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Falha ao enviar arquivos para o servidor.${NC}"
  exit 1
fi


# Corrige permissões dos arquivos do site para www-data e garante acesso do Nginx
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ubuntu@"$SERVER_IP" "\
  sudo chown -R www-data:www-data /home/ubuntu/mex-admin/ && \
  sudo find /home/ubuntu/mex-admin/ -type d -exec chmod 755 {} \; && \
  sudo find /home/ubuntu/mex-admin/ -type f -exec chmod 644 {} \; && \
  sudo chmod o+x /home/ubuntu && \
  sudo chmod -R o+rx /home/ubuntu/mex-admin"


# Atualiza configuração do Nginx unificado
scp -i "$KEY_FILE" -o StrictHostKeyChecking=no "$NGINX_CONF_LOCAL" ubuntu@"$SERVER_IP":/tmp/mex-landing.conf
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ubuntu@"$SERVER_IP" "sudo mv /tmp/mex-landing.conf $NGINX_CONF_REMOTE && sudo ln -sf $NGINX_CONF_REMOTE /etc/nginx/sites-enabled/mex-landing.conf"

# Remove possíveis configs default
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ubuntu@"$SERVER_IP" "sudo rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/nginx.conf"

# Testa configuração do Nginx
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ubuntu@"$SERVER_IP" "sudo nginx -t"

# Recarrega Nginx
echo -e "${GREEN}Deploy do mex-admin finalizado e disponível em /admin .${NC}"
echo -e "${GREEN}Deploy do mex-admin finalizado e disponível em /admin .${NC}"