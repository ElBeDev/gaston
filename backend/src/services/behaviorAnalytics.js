/**
 * 📊 Eva Behavior Analytics Service
 * Sistema de análisis avanzado que detecta patrones de comportamiento,
 * tendencias de productividad, y insights de optimización personal
 */

const AdvancedMemoryService = require('./memoryService');

class BehaviorAnalyticsService {
  constructor() {
    this.memoryService = new AdvancedMemoryService();
    this.analyticsCache = new Map();
    this.behaviorMetrics = new Map();
    this.trendAnalysis = new Map();
  }

  /**
   * 📈 Análisis completo de comportamiento del usuario
   */
  async analyzeBehaviorPatterns(userId, timeframe = 30) {
    console.log(`📊 Analyzing behavior patterns for ${userId} (${timeframe} days)...`);
    
    try {
      const analytics = {
        productivityAnalysis: await this.analyzeProductivityPatterns(userId, timeframe),
        communicationAnalysis: await this.analyzeCommunicationBehavior(userId, timeframe),
        taskManagementAnalysis: await this.analyzeTaskManagementBehavior(userId, timeframe),
        timeManagementAnalysis: await this.analyzeTimeManagementPatterns(userId, timeframe),
        collaborationAnalysis: await this.analyzeCollaborationPatterns(userId, timeframe),
        learningAnalysis: await this.analyzeLearningBehavior(userId, timeframe),
        stressAnalysis: await this.analyzeStressIndicators(userId, timeframe),
        optimizationInsights: await this.generateOptimizationInsights(userId, timeframe),
        timestamp: new Date()
      };

      // Cache los resultados
      this.analyticsCache.set(`behavior_${userId}`, analytics);
      
      console.log(`✅ Behavior analysis completed with ${Object.keys(analytics).length} dimensions`);
      return analytics;
    } catch (error) {
      console.error('❌ Error in behavior analysis:', error);
      return this.getFallbackAnalytics(userId);
    }
  }

  /**
   * 🚀 Análisis de patrones de productividad
   */
  async analyzeProductivityPatterns(userId, timeframe) {
    const historicalData = await this.memoryService.getHistoricalContext(userId, timeframe);
    const userProfile = await this.memoryService.getUserProfile(userId);

    const productivity = {
      peakPerformanceHours: this.identifyPeakHours(historicalData),
      energyDistribution: this.analyzeEnergyDistribution(historicalData),
      focusSessionAnalysis: this.analyzeFocusSessions(historicalData),
      taskCompletionRates: this.analyzeTaskCompletion(historicalData),
      productivityTrends: this.analyzeProductivityTrends(historicalData),
      optimalWorkSchedule: this.generateOptimalSchedule(userProfile),
      burnoutRisk: this.assessBurnoutRisk(historicalData),
      improvementOpportunities: this.identifyImprovementOpportunities(historicalData)
    };

    return productivity;
  }

  /**
   * 💬 Análisis de comportamiento de comunicación
   */
  async analyzeCommunicationBehavior(userId, timeframe) {
    const historicalData = await this.memoryService.getHistoricalContext(userId, timeframe);
    
    const communication = {
      responseTimePatterns: this.analyzeResponseTimes(historicalData.conversations),
      communicationVolume: this.analyzeCommunicationVolume(historicalData),
      tonalAnalysis: this.analyzeCommunicationTone(historicalData.conversations),
      questioningPatterns: this.analyzeQuestioningBehavior(historicalData.conversations),
      clarificationNeeds: this.analyzeClarificationPatterns(historicalData.conversations),
      communicationEfficiency: this.assessCommunicationEfficiency(historicalData),
      preferredChannels: this.identifyPreferredChannels(historicalData),
      socialInteractionPatterns: this.analyzeSocialPatterns(historicalData)
    };

    return communication;
  }

  /**
   * ✅ Análisis de gestión de tareas
   */
  async analyzeTaskManagementBehavior(userId, timeframe) {
    const historicalData = await this.memoryService.getHistoricalContext(userId, timeframe);
    
    const taskManagement = {
      taskCreationPatterns: this.analyzeTaskCreationBehavior(historicalData.tasks),
      completionPatterns: this.analyzeCompletionBehavior(historicalData.tasks),
      prioritizationBehavior: this.analyzePrioritizationPatterns(historicalData.tasks),
      procrastinationIndicators: this.identifyProcrastinationPatterns(historicalData.tasks),
      deadlineManagement: this.analyzeDeadlineHandling(historicalData.tasks),
      taskComplexityPreferences: this.analyzeComplexityPreferences(historicalData.tasks),
      organizationalStyle: this.assessOrganizationalStyle(historicalData.tasks),
      efficiencyMetrics: this.calculateEfficiencyMetrics(historicalData.tasks)
    };

    return taskManagement;
  }

  /**
   * ⏰ Análisis de gestión del tiempo
   */
  async analyzeTimeManagementPatterns(userId, timeframe) {
    const historicalData = await this.memoryService.getHistoricalContext(userId, timeframe);
    
    const timeManagement = {
      timeAllocationPatterns: this.analyzeTimeAllocation(historicalData),
      scheduleOptimization: this.analyzeScheduleEfficiency(historicalData),
      breakPatterns: this.analyzeBreakBehavior(historicalData.conversations),
      multitaskingBehavior: this.analyzeMultitaskingPatterns(historicalData),
      timeEstimationAccuracy: this.analyzeTimeEstimation(historicalData.tasks),
      urgencyHandling: this.analyzeUrgencyResponse(historicalData),
      calendarUtilization: this.analyzeCalendarBehavior(historicalData),
      workLifeBalance: this.assessWorkLifeBalance(historicalData)
    };

    return timeManagement;
  }

  /**
   * 🤝 Análisis de patrones de colaboración
   */
  async analyzeCollaborationPatterns(userId, timeframe) {
    const historicalData = await this.memoryService.getHistoricalContext(userId, timeframe);
    
    const collaboration = {
      teamInteractionStyles: this.analyzeTeamInteractions(historicalData),
      leadershipIndicators: this.identifyLeadershipPatterns(historicalData),
      helpSeekingBehavior: this.analyzeHelpSeekingBehavior(historicalData.conversations),
      knowledgeSharing: this.analyzeKnowledgeSharing(historicalData),
      conflictResolution: this.analyzeConflictPatterns(historicalData),
      networkUtilization: this.analyzeNetworkUtilization(historicalData),
      collaborationEfficiency: this.assessCollaborationEfficiency(historicalData),
      mentorshipPatterns: this.identifyMentorshipBehavior(historicalData)
    };

    return collaboration;
  }

  /**
   * 🧠 Análisis de comportamiento de aprendizaje
   */
  async analyzeLearningBehavior(userId, timeframe) {
    const historicalData = await this.memoryService.getHistoricalContext(userId, timeframe);
    
    const learning = {
      learningStyleIndicators: this.identifyLearningStyle(historicalData.conversations),
      knowledgeAcquisitionPatterns: this.analyzeKnowledgeAcquisition(historicalData),
      skillDevelopmentTrends: this.analyzeSkillDevelopment(historicalData),
      questioningDepth: this.analyzeQuestioningDepth(historicalData.conversations),
      informationProcessing: this.analyzeInformationProcessing(historicalData),
      adaptabilityMetrics: this.assessAdaptability(historicalData),
      curiousityIndicators: this.analyzeCuriosity(historicalData.conversations),
      retentionPatterns: this.analyzeRetentionBehavior(historicalData)
    };

    return learning;
  }

  /**
   * 😰 Análisis de indicadores de estrés
   */
  async analyzeStressIndicators(userId, timeframe) {
    const historicalData = await this.memoryService.getHistoricalContext(userId, timeframe);
    
    const stress = {
      stressSignals: this.identifyStressSignals(historicalData.conversations),
      workloadPressure: this.analyzeWorkloadPressure(historicalData),
      urgencyStress: this.analyzeUrgencyStress(historicalData),
      communicationStress: this.analyzeCommunicationStress(historicalData.conversations),
      deadlineStress: this.analyzeDeadlineStress(historicalData.tasks),
      overcommitmentRisk: this.assessOvercommitmentRisk(historicalData),
      recoveryPatterns: this.analyzeRecoveryBehavior(historicalData),
      wellbeingIndicators: this.assessWellbeingIndicators(historicalData)
    };

    return stress;
  }

  /**
   * 💡 Generación de insights de optimización
   */
  async generateOptimizationInsights(userId, timeframe) {
    const behaviorData = await this.getBehaviorAnalytics(userId);
    
    const insights = {
      productivityOptimizations: this.generateProductivityInsights(behaviorData),
      communicationImprovements: this.generateCommunicationInsights(behaviorData),
      timeManagementSuggestions: this.generateTimeManagementInsights(behaviorData),
      collaborationEnhancements: this.generateCollaborationInsights(behaviorData),
      learningOptimizations: this.generateLearningInsights(behaviorData),
      stressReduction: this.generateStressReductionInsights(behaviorData),
      personalizedRecommendations: this.generatePersonalizedRecommendations(behaviorData),
      actionablePriorities: this.prioritizeOptimizations(behaviorData)
    };

    return insights;
  }

  // ===========================================
  // 🔧 MÉTODOS DE ANÁLISIS ESPECÍFICOS
  // ===========================================

  identifyPeakHours(historicalData) {
    const hourlyActivity = new Array(24).fill(0);
    const hourlySuccess = new Array(24).fill(0);

    // Analizar actividad por hora
    historicalData.conversations.forEach(conv => {
      const hour = new Date(conv.timestamp).getHours();
      hourlyActivity[hour]++;
    });

    // Analizar tareas completadas por hora
    historicalData.tasks.forEach(task => {
      if (task.completedAt) {
        const hour = new Date(task.completedAt).getHours();
        hourlySuccess[hour] += 2; // Weight más alto para tareas completadas
      }
    });

    // Calcular score de productividad por hora
    const productivityScores = hourlyActivity.map((activity, hour) => ({
      hour,
      activity,
      success: hourlySuccess[hour],
      score: activity + hourlySuccess[hour]
    }));

    const peakHours = productivityScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(h => ({
        hour: h.hour,
        score: h.score,
        timeLabel: this.getTimeLabel(h.hour)
      }));

    return {
      peakHours,
      hourlyDistribution: productivityScores,
      topPerformanceWindow: this.identifyTopPerformanceWindow(peakHours)
    };
  }

  analyzeEnergyDistribution(historicalData) {
    const morningEnergy = this.calculatePeriodActivity(historicalData, 6, 12);
    const afternoonEnergy = this.calculatePeriodActivity(historicalData, 12, 18);
    const eveningEnergy = this.calculatePeriodActivity(historicalData, 18, 22);

    const totalActivity = morningEnergy + afternoonEnergy + eveningEnergy;

    return {
      morning: (morningEnergy / totalActivity * 100).toFixed(1),
      afternoon: (afternoonEnergy / totalActivity * 100).toFixed(1),
      evening: (eveningEnergy / totalActivity * 100).toFixed(1),
      energyType: this.classifyEnergyType(morningEnergy, afternoonEnergy, eveningEnergy)
    };
  }

  calculatePeriodActivity(historicalData, startHour, endHour) {
    let activity = 0;
    
    historicalData.conversations.forEach(conv => {
      const hour = new Date(conv.timestamp).getHours();
      if (hour >= startHour && hour < endHour) activity++;
    });

    historicalData.tasks.forEach(task => {
      if (task.completedAt) {
        const hour = new Date(task.completedAt).getHours();
        if (hour >= startHour && hour < endHour) activity += 2;
      }
    });

    return activity;
  }

  classifyEnergyType(morning, afternoon, evening) {
    const max = Math.max(morning, afternoon, evening);
    if (max === morning) return 'morning-person';
    if (max === afternoon) return 'afternoon-peak';
    return 'evening-productive';
  }

  analyzeTaskCompletion(historicalData) {
    const tasks = historicalData.tasks;
    const completed = tasks.filter(t => t.completedAt).length;
    const total = tasks.length;
    
    const completionRate = total > 0 ? (completed / total * 100).toFixed(1) : 0;
    
    // Analizar tiempo promedio para completar tareas
    const completionTimes = tasks
      .filter(t => t.completedAt && t.createdAt)
      .map(t => new Date(t.completedAt) - new Date(t.createdAt));
    
    const avgCompletionTime = completionTimes.length > 0 
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      : 0;

    return {
      completionRate: parseFloat(completionRate),
      totalTasks: total,
      completedTasks: completed,
      avgCompletionTimeHours: (avgCompletionTime / (1000 * 60 * 60)).toFixed(1),
      completionTrend: this.calculateCompletionTrend(tasks)
    };
  }

  calculateCompletionTrend(tasks) {
    const now = new Date();
    const lastWeek = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const previousWeek = new Date(now - 14 * 24 * 60 * 60 * 1000);

    const lastWeekCompleted = tasks.filter(t => 
      t.completedAt && new Date(t.completedAt) >= lastWeek
    ).length;

    const previousWeekCompleted = tasks.filter(t => 
      t.completedAt && 
      new Date(t.completedAt) >= previousWeek && 
      new Date(t.completedAt) < lastWeek
    ).length;

    if (previousWeekCompleted === 0) return 'insufficient-data';
    
    const change = ((lastWeekCompleted - previousWeekCompleted) / previousWeekCompleted * 100);
    
    if (change > 10) return 'improving';
    if (change < -10) return 'declining';
    return 'stable';
  }

  analyzeResponseTimes(conversations) {
    // Analizar patrones de tiempo de respuesta
    const responseTimes = [];
    
    for (let i = 1; i < conversations.length; i++) {
      const prev = conversations[i-1];
      const current = conversations[i];
      
      if (prev.from === 'user' && current.from === 'eva') {
        const responseTime = new Date(current.timestamp) - new Date(prev.timestamp);
        responseTimes.push(responseTime);
      }
    }

    if (responseTimes.length === 0) {
      return { avgResponseTime: 0, pattern: 'no-data' };
    }

    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    
    return {
      avgResponseTimeSeconds: (avgResponseTime / 1000).toFixed(1),
      fastResponses: responseTimes.filter(t => t < 5000).length,
      slowResponses: responseTimes.filter(t => t > 30000).length,
      pattern: this.classifyResponsePattern(avgResponseTime)
    };
  }

  classifyResponsePattern(avgTime) {
    if (avgTime < 10000) return 'very-responsive';
    if (avgTime < 30000) return 'responsive';
    if (avgTime < 60000) return 'moderate';
    return 'thoughtful';
  }

  generateProductivityInsights(behaviorData) {
    const insights = [];
    
    if (behaviorData.productivityAnalysis) {
      const peakHours = behaviorData.productivityAnalysis.peakPerformanceHours;
      if (peakHours && peakHours.peakHours.length > 0) {
        insights.push({
          type: 'peak-performance',
          insight: `Tu productividad es máxima entre ${peakHours.peakHours[0].timeLabel} y ${peakHours.peakHours[1]?.timeLabel || 'las siguientes horas'}`,
          recommendation: 'Programa tareas complejas durante estos horarios',
          impact: 'high',
          confidence: 0.85
        });
      }
    }

    return insights;
  }

  generateCommunicationInsights(behaviorData) {
    const insights = [];
    
    if (behaviorData.communicationAnalysis) {
      const responseTime = behaviorData.communicationAnalysis.responseTimePatterns;
      if (responseTime && responseTime.pattern === 'very-responsive') {
        insights.push({
          type: 'communication-efficiency',
          insight: 'Respondes muy rápidamente a mensajes (promedio < 10 segundos)',
          recommendation: 'Considera tomar más tiempo para respuestas complejas',
          impact: 'medium',
          confidence: 0.75
        });
      }
    }

    return insights;
  }

  // ===========================================
  // 🔧 MÉTODOS UTILITARIOS
  // ===========================================

  getTimeLabel(hour) {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  }

  identifyTopPerformanceWindow(peakHours) {
    if (peakHours.length < 2) return null;
    
    const start = Math.min(...peakHours.map(h => h.hour));
    const end = Math.max(...peakHours.map(h => h.hour));
    
    return {
      start: this.getTimeLabel(start),
      end: this.getTimeLabel(end),
      duration: end - start,
      recommendation: `Ventana óptima de ${end - start} horas para trabajo complejo`
    };
  }

  async getBehaviorAnalytics(userId) {
    if (this.analyticsCache.has(`behavior_${userId}`)) {
      return this.analyticsCache.get(`behavior_${userId}`);
    }
    
    return await this.analyzeBehaviorPatterns(userId);
  }

  getFallbackAnalytics(userId) {
    return {
      productivityAnalysis: { peakPerformanceHours: { peakHours: [] } },
      communicationAnalysis: { responseTimePatterns: { pattern: 'no-data' } },
      taskManagementAnalysis: { completionPatterns: { completionRate: 0 } },
      optimizationInsights: { actionablePriorities: [] },
      timestamp: new Date()
    };
  }
}

module.exports = BehaviorAnalyticsService;
