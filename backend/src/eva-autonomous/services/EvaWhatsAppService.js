/**
 * 📱 Eva WhatsApp Autonomous Service
 * 
 * Servicio autónomo que permite a Eva responder mensajes de WhatsApp automáticamente.
 * Incluye funcionalidades para:
 * - Responder mensajes automáticamente
 * - Activar/desactivar el asistente
 * - Integración con Eva Decision Matrix
 * - Configuración de reglas de respuesta
 * 
 * Parte de: Fase 3 - Intelligence Orchestration
 * Autor: Eva System Control
 * Fecha: Octubre 12, 2025
 */

const EventEmitter = require('events');
const { getWhatsAppService } = require('../../services/whatsappService');
const { getOpenAIService } = require('../../services/openaiService');

class EvaWhatsAppService extends EventEmitter {
    constructor(autonomousController = null) {
        super();
        this.autonomousController = autonomousController;
        this.whatsappService = getWhatsAppService();
        this.openaiService = getOpenAIService();
        
        // Estado del servicio
        this.isActive = false;
        this.isAutoResponseEnabled = false;
        this.responseSettings = {
            enabled: false,
            mode: 'selective', // 'selective', 'all', 'keywords'
            confidence_threshold: 70,
            response_delay: 2000, // 2 segundos
            max_responses_per_chat: 10,
            daily_limit: 100,
            business_hours_only: false,
            keywords: ['eva', 'asistente', 'ayuda', 'help', 'información', 'consulta'],
            blacklist: ['spam', 'publicidad', 'marketing'],
            auto_approve_emails: false,
            auto_schedule_tasks: false
        };
        
        // Estadísticas
        this.stats = {
            totalMessagesReceived: 0,
            totalResponsesSent: 0,
            responsesPerChat: new Map(),
            dailyResponses: 0,
            lastReset: new Date().toDateString(),
            successRate: 0,
            avgResponseTime: 0,
            activatedSince: null
        };
        
        // Cache de conversaciones activas
        this.activeChats = new Map();
        
        // Setup de eventos
        this.setupEventListeners();
        
        console.log('📱 Eva WhatsApp Autonomous Service initialized');
    }

    /**
     * 🚀 Inicia el servicio autónomo de WhatsApp
     */
    async start() {
        try {
            console.log('🚀 Starting Eva WhatsApp Autonomous Service...');
            
            this.isActive = true;
            this.stats.activatedSince = new Date().toISOString();
            
            // Verificar estado de WhatsApp Web
            await this.checkWhatsAppConnection();
            
            // Registrar eventos de WhatsApp
            this.registerWhatsAppEvents();
            
            // Iniciar monitoreo diario
            this.startDailyReset();
            
            console.log('✅ Eva WhatsApp Autonomous Service started');
            console.log(`📱 Auto-response: ${this.isAutoResponseEnabled ? 'ENABLED' : 'DISABLED'}`);
            console.log(`🎯 Mode: ${this.responseSettings.mode.toUpperCase()}`);
            
            this.emit('whatsapp:started');
            
            return { 
                success: true, 
                message: 'WhatsApp Autonomous Service started',
                autoResponse: this.isAutoResponseEnabled
            };
            
        } catch (error) {
            console.error('❌ Error starting WhatsApp Service:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🛑 Detiene el servicio
     */
    async stop() {
        try {
            console.log('🛑 Stopping Eva WhatsApp Autonomous Service...');
            
            this.isActive = false;
            this.isAutoResponseEnabled = false;
            
            // Desregistrar eventos
            this.unregisterWhatsAppEvents();
            
            console.log('✅ Eva WhatsApp Autonomous Service stopped');
            this.emit('whatsapp:stopped');
            
            return { success: true, message: 'WhatsApp Autonomous Service stopped' };
            
        } catch (error) {
            console.error('❌ Error stopping WhatsApp Service:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * ✅ Activa las respuestas automáticas
     */
    async enableAutoResponse(settings = {}) {
        try {
            console.log('✅ Enabling WhatsApp auto-response...');
            
            if (!this.isActive) {
                throw new Error('WhatsApp service must be started first');
            }
            
            // Verificar conexión de WhatsApp Web
            const whatsappStatus = this.whatsappService.getStatus();
            if (!whatsappStatus.isConnected) {
                throw new Error('WhatsApp Web is not connected. Please scan QR code first.');
            }
            
            // Actualizar configuraciones
            this.responseSettings = { ...this.responseSettings, ...settings, enabled: true };
            this.isAutoResponseEnabled = true;
            
            // Tomar decisión autónoma sobre la activación
            if (this.autonomousController) {
                const decision = await this.autonomousController.makeAutonomousDecision('whatsapp_auto_response', {
                    action: 'enable_whatsapp_response',
                    settings: this.responseSettings
                });
                
                console.log(`🧠 Eva decision on auto-response: ${decision.action} (${decision.confidence}% confidence)`);
            }
            
            console.log('✅ WhatsApp auto-response ENABLED');
            console.log(`🎯 Mode: ${this.responseSettings.mode}`);
            console.log(`🎚️ Confidence threshold: ${this.responseSettings.confidence_threshold}%`);
            console.log(`⏱️ Response delay: ${this.responseSettings.response_delay}ms`);
            
            this.emit('auto_response:enabled', { settings: this.responseSettings });
            
            return {
                success: true,
                message: 'Auto-response enabled',
                settings: this.responseSettings
            };
            
        } catch (error) {
            console.error('❌ Error enabling auto-response:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * ❌ Desactiva las respuestas automáticas
     */
    async disableAutoResponse() {
        try {
            console.log('❌ Disabling WhatsApp auto-response...');
            
            this.responseSettings.enabled = false;
            this.isAutoResponseEnabled = false;
            
            console.log('❌ WhatsApp auto-response DISABLED');
            this.emit('auto_response:disabled');
            
            return {
                success: true,
                message: 'Auto-response disabled'
            };
            
        } catch (error) {
            console.error('❌ Error disabling auto-response:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 📱 Maneja mensajes entrantes de WhatsApp
     */
    async handleIncomingMessage(messageData) {
        try {
            console.log(`📨 Processing WhatsApp message from ${messageData.fromName}: "${messageData.body}"`);
            
            // Actualizar estadísticas
            this.stats.totalMessagesReceived++;
            this.updateDailyStats();
            
            // Verificar si auto-response está habilitado
            if (!this.isAutoResponseEnabled || !this.responseSettings.enabled) {
                console.log('📱 Auto-response disabled, skipping...');
                return { processed: false, reason: 'Auto-response disabled' };
            }
            
            // Validaciones previas
            const validation = await this.validateMessage(messageData);
            if (!validation.shouldRespond) {
                console.log(`📱 Message validation failed: ${validation.reason}`);
                return { processed: false, reason: validation.reason };
            }
            
            // Tomar decisión autónoma sobre responder
            const decision = await this.makeResponseDecision(messageData);
            if (!decision.shouldRespond) {
                console.log(`🧠 Eva decided not to respond: ${decision.reason}`);
                return { processed: false, reason: decision.reason };
            }
            
            // Generar y enviar respuesta
            const response = await this.generateAndSendResponse(messageData, decision);
            
            console.log(`✅ WhatsApp response sent to ${messageData.fromName}`);
            
            return {
                processed: true,
                response,
                decision,
                confidence: decision.confidence
            };
            
        } catch (error) {
            console.error('❌ Error handling WhatsApp message:', error);
            return { processed: false, error: error.message };
        }
    }

    /**
     * ✅ Valida si el mensaje debe ser procesado
     */
    async validateMessage(messageData) {
        // Evitar responder a mensajes propios
        if (messageData.fromMe) {
            return { shouldRespond: false, reason: 'Own message' };
        }
        
        // Evitar grupos por defecto
        if (messageData.from.includes('@g.us')) {
            return { shouldRespond: false, reason: 'Group message' };
        }
        
        // Verificar límites diarios
        if (this.stats.dailyResponses >= this.responseSettings.daily_limit) {
            return { shouldRespond: false, reason: 'Daily limit reached' };
        }
        
        // Verificar límites por chat
        const chatResponses = this.stats.responsesPerChat.get(messageData.from) || 0;
        if (chatResponses >= this.responseSettings.max_responses_per_chat) {
            return { shouldRespond: false, reason: 'Chat limit reached' };
        }
        
        // Verificar horario comercial
        if (this.responseSettings.business_hours_only && !this.isBusinessHours()) {
            return { shouldRespond: false, reason: 'Outside business hours' };
        }
        
        // Verificar blacklist
        const hasBlacklisted = this.responseSettings.blacklist.some(word => 
            messageData.body.toLowerCase().includes(word.toLowerCase())
        );
        if (hasBlacklisted) {
            return { shouldRespond: false, reason: 'Blacklisted content' };
        }
        
        // Verificar modo de respuesta
        if (this.responseSettings.mode === 'keywords') {
            const hasKeyword = this.responseSettings.keywords.some(keyword => 
                messageData.body.toLowerCase().includes(keyword.toLowerCase())
            );
            if (!hasKeyword) {
                return { shouldRespond: false, reason: 'No keywords found' };
            }
        }
        
        return { shouldRespond: true, reason: 'Validation passed' };
    }

    /**
     * 🧠 Toma decisión sobre responder usando Eva Decision Matrix
     */
    async makeResponseDecision(messageData) {
        try {
            if (!this.autonomousController) {
                // Fallback sin Eva
                return {
                    shouldRespond: true,
                    confidence: 75,
                    reason: 'Fallback decision'
                };
            }
            
            // Crear contexto para Eva
            const context = {
                type: 'whatsapp_response',
                message: messageData,
                chat: {
                    id: messageData.from,
                    name: messageData.fromName,
                    previousResponses: this.stats.responsesPerChat.get(messageData.from) || 0
                },
                system: {
                    dailyResponses: this.stats.dailyResponses,
                    successRate: this.stats.successRate
                }
            };
            
            // Usar Eva Decision Matrix
            const decision = await this.autonomousController.makeAutonomousDecision(context, {
                minConfidence: this.responseSettings.confidence_threshold
            });
            
            const shouldRespond = decision.action === 'send_whatsapp_response' && 
                                decision.confidence >= this.responseSettings.confidence_threshold;
            
            return {
                shouldRespond,
                confidence: decision.confidence,
                reason: decision.reason || `Decision: ${decision.action}`,
                decision
            };
            
        } catch (error) {
            console.error('❌ Error in response decision:', error);
            return {
                shouldRespond: false,
                confidence: 0,
                reason: 'Decision error'
            };
        }
    }

    /**
     * 💬 Genera y envía respuesta
     */
    async generateAndSendResponse(messageData, decision) {
        const startTime = Date.now();
        
        try {
            // Delay configurado antes de responder
            await this.sleep(this.responseSettings.response_delay);
            
            // Generar respuesta con OpenAI
            const responseText = await this.generateResponse(messageData);
            
            // Enviar mensaje
            await this.whatsappService.sendMessage(messageData.from, responseText);
            
            // Actualizar estadísticas
            this.updateResponseStats(messageData.from, startTime);
            
            console.log(`💬 Response sent to ${messageData.fromName}: "${responseText}"`);
            
            return {
                text: responseText,
                sentAt: new Date().toISOString(),
                responseTime: Date.now() - startTime
            };
            
        } catch (error) {
            console.error('❌ Error generating/sending response:', error);
            throw error;
        }
    }

    /**
     * 🤖 Genera respuesta con OpenAI
     */
    async generateResponse(messageData) {
        try {
            console.log('🤖 Generating AI response for WhatsApp...');
            
            // Contexto personalizado para WhatsApp
            const context = `
Eres Eva, un asistente inteligente respondiendo via WhatsApp.

Información del mensaje:
- De: ${messageData.fromName}
- Mensaje: "${messageData.body}"
- Fecha: ${new Date().toLocaleString()}

Instrucciones:
- Responde de manera amigable y profesional
- Mantén las respuestas concisas (máximo 3 líneas)
- Usa emojis apropiados pero con moderación
- Si te preguntan sobre capacidades, menciona que puedes ayudar con tareas, información y comunicaciones
- Si mencionan email, puedes ofrecer ayuda para enviar correos
- Personaliza la respuesta según el nombre del usuario

Responde en español de manera natural y útil.
`;
            
            const response = await this.openaiService.generateResponse(
                context,
                [],
                'whatsapp'
            );
            
            if (!response || !response.content) {
                return this.getFallbackResponse(messageData);
            }
            
            return response.content;
            
        } catch (error) {
            console.error('❌ Error generating AI response:', error);
            return this.getFallbackResponse(messageData);
        }
    }

    /**
     * 🔄 Respuesta de fallback
     */
    getFallbackResponse(messageData) {
        const fallbacks = [
            `¡Hola ${messageData.fromName}! 👋 Soy Eva, tu asistente. ¿En qué puedo ayudarte hoy?`,
            `Hola! 😊 Recibí tu mensaje. Soy Eva y estoy aquí para asistirte. ¿Qué necesitas?`,
            `¡Saludos ${messageData.fromName}! 🤖 Soy Eva, tu asistente inteligente. ¿Cómo puedo ayudarte?`,
            `Hola! 👋 Soy Eva. He recibido tu mensaje y estoy lista para ayudarte. ¿Qué necesitas?`
        ];
        
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    /**
     * 📱 Verificar conexión de WhatsApp Web
     */
    async checkWhatsAppConnection() {
        try {
            const status = this.whatsappService.getStatus();
            console.log('📱 WhatsApp Web status:', status);
            
            if (!status.isConnected) {
                console.log('⚠️ WhatsApp Web is not connected');
            } else {
                console.log('✅ WhatsApp Web is connected');
            }
            
            return status.isConnected;
        } catch (error) {
            console.error('❌ Error checking WhatsApp connection:', error);
            return false;
        }
    }

    /**
     * 🔗 Configurar event listeners
     */
    setupEventListeners() {
        console.log('🔗 Setting up WhatsApp event listeners...');
        
        // Escuchar cambios en el controlador autónomo
        if (this.autonomousController) {
            this.autonomousController.on('autonomous:started', () => {
                console.log('🤖 Autonomous controller started - WhatsApp service available');
            });
            
            this.autonomousController.on('autonomous:stopped', () => {
                console.log('🤖 Autonomous controller stopped - Disabling WhatsApp auto-response');
                this.disableAutoResponse();
            });
        }
    }

    /**
     * 📱 Registrar eventos de WhatsApp
     */
    registerWhatsAppEvents() {
        console.log('📱 Registering WhatsApp message events...');
        
        // Escuchar mensajes entrantes
        this.whatsappService.on('message', async (messageData) => {
            try {
                await this.handleIncomingMessage(messageData);
            } catch (error) {
                console.error('❌ Error in WhatsApp message handler:', error);
            }
        });
        
        // Escuchar estado de conexión
        this.whatsappService.on('ready', () => {
            console.log('📱 WhatsApp connected - Auto-response ready');
            this.emit('whatsapp:connected');
        });
        
        this.whatsappService.on('disconnected', () => {
            console.log('📱 WhatsApp disconnected - Auto-response paused');
            this.emit('whatsapp:disconnected');
        });
    }

    /**
     * 📱 Desregistrar eventos de WhatsApp
     */
    unregisterWhatsAppEvents() {
        console.log('📱 Unregistering WhatsApp events...');
        // Nota: whatsapp-web.js no permite removeListener fácilmente
        // Se maneja con el flag isActive
    }

    /**
     * 📊 Actualizar estadísticas de respuesta
     */
    updateResponseStats(chatId, startTime) {
        this.stats.totalResponsesSent++;
        this.stats.dailyResponses++;
        
        // Actualizar respuestas por chat
        const currentCount = this.stats.responsesPerChat.get(chatId) || 0;
        this.stats.responsesPerChat.set(chatId, currentCount + 1);
        
        // Actualizar tiempo promedio de respuesta
        const responseTime = Date.now() - startTime;
        this.stats.avgResponseTime = (this.stats.avgResponseTime + responseTime) / 2;
        
        // Calcular tasa de éxito
        this.stats.successRate = (this.stats.totalResponsesSent / this.stats.totalMessagesReceived) * 100;
        
        this.emit('stats:updated', this.stats);
    }

    /**
     * 📅 Actualizar estadísticas diarias
     */
    updateDailyStats() {
        const today = new Date().toDateString();
        
        if (this.stats.lastReset !== today) {
            // Reset diario
            this.stats.dailyResponses = 0;
            this.stats.lastReset = today;
            console.log('📅 Daily stats reset');
        }
    }

    /**
     * 🕐 Iniciar reset diario
     */
    startDailyReset() {
        // Reset a las 00:00 cada día
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const msUntilMidnight = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            this.updateDailyStats();
            
            // Configurar intervalo diario
            setInterval(() => {
                this.updateDailyStats();
            }, 24 * 60 * 60 * 1000);
            
        }, msUntilMidnight);
    }

    /**
     * 🕒 Verificar horario comercial
     */
    isBusinessHours() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay(); // 0 = Domingo, 6 = Sábado
        
        // Lunes a Viernes, 9 AM a 6 PM
        return day >= 1 && day <= 5 && hour >= 9 && hour <= 18;
    }

    /**
     * ⏱️ Función sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * ⚙️ Configurar ajustes de respuesta
     */
    async updateSettings(newSettings) {
        try {
            console.log('⚙️ Updating WhatsApp response settings...');
            
            this.responseSettings = { ...this.responseSettings, ...newSettings };
            
            console.log('✅ Settings updated:', newSettings);
            this.emit('settings:updated', this.responseSettings);
            
            return {
                success: true,
                message: 'Settings updated',
                settings: this.responseSettings
            };
            
        } catch (error) {
            console.error('❌ Error updating settings:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 📊 Métodos públicos para reporting
     */
    getStats() {
        const whatsappStatus = this.whatsappService.getStatus();
        
        return {
            ...this.stats,
            isActive: this.isActive,
            autoResponseEnabled: this.isAutoResponseEnabled,
            whatsappConnected: whatsappStatus.isConnected,
            whatsappStatus: whatsappStatus.status,
            connectedNumber: whatsappStatus.connectedNumber,
            settings: this.responseSettings,
            activeChats: this.activeChats.size
        };
    }

    getSettings() {
        return this.responseSettings;
    }

    isAutoResponseActive() {
        return this.isActive && this.isAutoResponseEnabled;
    }

    /**
     * 🎯 Métodos específicos para Eva
     */
    async processWhatsAppRequest(request) {
        try {
            console.log('🎯 Processing WhatsApp request:', request.type);
            
            switch (request.type) {
                case 'send_message':
                    return await this.sendMessage(request.chatId, request.message);
                
                case 'enable_auto_response':
                    return await this.enableAutoResponse(request.settings);
                
                case 'disable_auto_response':
                    return await this.disableAutoResponse();
                
                case 'update_settings':
                    return await this.updateSettings(request.settings);
                
                case 'get_stats':
                    return { success: true, stats: this.getStats() };
                
                default:
                    throw new Error(`Unknown request type: ${request.type}`);
            }
            
        } catch (error) {
            console.error('❌ Error processing WhatsApp request:', error);
            return { success: false, error: error.message };
        }
    }

    async sendMessage(chatId, message) {
        try {
            const response = await this.whatsappService.sendMessage(chatId, message);
            return {
                success: true,
                messageId: response.id._serialized,
                message: 'Message sent via Eva WhatsApp Service'
            };
        } catch (error) {
            console.error('❌ Error sending message:', error);
            throw error;
        }
    }
}

module.exports = EvaWhatsAppService;