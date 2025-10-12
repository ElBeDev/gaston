const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  // Note Content
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['meeting', 'research', 'idea', 'journal', 'reference', 'todo', 'decision'],
    default: 'note',
    index: true
  },
  format: {
    type: String,
    enum: ['markdown', 'plain', 'rich-text', 'html'],
    default: 'markdown'
  },
  
  // Context & Relationships
  relatedContacts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Contact' 
  }],
  relatedProjects: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project' 
  }],
  relatedTasks: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task' 
  }],
  relatedNotes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Note' 
  }],
  
  // Meeting Intelligence (if type = meeting)
  meeting: {
    date: Date,
    attendees: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Contact' 
    }],
    agenda: [String],
    actionItems: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Task' 
    }],
    decisions: [{
      topic: String,
      decision: String,
      reasoning: String,
      participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }]
    }],
    followUpRequired: [{
      contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
      topic: String,
      deadline: Date,
      completed: { type: Boolean, default: false }
    }],
    location: String,
    duration: Number // minutes
  },
  
  // Smart Features
  tags: [String],
  category: {
    type: String,
    enum: ['work', 'personal', 'project', 'client', 'team', 'planning', 'review'],
    index: true
  },
  
  // AI Extracted Data
  aiExtractedData: {
    entities: {
      people: [String],
      dates: [String],
      tasks: [String],
      keyTopics: [String],
      locations: [String],
      companies: [String]
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      confidence: Number
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    actionItemsDetected: Number,
    keyInsights: [String],
    summary: String
  },
  
  // Organization
  folder: String,
  pinned: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false },
  
  // Security & Sharing
  visibility: {
    type: String,
    enum: ['private', 'shared', 'public'],
    default: 'private'
  },
  sharedWith: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Contact' 
  }],
  permissions: {
    type: String,
    enum: ['read', 'read-write', 'admin'],
    default: 'read-write'
  },
  
  // Version Control
  versions: [{
    content: String,
    modifiedBy: String,
    modifiedAt: { type: Date, default: Date.now },
    changeDescription: String
  }],
  
  // Rich Media
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  
  links: [{
    url: String,
    title: String,
    description: String,
    previewImage: String
  }],
  
  metadata: {
    created: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now },
    wordCount: Number,
    characterCount: Number,
    readTime: Number, // estimated reading time in minutes
    lastAccessed: Date,
    accessCount: { type: Number, default: 0 },
    source: {
      type: String,
      enum: ['manual', 'imported', 'extracted', 'transcribed'],
      default: 'manual'
    }
  }
}, {
  timestamps: true,
  collection: 'eva.notes'
});

// Indexes for performance
noteSchema.index({ userId: 1, type: 1 });
noteSchema.index({ userId: 1, category: 1 });
noteSchema.index({ userId: 1, tags: 1 });
noteSchema.index({ userId: 1, pinned: -1 });
noteSchema.index({ userId: 1, 'metadata.lastModified': -1 });
noteSchema.index({ 'metadata.archived': 1 });

// Text search index
noteSchema.index({ 
  title: 'text', 
  content: 'text', 
  tags: 'text' 
});

// Pre-save middleware to calculate metadata
noteSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.metadata.wordCount = this.content.split(/\s+/).length;
    this.metadata.characterCount = this.content.length;
    this.metadata.readTime = Math.ceil(this.metadata.wordCount / 200); // 200 WPM
  }
  next();
});

// Methods
noteSchema.methods.updateAccess = function() {
  this.metadata.lastAccessed = new Date();
  this.metadata.accessCount += 1;
  return this.save();
};

noteSchema.methods.addVersion = function(changeDescription) {
  this.versions.push({
    content: this.content,
    modifiedBy: this.userId,
    changeDescription
  });
  
  // Keep only last 10 versions
  if (this.versions.length > 10) {
    this.versions = this.versions.slice(-10);
  }
  
  return this.save();
};

noteSchema.methods.extractActionItems = function() {
  // Simple regex patterns for action items
  const patterns = [
    /(?:TODO|To do|Action|Task):\s*([^\n]+)/gi,
    /\[ \]\s*([^\n]+)/g, // Markdown checkboxes
    /(?:Need to|Must|Should|Will)\s+([^\n\.]+)/gi
  ];
  
  const actionItems = [];
  patterns.forEach(pattern => {
    const matches = [...this.content.matchAll(pattern)];
    matches.forEach(match => {
      actionItems.push(match[1].trim());
    });
  });
  
  return actionItems;
};

noteSchema.methods.linkToEntity = function(entityType, entityId) {
  const relationField = `related${entityType.charAt(0).toUpperCase() + entityType.slice(1)}s`;
  
  if (this[relationField] && !this[relationField].includes(entityId)) {
    this[relationField].push(entityId);
    return this.save();
  }
  
  return Promise.resolve(this);
};

module.exports = mongoose.model('Note', noteSchema);