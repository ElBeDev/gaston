const blobStorage = require('../utils/blobStorage');
const Contact = require('../models/Contact');
const Conversation = require('../models/Conversation');

/**
 * 📦 Data Backup Service
 * 
 * Servicio para respaldar datos importantes en Vercel Blob Storage
 * como segunda capa de persistencia además de MongoDB
 */
class DataBackupService {
    constructor() {
        this.isEnabled = process.env.ENABLE_BLOB_BACKUP === 'true' || 
                        process.env.NODE_ENV === 'production';
        this.backupInterval = null;
        
        if (this.isEnabled) {
            console.log('📦 Data Backup Service habilitado');
        } else {
            console.log('📦 Data Backup Service deshabilitado (modo desarrollo)');
        }
    }

    /**
     * Iniciar respaldos automáticos periódicos
     */
    startAutomaticBackups(intervalMinutes = 60) {
        if (!this.isEnabled) {
            console.log('⏭️ Respaldos automáticos omitidos (servicio deshabilitado)');
            return;
        }

        console.log(`⏰ Iniciando respaldos automáticos cada ${intervalMinutes} minutos`);
        
        // Primer respaldo inmediato (después de 5 minutos de iniciar)
        setTimeout(() => this.performFullBackup(), 5 * 60 * 1000);
        
        // Respaldos periódicos
        this.backupInterval = setInterval(
            () => this.performFullBackup(),
            intervalMinutes * 60 * 1000
        );
    }

    /**
     * Detener respaldos automáticos
     */
    stopAutomaticBackups() {
        if (this.backupInterval) {
            clearInterval(this.backupInterval);
            this.backupInterval = null;
            console.log('⏹️ Respaldos automáticos detenidos');
        }
    }

    /**
     * Realizar respaldo completo de datos críticos
     */
    async performFullBackup() {
        if (!this.isEnabled) {
            return { skipped: true, reason: 'Service disabled' };
        }

        console.log('🔄 Iniciando respaldo completo...');
        const startTime = Date.now();
        const results = {
            contacts: null,
            conversations: null,
            metadata: {
                timestamp: new Date().toISOString(),
                duration: 0
            }
        };

        try {
            // Respaldar contactos
            results.contacts = await this.backupContacts();
            console.log(`✅ Contactos respaldados: ${results.contacts.count} registros`);

            // Respaldar conversaciones recientes (últimos 30 días)
            results.conversations = await this.backupRecentConversations(30);
            console.log(`✅ Conversaciones respaldadas: ${results.conversations.count} registros`);

            results.metadata.duration = Date.now() - startTime;
            results.success = true;

            console.log(`✅ Respaldo completo finalizado en ${results.metadata.duration}ms`);
            
            // Guardar metadata del respaldo
            await this.saveBackupMetadata(results);

            return results;
        } catch (error) {
            console.error('❌ Error en respaldo completo:', error);
            results.error = error.message;
            results.success = false;
            return results;
        }
    }

    /**
     * Respaldar todos los contactos
     */
    async backupContacts() {
        try {
            const contacts = await Contact.find({}).lean();
            
            if (contacts.length === 0) {
                return { count: 0, skipped: true };
            }

            const backupData = {
                type: 'contacts',
                timestamp: new Date().toISOString(),
                count: contacts.length,
                data: contacts
            };

            const fileName = `backups/contacts_${Date.now()}.json`;
            await blobStorage.saveAuthFile(fileName, JSON.stringify(backupData));

            return { count: contacts.length, fileName };
        } catch (error) {
            console.error('❌ Error respaldando contactos:', error);
            throw error;
        }
    }

    /**
     * Respaldar conversaciones recientes
     */
    async backupRecentConversations(days = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            const conversations = await Conversation.find({
                timestamp: { $gte: cutoffDate }
            }).lean();

            if (conversations.length === 0) {
                return { count: 0, skipped: true };
            }

            const backupData = {
                type: 'conversations',
                timestamp: new Date().toISOString(),
                days,
                count: conversations.length,
                data: conversations
            };

            const fileName = `backups/conversations_${Date.now()}.json`;
            await blobStorage.saveAuthFile(fileName, JSON.stringify(backupData));

            return { count: conversations.length, fileName };
        } catch (error) {
            console.error('❌ Error respaldando conversaciones:', error);
            throw error;
        }
    }

    /**
     * Guardar metadata del respaldo
     */
    async saveBackupMetadata(results) {
        try {
            const metadata = {
                timestamp: new Date().toISOString(),
                success: results.success,
                duration: results.metadata.duration,
                contacts: results.contacts,
                conversations: results.conversations,
                error: results.error || null
            };

            await blobStorage.saveAuthFile(
                'backups/latest-backup-metadata.json',
                JSON.stringify(metadata, null, 2)
            );
        } catch (error) {
            console.error('❌ Error guardando metadata del respaldo:', error);
        }
    }

    /**
     * Respaldar un contacto específico inmediatamente
     */
    async backupContact(contact) {
        if (!this.isEnabled) return { skipped: true };

        try {
            const fileName = `backups/contacts/single_${contact._id}_${Date.now()}.json`;
            await blobStorage.saveAuthFile(fileName, JSON.stringify(contact));
            return { success: true, fileName };
        } catch (error) {
            console.error('❌ Error respaldando contacto:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Respaldar una conversación específica inmediatamente
     */
    async backupConversation(conversation) {
        if (!this.isEnabled) return { skipped: true };

        try {
            const fileName = `backups/conversations/single_${conversation._id}_${Date.now()}.json`;
            await blobStorage.saveAuthFile(fileName, JSON.stringify(conversation));
            return { success: true, fileName };
        } catch (error) {
            console.error('❌ Error respaldando conversación:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Listar todos los respaldos disponibles
     */
    async listBackups() {
        if (!this.isEnabled) {
            return { available: false, reason: 'Service disabled' };
        }

        try {
            const blobs = await blobStorage.listSessions();
            const backups = blobs.filter(blob => blob.pathname.startsWith('backups/'));
            
            return {
                available: true,
                count: backups.length,
                backups: backups.map(blob => ({
                    pathname: blob.pathname,
                    size: blob.size,
                    uploadedAt: blob.uploadedAt
                }))
            };
        } catch (error) {
            console.error('❌ Error listando respaldos:', error);
            return { available: false, error: error.message };
        }
    }

    /**
     * Restaurar datos desde un respaldo
     */
    async restoreFromBackup(backupFileName) {
        if (!this.isEnabled) {
            return { success: false, reason: 'Service disabled' };
        }

        try {
            console.log(`🔄 Restaurando desde respaldo: ${backupFileName}`);
            
            const backupData = await blobStorage.loadAuthFile(backupFileName);
            if (!backupData) {
                throw new Error('Respaldo no encontrado');
            }

            const backup = JSON.parse(backupData);
            
            // Restaurar según el tipo
            if (backup.type === 'contacts') {
                // Aquí podrías implementar la lógica de restauración
                // Por seguridad, no sobrescribir automáticamente
                return {
                    success: true,
                    message: 'Datos de respaldo cargados. Implementar lógica de restauración según necesidad.',
                    preview: {
                        type: backup.type,
                        count: backup.count,
                        timestamp: backup.timestamp
                    }
                };
            }

            return { success: true, message: 'Respaldo procesado' };
        } catch (error) {
            console.error('❌ Error restaurando desde respaldo:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener estadísticas de respaldos
     */
    async getBackupStats() {
        if (!this.isEnabled) {
            return { enabled: false };
        }

        try {
            const metadataStr = await blobStorage.loadAuthFile('backups/latest-backup-metadata.json');
            const metadata = metadataStr ? JSON.parse(metadataStr) : null;

            const backupsList = await this.listBackups();

            return {
                enabled: true,
                lastBackup: metadata,
                totalBackups: backupsList.count,
                automaticBackupsRunning: this.backupInterval !== null
            };
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas de respaldos:', error);
            return { enabled: true, error: error.message };
        }
    }
}

module.exports = new DataBackupService();
