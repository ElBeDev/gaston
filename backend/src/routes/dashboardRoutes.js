const express = require('express');
const router = express.Router();

// TODO: Migrar a Blob Storage cuando sea necesario
// Por ahora, datos mock para que la app funcione en Vercel sin MongoDB

/**
 * GET /api/dashboard/stats
 * Obtiene estadísticas del dashboard (mock data para serverless)
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.query.userId || 'gaston';

    // Mock data - sin dependencia de MongoDB
    res.json({
      success: true,
      stats: {
        totalConversations: 0,
        totalContacts: 0,
        totalProjects: 0,
        totalTasks: 0,
        totalNotes: 0,
        pendingTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        whatsappConnected: false,
        totalEmails: 0,
        unreadEmails: 0
      },
      recentActivity: [],
      timestamp: new Date().toISOString(),
      note: 'Sistema funcionando en modo serverless. Conecta MongoDB Atlas para datos persistentes.'
    });

  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas del dashboard',
      details: error.message
    });
  }
});

/**
 * GET /api/dashboard/activity
 * Obtiene actividad reciente detallada (mock data)
 */
router.get('/activity', async (req, res) => {
  try {
    res.json({
      success: true,
      activity: [],
      timestamp: new Date().toISOString(),
      note: 'Sistema en modo serverless. Datos disponibles al conectar MongoDB Atlas.'
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard activity:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener actividad del dashboard',
      details: error.message
    });
  }
});

/**
 * GET /api/dashboard/quick-stats
 * Estadísticas rápidas para widgets (mock data)
 */
router.get('/quick-stats', async (req, res) => {
  try {
    res.json({
      success: true,
      quickStats: {
        tasks: [],
        contacts: [],
        projects: []
      },
      timestamp: new Date().toISOString(),
      note: 'Sistema en modo serverless. Datos disponibles al conectar MongoDB Atlas.'
    });
  } catch (error) {
    console.error('❌ Error fetching quick stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas rápidas',
      details: error.message
    });
  }
});

module.exports = router;
