
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Typography,
  Paper,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Search,
  Person,
  Business,
  Star,
  Warning,
  FilterList
} from '@mui/icons-material';

// Fallback test data if API returns nothing
const TEST_CONTACTS = [
  { 
    _id: '1', 
    name: 'María Rodríguez', 
    company: 'Acme Corp', 
    businessData: { segment: 'VIP' }, 
    aiInsights: { urgency: 'High' },
    email: 'maria@acme.com',
    metadata: { lastInteraction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
  },
  { 
    _id: '2', 
    name: 'Carlos Pérez', 
    company: 'Beta Inc', 
    businessData: { segment: 'Standard' }, 
    aiInsights: { urgency: 'Low' },
    email: 'carlos@beta.com',
    metadata: { lastInteraction: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  },
  { 
    _id: '3', 
    name: 'Lucía Gómez', 
    company: 'Gamma LLC', 
    businessData: { segment: 'VIP' }, 
    aiInsights: { urgency: 'Medium' },
    email: 'lucia@gamma.com',
    metadata: { lastInteraction: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
  },
  { 
    _id: '4', 
    name: 'Roberto Silva', 
    company: 'Delta Corp', 
    businessData: { segment: 'Standard' }, 
    aiInsights: { urgency: 'High' },
    email: 'roberto@delta.com',
    metadata: { lastInteraction: null }
  },
  { 
    _id: '5', 
    name: 'Ana López', 
    company: 'Epsilon Ltd', 
    businessData: { segment: 'Other' }, 
    aiInsights: { urgency: 'Low' },
    email: 'ana@epsilon.com',
    metadata: { lastInteraction: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
  }
];

const ContactSearch = ({ onSelectContact, selectedContactId }) => {
  const [search, setSearch] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch contacts from API whenever filters/search change
  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedSegment) params.append('segment', selectedSegment);
        if (selectedUrgency) params.append('urgency', selectedUrgency);
        
        const res = await fetch(`/api/crm/contacts?${params.toString()}`);
        if (!res.ok) throw new Error('No se pudieron obtener los contactos');
        const data = await res.json();
        
        // If no contacts, use test data as fallback
        if (Array.isArray(data.contacts) && data.contacts.length > 0) {
          setContacts(data.contacts);
        } else {
          setContacts(TEST_CONTACTS);
        }
      } catch (err) {
        setError(err.message);
        setContacts(TEST_CONTACTS); // Fallback to test data on error
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [search, selectedSegment, selectedUrgency]);

  const getSegmentColor = (segment) => {
    switch (segment) {
      case 'VIP': return '#059669';
      case 'Standard': return '#2563eb';
      case 'Other': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'High': return '#dc2626';
      case 'Medium': return '#ea580c';
      case 'Low': return '#059669';
      default: return '#6b7280';
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getLastInteractionText = (lastInteraction) => {
    if (!lastInteraction) return 'Sin interacciones';
    const days = Math.floor((Date.now() - new Date(lastInteraction)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    return `Hace ${days} días`;
  };

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact => {
    const searchLower = search.toLowerCase();
    const matchesSearch = !search || 
      contact.name.toLowerCase().includes(searchLower) ||
      (contact.company && contact.company.toLowerCase().includes(searchLower)) ||
      (contact.email && contact.email.toLowerCase().includes(searchLower));
    
    const matchesSegment = !selectedSegment || 
      (contact.businessData?.segment === selectedSegment);
    
    const matchesUrgency = !selectedUrgency || 
      (contact.aiInsights?.urgency === selectedUrgency);
    
    return matchesSearch && matchesSegment && matchesUrgency;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: '#fff' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Search sx={{ color: '#2563eb' }} />
          Buscar Contactos
        </Typography>
        
        {/* Search Input */}
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por nombre, empresa o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Segmento</InputLabel>
            <Select
              value={selectedSegment}
              label="Segmento"
              onChange={(e) => setSelectedSegment(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="VIP">VIP</MenuItem>
              <MenuItem value="Standard">Standard</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Urgencia</InputLabel>
            <Select
              value={selectedUrgency}
              label="Urgencia"
              onChange={(e) => setSelectedUrgency(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="High">Alta</MenuItem>
              <MenuItem value="Medium">Media</MenuItem>
              <MenuItem value="Low">Baja</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Results Count */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {loading ? 'Buscando...' : `${filteredContacts.length} contacto${filteredContacts.length !== 1 ? 's' : ''} encontrado${filteredContacts.length !== 1 ? 's' : ''}`}
        </Typography>
      </Box>

      {/* Contact List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        {error && (
          <Alert severity="warning" sx={{ m: 2 }}>
            {error} - Mostrando datos de prueba
          </Alert>
        )}

        {!loading && filteredContacts.length === 0 && (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Person sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No se encontraron contactos
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Intenta ajustar los filtros de búsqueda
            </Typography>
          </Box>
        )}

        <List sx={{ p: 0 }}>
          {filteredContacts.map((contact, index) => {
            const isSelected = contact._id === selectedContactId || contact.id === selectedContactId;
            const segment = contact.businessData?.segment || 'Standard';
            const urgency = contact.aiInsights?.urgency || 'Medium';
            
            return (
              <React.Fragment key={contact._id || contact.id}>
                <ListItem sx={{ p: 0 }}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => onSelectContact && onSelectContact(contact)}
                    sx={{
                      py: 2,
                      px: 2,
                      borderLeft: isSelected ? 4 : 0,
                      borderColor: '#2563eb',
                      '&.Mui-selected': {
                        bgcolor: 'rgba(37, 99, 235, 0.08)',
                        '&:hover': {
                          bgcolor: 'rgba(37, 99, 235, 0.12)'
                        }
                      },
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: getSegmentColor(segment),
                          width: 40,
                          height: 40,
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {getInitials(contact.name)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {contact.name}
                          </Typography>
                          {segment === 'VIP' && (
                            <Star sx={{ fontSize: 16, color: '#059669' }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {contact.company || 'Sin empresa'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Chip 
                              label={segment} 
                              size="small" 
                              sx={{ 
                                fontSize: '0.75rem',
                                height: 20,
                                bgcolor: `${getSegmentColor(segment)}20`,
                                color: getSegmentColor(segment),
                                fontWeight: 500
                              }}
                            />
                            <Chip 
                              label={urgency} 
                              size="small" 
                              sx={{ 
                                fontSize: '0.75rem',
                                height: 20,
                                bgcolor: `${getUrgencyColor(urgency)}20`,
                                color: getUrgencyColor(urgency),
                                fontWeight: 500
                              }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.disabled">
                            {getLastInteractionText(contact.metadata?.lastInteraction)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < filteredContacts.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>
      </Box>
    </Box>
  );
};

export default ContactSearch;
