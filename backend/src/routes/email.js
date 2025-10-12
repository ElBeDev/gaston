const express = require('express');
const router = express.Router();


const { google } = require('googleapis');

function getOAuth2ClientFromSession(session) {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback';
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  if (session.tokens) {
    oauth2Client.setCredentials(session.tokens);
  }
  return oauth2Client;
}

function requireGoogleAuth(req, res, next) {
  if (!req.session || !req.session.isGoogleAuthenticated || !req.session.tokens) {
    return res.status(401).json({ error: 'No autenticado con Google.' });
  }
  next();
}

// Enviar correo real usando Gmail API
router.post('/send', requireGoogleAuth, async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    if (!to || !subject || !message) {
      return res.status(400).json({ error: 'Faltan campos requeridos.' });
    }
    const oauth2Client = getOAuth2ClientFromSession(req.session);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const raw = Buffer.from(
      `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${message}`
    ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw }
    });
    res.json({ success: true, message: 'Correo enviado.' });
  } catch (err) {
    console.error('Error enviando correo:', err);
    res.status(500).json({ error: 'Error enviando correo.' });
  }
});

// Listar correos (solo los 10 más recientes)
router.get('/list', requireGoogleAuth, async (req, res) => {
  try {
    const oauth2Client = getOAuth2ClientFromSession(req.session);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const messagesRes = await gmail.users.messages.list({ userId: 'me', maxResults: 10 });
    const messages = messagesRes.data.messages || [];
    res.json({ success: true, emails: messages });
  } catch (err) {
    console.error('Error listando correos:', err);
    res.status(500).json({ error: 'Error listando correos.' });
  }
});

// Guardar borrador
router.post('/draft', requireGoogleAuth, async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    if (!to || !subject || !message) {
      return res.status(400).json({ error: 'Faltan campos requeridos.' });
    }
    const oauth2Client = getOAuth2ClientFromSession(req.session);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const raw = Buffer.from(
      `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${message}`
    ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    await gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message: { raw }
      }
    });
    res.json({ success: true, message: 'Borrador guardado.' });
  } catch (err) {
    console.error('Error guardando borrador:', err);
    res.status(500).json({ error: 'Error guardando borrador.' });
  }
});

module.exports = router;
