const User = require('../models/User');
const Contact = require('../models/Contact');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Note = require('../models/Note');
const Conversation = require('../models/Conversation');

class IntelligenceService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Main intelligence engine - builds smart context for Eva
  async buildIntelligentContext(message, userId) {
    console.log('🧠 Building intelligent context for:', message.substring(0, 50) + '...');

    try {
      // 1. Extract entities and intent from message
      const analysis = await this.analyzeMessage(message);
      console.log('📊 Message analysis:', analysis);

      // 2. Load relevant data based on analysis
      const contextData = await this.loadRelevantData(userId, analysis);
      console.log('📋 Context data loaded:', {
        contacts: contextData.contacts.length,
        tasks: contextData.tasks.length,
        projects: contextData.projects.length,
        notes: contextData.notes.length
      });

      // 3. Build compact, intelligent context
      const smartContext = this.buildCompactContext(contextData, analysis);

      // 4. Add user preferences and patterns
      const userProfile = await this.getUserProfile(userId);
      smartContext.userProfile = {
        preferences: userProfile.profile.preferences,
        workPatterns: userProfile.profile.workPatterns,
        currentTime: this.getCurrentTimeContext(userProfile.profile.preferences.timezone)
      };

      return {
        analysis,
        contextData,
        smartContext,
        relevanceScore: this.calculateRelevanceScore(contextData, analysis)
      };

    } catch (error) {
      console.error('❌ Error building intelligent context:', error);
      return this.getFallbackContext(userId);
    }
  }

  // Advanced message analysis with AI intent detection
  analyzeMessage(message) {
    const analysis = {
      intent: 'information',
      entities: {
        contacts: {},
        tasks: {},
        projects: {},
        dates: {},
        locations: {},
        keywords: {}
      },
      urgency: 'medium',
      sentiment: 'neutral',
      complexity: 'medium',
      actionRequired: false
    };

    // Intent detection patterns
    const intentPatterns = {
      'task_creation': /(?:create|add|new|make|schedule|agendar|crear).*(?:task|todo|reminder|tarea|recordatorio)/i,
      'contact_lookup': /(?:find|show|get|who is|contact|call|email|encontrar|buscar|llamar)/i,
      'project_status': /(?:status|progress|update|how.*going|estado|progreso|actualizar)/i,
      'scheduling': /(?:when|schedule|calendar|meeting|appointment|cuándo|agendar|reunión|cita)/i,
      'data_retrieval': /(?:show|list|find|search|get|what|where|mostrar|listar|buscar|qué|dónde)/i,
      'planning': /(?:plan|organize|prepare|strategy|planear|organizar|preparar|estrategia)/i,
      'question': /\?|what|how|when|where|why|who|qué|cómo|cuándo|dónde|por qué|quién/i,
      'command': /(?:create|delete|update|remove|add|send|call|crear|eliminar|actualizar|enviar|llamar)/i,
      'greeting': /(?:hello|hi|hola|hey|good morning|good afternoon|good evening|buenos días|buenas tardes|buenas noches)/i
    };

    // Detect intent
    for (const [intent, pattern] of Object.entries(intentPatterns)) {
      if (pattern.test(message)) {
        analysis.intent = intent;
        break;
      }
    }

    // Extract entities using enhanced methods
    try {
      analysis.entities.contacts = this.extractContactNames(message);
      analysis.entities.tasks = this.extractTaskReferences(message);
      analysis.entities.projects = this.extractProjectReferences(message);
      analysis.entities.dates = this.extractDatesAndTimes(message);
      analysis.entities.locations = this.extractLocations(message);
      analysis.entities.keywords = this.extractKeywords(message);
    } catch (error) {
      console.warn('⚠️ Entity extraction error:', error.message);
      // Provide safe defaults
      analysis.entities = {
        contacts: { names: [], emails: [], phones: [], companies: [] },
        tasks: { actions: [], taskWords: [], urgencyIndicators: [], deadlines: [] },
        projects: { projectWords: [], projectNames: [], codeNames: [], phases: [] },
        dates: { days: [], relative: [], times: [], specificDates: [] },
        locations: { offices: [], cities: [], countries: [], addresses: [], virtual: [] },
        keywords: { business: [], actions: [], priorities: [], technology: [] }
      };
    }

    // Detect urgency
    const urgencyPatterns = {
      'critical': /(?:urgent|emergency|asap|immediately|critical|now|urgente|emergencia|inmediatamente|crítico|ahora)/i,
      'high': /(?:important|priority|soon|today|importante|prioridad|pronto|hoy)/i,
      'low': /(?:later|sometime|when.*time|eventually|después|algún momento|cuando.*tiempo|eventualmente)/i
    };

    for (const [level, pattern] of Object.entries(urgencyPatterns)) {
      if (pattern.test(message)) {
        analysis.urgency = level;
        break;
      }
    }

    // Detect if action is required
    analysis.actionRequired = /(?:create|add|schedule|remind|call|send|update|delete|crear|agregar|agendar|recordar|llamar|enviar|actualizar|eliminar)/i.test(message);

    // Complexity based on length and entities
    const entityCount = Object.values(analysis.entities).reduce((count, entityGroup) => {
      if (typeof entityGroup === 'object' && entityGroup !== null) {
        return count + Object.values(entityGroup).flat().length;
      }
      return count;
    }, 0);

    if (message.length > 200 || entityCount > 5) {
      analysis.complexity = 'complex';
    } else if (message.length < 50 && entityCount < 2) {
      analysis.complexity = 'simple';
    }

    console.log('🧠 Analysis result:', {
      intent: analysis.intent,
      urgency: analysis.urgency,
      entityCount: entityCount,
      actionRequired: analysis.actionRequired
    });

    return analysis;
  }

  // Load relevant data based on message analysis
  async loadRelevantData(userId, analysis) {
    const cacheKey = `context_${userId}_${JSON.stringify(analysis.entities)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('📚 Using cached context data');
        return cached.data;
      }
    }

    const contextData = {
      contacts: [],
      tasks: [],
      projects: [],
      notes: [],
      recentConversations: []
    };

    try {
      // Load contacts (prioritize by importance and recent interaction)
      contextData.contacts = await Contact.find({
        userId,
        $or: [
          { name: { $in: analysis.entities.contacts } },
          { 'relationships.importance': 'high' },
          { 'relationships.lastContact': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Last 7 days
        ]
      })
      .sort({ 'relationships.importance': -1, 'relationships.lastContact': -1 })
      .limit(10);

      // Load tasks (prioritize by urgency, due date, and relevance)
      const taskQuery = {
        userId,
        'metadata.archived': false
      };

      // Add specific task filters based on intent
      if (analysis.intent === 'task_creation' || analysis.intent === 'scheduling') {
        taskQuery.status = { $in: ['pending', 'in-progress'] };
      }

      contextData.tasks = await Task.find(taskQuery)
        .populate('projectId', 'name priority')
        .populate('relatedContacts', 'name')
        .sort({ 
          priority: -1, 
          'scheduling.dueDate': 1,
          'metadata.lastActivity': -1 
        })
        .limit(15);

      // Load projects (active and high priority)
      contextData.projects = await Project.find({
        userId,
        status: { $in: ['planning', 'in-progress'] },
        'metadata.archived': false
      })
      .populate('stakeholders.contactId', 'name')
      .sort({ priority: -1, 'timeline.targetDate': 1 })
      .limit(8);

      // Load relevant notes
      if (analysis.entities.keywords.length > 0) {
        contextData.notes = await Note.find({
          userId,
          $or: [
            { tags: { $in: analysis.entities.keywords } },
            { title: { $regex: analysis.entities.keywords.join('|'), $options: 'i' } },
            { 'aiExtractedData.keyTopics': { $in: analysis.entities.keywords } }
          ],
          'metadata.archived': false
        })
        .sort({ pinned: -1, 'metadata.lastModified': -1 })
        .limit(5);
      }

      // Load recent conversations for context
      contextData.recentConversations = await Conversation.find({
        userId,
        role: { $in: ['user', 'assistant'] }
      })
      .sort({ 'metadata.timestamp': -1 })
      .limit(5);

      // Cache the results
      this.cache.set(cacheKey, {
        data: contextData,
        timestamp: Date.now()
      });

      return contextData;

    } catch (error) {
      console.error('❌ Error loading relevant data:', error);
      return contextData; // Return empty structure on error
    }
  }

  // Build compact context for AI consumption
  buildCompactContext(contextData, analysis) {
    const context = {
      intent: analysis.intent,
      urgency: analysis.urgency,
      relevantContacts: [],
      activeTasks: [],
      currentProjects: [],
      keyNotes: [],
      recentContext: []
    };

    // Process contacts
    context.relevantContacts = contextData.contacts.map(contact => ({
      name: contact.name,
      company: contact.company,
      relationship: contact.relationships.type,
      importance: contact.relationships.importance,
      lastContact: contact.relationships.lastContact,
      preferredContact: contact.preferences.preferredContactMethod
    })).slice(0, 5);

    // Process tasks
    context.activeTasks = contextData.tasks.map(task => ({
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.scheduling.dueDate,
      project: task.projectId?.name,
      progress: task.progress.percentage,
      isOverdue: task.isOverdue
    })).slice(0, 8);

    // Process projects
    context.currentProjects = contextData.projects.map(project => ({
      name: project.name,
      status: project.status,
      priority: project.priority,
      progress: project.progress.percentage,
      targetDate: project.timeline.targetDate,
      health: project.health
    })).slice(0, 5);

    // Process notes
    context.keyNotes = contextData.notes.map(note => ({
      title: note.title,
      type: note.type,
      tags: note.tags,
      keyTopics: note.aiExtractedData?.keyTopics || [],
      lastModified: note.metadata.lastModified
    })).slice(0, 3);

    // Add recent conversation context
    context.recentContext = contextData.recentConversations.map(conv => ({
      message: conv.message.substring(0, 100),
      intent: conv.context.intent,
      timestamp: conv.metadata.timestamp
    })).slice(0, 3);

    return context;
  }

  // Get user profile with intelligent defaults
  async getUserProfile(userId) {
    let user = await User.findOne({ userId });
    
    if (!user) {
      // Create default user profile
      user = await User.create({
        userId,
        profile: {
          name: 'Gaston',
          preferences: {
            workingHours: { start: '09:00', end: '17:00' },
            timezone: 'America/Argentina/Buenos_Aires',
            priorities: ['work', 'personal', 'learning'],
            communicationStyle: 'direct'
          },
          workPatterns: {
            productiveTimes: ['09:00-11:00', '14:00-16:00'],
            focusAreas: ['development', 'planning', 'meetings']
          }
        }
      });
      console.log('✅ Created default user profile for', userId);
    }

    return user;
  }

  // Get current time context
  getCurrentTimeContext(timezone = 'UTC') {
    const now = new Date();
    const hour = now.getHours();
    
    let timeOfDay = 'day';
    let greeting = 'Hello';
    
    if (hour < 12) {
      timeOfDay = 'morning';
      greeting = 'Good morning';
    } else if (hour < 17) {
      timeOfDay = 'afternoon';
      greeting = 'Good afternoon';
    } else {
      timeOfDay = 'evening';
      greeting = 'Good evening';
    }

    return {
      currentTime: now.toISOString(),
      timeOfDay,
      greeting,
      hour,
      timezone
    };
  }

  // Calculate how relevant the loaded context is
  calculateRelevanceScore(contextData, analysis) {
    let score = 0;
    let factors = 0;

    // Entity matches
    if (analysis.entities.contacts.length > 0 && contextData.contacts.length > 0) {
      score += 0.3;
      factors++;
    }

    if (analysis.entities.tasks.length > 0 && contextData.tasks.length > 0) {
      score += 0.3;
      factors++;
    }

    if (analysis.entities.keywords.length > 0 && contextData.notes.length > 0) {
      score += 0.2;
      factors++;
    }

    // Recent activity
    if (contextData.recentConversations.length > 0) {
      score += 0.2;
      factors++;
    }

    return factors > 0 ? score : 0.1; // Minimum score
  }

  // Fallback context when errors occur
  async getFallbackContext(userId) {
    return {
      analysis: {
        intent: 'information',
        urgency: 'medium',
        entities: { contacts: [], tasks: [], projects: [], dates: [], keywords: [] }
      },
      contextData: { contacts: [], tasks: [], projects: [], notes: [], recentConversations: [] },
      smartContext: {
        intent: 'information',
        relevantContacts: [],
        activeTasks: [],
        currentProjects: [],
        userProfile: {
          preferences: { communicationStyle: 'direct' },
          currentTime: this.getCurrentTimeContext()
        }
      },
      relevanceScore: 0.1
    };
  }

  // Entity extraction methods
  // Enhanced contact name detection
extractContactNames(message) {
  const patterns = {
    // Name patterns: "Carlos Perez", "Dr. Smith", "Maria Elena"
    names: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g,
    // Email patterns
    emails: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    // Phone patterns
    phones: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
    // Company names with indicators
    companies: /\b(?:empresa|company|corp|inc|ltd|llc|sa|srl)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi
  };

  const extracted = {
    names: [...(message.match(patterns.names) || [])],
    emails: [...(message.match(patterns.emails) || [])],
    phones: [...(message.match(patterns.phones) || [])],
    companies: [...(message.match(patterns.companies) || [])]
  };

  console.log('📇 Extracted contacts:', extracted);
  return extracted;
}

// Enhanced date/time extraction
extractDatesAndTimes(message) {
  const patterns = {
    // Spanish dates: "el martes", "mañana", "la próxima semana"
    spanishDays: /\b(?:el\s+)?(lunes|martes|miércoles|jueves|viernes|sábado|domingo)\b/gi,
    spanishRelative: /\b(mañana|pasado\s+mañana|hoy|ayer|la\s+próxima\s+semana|el\s+próximo\s+mes)\b/gi,
    // English dates
    englishDays: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
    englishRelative: /\b(tomorrow|today|yesterday|next\s+week|next\s+month)\b/gi,
    // Times: "3 PM", "15:30", "a las 3"
    times: /\b(?:a\s+las\s+)?(\d{1,2})(?::(\d{2}))?\s*(?:(am|pm|AM|PM))?\b/g,
    // Specific dates: "December 25", "25 de diciembre"
    specificDates: /\b(\d{1,2})\s+(?:de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|january|february|march|april|may|june|july|august|september|october|november|december)\b/gi
  };

  const extracted = {
    days: [
      ...(message.match(patterns.spanishDays) || []),
      ...(message.match(patterns.englishDays) || [])
    ],
    relative: [
      ...(message.match(patterns.spanishRelative) || []),
      ...(message.match(patterns.englishRelative) || [])
    ],
    times: [...(message.match(patterns.times) || [])],
    specificDates: [...(message.match(patterns.specificDates) || [])]
  };

  console.log('📅 Extracted dates/times:', extracted);
  return extracted;
}

// Enhanced task detection
extractTaskReferences(message) {
  const patterns = {
    // Action verbs in Spanish/English
    actions: /\b(crear|hacer|completar|terminar|agendar|programar|llamar|enviar|create|make|complete|schedule|call|send|remind|follow\s+up)\b/gi,
    // Task indicators
    taskWords: /\b(tarea|task|proyecto|project|reunión|meeting|cita|appointment|deadline|fecha\s+límite)\b/gi,
    // Urgency indicators
    urgency: /\b(urgente|importante|asap|immediately|priority|prioridad|critical|crítico)\b/gi,
    // Deadlines
    deadlines: /\b(?:para|for|by|antes\s+del|before)\s+([^.!?]+)/gi
  };

  const extracted = {
    actions: [...(message.match(patterns.actions) || [])],
    taskWords: [...(message.match(patterns.taskWords) || [])],
    urgencyIndicators: [...(message.match(patterns.urgency) || [])],
    deadlines: [...(message.match(patterns.deadlines) || [])]
  };

  console.log('✅ Extracted tasks:', extracted);
  return extracted;
}

// Enhanced project reference extraction
extractProjectReferences(message) {
  const patterns = {
    // Project keywords in Spanish/English
    projectWords: /\b(proyecto|project|campaign|campaña|initiative|iniciativa|program|programa)\b/gi,
    // Project names with common patterns
    projectNames: /\b(?:proyecto|project)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi,
    // Code names or specific project identifiers
    codeNames: /\b(?:project|proyecto)\s+([A-Z]+\d*|[A-Z][a-z]+\d+)\b/gi,
    // Phase indicators
    phases: /\b(?:phase|fase|stage|etapa)\s+(\d+|[A-Z]+)\b/gi
  };

  const extracted = [
    ...(message.match(patterns.projectNames) || []).map(match => match.split(/\s+/).slice(1).join(' ')),
    ...(message.match(patterns.codeNames) || []).map(match => match.split(/\s+/).slice(1).join(' ')),
    ...(message.match(/\b(Alpha|Beta|Gamma|Delta|Omega|Project\s+[A-Z]\w+)\b/gi) || [])
  ];

  console.log('📊 Extracted projects:', extracted);
  return extracted;
}

// Enhanced location extraction
extractLocations(message) {
  const patterns = {
    // Office locations
    offices: /\b(?:office|oficina|headquarters|sede|building|edificio)\s+([A-Z0-9]+)/gi,
    // Cities (common ones)
    cities: /\b(Madrid|Barcelona|Valencia|Sevilla|Bilbao|New York|Los Angeles|Chicago|Miami|Mexico City|Guadalajara|Monterrey)\b/gi,
    // Countries
    countries: /\b(España|Spain|México|Mexico|Estados Unidos|United States|USA|Argentina|Colombia|Chile|Peru)\b/gi,
    // Virtual locations
    virtual: /\b(zoom|teams|meet|skype|online|virtual|en línea|virtual)\b/gi
  };

  const extracted = [
    ...(message.match(patterns.offices) || []),
    ...(message.match(patterns.cities) || []),
    ...(message.match(patterns.countries) || []),
    ...(message.match(patterns.virtual) || [])
  ];

  console.log('📍 Extracted locations:', extracted);
  return extracted;
}

// Enhanced keyword extraction
extractKeywords(message) {
  const patterns = {
    // Business keywords
    business: /\b(meeting|reunión|proposal|propuesta|contract|contrato|budget|presupuesto|deadline|fecha límite|revenue|ingresos|client|cliente|vendor|proveedor)\b/gi,
    // Action keywords
    actions: /\b(review|revisar|approve|aprobar|reject|rechazar|schedule|programar|cancel|cancelar|postpone|posponer|confirm|confirmar)\b/gi,
    // Priority keywords
    priorities: /\b(urgent|urgente|important|importante|critical|crítico|optional|opcional|nice to have|sería bueno tener)\b/gi,
    // Technology keywords
    technology: /\b(software|hardware|API|database|base de datos|server|servidor|cloud|nube|mobile|móvil|web|website|app|application)\b/gi
  };

  const extracted = [
    ...(message.match(patterns.business) || []),
    ...(message.match(patterns.actions) || []),
    ...(message.match(patterns.priorities) || []),
    ...(message.match(patterns.technology) || [])
  ];

  console.log('🔍 Extracted keywords:', extracted);
  return extracted;
}

// 🚀 NEW: Enhanced Smart Action Execution System
async executeSmartActions(enhancedEntities, dataLinks, userId, message) { // ✅ ADD message parameter
  console.log('🤖 Executing smart actions for user:', userId);
  const executedActions = [];
  
  try {
    const Contact = require('../models/Contact');
    const Task = require('../models/Task');
    const Project = require('../models/Project');

    // 1. 🧑‍💼 AUTO-CREATE CONTACTS for detected people
    if (enhancedEntities.contacts.names?.length > 0) {
      for (const name of enhancedEntities.contacts.names) {
        // Check if contact already exists
        const existingContact = await Contact.findOne({ 
          userId, 
          name: { $regex: name.trim(), $options: 'i' }
        });
        
        if (!existingContact) {
          // Find matching email for this contact (simple heuristic)
          const matchingEmail = enhancedEntities.contacts.emails?.find(email => 
            // If only one email, assume it belongs to the first person mentioned
            enhancedEntities.contacts.names.length === 1 || 
            // Or if email contains similar name parts
            email.toLowerCase().includes(name.split(' ')[0].toLowerCase())
          );
          
          const newContact = await Contact.create({
            userId,
            name: name.trim(),
            email: matchingEmail || '',
            company: enhancedEntities.contacts.companies?.[0] || '',
            source: 'conversation',
            relationships: {
              type: 'professional',
              importance: 'medium',
              lastContact: new Date()
            },
            metadata: {
              extractedFrom: 'conversation',
              confidence: 0.8,
              createdAutomatically: true,
              source: 'extracted',
              createdAt: new Date()
            }
          });
          
          executedActions.push({
            type: 'contact_created',
            contactId: newContact._id,
            name: newContact.name,
            email: newContact.email,
            success: true,
            details: `Auto-created contact: ${newContact.name}`
          });
          
          console.log(`✅ Auto-created contact: ${newContact.name}`);
        } else {
          executedActions.push({
            type: 'contact_found',
            contactId: existingContact._id,
            name: existingContact.name,
            success: true,
            details: `Found existing contact: ${existingContact.name}`
          });
        }
      }
    }
    
    // 2. ✅ AUTO-CREATE TASKS from detected actions
    if (enhancedEntities.tasks.actions?.length > 0) {
      for (const action of enhancedEntities.tasks.actions) {
        // Determine priority based on urgency indicators
        let priority = 'medium';
        if (enhancedEntities.tasks.urgencyIndicators?.some(indicator => 
          /urgent|critical|asap|immediately/i.test(indicator))) {
          priority = 'high';
        }
        
        // Create task title from action
        const taskTitle = `${action.charAt(0).toUpperCase() + action.slice(1)}`;
        
        // Associate with project if detected
        let projectId = null;
        if (enhancedEntities.projects?.length > 0) {
          const project = await Project.findOne({ 
            userId, 
            name: { $regex: enhancedEntities.projects[0], $options: 'i' }
          });
          if (project) projectId = project._id;
        }
        
        const newTask = await Task.create({
          userId,
          title: taskTitle,
          description: `Auto-created from conversation`,
          status: 'pending',
          priority: priority,
          category: 'conversation',
          projectId: projectId,
          scheduling: {
            estimatedDuration: 1,
            dueDate: enhancedEntities.dates.days?.length > 0 ? 
              this.parseRelativeDate(enhancedEntities.dates.days[0]) : null
          },
          metadata: {
            source: 'extracted',
            extractedFrom: {
              type: 'conversation',
              confidence: 0.7,
              originalText: message || 'No message available', // ✅ FIXED: Use message parameter with fallback
              createdAutomatically: true,
              originalAction: action
            },
            lastActivity: new Date(),
            activityCount: 1
          }
        });
        
        executedActions.push({
          type: 'task_created',
          taskId: newTask._id,
          title: newTask.title,
          priority: newTask.priority,
          success: true,
          details: `Auto-created task: ${newTask.title} (${priority} priority)`
        });
        
        console.log(`✅ Auto-created task: ${newTask.title}`);
      }
    }
    
    // 3. 📋 AUTO-CREATE OR ASSOCIATE PROJECTS
    if (enhancedEntities.projects?.length > 0) {
      for (const projectName of enhancedEntities.projects) {
        let project = await Project.findOne({ 
          userId, 
          name: { $regex: projectName.trim(), $options: 'i' }
        });
        
        if (!project) {
          // Create new project
          project = await Project.create({
            userId,
            name: projectName.trim(),
            description: `Auto-created from conversation`,
            status: 'planning',
            priority: 'medium',
            timeline: {
              startDate: new Date(),
              targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            },
            progress: {
              percentage: 0,
              milestones: []
            },
            metadata: {
              extractedFrom: 'conversation',
              confidence: 0.6,
              createdAutomatically: true,
              createdAt: new Date()
            }
          });
          
          executedActions.push({
            type: 'project_created',
            projectId: project._id,
            name: project.name,
            success: true,
            details: `Auto-created project: ${project.name}`
          });
          
          console.log(`✅ Auto-created project: ${project.name}`);
        } else {
          executedActions.push({
            type: 'project_found',
            projectId: project._id,
            name: project.name,
            success: true,
            details: `Found existing project: ${project.name}`
          });
        }
      }
    }
    
    // 4. 🔗 AUTO-LINK ENTITIES (contacts to tasks, tasks to projects)
    const linkingActions = await this.autoLinkEntities(executedActions, userId);
    executedActions.push(...linkingActions);
    
  } catch (error) {
    console.error('❌ Error executing smart actions:', error);
    executedActions.push({
      type: 'error',
      error: error.message,
      success: false,
      details: `Error in smart action execution: ${error.message}`
    });
  }
  
  console.log(`✅ Executed ${executedActions.length} smart actions`);
  return executedActions;
}

// 🚀 NEW: Auto-link related entities
async autoLinkEntities(executedActions, userId) {
  const linkingActions = [];
  
  try {
    const Contact = require('../models/Contact');
    const Task = require('../models/Task');
    
    // Find created contacts and tasks to link them
    const createdContacts = executedActions.filter(action => action.type === 'contact_created');
    const createdTasks = executedActions.filter(action => action.type === 'task_created');
    
    // Link tasks to contacts if both were created in same conversation
    if (createdContacts.length > 0 && createdTasks.length > 0) {
      for (const taskAction of createdTasks) {
        for (const contactAction of createdContacts) {
          // Update task to include related contact
          await Task.findByIdAndUpdate(taskAction.taskId, {
            $addToSet: { 
              relatedContacts: contactAction.contactId 
            },
            $set: {
              'metadata.autoLinkedToContact': contactAction.contactId
            }
          });
          
          linkingActions.push({
            type: 'entities_linked',
            taskId: taskAction.taskId,
            contactId: contactAction.contactId,
            success: true,
            details: `Linked task "${taskAction.title}" to contact "${contactAction.name}"`
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error auto-linking entities:', error);
    linkingActions.push({
      type: 'linking_error',
      error: error.message,
      success: false
    });
  }
  
  return linkingActions;
}

// 🚀 NEW: Parse relative dates (helper method)
parseRelativeDate(dateString) {
  const now = new Date();
  const lowerDate = dateString.toLowerCase();
  
  if (/tomorrow|mañana/.test(lowerDate)) {
    return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  } else if (/today|hoy/.test(lowerDate)) {
    return now;
  } else if (/next week|próxima semana/.test(lowerDate)) {
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  
  return null; // Cannot parse
}

// Clear cache periodically
clearExpiredCache() {
  const now = Date.now();
  for (const [key, value] of this.cache.entries()) {
    if (now - value.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
    }
  }
}

  // BUILD USER CONTEXT - MISSING METHOD
  async buildUserContext(userId) {
    try {
      console.log(`🧠 Building context for user: ${userId}`);

      // Get user's data from all sources
      const Contact = require('../models/Contact');
      const Task = require('../models/Task');
      const Project = require('../models/Project');
      const Note = require('../models/Note');
      const Conversation = require('../models/Conversation');

      const [contacts, tasks, projects, notes, recentConversations] = await Promise.all([
        Contact.find({ userId }).sort({ updatedAt: -1 }).limit(20),
        Task.find({ userId }).sort({ updatedAt: -1 }).limit(30),
        Project.find({ userId }).sort({ updatedAt: -1 }).limit(15),
        Note.find({ userId }).sort({ updatedAt: -1 }).limit(25),
        Conversation.find({ userId }).sort({ createdAt: -1 }).limit(10)
      ]);

      // Analyze patterns and relationships
      const context = {
        userId,
        timestamp: new Date(),
        contacts: contacts.map(c => ({
          id: c._id,
          name: c.name,
          company: c.company,
          email: c.email,
          phone: c.phone,
          lastContact: c.lastContact,
          relationship: c.relationships?.type,
          importance: c.relationships?.importance,
          notes: c.notes
        })),
        tasks: tasks.map(t => ({
          id: t._id,
          title: t.title,
          description: t.description,
          priority: t.priority,
          status: t.status,
          dueDate: t.dueDate,
          category: t.category,
          progress: t.progress,
          isOverdue: t.dueDate && new Date(t.dueDate) < new Date(),
          assignedTo: t.assignedTo
        })),
        projects: projects.map(p => ({
          id: p._id,
          name: p.name,
          description: p.description,
          status: p.status,
          priority: p.priority,
          startDate: p.startDate,
          endDate: p.endDate,
          progress: p.progress,
          team: p.team,
          budget: p.budget
        })),
        notes: notes.map(n => ({
          id: n._id,
          title: n.title,
          content: n.content.substring(0, 500), // Limit content for context
          type: n.type,
          category: n.category,
          tags: n.tags,
          createdAt: n.createdAt
        })),
        recentConversations: recentConversations.map(c => ({
          id: c._id,
          userMessage: c.userMessage || c.message || 'No message',
          assistantResponse: (c.assistantResponse || c.response || 'No response').substring(0, 200),
          intent: c.messageAnalysis?.intent,
          timestamp: c.createdAt
        })),
        summary: {
          totalContacts: contacts.length,
          totalTasks: tasks.length,
          totalProjects: projects.length,
          totalNotes: notes.length,
          urgentTasks: tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length,
          overdueTasks: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length,
          activeProjects: projects.filter(p => p.status === 'in-progress' || p.status === 'active').length
        }
      };

      console.log(`✅ Context built: ${context.summary.totalContacts} contacts, ${context.summary.totalTasks} tasks, ${context.summary.totalProjects} projects`);
      
      return context;

    } catch (error) {
      console.error('❌ Error building user context:', error);
      return {
        userId,
        timestamp: new Date(),
        contacts: [],
        tasks: [],
        projects: [],
        notes: [],
        recentConversations: [],
        summary: {
          totalContacts: 0,
          totalTasks: 0,
          totalProjects: 0,
          totalNotes: 0,
          urgentTasks: 0,
          overdueTasks: 0,
          activeProjects: 0
        },
        error: error.message
      };
    }
  }

  // PROCESS ACTIONS - MISSING METHOD
  async processActions(messageAnalysis, context, userId) {
    try {
      console.log(`⚡ Processing actions for ${userId}`);

      const actions = [];

      // Extract potential actions based on message analysis
      if (messageAnalysis.intent === 'task_creation' || messageAnalysis.actionRequired) {
        if (messageAnalysis.entities.tasks.length > 0) {
          actions.push({
            type: 'create_task',
            data: {
              title: messageAnalysis.entities.tasks[0],
              priority: messageAnalysis.urgency,
              userId
            }
          });
        }
      }

      if (messageAnalysis.intent === 'contact_query' && messageAnalysis.entities.contacts.length > 0) {
        actions.push({
          type: 'contact_lookup',
          data: {
            contacts: messageAnalysis.entities.contacts
          }
        });
      }

      console.log(`✅ Generated ${actions.length} actions`);
      return actions;

    } catch (error) {
      console.error('❌ Error processing actions:', error);
      return [];
    }
  }

  // Auto-link extracted entities to existing data
  async linkConversationData(conversation, entities, userId) {
    try {
      console.log('🔗 Linking conversation data for user:', userId);
      
      const Contact = require('../models/Contact');
      const Task = require('../models/Task');
      const Project = require('../models/Project');
      
      const links = {
        contacts: [],
        tasks: [],
        projects: [],
        newEntities: []
      };

      // Link to existing contacts by name or email
      if (entities.contacts.names.length > 0 || entities.contacts.emails.length > 0) {
        const contactQuery = {
          userId,
          $or: [
            { name: { $in: entities.contacts.names } },
            { email: { $in: entities.contacts.emails } }
          ]
        };
        
        const existingContacts = await Contact.find(contactQuery);
        links.contacts = existingContacts.map(c => c._id);
        
        // Suggest creating new contacts for unmatched names/emails
        const existingNames = existingContacts.map(c => c.name);
        const existingEmails = existingContacts.map(c => c.email);
        
        const newContactSuggestions = [
          ...entities.contacts.names.filter(name => !existingNames.includes(name)),
          ...entities.contacts.emails.filter(email => !existingEmails.includes(email))
        ];
        
        if (newContactSuggestions.length > 0) {
          links.newEntities.push({
            type: 'contact',
            suggestions: newContactSuggestions,
            confidence: 0.8
          });
        }
      }

      // Auto-create tasks from action words
      if (entities.tasks.actions.length > 0) {
        const taskSuggestions = entities.tasks.actions.map(action => ({
          type: 'task',
          title: `${action} - from conversation`,
          description: conversation.userMessage || conversation.message,
          priority: entities.tasks.urgencyIndicators.length > 0 ? 'high' : 'medium',
          extractedFrom: conversation._id,
          confidence: 0.7
        }));
        
        links.newEntities.push(...taskSuggestions);
      }

      console.log('✅ Linked conversation data:', {
        existingContacts: links.contacts.length,
        newEntitySuggestions: links.newEntities.length
      });

      return links;

    } catch (error) {
      console.error('❌ Error linking conversation data:', error);
      return { contacts: [], tasks: [], projects: [], newEntities: [] };
    }
  }
}

module.exports = new IntelligenceService();