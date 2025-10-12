const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const UserContext = require('../models/UserContext');
const Note = require('../models/Note');
const Task = require('../models/Task');
const Contact = require('../models/Contact');

// ===== DASHBOARD STATISTICS ROUTES =====

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 Getting dashboard statistics');
    
    // Demo data when database is not available
    const stats = {
      totalConversations: 42,
      totalContacts: 18,
      totalTasks: 12,
      totalNotes: 27,
      lastUpdated: new Date().toISOString()
    };

    console.log('📊 Dashboard stats (demo mode):', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    // Always return demo data as fallback
    res.json({ 
      totalConversations: 42,
      totalContacts: 18,
      totalTasks: 12,
      totalNotes: 27,
      lastUpdated: new Date().toISOString()
    });
  }
});

// Get intelligence metrics for Eva Intelligence dashboard
router.get('/intelligence-metrics', async (req, res) => {
  try {
    console.log('🧠 Getting intelligence metrics');
    
    // Demo intelligence metrics (simulated AI analysis)
    const metrics = {
      totalEntities: 147,
      conversationCount: 42,
      lastAnalysisDate: new Date(),
      intelligenceScore: 92,
      
      predictions: [
        {
          type: 'immediate_need',
          description: 'El usuario podría necesitar revisar emails pendientes',
          confidence: 0.85,
          timeframe: 'próximas 2 horas'
        },
        {
          type: 'productivity_optimization',
          description: 'Momento ideal para tareas creativas basado en patrones',
          confidence: 0.72,
          timeframe: 'ahora'
        },
        {
          type: 'meeting_preparation',
          description: 'Reunión importante mañana - preparar agenda',
          confidence: 0.91,
          timeframe: 'próximas 6 horas'
        }
      ],
      
      behaviorInsights: [
        {
          category: 'Productividad',
          trend: 'mejorando',
          score: 78,
          description: 'Patrones de trabajo más consistentes esta semana'
        },
        {
          category: 'Comunicación',
          trend: 'estable',
          score: 85,
          description: 'Excelente seguimiento de contactos y respuestas'
        },
        {
          category: 'Gestión del tiempo',
          trend: 'excelente',
          score: 94,
          description: 'Optimización notable en distribución de tareas'
        },
        {
          category: 'Creatividad',
          trend: 'creciendo',
          score: 67,
          description: 'Incremento en actividades creativas y brainstorming'
        }
      ],
      
      risks: [
        {
          level: 'bajo',
          type: 'sobrecarga_trabajo',
          probability: 0.25,
          description: 'Carga de trabajo dentro de límites normales'
        },
        {
          level: 'medio',
          type: 'distraccion_digital',
          probability: 0.45,
          description: 'Posibles distracciones por notificaciones múltiples'
        }
      ],
      
      opportunities: [
        {
          type: 'networking',
          description: 'Conectar con contactos no contactados en 2 semanas',
          priority: 'alta',
          estimatedBenefit: 'Fortalecimiento de relaciones profesionales'
        },
        {
          type: 'learning',
          description: 'Momento ideal para aprender nueva habilidad técnica',
          priority: 'media',
          estimatedBenefit: 'Desarrollo profesional continuo'
        }
      ]
    };

    console.log('🧠 Intelligence metrics generated (demo mode):', { 
      totalEntities: metrics.totalEntities,
      score: metrics.intelligenceScore 
    });
    
    res.json(metrics);
  } catch (error) {
    console.error('❌ Intelligence metrics error:', error);
    // Fallback demo data
    res.json({ 
      totalEntities: 147,
      conversationCount: 42,
      intelligenceScore: 92,
      predictions: [],
      behaviorInsights: [],
      risks: [],
      opportunities: []
    });
  }
});

module.exports = router;
