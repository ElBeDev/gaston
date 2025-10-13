/**
 * 📧 Eva Email Autonomous Service
 * 
 * Servicio autónomo para el manejo de correos electrónicos
 * Integra las capacidades de Gmail con el sistema autónomo de Eva
 * 
 * Parte de: Fase 2 - Autonomous Operations
 * Autor: Eva System Control
 * Fecha: Octubre 12, 2025
 */

const googleAuthService = require('../../services/googleAuthService');

class EvaEmailService {
    constructor() {
        this.isActive = false;
        this.emailCapabilities = [
            'send_email',
            'read_inbox',
            'manage_labels',
            'auto_reply',
            'smart_filtering',
            'email_analysis'
        ];
        
        this.automationRules = new Map();
        this.emailStats = {
            sentEmails: 0,
            readEmails: 0,
            autoReplies: 0,
            processedEmails: 0
        };
        
        this.initializeAutomationRules();
        
        console.log('📧 Eva Email Service initialized');
    }

    /**
     * 🏗️ Inicializa reglas de automatización
     */
    initializeAutomationRules() {
        // Regla de respuesta automática
        this.automationRules.set('auto_reply', {
            enabled: true,
            condition: (email) => email.subject?.toLowerCase().includes('urgent'),
            action: 'send_auto_reply',
            template: 'urgent_received'
        });

        // Regla de clasificación inteligente
        this.automationRules.set('smart_classification', {
            enabled: true,
            condition: (email) => this.classifyEmailImportance(email),
            action: 'classify_and_label',
            priority: 'high'
        });
    }

    /**
     * 📧 Envía un email de forma autónoma
     */
    async sendEmailAutonomous(emailRequest) {
        try {
            console.log('📧 Eva sending autonomous email...');
            
            const { to, subject, body, priority = 'normal', sessionTokens } = emailRequest;
            
            if (!sessionTokens) {
                throw new Error('No authentication tokens available');
            }

            const gmail = googleAuthService.getGmailClient(sessionTokens);
            
            // Construir el email
            const email = this.buildEmailMessage({
                to: Array.isArray(to) ? to : [to],
                subject: subject || 'Eva Autonomous Message',
                body: body || 'This message was sent autonomously by Eva.',
                priority
            });

            // Enviar el email
            const result = await gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: Buffer.from(email).toString('base64url')
                }
            });

            this.emailStats.sentEmails++;
            
            console.log(`✅ Email sent autonomously - ID: ${result.data.id}`);
            
            return {
                success: true,
                messageId: result.data.id,
                timestamp: new Date().toISOString(),
                recipients: to,
                subject,
                sentBy: 'eva_autonomous'
            };

        } catch (error) {
            console.error('❌ Error sending autonomous email:', error);
            throw error;
        }
    }

    /**
     * 📥 Lee emails de forma autónoma
     */
    async readEmailsAutonomous(criteria = {}) {
        try {
            console.log('📥 Eva reading emails autonomously...');
            
            const { sessionTokens, folder = 'INBOX', maxResults = 10, filter } = criteria;
            
            if (!sessionTokens) {
                throw new Error('No authentication tokens available');
            }

            const gmail = googleAuthService.getGmailClient(sessionTokens);
            
            // Obtener lista de mensajes
            const response = await gmail.users.messages.list({
                userId: 'me',
                labelIds: [folder],
                maxResults,
                q: filter // Query de búsqueda opcional
            });

            if (!response.data.messages) {
                return { emails: [], count: 0 };
            }

            // Obtener detalles de cada mensaje
            const emails = await Promise.all(
                response.data.messages.map(async (message) => {
                    const msgDetails = await gmail.users.messages.get({
                        userId: 'me',
                        id: message.id,
                        format: 'full'
                    });

                    return this.parseEmailMessage(msgDetails.data);
                })
            );

            this.emailStats.readEmails += emails.length;
            
            // Procesar emails con reglas de automatización
            for (const email of emails) {
                await this.processEmailWithRules(email, sessionTokens);
            }

            console.log(`✅ Read ${emails.length} emails autonomously`);
            
            return {
                emails,
                count: emails.length,
                folder,
                processedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Error reading emails autonomously:', error);
            throw error;
        }
    }

    /**
     * 🤖 Procesa email con reglas de automatización
     */
    async processEmailWithRules(email, sessionTokens) {
        try {
            for (const [ruleName, rule] of this.automationRules) {
                if (!rule.enabled) continue;
                
                if (rule.condition(email)) {
                    console.log(`🤖 Applying rule: ${ruleName} to email: ${email.subject}`);
                    
                    switch (rule.action) {
                        case 'send_auto_reply':
                            await this.sendAutoReply(email, sessionTokens, rule.template);
                            break;
                            
                        case 'classify_and_label':
                            await this.classifyAndLabel(email, sessionTokens);
                            break;
                    }
                    
                    this.emailStats.processedEmails++;
                }
            }
        } catch (error) {
            console.error('❌ Error processing email with rules:', error);
        }
    }

    /**
     * 🔄 Envía respuesta automática
     */
    async sendAutoReply(originalEmail, sessionTokens, template) {
        try {
            const replySubject = `Re: ${originalEmail.subject}`;
            const replyBody = this.getAutoReplyTemplate(template, originalEmail);
            
            await this.sendEmailAutonomous({
                to: originalEmail.from,
                subject: replySubject,
                body: replyBody,
                sessionTokens
            });
            
            this.emailStats.autoReplies++;
            
            console.log(`🔄 Auto-reply sent to: ${originalEmail.from}`);
            
        } catch (error) {
            console.error('❌ Error sending auto-reply:', error);
        }
    }

    /**
     * 📝 Construye mensaje de email
     */
    buildEmailMessage({ to, subject, body, priority }) {
        const recipients = Array.isArray(to) ? to.join(', ') : to;
        
        const email = [
            `To: ${recipients}`,
            `Subject: ${subject}`,
            `X-Priority: ${priority === 'high' ? '1' : priority === 'low' ? '5' : '3'}`,
            `X-Mailer: Eva Autonomous System`,
            '',
            body,
            '',
            '---',
            'Este mensaje fue enviado automáticamente por Eva.',
            'Eva Autonomous Operations - Sistema de Control Total'
        ].join('\n');

        return email;
    }

    /**
     * 📄 Parsea mensaje de email
     */
    parseEmailMessage(messageData) {
        const headers = messageData.payload.headers;
        const getHeader = (name) => headers.find(h => h.name === name)?.value || '';
        
        // Extraer contenido del cuerpo
        let body = '';
        if (messageData.payload.body?.data) {
            body = Buffer.from(messageData.payload.body.data, 'base64').toString('utf-8');
        } else if (messageData.payload.parts) {
            for (const part of messageData.payload.parts) {
                if (part.mimeType === 'text/plain' && part.body?.data) {
                    body = Buffer.from(part.body.data, 'base64').toString('utf-8');
                    break;
                }
            }
        }

        return {
            id: messageData.id,
            threadId: messageData.threadId,
            from: getHeader('From'),
            to: getHeader('To'),
            subject: getHeader('Subject'),
            date: getHeader('Date'),
            body: body.substring(0, 1000), // Limitar tamaño
            snippet: messageData.snippet,
            labels: messageData.labelIds || [],
            isUnread: messageData.labelIds?.includes('UNREAD') || false
        };
    }

    /**
     * 🎯 Clasifica importancia del email
     */
    classifyEmailImportance(email) {
        const urgentKeywords = ['urgent', 'emergency', 'asap', 'critical', 'important'];
        const subject = email.subject?.toLowerCase() || '';
        const body = email.body?.toLowerCase() || '';
        
        return urgentKeywords.some(keyword => 
            subject.includes(keyword) || body.includes(keyword)
        );
    }

    /**
     * 📝 Obtiene template de respuesta automática
     */
    getAutoReplyTemplate(template, originalEmail) {
        const templates = {
            urgent_received: `
Hola,

He recibido tu mensaje marcado como urgente: "${originalEmail.subject}"

Eva (mi sistema autónomo) ha procesado tu solicitud y la ha clasificado como prioritaria.

Responderé a tu mensaje lo antes posible.

Gracias por tu paciencia.

Saludos,
Eva Autonomous System
            `.trim(),
            
            general: `
Gracias por tu mensaje.

Eva ha recibido y procesado tu correo automáticamente.

Responderé en breve.

Saludos,
Eva Autonomous System
            `.trim()
        };
        
        return templates[template] || templates.general;
    }

    /**
     * 📊 Clasifica y etiqueta email
     */
    async classifyAndLabel(email, sessionTokens) {
        try {
            // Lógica de clasificación inteligente
            let labels = [];
            
            if (this.classifyEmailImportance(email)) {
                labels.push('IMPORTANT');
            }
            
            if (email.subject?.toLowerCase().includes('meeting')) {
                labels.push('CATEGORY_PERSONAL'); // O crear label personalizado
            }
            
            // Aplicar etiquetas (implementación simplificada)
            console.log(`🏷️ Email classified with labels: ${labels.join(', ')}`);
            
        } catch (error) {
            console.error('❌ Error classifying email:', error);
        }
    }

    /**
     * 📊 Obtiene estadísticas del servicio
     */
    getEmailStats() {
        return {
            isActive: this.isActive,
            capabilities: this.emailCapabilities,
            stats: this.emailStats,
            automationRules: Array.from(this.automationRules.keys()),
            totalRules: this.automationRules.size
        };
    }

    /**
     * ⚙️ Configura regla de automatización
     */
    setAutomationRule(ruleName, ruleConfig) {
        this.automationRules.set(ruleName, {
            enabled: true,
            ...ruleConfig
        });
        
        console.log(`⚙️ Automation rule configured: ${ruleName}`);
    }

    /**
     * 🚀 Inicia el servicio de email
     */
    start() {
        this.isActive = true;
        console.log('📧 Eva Email Service started');
    }

    /**
     * 🛑 Detiene el servicio de email
     */
    stop() {
        this.isActive = false;
        console.log('📧 Eva Email Service stopped');
    }
}

module.exports = EvaEmailService;