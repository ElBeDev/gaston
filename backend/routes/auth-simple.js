const express = require('express');
const router = express.Router();
const { google } = require('googleapis');

// Scopes básicos para testing (no requieren aprobación)
const BASIC_SCOPES = [
  'openid',
  'profile', 
  'email',
  'https://www.googleapis.com/auth/gmail.send', // Este debería funcionar
];

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

function getOAuth2Client() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

// Test con scopes básicos
router.get('/google-basic', (req, res) => {
  const oauth2Client = getOAuth2Client();
  const state = Math.random().toString(36).substring(2);
  req.session.oauthState = state;
  console.log('🔐 Testing BASIC scopes:', BASIC_SCOPES);
  
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: BASIC_SCOPES,
    state,
    prompt: 'consent'
  });
  console.log('🔗 Basic OAuth URL:', url);
  res.redirect(url);
});

module.exports = router;