// 🤖 Eva Auto Response Service - Asistente Personal Autónomo
// Permite que Eva responda mensajes automáticamente como tu asistente personal

const openaiService = require('./openaiService');
const intelligenceService = require('./intelligenceService');

class EvaAutoResponseService {
  constructor() {
    this.isEnabled = true;
    this.ownerName = "Bener"; // Tu nombre
    this.assistantName = "Eva"; // Nombre de tu asistente
    
    // Configuración de respuesta automática
    this.autoResponseConfig = {
      // Niveles de confianza para auto-respuesta
      confidenceThresholds: {
        immediate: 0.9,  // Respuesta inmediata (muy alta confianza)
        quick: 0.8,      // Respuesta rápida (alta confianza)
        review: 0.6,     // Requiere revisión (confianza media)
        manual: 0.5      // Requiere aprobación manual (baja confianza)
      },
      
      // Tipos de mensajes que Eva puede manejar automáticamente
      autoHandleTypes: [
        'greeting',           // Saludos
        'meeting_request',    // Solicitudes de reunión
        'information_request', // Solicitudes de información
        'scheduling',         // Programación
        'confirmation',       // Confirmaciones
        'simple_question',    // Preguntas simples
        'availability_check'  // Consultas de disponibilidad
      ],
      
      // Tipos que requieren aprobación manual
      manualApprovalTypes: [
        'sensitive_business', // Negocios sensibles
        'personal_matter',    // Asuntos personales
        'financial',          // Temas financieros
        'contract',           // Contratos
        'emergency',          // Emergencias
        'complex_decision'    // Decisiones complejas
      ],
      
      // Horarios de trabajo para respuestas automáticas
      workingHours: {
        enabled: true,
        timezone: 'America/Mexico_City',
        schedule: {
          monday: { start: '09:00', end: '18:00' },
          tuesday: { start: '09:00', end: '18:00' },
          wednesday: { start: '09:00', end: '18:00' },
          thursday: { start: '09:00', end: '18:00' },
          friday: { start: '09:00', end: '18:00' },
          saturday: { start: '10:00', end: '14:00' },
          sunday: { disabled: true }
        }
      }
    };
    
    // Base de conocimiento personalizada
    this.knowledgeBase = {
      // Información básica sobre ti
      owner: {
        name: "Bener",
        role: "Developer & Business Owner",
        company: "Eva Systems",
        expertise: ["AI Development", "Software Engineering", "Business Strategy"],
        availability: "Generally available weekdays 9 AM - 6 PM Mexico City time",
        preferredContactMethod: "WhatsApp or Email"
      },
      
      // Respuestas estándar para situaciones comunes
      standardResponses: {
        greeting: [
          "¡Hola! Soy Eva, la asistente de Bener. ¿En qué puedo ayudarte hoy?",
          "¡Hola! Eva aquí, asistente personal de Bener. ¿Cómo puedo asistirte?",
          "¡Buenos días/tardes! Soy Eva, la asistente de Bener. ¿En qué te puedo ayudar?"
        ],
        unavailable: [
          "Bener no está disponible en este momento, pero puedo ayudarte a programar una reunión o responder preguntas básicas.",
          "Bener está ocupado ahora mismo, pero soy Eva, su asistente. ¿Puedo ayudarte con algo?",
          "En este momento Bener no está disponible, pero como su asistente puedo atenderte."
        ],
        scheduling: [
          "Me encargo de la agenda de Bener. ¿Qué día y hora prefieres para la reunión?",
          "Claro, puedo ayudarte a programar una cita con Bener. ¿Cuándo te viene bien?",
          "Perfecto, manejo su calendario. ¿Qué horario funciona mejor para ti?"
        ]
      }
    };
  }

  /**
   * 🎯 Función principal: Analizar mensaje entrante y decidir si responder automáticamente
   */
  async analyzeIncomingMessage(messageData) {
    try {
      console.log('🤖 Eva analizando mensaje entrante:', messageData.body);
      
      // 1. Análisis contextual avanzado
      const analysis = await this.performContextAnalysis(messageData);
      
      // 2. Determinar si debe responder automáticamente
      const decision = await this.makeAutoResponseDecision(analysis, messageData);
      
      // 3. Si debe responder, generar respuesta personalizada
      if (decision.shouldAutoRespond) {
        const response = await this.generatePersonalizedResponse(analysis, messageData, decision);
        return {
          shouldRespond: true,
          response: response,
          confidence: decision.confidence,
          reasoning: decision.reasoning,
          type: decision.responseType,
          requiresApproval: decision.confidence < this.autoResponseConfig.confidenceThresholds.quick
        };
      } else {
        return {
          shouldRespond: false,
          reasoning: decision.reasoning,
          suggestedAction: decision.suggestedAction,
          requiresManualReview: true
        };
      }
    } catch (error) {
      console.error('❌ Error en Eva AutoResponse:', error);
      return {
        shouldRespond: false,
        error: error.message,
        requiresManualReview: true
      };
    }
  }

  /**
   * 🧠 Análisis contextual avanzado del mensaje
   */
  async performContextAnalysis(messageData) {
    console.log('🧠 Realizando análisis contextual...');
    
    const analysis = {
      // Información básica del mensaje
      message: {
        body: messageData.body,
        sender: messageData.from,
        senderName: messageData.senderName || messageData.notifyName,
        timestamp: messageData.timestamp,
        isGroup: messageData.isGroup || false,
        hasMedia: messageData.hasMedia || false
      },
      
      // Análisis de intención y contexto
      intent: null,
      entities: null,
      urgency: 'normal',
      sentiment: 'neutral',
      businessContext: false,
      personalContext: false,
      
      // Análisis temporal
      timeContext: this.analyzeTimeContext(),
      
      // Historial de conversación (si está disponible)
      conversationHistory: null
    };

    try {
      // Usar el Intelligence Service existente de Eva para análisis avanzado
      const intelligenceAnalysis = await intelligenceService.analyzeMessage(messageData.body);
      
      analysis.intent = intelligenceAnalysis.intent;
      analysis.entities = intelligenceAnalysis.entities;
      analysis.urgency = intelligenceAnalysis.urgency || 'normal';
      analysis.sentiment = intelligenceAnalysis.sentiment || 'neutral';
      
      // Determinar contexto de negocio vs personal
      analysis.businessContext = this.isBusinessContext(messageData.body, intelligenceAnalysis);
      analysis.personalContext = !analysis.businessContext;
      
      console.log('✅ Análisis contextual completado:', {
        intent: analysis.intent,
        urgency: analysis.urgency,
        businessContext: analysis.businessContext
      });
      
    } catch (error) {
      console.error('❌ Error en análisis de inteligencia:', error);
      // Fallback a análisis básico
      analysis.intent = await this.basicIntentAnalysis(messageData.body);
    }
    
    return analysis;
  }

  /**
   * 🤔 Tomar decisión sobre auto-respuesta
   */
  async makeAutoResponseDecision(analysis, messageData) {
    console.log('🤔 Eva decidiendo sobre auto-respuesta...');
    
    const decision = {
      shouldAutoRespond: false,
      confidence: 0,
      reasoning: '',
      responseType: 'none',
      suggestedAction: 'manual_review'
    };

    // 1. Verificar si está habilitada la auto-respuesta
    if (!this.isEnabled) {
      decision.reasoning = 'Auto-respuesta deshabilitada';
      return decision;
    }

    // 2. Verificar horario de trabajo
    if (!this.isWithinWorkingHours()) {
      decision.reasoning = 'Fuera de horario de trabajo';
      decision.suggestedAction = 'after_hours_response';
      return decision;
    }

    // 3. Análisis de confianza basado en el tipo de mensaje
    let confidence = 0;
    let responseType = 'general';

    // Saludos simples = alta confianza
    if (this.isSimpleGreeting(messageData.body)) {
      confidence = 0.95;
      responseType = 'greeting';
    }
    // Solicitudes de información = alta confianza
    else if (analysis.intent === 'information_request') {
      confidence = 0.85;
      responseType = 'information';
    }
    // Solicitudes de reunión = confianza media-alta
    else if (analysis.intent === 'meeting_request' || analysis.intent === 'scheduling') {
      confidence = 0.80;
      responseType = 'scheduling';
    }
    // Confirmaciones = alta confianza
    else if (analysis.intent === 'confirmation') {
      confidence = 0.90;
      responseType = 'confirmation';
    }
    // Consultas de disponibilidad = alta confianza
    else if (this.isAvailabilityCheck(messageData.body)) {
      confidence = 0.88;
      responseType = 'availability';
    }
    // Contexto de negocio pero no sensible = confianza media
    else if (analysis.businessContext && !this.isSensitiveTopic(messageData.body)) {
      confidence = 0.70;
      responseType = 'business_general';
    }
    // Preguntas simples = confianza media
    else if (analysis.intent === 'question' && !this.isComplexQuestion(messageData.body)) {
      confidence = 0.75;
      responseType = 'simple_question';
    }

    // 4. Ajustar confianza basado en urgencia
    if (analysis.urgency === 'high' || analysis.urgency === 'urgent') {
      confidence = Math.max(confidence - 0.15, 0.4); // Reducir confianza para temas urgentes
    }

    // 5. Verificar si es tema sensible que requiere aprobación manual
    if (this.isSensitiveTopic(messageData.body)) {
      confidence = 0.3; // Forzar revisión manual
      decision.reasoning = 'Tema sensible detectado - requiere revisión manual';
    }

    // 6. Tomar decisión final
    decision.confidence = confidence;
    decision.responseType = responseType;
    
    if (confidence >= this.autoResponseConfig.confidenceThresholds.quick) {
      decision.shouldAutoRespond = true;
      decision.reasoning = `Alta confianza (${confidence.toFixed(2)}) - respuesta automática aprobada`;
    } else if (confidence >= this.autoResponseConfig.confidenceThresholds.review) {
      decision.shouldAutoRespond = true; // Pero requerirá revisión
      decision.reasoning = `Confianza media (${confidence.toFixed(2)}) - respuesta automática con revisión`;
    } else {
      decision.shouldAutoRespond = false;
      decision.reasoning = `Confianza baja (${confidence.toFixed(2)}) - requiere intervención manual`;
      decision.suggestedAction = 'manual_review';
    }

    console.log('✅ Decisión tomada:', decision);
    return decision;
  }

  /**
   * ✍️ Generar respuesta personalizada
   */
  async generatePersonalizedResponse(analysis, messageData, decision) {
    console.log('✍️ Generando respuesta personalizada...');
    
    try {
      // Construir prompt personalizado para Eva
      const prompt = this.buildResponsePrompt(analysis, messageData, decision);
      
      // Usar OpenAI para generar respuesta natural
      const response = await openaiService.generateChatResponse(prompt);
      
      // Post-procesar respuesta
      const personalizedResponse = this.postProcessResponse(response, analysis, messageData);
      
      console.log('✅ Respuesta generada:', personalizedResponse);
      return personalizedResponse;
      
    } catch (error) {
      console.error('❌ Error generando respuesta:', error);
      // Fallback a respuesta estándar
      return this.getFallbackResponse(decision.responseType, analysis);
    }
  }

  /**
   * 📝 Construir prompt para generar respuesta
   */
  buildResponsePrompt(analysis, messageData, decision) {
    const currentTime = new Date().toLocaleString('es-MX', { 
      timeZone: 'America/Mexico_City',
      hour12: true 
    });
    
    return `Eres Eva, la asistente personal de Bener. Responde este mensaje de WhatsApp de manera profesional pero amigable.

CONTEXTO DEL ASISTENTE:
- Nombre: Eva
- Rol: Asistente personal de Bener
- Personalidad: Profesional, eficiente, amigable, proactiva
- Horario actual: ${currentTime} (México)

INFORMACIÓN DE BENER:
- Nombre: Bener
- Rol: Developer & Business Owner
- Empresa: Eva Systems
- Especialidades: AI Development, Software Engineering, Business Strategy

MENSAJE RECIBIDO:
De: ${messageData.senderName || 'Usuario'}
Contenido: "${messageData.body}"

ANÁLISIS DEL MENSAJE:
- Intención: ${analysis.intent}
- Urgencia: ${analysis.urgency}
- Contexto: ${analysis.businessContext ? 'Negocios' : 'Personal'}
- Tipo de respuesta: ${decision.responseType}

INSTRUCCIONES:
1. Responde como Eva, la asistente personal de Bener
2. Sé profesional pero cálida y accesible
3. Ofrece ayuda específica según el contexto
4. Si es una solicitud de reunión, ofrece opciones de horarios
5. Si necesitas información de Bener, menciona que le consultarás
6. Mantén la respuesta concisa pero útil (máximo 2-3 oraciones)
7. Usa un tono apropiado para WhatsApp (no demasiado formal)
8. Si es apropiado, ofrece próximos pasos claros

Respuesta de Eva:`;
  }

  /**
   * 🔧 Post-procesar respuesta generada
   */
  postProcessResponse(response, analysis, messageData) {
    // Limpiar respuesta
    let processedResponse = response.trim();
    
    // Agregar firma de Eva si no está presente
    if (!processedResponse.toLowerCase().includes('eva') && 
        !processedResponse.toLowerCase().includes('asistente')) {
      processedResponse += '\n\n— Eva, Asistente de Bener 🤖';
    }
    
    // Agregar contexto temporal si es relevante
    if (analysis.timeContext.isOutOfHours) {
      processedResponse += '\n\nℹ️ Bener revisará tu mensaje cuando esté disponible.';
    }
    
    return processedResponse;
  }

  /**
   * 🆘 Respuesta de fallback para errores
   */
  getFallbackResponse(responseType, analysis) {
    const fallbacks = {
      greeting: "¡Hola! Soy Eva, la asistente de Bener. ¿En qué puedo ayudarte?",
      scheduling: "Hola, soy Eva, la asistente de Bener. Me encargo de su agenda. ¿Te gustaría programar una reunión?",
      information: "Hola, soy Eva, asistente de Bener. Puedo ayudarte con información general o conectarte con él.",
      general: "Hola, soy Eva, la asistente personal de Bener. ¿En qué puedo asistirte hoy?"
    };
    
    return fallbacks[responseType] || fallbacks.general;
  }

  /**
   * 🕐 Analizar contexto temporal
   */
  analyzeTimeContext() {
    const now = new Date();
    const mexicoTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
    const hour = mexicoTime.getHours();
    const day = mexicoTime.getDay(); // 0 = domingo, 6 = sábado
    
    return {
      currentTime: mexicoTime,
      hour: hour,
      dayOfWeek: day,
      isWeekend: day === 0 || day === 6,
      isWorkingHours: this.isWithinWorkingHours(),
      isOutOfHours: !this.isWithinWorkingHours(),
      timeOfDay: hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
    };
  }

  /**
   * ⏰ Verificar si está dentro del horario de trabajo
   */
  isWithinWorkingHours() {
    if (!this.autoResponseConfig.workingHours.enabled) return true;
    
    const now = new Date();
    const mexicoTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
    const hour = mexicoTime.getHours();
    const minute = mexicoTime.getMinutes();
    const day = mexicoTime.getDay();
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const daySchedule = this.autoResponseConfig.workingHours.schedule[dayNames[day]];
    
    if (!daySchedule || daySchedule.disabled) return false;
    
    const startTime = parseInt(daySchedule.start.split(':')[0]) * 60 + parseInt(daySchedule.start.split(':')[1]);
    const endTime = parseInt(daySchedule.end.split(':')[0]) * 60 + parseInt(daySchedule.end.split(':')[1]);
    const currentTime = hour * 60 + minute;
    
    return currentTime >= startTime && currentTime <= endTime;
  }

  /**
   * 🔍 Métodos de análisis de contenido
   */
  isSimpleGreeting(text) {
    const greetings = ['hola', 'hello', 'hi', 'buenos días', 'buenas tardes', 'buenas noches', 'que tal'];
    const lowerText = text.toLowerCase();
    return greetings.some(greeting => lowerText.includes(greeting)) && text.length < 50;
  }

  isAvailabilityCheck(text) {
    const availabilityKeywords = ['disponible', 'available', 'libre', 'ocupado', 'busy', 'cuando puedes', 'when can'];
    return availabilityKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  isSensitiveTopic(text) {
    const sensitiveKeywords = [
      'contrato', 'contract', 'dinero', 'money', 'pago', 'payment', 'precio', 'price',
      'legal', 'lawsuit', 'demanda', 'urgent', 'urgente', 'emergency', 'emergencia',
      'confidential', 'confidencial', 'privado', 'private', 'personal', 'secreto'
    ];
    return sensitiveKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  isComplexQuestion(text) {
    return text.length > 200 || text.includes('?') && text.split('?').length > 2;
  }

  isBusinessContext(text, intelligenceAnalysis) {
    const businessKeywords = ['meeting', 'reunión', 'proyecto', 'project', 'trabajo', 'work', 'negocio', 'business'];
    const hasBusinessKeywords = businessKeywords.some(keyword => text.toLowerCase().includes(keyword));
    const hasBusinessEntities = intelligenceAnalysis.entities && intelligenceAnalysis.entities.some(entity => 
      entity.type === 'project' || entity.type === 'company' || entity.type === 'meeting'
    );
    return hasBusinessKeywords || hasBusinessEntities;
  }

  async basicIntentAnalysis(text) {
    const lowerText = text.toLowerCase();
    
    if (this.isSimpleGreeting(text)) return 'greeting';
    if (lowerText.includes('reunión') || lowerText.includes('meeting')) return 'meeting_request';
    if (lowerText.includes('?')) return 'question';
    if (lowerText.includes('disponible') || lowerText.includes('available')) return 'availability_check';
    if (lowerText.includes('confirmar') || lowerText.includes('confirm')) return 'confirmation';
    
    return 'general_inquiry';
  }

  /**
   * ⚙️ Métodos de configuración
   */
  updateConfig(newConfig) {
    this.autoResponseConfig = { ...this.autoResponseConfig, ...newConfig };
    console.log('🔧 Configuración de auto-respuesta actualizada');
  }

  enable() {
    this.isEnabled = true;
    console.log('✅ Auto-respuesta Eva habilitada');
  }

  disable() {
    this.isEnabled = false;
    console.log('🔴 Auto-respuesta Eva deshabilitada');
  }

  getStatus() {
    return {
      enabled: this.isEnabled,
      withinWorkingHours: this.isWithinWorkingHours(),
      timeContext: this.analyzeTimeContext(),
      config: this.autoResponseConfig
    };
  }
}

module.exports = new EvaAutoResponseService();