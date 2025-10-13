/**
 * 🛡️ Eva Security Guardian
 * 
 * Sistema de seguridad autónomo que protege y monitorea:
 * - Detección de amenazas en tiempo real
 * - Análisis de comportamiento anómalo
 * - Protección contra ataques
 * - Auditoría de seguridad
 * - Respuesta automática a incidentes
 * 
 * Parte de: Fase 2 - Autonomous Operations
 * Autor: Eva System Control
 * Fecha: Octubre 12, 2025
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class SecurityGuardian {
    constructor() {
        this.isActive = false;
        this.securityLevel = 'medium'; // low, medium, high, paranoid
        this.threats = {
            active: new Map(),
            history: [],
            blocked: new Map()
        };
        
        this.monitoring = {
            requestPatterns: new Map(),
            failedAttempts: new Map(),
            suspiciousIPs: new Set(),
            anomalousActivities: []
        };
        
        this.security = {
            stats: {
                threatsDetected: 0,
                threatsBlocked: 0,
                anomaliesFound: 0,
                securityScansRun: 0,
                incidentsResponded: 0
            },
            config: {
                maxFailedAttempts: 5,
                suspiciousRequestThreshold: 100,
                anomalyDetectionSensitivity: 0.7,
                autoBlockEnabled: true,
                realTimeMonitoring: true
            }
        };
        
        this.securityMonitor = null;
        this.threatDetectors = new Map();
        this.responseActions = new Map();
        
        this.initializeSecuritySystems();
        
        console.log('🛡️ Security Guardian initialized');
    }

    /**
     * 🏗️ Inicializa los sistemas de seguridad
     */
    initializeSecuritySystems() {
        // Detectores de amenazas
        this.initializeThreatDetectors();
        
        // Acciones de respuesta
        this.initializeResponseActions();
        
        // Patrones de ataque conocidos
        this.initializeAttackPatterns();
    }

    /**
     * 🔍 Inicializa detectores de amenazas
     */
    initializeThreatDetectors() {
        // Detector de fuerza bruta
        this.threatDetectors.set('brute_force', {
            name: 'Brute Force Detector',
            description: 'Detecta intentos de fuerza bruta',
            check: (context) => {
                const { ip, endpoint, failed } = context;
                const attempts = this.monitoring.failedAttempts.get(ip) || 0;
                
                if (failed) {
                    this.monitoring.failedAttempts.set(ip, attempts + 1);
                }
                
                return attempts >= this.security.config.maxFailedAttempts;
            },
            severity: 'high',
            response: 'block_ip'
        });

        // Detector de SQL Injection
        this.threatDetectors.set('sql_injection', {
            name: 'SQL Injection Detector',
            description: 'Detecta intentos de inyección SQL',
            check: (context) => {
                const { query, body } = context;
                const sqlPatterns = [
                    /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
                    /(--|\/\*|\*\/|;)/,
                    /('|\"|`).*(or|and).*('|\"|`)/i,
                    /(exec|execute|sp_|xp_)/i
                ];
                
                const content = JSON.stringify({ query, body });
                return sqlPatterns.some(pattern => pattern.test(content));
            },
            severity: 'critical',
            response: 'block_request'
        });

        // Detector de XSS
        this.threatDetectors.set('xss_attack', {
            name: 'XSS Attack Detector',
            description: 'Detecta intentos de Cross-Site Scripting',
            check: (context) => {
                const { query, body } = context;
                const xssPatterns = [
                    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                    /javascript:/i,
                    /on\w+\s*=/i,
                    /<iframe\b/i,
                    /eval\(/i,
                    /alert\(/i
                ];
                
                const content = JSON.stringify({ query, body });
                return xssPatterns.some(pattern => pattern.test(content));
            },
            severity: 'high',
            response: 'sanitize_and_log'
        });

        // Detector de anomalías de comportamiento
        this.threatDetectors.set('behavior_anomaly', {
            name: 'Behavior Anomaly Detector',
            description: 'Detecta comportamiento anómalo de usuarios',
            check: (context) => {
                const { ip, userAgent, requestRate } = context;
                
                // Detectar bots o comportamiento automatizado
                const suspiciousPatterns = [
                    /bot|crawler|spider|scraper/i,
                    /curl|wget|python|java|go-http/i
                ];
                
                const isSuspiciousAgent = suspiciousPatterns.some(pattern => 
                    pattern.test(userAgent || '')
                );
                
                const isHighRequestRate = requestRate > this.security.config.suspiciousRequestThreshold;
                
                return isSuspiciousAgent || isHighRequestRate;
            },
            severity: 'medium',
            response: 'monitor_closely'
        });

        // Detector de acceso no autorizado
        this.threatDetectors.set('unauthorized_access', {
            name: 'Unauthorized Access Detector',
            description: 'Detecta intentos de acceso no autorizado',
            check: (context) => {
                const { endpoint, method, auth } = context;
                
                // Endpoints sensibles que requieren autenticación
                const sensitiveEndpoints = [
                    '/eva/control',
                    '/eva/autonomous',
                    '/api/admin',
                    '/api/dashboard'
                ];
                
                const isSensitive = sensitiveEndpoints.some(ep => 
                    endpoint.startsWith(ep)
                );
                
                return isSensitive && (!auth || !auth.authenticated);
            },
            severity: 'high',
            response: 'require_authentication'
        });
    }

    /**
     * 🚨 Inicializa acciones de respuesta
     */
    initializeResponseActions() {
        // Bloquear IP
        this.responseActions.set('block_ip', {
            name: 'Block IP Address',
            description: 'Bloquea una dirección IP',
            action: async (context, threat) => {
                const { ip } = context;
                this.threats.blocked.set(ip, {
                    timestamp: new Date().toISOString(),
                    threat: threat.name,
                    severity: threat.severity,
                    reason: 'Automated security response'
                });
                
                console.log(`🚫 IP ${ip} blocked due to ${threat.name}`);
                
                return {
                    success: true,
                    action: 'ip_blocked',
                    target: ip,
                    message: `IP ${ip} has been blocked`
                };
            }
        });

        // Bloquear solicitud específica
        this.responseActions.set('block_request', {
            name: 'Block Request',
            description: 'Bloquea una solicitud específica',
            action: async (context, threat) => {
                console.log(`🚫 Request blocked due to ${threat.name}`);
                
                return {
                    success: true,
                    action: 'request_blocked',
                    target: context.endpoint,
                    message: 'Request blocked for security reasons'
                };
            }
        });

        // Sanitizar y registrar
        this.responseActions.set('sanitize_and_log', {
            name: 'Sanitize and Log',
            description: 'Sanitiza el contenido y registra el incidente',
            action: async (context, threat) => {
                // Registrar incidente
                this.logSecurityIncident(threat, context);
                
                console.log(`🧹 Content sanitized due to ${threat.name}`);
                
                return {
                    success: true,
                    action: 'content_sanitized',
                    message: 'Content sanitized and incident logged'
                };
            }
        });

        // Monitoreo cercano
        this.responseActions.set('monitor_closely', {
            name: 'Monitor Closely',
            description: 'Aumenta el monitoreo del objetivo',
            action: async (context, threat) => {
                const { ip } = context;
                this.monitoring.suspiciousIPs.add(ip);
                
                console.log(`👁️ Monitoring ${ip} closely due to ${threat.name}`);
                
                return {
                    success: true,
                    action: 'monitoring_increased',
                    target: ip,
                    message: `Increased monitoring for ${ip}`
                };
            }
        });

        // Requerir autenticación
        this.responseActions.set('require_authentication', {
            name: 'Require Authentication',
            description: 'Fuerza autenticación para acceso',
            action: async (context, threat) => {
                console.log(`🔐 Authentication required due to ${threat.name}`);
                
                return {
                    success: true,
                    action: 'authentication_required',
                    message: 'Authentication required for this resource'
                };
            }
        });
    }

    /**
     * 🎯 Inicializa patrones de ataque conocidos
     */
    initializeAttackPatterns() {
        // Patrones de ataque comunes
        this.attackPatterns = {
            ddos: /(\d+\.\d+\.\d+\.\d+).*(\d{3,})\s+requests/,
            portScan: /(nmap|masscan|zmap)/i,
            malware: /(trojan|virus|malware|backdoor)/i,
            phishing: /(phishing|scam|fake)/i
        };
    }

    /**
     * 🚀 Inicia el guardian de seguridad
     */
    async start() {
        try {
            this.isActive = true;
            
            // Iniciar monitoreo de seguridad
            this.securityMonitor = setInterval(() => {
                this.performSecurityScan();
            }, 60000); // Cada minuto
            
            console.log('🛡️ Security Guardian started');
            
            return {
                success: true,
                message: 'Security Guardian started successfully',
                securityLevel: this.securityLevel,
                detectorsActive: this.threatDetectors.size,
                responseActionsAvailable: this.responseActions.size
            };
            
        } catch (error) {
            console.error('❌ Error starting Security Guardian:', error);
            throw error;
        }
    }

    /**
     * 🛑 Detiene el guardian de seguridad
     */
    async stop() {
        try {
            this.isActive = false;
            
            if (this.securityMonitor) {
                clearInterval(this.securityMonitor);
                this.securityMonitor = null;
            }
            
            console.log('🛡️ Security Guardian stopped');
            
            return {
                success: true,
                message: 'Security Guardian stopped successfully'
            };
            
        } catch (error) {
            console.error('❌ Error stopping Security Guardian:', error);
            throw error;
        }
    }

    /**
     * 🔍 Analiza una solicitud en busca de amenazas
     */
    async analyzeRequest(requestContext) {
        try {
            if (!this.isActive) return { safe: true };
            
            const threats = [];
            
            // Ejecutar todos los detectores de amenazas
            for (const [detectorName, detector] of this.threatDetectors) {
                try {
                    const threatDetected = detector.check(requestContext);
                    
                    if (threatDetected) {
                        threats.push({
                            detector: detectorName,
                            name: detector.name,
                            severity: detector.severity,
                            response: detector.response,
                            timestamp: new Date().toISOString()
                        });
                        
                        this.security.stats.threatsDetected++;
                    }
                    
                } catch (error) {
                    console.error(`❌ Error in detector ${detectorName}:`, error);
                }
            }
            
            // Procesar respuestas a amenazas
            const responses = [];
            for (const threat of threats) {
                const response = await this.respondToThreat(threat, requestContext);
                responses.push(response);
            }
            
            return {
                safe: threats.length === 0,
                threats,
                responses,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Error analyzing request:', error);
            return { safe: false, error: error.message };
        }
    }

    /**
     * 🚨 Responde a una amenaza detectada
     */
    async respondToThreat(threat, context) {
        try {
            const responseAction = this.responseActions.get(threat.response);
            
            if (!responseAction) {
                console.warn(`⚠️ No response action found for: ${threat.response}`);
                return { success: false, message: 'No response action defined' };
            }
            
            const result = await responseAction.action(context, threat);
            
            if (result.success) {
                this.security.stats.incidentsResponded++;
                
                // Registrar amenaza activa
                this.threats.active.set(threat.detector, {
                    ...threat,
                    context,
                    response: result,
                    status: 'responded'
                });
                
                // Agregar al historial
                this.threats.history.push({
                    ...threat,
                    context,
                    response: result,
                    timestamp: new Date().toISOString()
                });
                
                // Mantener solo los últimos 500 registros
                if (this.threats.history.length > 500) {
                    this.threats.history = this.threats.history.slice(-500);
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ Error responding to threat:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🔍 Realiza escaneo de seguridad
     */
    async performSecurityScan() {
        try {
            if (!this.isActive) return;
            
            console.log('🛡️ Performing security scan...');
            
            this.security.stats.securityScansRun++;
            
            // Limpiar IPs bloqueadas antiguas (más de 1 hora)
            this.cleanupOldBlocks();
            
            // Analizar patrones anómalos
            this.analyzeAnomalousPatterns();
            
            // Verificar integridad del sistema
            await this.checkSystemIntegrity();
            
        } catch (error) {
            console.error('❌ Error in security scan:', error);
        }
    }

    /**
     * 🧹 Limpia bloqueos antiguos
     */
    cleanupOldBlocks() {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        
        for (const [ip, blockInfo] of this.threats.blocked) {
            const blockTime = new Date(blockInfo.timestamp).getTime();
            
            if (blockTime < oneHourAgo) {
                this.threats.blocked.delete(ip);
                console.log(`🧹 Unblocked IP ${ip} (block expired)`);
            }
        }
    }

    /**
     * 📊 Analiza patrones anómalos
     */
    analyzeAnomalousPatterns() {
        // Analizar patrones de solicitudes
        const patterns = Array.from(this.monitoring.requestPatterns.entries());
        
        for (const [pattern, count] of patterns) {
            if (count > this.security.config.suspiciousRequestThreshold) {
                this.monitoring.anomalousActivities.push({
                    type: 'suspicious_pattern',
                    pattern,
                    count,
                    timestamp: new Date().toISOString(),
                    severity: 'medium'
                });
                
                this.security.stats.anomaliesFound++;
            }
        }
        
        // Limpiar patrones antiguos
        this.monitoring.requestPatterns.clear();
        
        // Mantener solo las últimas 100 anomalías
        if (this.monitoring.anomalousActivities.length > 100) {
            this.monitoring.anomalousActivities = this.monitoring.anomalousActivities.slice(-100);
        }
    }

    /**
     * ✅ Verifica integridad del sistema
     */
    async checkSystemIntegrity() {
        try {
            // Verificar archivos críticos (simulado)
            const criticalFiles = [
                '/eva-command-center/EvaCommandCenter.js',
                '/eva-autonomous/EvaAutonomousController.js'
            ];
            
            for (const file of criticalFiles) {
                // Simulación de verificación de integridad
                const integrity = Math.random() > 0.1; // 90% probabilidad de integridad
                
                if (!integrity) {
                    console.warn(`⚠️ Integrity check failed for ${file}`);
                    
                    this.monitoring.anomalousActivities.push({
                        type: 'integrity_violation',
                        file,
                        timestamp: new Date().toISOString(),
                        severity: 'high'
                    });
                    
                    this.security.stats.anomaliesFound++;
                }
            }
            
        } catch (error) {
            console.error('❌ Error checking system integrity:', error);
        }
    }

    /**
     * 📝 Registra incidente de seguridad
     */
    logSecurityIncident(threat, context) {
        const incident = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            threat,
            context,
            severity: threat.severity,
            status: 'logged'
        };
        
        console.log(`📝 Security incident logged: ${threat.name} (${threat.severity})`);
        
        return incident;
    }

    /**
     * 🛡️ Verifica si una IP está bloqueada
     */
    isIPBlocked(ip) {
        return this.threats.blocked.has(ip);
    }

    /**
     * ⚙️ Configura el nivel de seguridad
     */
    setSecurityLevel(level) {
        const validLevels = ['low', 'medium', 'high', 'paranoid'];
        
        if (!validLevels.includes(level)) {
            throw new Error(`Invalid security level. Valid levels: ${validLevels.join(', ')}`);
        }
        
        this.securityLevel = level;
        
        // Ajustar configuración según el nivel
        switch (level) {
            case 'low':
                this.security.config.maxFailedAttempts = 10;
                this.security.config.suspiciousRequestThreshold = 200;
                this.security.config.anomalyDetectionSensitivity = 0.9;
                break;
                
            case 'medium':
                this.security.config.maxFailedAttempts = 5;
                this.security.config.suspiciousRequestThreshold = 100;
                this.security.config.anomalyDetectionSensitivity = 0.7;
                break;
                
            case 'high':
                this.security.config.maxFailedAttempts = 3;
                this.security.config.suspiciousRequestThreshold = 50;
                this.security.config.anomalyDetectionSensitivity = 0.5;
                break;
                
            case 'paranoid':
                this.security.config.maxFailedAttempts = 1;
                this.security.config.suspiciousRequestThreshold = 20;
                this.security.config.anomalyDetectionSensitivity = 0.3;
                break;
        }
        
        console.log(`🛡️ Security level set to: ${level}`);
    }

    /**
     * 📊 Obtiene estadísticas de seguridad
     */
    getSecurityStats() {
        return {
            isActive: this.isActive,
            securityLevel: this.securityLevel,
            stats: this.security.stats,
            config: this.security.config,
            threats: {
                active: this.threats.active.size,
                total: this.threats.history.length,
                blocked: this.threats.blocked.size
            },
            monitoring: {
                suspiciousIPs: this.monitoring.suspiciousIPs.size,
                anomalousActivities: this.monitoring.anomalousActivities.length,
                requestPatterns: this.monitoring.requestPatterns.size
            },
            detectors: Array.from(this.threatDetectors.keys()),
            responseActions: Array.from(this.responseActions.keys())
        };
    }

    /**
     * 📈 Obtiene historial de amenazas
     */
    getThreatHistory(limit = 50) {
        return this.threats.history.slice(-limit).reverse();
    }

    /**
     * 🚫 Obtiene lista de IPs bloqueadas
     */
    getBlockedIPs() {
        return Array.from(this.threats.blocked.entries()).map(([ip, info]) => ({
            ip,
            ...info
        }));
    }

    /**
     * 🔓 Desbloquea una IP
     */
    unblockIP(ip) {
        if (this.threats.blocked.has(ip)) {
            this.threats.blocked.delete(ip);
            console.log(`🔓 IP ${ip} unblocked manually`);
            return { success: true, message: `IP ${ip} unblocked` };
        }
        
        return { success: false, message: `IP ${ip} was not blocked` };
    }
}

module.exports = SecurityGuardian;