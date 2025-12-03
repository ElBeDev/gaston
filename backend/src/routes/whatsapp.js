const express = require('express');
const { getWhatsAppService } = require('../services/whatsappService');
const { getOpenAIService } = require('../services/openaiService');

const router = express.Router();

// Obtener estado de WhatsApp
router.get('/status', async (req, res) => {
    try {
        const whatsappService = getWhatsAppService();
        const status = whatsappService.getStatus();
        res.json({ success: true, status });
    } catch (error) {
        console.error('❌ Error al obtener estado WhatsApp:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener estado de WhatsApp' 
        });
    }
});

// Obtener código QR
router.get('/qr', async (req, res) => {
    try {
        const whatsappService = getWhatsAppService();
        const qrImage = await whatsappService.getQRCode();
        
        if (!qrImage) {
            return res.json({ 
                success: false, 
                message: 'QR no disponible. Inicia WhatsApp primero.' 
            });
        }
        
        res.json({ success: true, qr: qrImage });
    } catch (error) {
        console.error('❌ Error al obtener QR:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al generar código QR' 
        });
    }
});

// Inicializar WhatsApp
router.post('/initialize', async (req, res) => {
    try {
        const whatsappService = getWhatsAppService();
        
        // Verificar si ya está conectado
        if (whatsappService.isConnected) {
            return res.json({ 
                success: true, 
                message: 'WhatsApp ya está conectado',
                status: whatsappService.getStatus()
            });
        }
        
        // Inicializar de forma asíncrona
        whatsappService.initialize().catch(console.error);
        
        res.json({ 
            success: true, 
            message: 'Inicializando WhatsApp. Escanea el código QR.' 
        });
    } catch (error) {
        console.error('❌ Error al inicializar WhatsApp:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al inicializar WhatsApp' 
        });
    }
});

// Desconectar WhatsApp
router.post('/disconnect', async (req, res) => {
    try {
        const whatsappService = getWhatsAppService();
        await whatsappService.disconnect();
        
        res.json({ 
            success: true, 
            message: 'WhatsApp desconectado exitosamente' 
        });
    } catch (error) {
        console.error('❌ Error al desconectar WhatsApp:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al desconectar WhatsApp' 
        });
    }
});

// Enviar mensaje
router.post('/send-message', async (req, res) => {
    try {
        const { chatId, message } = req.body;
        
        if (!chatId || !message) {
            return res.status(400).json({ 
                success: false, 
                error: 'chatId y message son requeridos' 
            });
        }
        
        const whatsappService = getWhatsAppService();
        
        if (!whatsappService.isConnected) {
            return res.status(400).json({ 
                success: false, 
                error: 'WhatsApp no está conectado' 
            });
        }
        
        const response = await whatsappService.sendMessage(chatId, message);
        
        res.json({ 
            success: true, 
            message: 'Mensaje enviado exitosamente',
            response: response.id._serialized
        });
    } catch (error) {
        console.error('❌ Error al enviar mensaje:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al enviar mensaje' 
        });
    }
});

// Cache simple para throttling
let lastChatsRequest = 0;
const CHATS_THROTTLE_MS = 5000; // 5 segundos mínimo entre requests

// Obtener conversaciones activas
router.get('/chats', async (req, res) => {
    try {
        // Throttling agresivo
        const now = Date.now();
        if (now - lastChatsRequest < CHATS_THROTTLE_MS) {
            console.log('🚫 THROTTLED - request demasiado rápido');
            return res.status(429).json({ 
                success: false, 
                error: 'Too many requests',
                waitMs: CHATS_THROTTLE_MS - (now - lastChatsRequest)
            });
        }
        lastChatsRequest = now;
        
        const whatsappService = getWhatsAppService();
        
        if (!whatsappService.isConnected) {
            return res.status(400).json({ 
                success: false, 
                error: 'WhatsApp no está conectado' 
            });
        }
        
        console.log('📋 API /chats llamada - obteniendo conversaciones...');
        const chats = await whatsappService.getChats();
        // Log reducido: console.log(`📋 API /chats devolviendo ${chats.length} conversaciones`);
        
        res.json({ 
            success: true, 
            chats: chats
        });
    } catch (error) {
        console.error('❌ Error al obtener chats via API:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener conversaciones' 
        });
    }
});

// Obtener mensajes de una conversación específica
router.get('/chat/:chatId/messages', async (req, res) => {
    try {
        const { chatId } = req.params;
        const { limit = 20, offset = 0 } = req.query;
        
        const whatsappService = getWhatsAppService();
        
        if (!whatsappService.isConnected) {
            return res.status(400).json({ 
                success: false, 
                error: 'WhatsApp no está conectado' 
            });
        }
        
        const messages = await whatsappService.getChatMessages(chatId, parseInt(limit), parseInt(offset));
        
        res.json({ 
            success: true, 
            messages: messages,
            hasMore: messages.length === parseInt(limit) // Indica si hay más mensajes
        });
    } catch (error) {
        console.error('❌ Error al obtener mensajes:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener mensajes' 
        });
    }
});

// Marcar mensajes como leídos
router.post('/chat/:chatId/mark-read', async (req, res) => {
    try {
        const { chatId } = req.params;
        
        const whatsappService = getWhatsAppService();
        
        if (!whatsappService.isConnected) {
            return res.status(400).json({ 
                success: false, 
                error: 'WhatsApp no está conectado' 
            });
        }
        
        await whatsappService.markChatAsRead(chatId);
        
        res.json({ 
            success: true, 
            message: 'Chat marcado como leído'
        });
    } catch (error) {
        console.error('❌ Error al marcar como leído:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al marcar chat como leído' 
        });
    }
});

// Obtener información de contacto
router.get('/contact/:contactId', async (req, res) => {
    try {
        const { contactId } = req.params;
        
        const whatsappService = getWhatsAppService();
        
        if (!whatsappService.isConnected) {
            return res.status(400).json({ 
                success: false, 
                error: 'WhatsApp no está conectado' 
            });
        }
        
        const contactInfo = await whatsappService.getContactInfo(contactId);
        
        res.json({ 
            success: true, 
            contact: contactInfo
        });
    } catch (error) {
        console.error('❌ Error al obtener información del contacto:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener información del contacto' 
        });
    }
});

// Configurar eventos de WebSocket (si hay un io disponible)
function setupWhatsAppWebSocket(io) {
    const whatsappService = getWhatsAppService();
    
    // Evento: QR generado
    whatsappService.on('qr', (qr) => {
        io.emit('whatsapp_qr', { qr });
    });
    
    // Evento: Cliente listo
    whatsappService.on('ready', (info) => {
        io.emit('whatsapp_ready', { 
            status: 'connected',
            info 
        });
    });

    // Evento: Conversaciones cargadas
    whatsappService.on('chats_loaded', (chats) => {
        console.log(`📋 Emitiendo ${chats.length} conversaciones cargadas via WebSocket`);
        io.emit('whatsapp_chats_loaded', { chats });
        console.log(`📡 Evento whatsapp_chats_loaded enviado a todos los clientes conectados`);
    });
    
    // Evento: Cliente autenticado
    whatsappService.on('authenticated', () => {
        io.emit('whatsapp_authenticated', { 
            status: 'authenticated' 
        });
    });
    
    // Evento: Cliente desconectado
    whatsappService.on('disconnected', (reason) => {
        io.emit('whatsapp_disconnected', { 
            status: 'disconnected',
            reason 
        });
    });
    
    // Evento: Error
    whatsappService.on('error', (error) => {
        io.emit('whatsapp_error', { 
            error: error.message 
        });
    });
    
    // Evento: Mensaje recibido
    whatsappService.on('message', async (messageData) => {
        // Emitir a frontend
        io.emit('whatsapp_message', messageData);
        
        // Emitir actualización de chats para refrescar la lista
        io.emit('whatsapp_chats_updated');
        
        // Aquí podríamos integrar con IA para responder automáticamente
        try {
            await handleIncomingMessageWithAI(messageData);
        } catch (error) {
            console.error('❌ Error al procesar mensaje con IA:', error);
        }
    });
}

// Función para manejar mensajes con IA
async function handleIncomingMessageWithAI(messageData) {
    try {
        const openaiService = getOpenAIService();
        const whatsappService = getWhatsAppService();
        
        // Por ahora solo respondemos a mensajes que contengan "eva" o "asistente"
        const shouldRespond = messageData.body.toLowerCase().includes('eva') || 
                             messageData.body.toLowerCase().includes('asistente') ||
                             messageData.body.toLowerCase().includes('hola');
        
        if (!shouldRespond) {
            return;
        }
        
        console.log('🤖 Generando respuesta con IA para WhatsApp...');
        
        // Generar respuesta con OpenAI
        const response = await openaiService.generateResponse(
            `Usuario de WhatsApp (${messageData.fromName}): ${messageData.body}`,
            [],
            'whatsapp'
        );
        
        if (response && response.content) {
            // Enviar respuesta
            await whatsappService.sendMessage(messageData.from, response.content);
            console.log('✅ Respuesta automática enviada via WhatsApp');
        }
        
    } catch (error) {
        console.error('❌ Error al generar respuesta automática:', error);
    }
}

// ========================
// 🤖 EVA AUTO-RESPONSE ROUTES
// ========================

// Obtener estado de Eva Auto Response
router.get('/eva/status', async (req, res) => {
    try {
        const evaAutoResponse = require('../services/evaAutoResponseService');
        const status = evaAutoResponse.getStatus();
        
        res.json({ 
            success: true, 
            status: {
                ...status,
                description: 'Eva Auto Response System Status'
            }
        });
    } catch (error) {
        console.error('❌ Error al obtener estado de Eva:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener estado de Eva Auto Response' 
        });
    }
});

// Habilitar Eva Auto Response
router.post('/eva/enable', async (req, res) => {
    try {
        const evaAutoResponse = require('../services/evaAutoResponseService');
        evaAutoResponse.enable();
        
        res.json({ 
            success: true, 
            message: 'Eva Auto Response habilitada',
            status: evaAutoResponse.getStatus()
        });
    } catch (error) {
        console.error('❌ Error al habilitar Eva:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al habilitar Eva Auto Response' 
        });
    }
});

// Deshabilitar Eva Auto Response
router.post('/eva/disable', async (req, res) => {
    try {
        const evaAutoResponse = require('../services/evaAutoResponseService');
        evaAutoResponse.disable();
        
        res.json({ 
            success: true, 
            message: 'Eva Auto Response deshabilitada',
            status: evaAutoResponse.getStatus()
        });
    } catch (error) {
        console.error('❌ Error al deshabilitar Eva:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al deshabilitar Eva Auto Response' 
        });
    }
});

// Actualizar configuración de Eva
router.post('/eva/config', async (req, res) => {
    try {
        const { config } = req.body;
        
        if (!config) {
            return res.status(400).json({ 
                success: false, 
                error: 'Configuración requerida' 
            });
        }
        
        const evaAutoResponse = require('../services/evaAutoResponseService');
        evaAutoResponse.updateConfig(config);
        
        res.json({ 
            success: true, 
            message: 'Configuración de Eva actualizada',
            status: evaAutoResponse.getStatus()
        });
    } catch (error) {
        console.error('❌ Error al actualizar configuración:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar configuración de Eva' 
        });
    }
});

// Probar Eva Auto Response con un mensaje de ejemplo
router.post('/eva/test', async (req, res) => {
    try {
        const { message, senderName = 'Usuario Test' } = req.body;
        
        if (!message) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mensaje requerido para la prueba' 
            });
        }
        
        const evaAutoResponse = require('../services/evaAutoResponseService');
        
        // Crear datos de mensaje de prueba
        const testMessageData = {
            id: `test_${Date.now()}`,
            from: 'test@c.us',
            senderName: senderName,
            body: message,
            type: 'chat',
            timestamp: Math.floor(Date.now() / 1000),
            isGroup: false,
            hasMedia: false
        };
        
        // Analizar mensaje con Eva
        const responseDecision = await evaAutoResponse.analyzeIncomingMessage(testMessageData);
        
        res.json({ 
            success: true, 
            testMessage: testMessageData,
            evaDecision: responseDecision,
            message: responseDecision.shouldRespond 
                ? 'Eva respondería automáticamente' 
                : 'Eva NO respondería automáticamente'
        });
    } catch (error) {
        console.error('❌ Error al probar Eva:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al probar Eva Auto Response' 
        });
    }
});

module.exports = {
    router,
    setupWhatsAppWebSocket
};