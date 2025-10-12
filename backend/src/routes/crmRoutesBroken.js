
// ...existing code...

const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crmController');

// Obtener todas las notas asociadas a un contacto específico
router.get('/contacts/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const notes = await require('../models/Note').find({ relatedContacts: id, 'metadata.archived': false })
      .sort({ pinned: -1, 'metadata.lastModified': -1 });
    res.json({ success: true, notes });
  } catch (error) {
    console.error('❌ Error fetching notes for contact:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notes for contact', details: error.message });
  }
});

// Contact analytics summary
router.get('/contacts/analytics/summary', crmController.getContactAnalyticsSummary);


// ===== CONTACT ANALYTICS SUMMARY ROUTE =====
router.get('/contacts/analytics/summary', crmController.getContactAnalyticsSummary);
// ===== CONTACTS ROUTES =====

// Get all contacts with intelligent filtering
router.get('/contacts', crmController.getContacts);

// Create new contact
router.post('/contacts', crmController.createContact);

// Get specific contact with full intelligence profile
router.get('/contacts/:id', crmController.getContactProfile);

// Update contact
router.put('/contacts/:id', crmController.updateContact);

// Delete/Archive contact
router.delete('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { archive = true } = req.query;

    if (archive === 'true') {
      // Archive instead of delete
      const contact = await require('../models/Contact').findByIdAndUpdate(
        id,
        { 
          'metadata.isActive': false,
          'metadata.archivedAt': new Date()
        },
        { new: true }
      );

      if (!contact) {
        return res.status(404).json({
          success: false,
          error: 'Contact not found'
        });
      }

      res.json({
        success: true,
        message: 'Contact archived successfully',
        contact
      });
    } else {
      // Permanent delete
      const contact = await require('../models/Contact').findByIdAndDelete(id);
      
      if (!contact) {
        return res.status(404).json({
          success: false,
          error: 'Contact not found'
        });
      }

      res.json({
        success: true,
        message: 'Contact permanently deleted'
      });
    }

  } catch (error) {
    console.error('❌ Error deleting/archiving contact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete/archive contact',
      details: error.message
    });
  }
});

// Bulk operations for contacts
router.post('/contacts/bulk', async (req, res) => {
  try {
    const { action, contactIds, data } = req.body;

    let result;
    switch (action) {
      case 'archive':
        result = await require('../models/Contact').updateMany(
          { _id: { $in: contactIds } },
          { 
            'metadata.isActive': false,
            'metadata.archivedAt': new Date()
          }
        );
        break;

      case 'update_importance':
        result = await require('../models/Contact').updateMany(
          { _id: { $in: contactIds } },
          { 'relationships.importance': data.importance }
        );
        break;

      case 'add_tags':
        result = await require('../models/Contact').updateMany(
          { _id: { $in: contactIds } },
          { $addToSet: { tags: { $each: data.tags } } }
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid bulk action'
        });
    }

    res.json({
      success: true,
      message: `Bulk ${action} completed`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('❌ Error in bulk contact operation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform bulk operation',
      details: error.message
    });
  }
});

// Contact analytics and insights
router.get('/contacts/analytics/overview', async (req, res) => {
  try {
    const { userId = 'gaston', timeframe = '30d' } = req.query;
    
    const Contact = require('../models/Contact');
    
    // Calculate date range
    const days = parseInt(timeframe.replace('d', ''));
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Aggregate contact analytics
    const analytics = await Contact.aggregate([
      { $match: { userId, 'metadata.isActive': true } },
      {
        $group: {
          _id: null,
          totalContacts: { $sum: 1 },
          avgInteractions: { $avg: '$metadata.interactionCount' },
          byImportance: {
            $push: {
              importance: '$relationships.importance',
              count: 1
            }
          },
          byType: {
            $push: {
              type: '$relationships.type',
              count: 1
            }
          },
          recentlyActive: {
            $sum: {
              $cond: [
                { $gte: ['$relationships.lastContact', startDate] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Get follow-up needed contacts
    const followUpNeeded = await Contact.countDocuments({
      userId,
      'metadata.isActive': true,
      'relationships.lastContact': { $lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      'relationships.importance': { $in: ['high', 'critical'] }
    });

    res.json({
      success: true,
      analytics: analytics[0] || {},
      insights: {
        followUpNeeded,
        engagementRate: analytics[0] ? (analytics[0].recentlyActive / analytics[0].totalContacts * 100).toFixed(1) : 0
      }
    });

  } catch (error) {
    console.error('❌ Error fetching contact analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact analytics',
      details: error.message
    });
  }
});

// ===== TASKS ROUTES =====

// Get all tasks with intelligent filtering
router.get('/tasks', crmController.getTasks);

// Create new task
router.post('/tasks', crmController.createTask);

// Get specific task with intelligence
router.get('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await require('../models/Task').findById(id)
      .populate('projectId', 'name priority status')
      .populate('relatedContacts', 'name company email')
      .populate('dependencies', 'title status')
      .populate('subtasks', 'title status progress');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Add intelligence insights
    const taskObj = task.toObject();
    taskObj.intelligence = {
      urgency: task.urgency,
      isOverdue: task.isOverdue,
      productivityScore: task.calculateProductivityScore(),
      optimalTime: task.suggestOptimalTime(),
      blockers: task.identifyBlockers(),
      suggestions: task.getSuggestions()
    };

    res.json({
      success: true,
      task: taskObj
    });

  } catch (error) {
    console.error('❌ Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task',
      details: error.message
    });
  }
});

// Update task
router.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const task = await require('../models/Task').findByIdAndUpdate(
      id,
      {
        ...updateData,
        'metadata.lastActivity': new Date()
      },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      task,
      message: 'Task updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task',
      details: error.message
    });
  }
});

// Update task progress (special endpoint)
router.patch('/tasks/:id/progress', crmController.updateTaskProgress);

// Complete task
router.patch('/tasks/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const task = await require('../models/Task').findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    await task.markAsCompleted(notes);

    res.json({
      success: true,
      task,
      message: 'Task completed successfully'
    });

  } catch (error) {
    console.error('❌ Error completing task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete task',
      details: error.message
    });
  }
});

// Task analytics
router.get('/tasks/analytics/productivity', async (req, res) => {
  try {
    const { userId = 'gaston', timeframe = '30d' } = req.query;
    
    const days = parseInt(timeframe.replace('d', ''));
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const Task = require('../models/Task');
    
    const analytics = await Task.aggregate([
      { 
        $match: { 
          userId,
          'metadata.created': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$scheduling.dueDate', new Date()] },
                    { $ne: ['$status', 'completed'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          avgCompletionTime: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'completed'] },
                {
                  $subtract: [
                    '$scheduling.completedDate',
                    '$metadata.created'
                  ]
                },
                null
              ]
            }
          },
          byPriority: {
            $push: '$priority'
          },
          byCategory: {
            $push: '$category'
          }
        }
      }
    ]);

    const result = analytics[0] || {};
    const completionRate = result.totalTasks > 0 
      ? (result.completedTasks / result.totalTasks * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      analytics: {
        ...result,
        completionRate: parseFloat(completionRate),
        avgCompletionDays: result.avgCompletionTime 
          ? Math.round(result.avgCompletionTime / (1000 * 60 * 60 * 24))
          : 0
      }
    });

  } catch (error) {
    console.error('❌ Error fetching task analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task analytics',
      details: error.message
    });
  }
});

// ===== PROJECTS ROUTES =====

// Get all projects
router.get('/projects', crmController.getProjects);

// Create new project
router.post('/projects', async (req, res) => {
  try {
    const { userId = 'gaston' } = req.body;
    const projectData = { ...req.body, userId };

    const project = await require('../models/Project').create(projectData);

    res.status(201).json({
      success: true,
      project,
      message: 'Project created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create project',
      details: error.message
    });
  }
});

// Get specific project with full details
router.get('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await require('../models/Project').findById(id)
      .populate('stakeholders.contactId', 'name company email')
      .populate('relatedTasks', 'title status priority scheduling')
      .populate('relatedNotes', 'title type tags');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Add intelligence insights
    const projectObj = project.toObject();
    projectObj.intelligence = {
      health: project.health,
      timelineStatus: project.calculateTimelineStatus(),
      completionPrediction: project.predictCompletion(),
      riskFactors: project.identifyRisks(),
      teamPerformance: project.analyzeTeamPerformance(),
      nextMilestones: project.getNextMilestones()
    };

    res.json({
      success: true,
      project: projectObj
    });

  } catch (error) {
    console.error('❌ Error fetching project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project',
      details: error.message
    });
  }
});

// Update project
router.put('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const project = await require('../models/Project').findByIdAndUpdate(
      id,
      {
        ...updateData,
        'metadata.lastModified': new Date()
      },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      project,
      message: 'Project updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update project',
      details: error.message
    });
  }
});

// Project analytics and insights
router.get('/projects/analytics/overview', async (req, res) => {
  try {
    const { userId = 'gaston' } = req.query;
    
    const Project = require('../models/Project');
    
    const analytics = await Project.aggregate([
      { 
        $match: { 
          userId,
          'metadata.archived': false
        }
      },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          activeProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
          },
          completedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          avgProgress: { $avg: '$progress.percentage' },
          atRiskProjects: {
            $sum: { $cond: [{ $eq: ['$health', 'at-risk'] }, 1, 0] }
          },
          criticalProjects: {
            $sum: { $cond: [{ $eq: ['$health', 'critical'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: analytics[0] || {}
    });

  } catch (error) {
    console.error('❌ Error fetching project analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project analytics',
      details: error.message
    });
  }
});

// ===== NOTES ROUTES =====

// Get all notes with filtering
router.get('/notes', async (req, res) => {
  try {
    const { 
      userId = 'gaston',
      search,
      type,
      category,
      tags,
      folder,
      limit = 50,
      page = 1
    } = req.query;

    let query = { userId, 'metadata.archived': false };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (folder) query.folder = folder;
    if (tags) query.tags = { $in: tags.split(',') };

    const notes = await require('../models/Note').find(query)
      .sort({ pinned: -1, 'metadata.lastModified': -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await require('../models/Note').countDocuments(query);

    res.json({
      success: true,
      notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching notes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notes',
      details: error.message
    });
  }
});

// Create new note
router.post('/notes', async (req, res) => {
  try {
    const { userId = 'gaston' } = req.body;
    const noteData = { ...req.body, userId };

    // Extract AI insights from content
    if (noteData.content) {
      const intelligenceService = require('../services/intelligenceService');
      noteData.aiExtractedData = intelligenceService.extractNoteIntelligence(noteData.content);
    }

    const note = await require('../models/Note').create(noteData);

    res.status(201).json({
      success: true,
      note,
      message: 'Note created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating note:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create note',
      details: error.message
    });
  }
});

// Get specific note
router.get('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const note = await require('../models/Note').findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    res.json({
      success: true,
      note
    });

  } catch (error) {
    console.error('❌ Error fetching note:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch note',
      details: error.message
    });
  }
});

// Update note
router.put('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Re-extract AI insights if content changed
    if (updateData.content) {
      const intelligenceService = require('../services/intelligenceService');
      updateData.aiExtractedData = intelligenceService.extractNoteIntelligence(updateData.content);
    }

    const note = await require('../models/Note').findByIdAndUpdate(
      id,
      {
        ...updateData,
        'metadata.lastModified': new Date()
      },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    res.json({
      success: true,
      note,
      message: 'Note updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating note:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update note',
      details: error.message
    });
  }
});

// ===== ANALYTICS AND INSIGHTS ROUTES =====

// Get comprehensive analytics dashboard
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const { userId = 'gaston', timeframe = '30d' } = req.query;
    
    const days = parseInt(timeframe.replace('d', ''));
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Run parallel queries for different metrics
    const [contactStats, taskStats, projectStats, noteStats] = await Promise.all([
      // Contact statistics
      require('../models/Contact').aggregate([
        { $match: { userId, 'metadata.isActive': true } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            highImportance: {
              $sum: { $cond: [{ $eq: ['$relationships.importance', 'high'] }, 1, 0] }
            },
            recentActivity: {
              $sum: {
                $cond: [
                  { $gte: ['$relationships.lastContact', startDate] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),

      // Task statistics
      require('../models/Task').aggregate([
        { $match: { userId, 'metadata.archived': false } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            overdue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $lt: ['$scheduling.dueDate', new Date()] },
                      { $ne: ['$status', 'completed'] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            highPriority: {
              $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
            }
          }
        }
      ]),

      // Project statistics
      require('../models/Project').aggregate([
        { $match: { userId, 'metadata.archived': false } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
            },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            atRisk: {
              $sum: { $cond: [{ $eq: ['$health', 'at-risk'] }, 1, 0] }
            }
          }
        }
      ]),

      // Note statistics
      require('../models/Note').aggregate([
        { $match: { userId, 'metadata.archived': false } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            recentNotes: {
              $sum: {
                $cond: [
                  { $gte: ['$metadata.created', startDate] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ])
    ]);

    const dashboard = {
      timeframe,
      contacts: contactStats[0] || { total: 0, highImportance: 0, recentActivity: 0 },
      tasks: taskStats[0] || { total: 0, completed: 0, overdue: 0, highPriority: 0 },
      projects: projectStats[0] || { total: 0, active: 0, completed: 0, atRisk: 0 },
      notes: noteStats[0] || { total: 0, recentNotes: 0 },
      insights: {
        productivityScore: taskStats[0] 
          ? Math.round((taskStats[0].completed / taskStats[0].total) * 100)
          : 0,
        engagementRate: contactStats[0]
          ? Math.round((contactStats[0].recentActivity / contactStats[0].total) * 100)
          : 0,
        projectHealthScore: projectStats[0]
          ? Math.round(((projectStats[0].total - projectStats[0].atRisk) / projectStats[0].total) * 100)
          : 100
      }
    };

    res.json({
      success: true,
      dashboard
    });

  } catch (error) {
    console.error('❌ Error fetching dashboard analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard analytics',
      details: error.message
    });
  }
});

// Search across all entities with intelligence
router.get('/search', async (req, res) => {
  try {
    const { q: query, userId = 'gaston', type, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    const searchRegex = { $regex: query, $options: 'i' };
    const results = {};

    // Search contacts
    if (!type || type === 'contacts') {
      results.contacts = await require('../models/Contact').find({
        userId,
        'metadata.isActive': true,
        $or: [
          { name: searchRegex },
          { company: searchRegex },
          { email: searchRegex },
          { tags: searchRegex }
        ]
      })
      .select('name company email relationships.importance')
      .limit(parseInt(limit) / 4)
      .sort({ 'relationships.importance': -1 });
    }

    // Search tasks
    if (!type || type === 'tasks') {
      results.tasks = await require('../models/Task').find({
        userId,
        'metadata.archived': false,
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { tags: searchRegex }
        ]
      })
      .select('title status priority scheduling.dueDate')
      .populate('projectId', 'name')
      .limit(parseInt(limit) / 4)
      .sort({ priority: -1, 'scheduling.dueDate': 1 });
    }

    // Search projects
    if (!type || type === 'projects') {
      results.projects = await require('../models/Project').find({
        userId,
        'metadata.archived': false,
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { tags: searchRegex }
        ]
      })
      .select('name status priority progress.percentage')
      .limit(parseInt(limit) / 4)
      .sort({ priority: -1 });
    }

    // Search notes
    if (!type || type === 'notes') {
      results.notes = await require('../models/Note').find({
        userId,
        'metadata.archived': false,
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { tags: searchRegex }
        ]
      })
      .select('title type category metadata.lastModified')
      .limit(parseInt(limit) / 4)
      .sort({ 'metadata.lastModified': -1 });
    }

    // Calculate total results
    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

    res.json({
      success: true,
      query,
      totalResults,
      results
    });

  } catch (error) {
    console.error('❌ Error performing search:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform search',
      details: error.message
    });
  }
});

module.exports = router;