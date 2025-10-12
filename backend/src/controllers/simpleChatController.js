const openaiService = require('../services/openaiService');

class SimpleChatController {
  
  /**
   * 💬 Simple chat endpoint - just OpenAI communication
   */
  async sendMessage(req, res) {
    try {
      const { message, userId } = req.body;
      
      console.log('📥 Simple chat - received message:', { message, userId });
      
      if (!message || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Message and userId are required'
        });
      }

      // Direct OpenAI call without database complexity
      console.log('🤖 Calling OpenAI...');
      const aiResponse = await openaiService.getChatResponse(message, userId);
      
      console.log('✅ OpenAI response received:', aiResponse.response);
      
      const response = {
        success: true,
        response: aiResponse.response || aiResponse,
        metadata: {
          tokensUsed: aiResponse.tokensUsed || 100,
          processingTime: Date.now(),
          model: 'gpt-4'
        },
        userId: userId,
        timestamp: new Date().toISOString()
      };

      res.json(response);

    } catch (error) {
      console.error('❌ Error in simple chat controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  }

  /**
   * 📊 Get simple conversation history (mocked for now)
   */
  async getConversationHistory(req, res) {
    try {
      const { userId } = req.params;
      
      // Mock conversation history
      const mockHistory = [
        {
          _id: 'conv-1',
          message: 'Hola Eva',
          response: '¡Hola! Soy Eva, tu asistente de IA. ¿En qué puedo ayudarte hoy?',
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          userId: userId
        },
        {
          _id: 'conv-2',
          message: '¿Cómo estás?',
          response: 'Estoy muy bien, gracias por preguntar. Estoy aquí para ayudarte con cualquier cosa que necesites.',
          timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
          userId: userId
        }
      ];

      res.json({
        success: true,
        conversations: mockHistory,
        total: mockHistory.length
      });

    } catch (error) {
      console.error('❌ Error getting conversation history:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching conversation history'
      });
    }
  }

  /**
   * 🧹 Clear conversation (simple response)
   */
  async clearConversation(req, res) {
    try {
      const { userId } = req.params;
      
      console.log('🧹 Clearing conversation for user:', userId);
      
      res.json({
        success: true,
        message: 'Conversation cleared successfully'
      });

    } catch (error) {
      console.error('❌ Error clearing conversation:', error);
      res.status(500).json({
        success: false,
        error: 'Error clearing conversation'
      });
    }
  }

  /**
   * 💓 Health check
   */
  async getHealthStatus(req, res) {
    try {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Eva Simple Chat',
        version: '1.0.0',
        openai: 'connected'
      });

    } catch (error) {
      console.error('❌ Health check error:', error);
      res.status(500).json({
        status: 'ERROR',
        error: 'Health check failed'
      });
    }
  }
}

module.exports = new SimpleChatController();
