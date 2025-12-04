const express = require('express');
const router = express.Router();
const blobDB = require('../utils/blobDatabase');

/**
 * GET /api/dashboard/stats
 * Obtiene estadísticas del dashboard usando Blob Storage
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.query.userId || 'gaston';

    // Obtener conteos desde Blob Storage en paralelo
    const [
      totalConversations,
      totalContacts,
      totalProjects,
      totalTasks,
      totalNotes,
      pendingTasks,
      completedTasks
    ] = await Promise.all([
      blobDB.countDocuments('conversations'),
      blobDB.countDocuments('contacts'),
      blobDB.countDocuments('projects'),
      blobDB.countDocuments('tasks'),
      blobDB.countDocuments('notes'),
      blobDB.countDocuments('tasks', { status: { $ne: 'completed' } }),
      blobDB.countDocuments('tasks', { status: 'completed' })
    ]);

    // Calcular tasa de completación
    const totalTasksCount = pendingTasks + completedTasks;
    const completionRate = totalTasksCount > 0 
      ? Math.round((completedTasks / totalTasksCount) * 100) 
      : 0;

    // Obtener actividad reciente
    const conversations = await blobDB.find('conversations');
    const recentConversations = conversations
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);

    const recentActivity = recentConversations.map(conv => ({
      type: 'chat',
      message: (conv.messages && conv.messages.length > 0)
        ? conv.messages[conv.messages.length - 1].content?.substring(0, 50) + '...'
        : 'Nueva conversación',
      timestamp: conv.updatedAt
    }));

    res.json({
      success: true,
      stats: {
        totalConversations,
        totalContacts,
        totalProjects,
        totalTasks: totalTasksCount,
        totalNotes,
        pendingTasks,
        completedTasks,
        completionRate,
        whatsappConnected: false, // TODO: Implementar check real
        totalEmails: 0,
        unreadEmails: 0
      },
      recentActivity,
      timestamp: new Date().toISOString(),
      storage: 'Vercel Blob Storage'
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
 * Obtiene actividad reciente detallada desde Blob Storage
 */
router.get('/activity', async (req, res) => {
  try {
    const userId = req.query.userId || 'gaston';
    const limit = parseInt(req.query.limit) || 10;

    // Obtener datos recientes desde Blob Storage
    const [conversations, contacts, tasks] = await Promise.all([
      blobDB.find('conversations'),
      blobDB.find('contacts'),
      blobDB.find('tasks')
    ]);

    // Ordenar y limitar
    const recentChats = conversations
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, limit);

    const recentContacts = contacts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    const recentTasks = tasks
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, limit);

    // Combinar actividad
    const allActivity = [
      ...recentChats.map(chat => ({
        type: 'chat',
        title: 'Nueva conversación con Eva',
        description: (chat.messages && chat.messages.length > 0)
          ? chat.messages[chat.messages.length - 1].content?.substring(0, 100)
          : 'Conversación iniciada',
        timestamp: chat.updatedAt,
        icon: 'chat'
      })),
      ...recentContacts.map(contact => ({
        type: 'contact',
        title: `Contacto agregado: ${contact.name}`,
        description: contact.company || 'Sin empresa',
        timestamp: contact.createdAt,
        icon: 'person'
      })),
      ...recentTasks.map(task => ({
        type: 'task',
        title: task.title,
        description: `Estado: ${task.status} | Prioridad: ${task.priority}`,
        timestamp: task.updatedAt,
        icon: 'assignment'
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);

    res.json({
      success: true,
      activity: allActivity,
      timestamp: new Date().toISOString(),
      storage: 'Vercel Blob Storage'
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
 * Estadísticas rápidas para widgets desde Blob Storage
 */
router.get('/quick-stats', async (req, res) => {
  try {
    const userId = req.query.userId || 'gaston';

    // Obtener datos para agregación
    const [tasks, contacts, projects] = await Promise.all([
      blobDB.find('tasks'),
      blobDB.find('contacts'),
      blobDB.find('projects')
    ]);

    // Agregaciones manuales
    const taskStats = tasks.reduce((acc, task) => {
      const status = task.status || 'unknown';
      const existing = acc.find(s => s._id === status);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ _id: status, count: 1 });
      }
      return acc;
    }, []);

    const contactStats = contacts.reduce((acc, contact) => {
      const segment = contact.segment || 'unknown';
      const existing = acc.find(s => s._id === segment);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ _id: segment, count: 1 });
      }
      return acc;
    }, []);

    const projectStats = projects.reduce((acc, project) => {
      const status = project.status || 'unknown';
      const existing = acc.find(s => s._id === status);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ _id: status, count: 1 });
      }
      return acc;
    }, []);

    res.json({
      success: true,
      quickStats: {
        tasks: taskStats,
        contacts: contactStats,
        projects: projectStats
      },
      timestamp: new Date().toISOString(),
      storage: 'Vercel Blob Storage'
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
