import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Paper,
  Alert,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider
} from '@mui/material';
import {
  WhatsApp,
  QrCode,
  Refresh,
  Send,
  PowerOff,
  CheckCircle,
  Error,
  Pending,
  Message,
  Phone,
  OpenInNew,
  Close
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const WhatsAppPage = () => {
  const navigate = useNavigate();
  const [whatsappStatus, setWhatsappStatus] = useState({
    isConnected: false,
    status: 'disconnected',
    connectedNumber: null,
    qrString: null
  });
  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [messageForm, setMessageForm] = useState({
    chatId: '',
    message: ''
  });

  useEffect(() => {
    // Conectar a WebSocket
    const socketConnection = io('http://localhost:3002');
    setSocket(socketConnection);

    // Escuchar eventos de WhatsApp
    socketConnection.on('whatsapp_qr', (data) => {
      console.log('📱 QR recibido via WebSocket');
      setQrImage(data.qr);
      setWhatsappStatus(prev => ({ ...prev, status: 'qr_ready' }));
    });

    socketConnection.on('whatsapp_ready', (data) => {
      console.log('✅ WhatsApp conectado via WebSocket');
      setWhatsappStatus({
        isConnected: true,
        status: 'connected',
        connectedNumber: data.info?.number,
        qrString: null
      });
      setQrImage(null);
      setSuccess('¡WhatsApp conectado exitosamente!');
      setTimeout(() => setSuccess(null), 3000);
    });

    socketConnection.on('whatsapp_authenticated', () => {
      console.log('🔐 WhatsApp autenticado');
      setWhatsappStatus(prev => ({ ...prev, status: 'authenticated' }));
    });

    socketConnection.on('whatsapp_disconnected', (data) => {
      console.log('🔌 WhatsApp desconectado:', data.reason);
      setWhatsappStatus({
        isConnected: false,
        status: 'disconnected',
        connectedNumber: null,
        qrString: null
      });
      setQrImage(null);
    });

    socketConnection.on('whatsapp_error', (data) => {
      console.error('❌ Error WhatsApp:', data.error);
      setError(`Error: ${data.error}`);
      setTimeout(() => setError(null), 5000);
    });

    socketConnection.on('whatsapp_message', (data) => {
      console.log('📨 Nuevo mensaje WhatsApp:', data);
      setMessages(prev => [data, ...prev]);
    });

    // Obtener estado inicial
    fetchWhatsAppStatus();

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const fetchWhatsAppStatus = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/whatsapp/status');
      const data = await response.json();
      
      if (data.success) {
        setWhatsappStatus(data.status);
        
        // Si hay QR disponible, obtenerlo
        if (data.status.status === 'qr_ready') {
          fetchQRCode();
        }
      }
    } catch (error) {
      console.error('Error fetching WhatsApp status:', error);
    }
  };

  const fetchQRCode = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/whatsapp/qr');
      const data = await response.json();
      
      if (data.success && data.qr) {
        setQrImage(data.qr);
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
    }
  };

  const initializeWhatsApp = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3002/api/whatsapp/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(data.message);
        setTimeout(() => setSuccess(null), 3000);
        
        // Actualizar estado después de un momento
        setTimeout(fetchWhatsAppStatus, 2000);
      } else {
        setError(data.error || 'Error al inicializar WhatsApp');
      }
    } catch (error) {
      setError('Error de conexión al inicializar WhatsApp');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWhatsApp = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3002/api/whatsapp/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(data.message);
        setTimeout(() => setSuccess(null), 3000);
        setQrImage(null);
        fetchWhatsAppStatus();
      } else {
        setError(data.error || 'Error al desconectar WhatsApp');
      }
    } catch (error) {
      setError('Error de conexión al desconectar WhatsApp');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageForm.chatId || !messageForm.message) {
      setError('Número de teléfono y mensaje son requeridos');
      return;
    }

    try {
      const response = await fetch('http://localhost:3002/api/whatsapp/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: messageForm.chatId.includes('@c.us') ? messageForm.chatId : `${messageForm.chatId}@c.us`,
          message: messageForm.message
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Mensaje enviado exitosamente');
        setMessageForm({ chatId: '', message: '' });
        setSendDialogOpen(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Error al enviar mensaje');
      }
    } catch (error) {
      setError('Error de conexión al enviar mensaje');
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'success';
      case 'authenticated': return 'success';
      case 'qr_ready': return 'warning';
      case 'disconnected': return 'default';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return <CheckCircle />;
      case 'authenticated': return <CheckCircle />;
      case 'qr_ready': return <QrCode />;
      case 'disconnected': return <PowerOff />;
      case 'error': return <Error />;
      default: return <Pending />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'authenticated': return 'Autenticado';
      case 'qr_ready': return 'Esperando QR';
      case 'disconnected': return 'Desconectado';
      case 'error': return 'Error';
      default: return 'Desconocido';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <WhatsApp sx={{ fontSize: 40, color: '#059669' }} />
          WhatsApp Integration
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Conecta Eva con WhatsApp Web para responder mensajes automáticamente
        </Typography>
        
        {/* Botón para ir a WhatsApp Web completo */}
        {whatsappStatus.isConnected && (
          <Button
            variant="outlined"
            startIcon={<OpenInNew />}
            onClick={() => navigate('/whatsapp-web')}
            sx={{ 
              mb: 2,
              borderColor: '#059669',
              color: '#059669',
              '&:hover': {
                borderColor: '#047857',
                backgroundColor: 'rgba(5, 150, 105, 0.04)'
              }
            }}
          >
            Abrir WhatsApp Web Completo
          </Button>
        )}
      </Box>

      {/* Alerts */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }} 
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setError(null)}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }} 
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setSuccess(null)}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
        >
          {success}
        </Alert>
      )}

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3}>
        {/* Status Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone />
                Estado de Conexión
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={getStatusIcon(whatsappStatus.status)}
                  label={getStatusText(whatsappStatus.status)}
                  color={getStatusColor(whatsappStatus.status)}
                  sx={{ mb: 1 }}
                />
                
                {whatsappStatus.connectedNumber && (
                  <Typography variant="body2" color="text.secondary">
                    Número conectado: +{whatsappStatus.connectedNumber}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {!whatsappStatus.isConnected ? (
                  <Button
                    variant="contained"
                    startIcon={<WhatsApp />}
                    onClick={initializeWhatsApp}
                    disabled={loading}
                    sx={{ backgroundColor: '#059669' }}
                  >
                    Conectar WhatsApp
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<PowerOff />}
                      onClick={disconnectWhatsApp}
                      disabled={loading}
                      color="error"
                    >
                      Desconectar
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Send />}
                      onClick={() => setSendDialogOpen(true)}
                      sx={{ backgroundColor: '#059669' }}
                    >
                      Enviar Mensaje
                    </Button>
                  </>
                )}
                
                <IconButton onClick={fetchWhatsAppStatus} disabled={loading}>
                  <Refresh />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* QR Code Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <QrCode />
                Código QR
              </Typography>
              
              {whatsappStatus.status === 'qr_ready' && qrImage ? (
                <Box sx={{ textAlign: 'center' }}>
                  <img 
                    src={qrImage} 
                    alt="WhatsApp QR Code" 
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Escanea este código con WhatsApp Web
                  </Typography>
                </Box>
              ) : whatsappStatus.isConnected ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                  <Typography variant="body1">
                    ¡WhatsApp conectado exitosamente!
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Haz click en "Conectar WhatsApp" para generar el código QR
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Messages */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Message />
                Mensajes Recientes
              </Typography>
              
              {messages.length > 0 ? (
                <List>
                  {messages.slice(0, 10).map((msg, index) => (
                    <React.Fragment key={msg.id || index}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#059669' }}>
                            <WhatsApp />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={msg.fromName || msg.from}
                          secondary={
                            <>
                              <Typography
                                sx={{ display: 'inline' }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {msg.body}
                              </Typography>
                              <br />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(msg.timestamp).toLocaleString()}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < messages.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay mensajes recientes
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Send Message Dialog */}
      <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Enviar Mensaje</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Número de teléfono (ej: 523341234567)"
            fullWidth
            variant="outlined"
            value={messageForm.chatId}
            onChange={(e) => setMessageForm({ ...messageForm, chatId: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Mensaje"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={messageForm.message}
            onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialogOpen(false)}>Cancelar</Button>
          <Button onClick={sendMessage} variant="contained" sx={{ backgroundColor: '#059669' }}>
            Enviar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WhatsAppPage;