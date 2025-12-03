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

// 🤖 Eva Autonomous System Integration
const path = require('path');
const fs = require('fs');

// Function to get Eva Autonomous Controller dynamically
function getEvaAutonomousController() {
  try {
    const controllerPath = path.join(__dirname, '../eva-autonomous/EvaAutonomousController.js');
    if (fs.existsSync(controllerPath)) {
      const EvaAutonomousController = require('../eva-autonomous/EvaAutonomousController');
      // Get the global instance if it exists
      return global.evaAutonomousController || null;
    }
  } catch (error) {
    console.log('🤖 Eva Autonomous Controller not available:', error.message);
  }
  return null;
}

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
      const sessionTokens = req.session?.tokens;
      console.log('🔐 Session tokens available:', !!sessionTokens);
      const googleWorkspaceResult = await this.processGoogleWorkspaceIntentions(message, userId, sessionTokens);
      
      // 🤖 STEP 7.2: Check for Eva Autonomous Email Requests  
      const autonomousEmailResult = await this.processAutonomousEmailRequest(message, userId, sessionTokens);
      
      // 📱 STEP 7.3: Check for Eva Autonomous WhatsApp Requests
      const autonomousWhatsAppResult = await this.processAutonomousWhatsAppRequest(message, userId);
      
      const response = await this.generateSuperIntelligentResponse(message, superEnhancedContext, userId, googleWorkspaceResult, autonomousEmailResult, autonomousWhatsAppResult);
      
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
  async generateSuperIntelligentResponse(message, enhancedContext, userId, googleWorkspaceResult = null, autonomousEmailResult = null, autonomousWhatsAppResult = null) {
    try {
      // Build enhanced prompt with predictions and behavior analysis
      const enhancedPrompt = this.buildSuperEnhancedPrompt(message, enhancedContext, googleWorkspaceResult, autonomousEmailResult, autonomousWhatsAppResult);
      
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
  buildSuperEnhancedPrompt(message, enhancedContext, googleWorkspaceResult = null, autonomousEmailResult = null, autonomousWhatsAppResult = null) {
    let prompt = `Usuario: ${message}\n\n`;
    
    // Add Eva Autonomous Email context if available
    if (autonomousEmailResult && autonomousEmailResult.hasEmailRequest) {
      prompt += `EVA AUTONOMOUS EMAIL:\n`;
      if (autonomousEmailResult.success) {
        prompt += `- ✅ Email enviado autónomamente por Eva\n`;
        prompt += `- Destinatario: ${autonomousEmailResult.details.to}\n`;
        prompt += `- Asunto: ${autonomousEmailResult.details.subject}\n`;
        prompt += `- Confianza del sistema: ${autonomousEmailResult.details.confidence}%\n`;
        prompt += `- Enviado por: ${autonomousEmailResult.details.sentBy}\n`;
        prompt += `\n🔥 IMPORTANT: Give a SHORT confirmation response (max 1-2 sentences). Just confirm email sent + recipient + maybe one small tip. NO long explanations about features!\n`;
      } else {
        prompt += `- ❌ Eva no pudo enviar el email autónomamente\n`;
        prompt += `- Razón: ${autonomousEmailResult.reason || autonomousEmailResult.message}\n`;
        prompt += `- Confianza: ${autonomousEmailResult.confidence}%\n`;
        if (autonomousEmailResult.fallbackToStandard) {
          prompt += `- Nota: Se puede intentar envío manual si el usuario lo solicita\n`;
        }
      }
      prompt += `\n`;
    }
    
    // Add Eva Autonomous WhatsApp context if available
    if (autonomousWhatsAppResult && autonomousWhatsAppResult.hasWhatsAppRequest) {
      prompt += `EVA AUTONOMOUS WHATSAPP:\n`;
      if (autonomousWhatsAppResult.success) {
        if (autonomousWhatsAppResult.action === 'auto_response_enabled') {
          prompt += `- ✅ Respuestas automáticas de WhatsApp activadas por Eva\n`;
          prompt += `- Modo: ${autonomousWhatsAppResult.details.mode}\n`;
          prompt += `- Umbral de confianza: ${autonomousWhatsAppResult.details.confidence_threshold}%\n`;
          prompt += `- Palabras clave activas: ${autonomousWhatsAppResult.details.keywords?.join(', ') || 'N/A'}\n`;
        } else if (autonomousWhatsAppResult.action === 'auto_response_disabled') {
          prompt += `- ❌ Respuestas automáticas de WhatsApp desactivadas por Eva\n`;
        } else if (autonomousWhatsAppResult.action === 'message_sent') {
          prompt += `- ✅ Mensaje de WhatsApp enviado autónomamente por Eva\n`;
          prompt += `- Destinatario: ${autonomousWhatsAppResult.details.chatId}\n`;
          prompt += `- Mensaje: "${autonomousWhatsAppResult.details.message}"\n`;
        }
        prompt += `- Confianza del sistema: ${autonomousWhatsAppResult.details.confidence}%\n`;
        prompt += `- Procesado por: eva_autonomous\n`;
      } else {
        prompt += `- ❌ Eva no pudo procesar la solicitud de WhatsApp\n`;
        prompt += `- Razón: ${autonomousWhatsAppResult.reason || autonomousWhatsAppResult.message}\n`;
        prompt += `- Confianza: ${autonomousWhatsAppResult.confidence}%\n`;
      }
      prompt += `\n`;
    }
    
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
- Explica exactamente qué puede lograr cada API y cómo usarla

MANEJO DE EMAILS:
- Si Eva envió un email autónomamente, confirma la acción y describe lo que se envió
- Si Eva no pudo enviar un email, explica por qué y cómo el usuario puede corregirlo
- Para solicitudes de email futuras, recuerda que Eva puede redactar correos profesionales automáticamente
- Siempre confirma detalles importantes como destinatario, asunto y contenido cuando proceses emails`;

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
   * 🤖 Process Autonomous Email Request - Eva decides and sends emails automatically
   */
  async processAutonomousEmailRequest(message, userId, sessionTokens = null) {
    try {
      console.log('🤖 Eva analyzing message for autonomous email request...');
      
      // Detect email intent with basic patterns
      const emailDetection = this.detectAdvancedEmailIntent(message);
      
      if (!emailDetection.hasEmailIntent) {
        return { hasEmailRequest: false };
      }
      
      console.log('📧 Email intent detected:', emailDetection);
      
      // If recipient not detected with regex, try AI enhancement
      let finalEmailDetection = emailDetection;
      if (!emailDetection.recipient) {
        console.log('🧠 Enhancing email detection with AI...');
        const aiEnhancement = await this.enhanceEmailDetectionWithAI(message);
        
        if (aiEnhancement && aiEnhancement.hasEmailIntent && aiEnhancement.confidence > 0.7) {
          finalEmailDetection = {
            ...emailDetection,
            recipient: aiEnhancement.recipient,
            recipientName: aiEnhancement.recipientName,
            subject: aiEnhancement.subject || emailDetection.subject,
            content: aiEnhancement.content || emailDetection.content,
            priority: aiEnhancement.priority || emailDetection.priority
          };
          console.log('🧠 AI enhanced detection:', finalEmailDetection);
        }
      }
      
      // Get Eva Autonomous Controller
      const autonomousController = getEvaAutonomousController();
      
      if (!autonomousController) {
        console.log('⚠️ Eva Autonomous Controller not available, using standard email');
        return { hasEmailRequest: false, fallbackToStandard: true };
      }
      
      if (!autonomousController.isActive) {
        console.log('🤖 Starting Eva Autonomous System...');
        await autonomousController.start();
      }
      
      // Validate that we have a recipient
      if (!finalEmailDetection.recipient) {
        return {
          hasEmailRequest: true,
          error: 'No se pudo detectar el destinatario del correo. Por favor, especifica el email del destinatario (ejemplo: "enviar correo a juan@ejemplo.com").',
          needsRecipient: true
        };
      }
      
      // Validate email format if recipient is detected
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(finalEmailDetection.recipient)) {
        return {
          hasEmailRequest: true,
          error: `El destinatario "${finalEmailDetection.recipient}" no parece ser un email válido. Por favor, proporciona un email válido (ejemplo: usuario@dominio.com).`,
          needsValidEmail: true,
          recipientName: finalEmailDetection.recipientName // In case it's a name that needs to be converted to email
        };
      }
      
      // Generate professional email content using AI
      console.log('📝 Generating professional email content...');
      let professionalEmail = null;
      
      try {
        professionalEmail = await this.generateProfessionalEmailContent(
          message, 
          finalEmailDetection.recipient, 
          finalEmailDetection
        );
        console.log('🧠 Professional email result:', professionalEmail);
      } catch (error) {
        console.error('❌ Error generating professional email:', error);
        professionalEmail = null;
      }
      
      let emailSubject, emailBody;
      
      if (professionalEmail && professionalEmail.subject && professionalEmail.body) {
        emailSubject = professionalEmail.subject;
        emailBody = professionalEmail.body;
        console.log('✅ Professional email generated:', { subject: emailSubject, bodyLength: emailBody.length });
      } else {
        // Fallback to basic generation
        emailSubject = finalEmailDetection.subject || 'Mensaje de Eva';
        emailBody = finalEmailDetection.content || message;
        console.log('⚠️ Using fallback email content - Professional generation failed');
      }
      
      // Prepare email data for autonomous decision
      const emailRequest = {
        to: finalEmailDetection.recipient, // Use detected recipient - NO DEFAULT
        subject: emailSubject,
        body: emailBody,
        priority: finalEmailDetection.priority || 'normal',
        sessionTokens: sessionTokens // Get tokens from session if available
      };
      
      console.log('🤖 Eva making autonomous email decision...');
      
      // Send via autonomous system
      const result = await autonomousController.sendEmailAutonomous(emailRequest);
      
      if (result.success) {
        console.log('✅ Eva sent email autonomously!');
        return {
          hasEmailRequest: true,
          success: true,
          autonomous: true,
          result: result,
          message: '✅ Email enviado autónomamente por Eva',
          details: {
            to: emailRequest.to,
            subject: emailRequest.subject,
            confidence: result.decision?.confidence || 0,
            sentBy: 'eva_autonomous'
          }
        };
      } else {
        console.log('❌ Eva autonomous email failed:', result.reason);
        return {
          hasEmailRequest: true,
          success: false,
          autonomous: true,
          reason: result.reason,
          confidence: result.confidence || 0,
          message: `❌ Eva no pudo enviar el email: ${result.reason}`,
          fallbackToStandard: true
        };
      }
      
    } catch (error) {
      console.error('❌ Error in autonomous email processing:', error);
      return {
        hasEmailRequest: true,
        success: false,
        autonomous: false,
        error: error.message,
        message: '❌ Error en el sistema autónomo de emails',
        fallbackToStandard: true
      };
    }
  }

  /**
   * 🔍 Advanced Email Intent Detection
   */
  detectAdvancedEmailIntent(message) {
    const emailPatterns = [
      /enviar?\s*(un\s+)?(email|correo|mail)/i,
      /mandar?\s*(un\s+)?(email|correo|mail)/i,
      /envía\s*(me\s+)?(un\s+)?(email|correo|mail)/i,
      /send\s*(an?\s+)?(email|mail)/i,
      /(email|correo|mail)\s+a\s+/i,
      /escribir?\s*(un\s+)?(email|correo|mail)/i,
      // Additional patterns for more flexibility
      /contactar?\s+por\s+(email|correo)/i,
      /notificar?\s+por\s+(email|correo)/i,
      /avisar?\s+por\s+(email|correo)/i,
      /comunicar?\s+por\s+(email|correo)/i
    ];
    
    const hasEmailIntent = emailPatterns.some(pattern => pattern.test(message));
    
    // Extract recipient with multiple patterns - MORE FLEXIBLE
    let recipient = null;
    
    // Pattern 1: "a email@domain.com" or "to email@domain.com"
    let recipientMatch = message.match(/(a\s+|to\s+|para\s+)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (recipientMatch) {
      recipient = recipientMatch[2];
    }
    
    // Pattern 2: Direct email mention (email@domain.com anywhere in message)
    if (!recipient) {
      recipientMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
      if (recipientMatch) {
        recipient = recipientMatch[1];
      }
    }
    
    // Pattern 3: "enviar correo a nombre" - extract name 
    if (!recipient) {
      const nameMatch = message.match(/(correo|email|mail)\s+(a|para|to)\s+([a-zA-Z\s]+?)(?:\s|$|,|\.|!|\?)/i);
      if (nameMatch) {
        // For now, store the name and let the system ask for email or look it up
        recipient = nameMatch[3].trim();
      }
    }
    
    // Pattern 4: Email in quotes or after "es" or ":" 
    if (!recipient) {
      recipientMatch = message.match(/(?:es|:|")\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
      if (recipientMatch) {
        recipient = recipientMatch[1];
      }
    }
    
    // Extract subject if mentioned
    const subjectMatch = message.match(/(asunto|subject|título)\s*:?\s*["']?([^"'\n]+)["']?/i);
    const subject = subjectMatch ? subjectMatch[2].trim() : null;
    
    // Extract content/body - IMPROVED
    let content = message;
    if (hasEmailIntent) {
      // Remove the email intent part and recipient to get pure content
      content = message
        .replace(/^(manda|enviar?|envía|send)\s*(un\s+)?(email|correo|mail)/i, '')
        .replace(/(a|para|to)\s+[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i, '')
        .replace(/(a|para|to)\s+[a-zA-Z\s]+?(?=,)/i, '')
        .replace(/^[\s,]+/, '') // Remove leading spaces and commas
        .trim();
      
      // Extract content after "que diga" or similar patterns
      const contentMatch = content.match(/(?:que\s+diga\s+que|que\s+diga|que\s+|con\s+el\s+mensaje\s+|diciendo\s+que\s+)(.+)$/i);
      if (contentMatch) {
        content = contentMatch[1].trim();
      }
    }
    
    // Determine priority
    const urgentKeywords = ['urgente', 'urgent', 'importante', 'important', 'rápido', 'quick'];
    const priority = urgentKeywords.some(keyword => message.toLowerCase().includes(keyword)) ? 'high' : 'normal';
    
    return {
      hasEmailIntent,
      recipient,
      subject,
      content: content || message,
      priority,
      originalMessage: message
    };
  }

  /**
   * ✍️ Generate Professional Email Content using OpenAI
   */
  async generateProfessionalEmailContent(originalMessage, recipient, detectedInfo) {
    try {
      const prompt = `Eres Eva, un asistente AI profesional especializado en redacción de correos empresariales. Tu tarea es convertir instrucciones casuales en emails profesionales y bien redactados.

INSTRUCCIÓN ORIGINAL: "${originalMessage}"
DESTINATARIO: ${recipient}
INFORMACIÓN DETECTADA: ${JSON.stringify(detectedInfo)}

INSTRUCCIONES ESPECÍFICAS:
1. Convierte el mensaje casual en un email formal pero amigable
2. Genera un asunto apropiado y profesional
3. Estructura el contenido con saludo, cuerpo y cierre formal
4. Mantén un tono profesional pero cálido
5. Incluye información específica mencionada (reuniones, horarios, etc.)

EJEMPLO DE TRANSFORMACIÓN:
Entrada: "manda un correo a bener que lo veo a las 8 en la oficina para la reunion de marketing"
Salida esperada:
ASUNTO: Reunión de marketing - Confirmación para las 8:00
CONTENIDO: 
Estimado Bener,

Espero que te encuentres bien. Te escribo para confirmar nuestra reunión de marketing programada para las 8:00 en la oficina.

Estaré allí puntualmente para revisar los temas pendientes. Si tienes alguna documentación que debamos revisar o si surge algún inconveniente, no dudes en contactarme.

Quedo atento a cualquier consulta.

Saludos cordiales.

Responde ÚNICAMENTE en formato JSON válido:
{
  "subject": "asunto profesional generado",
  "body": "contenido completo del email con saludo, cuerpo y cierre",
  "tone": "professional",
  "confidence": 0.95
}`;

      console.log('📝 Generating professional email content...');
      
      const response = await openaiService.getChatResponse(prompt, {
        userId: 'email-generation',
        temperature: 0.3,
        maxTokens: 600
      });

      console.log('🤖 OpenAI raw response:', response);
      
      // Extract the actual response content
      const responseContent = response.response || response.content || response;
      
      // Try to parse JSON response
      let emailContent;
      try {
        // Clean the response to extract JSON
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          emailContent = JSON.parse(jsonMatch[0]);
          console.log('✅ JSON parsed successfully:', emailContent);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.log('Raw response for debugging:', responseContent);
        
        // Fallback: try to extract content manually
        return {
          subject: 'Reunión programada',
          body: this.extractContentFromMessage(originalMessage),
          tone: 'professional',
          confidence: 0.5
        };
      }
      
      // Validate the email content structure
      if (!emailContent.subject || !emailContent.body) {
        console.log('⚠️ Invalid email structure, using fallback');
        return {
          subject: emailContent.subject || 'Mensaje importante',
          body: emailContent.body || this.extractContentFromMessage(originalMessage),
          tone: 'professional',
          confidence: 0.6
        };
      }
      
      return emailContent;
      
    } catch (error) {
      console.error('❌ Error generating professional email:', error);
      return {
        subject: `Mensaje de ${detectedInfo.senderName || 'Eva'}`,
        body: this.extractContentFromMessage(originalMessage),
        tone: 'casual',
        confidence: 0.3
      };
    }
  }

  /**
   * 📝 Extract content from message as fallback
   */
  extractContentFromMessage(originalMessage) {
    // Remove the email instruction part and create a professional message
    let content = originalMessage;
    
    // Remove common email instruction patterns in Spanish
    content = content.replace(/mandale?\s+un\s+(correo|email|mensaje)\s+a\s+[^,]+,?\s*/i, '');
    content = content.replace(/enviale?\s+un\s+(correo|email|mensaje)\s+a\s+[^,]+,?\s*/i, '');
    content = content.replace(/escribele?\s+un\s+(correo|email|mensaje)\s+a\s+[^,]+,?\s*/i, '');
    
    // Remove email addresses
    content = content.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
    
    // Remove email instruction phrases
    content = content.replace(/^que\s+(diga\s+que|diga|le\s+diga\s+que|le\s+diga)\s*/i, '');
    content = content.replace(/con\s+el\s+mensaje\s+/i, '');
    content = content.replace(/diciendo\s+que\s+/i, '');
    
    content = content.trim();
    
    // If content is too short, create a basic professional message
    if (content.length < 10) {
      return `Estimado/a,

Espero que te encuentres bien. Te escribo para coordinar contigo.

Quedo atento a cualquier consulta que puedas tener.

Saludos cordiales.

---
Este mensaje fue enviado automáticamente por Eva.
Eva Autonomous Operations`;
    }
    
    // Capitalize first letter
    content = content.charAt(0).toUpperCase() + content.slice(1);
    
    // Ensure proper punctuation
    if (!content.endsWith('.') && !content.endsWith('!') && !content.endsWith('?')) {
      content += '.';
    }
    
    return `Estimado/a,

Espero que te encuentres bien. Te escribo para informarte que ${content}

Quedo atento a cualquier consulta que puedas tener.

Saludos cordiales.

---
Este mensaje fue enviado automáticamente por Eva.
Eva Autonomous Operations`;
  }

  /**
   * 🧠 Enhanced Email Intent Detection using OpenAI
   */
  async enhanceEmailDetectionWithAI(message) {
    try {
      const prompt = `Analiza el siguiente mensaje y extrae información para envío de email:

Mensaje: "${message}"

Responde en JSON con:
{
  "hasEmailIntent": boolean,
  "recipient": "email o null",
  "recipientName": "nombre si se menciona o null", 
  "subject": "asunto o null",
  "content": "contenido limpio del mensaje (sin comandos)",
  "priority": "high/normal",
  "confidence": 0.0-1.0
}

Analiza estos patrones:
- "manda un correo a juan@email.com que diga que lo veo a las 5" 
  → recipient: "juan@email.com", content: "que lo veo a las 5"
- "enviar email a María, elbedev90@gmail.com, diciendo que la reunión es a las 3"
  → recipient: "elbedev90@gmail.com", content: "que la reunión es a las 3"
- "manda correo a bener con el reporte"
  → recipient: "bener", content: "con el reporte"

Extrae SOLO el contenido real del mensaje, sin los comandos de envío.

Solo responde el JSON, sin explicaciones.`;

      const response = await this.openaiService.createCompletion({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 300
      });

      const aiAnalysis = JSON.parse(response.choices[0].message.content.trim());
      return aiAnalysis;
      
    } catch (error) {
      console.error('❌ Error in AI email detection:', error);
      return null;
    }
  }

  /**
   * 📝 Generate Professional Email Content using AI
   */
  async generateProfessionalEmail(originalRequest, recipient, detectedContent) {
    try {
      const prompt = `Eres un asistente profesional que redacta correos electrónicos. 

Solicitud original del usuario: "${originalRequest}"
Destinatario: ${recipient}
Mensaje detectado: "${detectedContent}"

Tu tarea es redactar un correo profesional basado en esta solicitud. Analiza la intención y el contexto para crear:
1. Un asunto apropiado y profesional
2. Un contenido del correo bien redactado, profesional pero amigable
3. Un saludo y despedida apropiados

Responde en JSON con:
{
  "subject": "Asunto profesional del correo",
  "body": "Contenido completo del correo con saludo, mensaje y despedida",
  "tone": "professional/casual/urgent",
  "priority": "high/normal/low"
}

Ejemplos de transformación:
- Solicitud: "manda un correo a bener que diga que lo veo a las 5 en la oficina"
  → Asunto: "Reunión confirmada - 5:00 PM en la oficina"
  → Cuerpo: "Hola Bener,\n\nEspero que te encuentres bien. Te escribo para confirmar nuestra reunión programada para las 5:00 PM en la oficina.\n\nNos vemos ahí.\n\nSaludos cordiales"

- Solicitud: "enviar correo a María con el reporte mensual"
  → Asunto: "Reporte mensual adjunto"
  → Cuerpo: "Estimada María,\n\nEspero que estés bien. Te envío el reporte mensual como acordamos.\n\nQuedo atento a cualquier comentario.\n\nSaludos"

Mantén un tono profesional pero cálido. Usa el nombre del destinatario si está disponible.

Solo responde el JSON, sin explicaciones.`;

      const response = await this.openaiService.createCompletion({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 500
      });

      const emailContent = JSON.parse(response.choices[0].message.content.trim());
      return emailContent;
      
    } catch (error) {
      console.error('❌ Error generating professional email:', error);
      return null;
    }
  }

  /**
   * 📱 Process Autonomous WhatsApp Request - Eva manages WhatsApp automatically
   */
  async processAutonomousWhatsAppRequest(message, userId) {
    try {
      console.log('📱 Eva analyzing message for autonomous WhatsApp request...');
      
      // Detect WhatsApp intent
      const whatsappDetection = this.detectAdvancedWhatsAppIntent(message);
      
      if (!whatsappDetection.hasWhatsAppIntent) {
        return { hasWhatsAppRequest: false };
      }
      
      console.log('📱 WhatsApp intent detected:', whatsappDetection);
      
      // Get Eva Autonomous Controller
      const autonomousController = getEvaAutonomousController();
      
      if (!autonomousController) {
        console.log('⚠️ Eva Autonomous Controller not available');
        return { hasWhatsAppRequest: false, fallbackToManual: true };
      }
      
      if (!autonomousController.isActive) {
        console.log('🤖 Starting Eva Autonomous System...');
        await autonomousController.start();
      }
      
      console.log('📱 Eva making autonomous WhatsApp decision...');
      
      let result;
      
      switch (whatsappDetection.action) {
        case 'enable_auto_response':
          result = await autonomousController.enableWhatsAppAutoResponse(whatsappDetection.settings || {});
          break;
        
        case 'disable_auto_response':
          result = await autonomousController.disableWhatsAppAutoResponse();
          break;
        
        case 'send_message':
          if (whatsappDetection.chatId && whatsappDetection.message) {
            result = await autonomousController.sendWhatsAppMessageAutonomous({
              chatId: whatsappDetection.chatId,
              message: whatsappDetection.message
            });
          } else {
            throw new Error('ChatId and message are required for sending WhatsApp message');
          }
          break;
        
        case 'update_settings':
          result = await autonomousController.processWhatsAppRequest({
            type: 'update_settings',
            settings: whatsappDetection.settings || {}
          });
          break;
        
        default:
          throw new Error(`Unknown WhatsApp action: ${whatsappDetection.action}`);
      }
      
      if (result.success) {
        console.log('✅ Eva processed WhatsApp request autonomously!');
        return {
          hasWhatsAppRequest: true,
          success: true,
          autonomous: true,
          action: whatsappDetection.action,
          result: result,
          message: this.getWhatsAppSuccessMessage(whatsappDetection.action, result),
          details: {
            action: whatsappDetection.action,
            confidence: result.decision?.confidence || result.result?.confidence || 80,
            processedBy: 'eva_autonomous',
            ...this.getWhatsAppActionDetails(whatsappDetection, result)
          }
        };
      } else {
        console.log('❌ Eva autonomous WhatsApp processing failed:', result.reason);
        return {
          hasWhatsAppRequest: true,
          success: false,
          autonomous: true,
          action: whatsappDetection.action,
          reason: result.reason,
          confidence: result.confidence || 0,
          message: `❌ Eva no pudo procesar WhatsApp: ${result.reason}`,
          fallbackToManual: true
        };
      }
      
    } catch (error) {
      console.error('❌ Error in autonomous WhatsApp processing:', error);
      return {
        hasWhatsAppRequest: true,
        success: false,
        autonomous: false,
        error: error.message,
        message: '❌ Error en el sistema autónomo de WhatsApp',
        fallbackToManual: true
      };
    }
  }

  /**
   * 🔍 Advanced WhatsApp Intent Detection
   */
  detectAdvancedWhatsAppIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Patterns for enabling auto-response
    const enablePatterns = [
      /activar?\s*(respuestas?\s*)?(automáticas?\s*)?whatsapp/i,
      /habilitar?\s*(respuestas?\s*)?(automáticas?\s*)?whatsapp/i,
      /encender?\s*(respuestas?\s*)?(automáticas?\s*)?whatsapp/i,
      /enable\s*(auto)?\s*whatsapp/i,
      /turn\s*on\s*(auto)?\s*whatsapp/i,
      /activar\s*el\s*asistente\s*de\s*whatsapp/i,
      /habilitar\s*el\s*asistente\s*de\s*whatsapp/i
    ];
    
    // Patterns for disabling auto-response
    const disablePatterns = [
      /desactivar?\s*(respuestas?\s*)?(automáticas?\s*)?whatsapp/i,
      /deshabilitar?\s*(respuestas?\s*)?(automáticas?\s*)?whatsapp/i,
      /apagar?\s*(respuestas?\s*)?(automáticas?\s*)?whatsapp/i,
      /disable\s*(auto)?\s*whatsapp/i,
      /turn\s*off\s*(auto)?\s*whatsapp/i,
      /desactivar\s*el\s*asistente\s*de\s*whatsapp/i,
      /deshabilitar\s*el\s*asistente\s*de\s*whatsapp/i
    ];
    
    // Patterns for sending messages
    const sendMessagePatterns = [
      /enviar?\s*(un\s+)?mensaje\s*(de\s+|por\s+)?whatsapp/i,
      /mandar?\s*(un\s+)?mensaje\s*(de\s+|por\s+)?whatsapp/i,
      /send\s*(a\s+)?whatsapp\s*message/i,
      /whatsapp\s+message\s+to/i
    ];
    
    // Check for different actions
    let action = null;
    let settings = {};
    
    if (enablePatterns.some(pattern => pattern.test(message))) {
      action = 'enable_auto_response';
      
      // Extract settings from message
      if (lowerMessage.includes('selectivo') || lowerMessage.includes('selective')) {
        settings.mode = 'selective';
      } else if (lowerMessage.includes('todo') || lowerMessage.includes('all')) {
        settings.mode = 'all';
      } else if (lowerMessage.includes('palabra') || lowerMessage.includes('keyword')) {
        settings.mode = 'keywords';
      }
      
      // Extract confidence threshold
      const confidenceMatch = message.match(/(\d+)%?\s*(confianza|confidence)/i);
      if (confidenceMatch) {
        settings.confidence_threshold = parseInt(confidenceMatch[1]);
      }
      
    } else if (disablePatterns.some(pattern => pattern.test(message))) {
      action = 'disable_auto_response';
      
    } else if (sendMessagePatterns.some(pattern => pattern.test(message))) {
      action = 'send_message';
      
      // Extract chat ID and message
      const chatIdMatch = message.match(/a\s+([a-zA-Z0-9@._-]+)/i);
      const messageMatch = message.match(/mensaje\s*["']([^"']+)["']/i) || 
                          message.match(/diciendo\s*["']?([^"'\n]+)["']?/i);
      
      return {
        hasWhatsAppIntent: true,
        action,
        chatId: chatIdMatch ? chatIdMatch[1] : null,
        message: messageMatch ? messageMatch[1] : null,
        originalMessage: message
      };
    }
    
    const hasWhatsAppIntent = action !== null;
    
    return {
      hasWhatsAppIntent,
      action,
      settings,
      originalMessage: message
    };
  }

  /**
   * 📱 Get success message for WhatsApp actions
   */
  getWhatsAppSuccessMessage(action, result) {
    const messages = {
      enable_auto_response: '✅ Eva ha activado las respuestas automáticas de WhatsApp',
      disable_auto_response: '❌ Eva ha desactivado las respuestas automáticas de WhatsApp',
      send_message: '✅ Eva ha enviado el mensaje de WhatsApp',
      update_settings: '⚙️ Eva ha actualizado la configuración de WhatsApp'
    };
    
    return messages[action] || '✅ Eva ha procesado la solicitud de WhatsApp';
  }

  /**
   * 📱 Get action details for WhatsApp responses
   */
  getWhatsAppActionDetails(detection, result) {
    const details = {};
    
    switch (detection.action) {
      case 'enable_auto_response':
        const settings = result.result?.settings || detection.settings;
        details.mode = settings.mode || 'selective';
        details.confidence_threshold = settings.confidence_threshold || 70;
        details.keywords = settings.keywords || [];
        break;
      
      case 'send_message':
        details.chatId = detection.chatId;
        details.message = detection.message;
        break;
      
      case 'update_settings':
        details.settings = detection.settings;
        break;
    }
    
    return details;
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
  async processGoogleWorkspaceIntentions(message, userId, sessionTokens = null) {
    console.log('📧📅 Checking Google Workspace intentions...');
    
    try {
      // Check if user has Google access via session tokens
      let hasGoogleAccess = false;
      
      if (sessionTokens && sessionTokens.access_token) {
        hasGoogleAccess = true;
        console.log('✅ User authenticated with Google via session tokens');
      } else {
        // Fallback: check emailService
        hasGoogleAccess = emailService.canUserSendEmails(userId) && 
                         calendarService.canUserAccessCalendar(userId);
        console.log('🔍 Checking Google access via emailService:', hasGoogleAccess);
      }
      
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
