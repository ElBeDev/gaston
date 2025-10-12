const express = require('express');
const router = express.Router();

// Fallback temporal para Calendar hasta que tengamos los scopes correctos
router.get('/events', (req, res) => {
  // Simular eventos de calendario
  const mockEvents = [
    {
      id: '1',
      summary: 'Reunión de equipo',
      description: 'Revisión semanal del proyecto',
      start: { dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
      end: { dateTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString() },
      location: 'Sala de conferencias'
    },
    {
      id: '2', 
      summary: 'Demo con cliente',
      description: 'Presentación del progreso del proyecto',
      start: { dateTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() },
      end: { dateTime: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString() },
      location: 'Virtual - Google Meet'
    },
    {
      id: '3',
      summary: 'Desarrollo de features',
      description: 'Implementación de nuevas funcionalidades',
      start: { dateTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() },
      end: { dateTime: new Date(Date.now() + 75 * 60 * 60 * 1000).toISOString() },
      location: 'Oficina principal'
    }
  ];

  res.json({
    items: mockEvents,
    message: 'Datos simulados - Calendar API requiere verificación de Google'
  });
});

router.post('/events', (req, res) => {
  const { summary, description, startDateTime, endDateTime, location } = req.body;
  
  // Simular creación de evento
  const newEvent = {
    id: Date.now().toString(),
    summary,
    description,
    start: { dateTime: startDateTime },
    end: { dateTime: endDateTime },
    location,
    created: new Date().toISOString(),
    status: 'confirmed'
  };

  res.json({
    event: newEvent,
    message: 'Evento simulado creado - Calendar API requiere verificación de Google'
  });
});

module.exports = router;