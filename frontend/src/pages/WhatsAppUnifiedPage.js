import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  Badge,
  useTheme,
  alpha
} from '@mui/material';
import {
  Chat as ChatIcon,
  Settings as SettingsIcon,
  SmartToy as SmartToyIcon,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import { io } from 'socket.io-client';

// Import components from existing pages
import WhatsAppChatList from '../components/WhatsAppChatList';
import WhatsAppChat from '../components/WhatsAppChat';
import EvaAutoResponsePanel from '../components/EvaAutoResponsePanel';
import EvaWhatsAppControl from '../components/EvaWhatsAppControl';

// TabPanel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`whatsapp-tabpanel-${index}`}
      aria-labelledby={`whatsapp-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const WhatsAppUnifiedPage = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  
  // Estados principales de WhatsApp
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
  
  // Estados de chat
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // Estado para Eva Auto Response Panel
  const [showEvaPanel, setShowEvaPanel] = useState(false);
  
  // Contador de mensajes no leídos (para badge en tab)
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Conectar a WebSocket
    const socketConnection = io('http://localhost:3002');

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

    socketConnection.on('whatsapp_chats_loaded', (data) => {
      console.log('📋 Conversaciones cargadas:', data.chats.length);
      setChats(data.chats);
      setLoadingChats(false);
      
      setSuccess(`¡${data.chats.length} conversaciones cargadas!`);
      setTimeout(() => setSuccess(null), 3000);
      
      if (data.chats.length > 0 && !selectedChat) {
        setSelectedChat(data.chats[0]);
      }
    });

    socketConnection.on('whatsapp_message', (data) => {
      console.log('📨 Nuevo mensaje recibido:', data);
      
      if (selectedChat && data.chatId === selectedChat.id._serialized) {
        setChatMessages(prev => [...prev, data.message]);
      }
      
      // Actualizar contador de no leídos
      setUnreadCount(prev => prev + 1);
    });

    socketConnection.on('whatsapp_authenticated', () => {
      console.log('🔐 WhatsApp autenticado');
    });

    socketConnection.on('whatsapp_disconnected', () => {
      console.log('🔌 WhatsApp desconectado');
      setWhatsappStatus({
        isConnected: false,
        status: 'disconnected',
        connectedNumber: null,
        qrString: null
      });
      setChats([]);
      setSelectedChat(null);
    });

    socketConnection.on('whatsapp_error', (data) => {
      console.error('❌ Error de WhatsApp:', data);
      setError(data.message || 'Error en WhatsApp');
      setTimeout(() => setError(null), 5000);
    });

    // Verificar estado inicial
    const checkStatus = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/whatsapp/status');
        const data = await response.json();
        
        if (data.isConnected) {
          setWhatsappStatus({
            isConnected: true,
            status: 'connected',
            connectedNumber: data.info?.number
          });
          loadChats();
        }
      } catch (error) {
        console.error('Error checking WhatsApp status:', error);
      }
    };
    
    checkStatus();

    return () => {
      socketConnection.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInitialize = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3002/api/whatsapp/initialize', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('WhatsApp inicializado. Esperando código QR...');
      } else {
        throw new Error(data.error || 'Error al inicializar');
      }
    } catch (error) {
      console.error('Error initializing WhatsApp:', error);
      setError('Error al inicializar WhatsApp: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadChats = useCallback(async (force = false, source = 'manual') => {
    console.log(`🔍 loadChats llamado desde: ${source}, force: ${force}`);
    
    const minInterval = 8000;
    const now = Date.now();
    const lastRequest = window.lastChatsRequest || 0;
    const diff = now - lastRequest;
    
    if (!force && diff < minInterval) {
      console.log(`⏳ Esperando ${minInterval - diff}ms antes del siguiente request`);
      return;
    }
    
    window.lastChatsRequest = now;
    setLoadingChats(true);
    
    try {
      const response = await fetch('http://localhost:3002/api/whatsapp/chats');
      const data = await response.json();
      
      if (data.success && data.chats) {
        console.log('📋 Conversaciones recibidas:', data.chats.length);
        setChats(data.chats);
        
        if (data.chats.length > 0 && !selectedChat) {
          setSelectedChat(data.chats[0]);
        }
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      setError('Error al cargar conversaciones');
    } finally {
      setLoadingChats(false);
    }
  }, [selectedChat]);

  const loadMessages = useCallback(async (chatId) => {
    setLoadingMessages(true);
    
    try {
      const response = await fetch(`http://localhost:3002/api/whatsapp/chat/${chatId}/messages`);
      const data = await response.json();
      
      if (data.success && data.messages) {
        setChatMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Error al cargar mensajes');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const handleChatSelect = useCallback((chat) => {
    setSelectedChat(chat);
    loadMessages(chat.id._serialized);
    
    // Reset unread count cuando selecciona un chat
    setUnreadCount(0);
  }, [loadMessages]);

  const handleSendMessage = async (message) => {
    if (!selectedChat) return;
    
    try {
      const response = await fetch('http://localhost:3002/api/whatsapp/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedChat.id._serialized,
          message
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Mensaje enviado exitosamente');
      } else {
        throw new Error(data.error || 'Error al enviar mensaje');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error al enviar mensaje');
    }
  };

  const handleMarkAsRead = async (chatId) => {
    try {
      const response = await fetch(`http://localhost:3002/api/whatsapp/chat/${chatId}/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        console.log('✅ Chat marcado como leído');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/whatsapp/disconnect', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('WhatsApp desconectado exitosamente');
        setWhatsappStatus({
          isConnected: false,
          status: 'disconnected',
          connectedNumber: null
        });
        setChats([]);
        setSelectedChat(null);
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
      setError('Error al desconectar WhatsApp');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Reset unread count cuando visita el tab de chat
    if (newValue === 0) {
      setUnreadCount(0);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        {/* Header */}
        <Box 
          sx={{ 
            px: 3, 
            py: 2, 
            bgcolor: theme.palette.mode === 'dark' ? '#1a1a2e' : '#f8fafc',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WhatsAppIcon 
                sx={{ 
                  fontSize: 40, 
                  color: '#25D366'
                }} 
              />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  WhatsApp Business
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {whatsappStatus.isConnected 
                    ? `Conectado: ${whatsappStatus.connectedNumber || 'Verificando...'}`
                    : 'No conectado'
                  }
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: whatsappStatus.isConnected ? '#10b981' : '#ef4444',
                  boxShadow: `0 0 8px ${whatsappStatus.isConnected ? '#10b981' : '#ef4444'}`
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {whatsappStatus.isConnected ? 'En línea' : 'Desconectado'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Tabs Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              px: 2,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                minHeight: 64
              }
            }}
          >
            <Tab 
              icon={
                <Badge badgeContent={unreadCount} color="error">
                  <ChatIcon />
                </Badge>
              } 
              label="Chat" 
              iconPosition="start"
            />
            <Tab 
              icon={<SettingsIcon />} 
              label="Configuración" 
              iconPosition="start"
            />
            <Tab 
              icon={<SmartToyIcon />} 
              label="Eva Auto-Response" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ minHeight: 600 }}>
          {/* Tab 1: Chat Interface */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ display: 'flex', height: '70vh', gap: 2 }}>
              {/* Chat List */}
              <Box sx={{ width: 360, borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <WhatsAppChatList
                  chats={chats}
                  selectedChat={selectedChat}
                  onChatSelect={handleChatSelect}
                  loading={loadingChats}
                  onRefresh={() => loadChats(true, 'manual_refresh')}
                />
              </Box>

              {/* Chat Window */}
              <Box sx={{ flex: 1 }}>
                {selectedChat ? (
                  <WhatsAppChat
                    selectedChat={selectedChat}
                    messages={chatMessages}
                    loading={loadingMessages}
                    onSendMessage={handleSendMessage}
                    onMarkAsRead={handleMarkAsRead}
                    showEvaPanel={showEvaPanel}
                    onToggleEvaPanel={() => setShowEvaPanel(!showEvaPanel)}
                  />
                ) : (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      height: '100%',
                      flexDirection: 'column',
                      gap: 2
                    }}
                  >
                    <WhatsAppIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
                    <Typography variant="h6" color="text.secondary">
                      Selecciona una conversación para comenzar
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Eva Panel (si está activo) */}
              {showEvaPanel && (
                <Box sx={{ width: 320, borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <EvaAutoResponsePanel 
                    chatId={selectedChat?.id._serialized}
                  />
                </Box>
              )}
            </Box>
          </TabPanel>

          {/* Tab 2: Configuration */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              {/* Connection Status and Controls */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  mb: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  Estado de Conexión
                </Typography>
                
                {!whatsappStatus.isConnected ? (
                  <Box>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      WhatsApp no está conectado. Escanea el código QR para conectar.
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', alignItems: 'center' }}>
                      {qrImage && (
                        <Box 
                          component="img"
                          src={qrImage}
                          alt="WhatsApp QR Code"
                          sx={{ 
                            width: 300, 
                            height: 300,
                            border: `2px solid ${theme.palette.divider}`,
                            borderRadius: 2,
                            p: 2,
                            bgcolor: 'white'
                          }}
                        />
                      )}
                      
                      <button
                        onClick={handleInitialize}
                        disabled={loading}
                        style={{
                          padding: '12px 24px',
                          fontSize: '1rem',
                          fontWeight: 600,
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: '#25D366',
                          color: 'white',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.6 : 1
                        }}
                      >
                        {loading ? 'Conectando...' : 'Conectar WhatsApp'}
                      </button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body1" color="success.main" sx={{ mb: 2 }}>
                      ✓ WhatsApp conectado exitosamente
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Número: {whatsappStatus.connectedNumber}
                    </Typography>
                    
                    <button
                      onClick={handleDisconnect}
                      style={{
                        padding: '10px 20px',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      Desconectar WhatsApp
                    </button>
                  </Box>
                )}
              </Paper>

              {/* Stats */}
              {whatsappStatus.isConnected && (
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                    Estadísticas
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                        {chats.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Conversaciones
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                        {chats.filter(c => c.unreadCount > 0).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No leídos
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                        {chatMessages.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Mensajes
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}
            </Box>
          </TabPanel>

          {/* Tab 3: Eva Auto-Response */}
          <TabPanel value={activeTab} index={2}>
            <EvaWhatsAppControl />
          </TabPanel>
        </Box>
      </Paper>

      {/* Notifications */}
      {error && (
        <Box 
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            right: 24, 
            bgcolor: 'error.main',
            color: 'white',
            px: 3,
            py: 2,
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          {error}
        </Box>
      )}
      
      {success && (
        <Box 
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            right: 24, 
            bgcolor: 'success.main',
            color: 'white',
            px: 3,
            py: 2,
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          {success}
        </Box>
      )}
    </Container>
  );
};

export default WhatsAppUnifiedPage;
