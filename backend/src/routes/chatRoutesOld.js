const express = require('express');
const router = express.Router();

// Use SUPER CHAT CONTROLLER instead of broken chatController
const superChatController = require('../controllers/superChatController'); // NEW: Eva Super-Chat Controller

// ===== CHAT CONVERSATION ROUTES =====

// Get conversations for dashboard
router.get('/conversations', async (req, res) => {
  try {
    console.log('📥 Getting conversations for dashboard');
    
    // Use super chat controller to get enhanced conversation history
    await superChatController.getConversationHistory(req, res);
  } catch (error) {
    console.error('❌ Dashboard conversations error:', error);
    res.status(500).json({ error: 'Error fetching conversations' });
  }
});

// Get conversation history - FIXED ROUTE for frontend compatibility
router.get('/history/:userId', async (req, res) => {
  try {
    console.log('📥 Getting chat history for user:', req.params.userId);
    
    // Convert params to query format that controller expects
    req.query.userId = req.params.userId;
    req.query.limit = req.query.limit || 50;
    req.query.page = req.query.page || 1;
    
    await superChatController.getConversationHistory(req, res);
  } catch (error) {
    console.error('❌ Chat history error:', error);
    res.status(500).json({ error: 'Error fetching chat history' });
  }
});
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation history',
      details: error.message
    });
  }
});

// Send message to Eva - FIXED
router.post('/message', async (req, res) => {
  try {
    console.log('📥 Received message:', req.body);
    console.log('🔍 Controller type:', typeof chatController);
    console.log('🔍 HandleMessage available:', typeof chatController.handleMessage === 'function');
    
    await chatController.handleMessage(req, res);
  } catch (error) {
    console.error('❌ Chat message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message',
      details: error.message
    });
  }
});

// Clear conversation history
router.delete('/history', async (req, res) => {
  try {
    await chatController.clearHistory(req, res);
  } catch (error) {
    console.error('❌ Clear history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear history',
      details: error.message
    });
  }
});

// ===== CONTEXT MANAGEMENT ROUTES =====

// Get user context
router.get('/context/:userId', async (req, res) => {
  try {
    await chatController.getUserContext(req, res);
  } catch (error) {
    console.error('❌ Get context error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user context',
      details: error.message
    });
  }
});

// Update user context
router.post('/context/:userId', async (req, res) => {
  try {
    await chatController.updateUserContext(req, res);
  } catch (error) {
    console.error('❌ Update context error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user context',
      details: error.message
    });
  }
});

// ===== ANALYTICS ROUTES =====

// Get conversation analytics
router.get('/analytics/:userId', async (req, res) => {
  try {
    await chatController.getConversationAnalytics(req, res);
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics',
      details: error.message
    });
  }
});

// Get contextual suggestions
router.get('/suggestions/:userId', async (req, res) => {
  try {
    await chatController.getContextualSuggestions(req, res);
  } catch (error) {
    console.error('❌ Suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suggestions',
      details: error.message
    });
  }
});

// ===== ADDITIONAL ROUTES =====

// Test chat intelligence
router.get('/test', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Eva Chat Intelligence is online! 🧠✨',
      timestamp: new Date().toISOString(),
      intelligence: {
        status: 'active',
        capabilities: [
          'Natural language processing',
          'Context-aware responses',
          'Cross-data intelligence',
          'Task automation',
          'Predictive suggestions'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Chat test failed',
      details: error.message
    });
  }
});

// Get Eva status
router.get('/status', async (req, res) => {
  try {
    const openaiService = require('../services/openaiService');
    const intelligenceService = require('../services/intelligenceService');
    
    // Test services
    const openaiTest = await openaiService.testConnection();
    
    res.json({
      success: true,
      eva: {
        status: 'online',
        intelligence: 'active',
        capabilities: {
          contextBuilding: true,
          nlp: true,
          crossReferencing: true,
          predictiveAnalysis: true
        }
      },
      services: {
        openai: {
          status: openaiTest.success ? 'connected' : 'error',
          details: openaiTest
        },
        intelligence: {
          status: 'active',
          version: '2.0.0'
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Status check failed',
      details: error.message
    });
  }
});

module.exports = router;