# Eva + Google Email Integration API

## Endpoints

### Auth
- `GET /auth/google` — Inicia el login con Google (OAuth2)
- `GET /auth/google/callback` — Callback de Google OAuth2
- `GET /auth/logout` — Cierra sesión y elimina tokens

### Email (requiere autenticación Google)
- `GET /api/email/list` — Lista los emails recientes
- `POST /api/email/send` — Envía un email (campos: `to`, `subject`, `body`)
- `POST /api/email/draft` — Guarda un borrador (campos: `to`, `subject`, `body`)

## Seguridad
- Los tokens de Google se almacenan en la sesión del usuario (servidor, seguro).
- Todos los endpoints de email requieren autenticación Google activa.

## Variables de entorno requeridas
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (ej: `http://localhost:3001/auth/google/callback`)
- `SESSION_SECRET`

## Flujo de autenticación
1. El usuario accede a `/auth/google` para iniciar sesión con Google.
2. Google redirige a `/auth/google/callback` con un código de autorización.
3. El backend intercambia el código por tokens y los almacena en la sesión.
4. El usuario puede usar los endpoints de `/api/email/*`.
5. Para cerrar sesión, accede a `/auth/logout`.

## Ejemplo de uso (con fetch)
```js
// Enviar email
fetch('/api/email/send', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ to: 'destino@ejemplo.com', subject: 'Hola', body: 'Mensaje' })
})
```

---

**Todos los mensajes y errores están localizados en español.**
