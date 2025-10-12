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
  Card,
  CardMedia
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
  Mic,
  PlayArrow,
  Pause,
  Download,
  VideoFile,
  InsertDriveFile
} from '@mui/icons-material';

// Componente para renderizar imágenes
const ImageMessage = ({ message }) => {
  if (!message.media || !message.media.isImage) return null;

  const imageData = message.media.data.startsWith('data:') 
    ? message.media.data 
    : `data:${message.media.mimetype};base64,${message.media.data}`;

  // Crear un nombre de archivo más amigable
  const getDisplayFilename = () => {
    if (message.media.filename && !message.media.filename.includes('@') && !message.media.filename.includes('_')) {
      return message.media.filename;
    }
    // Si no hay nombre válido, usar fecha/hora
    const date = new Date(message.timestamp * 1000);
    const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `Imagen ${timeStr}`;
  };

  return (
    <Box sx={{ mt: 1, maxWidth: '250px' }}>
      <CardMedia
        component="img"
        image={imageData}
        alt="Imagen compartida"
        sx={{
          borderRadius: 3,
          maxWidth: '100%',
          height: 'auto',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
          }
        }}
        onClick={() => {
          // Abrir imagen en nueva ventana
          const newWindow = window.open();
          newWindow.document.write(`<img src="${imageData}" style="max-width:100%;height:auto;">`);
        }}
      />
      <Typography 
        variant="caption" 
        sx={{ 
          color: 'grey.600', 
          mt: 1, 
          display: 'block',
          fontSize: '0.75rem',
          fontWeight: 500
        }}
      >
        📷 {getDisplayFilename()}
      </Typography>
    </Box>
  );
};

// Componente para renderizar audio
const AudioMessage = ({ message }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  if (!message.media || !message.media.isAudio) return null;

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const audioData = message.media.data.startsWith('data:') 
    ? message.media.data 
    : `data:${message.media.mimetype};base64,${message.media.data}`;

  // Crear un nombre más amigable para el audio
  const getAudioLabel = () => {
    if (message.type === 'ptt') {
      return 'Mensaje de voz';
    }
    // Si hay un filename válido (sin IDs complejos), usarlo
    if (message.media.filename && 
        !message.media.filename.includes('@') && 
        !message.media.filename.includes('_') &&
        message.media.filename.length < 30) {
      return message.media.filename;
    }
    const date = new Date(message.timestamp * 1000);
    const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `Audio ${timeStr}`;
  };

  return (
    <Box sx={{ 
      mt: 1, 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1.5, 
      maxWidth: '280px',
      p: 1.5,
      backgroundColor: 'rgba(5, 150, 105, 0.05)',
      borderRadius: 3,
      border: '1px solid rgba(5, 150, 105, 0.2)'
    }}>
      <IconButton 
        size="medium" 
        onClick={togglePlayPause}
        sx={{ 
          backgroundColor: '#059669',
          color: 'white',
          width: 45,
          height: 45,
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
          '&:hover': { 
            backgroundColor: '#047857',
            transform: 'scale(1.1)',
            boxShadow: '0 6px 20px rgba(5, 150, 105, 0.4)',
          }
        }}
      >
        {isPlaying ? <Pause /> : <PlayArrow />}
      </IconButton>
      
      <Box sx={{ flex: 1 }}>
        <audio
          ref={audioRef}
          src={audioData}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#059669',
            mb: 0.5
          }}
        >
          🎵 {getAudioLabel()}
        </Typography>
        
        {message.media.duration && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'grey.600',
              fontSize: '0.75rem',
              fontWeight: 500
            }}
          >
            Duración: {Math.floor(message.media.duration / 60)}:{(message.media.duration % 60).toString().padStart(2, '0')}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// Componente para renderizar documentos/archivos
const DocumentMessage = ({ message }) => {
  if (!message.media || message.media.isImage || message.media.isAudio) return null;

  const getFileIcon = () => {
    if (message.media.isVideo) return <VideoFile />;
    if (message.media.isDocument) return <InsertDriveFile />;
    return <AttachFile />;
  };

  const getFileTypeText = () => {
    if (message.media.isVideo) return '🎥 Video';
    if (message.media.isDocument) return '📄 Documento';
    return '📎 Archivo';
  };

  // Crear un nombre de archivo más amigable
  const getDisplayFilename = () => {
    if (message.media.filename && 
        !message.media.filename.includes('@') && 
        !message.media.filename.includes('_') &&
        message.media.filename.length < 50) {
      return message.media.filename;
    }
    
    // Generar nombre basado en tipo y hora
    const date = new Date(message.timestamp * 1000);
    const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    if (message.media.isVideo) return `Video ${timeStr}`;
    if (message.media.isDocument) return `Documento ${timeStr}`;
    return `Archivo ${timeStr}`;
  };

  const downloadFile = () => {
    try {
      const fileData = message.media.data.startsWith('data:') 
        ? message.media.data 
        : `data:${message.media.mimetype};base64,${message.media.data}`;
      
      const link = document.createElement('a');
      link.href = fileData;
      link.download = getDisplayFilename();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error descargando archivo:', error);
    }
  };

  return (
    <Box sx={{ 
      mt: 1, 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1.5, 
      p: 2,
      border: '1px solid',
      borderColor: 'rgba(0,0,0,0.1)',
      borderRadius: 3,
      backgroundColor: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      maxWidth: '320px',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      '&:hover': {
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        transform: 'translateY(-2px)'
      }
    }}>
      <Box sx={{
        p: 1,
        borderRadius: '50%',
        backgroundColor: '#059669',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {getFileIcon()}
      </Box>
      
      <Box sx={{ flex: 1 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600,
            color: '#059669',
            mb: 0.5
          }}
        >
          {getFileTypeText()}
        </Typography>
        
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'grey.700',
            display: 'block',
            fontWeight: 500
          }}
        >
          {getDisplayFilename()}
        </Typography>
        
        {message.media.filesize && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'grey.600', 
              display: 'block',
              fontSize: '0.7rem'
            }}
          >
            Tamaño: {(message.media.filesize / 1024).toFixed(1)} KB
          </Typography>
        )}
      </Box>
      
      <IconButton 
        size="small" 
        onClick={downloadFile}
        sx={{
          backgroundColor: '#059669',
          color: 'white',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: '#047857',
            transform: 'scale(1.1)'
          }
        }}
      >
        <Download />
      </IconButton>
    </Box>
  );
};

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
    const hasMediaContent = message.hasMedia && message.media && !message.media.isError;
    
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
            maxWidth: hasMediaContent ? '85%' : '75%',
            minWidth: '120px',
            background: isFromMe 
              ? 'linear-gradient(135deg, #dcf8c6 0%, #d4edda 100%)' 
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: isFromMe 
              ? '1px solid rgba(5, 150, 105, 0.2)' 
              : '1px solid rgba(0,0,0,0.1)',
            borderRadius: 4,
            px: 2.5,
            py: 1.5,
            position: 'relative',
            boxShadow: isFromMe 
              ? '0 4px 12px rgba(5, 150, 105, 0.15)' 
              : '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isFromMe 
                ? '0 6px 20px rgba(5, 150, 105, 0.2)' 
                : '0 6px 20px rgba(0,0,0,0.15)'
            },
            // Flecha del globo de mensaje
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '10px',
              width: 0,
              height: 0,
              borderStyle: 'solid',
              ...(isFromMe ? {
                right: '-8px',
                borderWidth: '8px 0 8px 8px',
                borderColor: `transparent transparent transparent ${isFromMe ? '#dcf8c6' : '#ffffff'}`,
              } : {
                left: '-8px',
                borderWidth: '8px 8px 8px 0',
                borderColor: `transparent ${isFromMe ? '#dcf8c6' : '#ffffff'} transparent transparent`,
              })
            }
          }}
        >
          {showAuthor && (
            <Typography
              variant="caption"
              sx={{
                color: '#059669',
                fontWeight: 700,
                display: 'block',
                mb: 1,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              +{message.author?.split('@')[0]}
            </Typography>
          )}
          
          {/* Renderizar multimedia si existe */}
          {hasMediaContent && (
            <Box>
              <ImageMessage message={message} />
              <AudioMessage message={message} />
              <DocumentMessage message={message} />
            </Box>
          )}
          
          {/* Renderizar texto del mensaje */}
          {(message.body || !hasMediaContent) && (
            <Typography
              variant="body1"
              sx={{
                fontSize: '0.95rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: '200px',
                overflow: 'auto',
                mt: hasMediaContent ? 1.5 : 0,
                color: isFromMe ? '#2d5016' : '#1a1a1a',
                fontWeight: 400,
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
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontStyle: 'italic', 
                    color: 'grey.600',
                    fontSize: '0.85rem'
                  }}
                >
                  {message.media?.isError ? '❌ Error cargando multimedia' : getMediaTypeText(message.type)}
                </Typography>
              )}
            </Typography>
          )}
          
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0.5,
              mt: 1,
              opacity: 0.8
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: isFromMe ? '#2d5016' : 'grey.600',
                fontSize: '0.7rem',
                fontWeight: 500
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
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          color: 'white',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)'
        }}
      >
        <Avatar 
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)', 
            mr: 2, 
            width: 45, 
            height: 45,
            border: '2px solid rgba(255,255,255,0.3)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          {getChatAvatar(selectedChat)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: '1.1rem', 
              fontWeight: 600, 
              lineHeight: 1.2,
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            {getChatName(selectedChat)}
          </Typography>
          {selectedChat.isGroup && (
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.8)',
                fontWeight: 500
              }}
            >
              👥 Grupo
            </Typography>
          )}
        </Box>
        {selectedChat.unreadCount > 0 && (
          <Chip
            label={`${selectedChat.unreadCount}`}
            size="small"
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.9)', 
              color: '#059669',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
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
          background: 'linear-gradient(135deg, #e3f2fd 0%, #f0f4c3 50%, #e8f5e8 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
          '@keyframes gradientShift': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' }
          },
          minHeight: 0,
          maxHeight: 'calc(100vh - 200px)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 1px, transparent 1px),
              radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 1px, transparent 1px),
              radial-gradient(circle at 40% 40%, rgba(255,255,255,0.2) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px, 150px 150px, 200px 200px',
            opacity: 0.5,
            pointerEvents: 'none'
          },
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(45deg, #059669, #047857)',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(45deg, #047857, #065f46)',
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
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          flexShrink: 0,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
          <IconButton 
            size="medium" 
            sx={{ 
              color: '#059669',
              backgroundColor: 'rgba(5, 150, 105, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(5, 150, 105, 0.2)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <EmojiEmotions />
          </IconButton>
          
          <IconButton 
            size="medium" 
            sx={{ 
              color: '#059669',
              backgroundColor: 'rgba(5, 150, 105, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(5, 150, 105, 0.2)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <AttachFile />
          </IconButton>
          
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Escribe un mensaje..."
            variant="outlined"
            size="medium"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sendingMessage}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
                backgroundColor: '#ffffff',
                fontSize: '0.95rem',
                padding: '12px 16px',
                border: '2px solid rgba(5, 150, 105, 0.2)',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  borderColor: 'rgba(5, 150, 105, 0.4)',
                },
                '&.Mui-focused': {
                  borderColor: '#059669',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)',
                }
              },
              '& .MuiOutlinedInput-input': {
                padding: 0,
                fontFamily: '"Segoe UI", Roboto, sans-serif',
                '&::placeholder': {
                  color: 'rgba(0,0,0,0.6)',
                  fontSize: '0.9rem'
                }
              }
            }}
          />
          
          <IconButton
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sendingMessage}
            size="large"
            sx={{
              backgroundColor: messageText.trim() ? '#059669' : 'rgba(5, 150, 105, 0.1)',
              color: messageText.trim() ? 'white' : '#059669',
              width: 50,
              height: 50,
              transition: 'all 0.3s ease',
              boxShadow: messageText.trim() ? '0 4px 12px rgba(5, 150, 105, 0.4)' : 'none',
              '&:hover': {
                backgroundColor: messageText.trim() ? '#047857' : 'rgba(5, 150, 105, 0.2)',
                transform: 'scale(1.1)',
                boxShadow: messageText.trim() ? '0 6px 20px rgba(5, 150, 105, 0.5)' : '0 2px 8px rgba(5, 150, 105, 0.2)',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(0,0,0,0.05)',
                color: 'grey.400',
                transform: 'none',
                boxShadow: 'none'
              }
            }}
          >
            {sendingMessage ? (
              <CircularProgress size={20} color="inherit" />
            ) : messageText.trim() ? (
              <Send />
            ) : (
              <Mic />
            )}
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default WhatsAppChat;