import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  CircularProgress,
  Chip,
  Card
} from '@mui/material';
import {
  Send,
  Person,
  Group,
  Check,
  DoneAll,
  AccessTime,
  EmojiEmotions,
  AttachFile,
  Mic
} from '@mui/icons-material';

const WhatsAppChat = ({ 
  selectedChat, 
  messages, 
  loading, 
  onSendMessage, 
  onMarkAsRead,
  connectedNumber 
}) => {
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Siempre scroll al final cuando lleguen nuevos mensajes
    // Usar setTimeout para asegurar que el DOM se haya actualizado
    setTimeout(() => scrollToBottom(), 50);
  }, [messages]);

  useEffect(() => {
    // Scroll al final cuando se seleccione un chat diferente
    if (selectedChat) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (selectedChat && onMarkAsRead) {
      onMarkAsRead(selectedChat.id);
    }
  }, [selectedChat, onMarkAsRead]);

  const scrollToBottom = () => {
    // Método 1: Scroll del elemento de referencia
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Método 2: Scroll directo del contenedor por si acaso
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat || sendingMessage) return;

    setSendingMessage(true);
    
    try {
      await onSendMessage(selectedChat.id, messageText.trim());
      setMessageText('');
      // Scroll al final después de enviar mensaje
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageStatusIcon = (message) => {
    if (!message.fromMe) return null;

    switch (message.ack) {
      case 1:
        return <AccessTime sx={{ fontSize: 16, color: 'grey.500' }} />;
      case 2:
        return <Check sx={{ fontSize: 16, color: 'grey.500' }} />;
      case 3:
        return <DoneAll sx={{ fontSize: 16, color: 'grey.500' }} />;
      case 4:
        return <DoneAll sx={{ fontSize: 16, color: '#059669' }} />;
      default:
        return <AccessTime sx={{ fontSize: 16, color: 'grey.500' }} />;
    }
  };

  const getChatName = (chat) => {
    if (chat.name) {
      return chat.name;
    }
    const number = chat.id.split('@')[0];
    return `+${number}`;
  };

  const getChatAvatar = (chat) => {
    if (chat.isGroup) {
      return <Group sx={{ color: 'white' }} />;
    }
    return <Person sx={{ color: 'white' }} />;
  };

  const renderMessage = (message, index) => {
    const isFromMe = message.fromMe;
    const showAuthor = selectedChat?.isGroup && !isFromMe;
    
    return (
      <Box
        key={message.id || index}
        sx={{
          display: 'flex',
          width: '100%',
          justifyContent: isFromMe ? 'flex-end' : 'flex-start',
          mb: 1
        }}
      >
        <Card
          sx={{
            maxWidth: '70%',
            minWidth: '100px',
            backgroundColor: isFromMe ? '#d4edda' : '#ffffff',
            border: isFromMe ? '1px solid #c3e6cb' : '1px solid #e3e3e3',
            borderRadius: 2,
            px: 2,
            py: 1,
            position: 'relative',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          {showAuthor && (
            <Typography
              variant="caption"
              sx={{
                color: '#059669',
                fontWeight: 600,
                display: 'block',
                mb: 0.5
              }}
            >
              +{message.author?.split('@')[0]}
            </Typography>
          )}
          
          <Typography
            variant="body1"
            sx={{
              fontSize: '0.95rem',
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '200px', // Limitar altura máxima del mensaje
              overflow: 'auto', // Scroll si el mensaje es muy largo
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '2px',
              },
            }}
          >
            {message.body || (
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'grey.600' }}>
                {getMediaTypeText(message.type)}
              </Typography>
            )}
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0.5,
              mt: 0.5
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'grey.600',
                fontSize: '0.75rem'
              }}
            >
              {formatMessageTime(message.timestamp)}
            </Typography>
            {getMessageStatusIcon(message)}
          </Box>
        </Card>
      </Box>
    );
  };

  const getMediaTypeText = (type) => {
    switch (type) {
      case 'image': return '📷 Imagen';
      case 'video': return '🎥 Video';
      case 'audio': return '🎵 Audio';
      case 'document': return '📄 Documento';
      case 'sticker': return '🎭 Sticker';
      default: return 'Archivo multimedia';
    }
  };

  if (!selectedChat) {
    return (
      <Paper sx={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: '#f8f9fa'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <img 
            src="/logo192.png" 
            alt="WhatsApp" 
            style={{ 
              width: 120, 
              height: 120, 
              opacity: 0.3,
              marginBottom: 20 
            }} 
          />
          <Typography variant="h6" color="text.secondary">
            Selecciona una conversación
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Elige una conversación del panel izquierdo para comenzar a chatear
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header del chat */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: '#f5f5f5',
          flexShrink: 0
        }}
      >
        <Avatar sx={{ bgcolor: '#059669', mr: 1.5, width: 36, height: 36 }}>
          {getChatAvatar(selectedChat)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 500, lineHeight: 1.2 }}>
            {getChatName(selectedChat)}
          </Typography>
          {selectedChat.isGroup && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Grupo
            </Typography>
          )}
        </Box>
        {selectedChat.unreadCount > 0 && (
          <Chip
            label={`${selectedChat.unreadCount}`}
            size="small"
            color="primary"
            sx={{ backgroundColor: '#059669', fontSize: '0.75rem' }}
          />
        )}
      </Box>

      {/* Área de mensajes */}
      <Box
        ref={chatContainerRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          scrollBehavior: 'smooth',
          backgroundColor: '#e5ddd5',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="chat-bg" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"%3E%3Cg opacity="0.02"%3E%3Cpath d="M20 20h60v60H20z" fill="%23000"/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23chat-bg)"/%3E%3C/svg%3E")',
          minHeight: 0, // Importante para que funcione el flex
          maxHeight: 'calc(100vh - 200px)', // Altura máxima relativa al viewport
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(0,0,0,0.5)',
          },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box 
            sx={{ 
              p: 2, 
              minHeight: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1,
              justifyContent: 'flex-end'
            }}
          >
            {messages.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <Typography variant="body2" sx={{ color: 'grey.600', fontStyle: 'italic' }}>
                  No hay mensajes en esta conversación
                </Typography>
              </Box>
            ) : (
              messages.map((message, index) => renderMessage(message, index))
            )}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* Input de mensaje */}
      <Box
        sx={{
          p: 1.5,
          borderTop: 1,
          borderColor: 'divider',
          backgroundColor: '#ffffff',
          flexShrink: 0
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <IconButton size="small" color="primary" sx={{ p: 0.5 }}>
            <EmojiEmotions />
          </IconButton>
          
          <IconButton size="small" color="primary" sx={{ p: 0.5 }}>
            <AttachFile />
          </IconButton>
          
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Escribe un mensaje..."
            variant="outlined"
            size="small"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sendingMessage}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: '#ffffff',
                fontSize: '0.9rem'
              }
            }}
          />
          
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sendingMessage}
            size="small"
            sx={{
              backgroundColor: messageText.trim() ? '#059669' : 'transparent',
              color: messageText.trim() ? 'white' : 'inherit',
              p: 0.75,
              '&:hover': {
                backgroundColor: messageText.trim() ? '#047857' : 'transparent',
              },
              '&.Mui-disabled': {
                backgroundColor: 'transparent',
                color: 'grey.400'
              }
            }}
          >
            {sendingMessage ? <CircularProgress size={18} /> : 
             messageText.trim() ? <Send /> : <Mic />}
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default WhatsAppChat;