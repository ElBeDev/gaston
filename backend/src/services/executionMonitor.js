const EventEmitter = require('events');
const OpenAI = require('openai');

class ExecutionMonitor extends EventEmitter {
    constructor() {
        super();
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        // Execution tracking
        this.activeExecutions = new Map();
        this.executionHistory = [];
        this.performanceMetrics = {
            totalExecutions: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
            averageExecutionTime: 0,
            uptimeStart: new Date()
        };
        
        // Monitoring configuration
        this.monitoringConfig = {
            healthCheckInterval: 30000, // 30 seconds
            performanceLogInterval: 300000, // 5 minutes
            alertThresholds: {
                maxExecutionTime: 1800000, // 30 minutes
                maxFailureRate: 0.15, // 15%
                maxConcurrentExecutions: 10
            },
            retentionPeriod: 24 * 60 * 60 * 1000 // 24 hours
        };
        
        // Alert system
        this.alerts = [];
        this.alertHandlers = new Map();
        
        // Start monitoring services
        this.startMonitoring();
    }

    /**
     * Start execution monitoring
     * @param {Object} executionPlan - The execution plan to monitor
     * @returns {string} Execution ID
     */
    startExecution(executionPlan) {
        const executionId = this.generateExecutionId();
        
        const execution = {
            id: executionId,
            plan: executionPlan,
            status: 'started',
            startTime: new Date(),
            steps: [],
            currentStep: null,
            metrics: {
                stepsCompleted: 0,
                stepsTotal: executionPlan.steps?.length || 0,
                errors: [],
                warnings: [],
                performance: {}
            },
            alerts: [],
            logs: []
        };
        
        // Store active execution
        this.activeExecutions.set(executionId, execution);
        
        // Log execution start
        this.logEvent(executionId, 'execution_started', {
            planId: executionPlan.planId,
            estimatedDuration: executionPlan.totalEstimatedTime
        });
        
        // Emit event
        this.emit('executionStarted', { executionId, execution });
        
        // Start health monitoring for this execution
        this.scheduleHealthCheck(executionId);
        
        console.log(`📊 EXECUTION MONITOR: Started monitoring execution ${executionId}`);
        return executionId;
    }

    /**
     * Update step status in execution
     * @param {string} executionId - Execution ID
     * @param {number} stepNumber - Step number
     * @param {string} status - Step status
     * @param {string} error - Error message if any
     */
    updateStep(executionId, stepNumber, status, error = null) {
        const execution = this.activeExecutions.get(executionId);
        if (!execution) {
            console.warn(`⚠️ Execution ${executionId} not found for step update`);
            return;
        }
        
        const stepUpdate = {
            stepNumber,
            status,
            timestamp: new Date(),
            error: error || null
        };
        
        // Update step information
        execution.steps[stepNumber - 1] = stepUpdate;
        execution.currentStep = stepNumber;
        
        // Update metrics
        if (status === 'completed') {
            execution.metrics.stepsCompleted++;
        } else if (status === 'failed') {
            execution.metrics.errors.push({
                step: stepNumber,
                error,
                timestamp: new Date()
            });
        }
        
        // Log step update
        this.logEvent(executionId, 'step_updated', stepUpdate);
        
        // Check for alerts
        this.checkStepAlerts(executionId, stepUpdate);
        
        // Emit event
        this.emit('stepUpdated', { executionId, stepUpdate });
        
        console.log(`🔄 Step ${stepNumber} ${status} for execution ${executionId}`);
    }

    /**
     * Complete execution monitoring
     * @param {string} executionId - Execution ID
     * @param {string} status - Final status
     * @param {Object} result - Execution result
     */
    completeExecution(executionId, status, result = null) {
        const execution = this.activeExecutions.get(executionId);
        if (!execution) {
            console.warn(`⚠️ Execution ${executionId} not found for completion`);
            return;
        }
        
        // Update execution
        execution.status = status;
        execution.endTime = new Date();
        execution.duration = execution.endTime - execution.startTime;
        execution.result = result;
        
        // Calculate final metrics
        execution.metrics.completionRate = execution.metrics.stepsCompleted / execution.metrics.stepsTotal;
        execution.metrics.successRate = status === 'success' ? 1 : 0;
        execution.metrics.actualDuration = execution.duration;
        
        // Log completion
        this.logEvent(executionId, 'execution_completed', {
            status,
            duration: execution.duration,
            completionRate: execution.metrics.completionRate
        });
        
        // Update global metrics
        this.updateGlobalMetrics(execution);
        
        // Move to history
        this.moveToHistory(executionId);
        
        // Emit completion event
        this.emit('executionCompleted', { executionId, execution, status });
        
        console.log(`✅ Execution ${executionId} completed with status: ${status}`);
    }

    /**
     * Get real-time execution status
     * @param {string} executionId - Execution ID
     * @returns {Object} Execution status
     */
    getExecutionStatus(executionId) {
        const execution = this.activeExecutions.get(executionId) || 
                         this.executionHistory.find(e => e.id === executionId);
        
        if (!execution) {
            return { error: 'Execution not found' };
        }
        
        return {
            id: executionId,
            status: execution.status,
            progress: this.calculateProgress(execution),
            currentStep: execution.currentStep,
            metrics: execution.metrics,
            alerts: execution.alerts,
            startTime: execution.startTime,
            duration: execution.duration || (new Date() - execution.startTime),
            estimatedCompletion: this.estimateCompletion(execution)
        };
    }

    /**
     * Get all active executions
     * @returns {Array} Active executions summary
     */
    getActiveExecutions() {
        const active = [];
        
        for (const [id, execution] of this.activeExecutions) {
            active.push({
                id,
                status: execution.status,
                progress: this.calculateProgress(execution),
                startTime: execution.startTime,
                currentStep: execution.currentStep,
                planType: execution.plan.type || 'unknown'
            });
        }
        
        return active;
    }

    /**
     * Get performance metrics
     * @returns {Object} Performance metrics
     */
    getPerformanceMetrics() {
        const uptime = new Date() - this.performanceMetrics.uptimeStart;
        const recentExecutions = this.executionHistory.slice(-20);
        
        return {
            ...this.performanceMetrics,
            uptime: uptime,
            uptimeFormatted: this.formatDuration(uptime),
            activeExecutions: this.activeExecutions.size,
            recentFailureRate: this.calculateRecentFailureRate(recentExecutions),
            averageStepTime: this.calculateAverageStepTime(recentExecutions),
            concurrentExecutionsMax: Math.max(...this.executionHistory.map(e => e.concurrentCount || 1)),
            alertsActive: this.alerts.filter(a => a.status === 'active').length
        };
    }

    /**
     * Generate performance report
     * @param {string} timeframe - Report timeframe (1h, 6h, 24h)
     * @returns {Object} Performance report
     */
    async generatePerformanceReport(timeframe = '24h') {
        const timeframeMs = this.parseTimeframe(timeframe);
        const cutoffTime = new Date(Date.now() - timeframeMs);
        
        const relevantExecutions = this.executionHistory.filter(
            e => e.startTime >= cutoffTime
        );
        
        const report = {
            timeframe,
            period: {
                start: cutoffTime,
                end: new Date()
            },
            summary: {
                totalExecutions: relevantExecutions.length,
                successfulExecutions: relevantExecutions.filter(e => e.status === 'success').length,
                failedExecutions: relevantExecutions.filter(e => e.status === 'failed').length,
                averageDuration: this.calculateAverageDuration(relevantExecutions)
            },
            trends: await this.analyzeTrends(relevantExecutions),
            topErrors: this.analyzeTopErrors(relevantExecutions),
            recommendations: await this.generateRecommendations(relevantExecutions)
        };
        
        return report;
    }

    /**
     * Schedule health check for execution
     */
    scheduleHealthCheck(executionId) {
        const checkInterval = setInterval(() => {
            const execution = this.activeExecutions.get(executionId);
            if (!execution) {
                clearInterval(checkInterval);
                return;
            }
            
            this.performHealthCheck(executionId);
        }, this.monitoringConfig.healthCheckInterval);
        
        // Store interval reference for cleanup
        const execution = this.activeExecutions.get(executionId);
        if (execution) {
            execution.healthCheckInterval = checkInterval;
        }
    }

    /**
     * Perform health check on execution
     */
    performHealthCheck(executionId) {
        const execution = this.activeExecutions.get(executionId);
        if (!execution) return;
        
        const now = new Date();
        const executionTime = now - execution.startTime;
        
        // Check for timeout
        if (executionTime > this.monitoringConfig.alertThresholds.maxExecutionTime) {
            this.createAlert(executionId, 'execution_timeout', {
                duration: executionTime,
                threshold: this.monitoringConfig.alertThresholds.maxExecutionTime
            });
        }
        
        // Check for stuck steps
        if (execution.currentStep) {
            const currentStepInfo = execution.steps[execution.currentStep - 1];
            if (currentStepInfo && currentStepInfo.status === 'in_progress') {
                const stepDuration = now - currentStepInfo.timestamp;
                if (stepDuration > 300000) { // 5 minutes
                    this.createAlert(executionId, 'step_timeout', {
                        step: execution.currentStep,
                        duration: stepDuration
                    });
                }
            }
        }
        
        // Log health check
        this.logEvent(executionId, 'health_check', {
            executionTime,
            currentStep: execution.currentStep,
            status: execution.status
        });
    }

    /**
     * Create alert
     */
    createAlert(executionId, type, data) {
        const alert = {
            id: this.generateAlertId(),
            executionId,
            type,
            severity: this.getAlertSeverity(type),
            message: this.getAlertMessage(type, data),
            data,
            timestamp: new Date(),
            status: 'active'
        };
        
        // Store alert
        this.alerts.push(alert);
        
        // Add to execution alerts
        const execution = this.activeExecutions.get(executionId);
        if (execution) {
            execution.alerts.push(alert);
        }
        
        // Emit alert event
        this.emit('alert', alert);
        
        // Handle alert based on severity
        this.handleAlert(alert);
        
        console.warn(`🚨 Alert created: ${type} for execution ${executionId}`);
    }

    /**
     * Handle alert based on severity
     */
    handleAlert(alert) {
        switch (alert.severity) {
            case 'critical':
                this.handleCriticalAlert(alert);
                break;
            case 'warning':
                this.handleWarningAlert(alert);
                break;
            case 'info':
                this.handleInfoAlert(alert);
                break;
        }
    }

    /**
     * Handle critical alert
     */
    handleCriticalAlert(alert) {
        console.error(`🚨 CRITICAL ALERT: ${alert.message}`);
        
        // Could integrate with external alerting systems
        // For now, just log and emit event
        this.emit('criticalAlert', alert);
    }

    /**
     * Log event for execution
     */
    logEvent(executionId, eventType, data) {
        const execution = this.activeExecutions.get(executionId);
        if (execution) {
            execution.logs.push({
                timestamp: new Date(),
                type: eventType,
                data
            });
            
            // Keep logs manageable
            if (execution.logs.length > 100) {
                execution.logs = execution.logs.slice(-50);
            }
        }
    }

    /**
     * Calculate execution progress
     */
    calculateProgress(execution) {
        if (!execution.metrics.stepsTotal) return 0;
        return (execution.metrics.stepsCompleted / execution.metrics.stepsTotal) * 100;
    }

    /**
     * Estimate completion time
     */
    estimateCompletion(execution) {
        if (execution.status !== 'started') return null;
        
        const progress = this.calculateProgress(execution);
        if (progress === 0) return null;
        
        const elapsed = new Date() - execution.startTime;
        const estimatedTotal = (elapsed / progress) * 100;
        const estimatedRemaining = estimatedTotal - elapsed;
        
        return {
            estimatedTotal,
            estimatedRemaining,
            estimatedCompletionTime: new Date(Date.now() + estimatedRemaining)
        };
    }

    /**
     * Move execution to history
     */
    moveToHistory(executionId) {
        const execution = this.activeExecutions.get(executionId);
        if (execution) {
            // Clean up intervals
            if (execution.healthCheckInterval) {
                clearInterval(execution.healthCheckInterval);
            }
            
            // Move to history
            this.executionHistory.push(execution);
            this.activeExecutions.delete(executionId);
            
            // Cleanup old history
            this.cleanupHistory();
        }
    }

    /**
     * Cleanup old execution history
     */
    cleanupHistory() {
        const cutoffTime = new Date(Date.now() - this.monitoringConfig.retentionPeriod);
        this.executionHistory = this.executionHistory.filter(
            e => e.startTime >= cutoffTime
        );
    }

    /**
     * Update global performance metrics
     */
    updateGlobalMetrics(execution) {
        this.performanceMetrics.totalExecutions++;
        
        if (execution.status === 'success') {
            this.performanceMetrics.successfulExecutions++;
        } else {
            this.performanceMetrics.failedExecutions++;
        }
        
        // Update average execution time
        const totalTime = this.performanceMetrics.averageExecutionTime * (this.performanceMetrics.totalExecutions - 1);
        this.performanceMetrics.averageExecutionTime = (totalTime + execution.duration) / this.performanceMetrics.totalExecutions;
    }

    /**
     * Start monitoring services
     */
    startMonitoring() {
        // Performance logging interval
        setInterval(() => {
            this.logPerformanceMetrics();
        }, this.monitoringConfig.performanceLogInterval);
        
        // Cleanup interval
        setInterval(() => {
            this.cleanupHistory();
            this.cleanupAlerts();
        }, 3600000); // 1 hour
        
        console.log('📊 EXECUTION MONITOR: Monitoring services started');
    }

    /**
     * Log performance metrics
     */
    logPerformanceMetrics() {
        const metrics = this.getPerformanceMetrics();
        console.log('📊 Performance Metrics:', {
            active: metrics.activeExecutions,
            total: metrics.totalExecutions,
            successRate: ((metrics.successfulExecutions / metrics.totalExecutions) * 100).toFixed(1) + '%',
            uptime: metrics.uptimeFormatted
        });
    }

    /**
     * Utility methods
     */
    generateExecutionId() {
        return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    getAlertSeverity(type) {
        const severities = {
            execution_timeout: 'critical',
            step_timeout: 'warning',
            high_error_rate: 'warning',
            resource_exhaustion: 'critical',
            performance_degradation: 'info'
        };
        return severities[type] || 'info';
    }

    getAlertMessage(type, data) {
        const messages = {
            execution_timeout: `Execution timeout: ${this.formatDuration(data.duration)}`,
            step_timeout: `Step ${data.step} timeout: ${this.formatDuration(data.duration)}`,
            high_error_rate: `High error rate detected: ${data.rate}%`,
            resource_exhaustion: 'System resources exhausted',
            performance_degradation: 'Performance degradation detected'
        };
        return messages[type] || `Alert: ${type}`;
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    parseTimeframe(timeframe) {
        const units = { h: 3600000, m: 60000, s: 1000 };
        const match = timeframe.match(/^(\d+)([hms])$/);
        if (match) {
            return parseInt(match[1]) * units[match[2]];
        }
        return 24 * 3600000; // Default 24 hours
    }

    cleanupAlerts() {
        const cutoffTime = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)); // 7 days
        this.alerts = this.alerts.filter(a => a.timestamp >= cutoffTime);
    }

    /**
     * Calculate recent failure rate
     */
    calculateRecentFailureRate(recentExecutions) {
        if (recentExecutions.length === 0) return 0;
        const failed = recentExecutions.filter(e => e.status === 'failed').length;
        return (failed / recentExecutions.length) * 100;
    }

    /**
     * Calculate average step time
     */
    calculateAverageStepTime(recentExecutions) {
        if (recentExecutions.length === 0) return 0;
        
        let totalSteps = 0;
        let totalTime = 0;
        
        for (const execution of recentExecutions) {
            if (execution.steps && execution.duration) {
                totalSteps += execution.steps.length;
                totalTime += execution.duration;
            }
        }
        
        return totalSteps > 0 ? totalTime / totalSteps : 0;
    }

    /**
     * Calculate average duration
     */
    calculateAverageDuration(executions) {
        if (executions.length === 0) return 0;
        const total = executions.reduce((sum, e) => sum + (e.duration || 0), 0);
        return total / executions.length;
    }

    /**
     * Analyze trends in executions
     */
    async analyzeTrends(executions) {
        return {
            execution_count_trend: executions.length > 10 ? 'increasing' : 'stable',
            success_rate_trend: 'stable',
            performance_trend: 'stable'
        };
    }

    /**
     * Analyze top errors
     */
    analyzeTopErrors(executions) {
        const errors = [];
        executions.forEach(e => {
            if (e.metrics && e.metrics.errors) {
                errors.push(...e.metrics.errors);
            }
        });
        
        // Count error frequencies
        const errorCounts = {};
        errors.forEach(error => {
            const key = error.error || 'unknown';
            errorCounts[key] = (errorCounts[key] || 0) + 1;
        });
        
        // Sort by frequency
        return Object.entries(errorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([error, count]) => ({ error, count }));
    }

    /**
     * Generate recommendations
     */
    async generateRecommendations(executions) {
        const recommendations = [];
        
        if (executions.length === 0) {
            recommendations.push('No recent executions to analyze');
            return recommendations;
        }
        
        const failureRate = this.calculateRecentFailureRate(executions);
        if (failureRate > 20) {
            recommendations.push('High failure rate detected - review error patterns');
        }
        
        const avgDuration = this.calculateAverageDuration(executions);
        if (avgDuration > 1800000) { // 30 minutes
            recommendations.push('Executions taking longer than expected - optimize workflow steps');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('System performance is within normal parameters');
        }
        
        return recommendations;
    }

    /**
     * Get monitor status
     */
    getStatus() {
        return {
            monitoring: true,
            activeExecutions: this.activeExecutions.size,
            totalHistory: this.executionHistory.length,
            activeAlerts: this.alerts.filter(a => a.status === 'active').length,
            uptime: new Date() - this.performanceMetrics.uptimeStart,
            healthCheckInterval: this.monitoringConfig.healthCheckInterval,
            performanceMetrics: this.getPerformanceMetrics()
        };
    }
}

module.exports = ExecutionMonitor;
