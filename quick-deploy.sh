#!/bin/bash

# Script rápido para deployment
# Uso: ./quick-deploy.sh

VPS_PASSWORD="GastonAss2026?"
VPS_HOST="76.13.122.125"

echo "🚀 Quick Deploy..."

# Build frontend
cd frontend && npm run build && cd ..

# Deploy
sshpass -p "$VPS_PASSWORD" rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'backend/whatsapp-sessions' \
    --exclude 'backend/sessions' \
    --exclude '.env' \
    -e "ssh -o StrictHostKeyChecking=no" \
    ./ root@$VPS_HOST:/root/GastonAssistan/

# Restart services
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no root@$VPS_HOST << 'EOF'
cd /root/GastonAssistan
pm2 restart all
pm2 logs --lines 20
EOF

echo "✅ Deploy completado!"
