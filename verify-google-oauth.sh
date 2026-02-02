#!/bin/bash

echo "🔍 Verificación de configuración Google OAuth"
echo "=============================================="
echo ""

# Verificar variables de entorno
echo "📋 Variables de entorno cargadas:"
echo "================================"

if [ -f .env.production ]; then
    source .env.production
    echo "✅ Archivo .env.production encontrado"
    echo "   GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:0:20}..."
    echo "   GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:0:10}..."
    echo "   GOOGLE_REDIRECT_URI: $GOOGLE_REDIRECT_URI"
    echo "   FRONTEND_URL: $FRONTEND_URL"
else
    echo "❌ Archivo .env.production NO encontrado"
fi

echo ""
echo "🔗 URLs que deben estar en Google Console:"
echo "=========================================="
echo "Authorized JavaScript origins:"
echo "  - https://gastonassistant.duckdns.org"
echo ""
echo "Authorized redirect URIs:"
echo "  - https://gastonassistant.duckdns.org/auth/google/callback"
echo ""

echo "📝 Scopes requeridos en Google Console:"
echo "======================================="
echo "  - openid"
echo "  - profile"
echo "  - email"
echo "  - https://www.googleapis.com/auth/gmail.readonly"
echo "  - https://www.googleapis.com/auth/gmail.send"
echo "  - https://www.googleapis.com/auth/gmail.compose"
echo "  - https://www.googleapis.com/auth/calendar"
echo "  - https://www.googleapis.com/auth/calendar.events"
echo ""

echo "👥 Usuarios de prueba (mientras la app esté en estado 'Prueba'):"
echo "================================================================"
echo "  - elbedev90@gmail.com ✅"
echo "  - bernardoraos90@gmail.com ✅"
echo "  - gaston@algomasonline.com ✅"
echo ""

echo "🚀 Para aplicar cambios en la VPS:"
echo "================================="
echo "  cd /root/GastonAssistan"
echo "  git pull"
echo "  pm2 restart gaston-backend --update-env"
echo ""

echo "✅ Verificación completada"
