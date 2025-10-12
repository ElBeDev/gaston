import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Backdrop,
  Paper,
  IconButton
} from '@mui/material';
import {
  WhatsApp,
  QrCode,
  Refresh,
  Close
} from '@mui/icons-material';
import { io } from 'socket.io-client';
import WhatsAppChatList from '../components/WhatsAppChatList';
import WhatsAppChat from '../components/WhatsAppChat';

const WhatsAppWebPage = () => {
  // Estados principales
  const [whatsappStatus, setWhatsappStatus] = useState({
    isConnected: false,
    status: 'disconnected',
    connectedNumber: null,
    qrString: null
  });
  
  // Estados de UI
  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  
  // Estados de chat
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // WebSocket
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Conectar a WebSocket
    const socketConnection = io('http://localhost:3002');
    setSocket(socketConnection);

    // Escuchar eventos de WhatsApp
    socketConnection.on('whatsapp_qr', (data) => {
      console.log('📱 QR recibido via WebSocket');
      setQrImage(data.qr);
      setWhatsappStatus(prev => ({ ...prev, status: 'qr_ready' }));
      // No abrir dialog automáticamente, se muestra en la página principal
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
      setQrDialogOpen(false);
      setSuccess('¡WhatsApp conectado exitosamente!');
      setTimeout(() => setSuccess(null), 3000);
      
      // No cargar chats aquí, esperamos el evento chats_loaded
    });

    socketConnection.on('whatsapp_chats_loaded', (data) => {
      console.log('📋 Conversaciones cargadas via WebSocket:', data.chats.length, data.chats);
      setChats(data.chats);
      setLoadingChats(false);
      setInitialLoadComplete(true);
      
      // Mostrar mensaje de éxito con el número de conversaciones cargadas
      setSuccess(`¡${data.chats.length} conversaciones cargadas exitosamente!`);
      setTimeout(() => setSuccess(null), 3000);
      
      // Si no hay chat seleccionado, seleccionar el primero
      if (data.chats.length > 0 && !selectedChat) {
        console.log('📋 Seleccionando primera conversación:', data.chats[0]);
        setSelectedChat(data.chats[0]);
      }
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
      setQrDialogOpen(false);
      setChats([]);
      setSelectedChat(null);
      setChatMessages([]);
    });

    socketConnection.on('whatsapp_error', (data) => {
      console.error('❌ Error WhatsApp:', data.error);
      setError(`Error: ${data.error}`);
      setTimeout(() => setError(null), 5000);
    });

    socketConnection.on('whatsapp_message', (data) => {
      console.log('📨 Nuevo mensaje WhatsApp:', data);
      
      // Debounce para evitar múltiples llamadas
      setTimeout(() => {
        loadChats();
        
        // Si es el chat seleccionado, actualizar mensajes
        if (selectedChat && selectedChat.id === data.from) {
          loadChatMessages(selectedChat.id);
        }
      }, 1000);
    });

    socketConnection.on('whatsapp_chats_updated', () => {
      console.log('📋 Lista de chats actualizada');
      // Recargar chats cuando hay cambios
      if (whatsappStatus.isConnected) {
        loadChats();
      }
    });

    // Obtener estado inicial
    fetchWhatsAppStatus();

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  // Cargar mensajes cuando cambie el chat seleccionado
  useEffect(() => {
    if (selectedChat && whatsappStatus.isConnected) {
      loadChatMessages(selectedChat.id);
    }
  }, [selectedChat, whatsappStatus.isConnected]);

  const fetchWhatsAppStatus = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/whatsapp/status');
      const data = await response.json();
      
      console.log('📋 Estado de WhatsApp:', data);
      
      if (data.success) {
        setWhatsappStatus(data.status);
        
        // Si está conectado, cargar chats inmediatamente
        if (data.status.isConnected) {
          console.log('📋 WhatsApp ya está conectado, cargando chats...');
          setLoadingChats(true);
          // Esperar un poco antes de cargar chats para asegurar que esté listo
          setTimeout(() => {
            loadChats();
          }, 1000);
        }
        
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
        // No abrir dialog automáticamente, se muestra en la página principal
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

  const loadChats = useCallback(async () => {
    if (!whatsappStatus.isConnected) return;
    
    console.log('📋 Función loadChats llamada...');
    setLoadingChats(true);
    try {
      const response = await fetch('http://localhost:3002/api/whatsapp/chats');
      const data = await response.json();
      
      console.log('📋 Respuesta de API /chats:', data);
      
      if (data.success) {
        console.log(`📋 Conversaciones recibidas: ${data.chats.length}`);
        setChats(data.chats);
        setInitialLoadComplete(true);
        
        // Si no hay chat seleccionado y hay chats disponibles, seleccionar el primero
        if (data.chats.length > 0 && !selectedChat) {
          console.log('📋 Seleccionando primera conversación:', data.chats[0]);
          setSelectedChat(data.chats[0]);
        }
      } else {
        setError(data.error || 'Error al cargar conversaciones');
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      setError('Error de conexión al cargar conversaciones');
    } finally {
      setLoadingChats(false);
    }
  }, [whatsappStatus.isConnected, selectedChat]);

  const loadChatMessages = async (chatId) => {
    setLoadingMessages(true);
    try {
      const response = await fetch(`http://localhost:3002/api/whatsapp/chat/${encodeURIComponent(chatId)}/messages`);
      const data = await response.json();
      
      if (data.success) {
        setChatMessages(data.messages);
      } else {
        setError(data.error || 'Error al cargar mensajes');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Error de conexión al cargar mensajes');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };

  const handleSendMessage = async (chatId, message) => {
    try {
      const response = await fetch('http://localhost:3002/api/whatsapp/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chatId,
          message: message
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Recargar mensajes del chat
        loadChatMessages(chatId);
        // Recargar lista de chats para actualizar último mensaje
        loadChats();
      } else {
        setError(data.error || 'Error al enviar mensaje');
      }
    } catch (error) {
      setError('Error de conexión al enviar mensaje');
      console.error('Error:', error);
    }
  };

  const handleMarkAsRead = async (chatId) => {
    try {
      await fetch(`http://localhost:3002/api/whatsapp/chat/${encodeURIComponent(chatId)}/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Actualizar lista de chats
      loadChats();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Renderizado condicional para estado de conexión
  if (!whatsappStatus.isConnected) {
    return (
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <WhatsApp sx={{ fontSize: 40, color: '#059669' }} />
            WhatsApp Web
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Conecta tu WhatsApp para usar la interfaz web completa
          </Typography>
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

        {/* Estado de conexión */}
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500, mx: 'auto' }}>
          {whatsappStatus.status === 'qr_ready' && qrImage ? (
            <>
              <QrCode sx={{ fontSize: 60, color: '#059669', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                Escanea el código QR
              </Typography>
              <Box sx={{ mb: 3 }}>
                <img 
                  src={qrImage} 
                  alt="WhatsApp QR Code" 
                  style={{ 
                    maxWidth: '100%', 
                    height: 'auto', 
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    padding: 8,
                    backgroundColor: 'white'
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                1. Abre WhatsApp en tu teléfono<br />
                2. Toca Menú → Dispositivos vinculados<br />
                3. Toca Vincular un dispositivo<br />
                4. Apunta tu teléfono a esta pantalla
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={initializeWhatsApp}
                size="small"
                sx={{ borderColor: '#059669', color: '#059669' }}
              >
                Generar Nuevo QR
              </Button>
            </>
          ) : (
            <>
              <WhatsApp sx={{ fontSize: 80, color: '#059669', mb: 2 }} />
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                Para usar WhatsApp Web
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Necesitas conectar tu teléfono escaneando el código QR
              </Typography>
              
              <Button
                variant="contained"
                startIcon={<WhatsApp />}
                onClick={initializeWhatsApp}
                disabled={loading}
                size="large"
                sx={{ backgroundColor: '#059669', '&:hover': { backgroundColor: '#047857' } }}
              >
                {loading ? 'Conectando...' : 'Conectar WhatsApp'}
              </Button>
            </>
          )}
        </Paper>

        {/* Dialog QR */}
        <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCode />
            Escanea el código QR
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center' }}>
            {qrImage ? (
              <>
                <img 
                  src={qrImage} 
                  alt="WhatsApp QR Code" 
                  style={{ maxWidth: '100%', height: 'auto', marginBottom: 16 }}
                />
                <Typography variant="body2" color="text.secondary">
                  1. Abre WhatsApp en tu teléfono<br />
                  2. Toca Menú → Dispositivos vinculados<br />
                  3. Toca Vincular un dispositivo<br />
                  4. Apunta tu teléfono a esta pantalla para capturar el código
                </Typography>
              </>
            ) : (
              <Box sx={{ p: 3 }}>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography>Generando código QR...</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setQrDialogOpen(false)} startIcon={<Close />}>
              Cerrar
            </Button>
            <Button onClick={fetchQRCode} startIcon={<Refresh />}>
              Actualizar QR
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Interfaz principal de WhatsApp Web
  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header minimalista */}
      <Box sx={{ 
        p: 1.5, 
        borderBottom: 1, 
        borderColor: 'divider',
        backgroundColor: '#075E54',
        color: 'white',
        flexShrink: 0
      }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.1rem' }}>
          <WhatsApp />
          WhatsApp Web
        </Typography>
      </Box>

      {/* Alerts - Compactas */}
      {(error || success) && (
        <Box sx={{ flexShrink: 0 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mx: 1, mt: 1, py: 0.5 }} 
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
              sx={{ mx: 1, mt: 1, py: 0.5 }} 
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
        </Box>
      )}

      {/* Botón temporal para debug - Compacto */}
      {whatsappStatus.isConnected && (
        <Box sx={{ py: 1, px: 2, textAlign: 'center', flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={loadChats}
            disabled={loadingChats}
            sx={{ mr: 2 }}
          >
            {loadingChats ? 'Cargando...' : 'Cargar Conversaciones'}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            Chats cargados: {chats.length} | Chat seleccionado: {selectedChat?.name || 'Ninguno'}
          </Typography>
        </Box>
      )}

      {/* Contenido principal - Altura fija con scroll */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        overflow: 'hidden',
        minHeight: 0
      }}>
        <Grid container sx={{ height: '100%', spacing: 0 }}>
          {/* Panel izquierdo - Lista de chats */}
          <Grid 
            size={{ xs: 12, md: 4 }} 
            sx={{ 
              borderRight: 1, 
              borderColor: 'divider',
              height: '100%',
              overflow: 'hidden'
            }}
          >
            <WhatsAppChatList
              chats={chats}
              selectedChatId={selectedChat?.id}
              onChatSelect={handleChatSelect}
              loading={loadingChats}
              initialLoadComplete={initialLoadComplete}
            />
          </Grid>

          {/* Panel derecho - Chat */}
          <Grid 
            size={{ xs: 12, md: 8 }}
            sx={{ 
              height: '100%',
              overflow: 'hidden'
            }}
          >
            <WhatsAppChat
              selectedChat={selectedChat}
              messages={chatMessages}
              loading={loadingMessages}
              onSendMessage={handleSendMessage}
              onMarkAsRead={handleMarkAsRead}
              connectedNumber={whatsappStatus.connectedNumber}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Botón flotante para refrescar */}
      <Fab
        color="primary"
        aria-label="refresh"
        size="medium"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          backgroundColor: '#059669',
          '&:hover': { backgroundColor: '#047857' }
        }}
        onClick={loadChats}
      >
        <Refresh />
      </Fab>
    </Box>
  );
};

export default WhatsAppWebPage;