# 📧 Eva + Google Email Integration Workflow

## 🎯 Objetivo

Integrar autenticación con Google y acceso a Gmail en Eva, permitiendo:
- Login seguro con Google (OAuth2)
- Acceso y gestión de correos electrónicos (leer, enviar, redactar)
- Todo desde la interfaz unificada de Eva

---

## 1️⃣ Requerimientos Previos
- Cuenta Google Cloud Platform
- OAuth2 Client ID y Client Secret (tipo Web)
- Gmail API habilitada en Google Cloud
- Infraestructura Eva corriendo (React frontend + Node.js backend)
- HTTPS en producción (requerido por Google OAuth2)

---

## 2️⃣ Arquitectura General

```
[Usuario] → [Eva Frontend (React)] → [Eva Backend (Node.js/Express)] → [Google OAuth2 + Gmail API]
```
- **Frontend**: Login con Google, UI para correos
- **Backend**: Manejo seguro de tokens, integración con Gmail API
- **Google**: OAuth2, acceso a Gmail

---

## 3️⃣ Pasos Técnicos

### A. Google Cloud Setup
1. Crear proyecto en Google Cloud Console
2. Habilitar Gmail API
3. Crear credenciales OAuth2 (tipo Web)
4. Configurar URIs de redirección (backend y frontend)

### B. Backend (Node.js/Express)
1. Instalar dependencias: `googleapis`, `passport`, `passport-google-oauth20`, `express-session`
2. Crear endpoints para login/logout con Google
3. Implementar flujo OAuth2 (guardar tokens seguros)
4. Endpoints para acciones de correo: listar, leer, enviar, redactar

### C. Frontend (React)
1. Agregar botón de login con Google (Google Identity Services)
2. Manejar sesión de usuario y estado de autenticación
3. UI para inbox, redacción, envío y lectura de correos (todo en español)
4. Integrar con endpoints del backend

### D. Seguridad
- Guardar tokens en backend (nunca en frontend)
- Usar HTTPS siempre
- Permitir revocación de acceso

### E. Testing
- Login/logout
- Leer inbox
- Enviar y redactar correos
- Manejo de errores y expiración de tokens

---

## 4️⃣ Roadmap y Próximos Pasos

- [ ] 1. Configurar Google Cloud y credenciales
- [ ] 2. Scaffold backend OAuth2 y endpoints de correo
- [ ] 3. Agregar login con Google en frontend
- [ ] 4. Integrar Gmail API (leer, enviar, redactar)
- [ ] 5. UI de correos en Eva (inbox, redactar, responder)
- [ ] 6. Pruebas end-to-end y feedback de usuario

---

## 5️⃣ Recursos útiles
- [Google Identity Services](https://developers.google.com/identity)
- [Gmail API Docs](https://developers.google.com/gmail/api)
- [OAuth2 for Web](https://developers.google.com/identity/protocols/oauth2)

---

**🚀 Con esto, Eva podrá gestionar emails de manera inteligente y segura!**
