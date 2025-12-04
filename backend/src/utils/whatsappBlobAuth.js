/**
 * Custom Auth Strategy para WhatsApp Web usando Vercel Blob Storage
 * 
 * Extiende la autenticación de WhatsApp Web para usar Blob Storage
 * en producción en lugar del sistema de archivos local.
 */

const { RemoteAuth } = require('whatsapp-web.js');
const blobStorage = require('./blobStorage');

class BlobAuthStrategy {
  constructor(options = {}) {
    this.sessionName = options.sessionName || 'default';
    this.clientId = options.clientId || 'eva-assistant';
  }

  async beforeBrowserInitialized() {
    console.log('🔐 Initializing Blob Auth Strategy...');
  }

  async logout() {
    console.log('👋 Logging out and cleaning session...');
    try {
      await blobStorage.deleteSession(this.sessionName);
      console.log('✅ Session cleaned from Blob Storage');
    } catch (error) {
      console.error('❌ Error cleaning session:', error);
    }
  }

  async destroy() {
    console.log('🗑️ Destroying session...');
    await this.logout();
  }

  /**
   * Guarda el estado de autenticación
   * @param {Object} param0 - Session data
   */
  async afterAuthReady({ session }) {
    console.log('💾 Saving auth session...');
    try {
      const sessionData = JSON.stringify(session);
      await blobStorage.saveSession(this.sessionName, sessionData);
      console.log('✅ Session saved successfully');
    } catch (error) {
      console.error('❌ Error saving session:', error);
      throw error;
    }
  }

  /**
   * Restaura el estado de autenticación
   * @returns {Promise<Object|null>} Session data or null
   */
  async extractAuthenticationState() {
    console.log('🔍 Loading existing session...');
    try {
      const sessionData = await blobStorage.loadSession(this.sessionName);
      
      if (!sessionData) {
        console.log('ℹ️ No previous session found, starting fresh');
        return null;
      }

      const session = JSON.parse(sessionData);
      console.log('✅ Previous session loaded successfully');
      return session;
    } catch (error) {
      console.error('❌ Error loading session:', error);
      return null;
    }
  }

  /**
   * Verifica si existe una sesión guardada
   * @returns {Promise<boolean>}
   */
  async sessionExists() {
    try {
      return await blobStorage.sessionExists(this.sessionName);
    } catch (error) {
      console.error('❌ Error checking session existence:', error);
      return false;
    }
  }

  /**
   * Obtiene información de la sesión
   * @returns {Promise<Object|null>}
   */
  async getSessionInfo() {
    try {
      const sessionData = await blobStorage.loadSession(this.sessionName);
      if (!sessionData) {
        return null;
      }

      const session = JSON.parse(sessionData);
      return {
        exists: true,
        clientId: this.clientId,
        sessionName: this.sessionName,
        hasWABrowserId: !!session.WABrowserId,
        hasWASecretBundle: !!session.WASecretBundle,
        hasWAToken1: !!session.WAToken1,
        hasWAToken2: !!session.WAToken2,
      };
    } catch (error) {
      console.error('❌ Error getting session info:', error);
      return null;
    }
  }
}

module.exports = BlobAuthStrategy;
