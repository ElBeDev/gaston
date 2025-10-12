import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Event,
  AccessTime,
  LocationOn,
  Person,
  Add,
  CalendarToday,
  Send
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const CalendarManager = () => {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    summary: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    location: '',
    attendees: ''
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

  // Fetch calendar events
  const fetchEvents = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/calendar/events`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      } else {
        throw new Error('Error al cargar eventos');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new event
  const createEvent = async () => {
    if (!newEvent.summary || !newEvent.startDateTime || !newEvent.endDateTime) {
      setError('Por favor completa los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const attendeesArray = newEvent.attendees
        ? newEvent.attendees.split(',').map(email => email.trim()).filter(email => email)
        : [];

      const response = await fetch(`${API_BASE_URL}/api/calendar/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...newEvent,
          attendees: attendeesArray
        })
      });

      if (response.ok) {
        const data = await response.json();
        setOpenDialog(false);
        setNewEvent({
          summary: '',
          description: '',
          startDateTime: '',
          endDateTime: '',
          location: '',
          attendees: ''
        });
        fetchEvents(); // Refresh events
        setError(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear evento');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get current date in ISO format for input
  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  useEffect(() => {
    fetchEvents();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Alert severity="warning">
        Debes iniciar sesión con Google para acceder al calendario.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          📅 Google Calendar
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
          disabled={loading}
        >
          Nuevo Evento
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Events List */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Próximos Eventos
        </Typography>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && events.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No hay eventos próximos
          </Typography>
        )}

        {!loading && events.length > 0 && (
          <List>
            {events.map((event, index) => (
              <React.Fragment key={event.id || index}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    <Event color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {event.summary || 'Sin título'}
                        </Typography>
                        {event.status === 'confirmed' && (
                          <Chip label="Confirmado" size="small" color="success" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <AccessTime fontSize="small" />
                          <Typography variant="body2">
                            {formatDate(event.start?.dateTime || event.start?.date)} - {formatDate(event.end?.dateTime || event.end?.date)}
                          </Typography>
                        </Box>
                        
                        {event.location && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <LocationOn fontSize="small" />
                            <Typography variant="body2">
                              {event.location}
                            </Typography>
                          </Box>
                        )}
                        
                        {event.attendees && event.attendees.length > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Person fontSize="small" />
                            <Typography variant="body2">
                              {event.attendees.length} asistente{event.attendees.length !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        )}
                        
                        {event.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {event.description}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < events.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Create Event Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday />
            Crear Nuevo Evento
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Título del evento *"
              value={newEvent.summary}
              onChange={(e) => setNewEvent(prev => ({ ...prev, summary: e.target.value }))}
              fullWidth
              required
            />
            
            <TextField
              label="Descripción"
              value={newEvent.description}
              onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
            
            <TextField
              label="Fecha y hora de inicio *"
              type="datetime-local"
              value={newEvent.startDateTime}
              onChange={(e) => setNewEvent(prev => ({ ...prev, startDateTime: e.target.value }))}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: getCurrentDateTime()
              }}
            />
            
            <TextField
              label="Fecha y hora de fin *"
              type="datetime-local"
              value={newEvent.endDateTime}
              onChange={(e) => setNewEvent(prev => ({ ...prev, endDateTime: e.target.value }))}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: newEvent.startDateTime || getCurrentDateTime()
              }}
            />
            
            <TextField
              label="Ubicación"
              value={newEvent.location}
              onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
              fullWidth
            />
            
            <TextField
              label="Asistentes (emails separados por comas)"
              value={newEvent.attendees}
              onChange={(e) => setNewEvent(prev => ({ ...prev, attendees: e.target.value }))}
              fullWidth
              placeholder="email1@ejemplo.com, email2@ejemplo.com"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={createEvent}
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <Send />}
            disabled={loading || !newEvent.summary || !newEvent.startDateTime || !newEvent.endDateTime}
          >
            {loading ? 'Creando...' : 'Crear Evento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarManager;