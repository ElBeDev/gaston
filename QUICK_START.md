# 🚀 Quick Start - Deployment en 3 Pasos

## 📋 Información VPS
```
IP: 76.13.122.125
User: root
Pass: GastonAss2026?
```

## ⚡ Deployment en 3 Pasos

### 1️⃣ Primera Vez - Configurar VPS
```bash
sshpass -p "GastonAss2026?" scp setup-vps.sh root@76.13.122.125:/root/
sshpass -p "GastonAss2026?" ssh root@76.13.122.125 "chmod +x /root/setup-vps.sh && /root/setup-vps.sh"
```

### 2️⃣ Configurar Variables de Entorno
```bash
nano .env.production
```
Edita:
- `OPENAI_API_KEY` → Tu API key de OpenAI
- Otras variables según necesites

### 3️⃣ Desplegar
```bash
./deploy.sh
```

## 🔄 Actualizaciones Rápidas
```bash
./quick-deploy.sh
```

## 🔌 Conectar al Servidor
```bash
ssh gaston-vps
# o
sshpass -p "GastonAss2026?" ssh root@76.13.122.125
```

## 📊 Comandos Útiles en VPS

```bash
# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs

# Reiniciar todo
pm2 restart all

# Ver logs de Nginx
tail -f /var/log/nginx/error.log
```

## 🌐 Acceder a la App

- **Frontend**: http://76.13.122.125
- **Backend API**: http://76.13.122.125/api

## ✨ GPT-5.2-Codex Activado

Todos los servicios usan **GPT-5.2-Codex** por defecto.

Para cambiar el modelo, edita `.env.production`:
```bash
OPENAI_MODEL=gpt-5.2-codex
```

## 📚 Más Info

- [DEPLOYMENT.md](DEPLOYMENT.md) - Guía completa
- [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - Resumen de configuración

---

**¿Listo?** → `./deploy.sh` 🚀
