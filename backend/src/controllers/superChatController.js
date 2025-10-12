/**
 * 🚀 Eva Super-Chat Controller 
 * Sistema de chat avanzado con inteligencia predictiva,
 * análisis de comportamiento y memoria a largo plazo
 */

const UserContext = require('../models/UserContext');
const User = require('../models/User');
const openaiService = require('../services/openaiService');
const intelligenceService = require('../services/intelligenceService');
const AdvancedMemoryService = require('../services/memoryService');
const BehaviorAnalyticsService = require('../services/behaviorAnalytics');
const PredictiveIntelligenceService = require('../services/predictiveIntelligence');
const EmotionalIntelligenceService = require('../services/emotionalIntelligence');
const DocumentProcessor = require('../services/documentProcessor');
const VisionAnalyzer = require('../services/visionAnalyzer');
const AudioProcessor = require('../services/audioProcessor');
const emailService = require('../services/emailService');
const calendarService = require('../services/calendarService');
const googleWorkspaceService = require('../services/googleWorkspaceService');
const Conversation = require('../models/Conversation');
const Contact = require('../models/Contact');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Note = require('../models/Note');

class SuperChatController {
  constructor() {
    this.activeThreads = new Map();
    this.memoryService = new AdvancedMemoryService();
    this.behaviorService = new BehaviorAnalyticsService();
    this.predictiveService = new PredictiveIntelligenceService();
    this.emotionalService = new EmotionalIntelligenceService();
    
    // Inicializar servicios multimodales
    this.documentProcessor = new DocumentProcessor();
    this.visionAnalyzer = new VisionAnalyzer();
    this.audioProcessor = new AudioProcessor();
  }

  /**
   * 🚀 MAIN METHOD: Super-Advanced Chat with Predictive Intelligence
   */
  async sendMessage(req, res) {
    console.log('🚀 Eva Super-Chat: Processing message with advanced intelligence...');
    
    try {
      const { message, userId = 'gaston', sessionId } = req.body;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Message cannot be empty'
        });
      }

            // 🧠 STEP 1: Build advanced memory profile (DISABLED FOR TESTING)
      console.log('🧠 Building advanced memory profile...');
      // const memoryProfile = await this.memoryService.buildUserProfile(userId);
      const memoryProfile = { preferences: {}, habits: {}, relationships: {}, goals: {}, workingPatterns: {}, communicationStyle: {}, lastUpdated: new Date() };
      
      // 📊 STEP 2: Analyze behavior patterns (DISABLED FOR TESTING)
      console.log('📊 Analyzing behavior patterns...');
      // const behaviorAnalysis = await this.behaviorAnalytics.analyzeUserBehavior(userId);
      const behaviorAnalysis = { averageSessionDuration: 10, preferredTopics: [], communicationAnalysis: {}, timePatterns: {} };
      
      // 🔮 STEP 3: Generate predictive insights (DISABLED FOR TESTING)
      console.log('🔮 Generating predictive insights...');
      // const predictions = await this.predictiveIntelligence.generatePredictions(userId, memoryProfile, behaviorAnalysis);
      const predictions = { immediateNeeds: [], upcomingActions: [], optimizationSuggestions: [] };

      // 💝 STEP 3.5: Analyze emotional state and adapt personality
      console.log('💝 Analyzing emotional intelligence...');
      const emotionalProfile = await this.emotionalService.analyzeEmotionalState(message, userId, {
        memoryProfile,
        behaviorAnalysis,
        upcomingDeadlines: [] // TODO: get from calendar
      });
      
      // 🎯 STEP 4: Build enhanced intelligent context (DISABLED FOR TESTING)
      console.log('🎯 Building enhanced intelligent context...');
      // const intelligentContext = await this.buildIntelligentContext(message, memoryProfile, behaviorAnalysis, predictions, userId);
      const intelligentContext = { analysis: { intent: 'general', urgency: 'medium' }, contextData: {}, relevanceScore: 0.8 };
      
      // 💡 STEP 5: Enhance context with predictions, behavior, and emotions
      const superEnhancedContext = {
        ...intelligentContext,
        userProfile: {
          preferences: memoryProfile.preferences || {},
          workingPatterns: memoryProfile.workingPatterns || {},
          communicationStyle: memoryProfile.communicationStyle || 'professional'
        },
        emotionalState: {
          current: emotionalProfile.currentState,
          recommendations: emotionalProfile.recommendations,
          adaptations: emotionalProfile.adaptations
        },
        predictions: {
          immediateNeeds: predictions.immediateNeeds,
          upcomingActions: predictions.upcomingActions,
          optimizationSuggestions: predictions.optimizationSuggestions
        },
        behaviorInsights: {
          productivityState: behaviorAnalysis.productivityAnalysis?.peakPerformanceHours,
          communicationPattern: behaviorAnalysis.communicationAnalysis?.responseTimePatterns,
          currentOptimalTiming: this.getCurrentOptimalTiming(behaviorAnalysis)
        },
        emotionalIntelligence: {
          detectedEmotions: emotionalProfile.currentState,
          recommendations: emotionalProfile.recommendations,
          personalityAdaptations: emotionalProfile.adaptations
        }
      };
      
      // 💾 STEP 6: Save user message with enhanced intelligence (With error handling)
      let userConversation;
      try {
        userConversation = await this.saveUserMessage(message, userId, superEnhancedContext, sessionId);
      } catch (error) {
        console.log('💾 Database save failed, continuing with mock conversation');
        userConversation = { _id: 'mock-user-conversation-' + Date.now() };
      }
      
      // 🤖 STEP 7: Generate Eva's super-intelligent response
      console.log('🤖 Generating super-intelligent response...');
      
      // 📧📅 STEP 7.1: Check for Google Workspace intentions (Email & Calendar)
      const googleWorkspaceResult = await this.processGoogleWorkspaceIntentions(message, userId);
      
      const response = await this.generateSuperIntelligentResponse(message, superEnhancedContext, userId, googleWorkspaceResult);
      
      // 💾 STEP 8: Save Eva's response (With error handling)
      let assistantConversation;
      try {
        assistantConversation = await this.saveAssistantMessage(response.content, userId, response.metadata, sessionId);
      } catch (error) {
        console.log('💾 Database save failed, continuing with mock conversation');
        assistantConversation = { _id: 'mock-assistant-conversation-' + Date.now() };
      }
      
      // ⚡ STEP 9: Process proactive actions
      const proactiveActions = await this.processProactiveActions(response.actions || [], predictions, userId);
      
      // 🎓 STEP 10: Learn from this interaction (With error handling)
      try {
        await this.memoryService.learnFromInteraction(userId, {
          type: 'chat',
          intent: intelligentContext.analysis?.intent,
          success: true,
          context: superEnhancedContext,
          predictions: predictions
        });
      } catch (error) {
        console.log('🎓 Learning failed, continuing without learning update');
      }
      
      // 🎉 STEP 11: Build super-enhanced response
      const superResponse = {
        success: true,
        response: response.content,
        metadata: {
          intelligence: {
            intent: intelligentContext.analysis?.intent || 'general',
            urgency: intelligentContext.analysis?.urgency || 'medium',
            relevanceScore: intelligentContext.relevanceScore || 0.8,
            contextUsed: {
              contacts: intelligentContext.contextData?.contacts?.length || 0,
              tasks: intelligentContext.contextData?.tasks?.length || 0,
              projects: intelligentContext.contextData?.projects?.length || 0,
              notes: intelligentContext.contextData?.notes?.length || 0
            }
          },
          predictions: {
            immediateNeeds: predictions.immediateNeeds.slice(0, 3),
            upcomingActions: predictions.upcomingActions.slice(0, 3),
            optimizations: predictions.optimizationSuggestions.slice(0, 2)
          },
          behaviorInsights: {
            currentState: this.getCurrentUserState(behaviorAnalysis),
            recommendations: this.getPersonalizedRecommendations(behaviorAnalysis, predictions)
          },
          emotionalIntelligence: {
            detectedState: emotionalProfile.currentState,
            recommendations: emotionalProfile.recommendations,
            adaptations: emotionalProfile.adaptations,
            patterns: emotionalProfile.patterns
          },
          proactiveActions: proactiveActions,
          suggestions: response.suggestions || [],
          processingTime: response.metadata?.processingTime || 0,
          tokensUsed: response.metadata?.tokensUsed || 0
        },
        conversationId: userConversation._id,
        sessionId: sessionId || 'default'
      };

      console.log('✅ Eva Super-Chat: Advanced response generated successfully');
      res.json(superResponse);

    } catch (error) {
      console.error('❌ Error in super chat controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  }

  /**
   * 🧠 Generate super-intelligent response with predictions
   */
  async generateSuperIntelligentResponse(message, enhancedContext, userId, googleWorkspaceResult = null) {
    try {
      // Build enhanced prompt with predictions and behavior analysis
      const enhancedPrompt = this.buildSuperEnhancedPrompt(message, enhancedContext, googleWorkspaceResult);
      
      // Get AI response
      const aiResponse = await openaiService.getChatResponse(enhancedPrompt, userId);
      
      // Parse and enhance the response
      const enhancedResponse = {
        content: aiResponse.response || aiResponse,
        metadata: {
          processingTime: Date.now(),
          tokensUsed: 100 // Placeholder
        },
        actions: this.extractActionsFromResponse(aiResponse.response || aiResponse),
        suggestions: this.generateIntelligentSuggestions(enhancedContext),
        googleWorkspace: googleWorkspaceResult // Include Google Workspace results
      };
      
      // If Google Workspace action was performed, enhance the response
      if (googleWorkspaceResult && googleWorkspaceResult.hasIntent) {
        let workspaceMessage = '';
        
        if (googleWorkspaceResult.email) {
          workspaceMessage += googleWorkspaceResult.email.message + ' ';
        }
        
        if (googleWorkspaceResult.calendar) {
          workspaceMessage += googleWorkspaceResult.calendar.message + ' ';
        }
        
        if (workspaceMessage) {
          enhancedResponse.content = workspaceMessage.trim() + '\n\n' + enhancedResponse.content;
        }
      }
      
      // If user needs Google auth, add that to response
      if (googleWorkspaceResult && googleWorkspaceResult.needsAuth) {
        enhancedResponse.content = googleWorkspaceResult.message + '\n\n' + enhancedResponse.content;
      }
      
      return enhancedResponse;
    } catch (error) {
      console.error('❌ Error generating super-intelligent response:', error);
      return {
        content: 'Lo siento, hubo un error procesando tu mensaje. ¿Podrías intentar de nuevo?',
        metadata: { processingTime: 0, tokensUsed: 0 },
        actions: [],
        suggestions: []
      };
    }
  }

  /**
   * 🎯 Build super-enhanced prompt with predictions
   */
  buildSuperEnhancedPrompt(message, enhancedContext, googleWorkspaceResult = null) {
    let prompt = `Usuario: ${message}\n\n`;
    
    // Add Google Workspace context if available
    if (googleWorkspaceResult) {
      prompt += `GOOGLE WORKSPACE:\n`;
      if (googleWorkspaceResult.needsAuth) {
        prompt += `- Estado: Usuario no autenticado con Google\n`;
        prompt += `- Acción requerida: Iniciar sesión con Google para enviar emails y crear eventos\n`;
      } else if (googleWorkspaceResult.hasIntent) {
        prompt += `- Estado: Usuario autenticado con Google\n`;
        if (googleWorkspaceResult.email) {
          prompt += `- Email: ${googleWorkspaceResult.email.success ? 'Enviado exitosamente' : 'Error o información incompleta'}\n`;
        }
        if (googleWorkspaceResult.calendar) {
          prompt += `- Calendar: ${googleWorkspaceResult.calendar.success ? 'Evento creado exitosamente' : 'Error o información incompleta'}\n`;
        }
      }
      prompt += `\n`;
    }
    
    // Add user profile context
    if (enhancedContext.userProfile) {
      prompt += `PERFIL DE USUARIO:\n`;
      if (enhancedContext.userProfile.workingPatterns?.peakHours) {
        prompt += `- Horarios productivos: ${enhancedContext.userProfile.workingPatterns.peakHours.join(', ')}\n`;
      }
      if (enhancedContext.userProfile.communicationStyle?.formalityLevel) {
        prompt += `- Estilo de comunicación: ${enhancedContext.userProfile.communicationStyle.formalityLevel}\n`;
      }
      prompt += `\n`;
    }

    // Add predictions
    if (enhancedContext.predictions) {
      prompt += `PREDICCIONES ACTUALES:\n`;
      if (enhancedContext.predictions.immediateNeeds?.length > 0) {
        prompt += `- Necesidades inmediatas: ${enhancedContext.predictions.immediateNeeds.map(n => n.description).join(', ')}\n`;
      }
      if (enhancedContext.predictions.upcomingActions?.length > 0) {
        prompt += `- Acciones próximas: ${enhancedContext.predictions.upcomingActions.map(a => a.description || a.action).join(', ')}\n`;
      }
      prompt += `\n`;
    }

    // Add behavior insights
    if (enhancedContext.behaviorInsights) {
      prompt += `INSIGHTS DE COMPORTAMIENTO:\n`;
      if (enhancedContext.behaviorInsights.currentOptimalTiming) {
        prompt += `- Momento óptimo actual: ${enhancedContext.behaviorInsights.currentOptimalTiming}\n`;
      }
      prompt += `\n`;
    }

    // Add emotional intelligence context
    if (enhancedContext.emotionalIntelligence) {
      prompt += `ANÁLISIS EMOCIONAL:\n`;
      const emotions = enhancedContext.emotionalIntelligence.detectedEmotions;
      if (emotions) {
        prompt += `- Estado general: ${emotions.overall}\n`;
        prompt += `- Nivel de estrés: ${emotions.stress}\n`;
        prompt += `- Motivación: ${emotions.motivation}\n`;
        prompt += `- Confianza: ${emotions.confidence}\n`;
        prompt += `- Urgencia: ${emotions.urgency}\n`;
        prompt += `- Carga de trabajo: ${emotions.workload}\n`;
      }
      
      const recommendations = enhancedContext.emotionalIntelligence.recommendations;
      if (recommendations?.length > 0) {
        prompt += `- Recomendaciones emocionales: ${recommendations.map(r => r.message).join('; ')}\n`;
      }

      const adaptations = enhancedContext.emotionalIntelligence.personalityAdaptations;
      if (adaptations) {
        prompt += `- Adapta tu respuesta con estilo: ${adaptations.communicationStyle}\n`;
        prompt += `- Tono recomendado: ${adaptations.suggestionStyle}\n`;
      }
      prompt += `\n`;
    }

    // Add existing context data
    if (enhancedContext.contextData) {
      if (enhancedContext.contextData.contacts?.length > 0) {
        prompt += `CONTACTOS RELEVANTES:\n${enhancedContext.contextData.contacts.map(c => `- ${c.name}: ${c.email || ''}`).join('\n')}\n\n`;
      }
      if (enhancedContext.contextData.tasks?.length > 0) {
        prompt += `TAREAS RELEVANTES:\n${enhancedContext.contextData.tasks.map(t => `- ${t.title} (${t.priority || 'normal'})`).join('\n')}\n\n`;
      }
    }

    prompt += `\nResponde como Eva, un asistente inteligente con inteligencia emocional avanzada y capacidades multimodales. 

CAPACIDADES MULTIMODALES ESPECÍFICAS DE EVA:
🧠 Inteligencia Emocional: Análisis y adaptación según estado emocional
📄 Procesamiento de Documentos: PDF, Word, Excel, PowerPoint, Markdown, CSV, JSON, HTML
👁️ Análisis de Imágenes: OCR, detección de objetos, análisis de UI, gráficos, colores
🎵 Procesamiento de Audio: Transcripción, análisis emocional, identificación de speakers
🔍 Búsqueda Inteligente: Búsqueda en contenido de documentos, imágenes y audio
📊 Comparación de Archivos: Análisis comparativo entre múltiples archivos
📝 Generación de Reportes: Reportes automáticos de reuniones desde audio
🔗 Integración con CRM: Action items automáticos, creación de contactos y tareas

APIs MULTIMODALES DISPONIBLES:
- POST /api/multimodal/process/document - Procesar documentos
- POST /api/multimodal/process/image - Analizar imágenes  
- POST /api/multimodal/process/audio - Procesar audio
- POST /api/multimodal/search/document - Buscar en documentos
- POST /api/multimodal/search/image - Buscar texto en imágenes
- POST /api/multimodal/search/audio - Buscar en transcripciones
- POST /api/multimodal/compare/documents - Comparar documentos
- POST /api/multimodal/compare/images - Comparar imágenes
- POST /api/multimodal/compare/audios - Comparar audios
- POST /api/multimodal/meeting/report - Generar reporte de reunión

INSTRUCCIONES:
- Usa toda la información contextual, emocional y predictiva para dar respuestas empáticas
- Adapta tu personalidad y estilo según el estado emocional detectado del usuario
- Cuando el usuario mencione documentos, imágenes o audio, SIEMPRE menciona las APIs específicas
- Proporciona ejemplos concretos de uso de las APIs cuando sea relevante
- Explica exactamente qué puede lograr cada API y cómo usarla`;

    return prompt;
  }

  /**
   * ⚡ Process proactive actions
   */
  async processProactiveActions(responseActions, predictions, userId) {
    const proactiveActions = [];
    
    try {
      // Process immediate needs
      if (predictions.immediateNeeds?.length > 0) {
        for (const need of predictions.immediateNeeds.slice(0, 2)) {
          if (need.probability > 0.7) {
            proactiveActions.push({
              type: 'proactive_suggestion',
              action: need.suggestedAction,
              reasoning: need.reasoning,
              confidence: need.probability
            });
          }
        }
      }

      // Process optimization suggestions
      if (predictions.optimizationSuggestions?.length > 0) {
        for (const suggestion of predictions.optimizationSuggestions.slice(0, 1)) {
          proactiveActions.push({
            type: 'optimization',
            action: suggestion.action || suggestion.type,
            reasoning: suggestion.reasoning || suggestion.description,
            confidence: suggestion.confidence || 0.6
          });
        }
      }

      return proactiveActions;
    } catch (error) {
      console.error('❌ Error processing proactive actions:', error);
      return [];
    }
  }

  /**
   * 📊 Get current user state
   */
  getCurrentUserState(behaviorAnalysis) {
    try {
      const currentHour = new Date().getHours();
      let state = 'active';

      if (behaviorAnalysis.productivityAnalysis?.peakPerformanceHours) {
        const peakHours = behaviorAnalysis.productivityAnalysis.peakPerformanceHours.peakHours || [];
        if (peakHours.some(peak => peak.hour === currentHour)) {
          state = 'peak-productivity';
        }
      }

      if (behaviorAnalysis.stressAnalysis?.burnoutRisk?.level === 'high') {
        state = 'high-stress';
      }

      return state;
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * 💡 Get personalized recommendations
   */
  getPersonalizedRecommendations(behaviorAnalysis, predictions) {
    const recommendations = [];
    
    try {
      // Productivity recommendations
      if (behaviorAnalysis.productivityAnalysis?.peakPerformanceHours) {
        const nextPeakHour = this.getNextPeakHour(behaviorAnalysis.productivityAnalysis.peakPerformanceHours);
        if (nextPeakHour) {
          recommendations.push(`Tu próxima hora pico de productividad es a las ${nextPeakHour} - perfecto para tareas complejas`);
        }
      }

      // Stress management
      if (behaviorAnalysis.stressAnalysis?.burnoutRisk?.level === 'medium') {
        recommendations.push('Considera tomar un break de 15 minutos para mantener tu energía');
      }

      return recommendations.slice(0, 2);
    } catch (error) {
      return ['Continúa con tu excelente trabajo'];
    }
  }

  /**
   * ⏰ Get current optimal timing
   */
  getCurrentOptimalTiming(behaviorAnalysis) {
    try {
      const currentHour = new Date().getHours();
      
      if (currentHour >= 9 && currentHour <= 11) {
        return 'morning-peak';
      } else if (currentHour >= 14 && currentHour <= 16) {
        return 'afternoon-focus';
      } else {
        return 'moderate-energy';
      }
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * 🕐 Get next peak hour
   */
  getNextPeakHour(peakHoursData) {
    try {
      const currentHour = new Date().getHours();
      const peakHours = peakHoursData.peakHours || [];
      
      const nextPeak = peakHours.find(peak => peak.hour > currentHour);
      return nextPeak ? this.formatHour(nextPeak.hour) : null;
    } catch (error) {
      return null;
    }
  }

  formatHour(hour) {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  }

  /**
   * 🔍 Extract actions from response
   */
  extractActionsFromResponse(content) {
    const actions = [];
    
    try {
      // Look for action keywords
      const actionKeywords = [
        { keyword: 'crear tarea', action: 'create_task' },
        { keyword: 'agendar', action: 'schedule_event' },
        { keyword: 'recordar', action: 'create_reminder' },
        { keyword: 'contactar', action: 'contact_person' }
      ];

      actionKeywords.forEach(item => {
        if (content.toLowerCase().includes(item.keyword)) {
          actions.push({
            type: item.action,
            description: `Detected: ${item.keyword}`,
            confidence: 0.7
          });
        }
      });

      return actions;
    } catch (error) {
      return [];
    }
  }

  /**
   * 💡 Generate intelligent suggestions
   */
  generateIntelligentSuggestions(enhancedContext) {
    const suggestions = [];
    
    try {
      // Suggest based on predictions
      if (enhancedContext.predictions?.immediateNeeds?.length > 0) {
        suggestions.push(`¿Te gustaría que ${enhancedContext.predictions.immediateNeeds[0].suggestedAction}?`);
      }

      // Suggest based on behavior insights
      if (enhancedContext.behaviorInsights?.currentOptimalTiming === 'morning-peak') {
        suggestions.push('Es tu hora pico de productividad - ¿qué tal si trabajamos en algo importante?');
      }

      return suggestions.slice(0, 3);
    } catch (error) {
      return ['¿En qué más puedo ayudarte?'];
    }
  }

  /**
   * 💾 Save user message with enhanced intelligence
   */
  async saveUserMessage(message, userId, intelligentContext, sessionId) {
    try {
      const conversation = new Conversation({
        userId,
        message,
        role: 'user' // Fixed: use 'role' instead of 'from'
      });

      return await conversation.save();
    } catch (error) {
      console.error('❌ Error saving user message:', error);
      throw error;
    }
  }

  /**
   * 💾 Save assistant message
   */
  async saveAssistantMessage(response, userId, metadata, sessionId) {
    try {
      const conversation = new Conversation({
        userId,
        message: response, // Use message field for both user and assistant
        role: 'assistant'
      });

      return await conversation.save();
    } catch (error) {
      console.error('❌ Error saving assistant message:', error);
      throw error;
    }
  }

  /**
   * 📚 Get conversation history
   */
  async getConversationHistory(req, res) {
    try {
      const { userId = 'gaston', limit = 50 } = req.query;
      console.log(`📚 Getting conversation history for user: ${userId} (demo mode)`);

      // Demo conversation history
      const demoConversations = [
        {
          _id: 'conv1',
          userId,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          messages: [
            { role: 'user', content: '¿Puedes ayudarme a planificar mi día?' },
            { role: 'assistant', content: 'Por supuesto! Basándome en tus patrones de productividad, te recomiendo comenzar con tareas creativas por la mañana...' }
          ],
          title: 'Planificación del día'
        },
        {
          _id: 'conv2',
          userId,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          messages: [
            { role: 'user', content: 'Analiza mis métricas de productividad' },
            { role: 'assistant', content: 'He analizado tus patrones de trabajo. Muestras un 85% de eficiencia en tareas matutinas...' }
          ],
          title: 'Análisis de productividad'
        },
        {
          _id: 'conv3',
          userId,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
          messages: [
            { role: 'user', content: 'Necesito organizar mis contactos' },
            { role: 'assistant', content: 'Te ayudo a organizar tus contactos. He identificado 5 contactos VIP que requieren seguimiento...' }
          ],
          title: 'Organización de contactos'
        }
      ];

      res.json({
        success: true,
        conversations: demoConversations,
        count: demoConversations.length
      });

    } catch (error) {
      console.error('❌ Error getting conversation history:', error);
      res.json({
        success: true,
        conversations: [],
        count: 0
      });
    }
  }

  /**
   * 📄 Multimodal Content Processing
   * Handles documents, images, and audio files
   */
  async processMultimodalContent(req, res) {
    console.log('📄 Processing multimodal content...');
    
    try {
      const { contentType, filePath, options = {} } = req.body;
      const userId = req.body.userId || 'gaston';

      if (!contentType || !filePath) {
        return res.status(400).json({
          success: false,
          error: 'Content type and file path required'
        });
      }

      let result;
      
      switch (contentType) {
        case 'document':
          result = await this.documentProcessor.processDocument(filePath, options);
          break;
        case 'image':
          result = await this.visionAnalyzer.analyzeImage(filePath, options);
          break;
        case 'audio':
          result = await this.audioProcessor.processAudio(filePath, options);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Unsupported content type'
          });
      }

      // Generar insights inteligentes sobre el contenido
      const insights = await this.generateContentInsights(result, contentType, userId);

      return res.json({
        success: true,
        content: result,
        insights: insights,
        recommendations: await this.generateContentRecommendations(result, contentType),
        processedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error processing multimodal content:', error);
      return res.status(500).json({
        success: false,
        error: 'Error processing content',
        details: error.message
      });
    }
  }

  /**
   * 🔍 Search in Multimodal Content
   */
  async searchInContent(req, res) {
    console.log('🔍 Searching in multimodal content...');
    
    try {
      const { contentType, filePath, query, options = {} } = req.body;

      if (!contentType || !filePath || !query) {
        return res.status(400).json({
          success: false,
          error: 'Content type, file path, and query required'
        });
      }

      let searchResults;
      
      switch (contentType) {
        case 'document':
          searchResults = await this.documentProcessor.searchInDocument(filePath, query, options);
          break;
        case 'image':
          searchResults = await this.visionAnalyzer.searchTextInImage(filePath, query, options);
          break;
        case 'audio':
          searchResults = await this.audioProcessor.searchInAudio(filePath, query, options);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Unsupported content type for search'
          });
      }

      return res.json({
        success: true,
        searchResults: searchResults,
        searchedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error searching in content:', error);
      return res.status(500).json({
        success: false,
        error: 'Error searching content',
        details: error.message
      });
    }
  }

  /**
   * 📊 Compare Multiple Files
   */
  async compareMultimodalContent(req, res) {
    console.log('📊 Comparing multimodal content...');
    
    try {
      const { contentType, filePaths, options = {} } = req.body;

      if (!contentType || !Array.isArray(filePaths) || filePaths.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Content type and at least 2 file paths required'
        });
      }

      let comparison;
      
      switch (contentType) {
        case 'document':
          comparison = await this.documentProcessor.compareDocuments(filePaths, options);
          break;
        case 'image':
          comparison = await this.visionAnalyzer.compareImages(filePaths, options);
          break;
        case 'audio':
          comparison = await this.audioProcessor.compareAudios(filePaths, options);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Unsupported content type for comparison'
          });
      }

      return res.json({
        success: true,
        comparison: comparison,
        comparedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error comparing content:', error);
      return res.status(500).json({
        success: false,
        error: 'Error comparing content',
        details: error.message
      });
    }
  }

  /**
   * 📝 Generate Meeting Report from Audio
   */
  async generateMeetingReport(req, res) {
    console.log('📝 Generating meeting report from audio...');
    
    try {
      const { audioPath, options = {} } = req.body;
      const userId = req.body.userId || 'gaston';

      if (!audioPath) {
        return res.status(400).json({
          success: false,
          error: 'Audio path required'
        });
      }

      const report = await this.audioProcessor.generateMeetingReport(audioPath, options);
      
      // Integrar con memoria y contexto del usuario
      if (report.success) {
        await this.integrateMeetingWithContext(userId, report.report);
      }

      return res.json({
        success: true,
        report: report,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error generating meeting report:', error);
      return res.status(500).json({
        success: false,
        error: 'Error generating meeting report',
        details: error.message
      });
    }
  }

  /**
   * 🧠 Generate Content Insights
   */
  async generateContentInsights(content, contentType, userId) {
    try {
      const insights = {
        relevance: await this.assessContentRelevance(content, userId),
        actionItems: await this.extractActionItems(content, contentType),
        businessValue: await this.assessBusinessValue(content, contentType),
        connections: await this.findContentConnections(content, userId),
        learnings: await this.extractLearnings(content, contentType)
      };

      return insights;
    } catch (error) {
      console.error('Error generating content insights:', error);
      return {
        relevance: 'unknown',
        actionItems: [],
        businessValue: 'unknown',
        connections: [],
        learnings: []
      };
    }
  }

  /**
   * 💡 Generate Content Recommendations
   */
  async generateContentRecommendations(content, contentType) {
    try {
      const recommendations = [];

      switch (contentType) {
        case 'document':
          if (content.document?.analysis?.actionItems?.length > 0) {
            recommendations.push({
              type: 'action_tracking',
              priority: 'high',
              suggestion: 'Crear tareas en CRM para seguimiento de action items'
            });
          }
          
          if (content.document?.analysis?.keywords?.primary?.length > 5) {
            recommendations.push({
              type: 'knowledge_base',
              priority: 'medium',
              suggestion: 'Agregar documento a base de conocimientos por keywords relevantes'
            });
          }
          break;

        case 'image':
          if (content.image?.analysis?.uiAnalysis?.isUserInterface) {
            recommendations.push({
              type: 'ui_feedback',
              priority: 'medium',
              suggestion: 'Revisar insights de UX para mejoras de interfaz'
            });
          }
          
          if (content.image?.analysis?.chartAnalysis?.chartsDetected?.length > 0) {
            recommendations.push({
              type: 'data_analysis',
              priority: 'high',
              suggestion: 'Integrar datos de gráficos con analytics dashboard'
            });
          }
          break;

        case 'audio':
          if (content.audio?.analysis?.contentAnalysis?.actionItems?.length > 0) {
            recommendations.push({
              type: 'meeting_followup',
              priority: 'high',
              suggestion: 'Programar follow-ups para action items de la reunión'
            });
          }
          
          if (content.audio?.analysis?.insights?.riskAssessment?.level === 'high') {
            recommendations.push({
              type: 'risk_management',
              priority: 'urgent',
              suggestion: 'Abordar riesgos identificados inmediatamente'
            });
          }
          break;
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * 🔗 Integrate Meeting with User Context
   */
  async integrateMeetingWithContext(userId, meetingReport) {
    try {
      // Extraer contactos de la reunión
      const participants = meetingReport.participantAnalysis?.speakers || [];
      
      // Crear/actualizar contactos
      for (const participant of participants) {
        if (participant.name && participant.name !== 'Unknown') {
          await this.updateOrCreateContact(userId, participant);
        }
      }

      // Crear tareas basadas en action items
      const actionItems = meetingReport.decisionsAndActions?.actionItems || [];
      for (const action of actionItems) {
        await this.createTaskFromActionItem(userId, action);
      }

      // Actualizar contexto del usuario con insights de la reunión
      await this.updateUserContextWithMeeting(userId, meetingReport);

    } catch (error) {
      console.error('Error integrating meeting with context:', error);
    }
  }

  async updateOrCreateContact(userId, participant) {
    try {
      const existingContact = await Contact.findOne({
        userId: userId,
        name: { $regex: new RegExp(participant.name, 'i') }
      });

      if (existingContact) {
        // Actualizar contacto existente
        existingContact.lastInteraction = new Date();
        existingContact.notes = existingContact.notes || '';
        existingContact.notes += `\nReunión: ${participant.emotionalTone} - ${new Date().toLocaleDateString()}`;
        await existingContact.save();
      } else {
        // Crear nuevo contacto
        const newContact = new Contact({
          userId: userId,
          name: participant.name,
          type: 'professional',
          source: 'meeting_audio',
          notes: `Características de voz: ${JSON.stringify(participant.voiceCharacteristics)}\nTono emocional: ${participant.emotionalTone}`,
          lastInteraction: new Date(),
          createdAt: new Date()
        });
        await newContact.save();
      }
    } catch (error) {
      console.error('Error updating/creating contact:', error);
    }
  }

  async createTaskFromActionItem(userId, actionItem) {
    try {
      const newTask = new Task({
        userId: userId,
        title: actionItem.action,
        description: `Contexto: ${actionItem.context}\nAsignado en reunión: ${actionItem.timestamp}`,
        priority: actionItem.priority === 'high' ? 'alta' : actionItem.priority === 'medium' ? 'media' : 'baja',
        status: 'pendiente',
        source: 'meeting_audio',
        dueDate: this.parseDueDate(actionItem.deadline),
        createdAt: new Date()
      });
      await newTask.save();
    } catch (error) {
      console.error('Error creating task from action item:', error);
    }
  }

  parseDueDate(deadline) {
    if (!deadline) return null;
    
    const today = new Date();
    const deadlineLower = deadline.toLowerCase();
    
    if (deadlineLower.includes('hoy')) {
      return today;
    } else if (deadlineLower.includes('mañana')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return tomorrow;
    } else if (deadlineLower.includes('esta semana')) {
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
      return endOfWeek;
    } else if (deadlineLower.includes('viernes')) {
      const friday = new Date(today);
      const daysUntilFriday = (5 - today.getDay() + 7) % 7;
      friday.setDate(today.getDate() + daysUntilFriday);
      return friday;
    }
    
    return null;
  }

  async updateUserContextWithMeeting(userId, meetingReport) {
    try {
      const userContext = await UserContext.findOne({ userId });
      if (!userContext) return;

      // Actualizar contexto con insights de la reunión
      userContext.recentActivity = userContext.recentActivity || [];
      userContext.recentActivity.unshift({
        type: 'meeting',
        summary: meetingReport.executiveSummary,
        effectiveness: meetingReport.meetingEffectiveness?.score || 0,
        insights: meetingReport.recommendations || [],
        timestamp: new Date()
      });

      // Mantener solo las últimas 10 actividades
      userContext.recentActivity = userContext.recentActivity.slice(0, 10);

      await userContext.save();
    } catch (error) {
      console.error('Error updating user context with meeting:', error);
    }
  }

  // Helper methods for content insights
  async assessContentRelevance(content, userId) {
    // Lógica para evaluar relevancia del contenido para el usuario
    return 'high'; // Simulación
  }

  async extractActionItems(content, contentType) {
    switch (contentType) {
      case 'document':
        return content.document?.analysis?.actionItems || [];
      case 'audio':
        return content.audio?.analysis?.contentAnalysis?.actionItems || [];
      default:
        return [];
    }
  }

  async assessBusinessValue(content, contentType) {
    // Lógica para evaluar valor de negocio
    return 'medium'; // Simulación
  }

  async findContentConnections(content, userId) {
    // Lógica para encontrar conexiones con contenido existente
    return []; // Simulación
  }

  async extractLearnings(content, contentType) {
    // Lógica para extraer aprendizajes del contenido
    return []; // Simulación
  }

  /**
   * 📧 Send Email using user's authenticated Google account
   */
  async sendEmailAsUser(userId, emailData) {
    try {
      console.log(`📧 Eva sending email for user ${userId}:`, emailData);
      
      if (!emailService.canUserSendEmails(userId)) {
        throw new Error('Usuario no autenticado con Google para enviar emails');
      }

      const result = await emailService.sendEmailAsUser(userId, emailData);
      
      console.log('✅ Email sent successfully:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  }

  /**
   * 🔍 Detect email intent in user message
   */
  detectEmailIntent(message) {
    const emailKeywords = [
      'enviar email', 'enviar correo', 'mandar email', 'mandar correo',
      'send email', 'send mail', 'envía un email', 'envía un correo',
      'escribir email', 'escribir correo', 'redactar email', 'redactar correo'
    ];

    const lowerMessage = message.toLowerCase();
    return emailKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * 📧 Extract email information from message
   */
  extractEmailInfo(message) {
    // Basic email extraction - could be enhanced with NLP
    const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
    const emails = message.match(emailRegex) || [];
    
    // Try to extract subject and body from message structure
    const subjectMatch = message.match(/asunto[:\s]+"([^"]+)"/i) || 
                        message.match(/subject[:\s]+"([^"]+)"/i);
    
    const bodyMatch = message.match(/mensaje[:\s]+"([^"]+)"/i) || 
                     message.match(/body[:\s]+"([^"]+)"/i) ||
                     message.match(/contenido[:\s]+"([^"]+)"/i);

    return {
      to: emails[0] || null,
      subject: subjectMatch ? subjectMatch[1] : null,
      body: bodyMatch ? bodyMatch[1] : null,
      hasEmailIntent: this.detectEmailIntent(message)
    };
  }

  /**
   * 📧📅 Process Google Workspace intentions (Email & Calendar)
   */
  async processGoogleWorkspaceIntentions(message, userId) {
    console.log('📧📅 Checking Google Workspace intentions...');
    
    try {
      // Check if user has Google access
      const hasGoogleAccess = emailService.canUserSendEmails(userId) && 
                             calendarService.canUserAccessCalendar(userId);
      
      if (!hasGoogleAccess) {
        console.log('❌ User not authenticated with Google');
        return {
          hasIntent: false,
          needsAuth: true,
          message: 'Para enviar correos o crear eventos, necesitas iniciar sesión con Google primero.'
        };
      }

      // Detect email intention
      const emailIntentions = this.detectEmailIntentions(message);
      const calendarIntentions = this.detectCalendarIntentions(message);
      
      let result = {
        hasIntent: false,
        email: null,
        calendar: null,
        needsAuth: false
      };

      // Process email if detected
      if (emailIntentions.detected) {
        console.log('📧 Email intention detected');
        try {
          const emailDetails = this.extractEmailDetails(message);
          
          if (emailDetails.to && emailDetails.subject && emailDetails.body) {
            const emailResult = await emailService.sendEmailAsUser(userId, {
              to: emailDetails.to,
              subject: emailDetails.subject,
              body: emailDetails.body,
              cc: emailDetails.cc,
              bcc: emailDetails.bcc
            });
            
            result.email = {
              success: true,
              action: 'sent',
              details: emailResult,
              message: `Email enviado exitosamente a ${emailDetails.to}`
            };
            result.hasIntent = true;
          } else {
            result.email = {
              success: false,
              action: 'incomplete',
              missing: {
                to: !emailDetails.to,
                subject: !emailDetails.subject,
                body: !emailDetails.body
              },
              message: 'Necesito más información para enviar el email (destinatario, asunto y mensaje)'
            };
          }
        } catch (error) {
          result.email = {
            success: false,
            action: 'error',
            error: error.message,
            message: `Error enviando email: ${error.message}`
          };
        }
      }

      // Process calendar if detected
      if (calendarIntentions.detected) {
        console.log('📅 Calendar intention detected');
        try {
          const eventDetails = this.extractCalendarDetails(message);
          
          if (eventDetails.summary && eventDetails.startDateTime && eventDetails.endDateTime) {
            const calendarResult = await calendarService.createEvent(userId, {
              summary: eventDetails.summary,
              description: eventDetails.description || 'Evento creado por Eva Assistant',
              startDateTime: eventDetails.startDateTime,
              endDateTime: eventDetails.endDateTime,
              location: eventDetails.location,
              attendees: eventDetails.attendees
            });
            
            result.calendar = {
              success: true,
              action: 'created',
              details: calendarResult,
              message: `Evento "${eventDetails.summary}" creado exitosamente`
            };
            result.hasIntent = true;
          } else {
            result.calendar = {
              success: false,
              action: 'incomplete',
              missing: {
                summary: !eventDetails.summary,
                startDateTime: !eventDetails.startDateTime,
                endDateTime: !eventDetails.endDateTime
              },
              message: 'Necesito más información para crear el evento (título, fecha y hora)'
            };
          }
        } catch (error) {
          result.calendar = {
            success: false,
            action: 'error',
            error: error.message,
            message: `Error creando evento: ${error.message}`
          };
        }
      }

      return result;
      
    } catch (error) {
      console.error('❌ Error processing Google Workspace intentions:', error);
      return {
        hasIntent: false,
        error: error.message,
        message: 'Error procesando solicitud de Google Workspace'
      };
    }
  }

  /**
   * 📧 Detect email intentions in message
   */
  detectEmailIntentions(message) {
    const emailKeywords = [
      'envía un email', 'envía un correo', 'enviar email', 'enviar correo',
      'manda un email', 'manda un correo', 'mandar email', 'mandar correo',
      'send email', 'send mail', 'write email', 'compose email',
      'escribir email', 'escribir correo', 'redactar email', 'redactar correo'
    ];
    
    const lowerMessage = message.toLowerCase();
    const detected = emailKeywords.some(keyword => lowerMessage.includes(keyword));
    
    return {
      detected,
      keywords: emailKeywords.filter(keyword => lowerMessage.includes(keyword))
    };
  }

  /**
   * 📅 Detect calendar intentions in message
   */
  detectCalendarIntentions(message) {
    const calendarKeywords = [
      'crear cita', 'crear evento', 'agendar cita', 'agendar reunión',
      'crear reunión', 'schedule meeting', 'create event', 'book appointment',
      'nueva cita', 'nuevo evento', 'reunión', 'meeting', 'calendar',
      'calendario', 'agendar', 'programar cita', 'programar reunión'
    ];
    
    const lowerMessage = message.toLowerCase();
    const detected = calendarKeywords.some(keyword => lowerMessage.includes(keyword));
    
    return {
      detected,
      keywords: calendarKeywords.filter(keyword => lowerMessage.includes(keyword))
    };
  }

  /**
   * 📧 Extract email details from natural language
   */
  extractEmailDetails(message) {
    // Extract email addresses
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const emails = message.match(emailRegex) || [];
    
    // Extract subject (various patterns)
    const subjectPatterns = [
      /(?:con asunto|asunto|subject)[:\s]*["']([^"']+)["']/i,
      /(?:con asunto|asunto|subject)[:\s]+([^,\n.]+)/i,
      /["']([^"']+)["']\s*(?:como asunto|de asunto)/i
    ];
    
    let subject = '';
    for (const pattern of subjectPatterns) {
      const match = message.match(pattern);
      if (match) {
        subject = match[1].trim();
        break;
      }
    }
    
    // Extract message content
    const messagePatterns = [
      /(?:mensaje|contenido|content|body)[:\s]*["']([^"']+)["']/i,
      /(?:mensaje|contenido|content|body)[:\s]+([^,\n.]+)/i,
      /(?:que diga|diciendo)[:\s]*["']([^"']+)["']/i,
      /(?:que diga|diciendo)[:\s]+([^,\n.]+)/i
    ];
    
    let body = '';
    for (const pattern of messagePatterns) {
      const match = message.match(pattern);
      if (match) {
        body = match[1].trim();
        break;
      }
    }
    
    return {
      to: emails[0] || '',
      cc: emails.slice(1, 2).join(','),
      bcc: emails.slice(2).join(','),
      subject: subject,
      body: body
    };
  }

  /**
   * 📅 Extract calendar details from natural language
   */
  extractCalendarDetails(message) {
    // Extract event title/summary
    const titlePatterns = [
      /(?:crear|agendar|programar)\s+(?:cita|evento|reunión)\s+["']([^"']+)["']/i,
      /(?:crear|agendar|programar)\s+(?:cita|evento|reunión)\s+([^,\n.]+)/i,
      /(?:título|title|evento)[:\s]*["']([^"']+)["']/i,
      /(?:llamada|call|meeting|reunión)\s+["']([^"']+)["']/i,
      /(?:llamada|call|meeting|reunión)\s+([^,\n.]+)/i
    ];
    
    let summary = '';
    for (const pattern of titlePatterns) {
      const match = message.match(pattern);
      if (match) {
        summary = match[1].trim();
        break;
      }
    }
    
    // Extract location
    const locationPatterns = [
      /(?:en|at|location|lugar)[:\s]*["']([^"']+)["']/i,
      /(?:en|at|location|lugar)[:\s]+([^,\n.]+)/i
    ];
    
    let location = '';
    for (const pattern of locationPatterns) {
      const match = message.match(pattern);
      if (match) {
        location = match[1].trim();
        break;
      }
    }
    
    // Extract attendees (email addresses)
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const attendees = message.match(emailRegex) || [];
    
    // Basic date/time extraction (simplified)
    const now = new Date();
    let startDateTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // Default: 1 hour from now
    let endDateTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(); // Default: 2 hours from now
    
    // Try to extract relative time references
    if (message.toLowerCase().includes('mañana')) {
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      tomorrow.setHours(10, 0, 0, 0); // Default to 10 AM
      startDateTime = tomorrow.toISOString();
      tomorrow.setHours(11, 0, 0, 0); // 1 hour duration
      endDateTime = tomorrow.toISOString();
    }
    
    return {
      summary: summary,
      description: `Evento creado por Eva Assistant`,
      startDateTime: startDateTime,
      endDateTime: endDateTime,
      location: location,
      attendees: attendees
    };
  }
}

module.exports = new SuperChatController();
