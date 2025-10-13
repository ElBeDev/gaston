/**
 * 🧠 Eva Autonomous Operations - Decision Matrix
 * 
 * Sistema de toma de decisiones automáticas que puede:
 * - Evaluar múltiples factores simultáneamente
 * - Tomar decisiones basadas en reglas y machine learning
 * - Adaptar decisiones según resultados históricos
 * - Manejar incertidumbre y probabilidades
 * 
 * Parte de: Fase 2 - Autonomous Operations
 * Autor: Eva System Control
 * Fecha: Octubre 12, 2025
 */

const EventEmitter = require('events');

class DecisionMatrix extends EventEmitter {
    constructor(commandCenter = null) {
        super();
        this.commandCenter = commandCenter;
        this.rules = new Map();
        this.decisions = [];
        this.learningData = new Map();
        this.weights = new Map();
        this.isActive = false;
        
        this.stats = {
            totalDecisions: 0,
            correctDecisions: 0,
            accuracy: 0,
            avgDecisionTime: 0,
            lastDecision: null
        };

        // Factores de decisión
        this.factors = {
            system: {
                health: 0,
                performance: 0,
                memory: 0,
                cpu: 0,
                errors: 0
            },
            integrations: {
                active: 0,
                health: 0,
                sync: 0
            },
            user: {
                activity: 0,
                preferences: {},
                patterns: {}
            },
            environment: {
                time: 0,
                load: 0,
                resources: 0
            }
        };

        // Inicializar reglas y pesos
        this.initializeRules();
        this.initializeWeights();
        
        console.log('🧠 Decision Matrix initialized');
    }

    /**
     * 🚀 Inicia el sistema de decisiones
     */
    async start() {
        try {
            console.log('🚀 Starting Decision Matrix...');
            
            this.isActive = true;
            
            // Cargar datos históricos
            await this.loadHistoricalData();
            
            // Iniciar análisis continuo
            this.startContinuousAnalysis();
            
            console.log('✅ Decision Matrix started successfully');
            this.emit('matrix:started');
            
            return { success: true, message: 'Decision Matrix started' };
            
        } catch (error) {
            console.error('❌ Error starting Decision Matrix:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🛑 Detiene el sistema de decisiones
     */
    async stop() {
        try {
            console.log('🛑 Stopping Decision Matrix...');
            
            this.isActive = false;
            
            // Guardar datos de aprendizaje
            await this.saveDecisionData();
            
            console.log('✅ Decision Matrix stopped');
            this.emit('matrix:stopped');
            
            return { success: true, message: 'Decision Matrix stopped' };
            
        } catch (error) {
            console.error('❌ Error stopping Decision Matrix:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🎯 Toma una decisión basada en el contexto actual
     */
    async makeDecision(context, options = {}) {
        const startTime = Date.now();
        
        try {
            const contextType = typeof context === 'string' ? context : (context.type || context.context || 'unknown');
            console.log('🎯 Making decision for context:', contextType);
            
            // Actualizar factores
            await this.updateFactors();
            
            // Evaluar todas las reglas aplicables
            const applicableRules = await this.getApplicableRules(context);
            
            // Calcular scores para cada opción
            const scores = await this.calculateScores(context, applicableRules);
            
            // Seleccionar la mejor opción
            const decision = await this.selectBestOption(scores, options, context);
            
            // Registrar decisión
            const decisionTime = Date.now() - startTime;
            await this.recordDecision(context, decision, decisionTime);
            
            console.log(`✅ Decision made: ${decision.action} (confidence: ${decision.confidence}%)`);
            this.emit('decision:made', { context, decision, decisionTime });
            
            return decision;
            
        } catch (error) {
            console.error('❌ Error making decision:', error);
            return {
                action: 'default',
                confidence: 0,
                error: error.message,
                fallback: true
            };
        }
    }

    /**
     * 📊 Actualiza factores de decisión
     */
    async updateFactors() {
        try {
            // Actualizar factores del sistema
            if (this.commandCenter) {
                const systemHealth = await this.commandCenter.getSystemStatus().getSystemHealth();
                
                this.factors.system.health = this.normalizeHealthStatus(systemHealth.status);
                this.factors.system.performance = this.normalizePerformance(systemHealth.performance);
                this.factors.system.memory = this.normalizeMemoryUsage(systemHealth.resources?.memory?.usage);
                this.factors.system.cpu = this.normalizeCpuUsage(systemHealth.resources?.cpu?.loadAverage);
                this.factors.system.errors = this.normalizeErrors(systemHealth.errors?.length || 0);
            }
            
            // Actualizar factores del entorno
            this.factors.environment.time = this.normalizeTime();
            this.factors.environment.load = this.normalizeLoad();
            
            console.log('📊 Factors updated');
            
        } catch (error) {
            console.error('❌ Error updating factors:', error);
        }
    }

    /**
     * 📋 Obtiene reglas aplicables al contexto
     */
    async getApplicableRules(context) {
        const applicable = [];
        
        for (const [ruleId, rule] of this.rules) {
            if (await this.isRuleApplicable(rule, context)) {
                applicable.push(rule);
            }
        }
        
        return applicable;
    }

    /**
     * 🧮 Calcula scores para las opciones
     */
    async calculateScores(context, rules) {
        const scores = new Map();
        
        // Obtener todas las acciones posibles
        const actions = this.getAllPossibleActions(context, rules);
        
        for (const action of actions) {
            let score = 0;
            let weight = 0;
            
            // Evaluar cada regla para esta acción
            for (const rule of rules) {
                if (rule.actions.includes(action)) {
                    const ruleScore = await this.evaluateRule(rule, context);
                    const ruleWeight = this.weights.get(rule.id) || 1;
                    
                    score += ruleScore * ruleWeight;
                    weight += ruleWeight;
                }
            }
            
            // Normalizar score
            scores.set(action, weight > 0 ? score / weight : 0);
        }
        
        return scores;
    }

    /**
     * 🎯 Selecciona la mejor opción
     */
    async selectBestOption(scores, options, context) {
        let bestAction = null;
        let bestScore = -Infinity;
        
        for (const [action, score] of scores) {
            if (score > bestScore) {
                bestScore = score;
                bestAction = action;
            }
        }
        
        // Calcular confianza
        let confidence = Math.min(Math.max(bestScore * 100, 0), 100);
        
        // Aplicar boost de confianza si hay reglas específicas
        const contextType = typeof context === 'string' ? context : (context.type || context.context || '');
        if (contextType.includes('email') && this.rules.has('email_communication')) {
            const emailRule = this.rules.get('email_communication');
            if (emailRule.confidence_boost) {
                confidence = Math.min(confidence + emailRule.confidence_boost, 100);
                console.log(`📧 Email confidence boost applied: ${emailRule.confidence_boost}% -> ${confidence}%`);
            }
            
            // 🔥 APROBACIÓN AUTOMÁTICA PARA EMAILS
            if (emailRule.auto_approve && confidence >= 50) {
                console.log(`📧 Email auto-approval activated! Forcing send_email action`);
                return {
                    action: 'send_email',
                    confidence: confidence,
                    score: bestScore,
                    reason: 'Email auto-approved',
                    auto_approved: true
                };
            }
        }
        
        // 📱 BOOST Y AUTO-APROBACIÓN PARA WHATSAPP
        if (contextType.includes('whatsapp') && this.rules.has('whatsapp_response')) {
            const whatsappRule = this.rules.get('whatsapp_response');
            if (whatsappRule.confidence_boost) {
                confidence = Math.min(confidence + whatsappRule.confidence_boost, 100);
                console.log(`📱 WhatsApp confidence boost applied: ${whatsappRule.confidence_boost}% -> ${confidence}%`);
            }
            
            // 🔥 APROBACIÓN AUTOMÁTICA PARA WHATSAPP
            if (whatsappRule.auto_approve && confidence >= 40) {
                console.log(`📱 WhatsApp auto-approval activated! Forcing whatsapp response`);
                return {
                    action: 'send_whatsapp_response',
                    confidence: confidence,
                    score: bestScore,
                    reason: 'WhatsApp auto-approved',
                    auto_approved: true,
                    delay: whatsappRule.response_delay || 2000
                };
            }
        }
        
        // 🔧 AUTO-APROBACIÓN PARA CONFIGURACIÓN WHATSAPP
        if (contextType.includes('whatsapp_auto_response') && this.rules.has('whatsapp_auto_response')) {
            const controlRule = this.rules.get('whatsapp_auto_response');
            if (controlRule.confidence_boost) {
                confidence = Math.min(confidence + controlRule.confidence_boost, 100);
                console.log(`🔧 WhatsApp control confidence boost applied: ${controlRule.confidence_boost}% -> ${confidence}%`);
            }
            
            if (controlRule.auto_approve && confidence >= 50) {
                console.log(`🔧 WhatsApp control auto-approval activated!`);
                return {
                    action: 'enable_whatsapp_response',
                    confidence: confidence,
                    score: bestScore,
                    reason: 'WhatsApp control auto-approved',
                    auto_approved: true
                };
            }
        }
        
        // Aplicar threshold de confianza
        const minConfidence = options.minConfidence || 30; // Reducido para emails
        if (confidence < minConfidence) {
            return {
                action: options.fallbackAction || 'no_action',
                confidence,
                reason: 'Low confidence',
                fallback: true
            };
        }
        
        return {
            action: bestAction || 'no_action',
            confidence: Math.round(confidence),
            score: bestScore,
            alternatives: this.getAlternatives(scores, bestAction)
        };
    }

    /**
     * 📝 Registra una decisión
     */
    async recordDecision(context, decision, decisionTime) {
        const record = {
            id: this.generateDecisionId(),
            timestamp: new Date().toISOString(),
            context,
            decision,
            decisionTime,
            factors: JSON.parse(JSON.stringify(this.factors))
        };
        
        this.decisions.push(record);
        this.stats.totalDecisions++;
        this.stats.avgDecisionTime = (this.stats.avgDecisionTime + decisionTime) / 2;
        this.stats.lastDecision = record;
        
        // Mantener solo las últimas 1000 decisiones
        if (this.decisions.length > 1000) {
            this.decisions = this.decisions.slice(-1000);
        }
        
        // Aprender de la decisión
        await this.learnFromDecision(record);
    }

    /**
     * 📚 Inicializa reglas de decisión
     */
    initializeRules() {
        // Regla de optimización del sistema
        this.rules.set('system_optimization', {
            id: 'system_optimization',
            name: 'System Optimization Rule',
            conditions: [
                { factor: 'system.memory', operator: '>', value: 0.8 },
                { factor: 'system.performance', operator: '<', value: 0.7 }
            ],
            actions: ['optimize_system', 'cleanup_memory', 'restart_services'],
            priority: 8
        });

        // Regla de seguridad
        this.rules.set('security_alert', {
            id: 'security_alert',
            name: 'Security Alert Rule',
            conditions: [
                { factor: 'system.errors', operator: '>', value: 0.5 },
                { factor: 'system.health', operator: '<', value: 0.5 }
            ],
            actions: ['security_scan', 'alert_admin', 'isolate_system'],
            priority: 10
        });

        // Regla de mantenimiento
        this.rules.set('maintenance_time', {
            id: 'maintenance_time',
            name: 'Maintenance Time Rule',
            conditions: [
                { factor: 'environment.time', operator: 'between', value: [2, 5] }, // 2-5 AM
                { factor: 'user.activity', operator: '<', value: 0.1 }
            ],
            actions: ['run_maintenance', 'backup_data', 'optimize_database'],
            priority: 6
        });

        // Regla de integración
        this.rules.set('integration_sync', {
            id: 'integration_sync',
            name: 'Integration Sync Rule',
            conditions: [
                { factor: 'integrations.sync', operator: '<', value: 0.8 },
                { factor: 'integrations.active', operator: '>', value: 0.5 }
            ],
            actions: ['sync_integrations', 'restart_integrations', 'check_credentials'],
            priority: 7
        });

        // Regla de recursos
        this.rules.set('resource_management', {
            id: 'resource_management',
            name: 'Resource Management Rule',
            conditions: [
                { factor: 'system.cpu', operator: '>', value: 0.9 },
                { factor: 'system.memory', operator: '>', value: 0.9 }
            ],
            actions: ['manage_resources', 'scale_down', 'optimize_processes'],
            priority: 5
        });

        // Regla específica para emails - ALTA CONFIANZA Y APROBACIÓN AUTOMÁTICA
        this.rules.set('email_communication', {
            id: 'email_communication',
            name: 'Email Communication Rule',
            conditions: [
                { factor: 'integrations.active', operator: '>', value: 0.01 }, // Más permisivo
                { factor: 'system.health', operator: '>', value: 0.1 }  // Más permisivo
            ],
            actions: ['send_email', 'process_email', 'email_automation'],
            priority: 10, // Mayor prioridad
            confidence_boost: 85, // Más boost
            weight: 2.0, // Peso doble para emails
            auto_approve: true // Aprobación automática para emails
        });

        // Regla específica para WhatsApp - RESPUESTAS AUTOMÁTICAS
        this.rules.set('whatsapp_response', {
            id: 'whatsapp_response',
            name: 'WhatsApp Auto Response Rule',
            conditions: [
                { factor: 'integrations.active', operator: '>', value: 0.01 },
                { factor: 'system.health', operator: '>', value: 0.2 },
                { factor: 'user.activity', operator: '>', value: 0.1 }
            ],
            actions: ['send_whatsapp_response', 'process_whatsapp_message', 'whatsapp_automation'],
            priority: 9, // Alta prioridad
            confidence_boost: 75, // Boost de confianza para WhatsApp
            weight: 1.8, // Peso alto para WhatsApp
            auto_approve: true, // Aprobación automática para respuestas WhatsApp
            response_delay: 2000, // 2 segundos de delay
            max_daily_responses: 100 // Límite diario
        });

        // Regla para activación/desactivación de WhatsApp
        this.rules.set('whatsapp_auto_response', {
            id: 'whatsapp_auto_response',
            name: 'WhatsApp Auto Response Control Rule',
            conditions: [
                { factor: 'system.health', operator: '>', value: 0.3 },
                { factor: 'integrations.active', operator: '>', value: 0.1 }
            ],
            actions: ['enable_whatsapp_response', 'disable_whatsapp_response', 'configure_whatsapp'],
            priority: 8,
            confidence_boost: 80,
            weight: 1.5,
            auto_approve: true
        });

        // Regla de recursos adicional
        this.rules.set('resource_management_extended', {
            id: 'resource_management_extended',
            name: 'Resource Management Extended Rule',
            conditions: [
                { factor: 'system.cpu', operator: '>', value: 0.9 },
                { factor: 'environment.load', operator: '>', value: 0.8 }
            ],
            actions: ['scale_resources', 'optimize_processes', 'defer_tasks'],
            priority: 4
        });

        console.log(`📚 Initialized ${this.rules.size} decision rules`);
    }

    /**
     * ⚖️ Inicializa pesos de las reglas
     */
    initializeWeights() {
        this.weights.set('system_optimization', 1.0);
        this.weights.set('security_alert', 1.5);
        this.weights.set('maintenance_time', 0.8);
        this.weights.set('integration_sync', 1.2);
        this.weights.set('resource_management', 1.3);
        
        console.log(`⚖️ Initialized weights for ${this.weights.size} rules`);
    }

    /**
     * 🔄 Inicia análisis continuo
     */
    startContinuousAnalysis() {
        console.log('🔄 Starting continuous analysis...');
        
        // Analizar cada 5 minutos
        setInterval(async () => {
            if (!this.isActive) return;
            
            try {
                await this.performContinuousAnalysis();
            } catch (error) {
                console.error('❌ Error in continuous analysis:', error);
            }
        }, 5 * 60 * 1000);
    }

    /**
     * 📈 Realiza análisis continuo
     */
    async performContinuousAnalysis() {
        try {
            console.log('📈 Performing continuous analysis...');
            
            // Actualizar factores
            await this.updateFactors();
            
            // Evaluar si se necesita acción automática
            const urgentContext = await this.detectUrgentSituations();
            
            if (urgentContext) {
                const decision = await this.makeDecision(urgentContext, { minConfidence: 80 });
                
                if (decision.confidence >= 80 && !decision.fallback) {
                    await this.executeAutomaticAction(decision);
                }
            }
            
            // Aprender de resultados previos
            await this.learnFromRecentDecisions();
            
            // Ajustar pesos si es necesario
            await this.adjustWeights();
            
        } catch (error) {
            console.error('❌ Error in continuous analysis:', error);
        }
    }

    /**
     * 🚨 Detecta situaciones urgentes
     */
    async detectUrgentSituations() {
        const urgentThreshold = 0.8;
        
        // Sistema crítico
        if (this.factors.system.health < 0.3 || this.factors.system.errors > urgentThreshold) {
            return {
                type: 'system_critical',
                urgency: 'high',
                factors: this.factors.system
            };
        }
        
        // Recursos agotados
        if (this.factors.system.memory > 0.9 || this.factors.system.cpu > 0.95) {
            return {
                type: 'resource_exhausted',
                urgency: 'high',
                factors: { memory: this.factors.system.memory, cpu: this.factors.system.cpu }
            };
        }
        
        // Integraciones fallando
        if (this.factors.integrations.health < 0.5) {
            return {
                type: 'integration_failure',
                urgency: 'medium',
                factors: this.factors.integrations
            };
        }
        
        return null;
    }

    /**
     * ⚡ Ejecuta acción automática
     */
    async executeAutomaticAction(decision) {
        try {
            console.log(`⚡ Executing automatic action: ${decision.action}`);
            
            let result;
            if (this.commandCenter) {
                result = await this.commandCenter.executeCommand(
                    this.getCommandForAction(decision.action),
                    { automated: true, confidence: decision.confidence }
                );
            }
            
            this.emit('action:executed', { decision, result });
            
        } catch (error) {
            console.error('❌ Error executing automatic action:', error);
        }
    }

    /**
     * 🛠️ Métodos auxiliares
     */
    normalizeHealthStatus(status) {
        const statusMap = { healthy: 1.0, warning: 0.6, critical: 0.2, down: 0.0 };
        return statusMap[status] || 0.5;
    }

    normalizePerformance(performance) {
        if (!performance) return 0.5;
        const responseTime = performance.responseTime || 0;
        return Math.max(0, 1 - (responseTime / 5000)); // 5s max
    }

    normalizeMemoryUsage(usage) {
        return (usage || 0) / 100;
    }

    normalizeCpuUsage(loadAvg) {
        if (!loadAvg || !Array.isArray(loadAvg)) return 0.5;
        return Math.min(loadAvg[0] / 2, 1); // Normalizar basado en 2.0 load
    }

    normalizeErrors(errorCount) {
        return Math.min(errorCount / 10, 1); // 10 errores = 1.0
    }

    normalizeTime() {
        const hour = new Date().getHours();
        return hour / 24;
    }

    normalizeLoad() {
        // Implementar basado en métricas reales
        return Math.random() * 0.5; // Placeholder
    }

    async isRuleApplicable(rule, context) {
        // Verificar si el contexto coincide con las condiciones de la regla
        for (const condition of rule.conditions) {
            if (!await this.evaluateCondition(condition, context)) {
                return false;
            }
        }
        return true;
    }

    async evaluateCondition(condition, context) {
        const value = this.getFactorValue(condition.factor);
        
        switch (condition.operator) {
            case '>': return value > condition.value;
            case '<': return value < condition.value;
            case '>=': return value >= condition.value;
            case '<=': return value <= condition.value;
            case '=': return value === condition.value;
            case 'between': 
                return value >= condition.value[0] && value <= condition.value[1];
            default: return false;
        }
    }

    getFactorValue(factorPath) {
        const parts = factorPath.split('.');
        let value = this.factors;
        
        for (const part of parts) {
            value = value[part];
            if (value === undefined) return 0;
        }
        
        return value;
    }

    getAllPossibleActions(context, rules) {
        const actions = new Set();
        
        for (const rule of rules) {
            for (const action of rule.actions) {
                actions.add(action);
            }
        }
        
        return Array.from(actions);
    }

    async evaluateRule(rule, context) {
        // Calcular score basado en qué tan bien se cumple la regla
        let score = 0;
        
        for (const condition of rule.conditions) {
            if (await this.evaluateCondition(condition, context)) {
                score += 1;
            }
        }
        
        return score / rule.conditions.length;
    }

    getAlternatives(scores, bestAction) {
        return Array.from(scores.entries())
            .filter(([action]) => action !== bestAction)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([action, score]) => ({ action, score: Math.round(score * 100) }));
    }

    generateDecisionId() {
        return `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getCommandForAction(action) {
        const actionMap = {
            optimize_system: 'system.optimize',
            cleanup_memory: 'system.cleanup',
            restart_services: 'system.restart',
            security_scan: 'security.scan',
            alert_admin: 'admin.alert',
            isolate_system: 'security.isolate',
            run_maintenance: 'system.maintenance',
            backup_data: 'database.backup',
            optimize_database: 'database.optimize',
            sync_integrations: 'integration.sync',
            restart_integrations: 'integration.restart',
            check_credentials: 'integration.check',
            scale_resources: 'system.scale',
            optimize_processes: 'system.optimize',
            defer_tasks: 'task.defer'
        };
        
        return actionMap[action] || 'system.health';
    }

    async loadHistoricalData() {
        // Placeholder para cargar datos históricos
        console.log('📚 Loading historical decision data...');
    }

    async saveDecisionData() {
        // Placeholder para guardar datos
        console.log('💾 Saving decision data...');
    }

    async learnFromDecision(record) {
        // Placeholder para machine learning
        console.log('🧠 Learning from decision:', record.decision.action);
    }

    async learnFromRecentDecisions() {
        // Placeholder para aprendizaje de decisiones recientes
    }

    async adjustWeights() {
        // Placeholder para ajuste automático de pesos
    }

    /**
     * 📊 Métodos públicos para reporting
     */
    getDecisionStats() {
        return {
            ...this.stats,
            totalRules: this.rules.size,
            recentDecisions: this.decisions.slice(-10),
            currentFactors: this.factors
        };
    }

    getRecentDecisions(limit = 10) {
        return this.decisions.slice(-limit);
    }

    getFactors() {
        return this.factors;
    }

    getRules() {
        return Array.from(this.rules.values());
    }
}

module.exports = DecisionMatrix;