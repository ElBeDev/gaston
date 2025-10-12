const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  profile: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true,
      sparse: true
    },
    avatar: String,
    
    preferences: {
      workingHours: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "17:00" }
      },
      timezone: { type: String, default: "UTC-5" },
      priorities: [{ type: String, enum: ['work', 'personal', 'health', 'family', 'learning'] }],
      communicationStyle: { 
        type: String, 
        enum: ['direct', 'formal', 'casual', 'detailed'], 
        default: 'direct' 
      },
      notificationSettings: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        desktop: { type: Boolean, default: false },
        quiet_hours: {
          enabled: { type: Boolean, default: false },
          start: String,
          end: String
        }
      }
    },
    
    goals: [{
      title: String,
      description: String,
      targetDate: Date,
      priority: { type: String, enum: ['low', 'medium', 'high'] },
      status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
      progress: { type: Number, min: 0, max: 100, default: 0 }
    }],
    
    workPatterns: {
      productiveTimes: [String], // ["09:00-11:00", "14:00-16:00"]
      breakPatterns: {
        frequency: Number, // minutes
        duration: Number   // minutes
      },
      focusAreas: [String], // ["development", "meetings", "planning"]
      energyLevels: {
        morning: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        afternoon: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        evening: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
      }
    }
  },
  
  intelligence: {
    level: { type: Number, min: 1, max: 10, default: 1 },
    learningData: {
      interactionPatterns: mongoose.Schema.Types.Mixed,
      preferenceEvolution: mongoose.Schema.Types.Mixed,
      successMetrics: mongoose.Schema.Types.Mixed
    },
    personalityInsights: {
      communicationStyle: String,
      decisionMakingPattern: String,
      workStyle: String,
      stressIndicators: [String]
    }
  },
  
  metadata: {
    created: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
    totalInteractions: { type: Number, default: 0 },
    dataQualityScore: { type: Number, min: 0, max: 1, default: 0.5 },
    version: { type: Number, default: 1 }
  }
}, {
  timestamps: true,
  collection: 'eva.users'
});

// Indexes for performance
userSchema.index({ userId: 1 });
userSchema.index({ 'profile.email': 1 });
userSchema.index({ 'metadata.lastActive': -1 });

// Methods
userSchema.methods.updateActivity = function() {
  this.metadata.lastActive = new Date();
  this.metadata.totalInteractions += 1;
  return this.save();
};

userSchema.methods.getProductiveTime = function() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentTime = `${currentHour.toString().padStart(2, '0')}:00`;
  
  return this.profile.workPatterns.productiveTimes.some(timeRange => {
    const [start, end] = timeRange.split('-');
    return currentTime >= start && currentTime <= end;
  });
};

module.exports = mongoose.model('User', userSchema);