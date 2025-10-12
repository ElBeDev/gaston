import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fab,
  AppBar,
  Toolbar,
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  Add,
  Event,
  CalendarViewMonth,
  CalendarViewWeek,
  CalendarViewDay,
  ViewList,
  AccessTime,
  LocationOn,
  Person,
  Edit,
  Delete,
  Close
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const CalendarManagerAdvanced = () => {
  const { isAuthenticated } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day, list
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  
  const [newEvent, setNewEvent] = useState({
    summary: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    location: '',
    attendees: ''
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Fetch calendar events
  const fetchEvents = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/calendar/events`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setEvents(data.items || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(`Error loading events: ${error.message}`);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new event
  const createEvent = async () => {
    if (!newEvent.summary || !newEvent.startDateTime || !newEvent.endDateTime) {
      setError('Please fill in title, start time, and end time');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/calendar/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newEvent)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Clear form and close dialog
      setNewEvent({
        summary: '',
        description: '',
        startDateTime: '',
        endDateTime: '',
        location: '',
        attendees: ''
      });
      setCreateEventOpen(false);
      
      // Refresh events
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      setError(`Error creating event: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const navigateDay = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get calendar days for month view
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  // Get events for specific day
  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start?.dateTime || event.start?.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Format event time
  const formatEventTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Format event date
  const formatEventDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Render month view
  const renderMonthView = () => {
    const days = getCalendarDays();
    const currentMonth = currentDate.getMonth();
    
    return (
      <Grid container spacing={0} sx={{ height: '100%' }}>
        {/* Days of week header */}
        {daysOfWeek.map(day => (
          <Grid size={12/7} key={day}>
            <Box sx={{ p: 1, textAlign: 'center', borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {day}
              </Typography>
            </Box>
          </Grid>
        ))}
        
        {/* Calendar days */}
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentMonth;
          const isToday = day.toDateString() === new Date().toDateString();
          const dayEvents = getEventsForDay(day);
          
          return (
            <Grid size={12/7} key={index}>
              <Box
                sx={{
                  height: 120,
                  border: 1,
                  borderColor: 'divider',
                  p: 0.5,
                  backgroundColor: isCurrentMonth ? 'background.paper' : 'grey.50',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
                onClick={() => {
                  setCurrentDate(new Date(day));
                  setView('day');
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isToday ? 'bold' : 'normal',
                      color: isCurrentMonth ? 'text.primary' : 'text.secondary',
                      backgroundColor: isToday ? 'primary.main' : 'transparent',
                      color: isToday ? 'white' : undefined,
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {day.getDate()}
                  </Typography>
                </Box>
                
                {/* Events for this day */}
                <Box sx={{ overflow: 'hidden' }}>
                  {dayEvents.slice(0, 2).map((event, idx) => (
                    <Chip
                      key={idx}
                      label={event.summary}
                      size="small"
                      variant="filled"
                      color="primary"
                      sx={{ 
                        mb: 0.5, 
                        fontSize: '0.7rem',
                        height: 20,
                        maxWidth: '100%',
                        '& .MuiChip-label': { px: 0.5 }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                        setEventDialogOpen(true);
                      }}
                    />
                  ))}
                  {dayEvents.length > 2 && (
                    <Typography variant="caption" color="text.secondary">
                      +{dayEvents.length - 2} more
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  // Render list view
  const renderListView = () => {
    const upcomingEvents = events
      .filter(event => new Date(event.start?.dateTime || event.start?.date) >= new Date())
      .sort((a, b) => new Date(a.start?.dateTime || a.start?.date) - new Date(b.start?.dateTime || b.start?.date));

    return (
      <List>
        {upcomingEvents.length === 0 ? (
          <ListItem>
            <ListItemText 
              primary="No upcoming events"
              secondary="Create your first event to get started"
            />
          </ListItem>
        ) : (
          upcomingEvents.map((event, index) => (
            <React.Fragment key={event.id || index}>
              <ListItem 
                button 
                onClick={() => {
                  setSelectedEvent(event);
                  setEventDialogOpen(true);
                }}
              >
                <ListItemIcon>
                  <Avatar sx={{ backgroundColor: 'primary.main', width: 40, height: 40 }}>
                    <Event />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={event.summary}
                  secondary={
                    <Box>
                      <Typography variant="body2" component="div">
                        📅 {formatEventDate(event.start?.dateTime || event.start?.date)}
                      </Typography>
                      {event.location && (
                        <Typography variant="caption" color="text.secondary">
                          📍 {event.location}
                        </Typography>
                      )}
                      {event.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {event.description}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < upcomingEvents.length - 1 && <Divider />}
            </React.Fragment>
          ))
        )}
      </List>
    );
  };

  // Navigation controls
  const renderNavigation = () => {
    const navigate = view === 'month' ? navigateMonth : view === 'week' ? navigateWeek : navigateDay;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ChevronLeft />
        </IconButton>
        <Button onClick={goToToday} startIcon={<Today />}>
          Today
        </Button>
        <IconButton onClick={() => navigate(1)}>
          <ChevronRight />
        </IconButton>
        
        <Typography variant="h6" sx={{ ml: 2 }}>
          {view === 'month' && `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
          {view === 'week' && `Week of ${currentDate.toLocaleDateString()}`}
          {view === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {view === 'list' && 'Upcoming Events'}
        </Typography>
      </Box>
    );
  };

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Please sign in with Google to access your calendar
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top AppBar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            📅 Calendar Manager
          </Typography>
          
          {/* View Toggle */}
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(e, newView) => newView && setView(newView)}
            size="small"
          >
            <ToggleButton value="month">
              <CalendarViewMonth />
            </ToggleButton>
            <ToggleButton value="week">
              <CalendarViewWeek />
            </ToggleButton>
            <ToggleButton value="day">
              <CalendarViewDay />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewList />
            </ToggleButton>
          </ToggleButtonGroup>
        </Toolbar>
      </AppBar>

      {/* Navigation */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        {renderNavigation()}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Calendar Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: view === 'list' ? 0 : 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {view === 'month' && renderMonthView()}
            {view === 'list' && renderListView()}
            {/* TODO: Add week and day views */}
          </>
        )}
      </Box>

      {/* Create Event FAB */}
      <Fab
        color="primary"
        aria-label="add event"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateEventOpen(true)}
      >
        <Add />
      </Fab>

      {/* Create Event Dialog */}
      <Dialog open={createEventOpen} onClose={() => setCreateEventOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            📅 Create New Event
            <IconButton onClick={() => setCreateEventOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Event Title"
              fullWidth
              value={newEvent.summary}
              onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Start Date & Time"
                type="datetime-local"
                fullWidth
                value={newEvent.startDateTime}
                onChange={(e) => setNewEvent({ ...newEvent, startDateTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date & Time"
                type="datetime-local"
                fullWidth
                value={newEvent.endDateTime}
                onChange={(e) => setNewEvent({ ...newEvent, endDateTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TextField
              label="Location"
              fullWidth
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            />
            <TextField
              label="Attendees (comma-separated emails)"
              fullWidth
              value={newEvent.attendees}
              onChange={(e) => setNewEvent({ ...newEvent, attendees: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateEventOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={createEvent}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Event />}
          >
            Create Event
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {selectedEvent?.summary}
            <IconButton onClick={() => setEventDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {selectedEvent.description && (
                <Typography variant="body1">
                  {selectedEvent.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime color="action" />
                <Typography variant="body2">
                  {formatEventDate(selectedEvent.start?.dateTime || selectedEvent.start?.date)}
                  {selectedEvent.end?.dateTime && 
                    ` - ${formatEventTime(selectedEvent.end.dateTime)}`
                  }
                </Typography>
              </Box>
              
              {selectedEvent.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn color="action" />
                  <Typography variant="body2">
                    {selectedEvent.location}
                  </Typography>
                </Box>
              )}
              
              {selectedEvent.attendees && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person color="action" />
                  <Typography variant="body2">
                    {selectedEvent.attendees.length} attendees
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Edit />}>Edit</Button>
          <Button startIcon={<Delete />} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarManagerAdvanced;