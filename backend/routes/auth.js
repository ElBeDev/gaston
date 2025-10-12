const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const emailService = require('../src/services/emailService');

// Load client_id, client_secret, redirect_uri from config/env
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'openid',
  'profile',
  'email'
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
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state,
    prompt: 'consent',
    include_granted_scopes: true
  });
  res.redirect(url);
});

// OAuth2 callback
router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
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

    // Store session in emailService for AI assistant to use
    emailService.setUserSession(req.session.user.id, {
      tokens: tokens,
      user: req.session.user
    });
    
    // Redirect to frontend with success
    res.redirect('http://localhost:3001?auth=success');
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect('http://localhost:3001?auth=error');
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
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}?auth=logout`);
  });
});

module.exports = router;
