# 🔑 Google Workspace Setup Guide for Eva Assistant

## 📋 Pasos para configurar Google OAuth2 + Gmail + Calendar

### 1. 🌐 Google Cloud Console Setup

1. **Ir a Google Cloud Console**
   - Visita: https://console.cloud.google.com/
   - Inicia sesión con tu cuenta de Google

2. **Crear/Seleccionar Proyecto**
   - Haz clic en "Select a project" (arriba izquierda)
   - Crea un nuevo proyecto: "Eva Assistant" (o usa uno existente)

3. **Habilitar APIs necesarias**
   - Ve a "APIs & Services" > "Library"
   - Busca y habilita las siguientes APIs:
     - ✅ **Gmail API**
     - ✅ **Google Calendar API** 
     - ✅ **Google+ API** (para OAuth2)

4. **Configurar OAuth Consent Screen**
   - Ve a "APIs & Services" > "OAuth consent screen"
   - Selecciona "External" (para usuarios externos)
   - Completa información básica:
     - App name: "Eva Assistant"
     - User support email: tu email
     - Developer contact: tu email
   - Agrega scopes:
     - `../auth/gmail.send`
     - `../auth/gmail.readonly` 
     - `../auth/calendar`
     - `../auth/calendar.events`
   - Agrega test users (opcional)

5. **Crear Credenciales OAuth2**
   - Ve a "APIs & Services" > "Credentials"
   - Haz clic en "Create Credentials" > "OAuth 2.0 Client IDs"
   - Tipo de aplicación: **Web application**
   - Nombre: "Eva Assistant OAuth"
   - Authorized redirect URIs:
     ```
     http://localhost:3002/auth/google/callback
     ```
   - Haz clic en "Create"
   - **IMPORTANTE**: Guarda el Client ID y Client Secret

### 2. 🔧 Configurar Variables de Entorno

Edita el archivo `.env` en la raíz del proyecto:

```bash
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3002/auth/google/callback

# Session Secret para autenticación segura
SESSION_SECRET=eva-super-secret-session-key-2024-muy-seguro

# Opcional: Configurar frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. 🚀 Probar la Configuración

1. **Reiniciar el backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Reiniciar el frontend**:
   ```bash
   cd frontend  
   npm start
   ```

3. **Probar autenticación**:
   - Ve a http://localhost:3000/email
   - Haz clic en "Conectar con Google"
   - Autoriza las siguientes acciones:
     - ✅ Enviar correos desde Gmail
     - ✅ Ver información básica del perfil
     - ✅ Leer y escribir eventos del calendario

### 4. 🧪 Probar Funcionalidades

#### Gmail
- Ve a la pestaña "Gmail" en la página Email
- Compone un correo de prueba
- Verifica que se envíe desde tu cuenta

#### Calendar
- Ve a la pestaña "Calendar" en la página Email  
- Crea un evento de prueba
- Verifica que aparezca en tu Google Calendar

#### Chat con Eva
- Ve a la página de Chat
- Prueba comandos como:
  ```
  "Eva, envía un email a test@ejemplo.com con asunto 'Prueba' y mensaje 'Hola desde Eva'"
  
  "Eva, crea una reunión para mañana a las 10 AM llamada 'Reunión de prueba'"
  ```

### 5. 🔒 Consideraciones de Seguridad

1. **Credenciales seguras**:
   - Nunca compartir Client ID/Secret públicamente
   - Usar variables de entorno para credenciales
   - En producción, usar HTTPS

2. **Scopes mínimos**:
   - Solo solicitar permisos necesarios
   - Usuarios pueden revocar acceso en cualquier momento

3. **Tokens**:
   - Los tokens se almacenan en sesiones temporales
   - Se refrescan automáticamente cuando expiran
   - Se eliminan al cerrar sesión

### 6. 🚨 Resolución de Problemas

#### Error: "Invalid client" 
- Verificar que Client ID y Secret sean correctos
- Verificar que la URI de redirección coincida exactamente

#### Error: "Access denied"
- Verificar que las APIs estén habilitadas
- Verificar que los scopes estén configurados en OAuth consent screen

#### Error: "Token expired"
- Eva refrescará automáticamente los tokens
- Si persiste, cerrar sesión e iniciar sesión nuevamente

#### Error: "This app isn't verified"
- Usar "Advanced" > "Go to Eva Assistant (unsafe)" durante desarrollo
- Para producción, solicitar verificación de Google

### 7. 📞 Soporte

Si tienes problemas:
1. Verificar logs del backend con `npm start`
2. Verificar consola del navegador para errores de frontend
3. Verificar que todas las APIs estén habilitadas en Google Cloud Console

### 8. 🎯 Próximos Pasos

Una vez configurado:
- ✅ Eva puede enviar emails desde tu cuenta
- ✅ Eva puede crear eventos en tu calendario  
- ✅ Integración completa en conversaciones
- ✅ Detección automática de intenciones de email/calendar

¡Eva está lista para ser tu asistente de Google Workspace! 🎉