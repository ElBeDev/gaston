const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const emailService = require('../src/services/emailService');
const sessionStorage = require('../src/services/sessionStorageService');

// Load client_id, client_secret, redirect_uri from config/env
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://gastonassistant.duckdns.org/auth/google/callback';

const SCOPES = [
  'openid',
  'profile',
  'email',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

function getOAuth2Client() {
  return new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
}

// Initiate Google OAuth2 login
router.get('/google', (req, res) => {
  const oauth2Client = getOAuth2Client();
  const state = Math.random().toString(36).substring(2);
  req.session.oauthState = state;
  console.log('🔐 Requested scopes:', SCOPES);
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state,
    prompt: 'consent',
    include_granted_scopes: true,
    approval_prompt: 'force'
  });
  console.log('🔗 OAuth URL:', url);
  res.redirect(url);
});

// OAuth2 callback
router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  console.log('📝 Callback received with scopes:', req.query.scope);
  if (!code || !state || state !== req.session.oauthState) {
    return res.status(400).send('Invalid state or missing code.');
  }
  const oauth2Client = getOAuth2Client();
  try {
    const { tokens } = await oauth2Client.getToken(code);
    req.session.tokens = tokens;
    
    // Fetch user profile info
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();
    
    req.session.user = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture
    };

    // Store session in both emailService and calendarService for AI assistant to use
    await emailService.setUserSession(req.session.user.id, {
      tokens: tokens,
      user: req.session.user
    });

    const calendarService = require('../src/services/calendarService');
    await calendarService.setUserSession(req.session.user.id, {
      tokens: tokens,
      user: req.session.user
    });
    
    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}?auth=success`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}?auth=error`);
  }
});

// Get current user info
router.get('/user', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.session.user);
});

// Check authentication status
router.get('/status', (req, res) => {
  res.json({
    authenticated: !!req.session.tokens,
    user: req.session.user || null
  });
});

// Logout
router.get('/logout', async (req, res) => {
  if (req.session.user?.id) {
    await sessionStorage.deleteGoogleSession(req.session.user.id);
  }
  req.session.destroy(() => {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}?auth=logout`);
  });
});

// Get session status
router.get('/sessions', async (req, res) => {
  try {
    const status = await sessionStorage.getSessionStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting session status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete WhatsApp session (force re-authentication)
router.delete('/whatsapp-session', async (req, res) => {
  try {
    const result = await sessionStorage.deleteWhatsAppSession();
    res.json({ success: result });
  } catch (error) {
    console.error('Error deleting WhatsApp session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
