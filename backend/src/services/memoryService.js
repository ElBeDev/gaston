/**
 * 🧠 Eva Advanced Memory Service
 * Sistema de memoria a largo plazo que permite a Eva aprender y recordar
 * patrones de comportamiento, preferencias, y contexto histórico del usuario
 */

const UserContext = require('../models/UserContext');
const Contact = require('../models/Contact');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Conversation = require('../models/Conversation');

class AdvancedMemoryService {
  constructor() {
    this.memoryCache = new Map();
    this.learningPatterns = new Map();
    this.temporalMemory = new Map();
  }

  /**
   * 🎯 Construye perfil de usuario basado en análisis histórico
   */
  async buildUserProfile(userId) {
    console.log(`🧠 Building advanced user profile for ${userId}...`);
    
    try {
      const profile = {
        preferences: await this.analyzeUserPreferences(userId),
        habits: await this.detectUserHabits(userId),
        relationships: await this.mapUserRelationships(userId),
        goals: await this.identifyUserGoals(userId),
        workingPatterns: await this.analyzeWorkingPatterns(userId),
        communicationStyle: await this.analyzeCommunicationStyle(userId),
        lastUpdated: new Date()
      };

      // Cache el perfil para acceso rápido
      this.memoryCache.set(`profile_${userId}`, profile);
      
      console.log(`✅ User profile built with ${Object.keys(profile).length} dimensions`);
      return profile;
    } catch (error) {
      console.error('❌ Error building user profile:', error);
      return this.getDefaultProfile(userId);
    }
  }

  /**
   * 🔍 Analiza preferencias del usuario basado en interacciones históricas
   */
  async analyzeUserPreferences(userId) {
    const conversations = await Conversation.find({ userId }).sort({ timestamp: -1 }).limit(100);
    const tasks = await Task.find({ userId }).sort({ createdAt: -1 }).limit(50);
    
    const preferences = {
      workingHours: this.extractWorkingHours(conversations),
      communicationStyle: this.extractCommStyle(conversations),
      taskPriorities: this.extractTaskPriorities(tasks),
      responseStyle: this.extractResponseStyle(conversations),
      topicInterests: this.extractTopicInterests(conversations),
      urgencyPatterns: this.extractUrgencyPatterns(conversations),
      decisionMaking: this.extractDecisionPatterns(conversations)
    };

    return preferences;
  }

  /**
   * 📊 Detecta hábitos y patrones de comportamiento
   */
  async detectUserHabits(userId) {
    const conversations = await Conversation.find({ userId }).sort({ timestamp: -1 }).limit(200);
    const tasks = await Task.find({ userId }).sort({ createdAt: -1 }).limit(100);

    const habits = {
      dailyRoutines: this.extractDailyRoutines(conversations),
      productivityPeaks: this.identifyProductivityPeaks(conversations, tasks),
      breakPatterns: this.analyzeBreakPatterns(conversations),
      collaborationStyle: this.analyzeCollaborationStyle(conversations),
      planningHabits: this.extractPlanningHabits(tasks),
      communicationTiming: this.analyzeCommunicationTiming(conversations),
      taskCompletionPatterns: this.analyzeTaskCompletion(tasks)
    };

    return habits;
  }

  /**
   * 🤝 Mapea relaciones y connections del usuario
   */
  async mapUserRelationships(userId) {
    const contacts = await Contact.find({ userId });
    const conversations = await Conversation.find({ userId }).sort({ timestamp: -1 }).limit(300);
    const projects = await Project.find({ userId });

    const relationships = {
      contactImportance: this.rankContactImportance(contacts, conversations),
      communicationFrequency: this.analyzeCommunicationFrequency(contacts, conversations),
      projectTeams: this.mapProjectTeams(contacts, projects),
      influenceNetwork: this.buildInfluenceNetwork(contacts, conversations),
      collaborationPatterns: this.analyzeCollaborationPatterns(conversations),
      relationshipTrends: this.analyzeRelationshipTrends(conversations)
    };

    return relationships;
  }

  /**
   * 🎯 Identifica objetivos y metas del usuario
   */
  async identifyUserGoals(userId) {
    const conversations = await Conversation.find({ userId }).sort({ timestamp: -1 }).limit(150);
    const tasks = await Task.find({ userId }).sort({ createdAt: -1 }).limit(100);
    const projects = await Project.find({ userId });

    const goals = {
      shortTerm: this.extractShortTermGoals(conversations, tasks),
      longTerm: this.extractLongTermGoals(conversations, projects),
      careerObjectives: this.analyzeCareerGoals(conversations),
      personalGrowth: this.trackPersonalDevelopment(conversations),
      projectGoals: this.extractProjectGoals(projects),
      learningGoals: this.identifyLearningObjectives(conversations)
    };

    return goals;
  }

  /**
   * ⏰ Analiza patrones de trabajo y productividad
   */
  async analyzeWorkingPatterns(userId) {
    const conversations = await Conversation.find({ userId }).sort({ timestamp: -1 }).limit(250);
    
    const patterns = {
      peakHours: this.identifyPeakWorkingHours(conversations),
      energyLevels: this.trackEnergyPatterns(conversations),
      focusPatterns: this.analyzeFocusPatterns(conversations),
      meetingPreferences: this.extractMeetingPreferences(conversations),
      deadlineManagement: this.analyzeDeadlineHandling(conversations),
      multitaskingStyle: this.analyzeMultitaskingPatterns(conversations)
    };

    return patterns;
  }

  /**
   * 💬 Analiza estilo de comunicación
   */
  async analyzeCommunicationStyle(userId) {
    const conversations = await Conversation.find({ userId }).sort({ timestamp: -1 }).limit(200);
    
    const style = {
      formalityLevel: this.extractFormalityLevel(conversations),
      responseLength: this.analyzeResponseLength(conversations),
      questioningStyle: this.analyzeQuestioningStyle(conversations),
      emotionalExpression: this.analyzeEmotionalExpression(conversations),
      clarificationNeeds: this.analyzeClarificationPatterns(conversations),
      informationDensity: this.analyzeInformationDensity(conversations)
    };

    return style;
  }

  /**
   * 🔮 Inteligencia predictiva - predice necesidades futuras
   */
  async predictiveIntelligence(userId, currentContext) {
    console.log(`🔮 Generating predictive insights for ${userId}...`);
    
    try {
      const userProfile = await this.getUserProfile(userId);
      const historicalData = await this.getHistoricalContext(userId);
      const temporalContext = this.getTemporalContext();
      
      const predictions = {
        nextActions: this.predictNextActions(userProfile, currentContext),
        upcomingNeeds: this.predictUpcomingNeeds(userProfile, temporalContext),
        potentialBlockers: this.identifyPotentialBlockers(historicalData, currentContext),
        optimalTiming: this.suggestOptimalTiming(userProfile, currentContext),
        resourceNeeds: this.predictResourceNeeds(userProfile, currentContext),
        collaborationOpportunities: this.identifyCollaborationOpps(userProfile),
        riskFactors: this.identifyRiskFactors(historicalData, currentContext),
        confidence: this.calculatePredictionConfidence(userProfile, currentContext)
      };

      console.log(`✅ Generated ${Object.keys(predictions).length} prediction dimensions`);
      return predictions;
    } catch (error) {
      console.error('❌ Error in predictive intelligence:', error);
      return this.getFallbackPredictions(userId);
    }
  }

  /**
   * 🧠 Sistema de aprendizaje continuo
   */
  async learnFromInteraction(userId, interaction) {
    try {
      // Extraer patrones de la interacción
      const patterns = this.extractInteractionPatterns(interaction);
      
      // Actualizar modelo de aprendizaje
      await this.updateLearningModel(userId, patterns);
      
      // Ajustar predicciones futuras
      await this.adjustPredictionModel(userId, patterns);
      
      console.log(`🎓 Learned from interaction: ${interaction.type}`);
    } catch (error) {
      console.error('❌ Error in learning process:', error);
    }
  }

  /**
   * 📈 Análisis de contexto temporal
   */
  getTemporalContext() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const dayOfMonth = now.getDate();
    const month = now.getMonth();

    return {
      timeOfDay: this.categorizeTimeOfDay(hour),
      dayType: this.categorizeDayType(dayOfWeek),
      weekPosition: this.categorizeWeekPosition(dayOfMonth),
      seasonalContext: this.categorizeSeasonalContext(month),
      energyContext: this.predictEnergyContext(hour, dayOfWeek),
      productivityWindow: this.identifyProductivityWindow(hour, dayOfWeek)
    };
  }

  // ===========================================
  // 🔧 MÉTODOS DE ANÁLISIS ESPECÍFICOS
  // ===========================================

  extractWorkingHours(conversations) {
    const hourCounts = new Array(24).fill(0);
    
    conversations.forEach(conv => {
      const hour = new Date(conv.timestamp).getHours();
      hourCounts[hour]++;
    });

    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(h => h.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map(h => h.hour);

    return {
      typical: peakHours,
      start: Math.min(...peakHours),
      end: Math.max(...peakHours),
      distribution: hourCounts
    };
  }

  extractCommStyle(conversations) {
    let totalWords = 0;
    let totalMessages = conversations.length;
    let questionCount = 0;
    let urgentCount = 0;

    conversations.forEach(conv => {
      if (conv.message) {
        totalWords += conv.message.split(' ').length;
        if (conv.message.includes('?')) questionCount++;
        if (conv.urgency === 'high' || conv.message.toLowerCase().includes('urgente')) urgentCount++;
      }
    });

    return {
      averageLength: Math.round(totalWords / totalMessages),
      questioningRate: (questionCount / totalMessages * 100).toFixed(1),
      urgencyRate: (urgentCount / totalMessages * 100).toFixed(1),
      communicationDensity: totalWords > 500 ? 'detailed' : totalWords > 200 ? 'moderate' : 'concise'
    };
  }

  extractTaskPriorities(tasks) {
    const priorityCounts = { high: 0, medium: 0, low: 0 };
    const categories = {};

    tasks.forEach(task => {
      if (task.priority) priorityCounts[task.priority]++;
      if (task.category) {
        categories[task.category] = (categories[task.category] || 0) + 1;
      }
    });

    return {
      priorityDistribution: priorityCounts,
      preferredCategories: Object.entries(categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([cat]) => cat),
      urgencyTendency: priorityCounts.high > priorityCounts.low ? 'high-urgency' : 'planned'
    };
  }

  identifyProductivityPeaks(conversations, tasks) {
    const hourlyActivity = new Array(24).fill(0);
    const dailyActivity = new Array(7).fill(0);

    conversations.forEach(conv => {
      const date = new Date(conv.timestamp);
      hourlyActivity[date.getHours()]++;
      dailyActivity[date.getDay()]++;
    });

    tasks.forEach(task => {
      if (task.completedAt) {
        const date = new Date(task.completedAt);
        hourlyActivity[date.getHours()] += 2; // Weight completed tasks more
        dailyActivity[date.getDay()] += 2;
      }
    });

    return {
      peakHours: this.findPeaks(hourlyActivity),
      peakDays: this.findPeaks(dailyActivity),
      hourlyPattern: hourlyActivity,
      dailyPattern: dailyActivity
    };
  }

  findPeaks(data) {
    const threshold = Math.max(...data) * 0.7;
    return data
      .map((value, index) => ({ index, value }))
      .filter(item => item.value >= threshold)
      .map(item => item.index);
  }

  rankContactImportance(contacts, conversations) {
    const contactActivity = new Map();

    // Analizar frecuencia de menciones en conversaciones
    conversations.forEach(conv => {
      contacts.forEach(contact => {
        if (conv.message && (
          conv.message.toLowerCase().includes(contact.name.toLowerCase()) ||
          (contact.email && conv.message.toLowerCase().includes(contact.email.toLowerCase()))
        )) {
          const count = contactActivity.get(contact._id.toString()) || 0;
          contactActivity.set(contact._id.toString(), count + 1);
        }
      });
    });

    return Array.from(contactActivity.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([contactId, mentions]) => ({
        contactId,
        mentions,
        importance: mentions > 10 ? 'high' : mentions > 5 ? 'medium' : 'low'
      }));
  }

  predictNextActions(userProfile, currentContext) {
    const predictions = [];

    // Basado en patrones históricos
    if (userProfile.habits.dailyRoutines) {
      const currentHour = new Date().getHours();
      const typicalActions = this.getTypicalActionsForHour(userProfile, currentHour);
      predictions.push(...typicalActions);
    }

    // Basado en contexto actual
    if (currentContext.intent === 'scheduling') {
      predictions.push({
        action: 'check_calendar',
        probability: 0.85,
        reasoning: 'User often checks calendar when scheduling'
      });
    }

    return predictions.slice(0, 5);
  }

  getTypicalActionsForHour(userProfile, hour) {
    // Placeholder - implementar lógica basada en patrones históricos
    const actions = [];
    
    if (hour >= 9 && hour <= 11) {
      actions.push({
        action: 'review_tasks',
        probability: 0.75,
        reasoning: 'High activity period for task management'
      });
    }

    return actions;
  }

  /**
   * 💾 Gestión de caché y persistencia
   */
  async getUserProfile(userId) {
    // Verificar caché primero
    if (this.memoryCache.has(`profile_${userId}`)) {
      const cached = this.memoryCache.get(`profile_${userId}`);
      
      // Verificar si está actualizado (menos de 1 hora)
      if (new Date() - cached.lastUpdated < 3600000) {
        return cached;
      }
    }

    // Reconstruir perfil si no está en caché o está desactualizado
    return await this.buildUserProfile(userId);
  }

  async getHistoricalContext(userId, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const [conversations, tasks, contacts, projects] = await Promise.all([
      Conversation.find({ userId, timestamp: { $gte: since } }),
      Task.find({ userId, createdAt: { $gte: since } }),
      Contact.find({ userId, createdAt: { $gte: since } }),
      Project.find({ userId, createdAt: { $gte: since } })
    ]);

    return {
      conversations,
      tasks,
      contacts,
      projects,
      period: days,
      totalInteractions: conversations.length + tasks.length
    };
  }

  getDefaultProfile(userId) {
    return {
      preferences: {
        workingHours: { typical: [9, 10, 11, 14, 15, 16], start: 9, end: 17 },
        communicationStyle: 'moderate',
        responseStyle: 'helpful'
      },
      habits: {
        productivityPeaks: { peakHours: [9, 10, 15], peakDays: [1, 2, 3] }
      },
      relationships: { contactImportance: [] },
      goals: { shortTerm: [], longTerm: [] },
      workingPatterns: { peakHours: [9, 10, 15] },
      communicationStyle: { formalityLevel: 'professional' },
      lastUpdated: new Date()
    };
  }

  getFallbackPredictions(userId) {
    return {
      nextActions: [],
      upcomingNeeds: [],
      potentialBlockers: [],
      optimalTiming: null,
      confidence: 0.2
    };
  }

  // ===========================================
  // 🔧 MÉTODOS UTILITARIOS
  // ===========================================

  categorizeTimeOfDay(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  categorizeDayType(dayOfWeek) {
    if (dayOfWeek >= 1 && dayOfWeek <= 5) return 'weekday';
    return 'weekend';
  }

  categorizeWeekPosition(dayOfMonth) {
    if (dayOfMonth <= 7) return 'first-week';
    if (dayOfMonth <= 14) return 'second-week';
    if (dayOfMonth <= 21) return 'third-week';
    return 'fourth-week';
  }

  categorizeSeasonalContext(month) {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  predictEnergyContext(hour, dayOfWeek) {
    // Lógica para predecir nivel de energía basado en hora y día
    if (dayOfWeek === 1 && hour < 10) return 'monday-ramp-up';
    if (dayOfWeek === 5 && hour > 15) return 'friday-wind-down';
    if (hour >= 9 && hour <= 11) return 'morning-peak';
    if (hour >= 14 && hour <= 16) return 'afternoon-focus';
    return 'moderate';
  }

  identifyProductivityWindow(hour, dayOfWeek) {
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const isMorningPeak = hour >= 9 && hour <= 11;
    const isAfternoonFocus = hour >= 14 && hour <= 16;
    
    if (isWeekday && (isMorningPeak || isAfternoonFocus)) {
      return 'high-productivity';
    }
    
    return 'moderate-productivity';
  }

  extractInteractionPatterns(interaction) {
    return {
      type: interaction.type,
      intent: interaction.intent,
      timestamp: new Date(),
      success: interaction.success || true,
      duration: interaction.duration || null,
      complexity: interaction.complexity || 'medium'
    };
  }

  async updateLearningModel(userId, patterns) {
    // Actualizar modelo de aprendizaje con nuevos patrones
    const existing = this.learningPatterns.get(userId) || [];
    existing.push(patterns);
    
    // Mantener solo los últimos 1000 patrones
    if (existing.length > 1000) {
      existing.splice(0, existing.length - 1000);
    }
    
    this.learningPatterns.set(userId, existing);
  }

  async adjustPredictionModel(userId, patterns) {
    // Ajustar modelo de predicción basado en feedback
    console.log(`🔧 Adjusting prediction model for user ${userId}`);
  }

  calculatePredictionConfidence(userProfile, currentContext) {
    let confidence = 0.5; // Base confidence
    
    // Incrementar confianza basado en cantidad de datos históricos
    if (userProfile.habits && userProfile.habits.productivityPeaks) {
      confidence += 0.2;
    }
    
    if (userProfile.preferences && userProfile.preferences.workingHours) {
      confidence += 0.15;
    }
    
    // Ajustar basado en contexto actual
    if (currentContext && currentContext.intent) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 0.95); // Max 95% confidence
  }
}

module.exports = AdvancedMemoryService;
