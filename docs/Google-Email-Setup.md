# 📧 Eva Google Authentication & Email Setup

## 🚀 Configuración Rápida

Eva ahora puede iniciar sesión con Google y enviar correos desde tu cuenta. Sigue estos pasos para configurarlo:

### 1. 📝 Configurar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Gmail API
   - Google+ API (para autenticación)
   - Google Calendar API (opcional)
   - Google Drive API (opcional)

### 2. 🔑 Crear Credenciales OAuth2

1. Ve a "Credenciales" → "Crear credenciales" → "ID de cliente de OAuth 2.0"
2. Tipo de aplicación: "Aplicación web"
3. URIs de redirección autorizados:
   ```
   http://localhost:3001/auth/google/callback
   ```
4. Descarga el archivo JSON de credenciales

### 3. ⚙️ Configurar Variables de Entorno

Copia `.env.example` a `.env` y completa:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Session Secret (genera uno aleatorio)
SESSION_SECRET=tu_session_secret_super_secreto
```

### 4. 🚀 Ejecutar la Aplicación

```bash
# Backend
cd backend
npm start

# Frontend (en otra terminal)
cd frontend
npm start
```

## 📧 Cómo Usar

### 1. Iniciar Sesión con Google

1. Ve a la aplicación web (http://localhost:3000)
2. Haz clic en "Login" con Google en el header
3. Autoriza el acceso a Gmail
4. Verás tu foto de perfil en el header cuando esté conectado

### 2. Enviar Emails desde la Interfaz

1. Ve a la página "Email" en la navegación
2. Completa el formulario:
   - **Para**: dirección de email del destinatario
   - **Asunto**: asunto del correo
   - **Mensaje**: contenido del email
3. Haz clic en "Enviar"

### 3. Eva Puede Enviar Emails por Ti

Ahora puedes pedirle a Eva que envíe emails por ti:

```
"Eva, envía un email a juan@ejemplo.com con asunto 'Reunión' y mensaje 'Hola Juan, ¿podemos reunirnos mañana?'"
```

Eva detectará la intención de envío de email y lo enviará desde tu cuenta de Google.

## 🔧 Endpoints de API

### Autenticación
- `GET /auth/google` - Iniciar OAuth con Google
- `GET /auth/google/callback` - Callback de OAuth
- `GET /auth/status` - Verificar estado de autenticación
- `GET /auth/user` - Obtener información del usuario
- `GET /auth/logout` - Cerrar sesión

### Email
- `POST /api/email/send` - Enviar email (usuario autenticado)
- `POST /api/email/draft` - Guardar borrador
- `POST /api/email/send-as-assistant` - Enviar email como asistente
- `GET /api/email/list` - Listar emails

## 🔒 Seguridad

- Las credenciales se almacenan en sesiones seguras
- Los tokens se manejan automáticamente
- Solo el usuario autenticado puede enviar emails desde su cuenta
- Los tokens se refrescan automáticamente cuando expiran

## 🎯 Características

- ✅ Login/Logout con Google OAuth2
- ✅ Envío de emails desde la cuenta del usuario
- ✅ Interfaz visual para componer emails
- ✅ Eva puede enviar emails por comando de voz/texto
- ✅ Detección automática de intención de email
- ✅ Manejo automático de tokens y refrescos
- ✅ Soporte para CC, BCC, y contenido HTML

## 🚧 Próximas Características

- 📥 Leer emails recibidos
- 📅 Integración con Google Calendar
- 📁 Integración con Google Drive
- 🤖 Respuestas automáticas inteligentes
- 📋 Plantillas de email

## 🆘 Solución de Problemas

### Error: "No autenticado con Google"
- Verifica que hayas iniciado sesión
- Revisa que las credenciales OAuth estén configuradas correctamente

### Error: "Authentication failed"
- Verifica que el `GOOGLE_REDIRECT_URI` sea correcto
- Asegúrate de que la URI esté autorizada en Google Cloud Console

### Error: "Token expired"
- Eva intentará refrescar automáticamente el token
- Si persiste, cierra sesión e inicia sesión nuevamente