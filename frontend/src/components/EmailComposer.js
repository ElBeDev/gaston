import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Send as SendIcon,
  Drafts as DraftIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const EmailComposer = () => {
  const { isAuthenticated, sendEmail } = useAuth();
  const [emailData, setEmailData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleInputChange = (field) => (event) => {
    setEmailData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSendEmail = async () => {
    if (!emailData.to || !emailData.subject || !emailData.body) {
      setMessage({
        type: 'error',
        text: 'Por favor completa todos los campos requeridos (Para, Asunto, Mensaje)'
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await sendEmail(emailData);
      setMessage({
        type: 'success',
        text: result.message || 'Email enviado correctamente'
      });
      
      // Clear form
      setEmailData({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        body: ''
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error al enviar el email. Por favor intenta de nuevo.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    // TODO: Implement save draft functionality
    setMessage({
      type: 'info',
      text: 'Funcionalidad de borrador próximamente'
    });
  };

  if (!isAuthenticated) {
    return (
      <Card sx={{ maxWidth: 600, margin: 'auto' }}>
        <CardContent>
          <Alert severity="warning">
            Debes iniciar sesión con Google para enviar correos.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 600, margin: 'auto' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Enviar Email
        </Typography>
        
        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Box component="form" noValidate>
          <TextField
            fullWidth
            label="Para *"
            value={emailData.to}
            onChange={handleInputChange('to')}
            margin="normal"
            placeholder="destinatario@ejemplo.com"
          />
          
          <TextField
            fullWidth
            label="CC"
            value={emailData.cc}
            onChange={handleInputChange('cc')}
            margin="normal"
            placeholder="copia@ejemplo.com"
          />
          
          <TextField
            fullWidth
            label="BCC"
            value={emailData.bcc}
            onChange={handleInputChange('bcc')}
            margin="normal"
            placeholder="copia-oculta@ejemplo.com"
          />
          
          <TextField
            fullWidth
            label="Asunto *"
            value={emailData.subject}
            onChange={handleInputChange('subject')}
            margin="normal"
            placeholder="Asunto del correo"
          />
          
          <TextField
            fullWidth
            label="Mensaje *"
            value={emailData.body}
            onChange={handleInputChange('body')}
            margin="normal"
            multiline
            rows={8}
            placeholder="Escribe tu mensaje aquí..."
          />

          <Divider sx={{ my: 2 }} />

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<DraftIcon />}
              onClick={handleSaveDraft}
              disabled={loading}
            >
              Guardar Borrador
            </Button>
            
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              onClick={handleSendEmail}
              disabled={loading || !emailData.to || !emailData.subject || !emailData.body}
            >
              {loading ? 'Enviando...' : 'Enviar'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EmailComposer;