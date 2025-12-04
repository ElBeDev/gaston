# 📦 Sistema de Respaldos con Vercel Blob Storage

## Descripción General

Eva Assistant implementa un sistema automático de respaldos que utiliza **Vercel Blob Storage** para persistir datos críticos como segunda capa de seguridad además de MongoDB.

## Características

### 🔄 Respaldos Automáticos
- **Frecuencia**: Cada 2 horas en producción
- **Primer respaldo**: 5 minutos después de iniciar el servidor
- **Datos respaldados**:
  - Contactos completos
  - Conversaciones de los últimos 30 días

### 📊 Almacenamiento
- **Sesiones de WhatsApp**: Persistencia en tiempo real
- **Sesiones de Google OAuth**: Guardado automático
- **Respaldos de datos**: Archivos JSON con timestamp
- **Metadata**: Información de cada respaldo ejecutado

## Configuración

### Variables de Entorno

```env
# Habilitar respaldos automáticos (recomendado en producción)
ENABLE_BLOB_BACKUP=true

# Token de Vercel Blob Storage (auto-generado)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx

# Ambiente
NODE_ENV=production
```

### Activar/Desactivar

El sistema se activa automáticamente cuando:
- `NODE_ENV=production` O
- `ENABLE_BLOB_BACKUP=true`

En desarrollo local, está deshabilitado por defecto para ahorrar recursos.

## Estructura de Archivos en Blob Storage

```
blob-storage/
├── whatsapp-sessions/
│   └── eva-assistant-session.json    # Sesión activa de WhatsApp
├── google-sessions/
│   └── {userId}.json                 # Sesiones OAuth de Google
└── backups/
    ├── contacts_1733190000000.json   # Respaldo de contactos
    ├── conversations_1733190000000.json  # Respaldo de conversaciones
    ├── latest-backup-metadata.json   # Info del último respaldo
    ├── contacts/
    │   └── single_{id}_{timestamp}.json  # Respaldos individuales
    └── conversations/
        └── single_{id}_{timestamp}.json
```

## API Endpoints

### Obtener Estado de Respaldos
```bash
GET /api/backups/status
```

**Respuesta:**
```json
{
  "enabled": true,
  "lastBackup": {
    "timestamp": "2025-12-03T10:30:00.000Z",
    "success": true,
    "duration": 2500,
    "contacts": { "count": 150 },
    "conversations": { "count": 320 }
  },
  "totalBackups": 45,
  "automaticBackupsRunning": true
}
```

### Ejecutar Respaldo Manual
```bash
POST /api/backups/trigger
```

**Respuesta:**
```json
{
  "success": true,
  "contacts": { "count": 150, "fileName": "backups/contacts_1733190000000.json" },
  "conversations": { "count": 320, "fileName": "backups/conversations_1733190000000.json" },
  "metadata": {
    "timestamp": "2025-12-03T10:30:00.000Z",
    "duration": 2500
  }
}
```

### Listar Respaldos Disponibles
```bash
GET /api/backups/list
```

**Respuesta:**
```json
{
  "available": true,
  "count": 45,
  "backups": [
    {
      "pathname": "backups/contacts_1733190000000.json",
      "size": 245678,
      "uploadedAt": "2025-12-03T10:30:00.000Z"
    },
    ...
  ]
}
```

## Uso Programático

### En el Código Backend

```javascript
const dataBackupService = require('./services/dataBackupService');

// Respaldo manual completo
const result = await dataBackupService.performFullBackup();

// Respaldar contacto específico
const contact = await Contact.findById(contactId);
await dataBackupService.backupContact(contact);

// Respaldar conversación específica
const conversation = await Conversation.findById(conversationId);
await dataBackupService.backupConversation(conversation);

// Obtener estadísticas
const stats = await dataBackupService.getBackupStats();

// Listar respaldos
const backups = await dataBackupService.listBackups();
```

### Iniciar/Detener Respaldos Automáticos

```javascript
// Iniciar (automático en producción)
dataBackupService.startAutomaticBackups(120); // Cada 2 horas

// Detener
dataBackupService.stopAutomaticBackups();
```

## Ventajas del Sistema

### 🔒 Seguridad de Datos
- **Doble persistencia**: MongoDB + Blob Storage
- **Recuperación ante desastres**: Si MongoDB falla, datos en Blob
- **Versionado**: Múltiples respaldos con timestamps

### ⚡ Rendimiento
- **Respaldos asíncronos**: No bloquean operaciones principales
- **Caching inteligente**: Solo actualiza cuando hay cambios
- **Compresión**: Archivos JSON optimizados

### 🌍 Compatibilidad Vercel
- **Serverless-friendly**: Funciona con funciones efímeras
- **Sin sistema de archivos**: Todo en Blob Storage
- **Auto-scaling**: Se adapta a la carga automáticamente

## Monitoreo

### Logs de Respaldos

```bash
# Inicio del servicio
📦 Data Backup Service habilitado
⏰ Iniciando respaldos automáticos cada 120 minutos

# Durante respaldo
🔄 Iniciando respaldo completo...
✅ Contactos respaldados: 150 registros
✅ Conversaciones respaldadas: 320 registros
✅ Respaldo completo finalizado en 2500ms

# Errores
❌ Error en respaldo completo: Connection timeout
```

### Métricas Importantes

- **Duración del respaldo**: Debe ser < 10 segundos
- **Tasa de éxito**: Debe ser > 95%
- **Tamaño de archivos**: Monitorear crecimiento
- **Frecuencia**: Ajustar según necesidad

## Restauración de Datos

**⚠️ IMPORTANTE**: La restauración automática NO está implementada por seguridad.

Para restaurar datos:

1. **Descargar respaldo**:
```javascript
const backupData = await blobStorage.loadAuthFile('backups/contacts_1733190000000.json');
const backup = JSON.parse(backupData);
```

2. **Revisar datos**:
```javascript
console.log(`Respaldo del: ${backup.timestamp}`);
console.log(`Total registros: ${backup.count}`);
console.log(`Datos:`, backup.data);
```

3. **Restaurar manualmente** (con precaución):
```javascript
// SOLO si es necesario y sabes lo que haces
for (const contactData of backup.data) {
  await Contact.findByIdAndUpdate(
    contactData._id,
    contactData,
    { upsert: true }
  );
}
```

## Mejores Prácticas

### ✅ Hacer
- Activar `ENABLE_BLOB_BACKUP=true` en producción
- Monitorear logs de respaldos regularmente
- Verificar el endpoint `/api/backups/status` semanalmente
- Mantener al menos 10 respaldos históricos

### ❌ Evitar
- Desactivar respaldos en producción sin razón
- Ignorar errores de respaldo repetidos
- Eliminar respaldos sin verificar
- Restaurar datos sin hacer pruebas primero

## Troubleshooting

### Problema: Respaldos no se ejecutan

**Solución:**
1. Verificar que `BLOB_READ_WRITE_TOKEN` esté configurado
2. Confirmar que `ENABLE_BLOB_BACKUP=true` en producción
3. Revisar logs del servidor para errores

### Problema: Respaldos muy lentos

**Solución:**
1. Reducir días de conversaciones: modificar `backupRecentConversations(30)` a `(7)`
2. Aumentar intervalo: de 120 a 180 minutos
3. Verificar conexión a MongoDB

### Problema: Error "Blob Storage not available"

**Solución:**
1. Ir a Vercel Dashboard → Storage
2. Crear Blob Storage si no existe
3. Conectar al proyecto
4. Esperar propagación del token (1-2 minutos)

## Roadmap Futuro

- [ ] Compresión gzip de respaldos
- [ ] Limpieza automática de respaldos antiguos (> 30 días)
- [ ] Notificaciones por email cuando falla un respaldo
- [ ] Dashboard visual de respaldos en frontend
- [ ] Restauración selectiva de registros específicos
- [ ] Respaldos incrementales (solo cambios)
- [ ] Encriptación de respaldos sensibles

## Soporte

Para problemas con el sistema de respaldos:
1. Revisar logs en Vercel Dashboard
2. Verificar `/api/backups/status`
3. Revisar documentación de Vercel Blob Storage
4. Contactar al equipo de desarrollo

---

**Última actualización**: Diciembre 3, 2025  
**Versión**: 1.0.0
