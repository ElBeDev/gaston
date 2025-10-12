const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  // Message Content
  message: {
    type: String,
    required: true
  },
  response: String,
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
    index: true
  },
  
  // Context Intelligence
  context: {
    intent: {
      type: String,
      enum: ['question', 'command', 'information', 'task_creation', 'data_retrieval', 'scheduling', 'planning'],
      index: true
    },
    confidence: Number, // 0-1 confidence in intent detection
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      score: Number // -1 to 1
    },
    complexity: {
      type: String,
      enum: ['simple', 'medium', 'complex', 'expert']
    }
  },
  
  // Entity Extraction
  extractedEntities: {
    contacts: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Contact' 
    }],
    tasks: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Task' 
    }],
    projects: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Project' 
    }],
    notes: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Note' 
    }],
    dates: [Date],
    locations: [String],
    keywords: [String],
    topics: [String]
  },
  
  // AI Processing
  aiProcessing: {
    model: String, // GPT-4, Claude, etc.
    tokensUsed: {
      input: Number,
      output: Number,
      total: Number
    },
    processingTime: Number, // milliseconds
    temperature: Number,
    maxTokens: Number,
    responseQuality: {
      relevance: Number,   // 0-1
      helpfulness: Number, // 0-1
      accuracy: Number     // 0-1
    }
  },
  
  // Context Loading
  contextLoaded: {
    contacts: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Contact' 
    }],
    tasks: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Task' 
    }],
    projects: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Project' 
    }],
    notes: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Note' 
    }],
    relevanceScore: Number // How relevant the loaded context was
  },
  
  // Action Results
  actionsPerformed: [{
    type: {
      type: String,
      enum: ['create_task', 'update_contact', 'schedule_event', 'create_note', 'send_reminder', 'search_data']
    },
    entityType: String,
    entityId: mongoose.Schema.Types.ObjectId,
    success: Boolean,
    details: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Follow-up Intelligence
  followUpSuggestions: [{
    type: {
      type: String,
      enum: ['task', 'reminder', 'contact', 'research', 'meeting']
    },
    suggestion: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    reasoning: String,
    confidence: Number
  }],
  
  // User Feedback
  userFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    helpful: Boolean,
    accurate: Boolean,
    comments: String,
    feedbackDate: Date
  },
  
  // Thread Management
  threadId: {
    type: String,
    index: true
  },
  runId: String,
  conversationId: String,
  sequenceNumber: {
    type: Number,
    index: true
  },
  
  // Session Information
  session: {
    sessionId: String,
    platform: {
      type: String,
      enum: ['web', 'mobile', 'api', 'voice']
    },
    userAgent: String,
    ipAddress: String,
    location: {
      country: String,
      city: String,
      timezone: String
    }
  },
  
  // Performance Metrics
  metrics: {
    responseTime: Number, // milliseconds
    userSatisfaction: Number, // 0-1
    taskCompletion: Boolean,
    contextAccuracy: Number, // 0-1
    followUpEngagement: Boolean
  },
  
  metadata: {
    timestamp: { 
      type: Date, 
      default: Date.now,
      index: true
    },
    processingDuration: Number,
    retryCount: { type: Number, default: 0 },
    errorOccurred: Boolean,
    errorDetails: String,
    version: { type: Number, default: 1 }
  }
}, {
  timestamps: true,
  collection: 'eva.conversations'
});

// Indexes for performance
conversationSchema.index({ userId: 1, 'metadata.timestamp': -1 });
conversationSchema.index({ userId: 1, role: 1 });
conversationSchema.index({ userId: 1, 'context.intent': 1 });
conversationSchema.index({ threadId: 1, sequenceNumber: 1 });
conversationSchema.index({ 'session.sessionId': 1 });

// Text search for conversation content
conversationSchema.index({ 
  message: 'text', 
  response: 'text' 
});

// Methods
conversationSchema.methods.addFeedback = function(rating, helpful, accurate, comments) {
  this.userFeedback = {
    rating,
    helpful,
    accurate,
    comments,
    feedbackDate: new Date()
  };
  
  // Update metrics based on feedback
  this.metrics.userSatisfaction = rating / 5;
  this.metrics.taskCompletion = helpful;
  
  return this.save();
};

conversationSchema.methods.addAction = function(actionType, entityType, entityId, success, details) {
  this.actionsPerformed.push({
    type: actionType,
    entityType,
    entityId,
    success,
    details
  });
  
  return this.save();
};

conversationSchema.methods.addFollowUpSuggestion = function(type, suggestion, priority, reasoning, confidence) {
  this.followUpSuggestions.push({
    type,
    suggestion,
    priority: priority || 'medium',
    reasoning,
    confidence: confidence || 0.5
  });
  
  return this.save();
};

conversationSchema.methods.calculateRelevanceScore = function() {
  const contextEntities = Object.values(this.extractedEntities).flat().length;
  const loadedEntities = Object.values(this.contextLoaded).flat().length;
  
  if (loadedEntities === 0) return 0;
  
  const relevanceScore = Math.min(contextEntities / loadedEntities, 1);
  this.contextLoaded.relevanceScore = relevanceScore;
  
  return relevanceScore;
};

// Static methods for analytics
conversationSchema.statics.getConversationStats = async function(userId, timeRange = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRange);
  
  const stats = await this.aggregate([
    {
      $match: {
        userId,
        'metadata.timestamp': { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalConversations: { $sum: 1 },
        avgResponseTime: { $avg: '$metrics.responseTime' },
        avgSatisfaction: { $avg: '$metrics.userSatisfaction' },
        topIntents: { $push: '$context.intent' },
        successfulActions: { 
          $sum: {
            $size: {
              $filter: {
                input: '$actionsPerformed',
                cond: { $eq: ['$$this.success', true] }
              }
            }
          }
        }
      }
    }
  ]);
  
  return stats[0] || {};
};

module.exports = mongoose.model('Conversation', conversationSchema);