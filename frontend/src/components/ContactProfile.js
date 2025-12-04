import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Button,
  TextField,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  LinearProgress,
  Alert,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Person,
  Business,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  TrendingUp,
  Warning,
  Star,
  Add,
  Edit,
  Save,
  Cancel,
  Note,
  Timeline,
  ExpandMore,
  Schedule,
  Assessment
} from '@mui/icons-material';

const ContactProfile = ({ contact }) => {
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notesError, setNotesError] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!contact) return;
    setLoadingNotes(true);
    setNotesError(null);
    fetch(`/api/crm/contacts/${contact._id}/notes`)
      .then(res => res.json())
      .then(data => {
        setNotes(data.notes || []);
        setLoadingNotes(false);
      })
      .catch(err => {
        setNotesError('Error al cargar notas');
        setLoadingNotes(false);
      });
  }, [contact]);

  if (!contact) {
    return (
      <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Person sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Selecciona un contacto para ver su perfil
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
            Usa la búsqueda en el panel izquierdo
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Extract contact data
  const nombre = contact.name || 'Sin nombre';
  const empresa = contact.company || 'Sin empresa';
  const email = contact.email || '';
  const phone = contact.phone || '';
  const segmento = contact.businessData?.segment || 'Standard';
  const urgencia = contact.aiInsights?.urgency || 'Medium';
  const ultimaInteraccion = contact.metadata?.lastInteraction ? new Date(contact.metadata.lastInteraction).toLocaleDateString() : 'Nunca';
  const engagement = contact.intelligence?.engagementLevel || contact.aiInsights?.engagementLevel || 'medium';
  const churnRisk = contact.intelligence?.churnRisk || contact.aiInsights?.churnRisk || 'low';
  const conversionProbability = contact.intelligence?.conversionProbability ?? contact.aiInsights?.conversionProbability;
  const nextBestAction = contact.intelligence?.nextBestAction || contact.aiInsights?.nextBestAction || 'Programar seguimiento';

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/crm/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote, relatedContacts: [contact._id] })
      });
      if (!res.ok) throw new Error('Error al agregar nota');
      setNewNote('');
      // Reload notes
      const notesRes = await fetch(`/api/crm/contacts/${contact._id}/notes`);
      const notesData = await notesRes.json();
      setNotes(notesData.notes || []);
    } catch (err) {
      setNotesError('Error al agregar nota');
    } finally {
      setAddingNote(false);
    }
  };

  const getEngagementColor = (level) => {
    switch (level) {
      case 'high': return '#059669';
      case 'medium': return '#7c3aed';
      case 'low': return '#dc2626';
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

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return '#dc2626';
      case 'medium': return '#ea580c';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
      {/* Header Card */}
      <Card sx={{ boxShadow: 1 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                sx={{ 
                  width: 64, 
                  height: 64, 
                  bgcolor: '#2563eb',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              >
                {nombre.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {nombre}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  {empresa}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={segmento} 
                    size="small" 
                    color={segmento === 'VIP' ? 'primary' : 'default'}
                    icon={segmento === 'VIP' ? <Star /> : undefined}
                  />
                  <Chip 
                    label={urgencia} 
                    size="small" 
                    sx={{ 
                      bgcolor: getUrgencyColor(urgencia), 
                      color: 'white',
                      '& .MuiChip-label': { fontWeight: 500 }
                    }}
                  />
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                size="small" 
                sx={{ bgcolor: '#f3f4f6' }}
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit />
              </IconButton>
            </Box>
          </Box>

          {/* Contact Information */}
          <Grid container spacing={2}>
            <Grid size={{ sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Email sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {email || 'Sin email'}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Phone sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {phone || 'Sin teléfono'}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarToday sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Última interacción: {ultimaInteraccion}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Intelligence & Analytics */}
      <Card sx={{ boxShadow: 1 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assessment sx={{ color: '#2563eb' }} />
            Inteligencia de Contacto
          </Typography>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Nivel de Engagement
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={engagement === 'high' ? 85 : engagement === 'medium' ? 60 : 30}
                    sx={{ 
                      flex: 1, 
                      height: 8, 
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getEngagementColor(engagement)
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                    {engagement}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Riesgo de Churn
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={churnRisk === 'high' ? 85 : churnRisk === 'medium' ? 50 : 20}
                    sx={{ 
                      flex: 1, 
                      height: 8, 
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getRiskColor(churnRisk)
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                    {churnRisk}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {conversionProbability !== undefined && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Probabilidad de Conversión
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={conversionProbability * 100}
                      sx={{ 
                        flex: 1, 
                        height: 8, 
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#059669'
                        }
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {Math.round(conversionProbability * 100)}%
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>

          {nextBestAction && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Recomendación AI: {nextBestAction}
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card sx={{ boxShadow: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Note sx={{ color: '#2563eb' }} />
            Notas Colaborativas
          </Typography>
          
          {/* Add Note Form */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: '#f9fafb' }}>
            <Box component="form" onSubmit={handleAddNote} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Agregar nueva nota..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                disabled={addingNote}
                multiline
                maxRows={3}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={addingNote || !newNote.trim()}
                sx={{ 
                  bgcolor: '#2563eb',
                  minWidth: 100,
                  '&:hover': { bgcolor: '#1d4ed8' }
                }}
                startIcon={<Add />}
              >
                {addingNote ? 'Guardando...' : 'Agregar'}
              </Button>
            </Box>
          </Paper>

          {/* Notes List */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {loadingNotes ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Cargando notas...
                </Typography>
              </Box>
            ) : notesError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {notesError}
              </Alert>
            ) : notes.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Note sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No hay notas aún
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Agrega la primera nota para este contacto
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {notes.map((note, index) => (
                  <ListItem 
                    key={note._id} 
                    sx={{ 
                      p: 0, 
                      mb: 1,
                      borderBottom: index < notes.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                      pb: index < notes.length - 1 ? 2 : 0
                    }}
                  >
                    <ListItemText
                      primary={
                        <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: 1, borderColor: '#e2e8f0' }}>
                          <Typography variant="body2">
                            {note.content}
                          </Typography>
                        </Paper>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ContactProfile;
