const UserContext = require('../models/UserContext');
const User = require('../models/User');
const openaiService = require('../services/openaiService');
const Conversation = require('../models/Conversation');
const Contact = require('../models/Contact');
const Task = require('../models/Task');
const Project = require('../models/Project');

class ChatController {
  constructor() {
    console.log('💬 ChatController initialized (Clean Version)');
  }

  // Clear conversation - Fallback method
  async clearConversation(req, res) {
    try {
      const { userId } = req.params;
      console.log('🧹 Clearing conversation for user:', userId);
      
      // Clear conversation history from database
      await Conversation.deleteMany({ userId });
      
      res.json({ 
        success: true, 
        message: 'Conversation cleared successfully' 
      });
    } catch (error) {
      console.error('❌ Error clearing conversation:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to clear conversation' 
      });
    }
  }

  // Health check for chat system
  async getHealthStatus(req, res) {
    try {
      const { userId } = req.params;
      console.log('💓 Health check for user:', userId);
      
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        userId: userId,
        version: '1.0.0',
        service: 'ChatController (Clean)'
      });
    } catch (error) {
      console.error('❌ Health check error:', error);
      res.status(500).json({ 
        status: 'ERROR',
        error: 'Health check failed' 
      });
    }
  }

  // Get conversation history - Simple fallback
  async getConversationHistory(req, res) {
    try {
      const { userId } = req.query;
      const limit = parseInt(req.query.limit) || 50;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;

      console.log('📜 Getting conversation history for user:', userId);

      // Get conversations from database
      const conversations = await Conversation.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      res.json({
        success: true,
        conversations,
        pagination: {
          page,
          limit,
          total: conversations.length
        }
      });
    } catch (error) {
      console.error('❌ Error getting conversation history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get conversation history',
        conversations: []
      });
    }
  }

  // Simple message handler - Fallback only
  async handleMessage(req, res) {
    try {
      const { message, userId } = req.body;
      console.log('📨 Simple message handler for user:', userId);

      // Basic response
      const response = {
        success: true,
        response: "Esta es una respuesta básica. El sistema principal está usando SuperChatController.",
        timestamp: new Date().toISOString(),
        fallback: true
      };

      res.json(response);
    } catch (error) {
      console.error('❌ Error in message handler:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process message'
      });
    }
  }
}

// Export instance
module.exports = new ChatController();
