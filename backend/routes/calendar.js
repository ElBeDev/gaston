const express = require('express');
const router = express.Router();
const calendarService = require('../src/services/calendarService');
const googleAuthService = require('../src/services/googleAuthService');

// Middleware to check authentication
function requireAuth(req, res, next) {
  if (!req.session || !req.session.tokens) {
    return res.status(401).json({ error: 'No autenticado con Google.' });
  }
  next();
}

// Get calendar events
router.get('/events', requireAuth, async (req, res) => {
  try {
    const calendar = googleAuthService.getCalendarClient(req.session.tokens);
    const { timeMin, timeMax, maxResults = 10 } = req.query;
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax,
      maxResults: parseInt(maxResults),
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    res.json({
      success: true,
      events: response.data.items || []
    });
  } catch (error) {
    console.error('Error getting calendar events:', error);
    res.status(500).json({ error: 'Error al obtener eventos del calendario.' });
  }
});

// Create calendar event
router.post('/events', requireAuth, async (req, res) => {
  const { 
    summary, 
    description, 
    startDateTime, 
    endDateTime, 
    timeZone = 'America/Mexico_City',
    attendees = [],
    location 
  } = req.body;
  
  if (!summary || !startDateTime || !endDateTime) {
    return res.status(400).json({ 
      error: 'Faltan campos requeridos (summary, startDateTime, endDateTime).' 
    });
  }
  
  try {
    const calendar = googleAuthService.getCalendarClient(req.session.tokens);
    
    const event = {
      summary,
      description,
      start: {
        dateTime: startDateTime,
        timeZone: timeZone,
      },
      end: {
        dateTime: endDateTime,
        timeZone: timeZone,
      },
      attendees: attendees.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
    };

    if (location) {
      event.location = location;
    }
    
    const result = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendUpdates: 'all'
    });
    
    res.json({
      success: true,
      eventId: result.data.id,
      eventLink: result.data.htmlLink,
      message: 'Evento creado correctamente'
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Error al crear el evento.' });
  }
});

// Update calendar event
router.put('/events/:eventId', requireAuth, async (req, res) => {
  const { eventId } = req.params;
  const updateData = req.body;
  
  try {
    const calendar = googleAuthService.getCalendarClient(req.session.tokens);
    
    // Get existing event
    const existingEvent = await calendar.events.get({
      calendarId: 'primary',
      eventId: eventId
    });

    // Merge with updates
    const updatedEvent = {
      ...existingEvent.data,
      ...updateData
    };

    const result = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      resource: updatedEvent,
      sendUpdates: 'all'
    });
    
    res.json({
      success: true,
      eventId: result.data.id,
      eventLink: result.data.htmlLink,
      message: 'Evento actualizado correctamente'
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: 'Error al actualizar el evento.' });
  }
});

// Delete calendar event
router.delete('/events/:eventId', requireAuth, async (req, res) => {
  const { eventId } = req.params;
  
  try {
    const calendar = googleAuthService.getCalendarClient(req.session.tokens);
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: 'all'
    });
    
    res.json({
      success: true,
      message: 'Evento eliminado correctamente'
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: 'Error al eliminar el evento.' });
  }
});

// Create event as assistant (for AI to use)
router.post('/create-as-assistant', async (req, res) => {
  const { userId, eventData } = req.body;
  
  if (!userId || !eventData) {
    return res.status(400).json({ error: 'userId y eventData son requeridos' });
  }

  try {
    const calendarService = require('../src/services/calendarService');
    const result = await calendarService.createEvent(userId, eventData);
    
    res.json({
      success: true,
      result: result,
      message: 'Evento creado por el asistente'
    });
  } catch (error) {
    console.error('Error creating event as assistant:', error);
    res.status(500).json({ 
      error: error.message || 'Error al crear evento' 
    });
  }
});

module.exports = router;