const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  // Task Basics
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled', 'blocked', 'waiting'],
    default: 'pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent', 'critical'],
    default: 'medium',
    index: true
  },
  
  // Scheduling Intelligence
  scheduling: {
    dueDate: {
      type: Date,
      index: true
    },
    startDate: Date,
    completedDate: Date,
    estimatedDuration: Number, // hours
    actualDuration: Number,    // hours
    estimatedPomodoros: Number, // 25-minute blocks
    actualPomodoros: Number,
    
    reminders: [{
      date: Date,
      type: { type: String, enum: ['email', 'push', 'desktop'] },
      sent: { type: Boolean, default: false }
    }],
    
    recurrence: {
      enabled: { type: Boolean, default: false },
      pattern: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
      interval: { type: Number, default: 1 }, // every N days/weeks/months
      endDate: Date,
      nextOccurrence: Date
    }
  },
  
  // Context & Relationships
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project',
    index: true
  },
  parentTask: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task' 
  },
  subtasks: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task' 
  }],
  
  relatedContacts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Contact' 
  }],
  relatedNotes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Note' 
  }],
  relatedDocuments: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Document' 
  }],
  
  // Dependencies & Blockers
  dependencies: [{
    taskId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Task' 
    },
    type: { 
      type: String, 
      enum: ['blocks', 'requires', 'relates-to', 'duplicates'] 
    },
    description: String
  }],
  
  blockers: [{
    description: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    resolvedDate: Date,
    resolved: { type: Boolean, default: false }
  }],
  
  // Work Intelligence
  category: {
    type: String,
    enum: ['development', 'design', 'meeting', 'research', 'communication', 'planning', 'review', 'testing', 'documentation', 'conversation'], // ✅ ADDED 'conversation'
    index: true
  },
  tags: [String],
  complexity: {
    type: String,
    enum: ['trivial', 'easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  energyLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  focusRequired: {
    type: String,
    enum: ['low', 'medium', 'high', 'deep'],
    default: 'medium'
  },
  
  // Progress Tracking
  progress: {
    percentage: { 
      type: Number, 
      min: 0, 
      max: 100, 
      default: 0 
    },
    checkpoints: [{
      description: { type: String, required: true },
      targetDate: Date,
      completedDate: Date,
      completed: { type: Boolean, default: false },
      notes: String
    }],
    timeLog: [{
      startTime: Date,
      endTime: Date,
      duration: Number, // minutes
      description: String,
      interrupted: { type: Boolean, default: false }
    }],
    effortTracking: {
      estimatedEffort: Number, // 1-10 scale
      actualEffort: Number,
      satisfactionLevel: Number // 1-10 scale
    }
  },
  
  // Resources & Links
  resources: [{
    type: { 
      type: String, 
      enum: ['url', 'file', 'document', 'contact', 'tool', 'reference'] 
    },
    url: String,
    title: String,
    description: String,
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  
  // Collaboration
  assignedTo: [{
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    role: { type: String, enum: ['owner', 'collaborator', 'reviewer', 'approver'] },
    percentage: Number, // percentage of task responsibility
    notifyOnUpdates: { type: Boolean, default: true }
  }],
  
  watchers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Contact' 
  }],
  
  // AI Intelligence & Suggestions
  aiInsights: {
    optimalScheduling: {
      suggestedStartTime: String, // "Tuesday 10:00 AM"
      suggestedDuration: Number,  // hours
      confidence: Number          // 0-1
    },
    similarTasks: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Task' 
    }],
    estimatedCompletion: Date,
    riskFactors: [String],
    suggestions: [{
      type: { type: String, enum: ['scheduling', 'resources', 'dependencies', 'optimization'] },
      suggestion: String,
      confidence: Number,
      reasoning: String
    }]
  },
  
  // Location & Context
  location: {
    type: { type: String, enum: ['office', 'home', 'client-site', 'remote', 'anywhere'] },
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Custom Fields & Metadata
  customFields: mongoose.Schema.Types.Mixed,
  
  metadata: {
    created: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now },
    source: { 
      type: String, 
      enum: ['manual', 'extracted', 'automated', 'imported', 'recurring'], 
      default: 'manual' 
    },
    extractedFrom: {
      type: { type: String, enum: ['email', 'conversation', 'meeting', 'document'] },
      sourceId: mongoose.Schema.Types.ObjectId,
      confidence: Number,
      // ✅ NEW: Add these fields for Eva's smart actions
      originalText: String,        // Store original conversation text
      createdAutomatically: Boolean,  // Flag for auto-created tasks
      originalAction: String       // Store the extracted action word
    },
    version: { type: Number, default: 1 },
    archived: { type: Boolean, default: false },
    lastActivity: Date,
    activityCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  collection: 'eva.tasks'
});

// Indexes for performance
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, priority: -1 });
taskSchema.index({ userId: 1, 'scheduling.dueDate': 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ projectId: 1 });
taskSchema.index({ tags: 1 });
taskSchema.index({ 'assignedTo.contactId': 1 });
taskSchema.index({ 'metadata.archived': 1 });

// Virtual for task urgency
taskSchema.virtual('urgency').get(function() {
  if (!this.scheduling.dueDate) return 'none';
  
  const now = new Date();
  const due = new Date(this.scheduling.dueDate);
  const hoursUntilDue = (due - now) / (1000 * 60 * 60);
  
  if (hoursUntilDue < 0) return 'overdue';
  if (hoursUntilDue < 24) return 'urgent';
  if (hoursUntilDue < 72) return 'soon';
  return 'normal';
});

// Virtual for completion status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.scheduling.dueDate || this.status === 'completed') return false;
  return new Date() > new Date(this.scheduling.dueDate);
});

// Methods
taskSchema.methods.updateProgress = function(percentage, notes) {
  this.progress.percentage = Math.max(0, Math.min(100, percentage));
  
  if (percentage === 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.scheduling.completedDate = new Date();
  } else if (percentage > 0 && this.status === 'pending') {
    this.status = 'in-progress';
    if (!this.scheduling.startDate) {
      this.scheduling.startDate = new Date();
    }
  }
  
  if (notes) {
    this.progress.checkpoints.push({
      description: `Progress update: ${percentage}%`,
      completedDate: new Date(),
      completed: true,
      notes: notes
    });
  }
  
  this.metadata.lastActivity = new Date();
  this.metadata.activityCount += 1;
  
  return this.save();
};

taskSchema.methods.addTimeLog = function(startTime, endTime, description) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const duration = Math.round((end - start) / (1000 * 60)); // minutes
  
  this.progress.timeLog.push({
    startTime: start,
    endTime: end,
    duration: duration,
    description: description || 'Work session'
  });
  
  // Update actual duration
  const totalMinutes = this.progress.timeLog.reduce((total, log) => total + log.duration, 0);
  this.scheduling.actualDuration = Math.round(totalMinutes / 60 * 100) / 100; // hours, rounded to 2 decimals
  
  return this.save();
};

taskSchema.methods.addBlocker = function(description, severity, contactId) {
  this.blockers.push({
    description,
    severity: severity || 'medium',
    contactId
  });
  
  if (this.status !== 'blocked') {
    this.status = 'blocked';
  }
  
  return this.save();
};

taskSchema.methods.resolveBlocker = function(blockerId, notes) {
  const blocker = this.blockers.id(blockerId);
  if (blocker) {
    blocker.resolved = true;
    blocker.resolvedDate = new Date();
    
    // If no more unresolved blockers, change status back
    const unresolvedBlockers = this.blockers.filter(b => !b.resolved);
    if (unresolvedBlockers.length === 0 && this.status === 'blocked') {
      this.status = this.progress.percentage > 0 ? 'in-progress' : 'pending';
    }
  }
  
  return this.save();
};

taskSchema.methods.calculateProductivityScore = function() {
  const estimated = this.scheduling.estimatedDuration || 1;
  const actual = this.scheduling.actualDuration || estimated;
  const efficiency = Math.min(estimated / actual, 2); // Cap at 200% efficiency
  
  const timelinessScore = this.isOverdue ? 0.5 : 1;
  const completionScore = this.progress.percentage / 100;
  
  return Math.round((efficiency * timelinessScore * completionScore) * 100) / 100;
};

taskSchema.methods.suggestOptimalTime = function() {
  // Simple heuristic - can be enhanced with ML
  const energyMap = {
    'low': ['16:00-18:00', '20:00-22:00'],
    'medium': ['10:00-12:00', '14:00-16:00'],
    'high': ['09:00-11:00', '15:00-17:00']
  };
  
  const focusMap = {
    'low': ['Any time works'],
    'medium': ['10:00-12:00', '14:00-16:00'],
    'high': ['09:00-11:00'],
    'deep': ['09:00-11:00', '21:00-23:00']
  };
  
  return {
    energySlots: energyMap[this.energyLevel] || energyMap['medium'],
    focusSlots: focusMap[this.focusRequired] || focusMap['medium'],
    estimatedDuration: this.scheduling.estimatedDuration || 1
  };
};

module.exports = mongoose.model('Task', taskSchema);