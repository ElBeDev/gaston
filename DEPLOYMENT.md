# 🚀 Deployment Guide - Eva Assistant

## 📋 Información del Servidor VPS

- **IP:** 76.13.122.125
- **Usuario:** root
- **Password:** GastonAss2026?

## 🔧 Configuración Inicial (Solo una vez)

### 1. Preparar el VPS

Primero, copia y ejecuta el script de configuración inicial en el VPS:

```bash
# Desde tu máquina local
sshpass -p "GastonAss2026?" scp -o StrictHostKeyChecking=no setup-vps.sh root@76.13.122.125:/root/
sshpass -p "GastonAss2026?" ssh -o StrictHostKeyChecking=no root@76.13.122.125 "chmod +x /root/setup-vps.sh && /root/setup-vps.sh"
```

O manualmente:
```bash
ssh root@76.13.122.125
# Pegar el contenido de setup-vps.sh y ejecutar
```

### 2. Configurar Variables de Entorno

Edita el archivo `.env.production` en tu máquina local con los valores correctos:

```bash
nano .env.production
```

Asegúrate de configurar:
- `OPENAI_API_KEY`: Tu API key de OpenAI
- `MONGODB_URI`: URI de MongoDB (si aplica)
- `SESSION_SECRET`: Una clave secreta fuerte
- `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`: Credenciales de Google OAuth
- `BLOB_READ_WRITE_TOKEN`: Token de Vercel Blob Storage

## 🚀 Deployment

### Deployment Completo (Primera vez o cambios importantes)

```bash
./deploy.sh
```

Este script:
1. ✅ Construye el frontend
2. ✅ Copia todos los archivos al VPS
3. ✅ Instala dependencias
4. ✅ Configura Nginx
5. ✅ Inicia servicios con PM2

### Quick Deploy (Actualizaciones rápidas)

```bash
./quick-deploy.sh
```

Este script solo copia archivos y reinicia servicios. Más rápido para cambios menores.

## 🔐 Acceso SSH Simplificado

Ya está configurado un alias SSH. Puedes conectar con:

```bash
ssh gaston-vps
# Pedirá la contraseña: GastonAss2026?
```

O usar sshpass para evitar escribir la contraseña:

```bash
sshpass -p "GastonAss2026?" ssh root@76.13.122.125
```

## 📊 Comandos Útiles en el VPS

### PM2 (Gestión de Procesos)

```bash
# Ver estado de los servicios
pm2 status

# Ver logs en tiempo real
pm2 logs

# Ver logs específicos
pm2 logs gaston-backend
pm2 logs gaston-frontend

# Reiniciar servicios
pm2 restart all
pm2 restart gaston-backend
pm2 restart gaston-frontend

# Detener servicios
pm2 stop all

# Eliminar servicios
pm2 delete all
```

### Nginx (Servidor Web)

```bash
# Verificar configuración
nginx -t

# Reiniciar Nginx
systemctl restart nginx

# Ver estado
systemctl status nginx

# Ver logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Logs de la Aplicación

```bash
# Ver logs del backend
tail -f /var/log/gaston-assistant/backend-out.log
tail -f /var/log/gaston-assistant/backend-error.log

# Ver logs del frontend
tail -f /var/log/gaston-assistant/frontend-out.log
```

### Sistema

```bash
# Ver uso de recursos
htop

# Ver procesos de Node
ps aux | grep node

# Ver puertos en uso
netstat -tulpn | grep LISTEN

# Liberar memoria caché
sync; echo 3 > /proc/sys/vm/drop_caches
```

## 🌐 Acceso a la Aplicación

- **Frontend:** http://76.13.122.125
- **Backend API:** http://76.13.122.125/api
- **Socket.io:** http://76.13.122.125/socket.io

## 🔄 Workflow de Desarrollo

1. **Desarrollo Local:**
   ```bash
   npm run dev
   ```

2. **Testing:**
   - Prueba localmente
   - Verifica que todo funcione

3. **Deploy:**
   ```bash
   ./quick-deploy.sh
   ```

4. **Verificar:**
   - Accede a http://76.13.122.125
   - Revisa logs con `ssh gaston-vps` → `pm2 logs`

## 🐛 Troubleshooting

### Backend no inicia

```bash
ssh gaston-vps
pm2 logs gaston-backend
# Verificar variables de entorno
cat /root/GastonAssistan/.env.production
```

### Frontend no carga

```bash
ssh gaston-vps
pm2 logs gaston-frontend
# Verificar que el build existe
ls -la /root/GastonAssistan/frontend/build
```

### Nginx no funciona

```bash
ssh gaston-vps
nginx -t  # Verificar configuración
systemctl status nginx
tail -f /var/log/nginx/error.log
```

### Puerto ocupado

```bash
ssh gaston-vps
lsof -i :3002  # Backend
lsof -i :3001  # Frontend
# Matar proceso si es necesario
kill -9 <PID>
pm2 restart all
```

## 🔒 Seguridad

### Recomendaciones:

1. **Cambiar contraseña de root:**
   ```bash
   ssh gaston-vps
   passwd
   ```

2. **Configurar certificado SSL (HTTPS):**
   ```bash
   apt-get install certbot python3-certbot-nginx
   certbot --nginx -d tudominio.com
   ```

3. **Crear usuario no-root:**
   ```bash
   adduser eva
   usermod -aG sudo eva
   # Luego usar este usuario en lugar de root
   ```

4. **Configurar SSH Key (en lugar de contraseña):**
   ```bash
   # En tu máquina local
   ssh-keygen -t rsa -b 4096
   ssh-copy-id root@76.13.122.125
   # Luego podrás conectar sin contraseña
   ```

## 📦 Actualizar Dependencias

```bash
ssh gaston-vps
cd /root/GastonAssistan
npm update
cd backend && npm update
cd ../frontend && npm update
pm2 restart all
```

## 🔄 Rollback (Volver a versión anterior)

Si algo sale mal, puedes usar Git en el VPS:

```bash
ssh gaston-vps
cd /root/GastonAssistan
git log --oneline  # Ver commits
git checkout <commit-hash>  # Volver a versión anterior
npm install
cd backend && npm install
cd ../frontend && npm install && npm run build
pm2 restart all
```

## 📝 Notas

- El frontend se sirve en el puerto 3001
- El backend corre en el puerto 3002
- Nginx hace proxy inverso en el puerto 80
- PM2 reinicia automáticamente los servicios si fallan
- Los logs rotan automáticamente con PM2
