// Gmail API actions for Eva backend
const express = require('express');
const router = express.Router();
const googleAuthService = require('../src/services/googleAuthService');

// Middleware to check authentication
function requireAuth(req, res, next) {
  if (!req.session || !req.session.tokens) {
    return res.status(401).json({ error: 'No autenticado con Google.' });
  }
  next();
}

// List emails (basic example)
router.get('/list', requireAuth, async (req, res) => {
  try {
    const gmail = googleAuthService.getGmailClient(req.session.tokens);
    const response = await gmail.users.messages.list({ 
      userId: 'me', 
      maxResults: parseInt(req.query.maxResults) || 10 
    });
    res.json(response.data);
  } catch (err) {
    console.error('Error listing emails:', err);
    res.status(500).json({ error: 'Error al listar emails.' });
  }
});

// Send email (expects to, subject, body in req.body)
router.post('/send', requireAuth, async (req, res) => {
  const { to, subject, body, cc, bcc } = req.body;
  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Faltan campos requeridos (to, subject, body).' });
  }
  try {
    const gmail = googleAuthService.getGmailClient(req.session.tokens);
    
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
    
    res.json({ 
      success: true, 
      messageId: result.data.id,
      message: 'Email enviado correctamente'
    });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Error al enviar el email.' });
  }
});

// Save draft (expects to, subject, body in req.body)
router.post('/draft', requireAuth, async (req, res) => {
  const { to, subject, body, cc, bcc } = req.body;
  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Faltan campos requeridos (to, subject, body).' });
  }
  try {
    const gmail = googleAuthService.getGmailClient(req.session.tokens);
    
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
    
    const result = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: { message: { raw: encodedMessage } }
    });
    
    res.json({ 
      success: true, 
      draftId: result.data.id,
      message: 'Borrador guardado correctamente'
    });
  } catch (err) {
    console.error('Error saving draft:', err);
    res.status(500).json({ error: 'Error al guardar el borrador.' });
  }
});

// Send email as assistant (for AI to use)
router.post('/send-as-assistant', async (req, res) => {
  const { userId, emailData } = req.body;
  
  if (!userId || !emailData) {
    return res.status(400).json({ error: 'userId y emailData son requeridos' });
  }

  try {
    const emailService = require('../src/services/emailService');
    const result = await emailService.sendEmailAsUser(userId, emailData);
    
    res.json({
      success: true,
      result: result,
      message: 'Email enviado por el asistente'
    });
  } catch (error) {
    console.error('Error sending email as assistant:', error);
    res.status(500).json({ 
      error: error.message || 'Error al enviar email' 
    });
  }
});

module.exports = router;
