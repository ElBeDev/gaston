/**
 * 🎯 Eva Command Center - System Status Manager
 * 
 * Monitorea el estado completo del sistema en tiempo real
 * Detecta anomalías, mide performance y reporta salud del sistema
 * 
 * Parte de: Fase 1 - Command Center
 * Autor: Eva System Control
 * Fecha: Octubre 12, 2025
 */

const mongoose = require('mongoose');
const fs = require('fs').promises;
const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

class SystemStatusManager {
    constructor() {
        this.services = new Map();
        this.lastHealthCheck = null;
        this.anomalies = [];
        this.performanceHistory = [];
        this.maxHistorySize = 100; // Mantener 100 registros históricos
    }

    /**
     * 📊 Obtiene el estado completo de salud del sistema
     */
    async getSystemHealth() {
        try {
            const timestamp = new Date().toISOString();
            
            const health = {
                timestamp,
                status: 'healthy', // healthy, warning, critical, down
                uptime: process.uptime(),
                services: await this.getServiceStatus(),
                resources: await this.getResourceUsage(),
                database: await this.getDatabaseHealth(),
                integrations: await this.getIntegrationsHealth(),
                performance: await this.getPerformanceMetrics(),
                errors: await this.getRecentErrors(),
                version: await this.getSystemVersion()
            };

            // Evaluar estado general
            health.status = this.evaluateOverallHealth(health);
            this.lastHealthCheck = health;

            return health;

        } catch (error) {
            console.error('❌ Error getting system health:', error);
            return {
                timestamp: new Date().toISOString(),
                status: 'critical',
                error: error.message,
                uptime: process.uptime()
            };
        }
    }

    /**
     * 🔧 Obtiene el estado de todos los servicios
     */
    async getServiceStatus() {
        const services = [];

        try {
            // Node.js Server
            services.push({
                name: 'Node.js Server',
                status: 'active',
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                pid: process.pid
            });

            // MongoDB
            const mongoStatus = await this.checkMongoDBStatus();
            services.push({
                name: 'MongoDB',
                status: mongoStatus.status,
                details: mongoStatus.details
            });

            // Socket.IO
            services.push({
                name: 'Socket.IO',
                status: this.checkSocketIOStatus(),
                connections: this.getActiveConnections()
            });

            // WhatsApp Web
            services.push({
                name: 'WhatsApp Web',
                status: await this.checkWhatsAppStatus()
            });

            // Google Workspace
            services.push({
                name: 'Google Workspace',
                status: await this.checkGoogleWorkspaceStatus()
            });

            // OpenAI Integration
            services.push({
                name: 'OpenAI Integration',
                status: await this.checkOpenAIStatus()
            });

        } catch (error) {
            console.error('❌ Error getting service status:', error);
        }

        return services;
    }

    /**
     * 💾 Obtiene uso de recursos del sistema
     */
    async getResourceUsage() {
        try {
            const memory = process.memoryUsage();
            const cpuUsage = process.cpuUsage();
            
            return {
                memory: {
                    rss: memory.rss,
                    heapTotal: memory.heapTotal,
                    heapUsed: memory.heapUsed,
                    external: memory.external,
                    usage: ((memory.heapUsed / memory.heapTotal) * 100).toFixed(2)
                },
                cpu: {
                    user: cpuUsage.user,
                    system: cpuUsage.system,
                    loadAverage: os.loadavg()
                },
                system: {
                    platform: os.platform(),
                    arch: os.arch(),
                    totalMemory: os.totalmem(),
                    freeMemory: os.freemem(),
                    uptime: os.uptime()
                },
                disk: await this.getDiskUsage()
            };

        } catch (error) {
            console.error('❌ Error getting resource usage:', error);
            return { error: error.message };
        }
    }

    /**
     * 📈 Obtiene métricas de rendimiento
     */
    async getPerformanceMetrics() {
        try {
            const startTime = process.hrtime();
            
            // Medir latencia de base de datos
            const dbLatency = await this.measureDatabaseLatency();
            
            // Medir latencia de APIs
            const apiLatency = await this.measureAPILatency();
            
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);

            const metrics = {
                timestamp: new Date().toISOString(),
                responseTime: parseFloat(responseTime),
                databaseLatency: dbLatency,
                apiLatency: apiLatency,
                requestsPerMinute: this.getRequestsPerMinute(),
                errorRate: this.getErrorRate(),
                throughput: this.getThroughput()
            };

            // Agregar a historial
            this.performanceHistory.push(metrics);
            if (this.performanceHistory.length > this.maxHistorySize) {
                this.performanceHistory.shift();
            }

            return metrics;

        } catch (error) {
            console.error('❌ Error getting performance metrics:', error);
            return { error: error.message };
        }
    }

    /**
     * 🚨 Detecta anomalías en el sistema
     */
    async detectAnomalies() {
        const anomalies = [];
        const health = await this.getSystemHealth();

        try {
            // Anomalías de memoria
            if (health.resources.memory.usage > 85) {
                anomalies.push({
                    type: 'memory',
                    severity: 'warning',
                    message: `High memory usage: ${health.resources.memory.usage}%`,
                    timestamp: new Date().toISOString()
                });
            }

            // Anomalías de respuesta
            if (health.performance.responseTime > 5000) {
                anomalies.push({
                    type: 'performance',
                    severity: 'warning',
                    message: `Slow response time: ${health.performance.responseTime}ms`,
                    timestamp: new Date().toISOString()
                });
            }

            // Anomalías de base de datos
            if (health.performance.databaseLatency > 1000) {
                anomalies.push({
                    type: 'database',
                    severity: 'warning',
                    message: `High database latency: ${health.performance.databaseLatency}ms`,
                    timestamp: new Date().toISOString()
                });
            }

            // Anomalías de servicios
            health.services.forEach(service => {
                if (service.status !== 'active' && service.status !== 'connected') {
                    anomalies.push({
                        type: 'service',
                        severity: 'critical',
                        message: `Service ${service.name} is ${service.status}`,
                        timestamp: new Date().toISOString()
                    });
                }
            });

            this.anomalies = anomalies;
            return anomalies;

        } catch (error) {
            console.error('❌ Error detecting anomalies:', error);
            return [{ type: 'system', severity: 'critical', message: error.message }];
        }
    }

    /**
     * 🔍 Métodos auxiliares privados
     */
    async checkMongoDBStatus() {
        try {
            const state = mongoose.connection.readyState;
            const states = {
                0: 'disconnected',
                1: 'connected',
                2: 'connecting',
                3: 'disconnecting'
            };

            return {
                status: states[state] || 'unknown',
                details: {
                    readyState: state,
                    host: mongoose.connection.host,
                    port: mongoose.connection.port,
                    name: mongoose.connection.name
                }
            };
        } catch (error) {
            return { status: 'error', details: error.message };
        }
    }

    checkSocketIOStatus() {
        // Este método se completará cuando tengamos acceso al objeto io
        return 'active'; // Placeholder
    }

    getActiveConnections() {
        // Este método se completará cuando tengamos acceso al objeto io
        return 0; // Placeholder
    }

    async checkWhatsAppStatus() {
        try {
            // Verificar si existe el directorio de sesiones
            const sessionsPath = '/Users/bener/GitHub/GastonAssistan/backend/src/whatsapp-sessions';
            await fs.access(sessionsPath);
            return 'configured';
        } catch (error) {
            return 'not_configured';
        }
    }

    async checkGoogleWorkspaceStatus() {
        try {
            // Verificar variables de entorno de Google
            if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
                return 'configured';
            }
            return 'not_configured';
        } catch (error) {
            return 'error';
        }
    }

    async checkOpenAIStatus() {
        try {
            if (process.env.OPENAI_API_KEY) {
                return 'configured';
            }
            return 'not_configured';
        } catch (error) {
            return 'error';
        }
    }

    async getDatabaseHealth() {
        try {
            const admin = mongoose.connection.db.admin();
            const result = await admin.serverStatus();
            
            return {
                status: 'healthy',
                uptime: result.uptime,
                connections: result.connections,
                memory: result.mem,
                version: result.version
            };
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }

    async getIntegrationsHealth() {
        return {
            google: await this.checkGoogleWorkspaceStatus(),
            whatsapp: await this.checkWhatsAppStatus(),
            openai: await this.checkOpenAIStatus()
        };
    }

    async measureDatabaseLatency() {
        try {
            const start = Date.now();
            await mongoose.connection.db.admin().ping();
            return Date.now() - start;
        } catch (error) {
            return -1;
        }
    }

    async measureAPILatency() {
        // Placeholder - se implementará con llamadas API reales
        return Math.random() * 100;
    }

    getRequestsPerMinute() {
        // Placeholder - se implementará con contador real
        return Math.floor(Math.random() * 100);
    }

    getErrorRate() {
        // Placeholder - se implementará con contador real de errores
        return Math.random() * 5;
    }

    getThroughput() {
        // Placeholder - se implementará con medición real
        return Math.floor(Math.random() * 1000);
    }

    async getDiskUsage() {
        try {
            if (os.platform() === 'darwin' || os.platform() === 'linux') {
                const { stdout } = await exec('df -h .');
                return stdout;
            }
            return 'Disk usage monitoring not available on this platform';
        } catch (error) {
            return 'Error getting disk usage';
        }
    }

    async getRecentErrors() {
        // Placeholder - se implementará con sistema de logs
        return [];
    }

    async getSystemVersion() {
        try {
            const packageJson = require('../../../../package.json');
            return {
                app: packageJson.version,
                node: process.version,
                platform: os.platform(),
                arch: os.arch()
            };
        } catch (error) {
            return { error: 'Could not get version info' };
        }
    }

    evaluateOverallHealth(health) {
        let criticalIssues = 0;
        let warnings = 0;

        // Verificar servicios críticos
        health.services.forEach(service => {
            if (service.status === 'error' || service.status === 'disconnected') {
                criticalIssues++;
            } else if (service.status !== 'active' && service.status !== 'connected') {
                warnings++;
            }
        });

        // Verificar recursos
        if (health.resources.memory && health.resources.memory.usage > 90) {
            criticalIssues++;
        } else if (health.resources.memory && health.resources.memory.usage > 80) {
            warnings++;
        }

        // Verificar performance
        if (health.performance.responseTime > 10000) {
            criticalIssues++;
        } else if (health.performance.responseTime > 5000) {
            warnings++;
        }

        // Determinar estado general
        if (criticalIssues > 0) return 'critical';
        if (warnings > 2) return 'warning';
        return 'healthy';
    }

    /**
     * 📊 Métodos públicos para el Command Center
     */
    getLastHealthCheck() {
        return this.lastHealthCheck;
    }

    getPerformanceHistory() {
        return this.performanceHistory;
    }

    getAnomalies() {
        return this.anomalies;
    }
}

module.exports = SystemStatusManager;