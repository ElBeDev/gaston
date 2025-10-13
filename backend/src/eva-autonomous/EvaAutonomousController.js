/**
 * 🤖 Eva Autonomous Operations - Main Controller
 * 
 * Controlador principal que                        // Iniciar componentes principales
            await this.taskScheduler.start();
            await this.workflowEngine.start();
            await this.decisionMatrix.start();
            await this.resourceOptimizer.start();
            await this.securityGuardian.start();
            await this.performanceTuner.start();
            this.emailService.start();
            await this.whatsappService.start();
            
            // Iniciar operaciones autónomasfica:
 * - Intelligent Task Scheduler
 * - Workflow Engine
 * - Decision Matrix
 * - Resource Optimizer
 * - Security Guardian
 * - Performance Tuner
 * 
 * Parte de: Fase 2 - Autonomous Operations
 * Autor: Eva System Control
 * Fecha: Octubre 12, 2025
 */

const EventEmitter = require('events');
const IntelligentTaskScheduler = require('./task-scheduler/IntelligentTaskScheduler');
const WorkflowEngine = require('./workflow-engine/WorkflowEngine');
const DecisionMatrix = require('./decision-matrix/DecisionMatrix');
const ResourceOptimizer = require('./optimizers/ResourceOptimizer');
const SecurityGuardian = require('./security/SecurityGuardian');
const PerformanceTuner = require('./performance/PerformanceTuner');
const EvaEmailService = require('./services/EvaEmailService');
const EvaWhatsAppService = require('./services/EvaWhatsAppService');

class EvaAutonomousController extends EventEmitter {
    constructor(commandCenter = null) {
        super();
        this.commandCenter = commandCenter;
        
        // Componentes principales
        this.taskScheduler = new IntelligentTaskScheduler();
        this.workflowEngine = new WorkflowEngine();
        this.decisionMatrix = new DecisionMatrix();
        this.resourceOptimizer = new ResourceOptimizer();
        this.securityGuardian = new SecurityGuardian();
        this.performanceTuner = new PerformanceTuner();
        this.emailService = new EvaEmailService();
        this.whatsappService = new EvaWhatsAppService(this);
        
        // Estado del controlador
        this.isActive = false;
        this.isLearning = true;
        this.autonomyLevel = 'supervised'; // supervised, semi-autonomous, fully-autonomous
        
        // Métricas
        this.stats = {
            uptime: 0,
            totalDecisions: 0,
            totalTasks: 0,
            totalWorkflows: 0,
            autonomousActions: 0,
            interventions: 0,
            successRate: 0,
            efficiency: 0
        };

        // Configuración de autonomía
        this.autonomyConfig = {
            maxConcurrentTasks: 10,
            maxConcurrentWorkflows: 5,
            decisionConfidenceThreshold: 75,
            autoExecuteThreshold: 85,
            escalationThreshold: 95,
            learningRate: 0.1
        };

        // Conectar eventos entre componentes
        this.setupEventConnections();
        
        console.log('🤖 Eva Autonomous Controller initialized');
        console.log('   📅 Intelligent Task Scheduler: Ready');
        console.log('   🔄 Workflow Engine: Ready');
        console.log('   🧠 Decision Matrix: Ready');
        console.log('   📊 Resource Optimizer: Ready');
        console.log('   🛡️ Security Guardian: Ready');
        console.log('   ⚡ Performance Tuner: Ready');
        console.log('   📧 Email Service: Ready');
        console.log('   📱 WhatsApp Service: Ready');
    }

    /**
     * 🚀 Inicia el sistema autónomo completo
     */
    async start() {
        try {
            console.log('🚀 Starting Eva Autonomous Operations...');
            
            this.isActive = true;
            this.startTime = Date.now();
            
            // Iniciar componentes principales
            await this.taskScheduler.start();
            await this.workflowEngine.start();
            await this.decisionMatrix.start();
            await this.resourceOptimizer.start();
            await this.securityGuardian.start();
            await this.performanceTuner.start();
            this.emailService.start();
            
            // Iniciar operaciones autónomas
            this.startAutonomousOperations();
            
            // Iniciar monitoreo continuo
            this.startContinuousMonitoring();
            
            console.log('✅ Eva Autonomous Operations started successfully');
            console.log('🤖 System Status:');
            console.log('   📅 Task Scheduler: ACTIVE');
            console.log('   🔄 Workflow Engine: ACTIVE');
            console.log('   🧠 Decision Matrix: ACTIVE');
            console.log('   📊 Resource Optimizer: ACTIVE');
            console.log('   🛡️ Security Guardian: ACTIVE');
            console.log('   ⚡ Performance Tuner: ACTIVE');
            console.log('   📧 Email Service: ACTIVE');
            console.log('   📱 WhatsApp Service: ACTIVE');
            console.log(`   🎯 Autonomy Level: ${this.autonomyLevel.toUpperCase()}`);
            console.log(`   🧠 Learning Mode: ${this.isLearning ? 'ENABLED' : 'DISABLED'}`);
            
            this.emit('autonomous:started');
            
            return { 
                success: true, 
                message: 'Autonomous Operations started',
                autonomyLevel: this.autonomyLevel,
                components: {
                    taskScheduler: 'active',
                    workflowEngine: 'active',
                    decisionMatrix: 'active',
                    emailService: 'active',
                    whatsappService: 'active'
                }
            };
            
        } catch (error) {
            console.error('❌ Error starting Autonomous Operations:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🛑 Detiene el sistema autónomo
     */
    async stop() {
        try {
            console.log('🛑 Stopping Eva Autonomous Operations...');
            
            this.isActive = false;
            
            // Detener componentes
            await this.taskScheduler.stop();
            await this.workflowEngine.stop();
            await this.decisionMatrix.stop();
            await this.resourceOptimizer.stop();
            await this.securityGuardian.stop();
            await this.performanceTuner.stop();
            await this.whatsappService.stop();
            
            // Calcular estadísticas finales
            this.stats.uptime = Date.now() - this.startTime;
            
            console.log('✅ Eva Autonomous Operations stopped');
            this.emit('autonomous:stopped');
            
            return { success: true, message: 'Autonomous Operations stopped' };
            
        } catch (error) {
            console.error('❌ Error stopping Autonomous Operations:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🧠 Toma una decisión autónoma
     */
    async makeAutonomousDecision(context, options = {}) {
        try {
            console.log('🧠 Making autonomous decision...');
            
            // Usar la matriz de decisiones
            const decision = await this.decisionMatrix.makeDecision(context, {
                minConfidence: this.autonomyConfig.decisionConfidenceThreshold,
                ...options
            });
            
            // Registrar decisión
            this.stats.totalDecisions++;
            
            // Determinar si ejecutar automáticamente
            if (decision.confidence >= this.autonomyConfig.autoExecuteThreshold && !decision.fallback) {
                console.log(`⚡ Auto-executing decision: ${decision.action} (${decision.confidence}% confidence)`);
                await this.executeAutonomousAction(decision, context);
                this.stats.autonomousActions++;
            } else if (decision.confidence >= this.autonomyConfig.escalationThreshold) {
                console.log(`🚨 High-confidence decision requires escalation: ${decision.action}`);
                await this.escalateDecision(decision, context);
                this.stats.interventions++;
            } else {
                console.log(`📋 Decision logged for review: ${decision.action} (${decision.confidence}% confidence)`);
            }
            
            this.emit('decision:made', { decision, context });
            return decision;
            
        } catch (error) {
            console.error('❌ Error in autonomous decision making:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🎯 Ejecuta una acción autónoma
     */
    async executeAutonomousAction(decision, context) {
        try {
            console.log(`🎯 Executing autonomous action: ${decision.action}`);
            
            let result;
            
            switch (decision.action) {
                case 'optimize_system':
                    result = await this.optimizeSystem();
                    break;
                case 'run_maintenance':
                    result = await this.runMaintenance();
                    break;
                case 'sync_integrations':
                    result = await this.syncIntegrations();
                    break;
                case 'scale_resources':
                    result = await this.scaleResources();
                    break;
                case 'security_scan':
                    result = await this.performSecurityScan();
                    break;
                default:
                    result = await this.executeGenericAction(decision, context);
            }
            
            // Aprender del resultado
            if (this.isLearning) {
                await this.learnFromAction(decision, context, result);
            }
            
            this.emit('action:executed', { decision, context, result });
            return result;
            
        } catch (error) {
            console.error('❌ Error executing autonomous action:', error);
            this.emit('action:failed', { decision, context, error });
            return { success: false, error: error.message };
        }
    }

    /**
     * 🔄 Inicia operaciones autónomas continuas
     */
    startAutonomousOperations() {
        console.log('🔄 Starting autonomous operations...');
        
        // Operaciones cada 2 minutos
        setInterval(async () => {
            if (!this.isActive) return;
            
            try {
                await this.performAutonomousCheck();
            } catch (error) {
                console.error('❌ Error in autonomous check:', error);
            }
        }, 2 * 60 * 1000);
        
        // Optimización cada 15 minutos
        setInterval(async () => {
            if (!this.isActive) return;
            
            try {
                await this.performPeriodicOptimization();
            } catch (error) {
                console.error('❌ Error in periodic optimization:', error);
            }
        }, 15 * 60 * 1000);
    }

    /**
     * 📊 Inicia monitoreo continuo
     */
    startContinuousMonitoring() {
        console.log('📊 Starting continuous monitoring...');
        
        // Monitoreo cada 30 segundos
        setInterval(async () => {
            if (!this.isActive) return;
            
            try {
                await this.performContinuousMonitoring();
                this.updateStats();
            } catch (error) {
                console.error('❌ Error in continuous monitoring:', error);
            }
        }, 30 * 1000);
    }

    /**
     * 🔍 Realiza verificación autónoma
     */
    async performAutonomousCheck() {
        try {
            console.log('🔍 Performing autonomous check...');
            
            // Verificar estado del sistema
            const systemHealth = await this.getSystemHealth();
            
            // Determinar si se necesita acción
            const context = {
                type: 'autonomous_check',
                health: systemHealth,
                timestamp: new Date().toISOString()
            };
            
            // Tomar decisión si es necesario
            if (this.needsIntervention(systemHealth)) {
                await this.makeAutonomousDecision(context);
            }
            
        } catch (error) {
            console.error('❌ Error in autonomous check:', error);
        }
    }

    /**
     * ⚡ Realiza optimización periódica
     */
    async performPeriodicOptimization() {
        try {
            console.log('⚡ Performing periodic optimization...');
            
            // Optimizar task scheduler
            const taskStats = this.taskScheduler.getTaskStats();
            if (taskStats.totalTasks > 0 && taskStats.executionStats.successRate < 90) {
                console.log('📅 Optimizing task scheduler...');
                // Implementar optimización específica
            }
            
            // Optimizar workflows
            const workflowStats = this.workflowEngine.getWorkflowStats();
            if (workflowStats.totalExecutions > 0 && workflowStats.successfulExecutions / workflowStats.totalExecutions < 0.9) {
                console.log('🔄 Optimizing workflows...');
                // Implementar optimización específica
            }
            
            // Actualizar configuración de autonomía
            await this.updateAutonomyConfig();
            
        } catch (error) {
            console.error('❌ Error in periodic optimization:', error);
        }
    }

    /**
     * 📈 Realiza monitoreo continuo
     */
    async performContinuousMonitoring() {
        try {
            // Monitorear componentes
            const taskSchedulerHealth = this.taskScheduler.isActive;
            const workflowEngineHealth = this.workflowEngine.isActive;
            const decisionMatrixHealth = this.decisionMatrix.isActive;
            
            // Verificar si todos los componentes están activos
            if (!taskSchedulerHealth || !workflowEngineHealth || !decisionMatrixHealth) {
                console.log('⚠️ Some autonomous components are inactive');
                this.emit('components:unhealthy', {
                    taskScheduler: taskSchedulerHealth,
                    workflowEngine: workflowEngineHealth,
                    decisionMatrix: decisionMatrixHealth
                });
            }
            
            // Actualizar métricas
            this.updateMetrics();
            
        } catch (error) {
            console.error('❌ Error in continuous monitoring:', error);
        }
    }

    /**
     * 🔗 Configura conexiones de eventos entre componentes
     */
    setupEventConnections() {
        // Task Scheduler → Workflow Engine
        this.taskScheduler.on('task:completed', async (data) => {
            if (data.task.type === 'workflow') {
                // Registrar métricas del workflow
                this.stats.totalWorkflows++;
            }
        });
        
        // Decision Matrix → Task Scheduler
        this.decisionMatrix.on('decision:made', async (data) => {
            if (data.decision.action.startsWith('schedule_')) {
                // Auto-programar tarea basada en decisión
                await this.autoScheduleTask(data.decision, data.context);
            }
        });
        
        // Workflow Engine → Decision Matrix
        this.workflowEngine.on('execution:failed', async (data) => {
            // Tomar decisión sobre qué hacer con workflows fallidos
            const decision = await this.makeAutonomousDecision({
                type: 'workflow_failure',
                workflow: data.workflow,
                error: data.error
            });
        });
        
        console.log('🔗 Event connections established');
    }

    /**
     * 🛠️ Métodos de acciones específicas
     */
    async optimizeSystem() {
        console.log('⚡ Optimizing system autonomously...');
        
        if (this.commandCenter) {
            return await this.commandCenter.executeCommand('system.optimize', { autonomous: true });
        }
        
        return { success: true, message: 'System optimization completed (simulated)' };
    }

    async runMaintenance() {
        console.log('🔧 Running maintenance autonomously...');
        
        // Ejecutar workflow de mantenimiento
        const maintenanceWorkflows = this.workflowEngine.getAllWorkflows()
            .filter(w => w.name.includes('Maintenance'));
        
        if (maintenanceWorkflows.length > 0) {
            return await this.workflowEngine.executeWorkflow(maintenanceWorkflows[0].id);
        }
        
        return { success: true, message: 'Maintenance completed (simulated)' };
    }

    async syncIntegrations() {
        console.log('🔄 Syncing integrations autonomously...');
        
        if (this.commandCenter) {
            return await this.commandCenter.executeCommand('integration.sync', { autonomous: true });
        }
        
        return { success: true, message: 'Integrations synced (simulated)' };
    }

    async scaleResources() {
        console.log('📈 Scaling resources autonomously...');
        
        // Implementar lógica de escalado
        return { success: true, message: 'Resources scaled (simulated)' };
    }

    async performSecurityScan() {
        console.log('🔒 Performing security scan autonomously...');
        
        // Implementar escaneo de seguridad
        return { success: true, message: 'Security scan completed (simulated)' };
    }

    async executeGenericAction(decision, context) {
        console.log(`🎯 Executing generic action: ${decision.action}`);
        
        if (this.commandCenter) {
            const command = this.getCommandForAction(decision.action);
            return await this.commandCenter.executeCommand(command, { autonomous: true, context });
        }
        
        return { success: true, message: `Action ${decision.action} completed (simulated)` };
    }

    /**
     * 🧠 Métodos de aprendizaje
     */
    async learnFromAction(decision, context, result) {
        try {
            console.log('🧠 Learning from action result...');
            
            // Actualizar confianza basada en resultado
            const success = result.success !== false;
            
            if (success) {
                this.stats.successRate = (this.stats.successRate + 1) / 2;
            } else {
                this.stats.successRate = this.stats.successRate * 0.9; // Penalizar fallos
            }
            
            // Aprender patrones
            // Implementar machine learning básico aquí
            
        } catch (error) {
            console.error('❌ Error in learning:', error);
        }
    }

    async updateAutonomyConfig() {
        try {
            // Ajustar configuración basada en rendimiento
            if (this.stats.successRate > 0.95) {
                // Aumentar autonomía
                this.autonomyConfig.decisionConfidenceThreshold = Math.max(
                    this.autonomyConfig.decisionConfidenceThreshold - 1, 
                    60
                );
            } else if (this.stats.successRate < 0.85) {
                // Reducir autonomía
                this.autonomyConfig.decisionConfidenceThreshold = Math.min(
                    this.autonomyConfig.decisionConfidenceThreshold + 1, 
                    90
                );
            }
            
            console.log(`🎯 Updated autonomy threshold: ${this.autonomyConfig.decisionConfidenceThreshold}%`);
            
        } catch (error) {
            console.error('❌ Error updating autonomy config:', error);
        }
    }

    /**
     * 🛠️ Métodos auxiliares
     */
    async getSystemHealth() {
        if (this.commandCenter) {
            return await this.commandCenter.getSystemStatus().getSystemHealth();
        }
        return { status: 'unknown' };
    }

    needsIntervention(systemHealth) {
        return systemHealth.status === 'critical' || 
               systemHealth.status === 'warning' ||
               (systemHealth.resources && systemHealth.resources.memory.usage > 90);
    }

    async escalateDecision(decision, context) {
        console.log(`🚨 Escalating decision: ${decision.action}`);
        // Implementar lógica de escalación (notificaciones, etc.)
        this.emit('decision:escalated', { decision, context });
    }

    async autoScheduleTask(decision, context) {
        // Programar tarea automáticamente basada en decisión
        const taskConfig = this.getTaskConfigForDecision(decision, context);
        return await this.taskScheduler.scheduleTask(taskConfig);
    }

    getCommandForAction(action) {
        const actionMap = {
            optimize_system: 'system.optimize',
            run_maintenance: 'system.maintenance',
            sync_integrations: 'integration.sync',
            scale_resources: 'system.scale',
            security_scan: 'security.scan'
        };
        return actionMap[action] || 'system.health';
    }

    getTaskConfigForDecision(decision, context) {
        return {
            name: `Auto: ${decision.action}`,
            type: 'command',
            command: this.getCommandForAction(decision.action),
            schedule: 'now',
            priority: 8,
            autonomous: true
        };
    }

    updateStats() {
        this.stats.uptime = Date.now() - this.startTime;
        this.stats.totalTasks = this.taskScheduler.getTaskStats().totalTasks;
        this.stats.totalWorkflows = this.workflowEngine.getWorkflowStats().totalWorkflows;
        this.stats.totalDecisions = this.decisionMatrix.getDecisionStats().totalDecisions;
    }

    updateMetrics() {
        const taskStats = this.taskScheduler.getTaskStats();
        const workflowStats = this.workflowEngine.getWorkflowStats();
        const decisionStats = this.decisionMatrix.getDecisionStats();
        
        // Calcular eficiencia general
        this.stats.efficiency = (
            (taskStats.executionStats.successful || 0) +
            (workflowStats.successfulExecutions || 0) +
            (decisionStats.correctDecisions || 0)
        ) / Math.max(
            (taskStats.executionStats.totalExecuted || 1) +
            (workflowStats.totalExecutions || 1) +
            (decisionStats.totalDecisions || 1)
        , 1) * 100;
    }

    /**
     * 📊 Métodos públicos para reporting
     */
    getAutonomousStats() {
        return {
            ...this.stats,
            autonomyLevel: this.autonomyLevel,
            isLearning: this.isLearning,
            config: this.autonomyConfig,
            components: {
                taskScheduler: this.taskScheduler.getTaskStats(),
                workflowEngine: this.workflowEngine.getWorkflowStats(),
                decisionMatrix: this.decisionMatrix.getDecisionStats(),
                resourceOptimizer: this.resourceOptimizer.getOptimizationStats(),
                securityGuardian: this.securityGuardian.getSecurityStats(),
                performanceTuner: this.performanceTuner.getPerformanceStats(),
                emailService: this.emailService.getEmailStats(),
                whatsappService: this.whatsappService.getStats()
            }
        };
    }

    setAutonomyLevel(level) {
        this.autonomyLevel = level;
        console.log(`🎯 Autonomy level changed to: ${level}`);
        this.emit('autonomy:changed', { level });
    }

    enableLearning() {
        this.isLearning = true;
        console.log('🧠 Learning mode enabled');
    }

    disableLearning() {
        this.isLearning = false;
        console.log('🧠 Learning mode disabled');
    }

    /**
     * 📧 Envía email de forma autónoma
     */
    async sendEmailAutonomous(emailRequest) {
        try {
            console.log('📧 Eva processing autonomous email request...');
            
            // Verificar que el sistema esté activo
            if (!this.isActive) {
                throw new Error('Autonomous system is not active');
            }

            // Tomar decisión autónoma sobre si enviar el email
            const decision = await this.makeAutonomousDecision('email_communication', {
                action: 'send_email',
                request: emailRequest,
                context: 'email_communication'
            });

            if (decision.action === 'no_action' || decision.confidence < 20) {
                return {
                    success: false,
                    reason: 'Autonomous decision: Email sending not approved',
                    decision,
                    confidence: decision.confidence
                };
            }

            // Enviar email usando el servicio
            const result = await this.emailService.sendEmailAutonomous(emailRequest);
            
            // Registrar estadística
            this.stats.autonomousActions++;
            
            console.log('✅ Email sent autonomously by Eva');
            
            return {
                success: true,
                result,
                decision,
                sentBy: 'eva_autonomous',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Error in autonomous email sending:', error);
            throw error;
        }
    }

    /**
     * 📥 Lee emails de forma autónoma
     */
    async readEmailsAutonomous(criteria) {
        try {
            console.log('📥 Eva reading emails autonomously...');
            
            if (!this.isActive) {
                throw new Error('Autonomous system is not active');
            }

            const result = await this.emailService.readEmailsAutonomous(criteria);
            
            this.stats.autonomousActions++;
            
            console.log(`✅ Eva read ${result.count} emails autonomously`);
            
            return result;

        } catch (error) {
            console.error('❌ Error in autonomous email reading:', error);
            throw error;
        }
    }

    /**
     * 📱 Activa respuestas automáticas de WhatsApp
     */
    async enableWhatsAppAutoResponse(settings = {}) {
        try {
            console.log('📱 Eva enabling WhatsApp auto-response...');
            
            if (!this.isActive) {
                throw new Error('Autonomous system is not active');
            }

            // Tomar decisión autónoma sobre activar WhatsApp
            const decision = await this.makeAutonomousDecision('whatsapp_auto_response', {
                action: 'enable_whatsapp_response',
                settings,
                context: 'whatsapp_auto_response'
            });

            if (decision.action === 'no_action' || decision.confidence < 30) {
                return {
                    success: false,
                    reason: 'Autonomous decision: WhatsApp auto-response activation not approved',
                    decision,
                    confidence: decision.confidence
                };
            }

            // Activar servicio WhatsApp
            const result = await this.whatsappService.enableAutoResponse(settings);
            
            // Registrar estadística
            this.stats.autonomousActions++;
            
            console.log('✅ WhatsApp auto-response enabled by Eva');
            
            return {
                success: true,
                result,
                decision,
                activatedBy: 'eva_autonomous',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Error enabling WhatsApp auto-response:', error);
            throw error;
        }
    }

    /**
     * 📱 Desactiva respuestas automáticas de WhatsApp
     */
    async disableWhatsAppAutoResponse() {
        try {
            console.log('📱 Eva disabling WhatsApp auto-response...');
            
            if (!this.isActive) {
                throw new Error('Autonomous system is not active');
            }

            const result = await this.whatsappService.disableAutoResponse();
            
            this.stats.autonomousActions++;
            
            console.log('✅ WhatsApp auto-response disabled by Eva');
            
            return {
                success: true,
                result,
                disabledBy: 'eva_autonomous',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Error disabling WhatsApp auto-response:', error);
            throw error;
        }
    }

    /**
     * 📱 Envía mensaje de WhatsApp de forma autónoma
     */
    async sendWhatsAppMessageAutonomous(messageRequest) {
        try {
            console.log('📱 Eva processing autonomous WhatsApp message...');
            
            if (!this.isActive) {
                throw new Error('Autonomous system is not active');
            }

            // Tomar decisión autónoma sobre enviar el mensaje
            const decision = await this.makeAutonomousDecision('whatsapp_response', {
                action: 'send_whatsapp_response',
                request: messageRequest,
                context: 'whatsapp_response'
            });

            if (decision.action === 'no_action' || decision.confidence < 40) {
                return {
                    success: false,
                    reason: 'Autonomous decision: WhatsApp message sending not approved',
                    decision,
                    confidence: decision.confidence
                };
            }

            // Enviar mensaje usando el servicio
            const result = await this.whatsappService.sendMessage(
                messageRequest.chatId, 
                messageRequest.message
            );
            
            this.stats.autonomousActions++;
            
            console.log('✅ WhatsApp message sent autonomously by Eva');
            
            return {
                success: true,
                result,
                decision,
                sentBy: 'eva_autonomous',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Error in autonomous WhatsApp message:', error);
            throw error;
        }
    }

    /**
     * 📱 Procesa solicitud de WhatsApp
     */
    async processWhatsAppRequest(request) {
        try {
            console.log('📱 Eva processing WhatsApp request:', request.type);
            
            if (!this.isActive) {
                throw new Error('Autonomous system is not active');
            }

            const result = await this.whatsappService.processWhatsAppRequest(request);
            
            this.stats.autonomousActions++;
            
            return {
                success: true,
                result,
                processedBy: 'eva_autonomous',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Error processing WhatsApp request:', error);
            throw error;
        }
    }

    /**
     * 📊 Obtiene estadísticas del servicio de email
     */
    getEmailStats() {
        return this.emailService.getEmailStats();
    }

    /**
     * 📱 Obtiene estadísticas del servicio de WhatsApp
     */
    getWhatsAppStats() {
        return this.whatsappService.getStats();
    }

    /**
     * 📱 Obtiene configuración de WhatsApp
     */
    getWhatsAppSettings() {
        return this.whatsappService.getSettings();
    }

    /**
     * 📱 Verifica si auto-respuesta de WhatsApp está activa
     */
    isWhatsAppAutoResponseActive() {
        return this.whatsappService.isAutoResponseActive();
    }
}

module.exports = EvaAutonomousController;