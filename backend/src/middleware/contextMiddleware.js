const intelligenceService = require('../services/intelligenceService');
const UserContext = require('../models/UserContext');

class ContextMiddleware {
  
  // Smart context enrichment middleware
  static async enrichContext(req, res, next) {
    try {
      console.log('🧠 Context enrichment middleware activated');
      
      const { userId = 'gaston' } = req.body || req.params;
      const { message } = req.body || {};
      
      if (message && userId) {
        // Analyze message for smart context
        const intelligence = await intelligenceService.analyzeUserMessage(message, userId);
        
        if (intelligence) {
          // Attach intelligence to request
          req.intelligence = intelligence;
          console.log('✅ Context enriched with smart analysis');
        }
      }
      
      next();
      
    } catch (error) {
      console.error('❌ Context enrichment error:', error);
      // Continue without enrichment
      next();
    }
  }

  // User context validation middleware
  static async validateUserContext(req, res, next) {
    try {
      const { userId = 'gaston' } = req.body || req.params;
      
      // Ensure user context exists
      let userContext = await UserContext.findOne({ userId });
      
      if (!userContext) {
        console.log('🆕 Creating new user context for:', userId);
        userContext = new UserContext({
          userId,
          contacts: [],
          agenda: [],
          notes: [],
          conversations: []
        });
        await userContext.save();
      }
      
      // Attach to request
      req.userContext = userContext;
      console.log('✅ User context validated');
      
      next();
      
    } catch (error) {
      console.error('❌ User context validation error:', error);
      res.status(500).json({ error: 'Failed to validate user context' });
    }
  }

  // Rate limiting for smart processing
  static smartRateLimit() {
    const requests = new Map();
    
    return (req, res, next) => {
      const { userId = 'gaston' } = req.body || req.params;
      const now = Date.now();
      
      if (!requests.has(userId)) {
        requests.set(userId, []);
      }
      
      const userRequests = requests.get(userId);
      
      // Remove requests older than 1 minute
      const recentRequests = userRequests.filter(time => now - time < 60000);
      requests.set(userId, recentRequests);
      
      // Limit to 30 requests per minute
      if (recentRequests.length >= 30) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          message: 'Please wait a moment before sending another message to Eva'
        });
      }
      
      // Add current request
      recentRequests.push(now);
      requests.set(userId, recentRequests);
      
      next();
    };
  }

  // Request logging middleware
  static logRequest(req, res, next) {
    const start = Date.now();
    const { userId = 'unknown' } = req.body || req.params;
    const { message } = req.body || {};
    
    console.log(`📝 [${new Date().toISOString()}] ${req.method} ${req.path} - User: ${userId}`);
    
    if (message) {
      console.log(`💬 Message preview: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);
    }
    
    // Log response time
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`⏱️ Request completed in ${duration}ms - Status: ${res.statusCode}`);
    });
    
    next();
  }

  // Error handling middleware
  static errorHandler(error, req, res, next) {
    console.error('❌ Context middleware error:', error);
    
    // Smart error responses based on error type
    let errorResponse = {
      error: 'Internal server error',
      message: 'Something went wrong with Eva\'s processing'
    };
    
    if (error.message.includes('OpenAI')) {
      errorResponse.message = 'Eva\'s AI brain is temporarily unavailable';
    } else if (error.message.includes('MongoDB')) {
      errorResponse.message = 'Eva\'s memory system is experiencing issues';
    } else if (error.message.includes('rate limit')) {
      errorResponse.message = 'Please slow down - Eva needs a moment to process';
    }
    
    res.status(500).json(errorResponse);
  }

  // Performance monitoring
  static performanceMonitor(req, res, next) {
    const start = process.hrtime.bigint();
    
    res.on('finish', () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000; // Convert to milliseconds
      
      if (duration > 5000) { // Log slow requests (>5 seconds)
        console.warn(`⚠️ Slow request detected: ${req.path} took ${duration.toFixed(2)}ms`);
      }
      
      // Add performance header
      res.set('X-Response-Time', `${duration.toFixed(2)}ms`);
    });
    
    next();
  }
}

module.exports = ContextMiddleware;