const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  firstName: String,
  lastName: String,
  company: String,
  title: String,
  department: String,
  
  // Contact Details
  email: {
    type: String,
    lowercase: true,
    trim: true,
    index: true
  },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Relationship Intelligence
  relationships: {
    type: { 
      type: String, 
      enum: ['client', 'colleague', 'friend', 'family', 'vendor', 'partner', 'lead', 'prospect', 'professional', 'business'], // ✅ ADDED 'professional' and 'business'
      required: true,
      default: 'professional' // ✅ SET default to 'professional'
    },
    importance: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'critical'], 
      default: 'medium' 
    },
    trustLevel: { 
      type: String, 
      enum: ['low', 'medium', 'high'], 
      default: 'medium' 
    },
    communicationFrequency: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'rarely'], 
      default: 'monthly' 
    },
    lastContact: Date,
    nextScheduledContact: Date,
    relationshipHistory: [{
      date: Date,
      event: String,
      notes: String
    }]
  },
  
  // Context & History References
  interactionHistory: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Conversation' 
  }],
  associatedProjects: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project' 
  }],
  associatedTasks: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task' 
  }],
  associatedNotes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Note' 
  }],
  
  // Intelligence Data
  preferences: {
    preferredContactMethod: { 
      type: String, 
      enum: ['email', 'phone', 'text', 'in-person', 'video-call'], 
      default: 'email' 
    },
    bestContactTimes: [String], // ["10:00-12:00", "14:00-16:00"]
    communicationStyle: { 
      type: String, 
      enum: ['formal', 'casual', 'direct', 'detailed'], 
      default: 'formal' 
    },
    topics: [String], // ["business", "technology", "personal"]
    languages: [String],
    timezone: String
  },
  
  // Behavioral Analysis
  patterns: {
    responseTime: String, // "2-4 hours", "same day", "1-2 days"
    meetingPreferences: { 
      type: String, 
      enum: ['in-person', 'video-call', 'phone', 'no-preference'] 
    },
    decisionMakingStyle: { 
      type: String, 
      enum: ['analytical', 'intuitive', 'collaborative', 'authoritative'] 
    },
    followUpNeeds: { 
      type: String, 
      enum: ['minimal', 'regular', 'detailed', 'frequent'] 
    },
    communicationPatterns: {
      averageResponseTime: Number, // in hours
      preferredDayOfWeek: String,
      preferredTimeOfDay: String,
      emailOpenRate: Number // percentage
    }
  },
  
  // Social & Professional Context
  tags: [String],
  customFields: mongoose.Schema.Types.Mixed,
  socialProfiles: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String,
    website: String
  },
  
  // Business Intelligence
  businessData: {
    companySize: String,
    industry: String,
    revenue: String,
    segment: {
      type: String,
      enum: ['VIP', 'Standard', 'Other'],
      default: 'Standard'
    },
    decisionMakingRole: { 
      type: String, 
      enum: ['decision-maker', 'influencer', 'gatekeeper', 'user'] 
    },
    budget: {
      range: String,
      authority: Boolean
    }
  },
  
  // AI Intelligence
  aiInsights: {
    sentiment: { 
      type: String, 
      enum: ['positive', 'neutral', 'negative'] 
    },
    engagementLevel: { 
      type: String, 
      enum: ['low', 'medium', 'high'] 
    },
    urgency: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },
    conversionProbability: Number, // 0-1
    churnRisk: { 
      type: String, 
      enum: ['low', 'medium', 'high'] 
    },
    nextBestAction: String,
    personalityType: String
  },
  
  metadata: {
    created: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now },
    source: { 
      type: String, 
      enum: ['manual', 'imported', 'extracted', 'api'], 
      default: 'manual' 
    },
    confidence: { type: Number, min: 0, max: 1, default: 0.8 }, // AI confidence in data accuracy
    dataQuality: { type: Number, min: 0, max: 1, default: 0.5 },
    lastInteraction: Date,
    interactionCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
  collection: 'eva.contacts'
});

// Indexes for performance
contactSchema.index({ userId: 1, name: 1 });
contactSchema.index({ userId: 1, email: 1 });
contactSchema.index({ userId: 1, 'relationships.importance': -1 });
contactSchema.index({ userId: 1, 'relationships.lastContact': -1 });
contactSchema.index({ userId: 1, tags: 1 });
contactSchema.index({ 'metadata.isActive': 1 });

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.name;
});

// Methods
contactSchema.methods.updateInteraction = function() {
  this.relationships.lastContact = new Date();
  this.metadata.lastInteraction = new Date();
  this.metadata.interactionCount += 1;
  return this.save();
};

contactSchema.methods.calculateEngagement = function() {
  const daysSinceLastContact = this.relationships.lastContact 
    ? Math.floor((Date.now() - this.relationships.lastContact) / (1000 * 60 * 60 * 24))
    : 999;
  
  if (daysSinceLastContact <= 7) return 'high';
  if (daysSinceLastContact <= 30) return 'medium';
  return 'low';
};

contactSchema.methods.shouldFollowUp = function() {
  const lastContact = this.relationships.lastContact;
  if (!lastContact) return true;
  
  const daysSince = Math.floor((Date.now() - lastContact) / (1000 * 60 * 60 * 24));
  const frequency = this.relationships.communicationFrequency;
  
  const thresholds = {
    'daily': 1,
    'weekly': 7,
    'monthly': 30,
    'quarterly': 90,
    'rarely': 180
  };
  
  return daysSince >= (thresholds[frequency] || 30);
};

module.exports = mongoose.model('Contact', contactSchema);