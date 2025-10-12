const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// Import legacy and new models
const UserContext = require('../models/UserContext');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Note = require('../models/Note');
const Conversation = require('../models/Conversation');

class MigrationManager {
  constructor() {
    this.migrationLog = [];
    this.errors = [];
    this.stats = {
      users: { total: 0, migrated: 0, failed: 0 },
      contacts: { total: 0, migrated: 0, failed: 0 },
      tasks: { total: 0, migrated: 0, failed: 0 },
      notes: { total: 0, migrated: 0, failed: 0 },
      conversations: { total: 0, migrated: 0, failed: 0 },
      projects: { total: 0, migrated: 0, failed: 0 }
    };
  }

  // Main migration orchestrator
  async runMigration(options = {}) {
    console.log('🚀 Starting Eva Advanced Intelligence Migration...');
    
    const {
      backupFirst = true,
      dryRun = false,
      userId = 'gaston',
      forceOverwrite = false
    } = options;

    try {
      // Step 1: Create backup
      if (backupFirst && !dryRun) {
        await this.createBackup(userId);
      }

      // Step 2: Validate source data
      await this.validateSourceData(userId);

      // Step 3: Check if migration already exists
      if (!forceOverwrite) {
        const existing = await this.checkExistingMigration(userId);
        if (existing) {
          throw new Error('Migration already exists. Use forceOverwrite: true to override.');
        }
      }

      // Step 4: Run migrations in order (maintain relationships)
      const migrationSteps = [
        { name: 'User Profile', fn: () => this.migrateUserProfile(userId, dryRun) },
        { name: 'Contacts', fn: () => this.migrateContacts(userId, dryRun) },
        { name: 'Projects', fn: () => this.migrateProjects(userId, dryRun) },
        { name: 'Tasks', fn: () => this.migrateTasks(userId, dryRun) },
        { name: 'Notes', fn: () => this.migrateNotes(userId, dryRun) },
        { name: 'Conversations', fn: () => this.migrateConversations(userId, dryRun) }
      ];

      for (const step of migrationSteps) {
        console.log(`\n📊 Migrating ${step.name}...`);
        await step.fn();
        console.log(`✅ ${step.name} migration completed`);
      }

      // Step 5: Validate migrated data
      await this.validateMigratedData(userId);

      // Step 6: Create relationships
      await this.createCrossReferences(userId, dryRun);

      // Step 7: Generate migration report
      const report = await this.generateMigrationReport(userId);

      console.log('\n🎉 Migration completed successfully!');
      console.log(`📊 Migration Report:\n${JSON.stringify(this.stats, null, 2)}`);

      return {
        success: true,
        stats: this.stats,
        report,
        migrationLog: this.migrationLog,
        errors: this.errors
      };

    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      
      // Attempt rollback if not dry run
      if (!dryRun && backupFirst) {
        console.log('🔄 Attempting rollback...');
        await this.rollback(userId);
      }

      return {
        success: false,
        error: error.message,
        stats: this.stats,
        migrationLog: this.migrationLog,
        errors: this.errors
      };
    }
  }

  // Create backup of existing data
  async createBackup(userId) {
    console.log('💾 Creating backup...');
    
    const backupDir = path.join(__dirname, '../backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup-${userId}-${timestamp}.json`);
    
    const userContext = await UserContext.findOne({ userId });
    if (userContext) {
      await fs.writeFile(backupFile, JSON.stringify(userContext, null, 2));
      this.log(`✅ Backup created: ${backupFile}`);
    }
    
    return backupFile;
  }

  // Validate source data exists and is valid
  async validateSourceData(userId) {
    console.log('🔍 Validating source data...');
    
    const userContext = await UserContext.findOne({ userId });
    if (!userContext) {
      throw new Error(`No UserContext found for userId: ${userId}`);
    }

    // Count source data
    this.stats.contacts.total = userContext.contacts?.length || 0;
    this.stats.tasks.total = userContext.agenda?.length || 0;
    this.stats.notes.total = userContext.notes?.length || 0;
    this.stats.conversations.total = userContext.conversationHistory?.length || 0;

    this.log(`📊 Source data counts: Contacts: ${this.stats.contacts.total}, Tasks: ${this.stats.tasks.total}, Notes: ${this.stats.notes.total}, Conversations: ${this.stats.conversations.total}`);
  }

  // Check if migration already exists
  async checkExistingMigration(userId) {
    const existingUser = await User.findOne({ userId });
    return !!existingUser;
  }

  // Migrate user profile data
  async migrateUserProfile(userId, dryRun = false) {
    const userContext = await UserContext.findOne({ userId });
    if (!userContext) return;

    const userData = {
      userId,
      profile: {
        name: userContext.name || 'Gaston',
        email: userContext.email || null,
        preferences: {
          workingHours: {
            start: userContext.preferences?.workingHours?.start || '09:00',
            end: userContext.preferences?.workingHours?.end || '17:00'
          },
          timezone: userContext.preferences?.timezone || 'UTC-5',
          priorities: userContext.preferences?.priorities || ['work', 'personal'],
          communicationStyle: userContext.preferences?.communicationStyle || 'direct',
          notificationSettings: userContext.preferences?.notificationSettings || {
            email: true,
            push: true,
            desktop: false
          }
        },
        goals: userContext.goals || [],
        workPatterns: {
          productiveTimes: userContext.preferences?.productiveTimes || ['09:00-11:00', '14:00-16:00'],
          breakPatterns: userContext.preferences?.breakPatterns || {},
          focusAreas: userContext.preferences?.focusAreas || ['development', 'meetings']
        }
      },
      intelligence: {
        level: Math.min(Math.floor((userContext.conversationHistory?.length || 0) / 100) + 1, 10),
        learningData: {
          interactionPatterns: userContext.interactionPatterns || {},
          preferenceEvolution: {},
          successMetrics: {}
        }
      },
      metadata: {
        totalInteractions: userContext.conversationHistory?.length || 0,
        dataQualityScore: 0.8
      }
    };

    if (!dryRun) {
      await User.findOneAndUpdate({ userId }, userData, { upsert: true, new: true });
      this.stats.users.migrated++;
    }

    this.log(`✅ User profile migrated for ${userId}`);
  }

  // Migrate contacts with intelligence
  async migrateContacts(userId, dryRun = false) {
    const userContext = await UserContext.findOne({ userId });
    if (!userContext?.contacts) return;

    for (const contact of userContext.contacts) {
      try {
        const contactData = {
          userId,
          name: contact.name,
          firstName: contact.firstName || contact.name?.split(' ')[0],
          lastName: contact.lastName || contact.name?.split(' ').slice(1).join(' '),
          company: contact.company,
          title: contact.title,
          email: contact.email,
          phone: contact.phone,
          
          relationships: {
            type: contact.type || 'contact',
            importance: contact.importance || 'medium',
            trustLevel: 'medium',
            communicationFrequency: contact.frequency || 'monthly',
            lastContact: contact.lastContact ? new Date(contact.lastContact) : null
          },
          
          preferences: {
            preferredContactMethod: contact.preferredMethod || 'email',
            communicationStyle: contact.style || 'formal',
            topics: contact.interests || []
          },
          
          patterns: {
            responseTime: contact.responseTime || '24 hours',
            meetingPreferences: 'no-preference'
          },
          
          tags: contact.tags || [],
          customFields: contact.customFields || {},
          
          metadata: {
            source: 'migrated',
            confidence: 0.9,
            dataQuality: 0.8,
            isActive: true
          }
        };

        if (!dryRun) {
          await Contact.create(contactData);
          this.stats.contacts.migrated++;
        }

      } catch (error) {
        this.error(`Failed to migrate contact ${contact.name}: ${error.message}`);
        this.stats.contacts.failed++;
      }
    }

    this.log(`✅ Migrated ${this.stats.contacts.migrated} contacts`);
  }

  // Migrate tasks with intelligence
  async migrateTasks(userId, dryRun = false) {
    const userContext = await UserContext.findOne({ userId });
    if (!userContext?.agenda) return;

    for (const task of userContext.agenda) {
      try {
        const taskData = {
          userId,
          title: task.task || task.title || 'Untitled Task',
          description: task.description || task.details || '',
          status: this.mapTaskStatus(task.status || task.completed),
          priority: task.priority || 'medium',
          
          scheduling: {
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            estimatedDuration: task.estimatedHours || task.duration || 1,
            startDate: task.startDate ? new Date(task.startDate) : null,
            completedDate: task.completedDate ? new Date(task.completedDate) : null
          },
          
          category: task.category || 'general',
          tags: task.tags || [],
          complexity: task.complexity || 'medium',
          energyLevel: task.energyLevel || 'medium',
          
          progress: {
            percentage: task.completed ? 100 : (task.progress || 0)
          },
          
          customFields: task.customFields || {},
          
          metadata: {
            source: 'migrated',
            created: task.created ? new Date(task.created) : new Date(),
            archived: false
          }
        };

        if (!dryRun) {
          await Task.create(taskData);
          this.stats.tasks.migrated++;
        }

      } catch (error) {
        this.error(`Failed to migrate task ${task.task || 'Unknown'}: ${error.message}`);
        this.stats.tasks.failed++;
      }
    }

    this.log(`✅ Migrated ${this.stats.tasks.migrated} tasks`);
  }

  // Migrate notes with AI extraction
  async migrateNotes(userId, dryRun = false) {
    const userContext = await UserContext.findOne({ userId });
    if (!userContext?.notes) return;

    for (const note of userContext.notes) {
      try {
        const noteData = {
          userId,
          title: note.title || note.subject || 'Untitled Note',
          content: note.content || note.text || '',
          type: note.type || 'note',
          format: 'markdown',
          
          category: note.category || 'general',
          tags: note.tags || [],
          
          // Extract AI data from content
          aiExtractedData: this.extractNoteIntelligence(note.content || ''),
          
          folder: note.folder || 'general',
          pinned: note.pinned || false,
          archived: note.archived || false,
          
          metadata: {
            created: note.created ? new Date(note.created) : new Date(),
            lastModified: note.modified ? new Date(note.modified) : new Date(),
            source: 'migrated',
            wordCount: (note.content || '').split(' ').length,
            characterCount: (note.content || '').length
          }
        };

        if (!dryRun) {
          await Note.create(noteData);
          this.stats.notes.migrated++;
        }

      } catch (error) {
        this.error(`Failed to migrate note ${note.title || 'Unknown'}: ${error.message}`);
        this.stats.notes.failed++;
      }
    }

    this.log(`✅ Migrated ${this.stats.notes.migrated} notes`);
  }

  // Migrate conversations with context intelligence
  async migrateConversations(userId, dryRun = false) {
    const userContext = await UserContext.findOne({ userId });
    if (!userContext?.conversationHistory) return;

    for (let i = 0; i < userContext.conversationHistory.length; i++) {
      const conv = userContext.conversationHistory[i];
      
      try {
        const conversationData = {
          userId,
          message: conv.message || conv.content || '',
          response: conv.response || '',
          role: conv.role || (conv.message ? 'user' : 'assistant'),
          
          context: this.extractConversationContext(conv.message || ''),
          extractedEntities: this.extractEntities(conv.message || ''),
          
          aiProcessing: {
            model: 'migrated-data',
            tokensUsed: {
              input: Math.ceil((conv.message || '').length / 4),
              output: Math.ceil((conv.response || '').length / 4),
              total: Math.ceil(((conv.message || '') + (conv.response || '')).length / 4)
            },
            processingTime: 1000,
            responseQuality: {
              relevance: 0.8,
              helpfulness: 0.8,
              accuracy: 0.8
            }
          },
          
          sequenceNumber: i + 1,
          
          metadata: {
            timestamp: conv.timestamp ? new Date(conv.timestamp) : new Date(),
            version: 1
          }
        };

        if (!dryRun) {
          await Conversation.create(conversationData);
          this.stats.conversations.migrated++;
        }

      } catch (error) {
        this.error(`Failed to migrate conversation ${i}: ${error.message}`);
        this.stats.conversations.failed++;
      }
    }

    this.log(`✅ Migrated ${this.stats.conversations.migrated} conversations`);
  }

  // Create initial projects from tasks
  async migrateProjects(userId, dryRun = false) {
    // Create a default "General Work" project for orphaned tasks
    const projectData = {
      userId,
      name: 'General Work',
      description: 'Default project for migrated tasks without specific projects',
      status: 'in-progress',
      priority: 'medium',
      
      timeline: {
        startDate: new Date(),
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
      },
      
      category: 'general',
      tags: ['migrated', 'general'],
      
      progress: {
        percentage: 0,
        timeline: 'on-track'
      },
      
      metadata: {
        source: 'migrated',
        archived: false
      }
    };

    if (!dryRun) {
      await Project.create(projectData);
      this.stats.projects.migrated = 1;
    }

    this.log(`✅ Created default project for migrated tasks`);
  }

  // Create cross-references between entities
  async createCrossReferences(userId, dryRun = false) {
    if (dryRun) return;

    console.log('🔗 Creating cross-references...');

    // Link tasks to default project
    const defaultProject = await Project.findOne({ userId, name: 'General Work' });
    if (defaultProject) {
      await Task.updateMany(
        { userId, projectId: { $exists: false } },
        { projectId: defaultProject._id }
      );
    }

    // Extract and link entities from conversations
    const conversations = await Conversation.find({ userId });
    const contacts = await Contact.find({ userId });
    const tasks = await Task.find({ userId });
    const notes = await Note.find({ userId });

    for (const conversation of conversations) {
      const entityLinks = this.findEntityReferences(
        conversation.message, 
        { contacts, tasks, notes }
      );

      if (entityLinks.contacts.length > 0) {
        conversation.extractedEntities.contacts = entityLinks.contacts;
      }
      if (entityLinks.tasks.length > 0) {
        conversation.extractedEntities.tasks = entityLinks.tasks;
      }
      if (entityLinks.notes.length > 0) {
        conversation.extractedEntities.notes = entityLinks.notes;
      }

      await conversation.save();
    }

    this.log(`✅ Cross-references created`);
  }

  // Utility methods
  mapTaskStatus(status) {
    if (typeof status === 'boolean') {
      return status ? 'completed' : 'pending';
    }
    
    const statusMap = {
      'completed': 'completed',
      'done': 'completed',
      'finished': 'completed',
      'in-progress': 'in-progress',
      'ongoing': 'in-progress',
      'pending': 'pending',
      'todo': 'pending',
      'blocked': 'blocked',
      'cancelled': 'cancelled'
    };
    
    return statusMap[status?.toLowerCase()] || 'pending';
  }

  extractConversationContext(message) {
    const context = {
      intent: 'information',
      urgency: 'medium',
      sentiment: 'neutral',
      complexity: 'medium'
    };

    // Simple intent detection
    if (message.includes('?')) {
      context.intent = 'question';
    } else if (message.match(/create|add|new|make/i)) {
      context.intent = 'command';
    } else if (message.match(/urgent|asap|immediately/i)) {
      context.urgency = 'high';
    }

    return context;
  }

  extractEntities(text) {
    return {
      contacts: [],
      tasks: [],
      projects: [],
      notes: [],
      dates: this.extractDates(text),
      keywords: this.extractKeywords(text),
      topics: []
    };
  }

  extractNoteIntelligence(content) {
    return {
      entities: {
        people: this.extractPeople(content),
        dates: this.extractDates(content),
        tasks: this.extractActionItems(content),
        keyTopics: this.extractKeywords(content)
      },
      sentiment: 'neutral',
      urgency: 'medium',
      actionItemsDetected: this.extractActionItems(content).length
    };
  }

  extractDates(text) {
    const dateRegex = /\b(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}|today|tomorrow|yesterday)\b/gi;
    return [...(text.match(dateRegex) || [])];
  }

  extractPeople(text) {
    const nameRegex = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
    return [...(text.match(nameRegex) || [])];
  }

  extractKeywords(text) {
    const words = text.toLowerCase().split(/\W+/);
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return words
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 10);
  }

  extractActionItems(text) {
    const patterns = [
      /(?:TODO|To do|Action|Task):\s*([^\n]+)/gi,
      /\[ \]\s*([^\n]+)/g,
      /(?:Need to|Must|Should|Will)\s+([^\n\.]+)/gi
    ];
    
    const actionItems = [];
    patterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => actionItems.push(match[1].trim()));
    });
    
    return actionItems;
  }

  findEntityReferences(text, entities) {
    const links = {
      contacts: [],
      tasks: [],
      notes: []
    };

    // Simple name matching
    entities.contacts.forEach(contact => {
      if (text.toLowerCase().includes(contact.name.toLowerCase())) {
        links.contacts.push(contact._id);
      }
    });

    entities.tasks.forEach(task => {
      if (text.toLowerCase().includes(task.title.toLowerCase())) {
        links.tasks.push(task._id);
      }
    });

    entities.notes.forEach(note => {
      if (text.toLowerCase().includes(note.title.toLowerCase())) {
        links.notes.push(note._id);
      }
    });

    return links;
  }

  // Validation methods
  async validateMigratedData(userId) {
    console.log('✅ Validating migrated data...');
    
    const counts = await this.getMigratedDataCounts(userId);
    
    this.log(`📊 Migrated data validation:`);
    this.log(`- Users: ${counts.users}`);
    this.log(`- Contacts: ${counts.contacts}`);
    this.log(`- Tasks: ${counts.tasks}`);
    this.log(`- Notes: ${counts.notes}`);
    this.log(`- Conversations: ${counts.conversations}`);
    this.log(`- Projects: ${counts.projects}`);
    
    return counts;
  }

  async getMigratedDataCounts(userId) {
    const [users, contacts, tasks, notes, conversations, projects] = await Promise.all([
      User.countDocuments({ userId }),
      Contact.countDocuments({ userId }),
      Task.countDocuments({ userId }),
      Note.countDocuments({ userId }),
      Conversation.countDocuments({ userId }),
      Project.countDocuments({ userId })
    ]);

    return { users, contacts, tasks, notes, conversations, projects };
  }

  // Generate migration report
  async generateMigrationReport(userId) {
    const report = {
      migrationDate: new Date(),
      userId,
      stats: this.stats,
      migrationLog: this.migrationLog,
      errors: this.errors,
      postMigrationCounts: await this.getMigratedDataCounts(userId)
    };

    // Save report to file
    const reportsDir = path.join(__dirname, '../reports');
    await fs.mkdir(reportsDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportsDir, `migration-report-${userId}-${timestamp}.json`);
    
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    this.log(`📊 Migration report saved: ${reportFile}`);
    
    return report;
  }

  // Rollback functionality
  async rollback(userId) {
    console.log('🔄 Rolling back migration...');
    
    try {
      // Remove migrated data
      await Promise.all([
        User.deleteMany({ userId }),
        Contact.deleteMany({ userId }),
        Task.deleteMany({ userId }),
        Note.deleteMany({ userId }),
        Conversation.deleteMany({ userId }),
        Project.deleteMany({ userId })
      ]);
      
      this.log(`✅ Rollback completed for ${userId}`);
      
    } catch (error) {
      this.error(`Failed to rollback: ${error.message}`);
      throw error;
    }
  }

  // Logging utilities
  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.migrationLog.push(logEntry);
    console.log(logEntry);
  }

  error(message) {
    const timestamp = new Date().toISOString();
    const errorEntry = `[${timestamp}] ERROR: ${message}`;
    this.errors.push(errorEntry);
    console.error(errorEntry);
  }
}

module.exports = MigrationManager;