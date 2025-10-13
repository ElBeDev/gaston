/**
 * 🌐 Eva Autonomous Operations - API Routes
 * 
 * Rutas para controlar y monitorear las operaciones autónomas
 * Permite activar/desactivar, configurar y supervisar el sistema autónomo
 * 
 * Parte de: Fase 2 - Autonomous Operations
 * Autor: Eva System Control
 * Fecha: Octubre 12, 2025
 */

const express = require('express');
const router = express.Router();

// Se inicializará desde app.js
let autonomousController = null;

/**
 * 🤖 Inicializa el Autonomous Controller
 */
function initializeAutonomousController(commandCenter) {
    const EvaAutonomousController = require('../eva-autonomous/EvaAutonomousController');
    autonomousController = new EvaAutonomousController(commandCenter);
    
    // Make it globally available
    global.evaAutonomousController = autonomousController;
    
    console.log('🤖 Autonomous Controller initialized via routes');
    return autonomousController;
}

/**
 * 📊 GET /eva/autonomous/status - Estado del sistema autónomo
 */
router.get('/status', async (req, res) => {
    try {
        if (!autonomousController) {
            return res.status(503).json({ 
                error: 'Autonomous Controller not initialized',
                message: 'Please wait for system initialization'
            });
        }

        const stats = autonomousController.getAutonomousStats();
        res.json({
            timestamp: new Date().toISOString(),
            status: autonomousController.isActive ? 'active' : 'inactive',
            autonomyLevel: autonomousController.autonomyLevel,
            isLearning: autonomousController.isLearning,
            ...stats
        });

    } catch (error) {
        console.error('❌ Error getting autonomous status:', error);
        res.status(500).json({ 
            error: 'Failed to get autonomous status',
            message: error.message 
        });
    }
});

/**
 * 🚀 POST /eva/autonomous/start - Inicia el sistema autónomo
 */
router.post('/start', async (req, res) => {
    try {
        if (!autonomousController) {
            return res.status(503).json({ error: 'Autonomous Controller not initialized' });
        }

        const result = await autonomousController.start();
        res.json(result);

    } catch (error) {
        console.error('❌ Error starting autonomous system:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 🛑 POST /eva/autonomous/stop - Detiene el sistema autónomo
 */
router.post('/stop', async (req, res) => {
    try {
        if (!autonomousController) {
            return res.status(503).json({ error: 'Autonomous Controller not initialized' });
        }

        const result = await autonomousController.stop();
        res.json(result);

    } catch (error) {
        console.error('❌ Error stopping autonomous system:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 🧠 POST /eva/autonomous/decision - Tomar decisión autónoma
 */
router.post('/decision', async (req, res) => {
    try {
        if (!autonomousController) {
            return res.status(503).json({ error: 'Autonomous Controller not initialized' });
        }

        const { context, options } = req.body;
        
        if (!context) {
            return res.status(400).json({ error: 'Context parameter required' });
        }

        const decision = await autonomousController.makeAutonomousDecision(context, options);
        res.json({
            success: true,
            decision,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error making autonomous decision:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 🎯 PUT /eva/autonomous/autonomy-level - Cambiar nivel de autonomía
 */
router.put('/autonomy-level', async (req, res) => {
    try {
        if (!autonomousController) {
            return res.status(503).json({ error: 'Autonomous Controller not initialized' });
        }

        const { level } = req.body;
        const validLevels = ['supervised', 'semi-autonomous', 'fully-autonomous'];
        
        if (!level || !validLevels.includes(level)) {
            return res.status(400).json({ 
                error: 'Invalid autonomy level',
                validLevels 
            });
        }

        autonomousController.setAutonomyLevel(level);
        
        res.json({
            success: true,
            autonomyLevel: level,
            message: `Autonomy level changed to ${level}`
        });

    } catch (error) {
        console.error('❌ Error changing autonomy level:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 🧠 POST /eva/autonomous/learning/enable - Habilitar aprendizaje
 */
router.post('/learning/enable', async (req, res) => {
    try {
        if (!autonomousController) {
            return res.status(503).json({ error: 'Autonomous Controller not initialized' });
        }

        autonomousController.enableLearning();
        
        res.json({
            success: true,
            isLearning: true,
            message: 'Learning mode enabled'
        });

    } catch (error) {
        console.error('❌ Error enabling learning:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 🧠 POST /eva/autonomous/learning/disable - Deshabilitar aprendizaje
 */
router.post('/learning/disable', async (req, res) => {
    try {
        if (!autonomousController) {
            return res.status(503).json({ error: 'Autonomous Controller not initialized' });
        }

        autonomousController.disableLearning();
        
        res.json({
            success: true,
            isLearning: false,
            message: 'Learning mode disabled'
        });

    } catch (error) {
        console.error('❌ Error disabling learning:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 📅 GET /eva/autonomous/tasks - Lista de tareas autónomas
 */
router.get('/tasks', async (req, res) => {
    try {
        if (!autonomousController) {
            return res.status(503).json({ error: 'Autonomous Controller not initialized' });
        }

        const tasks = autonomousController.taskScheduler.getAllTasks();
        const stats = autonomousController.taskScheduler.getTaskStats();
        
        res.json({
            timestamp: new Date().toISOString(),
            tasks,
            stats
        });

    } catch (error) {
        console.error('❌ Error getting autonomous tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 📅 POST /eva/autonomous/tasks - Programar nueva tarea
 */
router.post('/tasks', async (req, res) => {
    try {
        if (!autonomousController) {
            return res.status(503).json({ error: 'Autonomous Controller not initialized' });
        }

        const taskConfig = req.body;
        const result = await autonomousController.taskScheduler.scheduleTask(taskConfig);
        
        res.json(result);

    } catch (error) {
        console.error('❌ Error scheduling autonomous task:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 🔄 GET /eva/autonomous/workflows - Lista de workflows
 */
router.get('/workflows', async (req, res) => {
    try {
        if (!autonomousController) {
            return res.status(503).json({ error: 'Autonomous Controller not initialized' });
        }

        const workflows = autonomousController.workflowEngine.getAllWorkflows();
        const stats = autonomousController.workflowEngine.getWorkflowStats();
        
        res.json({
            timestamp: new Date().toISOString(),
            workflows,
            stats
        });

    } catch (error) {
        console.error('❌ Error getting workflows:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 🔄 POST /eva/autonomous/workflows - Crear nuevo workflow
 */
router.post('/workflows', async (req, res) => {
    try {
        if (!autonomousController) {
            return res.status(503).json({ error: 'Autonomous Controller not initialized' });
        }

        const workflowConfig = req.body;
        const result = await autonomousController.workflowEngine.createWorkflow(workflowConfig);
        
        res.json(result);

    } catch (error) {
        console.error('❌ Error creating workflow:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * ▶️ POST /eva/autonomous/workflows/:id/execute - Ejecutar workflow
 */
router.post('/workflows/:id/execute', async (req, res) => {
    try {
        if (!autonomousController) {
            return res.status(503).json({ error: 'Autonomous Controller not initialized' });
        }

        const { id } = req.params;
        const { context } = req.body;
        
        const result = await autonomousController.workflowEngine.executeWorkflow(id, context);
        
        res.json(result);

    } catch (error) {
        console.error('❌ Error executing workflow:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 🧠 GET /eva/autonomous/decisions - Decisiones recientes
 */
router.get('/decisions', async (req, res) => {
    try {
        if (!autonomousController) {
            return res.status(503).json({ error: 'Autonomous Controller not initialized' });
        }

        const { limit = 10 } = req.query;
        
        const decisions = autonomousController.decisionMatrix.getRecentDecisions(parseInt(limit));
        const stats = autonomousController.decisionMatrix.getDecisionStats();
        const factors = autonomousController.decisionMatrix.getFactors();
        
        res.json({
            timestamp: new Date().toISOString(),
            decisions,
            stats,
            currentFactors: factors
        });

    } catch (error) {
        console.error('❌ Error getting decisions:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 📊 GET /eva/autonomous/components - Estado de componentes
 */
router.get('/components', async (req, res) => {
    try {
        if (!autonomousController) {
            return res.status(503).json({ error: 'Autonomous Controller not initialized' });
        }

        const components = {
            taskScheduler: {
                status: autonomousController.taskScheduler.isActive ? 'active' : 'inactive',
                stats: autonomousController.taskScheduler.getTaskStats()
            },
            workflowEngine: {
                status: autonomousController.workflowEngine.isActive ? 'active' : 'inactive',
                stats: autonomousController.workflowEngine.getWorkflowStats()
            },
            decisionMatrix: {
                status: autonomousController.decisionMatrix.isActive ? 'active' : 'inactive',
                stats: autonomousController.decisionMatrix.getDecisionStats()
            }
        };
        
        res.json({
            timestamp: new Date().toISOString(),
            components
        });

    } catch (error) {
        console.error('❌ Error getting component status:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * ⚙️ PUT /eva/autonomous/config - Actualizar configuración
 */
router.put('/config', async (req, res) => {
    try {
        if (!autonomousController) {
            return res.status(503).json({ error: 'Autonomous Controller not initialized' });
        }

        const { config } = req.body;
        
        if (!config) {
            return res.status(400).json({ error: 'Config parameter required' });
        }

        // Actualizar configuración (implementar validación)
        Object.assign(autonomousController.autonomyConfig, config);
        
        res.json({
            success: true,
            config: autonomousController.autonomyConfig,
            message: 'Configuration updated'
        });

    } catch (error) {
        console.error('❌ Error updating config:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * � POST /eva/autonomous/email/send - Enviar email autónomo
 */
router.post('/email/send', async (req, res) => {
    try {
        if (!autonomousController) {
            return res.status(503).json({ error: 'Autonomous Controller not initialized' });
        }

        const { to, subject, body, priority = 'normal' } = req.body;
        
        if (!to || !subject || !body) {
            return res.status(400).json({ 
                error: 'Missing required fields: to, subject, body' 
            });
        }

        // Agregar tokens de sesión si están disponibles
        const emailRequest = {
            to,
            subject,
            body,
            priority,
            sessionTokens: req.session?.tokens
        };

        const result = await autonomousController.sendEmailAutonomous(emailRequest);
        
        res.json(result);

    } catch (error) {
        console.error('❌ Error sending autonomous email:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 📥 GET /eva/autonomous/email/read - Leer emails autónomo
 */
router.get('/email/read', async (req, res) => {
    try {
        if (!autonomousController) {
            return res.status(503).json({ error: 'Autonomous Controller not initialized' });
        }

        const { folder = 'INBOX', maxResults = 10, filter } = req.query;
        
        const criteria = {
            folder,
            maxResults: parseInt(maxResults),
            filter,
            sessionTokens: req.session?.tokens
        };

        const result = await autonomousController.readEmailsAutonomous(criteria);
        
        res.json(result);

    } catch (error) {
        console.error('❌ Error reading emails autonomously:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 📊 GET /eva/autonomous/email/stats - Estadísticas de email
 */
router.get('/email/stats', async (req, res) => {
    try {
        if (!autonomousController) {
            return res.status(503).json({ error: 'Autonomous Controller not initialized' });
        }

        const stats = autonomousController.getEmailStats();
        
        res.json({
            timestamp: new Date().toISOString(),
            ...stats
        });

    } catch (error) {
        console.error('❌ Error getting email stats:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * �🔧 GET /eva/autonomous/info - Información del sistema autónomo
 */
router.get('/info', (req, res) => {
    res.json({
        name: 'Eva Autonomous Operations',
        version: '2.0.0',
        phase: 'Phase 2 - Autonomous Operations',
        status: autonomousController ? (autonomousController.isActive ? 'active' : 'inactive') : 'not_initialized',
        features: [
            'Intelligent Task Scheduling',
            'Workflow Engine',
            'Decision Matrix',
            'Resource Optimization',
            'Security Guardian',
            'Performance Tuning',
            'Machine Learning',
            'Autonomous Decision Making',
            'Autonomous Email Management'
        ],
        components: {
            taskScheduler: 'Intelligent Task Scheduler',
            workflowEngine: 'Workflow Engine',
            decisionMatrix: 'Decision Matrix',
            resourceOptimizer: 'Resource Optimizer (Planned)',
            securityGuardian: 'Security Guardian (Planned)',
            performanceTuner: 'Performance Tuner (Planned)',
            emailService: 'Autonomous Email Service'
        },
        autonomyLevels: [
            'supervised',
            'semi-autonomous', 
            'fully-autonomous'
        ],
        endpoints: [
            'GET /eva/autonomous/status',
            'POST /eva/autonomous/start',
            'POST /eva/autonomous/stop',
            'POST /eva/autonomous/decision',
            'PUT /eva/autonomous/autonomy-level',
            'POST /eva/autonomous/learning/enable',
            'GET /eva/autonomous/tasks',
            'POST /eva/autonomous/tasks',
            'GET /eva/autonomous/workflows',
            'POST /eva/autonomous/workflows',
            'GET /eva/autonomous/decisions',
            'GET /eva/autonomous/components',
            'POST /eva/autonomous/email/send',
            'GET /eva/autonomous/email/read',
            'GET /eva/autonomous/email/stats'
        ],
        documentation: 'https://eva-docs.local/autonomous-operations'
    });
});

// Exportar tanto el router como la función de inicialización
module.exports = {
    router,
    initializeAutonomousController
};