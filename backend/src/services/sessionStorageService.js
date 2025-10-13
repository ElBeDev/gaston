const fs = require('fs').promises;
const path = require('path');

class SessionStorageService {
    constructor() {
        this.sessionsDir = path.join(__dirname, '../sessions');
        this.whatsappSessionsDir = path.join(__dirname, '../whatsapp-sessions');
        this.googleSessionsDir = path.join(this.sessionsDir, 'google');
        this.initializeDirectories();
    }

    async initializeDirectories() {
        try {
            await fs.mkdir(this.sessionsDir, { recursive: true });
            await fs.mkdir(this.googleSessionsDir, { recursive: true });
            await fs.mkdir(this.whatsappSessionsDir, { recursive: true });
            console.log('📁 Session directories initialized');
        } catch (error) {
            console.error('❌ Error creating session directories:', error);
        }
    }

    // Google Session Management
    async saveGoogleSession(userId, sessionData) {
        try {
            const sessionPath = path.join(this.googleSessionsDir, `${userId}.json`);
            const sessionWithTimestamp = {
                ...sessionData,
                lastSaved: new Date().toISOString(),
                expiresAt: sessionData.tokens?.expiry_date || null
            };
            
            await fs.writeFile(sessionPath, JSON.stringify(sessionWithTimestamp, null, 2));
            console.log(`✅ Google session saved for user: ${userId}`);
            return true;
        } catch (error) {
            console.error(`❌ Error saving Google session for ${userId}:`, error);
            return false;
        }
    }

    async loadGoogleSession(userId) {
        try {
            const sessionPath = path.join(this.googleSessionsDir, `${userId}.json`);
            const sessionData = await fs.readFile(sessionPath, 'utf8');
            const session = JSON.parse(sessionData);
            
            // Check if session is expired
            if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
                console.log(`⚠️ Google session expired for user: ${userId}`);
                return null;
            }
            
            console.log(`✅ Google session loaded for user: ${userId}`);
            return session;
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error(`❌ Error loading Google session for ${userId}:`, error);
            }
            return null;
        }
    }

    async deleteGoogleSession(userId) {
        try {
            const sessionPath = path.join(this.googleSessionsDir, `${userId}.json`);
            await fs.unlink(sessionPath);
            console.log(`🗑️ Google session deleted for user: ${userId}`);
            return true;
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error(`❌ Error deleting Google session for ${userId}:`, error);
            }
            return false;
        }
    }

    async listGoogleSessions() {
        try {
            const files = await fs.readdir(this.googleSessionsDir);
            const sessions = [];
            
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const userId = file.replace('.json', '');
                    const session = await this.loadGoogleSession(userId);
                    if (session) {
                        sessions.push({
                            userId,
                            user: session.user,
                            lastSaved: session.lastSaved,
                            expiresAt: session.expiresAt
                        });
                    }
                }
            }
            
            return sessions;
        } catch (error) {
            console.error('❌ Error listing Google sessions:', error);
            return [];
        }
    }

    // WhatsApp Session Management
    async getWhatsAppSessionStatus() {
        try {
            const sessionDir = path.join(this.whatsappSessionsDir, 'session');
            const sessionExists = await fs.access(sessionDir).then(() => true).catch(() => false);
            
            if (sessionExists) {
                const stats = await fs.stat(sessionDir);
                return {
                    exists: true,
                    lastModified: stats.mtime,
                    size: stats.size
                };
            }
            
            return { exists: false };
        } catch (error) {
            console.error('❌ Error checking WhatsApp session status:', error);
            return { exists: false, error: error.message };
        }
    }

    async deleteWhatsAppSession() {
        try {
            const sessionDir = path.join(this.whatsappSessionsDir, 'session');
            await fs.rmdir(sessionDir, { recursive: true });
            console.log('🗑️ WhatsApp session deleted');
            return true;
        } catch (error) {
            console.error('❌ Error deleting WhatsApp session:', error);
            return false;
        }
    }

    // General session status
    async getSessionStatus() {
        const googleSessions = await this.listGoogleSessions();
        const whatsappStatus = await this.getWhatsAppSessionStatus();
        
        return {
            google: {
                active: googleSessions.length,
                sessions: googleSessions
            },
            whatsapp: whatsappStatus
        };
    }
}

module.exports = new SessionStorageService();