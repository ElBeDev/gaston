/**
 * 🔮 Eva Predictive Intelligence Service
 * Sistema de inteligencia predictiva que anticipa necesidades del usuario,
 * predice acciones futuras, y sugiere optimizaciones proactivamente
 */

const AdvancedMemoryService = require('./memoryService');
const BehaviorAnalyticsService = require('./behaviorAnalytics');

class PredictiveIntelligenceService {
  constructor() {
    this.memoryService = new AdvancedMemoryService();
    this.behaviorService = new BehaviorAnalyticsService();
    this.predictionCache = new Map();
    this.learningModels = new Map();
    this.predictionAccuracy = new Map();
  }

  /**
   * 🎯 Predicción principal - anticipa necesidades del usuario
   */
  async generatePredictions(userId, currentContext = {}) {
    console.log(`🔮 Generating predictions for ${userId}...`);
    
    try {
      const predictions = {
        immediateNeeds: await this.predictImmediateNeeds(userId, currentContext),
        upcomingActions: await this.predictUpcomingActions(userId, currentContext),
        potentialBlockers: await this.predictPotentialBlockers(userId, currentContext),
        opportunityWindows: await this.identifyOpportunityWindows(userId),
        resourceNeeds: await this.predictResourceNeeds(userId, currentContext),
        collaborationOpportunities: await this.predictCollaborationOpportunities(userId),
        optimizationSuggestions: await this.generateOptimizationSuggestions(userId),
        riskAssessment: await this.assessRisks(userId, currentContext),
        confidenceScores: await this.calculateConfidenceScores(userId),
        timestamp: new Date()
      };

      // Cache las predicciones
      this.predictionCache.set(`predictions_${userId}`, predictions);
      
      console.log(`✅ Generated ${Object.keys(predictions).length} prediction categories`);
      return predictions;
    } catch (error) {
      console.error('❌ Error generating predictions:', error);
      return this.getFallbackPredictions(userId);
    }
  }

  /**
   * ⚡ Predicción de necesidades inmediatas (próximos 30 minutos)
   */
  async predictImmediateNeeds(userId, currentContext) {
    const userProfile = await this.memoryService.getUserProfile(userId);
    const behaviorData = await this.behaviorService.getBehaviorAnalytics(userId);
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const dayOfWeek = currentTime.getDay();

    const immediateNeeds = [];

    // Predicción basada en patrones horarios
    if (this.isProductiveHour(userProfile, currentHour)) {
      immediateNeeds.push({
        need: 'focus_session',
        description: 'Es tu hora pico de productividad - perfecto para tareas complejas',
        probability: 0.85,
        urgency: 'high',
        suggestedAction: 'Programa una sesión de trabajo profundo',
        reasoning: 'Análisis histórico muestra alta productividad a esta hora'
      });
    }

    // Predicción basada en context actual
    if (currentContext.intent === 'scheduling') {
      immediateNeeds.push({
        need: 'calendar_optimization',
        description: 'Necesitarás revisar conflictos de calendario',
        probability: 0.78,
        urgency: 'medium',
        suggestedAction: 'Revisar disponibilidad antes de confirmar',
        reasoning: 'Patrón detectado en conversaciones de scheduling'
      });
    }

    // Predicción basada en día de la semana
    if (dayOfWeek === 1 && currentHour < 10) { // Lunes mañana
      immediateNeeds.push({
        need: 'week_planning',
        description: 'Momento ideal para planificar la semana',
        probability: 0.72,
        urgency: 'medium',
        suggestedAction: 'Revisar objetivos y prioridades semanales',
        reasoning: 'Los lunes por la mañana es cuando más planificas'
      });
    }

    // Predicción basada en patrones de comunicación
    const lastConversation = await this.getLastConversation(userId);
    if (lastConversation && this.shouldFollowUp(lastConversation)) {
      immediateNeeds.push({
        need: 'follow_up',
        description: 'Necesitas hacer seguimiento de la conversación anterior',
        probability: 0.68,
        urgency: 'medium',
        suggestedAction: 'Enviar seguimiento o actualización',
        reasoning: 'Patrón de follow-up detectado en conversaciones similares'
      });
    }

    return immediateNeeds.slice(0, 5); // Top 5 necesidades inmediatas
  }

  /**
   * 📅 Predicción de acciones próximas (próximos 1-7 días)
   */
  async predictUpcomingActions(userId, currentContext) {
    const userProfile = await this.memoryService.getUserProfile(userId);
    const historicalData = await this.memoryService.getHistoricalContext(userId, 60);
    
    const upcomingActions = [];

    // Predicción de reuniones
    const meetingPrediction = await this.predictUpcomingMeetings(userId, historicalData);
    if (meetingPrediction.probability > 0.6) {
      upcomingActions.push(meetingPrediction);
    }

    // Predicción de deadlines
    const deadlinePrediction = await this.predictUpcomingDeadlines(userId, historicalData);
    if (deadlinePrediction.probability > 0.5) {
      upcomingActions.push(deadlinePrediction);
    }

    // Predicción de tareas recurrentes
    const recurringTasks = await this.predictRecurringTasks(userId, historicalData);
    upcomingActions.push(...recurringTasks);

    // Predicción de necesidades de comunicación
    const communicationNeeds = await this.predictCommunicationNeeds(userId, historicalData);
    upcomingActions.push(...communicationNeeds);

    return upcomingActions.slice(0, 8); // Top 8 acciones próximas
  }

  /**
   * ⚠️ Predicción de blockers potenciales
   */
  async predictPotentialBlockers(userId, currentContext) {
    const historicalData = await this.memoryService.getHistoricalContext(userId, 45);
    const behaviorData = await this.behaviorService.getBehaviorAnalytics(userId);
    
    const blockers = [];

    // Predicción de sobrecarga de trabajo
    if (behaviorData.stressAnalysis && behaviorData.stressAnalysis.workloadPressure > 0.7) {
      blockers.push({
        blocker: 'workload_overload',
        description: 'Riesgo de sobrecarga de trabajo detectado',
        probability: 0.75,
        impact: 'high',
        timeframe: '3-5 días',
        prevention: 'Reprogramar tareas no críticas, delegar cuando sea posible',
        earlyWarning: 'Niveles de estrés aumentando en análisis reciente'
      });
    }

    // Predicción de conflictos de calendario
    const calendarConflicts = await this.predictCalendarConflicts(userId, historicalData);
    if (calendarConflicts.length > 0) {
      blockers.push({
        blocker: 'calendar_conflicts',
        description: `${calendarConflicts.length} conflictos de calendario previstos`,
        probability: 0.82,
        impact: 'medium',
        timeframe: '1-3 días',
        prevention: 'Revisar y reorganizar reuniones con anticipación',
        details: calendarConflicts
      });
    }

    // Predicción de dependencies de proyecto
    const dependencyRisks = await this.predictDependencyRisks(userId, historicalData);
    blockers.push(...dependencyRisks);

    return blockers.slice(0, 6);
  }

  /**
   * 🎯 Identificación de ventanas de oportunidad
   */
  async identifyOpportunityWindows(userId) {
    const userProfile = await this.memoryService.getUserProfile(userId);
    const behaviorData = await this.behaviorService.getBehaviorAnalytics(userId);
    
    const opportunities = [];

    // Ventanas de alta productividad
    if (userProfile.workingPatterns && userProfile.workingPatterns.peakHours) {
      userProfile.workingPatterns.peakHours.forEach(hour => {
        opportunities.push({
          type: 'productivity_window',
          description: `Ventana de alta productividad a las ${this.formatHour(hour)}`,
          duration: '2-3 horas',
          confidence: 0.88,
          suggestedUse: 'Tareas complejas, trabajo profundo, decisiones importantes',
          frequency: 'diario'
        });
      });
    }

    // Ventanas de networking
    const networkingWindows = this.identifyNetworkingOpportunities(userProfile);
    opportunities.push(...networkingWindows);

    // Ventanas de aprendizaje
    const learningWindows = this.identifyLearningOpportunities(behaviorData);
    opportunities.push(...learningWindows);

    return opportunities.slice(0, 5);
  }

  /**
   * 🤝 Predicción de oportunidades de colaboración
   */
  async predictCollaborationOpportunities(userId) {
    const historicalData = await this.memoryService.getHistoricalContext(userId, 30);
    const userProfile = await this.memoryService.getUserProfile(userId);
    
    const opportunities = [];

    // Análisis de red de contactos
    if (userProfile.relationships && userProfile.relationships.contactImportance) {
      const topContacts = userProfile.relationships.contactImportance.slice(0, 5);
      
      topContacts.forEach(contact => {
        if (this.shouldSuggestCollaboration(contact, historicalData)) {
          opportunities.push({
            type: 'collaboration_opportunity',
            contact: contact.contactId,
            description: 'Oportunidad de colaboración detectada',
            probability: 0.65,
            reasoning: 'Alta frecuencia de interacción, proyectos complementarios',
            suggestedAction: 'Proponer reunión o proyecto conjunto'
          });
        }
      });
    }

    return opportunities.slice(0, 4);
  }

  /**
   * 💡 Generación de sugerencias de optimización
   */
  async generateOptimizationSuggestions(userId) {
    const userProfile = await this.memoryService.getUserProfile(userId);
    const behaviorData = await this.behaviorService.getBehaviorAnalytics(userId);
    
    const suggestions = [];

    // Optimización de horarios
    if (behaviorData.timeManagementAnalysis) {
      const timeOptimizations = this.generateTimeOptimizations(behaviorData.timeManagementAnalysis);
      suggestions.push(...timeOptimizations);
    }

    // Optimización de productividad
    if (behaviorData.productivityAnalysis) {
      const productivityOptimizations = this.generateProductivityOptimizations(behaviorData.productivityAnalysis);
      suggestions.push(...productivityOptimizations);
    }

    // Optimización de comunicación
    if (behaviorData.communicationAnalysis) {
      const communicationOptimizations = this.generateCommunicationOptimizations(behaviorData.communicationAnalysis);
      suggestions.push(...communicationOptimizations);
    }

    return suggestions.slice(0, 6);
  }

  /**
   * ⚠️ Evaluación de riesgos
   */
  async assessRisks(userId, currentContext) {
    const behaviorData = await this.behaviorService.getBehaviorAnalytics(userId);
    const historicalData = await this.memoryService.getHistoricalContext(userId, 21);
    
    const risks = {
      burnoutRisk: this.assessBurnoutRisk(behaviorData),
      overcommitmentRisk: this.assessOvercommitmentRisk(historicalData),
      deadlineRisk: this.assessDeadlineRisk(historicalData),
      communicationRisk: this.assessCommunicationRisk(behaviorData),
      productivityRisk: this.assessProductivityRisk(behaviorData),
      overallRiskLevel: 'low'
    };

    // Calcular riesgo general
    const riskLevels = Object.values(risks).filter(r => typeof r === 'object' && r.level);
    const highRisks = riskLevels.filter(r => r.level === 'high').length;
    const mediumRisks = riskLevels.filter(r => r.level === 'medium').length;

    if (highRisks > 1) risks.overallRiskLevel = 'high';
    else if (highRisks > 0 || mediumRisks > 2) risks.overallRiskLevel = 'medium';

    return risks;
  }

  // ===========================================
  // 🔧 MÉTODOS DE PREDICCIÓN ESPECÍFICOS
  // ===========================================

  async predictUpcomingMeetings(userId, historicalData) {
    // Analizar patrones de reuniones
    const meetingKeywords = ['reunión', 'meeting', 'junta', 'call', 'videollamada'];
    const recentMeetingMentions = historicalData.conversations.filter(conv => 
      conv.message && meetingKeywords.some(keyword => 
        conv.message.toLowerCase().includes(keyword)
      )
    );

    if (recentMeetingMentions.length > 2) {
      return {
        action: 'schedule_meeting',
        description: 'Alta probabilidad de necesitar programar reunión',
        probability: 0.73,
        timeframe: '1-3 días',
        reasoning: `${recentMeetingMentions.length} menciones de reuniones en conversaciones recientes`
      };
    }

    return { probability: 0.2 };
  }

  async predictUpcomingDeadlines(userId, historicalData) {
    const deadlineKeywords = ['deadline', 'entrega', 'fecha límite', 'vencimiento'];
    const deadlineMentions = historicalData.conversations.filter(conv =>
      conv.message && deadlineKeywords.some(keyword =>
        conv.message.toLowerCase().includes(keyword)
      )
    );

    if (deadlineMentions.length > 1) {
      return {
        action: 'deadline_management',
        description: 'Deadlines próximos requieren atención',
        probability: 0.68,
        timeframe: '2-5 días',
        reasoning: 'Patrones de discusión sobre fechas límite detectados'
      };
    }

    return { probability: 0.25 };
  }

  async predictRecurringTasks(userId, historicalData) {
    // Analizar tareas que se repiten semanalmente/mensualmente
    const taskPatterns = this.analyzeTaskRecurrence(historicalData.tasks);
    
    return taskPatterns.map(pattern => ({
      action: pattern.taskType,
      description: `Tarea recurrente: ${pattern.description}`,
      probability: pattern.confidence,
      timeframe: pattern.nextOccurrence,
      reasoning: `Se repite cada ${pattern.frequency}`
    }));
  }

  isProductiveHour(userProfile, hour) {
    if (userProfile.workingPatterns && userProfile.workingPatterns.peakHours) {
      return userProfile.workingPatterns.peakHours.includes(hour);
    }
    // Default productive hours
    return hour >= 9 && hour <= 11;
  }

  shouldFollowUp(conversation) {
    if (!conversation.message) return false;
    
    const followUpIndicators = [
      'seguimiento', 'follow up', 'después hablamos', 'te actualizo',
      'pendiente', 'revisar', 'confirmar'
    ];
    
    return followUpIndicators.some(indicator =>
      conversation.message.toLowerCase().includes(indicator)
    );
  }

  async getLastConversation(userId) {
    const conversations = await this.memoryService.getHistoricalContext(userId, 1);
    return conversations.conversations[0] || null;
  }

  formatHour(hour) {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  }

  analyzeTaskRecurrence(tasks) {
    // Simplified recurrence analysis
    const tasksByType = {};
    
    tasks.forEach(task => {
      const type = task.category || 'general';
      if (!tasksByType[type]) tasksByType[type] = [];
      tasksByType[type].push(task);
    });

    const patterns = [];
    Object.entries(tasksByType).forEach(([type, typeTasks]) => {
      if (typeTasks.length >= 3) {
        patterns.push({
          taskType: type,
          description: `Tareas de ${type}`,
          confidence: 0.6,
          frequency: 'semanal',
          nextOccurrence: '3-7 días'
        });
      }
    });

    return patterns;
  }

  assessBurnoutRisk(behaviorData) {
    let riskScore = 0;
    
    if (behaviorData.stressAnalysis) {
      if (behaviorData.stressAnalysis.workloadPressure > 0.8) riskScore += 3;
      if (behaviorData.stressAnalysis.urgencyStress > 0.7) riskScore += 2;
      if (behaviorData.stressAnalysis.overcommitmentRisk > 0.6) riskScore += 2;
    }

    return {
      level: riskScore >= 5 ? 'high' : riskScore >= 3 ? 'medium' : 'low',
      score: riskScore,
      indicators: riskScore > 0 ? ['Alta carga de trabajo', 'Estrés por urgencia'] : [],
      recommendation: riskScore >= 5 ? 'Reducir carga de trabajo inmediatamente' : 'Monitorear niveles de estrés'
    };
  }

  async calculateConfidenceScores(userId) {
    const userProfile = await this.memoryService.getUserProfile(userId);
    const dataQuality = this.assessDataQuality(userProfile);
    
    return {
      immediateNeeds: dataQuality.recent * 0.9,
      upcomingActions: dataQuality.historical * 0.8,
      potentialBlockers: dataQuality.patterns * 0.7,
      overall: (dataQuality.recent + dataQuality.historical + dataQuality.patterns) / 3
    };
  }

  assessDataQuality(userProfile) {
    let recent = 0.5, historical = 0.5, patterns = 0.5;
    
    if (userProfile.preferences && Object.keys(userProfile.preferences).length > 3) recent += 0.3;
    if (userProfile.habits && Object.keys(userProfile.habits).length > 3) historical += 0.3;
    if (userProfile.workingPatterns && userProfile.workingPatterns.peakHours) patterns += 0.3;
    
    return { recent, historical, patterns };
  }

  getFallbackPredictions(userId) {
    return {
      immediateNeeds: [],
      upcomingActions: [],
      potentialBlockers: [],
      opportunityWindows: [],
      resourceNeeds: [],
      collaborationOpportunities: [],
      optimizationSuggestions: [],
      riskAssessment: { overallRiskLevel: 'unknown' },
      confidenceScores: { overall: 0.2 },
      timestamp: new Date()
    };
  }
}

module.exports = PredictiveIntelligenceService;
