/**
 * 🧠💝 Eva Emotional Intelligence Service
 * 
 * Análisis de sentimientos multi-dimensional y adaptación emocional
 * Capacidades:
 * - Análisis de estado emocional en tiempo real
 * - Memoria emocional contextual
 * - Adaptación de personalidad según estado del usuario
 * - Detección de patrones emocionales y estrés
 * - Recomendaciones empáticas personalizadas
 */

class EmotionalIntelligenceService {
  constructor() {
    this.emotionalKeywords = {
      stress: {
        high: ['estresado', 'presionado', 'agobiado', 'abrumado', 'ansioso', 'nervioso', 'tensión'],
        medium: ['preocupado', 'inquieto', 'intranquilo', 'occupied', 'busy'],
        indicators: ['deadline', 'urgente', 'problema', 'crisis', 'difícil']
      },
      motivation: {
        high: ['motivado', 'entusiasmado', 'emocionado', 'inspired', 'energético'],
        low: ['cansado', 'desmotivado', 'aburrido', 'tired', 'lazy', 'sin ganas'],
        indicators: ['objetivo', 'meta', 'logro', 'éxito', 'achievement']
      },
      confidence: {
        high: ['seguro', 'confiado', 'capaz', 'competente', 'strong'],
        low: ['inseguro', 'dudoso', 'uncertain', 'worried', 'concerned'],
        indicators: ['presentación', 'reunión importante', 'decisión', 'challenge']
      },
      workload: {
        overwhelmed: ['mucho trabajo', 'sobrecargado', 'no tengo tiempo', 'too much'],
        balanced: ['manejable', 'controlled', 'organized', 'on track'],
        underutilized: ['aburrido', 'poco trabajo', 'free time', 'nothing to do']
      }
    };

    this.emotionalPatterns = new Map();
    this.contextualMemory = new Map();
  }

  /**
   * Analiza el estado emocional de un mensaje
   */
  async analyzeEmotionalState(message, userId, context = {}) {
    console.log('🧠💝 Analyzing emotional state...');
    
    try {
      const basicAnalysis = this.performBasicSentimentAnalysis(message);
      const stressLevel = this.detectStressLevel(message, context);
      const motivationLevel = this.detectMotivationLevel(message);
      const confidenceLevel = this.detectConfidenceLevel(message);
      const urgencyLevel = this.detectUrgencyLevel(message, context);
      const workloadState = this.analyzeWorkloadState(message);
      
      // Análisis contextual basado en histórico
      const historicalContext = await this.getEmotionalHistory(userId);
      const patterns = this.detectEmotionalPatterns(userId, basicAnalysis);
      
      const emotionalProfile = {
        currentState: {
          overall: basicAnalysis.overall,
          stress: stressLevel,
          motivation: motivationLevel,
          confidence: confidenceLevel,
          urgency: urgencyLevel,
          workload: workloadState,
          timestamp: new Date()
        },
        historicalContext,
        patterns,
        recommendations: this.generateEmotionalRecommendations({
          stress: stressLevel,
          motivation: motivationLevel,
          confidence: confidenceLevel,
          workload: workloadState
        }),
        adaptations: this.suggestPersonalityAdaptations({
          stress: stressLevel,
          motivation: motivationLevel,
          confidence: confidenceLevel
        })
      };

      // Guardar en memoria emocional
      await this.saveEmotionalState(userId, emotionalProfile);
      
      console.log('✅ Emotional analysis completed:', {
        overall: emotionalProfile.currentState.overall,
        stress: emotionalProfile.currentState.stress,
        recommendations: emotionalProfile.recommendations.length
      });

      return emotionalProfile;
    } catch (error) {
      console.error('❌ Error in emotional analysis:', error);
      return this.getDefaultEmotionalState();
    }
  }

  /**
   * Análisis básico de sentimientos
   */
  performBasicSentimentAnalysis(message) {
    const text = message.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;

    // Palabras positivas
    const positiveWords = [
      'bien', 'bueno', 'excelente', 'perfecto', 'genial', 'fantástico',
      'great', 'good', 'excellent', 'perfect', 'amazing', 'wonderful',
      'feliz', 'contento', 'satisfecho', 'happy', 'pleased', 'excited'
    ];

    // Palabras negativas
    const negativeWords = [
      'mal', 'malo', 'terrible', 'horrible', 'awful', 'bad', 'worst',
      'triste', 'sad', 'angry', 'frustrated', 'disappointed', 'upset',
      'problema', 'error', 'fallo', 'problem', 'issue', 'wrong'
    ];

    // Contar coincidencias
    positiveWords.forEach(word => {
      if (text.includes(word)) positiveScore++;
    });

    negativeWords.forEach(word => {
      if (text.includes(word)) negativeScore++;
    });

    // Determinar sentimiento general
    let overall = 'neutral';
    if (positiveScore > negativeScore) overall = 'positive';
    else if (negativeScore > positiveScore) overall = 'negative';

    return {
      overall,
      scores: { positive: positiveScore, negative: negativeScore, neutral: neutralScore },
      confidence: Math.abs(positiveScore - negativeScore) / (positiveScore + negativeScore + 1)
    };
  }

  /**
   * Detecta nivel de estrés
   */
  detectStressLevel(message, context) {
    const text = message.toLowerCase();
    let stressScore = 0;

    // Palabras de estrés alto
    this.emotionalKeywords.stress.high.forEach(word => {
      if (text.includes(word)) stressScore += 3;
    });

    // Palabras de estrés medio
    this.emotionalKeywords.stress.medium.forEach(word => {
      if (text.includes(word)) stressScore += 2;
    });

    // Indicadores contextuales
    this.emotionalKeywords.stress.indicators.forEach(indicator => {
      if (text.includes(indicator)) stressScore += 1;
    });

    // Contexto temporal (proximidad de deadlines)
    if (context.upcomingDeadlines) {
      stressScore += context.upcomingDeadlines.length;
    }

    // Determinar nivel
    if (stressScore >= 5) return 'high';
    if (stressScore >= 2) return 'medium';
    return 'low';
  }

  /**
   * Detecta nivel de motivación
   */
  detectMotivationLevel(message) {
    const text = message.toLowerCase();
    let motivationScore = 0;

    this.emotionalKeywords.motivation.high.forEach(word => {
      if (text.includes(word)) motivationScore += 2;
    });

    this.emotionalKeywords.motivation.low.forEach(word => {
      if (text.includes(word)) motivationScore -= 2;
    });

    this.emotionalKeywords.motivation.indicators.forEach(indicator => {
      if (text.includes(indicator)) motivationScore += 1;
    });

    if (motivationScore >= 2) return 'high';
    if (motivationScore <= -2) return 'low';
    return 'medium';
  }

  /**
   * Detecta nivel de confianza
   */
  detectConfidenceLevel(message) {
    const text = message.toLowerCase();
    let confidenceScore = 0;

    this.emotionalKeywords.confidence.high.forEach(word => {
      if (text.includes(word)) confidenceScore += 2;
    });

    this.emotionalKeywords.confidence.low.forEach(word => {
      if (text.includes(word)) confidenceScore -= 2;
    });

    // Indicadores de situaciones que afectan confianza
    this.emotionalKeywords.confidence.indicators.forEach(indicator => {
      if (text.includes(indicator)) confidenceScore -= 1;
    });

    if (confidenceScore >= 1) return 'high';
    if (confidenceScore <= -1) return 'low';
    return 'medium';
  }

  /**
   * Detecta nivel de urgencia
   */
  detectUrgencyLevel(message, context) {
    const text = message.toLowerCase();
    const urgencyWords = ['urgente', 'urgent', 'ya', 'ahora', 'immediately', 'asap', 'pronto'];
    const timeWords = ['hoy', 'today', 'mañana', 'tomorrow', 'esta semana', 'this week'];
    
    let urgencyScore = 0;
    
    urgencyWords.forEach(word => {
      if (text.includes(word)) urgencyScore += 3;
    });

    timeWords.forEach(word => {
      if (text.includes(word)) urgencyScore += 1;
    });

    if (urgencyScore >= 3) return 'high';
    if (urgencyScore >= 1) return 'medium';
    return 'low';
  }

  /**
   * Analiza estado de carga de trabajo
   */
  analyzeWorkloadState(message) {
    const text = message.toLowerCase();
    let workloadScore = 0;

    this.emotionalKeywords.workload.overwhelmed.forEach(phrase => {
      if (text.includes(phrase)) workloadScore += 2;
    });

    this.emotionalKeywords.workload.underutilized.forEach(phrase => {
      if (text.includes(phrase)) workloadScore -= 2;
    });

    if (workloadScore >= 2) return 'overwhelmed';
    if (workloadScore <= -2) return 'underutilized';
    return 'balanced';
  }

  /**
   * Genera recomendaciones basadas en estado emocional
   */
  generateEmotionalRecommendations(emotionalState) {
    const recommendations = [];

    // Recomendaciones para estrés
    if (emotionalState.stress === 'high') {
      recommendations.push({
        type: 'stress_management',
        priority: 'high',
        message: 'Detecté un alto nivel de estrés. Te sugiero tomar un descanso de 10 minutos antes de continuar.',
        actions: ['schedule_break', 'breathing_exercise', 'prioritize_tasks']
      });
    }

    // Recomendaciones para motivación baja
    if (emotionalState.motivation === 'low') {
      recommendations.push({
        type: 'motivation_boost',
        priority: 'medium',
        message: 'Parece que tu energía está baja. ¿Qué tal si empezamos con una tarea pequeña y fácil de completar?',
        actions: ['break_down_tasks', 'celebrate_small_wins', 'change_environment']
      });
    }

    // Recomendaciones para confianza baja
    if (emotionalState.confidence === 'low') {
      recommendations.push({
        type: 'confidence_building',
        priority: 'medium',
        message: 'Te ayudo a prepararte mejor para que te sientas más seguro. Podemos revisar los puntos clave.',
        actions: ['preparation_help', 'practice_session', 'strengths_reminder']
      });
    }

    // Recomendaciones para sobrecarga de trabajo
    if (emotionalState.workload === 'overwhelmed') {
      recommendations.push({
        type: 'workload_management',
        priority: 'high',
        message: 'Tienes mucho en tu plato. Te ayudo a priorizar y reorganizar tus tareas.',
        actions: ['prioritize_tasks', 'delegate_options', 'timeline_adjustment']
      });
    }

    return recommendations;
  }

  /**
   * Sugiere adaptaciones de personalidad de Eva
   */
  suggestPersonalityAdaptations(emotionalState) {
    const adaptations = {
      communicationStyle: 'supportive',
      responseLength: 'medium',
      toneAdjustments: [],
      suggestionStyle: 'gentle'
    };

    // Adaptaciones para estrés alto
    if (emotionalState.stress === 'high') {
      adaptations.communicationStyle = 'calm_and_reassuring';
      adaptations.toneAdjustments.push('use_calming_language');
      adaptations.suggestionStyle = 'step_by_step';
    }

    // Adaptaciones para motivación baja
    if (emotionalState.motivation === 'low') {
      adaptations.communicationStyle = 'encouraging_and_energetic';
      adaptations.toneAdjustments.push('use_motivational_language');
      adaptations.suggestionStyle = 'enthusiastic';
    }

    // Adaptaciones para confianza baja
    if (emotionalState.confidence === 'low') {
      adaptations.communicationStyle = 'supportive_and_affirming';
      adaptations.toneAdjustments.push('highlight_strengths');
      adaptations.suggestionStyle = 'confidence_building';
    }

    return adaptations;
  }

  /**
   * Detecta patrones emocionales
   */
  detectEmotionalPatterns(userId, currentAnalysis) {
    if (!this.emotionalPatterns.has(userId)) {
      this.emotionalPatterns.set(userId, []);
    }

    const userPatterns = this.emotionalPatterns.get(userId);
    userPatterns.push({
      timestamp: new Date(),
      analysis: currentAnalysis
    });

    // Mantener solo últimos 50 análisis
    if (userPatterns.length > 50) {
      userPatterns.shift();
    }

    // Detectar patrones temporales
    const patterns = {
      stressFrequency: this.calculateStressFrequency(userPatterns),
      motivationTrends: this.calculateMotivationTrends(userPatterns),
      timeOfDayPatterns: this.analyzeTimeOfDayPatterns(userPatterns)
    };

    return patterns;
  }

  /**
   * Obtiene historial emocional del usuario
   */
  async getEmotionalHistory(userId) {
    try {
      // En una implementación real, esto vendría de la base de datos
      // Por ahora, usamos memoria local
      const history = this.emotionalPatterns.get(userId) || [];
      
      return {
        recentStates: history.slice(-10),
        averageStress: this.calculateAverageStress(history),
        trends: this.calculateEmotionalTrends(history)
      };
    } catch (error) {
      console.error('Error getting emotional history:', error);
      return { recentStates: [], averageStress: 'medium', trends: {} };
    }
  }

  /**
   * Guarda estado emocional en memoria/base de datos
   */
  async saveEmotionalState(userId, emotionalProfile) {
    try {
      // En una implementación real, esto se guardaría en MongoDB
      // Por ahora, mantenemos en memoria
      if (!this.contextualMemory.has(userId)) {
        this.contextualMemory.set(userId, []);
      }
      
      const userMemory = this.contextualMemory.get(userId);
      userMemory.push({
        timestamp: new Date(),
        profile: emotionalProfile
      });

      // Mantener solo últimos 100 registros
      if (userMemory.length > 100) {
        userMemory.shift();
      }

      console.log('✅ Emotional state saved for user:', userId);
    } catch (error) {
      console.error('Error saving emotional state:', error);
    }
  }

  /**
   * Estado emocional por defecto para fallback
   */
  getDefaultEmotionalState() {
    return {
      currentState: {
        overall: 'neutral',
        stress: 'medium',
        motivation: 'medium',
        confidence: 'medium',
        urgency: 'low',
        workload: 'balanced',
        timestamp: new Date()
      },
      historicalContext: { recentStates: [], averageStress: 'medium', trends: {} },
      patterns: { stressFrequency: 'normal', motivationTrends: 'stable', timeOfDayPatterns: {} },
      recommendations: [],
      adaptations: {
        communicationStyle: 'supportive',
        responseLength: 'medium',
        toneAdjustments: [],
        suggestionStyle: 'gentle'
      }
    };
  }

  // Métodos auxiliares para cálculos de patrones
  calculateStressFrequency(patterns) {
    const stressCount = patterns.filter(p => p.analysis.overall === 'negative').length;
    const total = patterns.length;
    const frequency = total > 0 ? stressCount / total : 0;
    
    if (frequency > 0.6) return 'high';
    if (frequency > 0.3) return 'medium';
    return 'low';
  }

  calculateMotivationTrends(patterns) {
    // Implementación simplificada
    return 'stable';
  }

  analyzeTimeOfDayPatterns(patterns) {
    // Implementación simplificada
    return {};
  }

  calculateAverageStress(history) {
    if (history.length === 0) return 'medium';
    // Implementación simplificada
    return 'medium';
  }

  calculateEmotionalTrends(history) {
    // Implementación simplificada
    return {};
  }
}

module.exports = EmotionalIntelligenceService;
