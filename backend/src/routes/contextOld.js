const express = require('express');
const router = express.Router();
const UserContext = require('../models/UserContext');

router.get('/:userId?', async (req, res) => {
  try {
    const { userId = 'gaston' } = req.params;
    console.log('Getting context for user:', userId);
    
    // Demo context data when database is not available
    const demoContext = {
      userId,
      personalInfo: { 
        name: "Gaston",
        role: "Desarrollador de IA",
        timezone: "America/Mexico_City"
      },
      entities: [
        { type: 'contact', name: 'María García', email: 'maria@empresa.com', lastContact: new Date() },
        { type: 'contact', name: 'Juan Pérez', email: 'juan@startup.com', lastContact: new Date() },
        { type: 'contact', name: 'Ana López', email: 'ana@tech.com', lastContact: new Date() },
        { type: 'task', title: 'Completar reporte Q4', status: 'in-progress', priority: 'high' },
        { type: 'task', title: 'Revisar propuesta cliente', status: 'pending', priority: 'medium' },
        { type: 'task', title: 'Actualizar documentación API', status: 'pending', priority: 'low' },
        { type: 'project', title: 'Eva Assistant v2.0', status: 'active', progress: 75 },
        { type: 'project', title: 'Dashboard Analytics', status: 'planning', progress: 25 }
      ],
      conversationHistory: [
        'Análisis de productividad personal',
        'Planificación de objetivos Q4',
        'Revisión de métricas de rendimiento'
      ],
      importantNotes: [
        'Reunión importante el viernes',
        'Deadline del proyecto el 15',
        'Revisar feedback del cliente'
      ],
      lastUpdated: new Date()
    };
    
    res.json(demoContext);
  } catch (error) {
    console.error('Error getting context:', error);
    // Return demo data as fallback
    res.json({ 
      userId: req.params.userId || 'demo',
      personalInfo: { name: "Usuario Demo" },
      entities: [],
      conversationHistory: [],
      importantNotes: [],
      lastUpdated: new Date()
    });
  }
});
  } catch (error) {
    console.error('Error getting context:', error);
    res.status(500).json({ error: 'Failed to get context' });
  }
});

router.put('/:userId?', async (req, res) => {
  try {
    const { userId = 'gaston' } = req.params;
    const updateData = req.body;

    let userContext = await UserContext.findOne({ userId });
    if (!userContext) {
      userContext = new UserContext({ userId });
    }

    Object.assign(userContext, updateData, { updatedAt: new Date() });
    await userContext.save();

    res.json({ success: true, context: userContext });
  } catch (error) {
    console.error('Error updating context:', error);
    res.status(500).json({ error: 'Failed to update context' });
  }
});

module.exports = router;