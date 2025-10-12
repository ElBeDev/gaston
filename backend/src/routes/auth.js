const express = require('express');
const router = express.Router();



// Google OAuth2 real implementation
const { google } = require('googleapis');
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback';
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

// Step 1: Redirect user to Google OAuth2 consent screen
router.get('/google', (req, res) => {
  const oauth2Client = getOAuth2Client();
  const state = Math.random().toString(36).substring(2); // simple state
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

// Step 2: Handle OAuth2 callback, exchange code for tokens
router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state || state !== req.session.oauthState) {
    return res.status(400).send('Invalid state or missing code.');
  }
  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    req.session.tokens = tokens;
    req.session.isGoogleAuthenticated = true;
    // Optionally get user profile
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userinfo = await oauth2.userinfo.get();
    req.session.userinfo = userinfo.data;
    // Redirigir a la app React (ajusta la ruta si quieres ir a /chat, /correo, etc)
    res.redirect('http://localhost:3000/');
  } catch (err) {
    console.error('OAuth2 callback error:', err);
    res.status(500).send('Authentication failed.');
  }
});

// Success endpoint (for frontend to check session)
router.get('/google/success', (req, res) => {
  if (req.session.isGoogleAuthenticated) {
    res.json({ success: true, user: req.session.userinfo });
  } else {
    res.status(401).json({ error: 'No autenticado con Google.' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: 'Sesión cerrada (dummy)' });
  });
});

module.exports = router;