#!/bin/bash

# Script de configuración inicial del VPS
# Este script se ejecuta UNA VEZ en el servidor nuevo

set -e

echo "🔧 Configurando VPS para Eva Assistant..."

# Actualizar sistema
echo "📦 Actualizando sistema..."
apt-get update && apt-get upgrade -y

# Instalar Node.js 20.x
echo "📦 Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Instalar herramientas necesarias
echo "📦 Instalando herramientas..."
apt-get install -y nginx git build-essential chromium-browser

# Instalar PM2 globalmente
echo "📦 Instalando PM2..."
npm install -g pm2 serve

# Configurar Chromium para Puppeteer
echo "🎭 Configurando Puppeteer..."
apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils

# Crear directorios
echo "📁 Creando directorios..."
mkdir -p /root/GastonAssistan
mkdir -p /var/log/gaston-assistant
mkdir -p /var/lib/gaston-assistant/whatsapp-sessions
chmod -R 755 /var/log/gaston-assistant
chmod -R 755 /var/lib/gaston-assistant

# Configurar firewall
echo "🔥 Configurando firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Instalar MongoDB (opcional)
echo "🍃 ¿Instalar MongoDB? (y/n)"
read -r install_mongo
if [ "$install_mongo" = "y" ]; then
    echo "📦 Instalando MongoDB..."
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
        gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
        tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
fi

echo "✅ VPS configurado correctamente!"
echo ""
echo "Siguiente paso: Ejecutar deploy.sh desde tu máquina local"
