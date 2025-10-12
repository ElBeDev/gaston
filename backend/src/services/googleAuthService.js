const { google } = require('googleapis');

class GoogleAuthService {
  constructor() {
    this.CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    this.CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    this.REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
  }

  getOAuth2Client() {
    return new google.auth.OAuth2(
      this.CLIENT_ID,
      this.CLIENT_SECRET,
      this.REDIRECT_URI
    );
  }

  getAuthenticatedClient(tokens) {
    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials(tokens);
    return oauth2Client;
  }

  async refreshTokenIfNeeded(tokens) {
    const oauth2Client = this.getAuthenticatedClient(tokens);
    
    try {
      // Check if token needs refresh
      const { credentials } = await oauth2Client.refreshAccessToken();
      return credentials;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Authentication expired');
    }
  }

  async getUserInfo(tokens) {
    try {
      const auth = this.getAuthenticatedClient(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth });
      const { data } = await oauth2.userinfo.get();
      return data;
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  getGmailClient(tokens) {
    const auth = this.getAuthenticatedClient(tokens);
    return google.gmail({ version: 'v1', auth });
  }

  getCalendarClient(tokens) {
    const auth = this.getAuthenticatedClient(tokens);
    return google.calendar({ version: 'v3', auth });
  }

  getDriveClient(tokens) {
    const auth = this.getAuthenticatedClient(tokens);
    return google.drive({ version: 'v3', auth });
  }
}

module.exports = new GoogleAuthService();