/**
 * Ejemplo de uso del BlobAuthStrategy con WhatsApp Web
 * 
 * Copia este código en whatsappService.js para habilitar 
 * la persistencia de sesiones en Vercel Blob Storage
 */

const { Client } = require('whatsapp-web.js');
const BlobAuthStrategy = require('./utils/whatsappBlobAuth');

// Detectar si estamos en producción con Blob disponible
const useBlob = process.env.NODE_ENV === 'production' && process.env.BLOB_READ_WRITE_TOKEN;

// OPCIÓN 1: Usar BlobAuthStrategy (recomendado para Vercel)
if (useBlob) {
  const client = new Client({
    authStrategy: new BlobAuthStrategy({
      sessionName: 'eva-whatsapp-session',
      clientId: 'eva-assistant'
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas'
      ]
    }
  });

  console.log('🗄️ Using Vercel Blob Storage for WhatsApp sessions');
}

// OPCIÓN 2: Usar LocalAuth para desarrollo local
else {
  const { LocalAuth } = require('whatsapp-web.js');
  const path = require('path');

  const client = new Client({
    authStrategy: new LocalAuth({
      name: 'eva-assistant-session',
      dataPath: path.join(__dirname, '../whatsapp-sessions')
    }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox']
    }
  });

  console.log('💾 Using Local Storage for WhatsApp sessions');
}

// El resto de tu código sigue igual...
client.on('qr', (qr) => {
  console.log('QR Code received');
});

client.on('ready', () => {
  console.log('WhatsApp Client is ready!');
});

client.on('authenticated', () => {
  console.log('Client authenticated successfully');
});

client.initialize();
