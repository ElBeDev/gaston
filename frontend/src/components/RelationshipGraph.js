import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
  Paper,
  Grid
} from '@mui/material';
import {
  AccountTree,
  Person,
  Business,
  TrendingUp,
  Psychology,
  Timeline,
  Group,
  Link,
  Add
} from '@mui/icons-material';

const RelationshipGraph = ({ contact }) => {
  if (!contact) {
    return (
      <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <AccountTree sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Red de Relaciones
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
            Selecciona un contacto para ver sus conexiones
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Mock related contacts for demonstration - replace with real API data
  const relatedContacts = [
    { 
      id: '2', 
      name: 'Carlos Pérez', 
      company: 'Beta Inc',
      relationship: 'Colega',
      strength: 'Alta',
      lastInteraction: '2024-09-20'
    },
    { 
      id: '3', 
      name: 'Lucía Gómez', 
      company: 'Gamma LLC',
      relationship: 'Cliente',
      strength: 'Media',
      lastInteraction: '2024-09-18'
    },
    { 
      id: '4', 
      name: 'Roberto Silva', 
      company: 'Delta Corp',
      relationship: 'Proveedor',
      strength: 'Baja',
      lastInteraction: '2024-09-15'
    }
  ];

  // Mock network insights
  const networkInsights = {
    totalConnections: relatedContacts.length,
    strongConnections: relatedContacts.filter(r => r.strength === 'Alta').length,
    networkValue: 'Alto',
    influence: 'Media'
  };

  const getRelationshipColor = (relationship) => {
    switch (relationship.toLowerCase()) {
      case 'cliente': return '#059669';
      case 'colega': return '#2563eb';
      case 'proveedor': return '#7c3aed';
      case 'socio': return '#ea580c';
      default: return '#6b7280';
    }
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'Alta': return '#059669';
      case 'Media': return '#ea580c';
      case 'Baja': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      {/* Header */}
      <Card sx={{ boxShadow: 1 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountTree sx={{ color: '#2563eb' }} />
            Red de Relaciones
          </Typography>
          
          {/* Central Contact */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                width: 56, 
                height: 56, 
                bgcolor: '#2563eb',
                mx: 'auto',
                mb: 1,
                fontSize: '1.25rem',
                fontWeight: 'bold'
              }}
            >
              {getInitials(contact.name)}
            </Avatar>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {contact.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {contact.company || 'Sin empresa'}
            </Typography>
          </Box>

          {/* Network Stats */}
          <Grid container spacing={1}>
            <Grid size={{ xs: 6 }}>
              <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#f8fafc' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2563eb' }}>
                  {networkInsights.totalConnections}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Conexiones
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#f8fafc' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#059669' }}>
                  {networkInsights.strongConnections}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Fuertes
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Connected Contacts */}
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', boxShadow: 1 }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Group sx={{ color: '#2563eb' }} />
              Conexiones
            </Typography>
            <Button 
              size="small" 
              startIcon={<Add />}
              sx={{ 
                bgcolor: '#f3f4f6',
                color: '#374151',
                '&:hover': { bgcolor: '#e5e7eb' }
              }}
            >
              Agregar
            </Button>
          </Box>

          {relatedContacts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Group sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Sin conexiones
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Las relaciones aparecerán aquí
              </Typography>
            </Box>
          ) : (
            <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
              {relatedContacts.map((related, index) => (
                <React.Fragment key={related.id}>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: getRelationshipColor(related.relationship),
                          width: 40,
                          height: 40,
                          fontSize: '0.875rem'
                        }}
                      >
                        {getInitials(related.name)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {related.name}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {related.company}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            <Chip 
                              label={related.relationship}
                              size="small"
                              sx={{ 
                                fontSize: '0.7rem',
                                height: 18,
                                bgcolor: `${getRelationshipColor(related.relationship)}20`,
                                color: getRelationshipColor(related.relationship)
                              }}
                            />
                            <Chip 
                              label={related.strength}
                              size="small"
                              sx={{ 
                                fontSize: '0.7rem',
                                height: 18,
                                bgcolor: `${getStrengthColor(related.strength)}20`,
                                color: getStrengthColor(related.strength)
                              }}
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < relatedContacts.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Network Insights */}
      <Card sx={{ boxShadow: 1 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Psychology sx={{ color: '#2563eb' }} />
            Insights de Red
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Valor de Red:
              </Typography>
              <Chip 
                label={networkInsights.networkValue}
                size="small"
                color="success"
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Influencia:
              </Typography>
              <Chip 
                label={networkInsights.influence}
                size="small"
                color="primary"
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
            </Box>
          </Box>

          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Timeline sx={{ fontSize: 14 }} />
              Visualización de red próximamente
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RelationshipGraph;
