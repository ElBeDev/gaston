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
      <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <TextField
          fullWidth
          placeholder="Buscar conversación..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '0.9rem'
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
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
          '&::-webkit-scrollbar': {
            width: '6px',
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
        {filteredChats.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <WhatsApp sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              {!initialLoadComplete && loading
                ? 'Cargando conversaciones...'
                : chats && chats.length === 0 
                ? 'No hay conversaciones disponibles'
                : 'No se encontraron resultados'
              }
            </Typography>
            {!initialLoadComplete && loading && (
              <CircularProgress size={24} sx={{ mt: 2 }} />
            )}
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredChats.map((chat, index) => (
              <React.Fragment key={chat.id}>
                <ListItem
                  component="button"
                  onClick={() => onChatSelect(chat)}
                  selected={selectedChatId === chat.id}
                  sx={{
                    py: 1,
                    px: 1.5,
                    minHeight: '60px',
                    '&.Mui-selected': {
                      backgroundColor: '#e3f2fd',
                      '&:hover': {
                        backgroundColor: '#e3f2fd',
                      },
                    },
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: '48px' }}>
                    <Badge
                      badgeContent={chat.unreadCount || 0}
                      color="primary"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: '#059669',
                          fontSize: '0.7rem',
                          minWidth: '16px',
                          height: '16px'
                        },
                      }}
                    >
                      <Avatar sx={{ bgcolor: '#f5f5f5', width: 36, height: 36 }}>
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