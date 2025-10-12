  // ===== CONTACT ANALYTICS & KPIs =====
// ...existing code...
// MÉTODO DEBE IR DENTRO DE LA CLASE CRMController
// ...existing code...
const UserContext = require('../models/UserContext');
const Contact = require('../models/Contact');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Note = require('../models/Note');
const intelligenceService = require('../services/intelligenceService');

class CRMController {
  // ===== CONTACT ANALYTICS & KPIs =====
  async getContactAnalyticsSummary(req, res) {
    try {
      const userId = req.query.userId || 'gaston';
      const allContacts = await Contact.find({ userId, 'metadata.isActive': true });
      const totalContacts = allContacts.length;
      const vipContacts = allContacts.filter(c => c.businessData && c.businessData.segment === 'VIP').length;
      const atRiskContacts = allContacts.filter(c => c.aiInsights && c.aiInsights.churnRisk === 'high').length;
      // Engagement promedio: media de engagementLevel (high=100, medium=70, low=40)
      const engagementMap = { high: 100, medium: 70, low: 40 };
      const engagementValues = allContacts.map(c => engagementMap[(c.aiInsights && c.aiInsights.engagementLevel) || 'medium'] || 70);
      const avgEngagement = engagementValues.length ? Math.round(engagementValues.reduce((a, b) => a + b, 0) / engagementValues.length) : 0;
      res.json({
        success: true,
        kpis: {
          totalContacts,
          vipContacts,
          atRiskContacts,
          avgEngagement
        }
      });
    } catch (error) {
      console.error('❌ Error fetching contact analytics summary:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch analytics summary', details: error.message });
    }
  }
  // ===== CONTACT ANALYTICS & KPIs =====
  async getContactAnalyticsSummary(req, res) {
    try {
      const userId = req.query.userId || 'gaston';
      const allContacts = await Contact.find({ userId, 'metadata.isActive': true });
      const totalContacts = allContacts.length;
      const vipContacts = allContacts.filter(c => c.businessData && c.businessData.segment === 'VIP').length;
      const atRiskContacts = allContacts.filter(c => c.aiInsights && c.aiInsights.churnRisk === 'high').length;
      // Engagement promedio: media de engagementLevel (high=100, medium=70, low=40)
      const engagementMap = { high: 100, medium: 70, low: 40 };
      const engagementValues = allContacts.map(c => engagementMap[(c.aiInsights && c.aiInsights.engagementLevel) || 'medium'] || 70);
      const avgEngagement = engagementValues.length ? Math.round(engagementValues.reduce((a, b) => a + b, 0) / engagementValues.length) : 0;
      res.json({
        success: true,
        kpis: {
          totalContacts,
          vipContacts,
          atRiskContacts,
          avgEngagement
        }
      });
    } catch (error) {
      console.error('❌ Error fetching contact analytics summary:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch analytics summary', details: error.message });
    }
  }
  // ===== CONTACTS MANAGEMENT =====
  
  // Get all contacts with intelligent filtering
  async getContacts(req, res) {
    try {
      const { 
        userId = 'gaston', 
        search, 
        type, 
        importance, 
        company,
        tags,
        segment,
        urgency,
        limit = 50,
        page = 1,
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      // Build smart query
      let query = { userId, 'metadata.isActive': true };
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (type) query['relationships.type'] = type;
      if (importance) query['relationships.importance'] = importance;
      if (company) query.company = { $regex: company, $options: 'i' };
      if (tags) query.tags = { $in: tags.split(',') };
      if (segment) query['businessData.segment'] = segment;
      if (urgency) query['aiInsights.urgency'] = urgency;

      // Sort configuration
      const sortConfig = {};
      if (sortBy === 'importance') {
        sortConfig['relationships.importance'] = sortOrder === 'desc' ? -1 : 1;
      } else if (sortBy === 'lastContact') {
        sortConfig['relationships.lastContact'] = sortOrder === 'desc' ? -1 : 1;
      } else {
        sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }

      const contacts = await Contact.find(query)
        .sort(sortConfig)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .populate('interactionHistory', 'message response timestamp')
        .populate('associatedTasks', 'title status priority dueDate')
        .populate('associatedProjects', 'name status priority');


      // Add intelligence insights and AI suggestions/scoring
      const enrichedContacts = await Promise.all(
        contacts.map(async (contact) => {
          const contactObj = contact.toObject();

          // Engagement scoring
          const engagementLevel = contact.calculateEngagement();
          // Heurística simple para churnRisk y conversionProbability
          let churnRisk = 'low';
          let conversionProbability = 0.7;
          if (engagementLevel === 'low' || contact.metadata.interactionCount < 2) {
            churnRisk = 'high';
            conversionProbability = 0.2;
          } else if (engagementLevel === 'medium') {
            churnRisk = 'medium';
            conversionProbability = 0.5;
          }

          // Sugerencia AI (nextBestAction) simple
          let nextBestAction = 'Enviar mensaje de seguimiento';
          if (churnRisk === 'high') {
            nextBestAction = 'Llamar o agendar reunión urgente';
          } else if (engagementLevel === 'high') {
            nextBestAction = 'Agradecer y mantener contacto regular';
          }

          // Actualizar aiInsights en el objeto (no en DB)
          contactObj.aiInsights = {
            ...contactObj.aiInsights,
            engagementLevel,
            churnRisk,
            conversionProbability,
            nextBestAction
          };

          // Exponer también en intelligence para el frontend
          contactObj.intelligence = {
            engagementLevel,
            churnRisk,
            conversionProbability,
            nextBestAction,
            shouldFollowUp: contact.shouldFollowUp(),
            interactionCount: contact.metadata.interactionCount,
            dataQuality: contact.metadata.dataQuality
          };

          return contactObj;
        })
      );

      const total = await Contact.countDocuments(query);

      res.json({
        success: true,
        contacts: enrichedContacts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        filters: { search, type, importance, company, tags, segment, urgency }
      });

    } catch (error) {
      console.error('❌ Error fetching contacts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch contacts',
        details: error.message
      });
    }
  }

  // Create new contact with intelligence
  async createContact(req, res) {
    try {
      const { userId = 'gaston' } = req.body;
      const contactData = { ...req.body, userId };

      // Enhance with AI insights
      if (contactData.name && contactData.company) {
        contactData.aiInsights = {
          sentiment: 'neutral',
          engagementLevel: 'medium',
          conversionProbability: 0.5
        };
      }

      const contact = await Contact.create(contactData);
      
      // Auto-link to existing data
      await this.autoLinkContact(contact);

      res.status(201).json({
        success: true,
        contact,
        message: 'Contact created successfully'
      });

    } catch (error) {
      console.error('❌ Error creating contact:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create contact',
        details: error.message
      });
    }
  }

  // Update contact with intelligence
  async updateContact(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const contact = await Contact.findByIdAndUpdate(
        id, 
        { 
          ...updateData,
          'metadata.lastModified': new Date()
        },
        { new: true, runValidators: true }
      );

      if (!contact) {
        return res.status(404).json({
          success: false,
          error: 'Contact not found'
        });
      }

      res.json({
        success: true,
        contact,
        message: 'Contact updated successfully'
      });

    } catch (error) {
      console.error('❌ Error updating contact:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update contact',
        details: error.message
      });
    }
  }

  // Get contact with full intelligence profile
  async getContactProfile(req, res) {
    try {
      const { id } = req.params;

      const contact = await Contact.findById(id)
        .populate('interactionHistory')
        .populate('associatedTasks')
        .populate('associatedProjects')
        .populate('associatedNotes');

      if (!contact) {
        return res.status(404).json({
          success: false,
          error: 'Contact not found'
        });
      }

      // Build intelligence profile
      const profile = contact.toObject();
      profile.intelligence = {
        engagementLevel: contact.calculateEngagement(),
        shouldFollowUp: contact.shouldFollowUp(),
        interactionCount: contact.metadata.interactionCount,
        dataQuality: contact.metadata.dataQuality,
        relationshipStrength: this.calculateRelationshipStrength(contact),
        communicationInsights: this.getCommmunicationInsights(contact),
        nextBestActions: this.getNextBestActions(contact)
      };

      res.json({
        success: true,
        profile
      });

    } catch (error) {
      console.error('❌ Error fetching contact profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch contact profile',
        details: error.message
      });
    }
  }

  // ===== TASKS MANAGEMENT =====

  // Get tasks with intelligent filtering and suggestions
  async getTasks(req, res) {
    try {
      const { 
        userId = 'gaston',
        status,
        priority,
        project,
        category,
        dueDate,
        overdue,
        limit = 50,
        page = 1
      } = req.query;

      let query = { userId, 'metadata.archived': false };
      
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (project) query.projectId = project;
      if (category) query.category = category;
      if (overdue === 'true') {
        query['scheduling.dueDate'] = { $lt: new Date() };
        query.status = { $nin: ['completed', 'cancelled'] };
      }
      if (dueDate) {
        const date = new Date(dueDate);
        query['scheduling.dueDate'] = {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999))
        };
      }

      const tasks = await Task.find(query)
        .populate('projectId', 'name priority status')
        .populate('relatedContacts', 'name company')
        .sort({ priority: -1, 'scheduling.dueDate': 1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      // Add intelligence insights
      const enrichedTasks = tasks.map(task => {
        const taskObj = task.toObject();
        taskObj.intelligence = {
          urgency: task.urgency,
          isOverdue: task.isOverdue,
          productivityScore: task.calculateProductivityScore(),
          optimalTime: task.suggestOptimalTime()
        };
        return taskObj;
      });

      const total = await Task.countDocuments(query);

      res.json({
        success: true,
        tasks: enrichedTasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tasks',
        details: error.message
      });
    }
  }

  // Create task with AI suggestions
  async createTask(req, res) {
    try {
      const { userId = 'gaston' } = req.body;
      const taskData = { ...req.body, userId };

      // AI-enhanced task creation
      if (taskData.title) {
        const suggestions = await this.getTaskSuggestions(taskData);
        taskData.aiInsights = suggestions;
      }

      const task = await Task.create(taskData);

      res.status(201).json({
        success: true,
        task,
        message: 'Task created successfully'
      });

    } catch (error) {
      console.error('❌ Error creating task:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create task',
        details: error.message
      });
    }
  }

  // Update task progress with intelligence
  async updateTaskProgress(req, res) {
    try {
      const { id } = req.params;
      const { progress, notes } = req.body;

      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }

      await task.updateProgress(progress, notes);

      res.json({
        success: true,
        task,
        message: 'Task progress updated successfully'
      });

    } catch (error) {
      console.error('❌ Error updating task progress:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update task progress',
        details: error.message
      });
    }
  }

  // ===== PROJECTS MANAGEMENT =====

  // Get projects with intelligence metrics
  async getProjects(req, res) {
    try {
      const { userId = 'gaston', status, priority, limit = 20, page = 1 } = req.query;

      let query = { userId, 'metadata.archived': false };
      if (status) query.status = status;
      if (priority) query.priority = priority;

      const projects = await Project.find(query)
        .populate('stakeholders.contactId', 'name company')
        .populate('relatedTasks', 'title status priority')
        .sort({ priority: -1, 'timeline.targetDate': 1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      // Add intelligence insights
      const enrichedProjects = await Promise.all(
        projects.map(async (project) => {
          const projectObj = project.toObject();
          projectObj.intelligence = {
            health: project.health,
            timelineStatus: project.calculateTimelineStatus(),
            completionPrediction: this.predictProjectCompletion(project),
            riskFactors: this.identifyProjectRisks(project)
          };
          return projectObj;
        })
      );

      const total = await Project.countDocuments(query);

      res.json({
        success: true,
        projects: enrichedProjects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch projects',
        details: error.message
      });
    }
  }

  // ===== INTELLIGENCE METHODS =====

  // Auto-link contact to existing data
  async autoLinkContact(contact) {
    try {
      // Find related tasks by name mentions
      const relatedTasks = await Task.find({
        userId: contact.userId,
        $or: [
          { title: { $regex: contact.name, $options: 'i' } },
          { description: { $regex: contact.name, $options: 'i' } }
        ]
      });

      if (relatedTasks.length > 0) {
        contact.associatedTasks = relatedTasks.map(task => task._id);
        await contact.save();
      }

      // Find related notes
      const relatedNotes = await Note.find({
        userId: contact.userId,
        $or: [
          { title: { $regex: contact.name, $options: 'i' } },
          { content: { $regex: contact.name, $options: 'i' } }
        ]
      });

      if (relatedNotes.length > 0) {
        contact.associatedNotes = relatedNotes.map(note => note._id);
        await contact.save();
      }

    } catch (error) {
      console.error('Error auto-linking contact:', error);
    }
  }

  // Calculate relationship strength
  calculateRelationshipStrength(contact) {
    let strength = 0;
    
    // Base score from importance
    const importanceScore = {
      'low': 1,
      'medium': 3,
      'high': 5,
      'critical': 7
    };
    strength += importanceScore[contact.relationships.importance] || 1;

    // Interaction frequency bonus
    if (contact.metadata.interactionCount > 10) strength += 2;
    if (contact.metadata.interactionCount > 50) strength += 3;

    // Recent contact bonus
    if (contact.relationships.lastContact) {
      const daysSince = Math.floor((Date.now() - contact.relationships.lastContact) / (1000 * 60 * 60 * 24));
      if (daysSince < 7) strength += 3;
      else if (daysSince < 30) strength += 1;
    }

    // Data completeness bonus
    if (contact.email) strength += 1;
    if (contact.phone) strength += 1;
    if (contact.company) strength += 1;

    return Math.min(strength, 10); // Cap at 10
  }

  // Get communication insights
  getCommmunicationInsights(contact) {
    return {
      preferredMethod: contact.preferences.preferredContactMethod,
      responsePattern: contact.patterns.responseTime,
      bestTimes: contact.preferences.bestContactTimes,
      communicationStyle: contact.preferences.communicationStyle
    };
  }

  // Get next best actions for contact
  getNextBestActions(contact) {
    const actions = [];

    if (contact.shouldFollowUp()) {
      actions.push({
        type: 'follow_up',
        priority: 'high',
        description: 'Schedule follow-up communication',
        reason: 'Based on communication frequency pattern'
      });
    }

    if (!contact.email && !contact.phone) {
      actions.push({
        type: 'complete_profile',
        priority: 'medium',
        description: 'Add contact information',
        reason: 'Missing primary contact methods'
      });
    }

    if (contact.relationships.importance === 'high' && contact.associatedTasks.length === 0) {
      actions.push({
        type: 'create_task',
        priority: 'medium',
        description: 'Create follow-up tasks',
        reason: 'High importance contact with no active tasks'
      });
    }

    return actions;
  }

  // Get AI suggestions for task creation
  async getTaskSuggestions(taskData) {
    // Simple heuristics - can be enhanced with ML
    const suggestions = {
      estimatedDuration: 2, // hours
      priority: 'medium',
      category: 'general'
    };

    // Keyword-based suggestions
    if (/meeting|call|discuss/i.test(taskData.title)) {
      suggestions.category = 'meeting';
      suggestions.estimatedDuration = 1;
    } else if (/code|develop|program|build/i.test(taskData.title)) {
      suggestions.category = 'development';
      suggestions.estimatedDuration = 4;
    } else if (/review|check|analyze/i.test(taskData.title)) {
      suggestions.category = 'review';
      suggestions.estimatedDuration = 1;
    }

    // Urgency keywords
    if (/urgent|asap|critical|emergency/i.test(taskData.title)) {
      suggestions.priority = 'high';
    }

    return suggestions;
  }

  // Predict project completion
  predictProjectCompletion(project) {
    const progress = project.progress.percentage;
    const targetDate = project.timeline.targetDate;
    
    if (!targetDate || progress === 0) {
      return { predictedDate: null, confidence: 0 };
    }

    // Simple linear projection
    const daysElapsed = Math.floor((Date.now() - project.timeline.startDate) / (1000 * 60 * 60 * 24));
    const totalDays = Math.floor((targetDate - project.timeline.startDate) / (1000 * 60 * 60 * 24));
    const expectedProgress = (daysElapsed / totalDays) * 100;
    
    const efficiency = progress / expectedProgress;
    const remainingWork = 100 - progress;
    const remainingDays = Math.ceil(remainingWork / (progress / daysElapsed));
    
    const predictedDate = new Date(Date.now() + remainingDays * 24 * 60 * 60 * 1000);
    const confidence = Math.min(efficiency, 1) * 0.8; // Cap confidence at 80%

    return { predictedDate, confidence };
  }

  // Identify project risks
  identifyProjectRisks(project) {
    const risks = [];

    // Timeline risk
    if (project.progress.timeline === 'behind' || project.progress.timeline === 'critical') {
      risks.push({
        type: 'timeline',
        severity: project.progress.timeline === 'critical' ? 'high' : 'medium',
        description: 'Project is behind schedule'
      });
    }

    // Budget risk (if applicable)
    if (project.budget && project.budget.spent > project.budget.allocated * 0.8) {
      risks.push({
        type: 'budget',
        severity: 'high',
        description: 'Budget utilization exceeds 80%'
      });
    }

    // Resource risk
    if (project.team && project.team.length < 2 && project.priority === 'high') {
      risks.push({
        type: 'resource',
        severity: 'medium',
        description: 'High priority project with limited team'
      });
    }

    return risks;
  }
}

module.exports = new CRMController();