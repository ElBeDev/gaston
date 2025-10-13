/**
 * 🌐 Eva Command Center - API Routes
 * 
 * Rutas para acceder y controlar el Command Center de Eva
 * Expone todas las funcionalidades de control del sistema
 * 
 * Parte de: Fase 1 - Command Center
 * Autor: Eva System Control
 * Fecha: Octubre 12, 2025
 */

const express = require('express');
const router = express.Router();

// Se inicializará desde app.js
let commandCenter = null;

/**
 * 🎛️ Inicializa el Command Center con Socket.IO
 */
function initializeCommandCenter(io) {
    const EvaCommandCenter = require('../eva-command-center/EvaCommandCenter');
    commandCenter = new EvaCommandCenter(io);
    
    // Inicializar de forma asíncrona
    commandCenter.initialize().then(result => {
        console.log('✅ Command Center initialized via routes:', result);
    }).catch(error => {
        console.error('❌ Error initializing Command Center:', error);
    });
    
    return commandCenter;
}

/**
 * 📊 GET /eva/control/status - Estado completo del sistema
 */
router.get('/status', async (req, res) => {
    try {
        if (!commandCenter) {
            return res.status(503).json({ 
                error: 'Command Center not initialized',
                message: 'Please wait for system initialization'
            });
        }

        const status = await commandCenter.getFullStatus();
        res.json(status);

    } catch (error) {
        console.error('❌ Error getting system status:', error);
        res.status(500).json({ 
            error: 'Failed to get system status',
            message: error.message 
        });
    }
});

/**
 * 🔧 GET /eva/control/system/health - Salud del sistema
 */
router.get('/system/health', async (req, res) => {
    try {
        if (!commandCenter) {
            return res.status(503).json({ error: 'Command Center not initialized' });
        }

        const health = await commandCenter.getSystemStatus().getSystemHealth();
        res.json(health);

    } catch (error) {
        console.error('❌ Error getting system health:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * ⚡ POST /eva/control/system/restart - Reinicia el sistema
 */
router.post('/system/restart', async (req, res) => {
    try {
        if (!commandCenter) {
            return res.status(503).json({ error: 'Command Center not initialized' });
        }

        const result = await commandCenter.executeCommand('system.restart', req.body);
        res.json(result);

    } catch (error) {
        console.error('❌ Error restarting system:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 🚀 POST /eva/control/system/optimize - Optimiza el sistema
 */
router.post('/system/optimize', async (req, res) => {
    try {
        if (!commandCenter) {
            return res.status(503).json({ error: 'Command Center not initialized' });
        }

        const result = await commandCenter.executeCommand('system.optimize', req.body);
        res.json(result);

    } catch (error) {
        console.error('❌ Error optimizing system:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 📋 GET /eva/control/integrations - Lista todas las integraciones
 */
router.get('/integrations', async (req, res) => {
    try {
        if (!commandCenter) {
            return res.status(503).json({ error: 'Command Center not initialized' });
        }

        const integrations = await commandCenter.getIntegrationController().getIntegrationsStatus();
        res.json(integrations);

    } catch (error) {
        console.error('❌ Error getting integrations:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 🔍 GET /eva/control/integrations/:service - Estado de una integración específica
 */
router.get('/integrations/:service', async (req, res) => {
    try {
        if (!commandCenter) {
            return res.status(503).json({ error: 'Command Center not initialized' });
        }

        const { service } = req.params;
        const integration = commandCenter.getIntegrationController().getIntegration(service);
        
        if (!integration) {
            return res.status(404).json({ error: `Integration ${service} not found` });
        }

        res.json(integration);

    } catch (error) {
        console.error('❌ Error getting integration:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * ⚡ POST /eva/control/integrations/:service/enable - Activa una integración
 */
router.post('/integrations/:service/enable', async (req, res) => {
    try {
        if (!commandCenter) {
            return res.status(503).json({ error: 'Command Center not initialized' });
        }

        const { service } = req.params;
        const result = await commandCenter.executeCommand('integration.enable', { 
            integration: service 
        });
        
        res.json(result);

    } catch (error) {
        console.error('❌ Error enabling integration:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 🛑 POST /eva/control/integrations/:service/disable - Desactiva una integración
 */
router.post('/integrations/:service/disable', async (req, res) => {
    try {
        if (!commandCenter) {
            return res.status(503).json({ error: 'Command Center not initialized' });
        }

        const { service } = req.params;
        const result = await commandCenter.executeCommand('integration.disable', { 
            integration: service 
        });
        
        res.json(result);

    } catch (error) {
        console.error('❌ Error disabling integration:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 🔄 POST /eva/control/integrations/:service/restart - Reinicia una integración
 */
router.post('/integrations/:service/restart', async (req, res) => {
    try {
        if (!commandCenter) {
            return res.status(503).json({ error: 'Command Center not initialized' });
        }

        const { service } = req.params;
        const result = await commandCenter.executeCommand('integration.restart', { 
            integration: service 
        });
        
        res.json(result);

    } catch (error) {
        console.error('❌ Error restarting integration:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * ⚙️ PUT /eva/control/integrations/:service/configure - Configura una integración
 */
router.put('/integrations/:service/configure', async (req, res) => {
    try {
        if (!commandCenter) {
            return res.status(503).json({ error: 'Command Center not initialized' });
        }

        const { service } = req.params;
        const result = await commandCenter.executeCommand('integration.configure', { 
            integration: service,
            config: req.body
        });
        
        res.json(result);

    } catch (error) {
        console.error('❌ Error configuring integration:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 💾 POST /eva/control/database/backup - Crea backup de base de datos
 */
router.post('/database/backup', async (req, res) => {
    try {
        if (!commandCenter) {
            return res.status(503).json({ error: 'Command Center not initialized' });
        }

        const result = await commandCenter.executeCommand('database.backup', req.body);
        res.json(result);

    } catch (error) {
        console.error('❌ Error creating database backup:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * ⚡ POST /eva/control/database/optimize - Optimiza base de datos
 */
router.post('/database/optimize', async (req, res) => {
    try {
        if (!commandCenter) {
            return res.status(503).json({ error: 'Command Center not initialized' });
        }

        const result = await commandCenter.executeCommand('database.optimize', req.body);
        res.json(result);

    } catch (error) {
        console.error('❌ Error optimizing database:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 🔄 POST /eva/control/monitoring/start - Inicia monitoreo en tiempo real
 */
router.post('/monitoring/start', async (req, res) => {
    try {
        if (!commandCenter) {
            return res.status(503).json({ error: 'Command Center not initialized' });
        }

        const result = await commandCenter.executeCommand('monitoring.start', req.body);
        res.json(result);

    } catch (error) {
        console.error('❌ Error starting monitoring:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 🛑 POST /eva/control/monitoring/stop - Detiene monitoreo en tiempo real
 */
router.post('/monitoring/stop', async (req, res) => {
    try {
        if (!commandCenter) {
            return res.status(503).json({ error: 'Command Center not initialized' });
        }

        const result = await commandCenter.executeCommand('monitoring.stop', req.body);
        res.json(result);

    } catch (error) {
        console.error('❌ Error stopping monitoring:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 🎯 POST /eva/control/execute - Ejecuta comando personalizado
 */
router.post('/execute', async (req, res) => {
    try {
        if (!commandCenter) {
            return res.status(503).json({ error: 'Command Center not initialized' });
        }

        const { command, params } = req.body;
        
        if (!command) {
            return res.status(400).json({ error: 'Command parameter required' });
        }

        const result = await commandCenter.executeCommand(command, params);
        res.json(result);

    } catch (error) {
        console.error('❌ Error executing command:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 🚨 GET /eva/control/anomalies - Obtiene anomalías detectadas
 */
router.get('/anomalies', async (req, res) => {
    try {
        if (!commandCenter) {
            return res.status(503).json({ error: 'Command Center not initialized' });
        }

        const anomalies = await commandCenter.getSystemStatus().detectAnomalies();
        res.json({
            timestamp: new Date().toISOString(),
            anomalies,
            count: anomalies.length
        });

    } catch (error) {
        console.error('❌ Error getting anomalies:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 📈 GET /eva/control/performance - Métricas de rendimiento
 */
router.get('/performance', async (req, res) => {
    try {
        if (!commandCenter) {
            return res.status(503).json({ error: 'Command Center not initialized' });
        }

        const performance = await commandCenter.getSystemStatus().getPerformanceMetrics();
        const history = commandCenter.getSystemStatus().getPerformanceHistory();
        
        res.json({
            current: performance,
            history: history.slice(-10), // Últimos 10 registros
            summary: {
                averageResponseTime: history.length > 0 ? 
                    history.reduce((sum, h) => sum + h.responseTime, 0) / history.length : 0,
                totalRecords: history.length
            }
        });

    } catch (error) {
        console.error('❌ Error getting performance metrics:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 🔧 GET /eva/control/info - Información del Command Center
 */
router.get('/info', (req, res) => {
    res.json({
        name: 'Eva Command Center',
        version: '1.0.0',
        phase: 'Phase 1 - Command Center',
        status: commandCenter ? 'initialized' : 'not_initialized',
        features: [
            'System Status Monitoring',
            'Integration Management',
            'Database Administration',
            'Real-time Monitoring',
            'Performance Metrics',
            'Anomaly Detection',
            'Command Execution',
            'API Gateway Control'
        ],
        endpoints: [
            'GET /eva/control/status',
            'GET /eva/control/system/health',
            'POST /eva/control/system/restart',
            'POST /eva/control/system/optimize',
            'GET /eva/control/integrations',
            'POST /eva/control/integrations/:service/enable',
            'POST /eva/control/integrations/:service/disable',
            'POST /eva/control/database/backup',
            'POST /eva/control/monitoring/start',
            'POST /eva/control/execute'
        ],
        documentation: 'https://eva-docs.local/command-center'
    });
});

// Exportar tanto el router como la función de inicialización
module.exports = {
    router,
    initializeCommandCenter
};