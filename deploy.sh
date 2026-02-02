#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
VPS_HOST="76.13.122.125"
VPS_USER="root"
VPS_PASSWORD="GastonAss2026?"
PROJECT_NAME="GastonAssistan"
REMOTE_PATH="/root/$PROJECT_NAME"

echo -e "${GREEN}🚀 Iniciando deployment de Eva Assistant...${NC}\n"

# Función para ejecutar comandos en el VPS
remote_exec() {
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "$1"
}

# Función para copiar archivos al VPS
remote_copy() {
    sshpass -p "$VPS_PASSWORD" rsync -avz --progress \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude 'frontend/build' \
        --exclude 'backend/whatsapp-sessions' \
        --exclude 'backend/sessions' \
        --exclude '.env' \
        --exclude '.DS_Store' \
        -e "ssh -o StrictHostKeyChecking=no" \
        "$1" "$VPS_USER@$VPS_HOST:$2"
}

echo -e "${YELLOW}📦 Paso 1: Construyendo frontend...${NC}"
cd frontend && DISABLE_ESLINT_PLUGIN=true npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al construir frontend${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}✅ Frontend construido${NC}\n"

echo -e "${YELLOW}📤 Paso 2: Copiando archivos al VPS...${NC}"
remote_copy "./" "$REMOTE_PATH/"
echo -e "${GREEN}✅ Archivos copiados${NC}\n"

echo -e "${YELLOW}🔧 Paso 3: Instalando dependencias en VPS...${NC}"
remote_exec "cd $REMOTE_PATH && npm install --production"
remote_exec "cd $REMOTE_PATH/backend && npm install --production"
remote_exec "cd $REMOTE_PATH/frontend && npm install --production"
echo -e "${GREEN}✅ Dependencias instaladas${NC}\n"

echo -e "${YELLOW}⚙️  Paso 4: Configurando servidor web...${NC}"
remote_exec "apt-get update && apt-get install -y nginx"
remote_exec "cp $REMOTE_PATH/nginx.conf /etc/nginx/sites-available/$PROJECT_NAME"
remote_exec "ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/"
remote_exec "rm -f /etc/nginx/sites-enabled/default"
remote_exec "nginx -t && systemctl restart nginx"
echo -e "${GREEN}✅ Nginx configurado${NC}\n"

echo -e "${YELLOW}📁 Paso 5: Creando directorios necesarios...${NC}"
remote_exec "mkdir -p /var/log/gaston-assistant"
remote_exec "mkdir -p /var/lib/gaston-assistant/whatsapp-sessions"
remote_exec "chmod -R 755 /var/log/gaston-assistant"
remote_exec "chmod -R 755 /var/lib/gaston-assistant"
echo -e "${GREEN}✅ Directorios creados${NC}\n"

echo -e "${YELLOW}🔄 Paso 6: Instalando y configurando PM2...${NC}"
remote_exec "npm install -g pm2"
remote_exec "cd $REMOTE_PATH && pm2 delete all || true"
remote_exec "cd $REMOTE_PATH && pm2 start ecosystem.config.js"
remote_exec "pm2 save"
remote_exec "pm2 startup systemd -u root --hp /root"
echo -e "${GREEN}✅ PM2 configurado${NC}\n"

echo -e "${YELLOW}📊 Paso 7: Verificando estado...${NC}"
remote_exec "pm2 status"
remote_exec "systemctl status nginx --no-pager | head -n 10"
echo ""

echo -e "${GREEN}🎉 ¡Deployment completado!${NC}\n"
echo -e "${GREEN}Accede a tu aplicación en:${NC}"
echo -e "${GREEN}  Frontend: http://$VPS_HOST${NC}"
echo -e "${GREEN}  Backend: http://$VPS_HOST/api${NC}\n"
echo -e "${YELLOW}Comandos útiles:${NC}"
echo -e "  Conectar al VPS: ${GREEN}ssh root@$VPS_HOST${NC}"
echo -e "  Ver logs: ${GREEN}pm2 logs${NC}"
echo -e "  Reiniciar: ${GREEN}pm2 restart all${NC}"
echo -e "  Estado: ${GREEN}pm2 status${NC}"
