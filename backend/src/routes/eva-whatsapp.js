/**
 * 📱 Eva WhatsApp Autonomous API Routes
 * 
 * Endpoints para controlar el sistema autónomo de WhatsApp:
 * - Activar/desactivar respuestas automáticas
 * - Configurar parámetros de respuesta
 * - Obtener estadísticas
 * - Control manual de mensajes
 * 
 * Parte de: Fase 3 - Intelligence Orchestration
 * Autor: Eva System Control
 * Fecha: Octubre 12, 2025
 */

const express = require('express');
const router = express.Router();

/**
 * 📊 Obtiene estado del sistema autónomo de WhatsApp
 */
router.get('/status', async (req, res) => {
    try {
        const autonomousController = global.evaAutonomousController;
        
        if (!autonomousController) {
            return res.status(503).json({
                success: false,
                error: 'Eva Autonomous Controller not available'
            });
        }

        const whatsappStats = autonomousController.getWhatsAppStats();
        const whatsappSettings = autonomousController.getWhatsAppSettings();
        
        res.json({
            success: true,
            status: {
                isActive: autonomousController.isActive,
                whatsappServiceActive: whatsappStats.isActive,
                autoResponseEnabled: whatsappStats.autoResponseEnabled,
                settings: whatsappSettings,
                stats: whatsappStats
            }
        });

    } catch (error) {
        console.error('❌ Error getting WhatsApp autonomous status:', error);
        res.status(500).json({
            success: false,
            error: 'Error getting WhatsApp status'
        });
    }
});

/**
 * ✅ Activa respuestas automáticas de WhatsApp
 */
router.post('/enable', async (req, res) => {
    try {
        const autonomousController = global.evaAutonomousController;
        
        if (!autonomousController) {
            return res.status(503).json({
                success: false,
                error: 'Eva Autonomous Controller not available'
            });
        }

        if (!autonomousController.isActive) {
            return res.status(400).json({
                success: false,
                error: 'Eva Autonomous System must be started first'
            });
        }

        const { settings = {} } = req.body;
        
        console.log('📱 API: Enabling WhatsApp auto-response with settings:', settings);
        
        const result = await autonomousController.enableWhatsAppAutoResponse(settings);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'WhatsApp auto-response enabled by Eva',
                result: result.result,
                decision: result.decision,
                activatedBy: result.activatedBy,
                timestamp: result.timestamp
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.reason,
                decision: result.decision,
                confidence: result.confidence
            });
        }

    } catch (error) {
        console.error('❌ Error enabling WhatsApp auto-response:', error);
        res.status(500).json({
            success: false,
            error: 'Error enabling WhatsApp auto-response'
        });
    }
});

/**
 * ❌ Desactiva respuestas automáticas de WhatsApp
 */
router.post('/disable', async (req, res) => {
    try {
        const autonomousController = global.evaAutonomousController;
        
        if (!autonomousController) {
            return res.status(503).json({
                success: false,
                error: 'Eva Autonomous Controller not available'
            });
        }

        console.log('📱 API: Disabling WhatsApp auto-response');
        
        const result = await autonomousController.disableWhatsAppAutoResponse();
        
        res.json({
            success: true,
            message: 'WhatsApp auto-response disabled by Eva',
            result: result.result,
            disabledBy: result.disabledBy,
            timestamp: result.timestamp
        });

    } catch (error) {
        console.error('❌ Error disabling WhatsApp auto-response:', error);
        res.status(500).json({
            success: false,
            error: 'Error disabling WhatsApp auto-response'
        });
    }
});

/**
 * ⚙️ Actualiza configuraciones de respuesta automática
 */
router.put('/settings', async (req, res) => {
    try {
        const autonomousController = global.evaAutonomousController;
        
        if (!autonomousController) {
            return res.status(503).json({
                success: false,
                error: 'Eva Autonomous Controller not available'
            });
        }

        const { settings } = req.body;
        
        if (!settings) {
            return res.status(400).json({
                success: false,
                error: 'Settings are required'
            });
        }

        console.log('⚙️ API: Updating WhatsApp settings:', settings);
        
        const result = await autonomousController.processWhatsAppRequest({
            type: 'update_settings',
            settings
        });
        
        res.json({
            success: true,
            message: 'WhatsApp settings updated by Eva',
            result: result.result,
            processedBy: result.processedBy,
            timestamp: result.timestamp
        });

    } catch (error) {
        console.error('❌ Error updating WhatsApp settings:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating WhatsApp settings'
        });
    }
});

/**
 * 💬 Envía mensaje de WhatsApp de forma autónoma
 */
router.post('/send-message', async (req, res) => {
    try {
        const autonomousController = global.evaAutonomousController;
        
        if (!autonomousController) {
            return res.status(503).json({
                success: false,
                error: 'Eva Autonomous Controller not available'
            });
        }

        const { chatId, message } = req.body;
        
        if (!chatId || !message) {
            return res.status(400).json({
                success: false,
                error: 'chatId and message are required'
            });
        }

        console.log('💬 API: Sending autonomous WhatsApp message to:', chatId);
        
        const result = await autonomousController.sendWhatsAppMessageAutonomous({
            chatId,
            message
        });
        
        if (result.success) {
            res.json({
                success: true,
                message: 'WhatsApp message sent by Eva',
                result: result.result,
                decision: result.decision,
                sentBy: result.sentBy,
                timestamp: result.timestamp
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.reason,
                decision: result.decision,
                confidence: result.confidence
            });
        }

    } catch (error) {
        console.error('❌ Error sending autonomous WhatsApp message:', error);
        res.status(500).json({
            success: false,
            error: 'Error sending WhatsApp message'
        });
    }
});

/**
 * 📊 Obtiene estadísticas detalladas de WhatsApp
 */
router.get('/stats', async (req, res) => {
    try {
        const autonomousController = global.evaAutonomousController;
        
        if (!autonomousController) {
            return res.status(503).json({
                success: false,
                error: 'Eva Autonomous Controller not available'
            });
        }

        const stats = autonomousController.getWhatsAppStats();
        const settings = autonomousController.getWhatsAppSettings();
        
        res.json({
            success: true,
            data: {
                stats,
                settings,
                isActive: autonomousController.isWhatsAppAutoResponseActive(),
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Error getting WhatsApp stats:', error);
        res.status(500).json({
            success: false,
            error: 'Error getting WhatsApp statistics'
        });
    }
});

/**
 * 🔄 Procesa solicitud genérica de WhatsApp
 */
router.post('/process', async (req, res) => {
    try {
        const autonomousController = global.evaAutonomousController;
        
        if (!autonomousController) {
            return res.status(503).json({
                success: false,
                error: 'Eva Autonomous Controller not available'
            });
        }

        const { type, ...requestData } = req.body;
        
        if (!type) {
            return res.status(400).json({
                success: false,
                error: 'Request type is required'
            });
        }

        console.log('🔄 API: Processing WhatsApp request:', type);
        
        const result = await autonomousController.processWhatsAppRequest({
            type,
            ...requestData
        });
        
        res.json({
            success: true,
            message: `WhatsApp ${type} processed by Eva`,
            result: result.result,
            processedBy: result.processedBy,
            timestamp: result.timestamp
        });

    } catch (error) {
        console.error('❌ Error processing WhatsApp request:', error);
        res.status(500).json({
            success: false,
            error: 'Error processing WhatsApp request'
        });
    }
});

/**
 * 🧠 Obtiene decisiones recientes relacionadas con WhatsApp
 */
router.get('/decisions', async (req, res) => {
    try {
        const autonomousController = global.evaAutonomousController;
        
        if (!autonomousController) {
            return res.status(503).json({
                success: false,
                error: 'Eva Autonomous Controller not available'
            });
        }

        const decisionStats = autonomousController.decisionMatrix.getDecisionStats();
        
        // Filtrar decisiones relacionadas con WhatsApp
        const whatsappDecisions = decisionStats.recentDecisions.filter(decision => 
            decision.context && (
                decision.context.type?.includes('whatsapp') ||
                decision.decision?.action?.includes('whatsapp')
            )
        );
        
        res.json({
            success: true,
            decisions: whatsappDecisions,
            totalDecisions: decisionStats.totalDecisions,
            whatsappDecisions: whatsappDecisions.length,
            accuracy: decisionStats.accuracy
        });

    } catch (error) {
        console.error('❌ Error getting WhatsApp decisions:', error);
        res.status(500).json({
            success: false,
            error: 'Error getting WhatsApp decisions'
        });
    }
});

/**
 * 🎛️ Control manual: activar/desactivar modo de respuesta
 */
router.post('/toggle', async (req, res) => {
    try {
        const autonomousController = global.evaAutonomousController;
        
        if (!autonomousController) {
            return res.status(503).json({
                success: false,
                error: 'Eva Autonomous Controller not available'
            });
        }

        const { enable, settings = {} } = req.body;
        
        console.log('🎛️ API: Toggling WhatsApp auto-response:', enable ? 'ENABLE' : 'DISABLE');
        
        let result;
        if (enable) {
            result = await autonomousController.enableWhatsAppAutoResponse(settings);
        } else {
            result = await autonomousController.disableWhatsAppAutoResponse();
        }
        
        res.json({
            success: true,
            message: `WhatsApp auto-response ${enable ? 'enabled' : 'disabled'} by Eva`,
            enabled: enable,
            result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error toggling WhatsApp auto-response:', error);
        res.status(500).json({
            success: false,
            error: 'Error toggling WhatsApp auto-response'
        });
    }
});

module.exports = router;