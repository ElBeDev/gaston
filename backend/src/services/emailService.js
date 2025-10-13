const googleAuthService = require('./googleAuthService');
const sessionStorage = require('./sessionStorageService');

class EmailService {
  constructor() {
    this.userSessions = new Map(); // Runtime cache
    this.loadExistingSessions();
  }

  // Load existing sessions from persistent storage
  async loadExistingSessions() {
    try {
      const sessions = await sessionStorage.listGoogleSessions();
      for (const session of sessions) {
        this.userSessions.set(session.userId, session);
      }
      console.log(`📧 Loaded ${sessions.length} existing Google email sessions`);
    } catch (error) {
      console.error('❌ Error loading existing sessions:', error);
    }
  }

  // Set user session for email sending
  async setUserSession(userId, sessionData) {
    const sessionWithLastUsed = {
      tokens: sessionData.tokens,
      user: sessionData.user,
      lastUsed: new Date()
    };
    
    this.userSessions.set(userId, sessionWithLastUsed);
    
    // Save to persistent storage
    await sessionStorage.saveGoogleSession(userId, sessionWithLastUsed);
  }

  // Get user session for email sending
  async getUserSession(userId) {
    // Try runtime cache first
    let session = this.userSessions.get(userId);
    
    // If not in cache, try persistent storage
    if (!session) {
      session = await sessionStorage.loadGoogleSession(userId);
      if (session) {
        this.userSessions.set(userId, session);
      }
    }
    
    return session;
  }

  // Send email on behalf of user (for AI assistant)
  async sendEmailAsUser(userId, emailData) {
    const session = await this.getUserSession(userId);
    
    if (!session || !session.tokens) {
      throw new Error('Usuario no autenticado con Google');
    }

    try {
      const gmail = googleAuthService.getGmailClient(session.tokens);
      
      const { to, subject, body, cc, bcc } = emailData;
      
      // Build email message
      const messageParts = [
        `To: ${to}`,
        'Content-Type: text/html; charset=utf-8',
        `Subject: ${subject}`
      ];
      
      if (cc) messageParts.push(`Cc: ${cc}`);
      if (bcc) messageParts.push(`Bcc: ${bcc}`);
      
      messageParts.push('', body);
      
      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage }
      });
      
      // Update last used timestamp
      session.lastUsed = new Date();
      
      return {
        success: true,
        messageId: result.data.id,
        sentBy: session.user.email,
        sentAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error sending email as user:', error);
      
      // If token expired, try to refresh
      if (error.message.includes('invalid_grant') || error.message.includes('unauthorized')) {
        try {
          const newTokens = await googleAuthService.refreshTokenIfNeeded(session.tokens);
          session.tokens = newTokens;
          
          // Retry sending email with new token
          return await this.sendEmailAsUser(userId, emailData);
        } catch (refreshError) {
          throw new Error('Token de autenticación expirado. El usuario debe volver a iniciar sesión.');
        }
      }
      
      throw error;
    }
  }

  // Check if user can send emails
  canUserSendEmails(userId) {
    const session = this.getUserSession(userId);
    return !!(session && session.tokens);
  }

  // Get user email info
  getUserEmailInfo(userId) {
    const session = this.getUserSession(userId);
    
    if (!session) {
      return null;
    }

    return {
      email: session.user.email,
      name: session.user.name,
      canSendEmails: !!session.tokens,
      lastUsed: session.lastUsed
    };
  }

  // Clean expired sessions (call periodically)
  cleanExpiredSessions() {
    const expiredTime = 24 * 60 * 60 * 1000; // 24 hours
    const now = new Date();
    
    for (const [userId, session] of this.userSessions.entries()) {
      if (now - session.lastUsed > expiredTime) {
        this.userSessions.delete(userId);
      }
    }
  }
}

module.exports = new EmailService();