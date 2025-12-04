/**
 * Vercel Blob Storage Adapter para Sesiones de WhatsApp
 * 
 * Este adaptador permite persistir las sesiones de WhatsApp en Vercel Blob Storage
 * en lugar del sistema de archivos local (que es efímero en Vercel).
 */

// Lazy load @vercel/blob para evitar errores de carga en serverless
let blobModule = null;
let put, del, list, head;

function loadBlobModule() {
  if (!blobModule && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      blobModule = require('@vercel/blob');
      put = blobModule.put;
      del = blobModule.del;
      list = blobModule.list;
      head = blobModule.head;
      console.log('✅ @vercel/blob loaded for WhatsApp sessions');
    } catch (error) {
      console.warn('⚠️ Error loading @vercel/blob:', error.message);
    }
  }
  return !!blobModule;
}

const fs = require('fs').promises;
const path = require('path');

class BlobStorageAdapter {
  constructor() {
    this.token = process.env.BLOB_READ_WRITE_TOKEN;
    loadBlobModule(); // Intentar cargar el módulo
    this.useBlob = process.env.NODE_ENV === 'production' && this.token && blobModule;
    this.localPath = path.join(__dirname, '../whatsapp-sessions');
    
    console.log('🗄️ BlobStorage initialized:', {
      mode: this.useBlob ? 'Vercel Blob' : 'Local Files',
      hasToken: !!this.token,
      hasModule: !!blobModule
    });
  }

  /**
   * Guarda una sesión en Blob Storage
   * @param {string} sessionId - ID de la sesión
   * @param {Buffer|string} data - Datos de la sesión
   * @returns {Promise<string>} URL del blob
   */
  async saveSession(sessionId, data) {
    const key = `whatsapp-sessions/${sessionId}/session.json`;
    
    if (this.useBlob) {
      try {
        const blob = await put(key, data, {
          access: 'public',
          token: this.token,
          addRandomSuffix: false,
        });
        console.log('✅ Session saved to Blob:', blob.url);
        return blob.url;
      } catch (error) {
        console.error('❌ Error saving to Blob:', error);
        throw error;
      }
    } else {
      // Desarrollo local: guardar en archivos
      const filePath = path.join(this.localPath, sessionId, 'session.json');
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, data);
      console.log('💾 Session saved locally:', filePath);
      return filePath;
    }
  }

  /**
   * Carga una sesión desde Blob Storage
   * @param {string} sessionId - ID de la sesión
   * @returns {Promise<string|null>} Datos de la sesión o null si no existe
   */
  async loadSession(sessionId) {
    const key = `whatsapp-sessions/${sessionId}/session.json`;
    
    if (this.useBlob) {
      try {
        // Verificar si existe
        const exists = await this.sessionExists(sessionId);
        if (!exists) {
          console.log('ℹ️ Session not found in Blob:', sessionId);
          return null;
        }

        // Descargar desde Blob
        const url = `https://${process.env.VERCEL_URL || 'blob.vercel-storage.com'}/${key}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          console.log('⚠️ Session not accessible:', sessionId);
          return null;
        }

        const data = await response.text();
        console.log('✅ Session loaded from Blob:', sessionId);
        return data;
      } catch (error) {
        console.error('❌ Error loading from Blob:', error);
        return null;
      }
    } else {
      // Desarrollo local: cargar desde archivos
      try {
        const filePath = path.join(this.localPath, sessionId, 'session.json');
        const data = await fs.readFile(filePath, 'utf8');
        console.log('💾 Session loaded locally:', filePath);
        return data;
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log('ℹ️ Session not found locally:', sessionId);
          return null;
        }
        throw error;
      }
    }
  }

  /**
   * Verifica si una sesión existe
   * @param {string} sessionId - ID de la sesión
   * @returns {Promise<boolean>}
   */
  async sessionExists(sessionId) {
    const key = `whatsapp-sessions/${sessionId}/session.json`;
    
    if (this.useBlob) {
      try {
        await head(key, { token: this.token });
        return true;
      } catch (error) {
        return false;
      }
    } else {
      try {
        const filePath = path.join(this.localPath, sessionId, 'session.json');
        await fs.access(filePath);
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Elimina una sesión
   * @param {string} sessionId - ID de la sesión
   * @returns {Promise<void>}
   */
  async deleteSession(sessionId) {
    const key = `whatsapp-sessions/${sessionId}/session.json`;
    
    if (this.useBlob) {
      try {
        await del(key, { token: this.token });
        console.log('🗑️ Session deleted from Blob:', sessionId);
      } catch (error) {
        console.error('❌ Error deleting from Blob:', error);
        throw error;
      }
    } else {
      try {
        const dirPath = path.join(this.localPath, sessionId);
        await fs.rm(dirPath, { recursive: true, force: true });
        console.log('🗑️ Session deleted locally:', sessionId);
      } catch (error) {
        console.error('❌ Error deleting locally:', error);
        throw error;
      }
    }
  }

  /**
   * Lista todas las sesiones
   * @returns {Promise<string[]>} Lista de IDs de sesión
   */
  async listSessions() {
    if (this.useBlob) {
      try {
        const { blobs } = await list({
          prefix: 'whatsapp-sessions/',
          token: this.token,
        });

        // Extraer IDs únicos de sesión
        const sessionIds = new Set();
        blobs.forEach(blob => {
          const match = blob.pathname.match(/whatsapp-sessions\/([^\/]+)\//);
          if (match) {
            sessionIds.add(match[1]);
          }
        });

        console.log('📋 Sessions listed from Blob:', sessionIds.size);
        return Array.from(sessionIds);
      } catch (error) {
        console.error('❌ Error listing from Blob:', error);
        return [];
      }
    } else {
      try {
        const dirs = await fs.readdir(this.localPath);
        console.log('📋 Sessions listed locally:', dirs.length);
        return dirs;
      } catch (error) {
        if (error.code === 'ENOENT') {
          return [];
        }
        throw error;
      }
    }
  }

  /**
   * Guarda archivo de autenticación (QR, auth info, etc)
   * @param {string} sessionId - ID de la sesión
   * @param {string} filename - Nombre del archivo
   * @param {Buffer|string} data - Contenido del archivo
   * @returns {Promise<string>} URL o path del archivo
   */
  async saveAuthFile(sessionId, filename, data) {
    const key = `whatsapp-sessions/${sessionId}/${filename}`;
    
    if (this.useBlob) {
      try {
        const blob = await put(key, data, {
          access: 'public',
          token: this.token,
          addRandomSuffix: false,
        });
        console.log('✅ Auth file saved to Blob:', filename);
        return blob.url;
      } catch (error) {
        console.error('❌ Error saving auth file to Blob:', error);
        throw error;
      }
    } else {
      const filePath = path.join(this.localPath, sessionId, filename);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, data);
      console.log('💾 Auth file saved locally:', filename);
      return filePath;
    }
  }

  /**
   * Carga archivo de autenticación
   * @param {string} sessionId - ID de la sesión
   * @param {string} filename - Nombre del archivo
   * @returns {Promise<string|Buffer|null>}
   */
  async loadAuthFile(sessionId, filename) {
    const key = `whatsapp-sessions/${sessionId}/${filename}`;
    
    if (this.useBlob) {
      try {
        const url = `https://${process.env.VERCEL_URL || 'blob.vercel-storage.com'}/${key}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          return null;
        }

        // Determinar tipo de contenido
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('json')) {
          return await response.text();
        } else {
          return await response.buffer();
        }
      } catch (error) {
        console.error('❌ Error loading auth file from Blob:', error);
        return null;
      }
    } else {
      try {
        const filePath = path.join(this.localPath, sessionId, filename);
        return await fs.readFile(filePath);
      } catch (error) {
        if (error.code === 'ENOENT') {
          return null;
        }
        throw error;
      }
    }
  }
}

// Exportar instancia singleton
module.exports = new BlobStorageAdapter();
