const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Contact = require('../models/Contact');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Note = require('../models/Note');

/**
 * GET /api/dashboard/stats
 * Obtiene estadísticas reales del dashboard
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.query.userId || 'gaston'; // Default user

    // Consultas en paralelo para mejor performance
    const [
      totalConversations,
      totalContacts,
      totalProjects,
      totalTasks,
      totalNotes,
      pendingTasks,
      completedTasks,
      whatsappStatus
    ] = await Promise.all([
      Conversation.countDocuments(),
      Contact.countDocuments(),
      Project.countDocuments(),
      Task.countDocuments(),
      Note.countDocuments(),
      Task.countDocuments({ status: { $ne: 'completed' } }),
      Task.countDocuments({ status: 'completed' }),
      // WhatsApp status check (simplified)
      Promise.resolve(false) // TODO: Implement real WhatsApp status check
    ]);

    // Calculate task completion rate
    const totalTasksCount = pendingTasks + completedTasks;
    const completionRate = totalTasksCount > 0 
      ? Math.round((completedTasks / totalTasksCount) * 100) 
      : 0;

    // Get recent activity
    const recentConversations = await Conversation
      .find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('messages updatedAt');

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
        whatsappConnected: whatsappStatus,
        // Email stats (placeholder for now)
        totalEmails: 0,
        unreadEmails: 0
      },
      recentActivity,
      timestamp: new Date().toISOString()
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
 * Obtiene actividad reciente detallada
 */
router.get('/activity', async (req, res) => {
  try {
    const userId = req.query.userId || 'gaston';
    const limit = parseInt(req.query.limit) || 10;

    // Get recent conversations
    const recentChats = await Conversation
      .find()
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('messages updatedAt');

    // Get recent contacts
    const recentContacts = await Contact
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name company createdAt');

    // Get recent tasks
    const recentTasks = await Task
      .find()
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('title status priority updatedAt');

    // Combine and sort all activity
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
      timestamp: new Date().toISOString()
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
 * Estadísticas rápidas para widgets
 */
router.get('/quick-stats', async (req, res) => {
  try {
    const userId = req.query.userId || 'gaston';

    // Tasks overview
    const taskStats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Contacts by segment
    const contactStats = await Contact.aggregate([
      {
        $group: {
          _id: '$segment',
          count: { $sum: 1 }
        }
      }
    ]);

    // Projects by status
    const projectStats = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      quickStats: {
        tasks: taskStats,
        contacts: contactStats,
        projects: projectStats
      },
      timestamp: new Date().toISOString()
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
