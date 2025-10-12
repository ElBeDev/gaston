const googleAuthService = require('./googleAuthService');

class EmailService {
  constructor() {
    this.userSessions = new Map(); // In production, use Redis or database
  }

  // Set user session for email sending
  setUserSession(userId, sessionData) {
    this.userSessions.set(userId, {
      tokens: sessionData.tokens,
      user: sessionData.user,
      lastUsed: new Date()
    });
  }

  // Get user session for email sending
  getUserSession(userId) {
    return this.userSessions.get(userId);
  }

  // Send email on behalf of user (for AI assistant)
  async sendEmailAsUser(userId, emailData) {
    const session = this.getUserSession(userId);
    
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