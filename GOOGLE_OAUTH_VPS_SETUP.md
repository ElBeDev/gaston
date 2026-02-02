# 🔐 Configuración Google OAuth - VPS

## ✅ Archivos actualizados

Los siguientes archivos han sido configurados para usar `https://gastonassistant.duckdns.org`:

1. [.env](.env#L20) - Ambiente de desarrollo local
2. [.env.production](.env.production#L21) - Ambiente de producción (VPS)
3. [backend/src/app-simple.js](backend/src/app-simple.js#L52) - Configuración de Passport
4. [backend/routes/auth.js](backend/routes/auth.js#L10) - Rutas de autenticación
5. [ecosystem.config.js](ecosystem.config.js#L10) - PM2 configuración

## 🚀 Desplegar en VPS

Conecta a tu VPS y ejecuta:

```bash
cd /root/GastonAssistan

# Actualizar código
git pull origin main

# Reiniciar servicios con nuevas variables
pm2 restart gaston-backend --update-env

# Verificar logs
pm2 logs gaston-backend --lines 50
```

## 🔍 Verificar Google Console

Asegúrate de que en [Google Cloud Console](https://console.cloud.google.com/) tengas:

### 1. Credenciales OAuth 2.0
- **Nombre**: Gaston Assistant
- **Authorized JavaScript origins**:
  ```
  https://gastonassistant.duckdns.org
  ```
- **Authorized redirect URIs**:
  ```
  https://gastonassistant.duckdns.org/auth/google/callback
  ```

### 2. Pantalla de consentimiento OAuth
- **Estado**: Prueba (Testing)
- **Tipo de usuario**: Usuarios externos
- **Scopes agregados**:
  - `openid`
  - `profile`
  - `email`
  - `https://www.googleapis.com/auth/gmail.readonly`
  - `https://www.googleapis.com/auth/gmail.send`
  - `https://www.googleapis.com/auth/gmail.compose`
  - `https://www.googleapis.com/auth/calendar`
  - `https://www.googleapis.com/auth/calendar.events`

### 3. Usuarios de prueba
Asegúrate de tener agregados:
- ✅ elbedev90@gmail.com
- ✅ bernardoraos90@gmail.com
- ✅ gaston@algomasonline.com

## 🧪 Probar autenticación

1. Abre tu navegador en: `https://gastonassistant.duckdns.org`
2. Haz clic en el botón "Login" con Google
3. Selecciona tu cuenta de Google
4. Acepta los permisos
5. Deberías ser redirigido de vuelta a la app con la sesión iniciada

## ⚠️ Troubleshooting

### Error 400: invalid_request

**Causa**: La URI de redirección en el código no coincide con la configurada en Google Console.

**Solución**: Verifica que:
- El archivo `.env.production` tenga: `GOOGLE_REDIRECT_URI=https://gastonassistant.duckdns.org/auth/google/callback`
- Google Console tenga la misma URI en "Authorized redirect URIs"
- Esperaste 5-10 minutos después de cambiar configuraciones en Google Console

### Error 403: access_blocked

**Causa**: El usuario no está en la lista de usuarios de prueba.

**Solución**: En Google Console > OAuth consent screen > Test users, agrega el email del usuario.

### Session no se guarda

**Causa**: Las cookies no se están enviando correctamente.

**Solución**: Verifica que:
- `SESSION_SECRET` esté configurado en `.env.production`
- HTTPS esté funcionando correctamente (DuckDNS debe tener SSL configurado)
- Las cookies tengan `secure: true` en producción

## 📝 Notas importantes

- ⏱️ Los cambios en Google Console pueden tardar 5-10 minutos en aplicarse
- 🔒 Mientras la app esté en estado "Prueba", solo los usuarios agregados podrán autenticarse
- 📊 Límite de usuarios de prueba: 100 usuarios
- 🚀 Para producción completa, necesitas verificar la app con Google (proceso de revisión)

## 🔗 Enlaces útiles

- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)
- [API Credentials](https://console.cloud.google.com/apis/credentials)
- [Documentación OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
