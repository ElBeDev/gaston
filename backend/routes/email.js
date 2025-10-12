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

// Get messages from specific folder/label
router.get('/messages', requireAuth, async (req, res) => {
  try {
    const gmail = googleAuthService.getGmailClient(req.session.tokens);
    const folder = req.query.folder || 'INBOX';
    const maxResults = parseInt(req.query.maxResults) || 20;
    
    // Get message list
    const response = await gmail.users.messages.list({ 
      userId: 'me', 
      labelIds: [folder],
      maxResults: maxResults
    });
    
    if (!response.data.messages) {
      return res.json({ messages: [] });
    }
    
    // Get full message details for each message
    const messages = await Promise.all(
      response.data.messages.map(async (message) => {
        try {
          const msgDetails = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full'
          });
          
          const headers = msgDetails.data.payload.headers;
          const getHeader = (name) => headers.find(h => h.name === name)?.value || '';
          
          // Extract text content
          let body = '';
          let snippet = msgDetails.data.snippet || '';
          
          const extractTextFromPart = (part) => {
            if (part.mimeType === 'text/plain' && part.body.data) {
              return Buffer.from(part.body.data, 'base64').toString('utf-8');
            }
            if (part.parts) {
              return part.parts.map(extractTextFromPart).join('');
            }
            return '';
          };
          
          if (msgDetails.data.payload.body.data) {
            body = Buffer.from(msgDetails.data.payload.body.data, 'base64').toString('utf-8');
          } else if (msgDetails.data.payload.parts) {
            body = extractTextFromPart(msgDetails.data.payload);
          }
          
          return {
            id: message.id,
            threadId: msgDetails.data.threadId,
            subject: getHeader('Subject'),
            from: getHeader('From'),
            to: getHeader('To'),
            date: getHeader('Date'),
            snippet: snippet,
            body: body.substring(0, 1000), // Limit body length
            unread: msgDetails.data.labelIds?.includes('UNREAD') || false,
            starred: msgDetails.data.labelIds?.includes('STARRED') || false,
            labels: msgDetails.data.labelIds || []
          };
        } catch (error) {
          console.error('Error getting message details:', error);
          return null;
        }
      })
    );
    
    // Filter out null results
    const validMessages = messages.filter(msg => msg !== null);
    
    res.json({ messages: validMessages });
  } catch (err) {
    console.error('Error listing emails:', err);
    res.status(500).json({ error: 'Error al listar emails.' });
  }
});

// Get specific message
router.get('/messages/:messageId', requireAuth, async (req, res) => {
  try {
    const gmail = googleAuthService.getGmailClient(req.session.tokens);
    const messageId = req.params.messageId;
    
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });
    
    const headers = response.data.payload.headers;
    const getHeader = (name) => headers.find(h => h.name === name)?.value || '';
    
    // Extract full text content
    let body = '';
    const extractTextFromPart = (part) => {
      if (part.mimeType === 'text/plain' && part.body.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
      if (part.mimeType === 'text/html' && part.body.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
      if (part.parts) {
        return part.parts.map(extractTextFromPart).join('');
      }
      return '';
    };
    
    if (response.data.payload.body.data) {
      body = Buffer.from(response.data.payload.body.data, 'base64').toString('utf-8');
    } else if (response.data.payload.parts) {
      body = extractTextFromPart(response.data.payload);
    }
    
    const message = {
      id: messageId,
      threadId: response.data.threadId,
      subject: getHeader('Subject'),
      from: getHeader('From'),
      to: getHeader('To'),
      cc: getHeader('Cc'),
      bcc: getHeader('Bcc'),
      date: getHeader('Date'),
      body: body,
      snippet: response.data.snippet,
      unread: response.data.labelIds?.includes('UNREAD') || false,
      starred: response.data.labelIds?.includes('STARRED') || false,
      labels: response.data.labelIds || []
    };
    
    res.json(message);
  } catch (err) {
    console.error('Error getting message:', err);
    res.status(500).json({ error: 'Error al obtener el mensaje.' });
  }
});

// List emails (basic example) - Keep for backward compatibility
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

// Send email (expects to, subject, text/body in req.body)
router.post('/send', requireAuth, async (req, res) => {
  const { to, subject, text, body, cc, bcc } = req.body;
  const emailBody = body || text; // Support both 'body' and 'text' fields
  
  if (!to || !subject || !emailBody) {
    return res.status(400).json({ error: 'Faltan campos requeridos (to, subject, body/text).' });
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
    
    messageParts.push('', emailBody);
    
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
