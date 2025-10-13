/**
 * 🔧 Eva Command Center - Integration Controller
 * 
 * Controla y gestiona todas las integraciones del sistema
 * Activa/desactiva servicios, configura parámetros y monitorea conexiones
 * 
 * Parte de: Fase 1 - Command Center
 * Autor: Eva System Control
 * Fecha: Octubre 12, 2025
 */

const fs = require('fs').promises;
const path = require('path');

class IntegrationController {
    constructor() {
        this.integrations = new Map();
        this.configurations = new Map();
        this.status = new Map();
        this.lastSync = null;
        
        // Definir integraciones disponibles
        this.availableIntegrations = {
            'google-workspace': {
                name: 'Google Workspace',
                type: 'external-api',
                services: ['gmail', 'calendar', 'drive'],
                required: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
                optional: ['GOOGLE_REDIRECT_URI']
            },
            'openai': {
                name: 'OpenAI Integration',
                type: 'ai-service',
                services: ['chat', 'voice', 'vision'],
                required: ['OPENAI_API_KEY'],
                optional: ['OPENAI_ORGANIZATION']
            },
            'whatsapp-web': {
                name: 'WhatsApp Web',
                type: 'messaging',
                services: ['messages', 'media', 'groups'],
                required: [],
                optional: ['WHATSAPP_SESSION_NAME']
            },
            'mongodb': {
                name: 'MongoDB Database',
                type: 'database',
                services: ['storage', 'queries', 'aggregations'],
                required: ['MONGODB_URI'],
                optional: ['MONGODB_OPTIONS']
            },
            'socketio': {
                name: 'Socket.IO Realtime',
                type: 'realtime',
                services: ['websockets', 'events', 'rooms'],
                required: [],
                optional: ['SOCKETIO_CORS_ORIGIN']
            }
        };

        this.initializeIntegrations();
    }

    /**
     * 🚀 Inicializa todas las integraciones
     */
    async initializeIntegrations() {
        console.log('🔧 Initializing Integration Controller...');
        
        for (const [key, integration] of Object.entries(this.availableIntegrations)) {
            await this.registerIntegration(key, integration);
        }

        console.log(`✅ Integration Controller initialized with ${this.integrations.size} integrations`);
    }

    /**
     * 📋 Registra una integración
     */
    async registerIntegration(key, config) {
        try {
            const status = await this.checkIntegrationStatus(key, config);
            
            this.integrations.set(key, {
                ...config,
                key,
                status: status.status,
                lastCheck: new Date().toISOString(),
                enabled: status.enabled,
                configuration: status.configuration
            });

            this.status.set(key, status);
            
        } catch (error) {
            console.error(`❌ Error registering integration ${key}:`, error);
            this.integrations.set(key, {
                ...config,
                key,
                status: 'error',
                lastCheck: new Date().toISOString(),
                enabled: false,
                error: error.message
            });
        }
    }

    /**
     * 📊 Obtiene el estado de todas las integraciones
     */
    async getIntegrationsStatus() {
        const result = {
            timestamp: new Date().toISOString(),
            totalIntegrations: this.integrations.size,
            activeIntegrations: 0,
            integrations: {}
        };

        for (const [key, integration] of this.integrations) {
            const currentStatus = await this.checkIntegrationStatus(key, integration);
            
            result.integrations[key] = {
                name: integration.name,
                type: integration.type,
                status: currentStatus.status,
                enabled: currentStatus.enabled,
                services: integration.services,
                lastCheck: currentStatus.lastCheck,
                configuration: currentStatus.configuration,
                errors: currentStatus.errors || []
            };

            if (currentStatus.enabled && currentStatus.status === 'active') {
                result.activeIntegrations++;
            }
        }

        return result;
    }

    /**
     * 🔍 Verifica el estado de una integración específica
     */
    async checkIntegrationStatus(key, integration) {
        const timestamp = new Date().toISOString();
        
        try {
            switch (key) {
                case 'google-workspace':
                    return await this.checkGoogleWorkspaceStatus(integration);
                
                case 'openai':
                    return await this.checkOpenAIStatus(integration);
                
                case 'whatsapp-web':
                    return await this.checkWhatsAppStatus(integration);
                
                case 'mongodb':
                    return await this.checkMongoDBStatus(integration);
                
                case 'socketio':
                    return await this.checkSocketIOStatus(integration);
                
                default:
                    return {
                        status: 'unknown',
                        enabled: false,
                        lastCheck: timestamp,
                        message: 'Unknown integration type'
                    };
            }
        } catch (error) {
            return {
                status: 'error',
                enabled: false,
                lastCheck: timestamp,
                error: error.message,
                errors: [error.message]
            };
        }
    }

    /**
     * ⚡ Activa una integración
     */
    async enableIntegration(key) {
        try {
            if (!this.integrations.has(key)) {
                throw new Error(`Integration ${key} not found`);
            }

            const integration = this.integrations.get(key);
            
            // Verificar requisitos
            const missingRequirements = await this.checkRequirements(key, integration);
            if (missingRequirements.length > 0) {
                throw new Error(`Missing requirements: ${missingRequirements.join(', ')}`);
            }

            // Activar integración
            const result = await this.activateIntegration(key, integration);
            
            // Actualizar estado
            integration.enabled = true;
            integration.status = 'active';
            integration.lastCheck = new Date().toISOString();
            
            this.integrations.set(key, integration);

            console.log(`✅ Integration ${key} enabled successfully`);
            return { success: true, message: `Integration ${key} enabled`, details: result };

        } catch (error) {
            console.error(`❌ Error enabling integration ${key}:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🛑 Desactiva una integración
     */
    async disableIntegration(key) {
        try {
            if (!this.integrations.has(key)) {
                throw new Error(`Integration ${key} not found`);
            }

            const integration = this.integrations.get(key);
            
            // Desactivar integración
            const result = await this.deactivateIntegration(key, integration);
            
            // Actualizar estado
            integration.enabled = false;
            integration.status = 'disabled';
            integration.lastCheck = new Date().toISOString();
            
            this.integrations.set(key, integration);

            console.log(`🛑 Integration ${key} disabled successfully`);
            return { success: true, message: `Integration ${key} disabled`, details: result };

        } catch (error) {
            console.error(`❌ Error disabling integration ${key}:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * ⚙️ Configura una integración
     */
    async configureIntegration(key, config) {
        try {
            if (!this.integrations.has(key)) {
                throw new Error(`Integration ${key} not found`);
            }

            const integration = this.integrations.get(key);
            
            // Validar configuración
            const validation = await this.validateConfiguration(key, config);
            if (!validation.valid) {
                throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
            }

            // Aplicar configuración
            const result = await this.applyConfiguration(key, config);
            
            // Actualizar configuración
            integration.configuration = { ...integration.configuration, ...config };
            integration.lastCheck = new Date().toISOString();
            
            this.integrations.set(key, integration);
            this.configurations.set(key, config);

            console.log(`⚙️ Integration ${key} configured successfully`);
            return { success: true, message: `Integration ${key} configured`, details: result };

        } catch (error) {
            console.error(`❌ Error configuring integration ${key}:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🔄 Reinicia una integración
     */
    async restartIntegration(key) {
        try {
            console.log(`🔄 Restarting integration ${key}...`);
            
            // Desactivar
            await this.disableIntegration(key);
            
            // Esperar un momento
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Reactivar
            const result = await this.enableIntegration(key);
            
            console.log(`✅ Integration ${key} restarted successfully`);
            return result;

        } catch (error) {
            console.error(`❌ Error restarting integration ${key}:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🔍 Métodos de verificación específicos
     */
    async checkGoogleWorkspaceStatus(integration) {
        const requiredVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
        const missing = requiredVars.filter(envVar => !process.env[envVar]);
        
        return {
            status: missing.length === 0 ? 'configured' : 'not_configured',
            enabled: missing.length === 0,
            lastCheck: new Date().toISOString(),
            configuration: {
                clientId: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
                clientSecret: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
                redirectUri: process.env.GOOGLE_REDIRECT_URI || 'Default'
            },
            missingRequirements: missing
        };
    }

    async checkOpenAIStatus(integration) {
        const hasApiKey = !!process.env.OPENAI_API_KEY;
        
        return {
            status: hasApiKey ? 'configured' : 'not_configured',
            enabled: hasApiKey,
            lastCheck: new Date().toISOString(),
            configuration: {
                apiKey: hasApiKey ? '✅ Set' : '❌ Missing',
                organization: process.env.OPENAI_ORGANIZATION || 'Not set'
            },
            missingRequirements: hasApiKey ? [] : ['OPENAI_API_KEY']
        };
    }

    async checkWhatsAppStatus(integration) {
        try {
            const sessionsPath = path.join(__dirname, '../../../whatsapp-sessions');
            await fs.access(sessionsPath);
            
            return {
                status: 'configured',
                enabled: true,
                lastCheck: new Date().toISOString(),
                configuration: {
                    sessionsPath: '✅ Available',
                    sessionName: process.env.WHATSAPP_SESSION_NAME || 'default'
                }
            };
        } catch (error) {
            return {
                status: 'not_configured',
                enabled: false,
                lastCheck: new Date().toISOString(),
                configuration: {
                    sessionsPath: '❌ Not found'
                },
                error: 'Sessions directory not found'
            };
        }
    }

    async checkMongoDBStatus(integration) {
        const mongoose = require('mongoose');
        const hasUri = !!process.env.MONGODB_URI;
        const isConnected = mongoose.connection.readyState === 1;
        
        return {
            status: hasUri && isConnected ? 'active' : 'not_configured',
            enabled: hasUri && isConnected,
            lastCheck: new Date().toISOString(),
            configuration: {
                uri: hasUri ? '✅ Set' : '❌ Missing',
                connection: isConnected ? '✅ Connected' : '❌ Disconnected',
                readyState: mongoose.connection.readyState
            },
            missingRequirements: hasUri ? [] : ['MONGODB_URI']
        };
    }

    async checkSocketIOStatus(integration) {
        return {
            status: 'active',
            enabled: true,
            lastCheck: new Date().toISOString(),
            configuration: {
                cors: process.env.SOCKETIO_CORS_ORIGIN || 'Default',
                status: '✅ Active'
            }
        };
    }

    /**
     * 🛠️ Métodos auxiliares
     */
    async checkRequirements(key, integration) {
        const missing = [];
        
        if (integration.required) {
            for (const requirement of integration.required) {
                if (!process.env[requirement]) {
                    missing.push(requirement);
                }
            }
        }
        
        return missing;
    }

    async activateIntegration(key, integration) {
        // Placeholder - implementar lógica específica de activación
        return { activated: true, timestamp: new Date().toISOString() };
    }

    async deactivateIntegration(key, integration) {
        // Placeholder - implementar lógica específica de desactivación
        return { deactivated: true, timestamp: new Date().toISOString() };
    }

    async validateConfiguration(key, config) {
        // Placeholder - implementar validación específica
        return { valid: true, errors: [] };
    }

    async applyConfiguration(key, config) {
        // Placeholder - implementar aplicación de configuración
        return { applied: true, timestamp: new Date().toISOString() };
    }

    /**
     * 📊 Métodos públicos para el Command Center
     */
    getIntegration(key) {
        return this.integrations.get(key);
    }

    getAllIntegrations() {
        return Array.from(this.integrations.values());
    }

    getIntegrationConfiguration(key) {
        return this.configurations.get(key);
    }
}

module.exports = IntegrationController;