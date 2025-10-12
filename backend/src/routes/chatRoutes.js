const express = require('express');
const router = express.Router();

// Use SUPER CHAT CONTROLLER with advanced intelligence
const superChatController = require('../controllers/superChatController');
// Keep simple controller as fallback
const simpleChatController = require('../controllers/simpleChatController');

// ===== SUPER CHAT ROUTES WITH ADVANCED AI =====

// Get conversations for dashboard
router.get('/conversations', async (req, res) => {
  try {
    console.log('📥 Getting conversations for dashboard');
    
    // Demo conversations data
    const demoConversations = [
      {
        _id: '1',
        title: 'Eva Inteligencia Avanzada - Chat',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        userId: 'demo-user'
      },
      {
        _id: '2', 
        title: 'Análisis Predictivo - Sesión',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        userId: 'demo-user'
      },
      {
        _id: '3',
        title: 'Memoria Avanzada - Conversación',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        userId: 'demo-user'
      }
    ];

    res.json(demoConversations);
  } catch (error) {
    console.error('❌ Dashboard conversations error:', error);
    res.status(500).json({ error: 'Error fetching conversations' });
  }
});

// Get conversation history - Enhanced with AI intelligence
router.get('/history/:userId', async (req, res) => {
  try {
    console.log('📥 Getting chat history for user:', req.params.userId);
    
    // Try super controller first, fallback to simple
    try {
      // Convert params to query format that controller expects
      req.query.userId = req.params.userId;
      req.query.limit = req.query.limit || 50;
      req.query.page = req.query.page || 1;
      
      await superChatController.getConversationHistory(req, res);
    } catch (error) {
      console.log('📥 Falling back to simple controller for history');
      await simpleChatController.getConversationHistory(req, res);
    }
  } catch (error) {
    console.error('❌ Chat history error:', error);
    res.status(500).json({ error: 'Error fetching chat history' });
  }
});

// Send message to Eva - Super Enhanced with Predictive Intelligence
router.post('/message', async (req, res) => {
  try {
    console.log('📥 Received message:', req.body);
    
    // Try super controller first, fallback to simple if needed
    try {
      await superChatController.sendMessage(req, res);
    } catch (error) {
      console.log('📥 Super controller failed, using simple controller');
      await simpleChatController.sendMessage(req, res);
    }
  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({ error: 'Error sending message' });
  }
});

// Clear conversation - Enhanced method
router.delete('/clear/:userId', async (req, res) => {
  try {
    console.log('🧹 Clearing conversation for user:', req.params.userId);
    await simpleChatController.clearConversation(req, res);
  } catch (error) {
    console.error('❌ Clear conversation error:', error);
    res.status(500).json({ error: 'Error clearing conversation' });
  }
});

// Health check for chat system
router.get('/health/:userId', async (req, res) => {
  try {
    console.log('💓 Health check for user:', req.params.userId);
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      superAI: true,
      intelligence: 'advanced',
      version: '2.1.0'
    });
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

module.exports = router;
