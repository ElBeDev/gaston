import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Badge,
  Divider,
  TextField,
  InputAdornment,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Search,
  WhatsApp,
  Group,
  Person
} from '@mui/icons-material';

const WhatsAppChatList = ({ chats, selectedChatId, onChatSelect, loading, initialLoadComplete = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);

  useEffect(() => {
    if (!chats) {
      setFilteredChats([]);
      return;
    }

    const filtered = chats.filter(chat => 
      chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage?.body?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredChats(filtered);
  }, [chats, searchTerm]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.getTime() === today.getTime() - 86400000) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  };

  const getLastMessagePreview = (chat) => {
    if (!chat.lastMessage) return 'No hay mensajes';
    
    let preview = '';
    
    if (chat.lastMessage.fromMe) {
      preview = 'Tú: ';
    } else if (chat.isGroup && chat.lastMessage.author) {
      const authorNumber = chat.lastMessage.author.split('@')[0];
      preview = `+${authorNumber}: `;
    }
    
    switch (chat.lastMessage.type) {
      case 'image':
        preview += '📷 Imagen';
        break;
      case 'video':
        preview += '🎥 Video';
        break;
      case 'audio':
        preview += '🎵 Audio';
        break;
      case 'document':
        preview += '📄 Documento';
        break;
      case 'sticker':
        preview += '🎭 Sticker';
        break;
      default:
        preview += chat.lastMessage.body || 'Mensaje';
        break;
    }
    
    return preview.length > 50 ? preview.substring(0, 50) + '...' : preview;
  };

  const getChatAvatar = (chat) => {
    if (chat.isGroup) {
      return <Group sx={{ color: '#059669' }} />;
    }
    return <Person sx={{ color: '#059669' }} />;
  };

  const getChatName = (chat) => {
    if (chat.name) {
      return chat.name;
    }
    
    // Si no hay nombre, extraer el número del ID
    const number = chat.id.split('@')[0];
    return `+${number}`;
  };

  if (loading && !initialLoadComplete) {
    return (
      <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Cargando conversaciones...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header de búsqueda */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider', 
        flexShrink: 0,
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        color: 'white'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            fontWeight: 600,
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}
        >
          💬 Conversaciones
        </Typography>
        <TextField
          fullWidth
          placeholder="Buscar conversación..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              borderRadius: 2, // Menos redondeado
              border: 'none',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              fontSize: '0.9rem',
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: '2px solid #059669',
              },
            },
            '& .MuiOutlinedInput-input': {
              padding: '12px 14px',
              '&::placeholder': {
                color: 'rgba(0,0,0,0.6)',
              }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" sx={{ color: '#059669' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Lista de chats */}
      <Box 
        sx={{ 
          flex: 1, 
          overflow: 'auto',
          minHeight: 0,
          background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(180deg, #94a3b8 0%, #64748b 100%)',
          },
        }}
      >
        {filteredChats.length === 0 ? (
          <Box sx={{ 
            p: 4, 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '300px'
          }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontSize: '3.5rem',
                opacity: 0.3,
                mb: 2
              }}
            >
              💬
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(0,0,0,0.6)',
                fontWeight: 500,
                fontSize: '0.95rem'
              }}
            >
              {!initialLoadComplete && loading
                ? 'Cargando conversaciones...'
                : chats && chats.length === 0 
                ? 'No hay conversaciones disponibles'
                : 'No se encontraron resultados'
              }
            </Typography>
            {!initialLoadComplete && loading && (
              <CircularProgress 
                size={28} 
                sx={{ 
                  mt: 3,
                  color: '#059669'
                }} 
              />
            )}
          </Box>
        ) : (
          <List sx={{ p: 1 }}>
            {filteredChats.map((chat, index) => (
              <React.Fragment key={chat.id}>
                <ListItem
                  component="button"
                  onClick={() => onChatSelect(chat)}
                  selected={selectedChatId === chat.id}
                  sx={{
                    py: 1.5,
                    px: 2,
                    my: 0.5,
                    mx: 1,
                    minHeight: '72px',
                    borderRadius: 1, // Menos redondeado
                    transition: 'all 0.2s ease-in-out',
                    background: selectedChatId === chat.id ? 
                      'linear-gradient(135deg, #059669 0%, #047857 100%)' : 
                      'white',
                    color: selectedChatId === chat.id ? 'white' : 'inherit',
                    boxShadow: selectedChatId === chat.id ? 
                      '0 2px 8px rgba(5, 150, 105, 0.2)' :
                      '0 1px 2px rgba(0,0,0,0.08)',
                    borderLeft: selectedChatId === chat.id ? 
                      '4px solid rgba(255,255,255,0.4)' : 
                      '4px solid transparent',
                    '&:hover': {
                      boxShadow: selectedChatId === chat.id ? 
                        '0 3px 12px rgba(5, 150, 105, 0.3)' :
                        '0 2px 8px rgba(0,0,0,0.12)',
                      background: selectedChatId === chat.id ? 
                        'linear-gradient(135deg, #059669 0%, #047857 100%)' :
                        '#f8fafc',
                    },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: '56px' }}>
                    <Badge
                      badgeContent={chat.unreadCount || 0}
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: selectedChatId === chat.id ? 
                            'rgba(255,255,255,0.9)' : '#ef4444',
                          color: selectedChatId === chat.id ? 
                            '#059669' : 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          minWidth: '20px',
                          height: '20px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2, // Menos redondeado, más cuadrado
                          background: selectedChatId === chat.id ? 
                            'rgba(255,255,255,0.15)' : 
                            'linear-gradient(135deg, #059669 0%, #047857 100%)',
                          color: 'white',
                          fontSize: '1.1rem',
                          fontWeight: 500,
                          border: selectedChatId === chat.id ? 
                            '2px solid rgba(255,255,255,0.3)' : 
                            '1px solid rgba(5, 150, 105, 0.2)',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                        }}
                      >
                        {getChatAvatar(chat)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: chat.unreadCount > 0 ? 600 : 400,
                            fontSize: '0.9rem',
                            color: 'text.primary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '65%'
                          }}
                        >
                          {getChatName(chat)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.75rem'
                          }}
                        >
                          {formatTimestamp(chat.timestamp)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '0.8rem',
                          mt: 0.25,
                          lineHeight: 1.2
                        }}
                      >
                        {getLastMessagePreview(chat)}
                      </Typography>
                    }
                    sx={{ margin: 0 }}
                  />
                </ListItem>
                {index < filteredChats.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default WhatsAppChatList;