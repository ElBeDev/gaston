const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  // Project Basics
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'on-hold', 'completed', 'cancelled'],
    default: 'planning',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  
  // Timeline & Scheduling
  timeline: {
    startDate: Date,
    targetDate: Date,
    actualStartDate: Date,
    actualEndDate: Date,
    estimatedHours: Number,
    actualHours: Number,
    
    milestones: [{
      name: { type: String, required: true },
      description: String,
      targetDate: Date,
      actualDate: Date,
      completed: { type: Boolean, default: false },
      tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
      dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]
    }],
    
    phases: [{
      name: String,
      description: String,
      startDate: Date,
      endDate: Date,
      status: { type: String, enum: ['pending', 'in-progress', 'completed'] },
      deliverables: [String]
    }]
  },
  
  // People & Resources
  stakeholders: [{
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    role: { 
      type: String, 
      enum: ['owner', 'client', 'team-member', 'manager', 'consultant', 'reviewer', 'approver'] 
    },
    responsibility: String,
    involvement: { type: String, enum: ['low', 'medium', 'high'] },
    permissions: [String], // ['view', 'edit', 'approve']
    notifications: { type: Boolean, default: true }
  }],
  
  team: [{
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    role: String,
    skills: [String],
    availability: Number, // percentage
    hourlyRate: Number,
    totalHours: Number
  }],
  
  // Project Intelligence
  budget: {
    allocated: Number,
    spent: Number,
    projected: Number,
    currency: { type: String, default: 'USD' },
    breakdown: [{
      category: String,
      allocated: Number,
      spent: Number
    }]
  },
  
  riskAssessment: {
    level: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    factors: [String], // ["timeline", "scope-creep", "resource-availability"]
    mitigation: String,
    contingencyPlan: String,
    riskRegister: [{
      risk: String,
      probability: { type: String, enum: ['low', 'medium', 'high'] },
      impact: { type: String, enum: ['low', 'medium', 'high'] },
      mitigation: String,
      owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }
    }]
  },
  
  // Relationships & Dependencies
  parentProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  subProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  dependencies: [{
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    type: { type: String, enum: ['blocks', 'requires', 'relates-to'] },
    description: String
  }],
  relatedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  relatedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
  relatedDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  
  // Analytics & Intelligence
  progress: {
    percentage: { type: Number, min: 0, max: 100, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 },
    milestonesCompleted: { type: Number, default: 0 },
    totalMilestones: { type: Number, default: 0 },
    timeline: { 
      type: String, 
      enum: ['ahead', 'on-track', 'behind', 'critical'], 
      default: 'on-track' 
    },
    velocity: Number, // tasks per week
    burnRate: Number, // budget per week
    qualityScore: Number // 0-10
  },
  
  kpis: {
    onTimeDelivery: Number,
    budgetVariance: Number,
    scopeCreep: Number,
    stakeholderSatisfaction: Number,
    teamProductivity: Number
  },
  
  // Categorization & Organization
  category: { 
    type: String, 
    enum: ['client-work', 'internal', 'research', 'product', 'marketing', 'operations'],
    index: true
  },
  tags: [String],
  customFields: mongoose.Schema.Types.Mixed,
  
  // Collaboration & Communication
  communications: [{
    date: Date,
    type: { type: String, enum: ['meeting', 'email', 'call', 'document'] },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }],
    summary: String,
    actionItems: [String],
    decisions: [String]
  }],
  
  // AI Intelligence
  aiInsights: {
    successProbability: Number, // 0-1
    recommendedActions: [String],
    riskPredictions: [String],
    optimizationSuggestions: [String],
    similarProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    lessonLearned: [String]
  },
  
  metadata: {
    created: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now },
    archived: { type: Boolean, default: false },
    template: { type: Boolean, default: false },
    source: { type: String, enum: ['manual', 'template', 'imported'] },
    version: { type: Number, default: 1 },
    lastActivity: Date,
    activityCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  collection: 'eva.projects'
});

// Indexes for performance
projectSchema.index({ userId: 1, status: 1 });
projectSchema.index({ userId: 1, priority: -1 });
projectSchema.index({ userId: 1, 'timeline.targetDate': 1 });
projectSchema.index({ userId: 1, category: 1 });
projectSchema.index({ 'stakeholders.contactId': 1 });
projectSchema.index({ tags: 1 });

// Virtual for project health
projectSchema.virtual('health').get(function() {
  const progress = this.progress.percentage;
  const timeline = this.progress.timeline;
  const riskLevel = this.riskAssessment.level;
  
  if (riskLevel === 'critical' || timeline === 'critical') return 'critical';
  if (riskLevel === 'high' || timeline === 'behind') return 'at-risk';
  if (progress > 80 && timeline === 'on-track') return 'healthy';
  return 'normal';
});

// Methods
projectSchema.methods.updateProgress = function() {
  // Calculate progress based on completed tasks and milestones
  const completedTasks = this.progress.tasksCompleted;
  const totalTasks = this.progress.totalTasks;
  const completedMilestones = this.timeline.milestones.filter(m => m.completed).length;
  const totalMilestones = this.timeline.milestones.length;
  
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 0.7 : 0;
  const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 0.3 : 0;
  
  this.progress.percentage = Math.round((taskProgress + milestoneProgress) * 100);
  this.progress.milestonesCompleted = completedMilestones;
  this.progress.totalMilestones = totalMilestones;
  
  return this.save();
};

projectSchema.methods.calculateTimelineStatus = function() {
  if (!this.timeline.targetDate) return 'on-track';
  
  const now = new Date();
  const target = new Date(this.timeline.targetDate);
  const progress = this.progress.percentage;
  
  const totalDays = Math.floor((target - new Date(this.timeline.startDate)) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.floor((now - new Date(this.timeline.startDate)) / (1000 * 60 * 60 * 24));
  const expectedProgress = (elapsedDays / totalDays) * 100;
  
  if (progress >= expectedProgress + 10) return 'ahead';
  if (progress >= expectedProgress - 10) return 'on-track';
  if (progress >= expectedProgress - 25) return 'behind';
  return 'critical';
};

projectSchema.methods.addStakeholder = function(contactId, role, responsibility) {
  this.stakeholders.push({
    contactId,
    role,
    responsibility,
    involvement: 'medium'
  });
  return this.save();
};

module.exports = mongoose.model('Project', projectSchema);