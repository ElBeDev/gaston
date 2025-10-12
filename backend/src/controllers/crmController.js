const UserContext = require('../models/UserContext');
const Contact = require('../models/Contact');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Note = require('../models/Note');
const intelligenceService = require('../services/intelligenceService');

class CRMController {
  // ===== CONTACT ANALYTICS & KPIs =====
  async getContactAnalyticsSummary(req, res) {
    try {
      console.log('📊 Getting contact analytics summary (demo mode)');
      
      // Demo data for contact analytics
      const demoData = {
        success: true,
        kpis: {
          totalContacts: 18,
          vipContacts: 5,
          atRiskContacts: 2,
          avgEngagement: 85,
          newContactsThisMonth: 3,
          activeConversations: 12,
          pendingFollowUps: 4,
          upcomingMeetings: 6
        },
        trends: {
          contactGrowth: '+15%',
          engagementTrend: '+8%',
          conversionRate: '12.5%',
          responseRate: '94%'
        },
        recentActivity: [
          {
            type: 'new_contact',
            contact: 'María González',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            description: 'Nuevo contacto agregado'
          },
          {
            type: 'meeting_completed',
            contact: 'Juan Pérez',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
            description: 'Reunión de seguimiento completada'
          },
          {
            type: 'follow_up_sent',
            contact: 'Ana López',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
            description: 'Email de seguimiento enviado'
          }
        ],
        topContacts: [
          { name: 'María González', engagement: 95, lastContact: '2 horas', status: 'active' },
          { name: 'Juan Pérez', engagement: 88, lastContact: '1 día', status: 'active' },
          { name: 'Ana López', engagement: 82, lastContact: '3 días', status: 'follow_up' },
          { name: 'Carlos Ruiz', engagement: 76, lastContact: '5 días', status: 'active' },
          { name: 'Lucia Torres', engagement: 71, lastContact: '1 semana', status: 'at_risk' }
        ]
      };

      res.json(demoData);
    } catch (error) {
      console.error('❌ Error fetching contact analytics summary:', error);
      // Always return demo data as fallback
      res.json({
        success: true,
        kpis: {
          totalContacts: 18,
          vipContacts: 5,
          atRiskContacts: 2,
          avgEngagement: 85
        },
        trends: {},
        recentActivity: [],
        topContacts: []
      });
    }
  }

  // Get all contacts with demo data
  async getContacts(req, res) {
    try {
      console.log('👥 Getting contacts (demo mode)');
      
      const demoContacts = [
        {
          _id: '1',
          name: 'María González',
          email: 'maria@empresa.com',
          phone: '+52 555 123 4567',
          company: 'Tech Solutions',
          position: 'CEO',
          lastContact: new Date(Date.now() - 1000 * 60 * 60 * 2),
          status: 'active',
          engagementLevel: 'high'
        },
        {
          _id: '2',
          name: 'Juan Pérez',
          email: 'juan@startup.com',
          phone: '+52 555 765 4321',
          company: 'StartupXYZ',
          position: 'CTO',
          lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24),
          status: 'active',
          engagementLevel: 'high'
        },
        {
          _id: '3',
          name: 'Ana López',
          email: 'ana@tech.com',
          phone: '+52 555 987 6543',
          company: 'TechCorp',
          position: 'Product Manager',
          lastContact: new Date(Date.now() - 1000 * 60 * 60 * 72),
          status: 'follow_up',
          engagementLevel: 'medium'
        }
      ];

      res.json({
        success: true,
        contacts: demoContacts,
        total: demoContacts.length
      });
    } catch (error) {
      console.error('❌ Error getting contacts:', error);
      res.json({
        success: true,
        contacts: [],
        total: 0
      });
    }
  }

  // Create contact with demo response
  async createContact(req, res) {
    try {
      console.log('➕ Creating contact (demo mode)');
      
      const demoContact = {
        _id: 'demo-' + Date.now(),
        ...req.body,
        createdAt: new Date(),
        status: 'active',
        engagementLevel: 'medium'
      };

      res.json({
        success: true,
        contact: demoContact,
        message: 'Contact created successfully (demo mode)'
      });
    } catch (error) {
      console.error('❌ Error creating contact:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create contact'
      });
    }
  }

  // Update contact with demo response
  async updateContact(req, res) {
    try {
      console.log('✏️ Updating contact (demo mode)');
      
      const { id } = req.params;
      const updatedContact = {
        _id: id,
        ...req.body,
        updatedAt: new Date()
      };

      res.json({
        success: true,
        contact: updatedContact,
        message: 'Contact updated successfully (demo mode)'
      });
    } catch (error) {
      console.error('❌ Error updating contact:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update contact'
      });
    }
  }

  // Delete contact with demo response
  async deleteContact(req, res) {
    try {
      console.log('🗑️ Deleting contact (demo mode)');
      
      const { id } = req.params;

      res.json({
        success: true,
        message: `Contact ${id} deleted successfully (demo mode)`
      });
    } catch (error) {
      console.error('❌ Error deleting contact:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete contact'
      });
    }
  }

  // Get contact notes with demo data
  async getContactNotes(req, res) {
    try {
      console.log('📝 Getting contact notes (demo mode)');
      
      const { id } = req.params;
      const demoNotes = [
        {
          _id: 'note1',
          title: 'Reunión inicial',
          content: 'Discutimos los objetivos del proyecto y timeline.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          contactId: id
        },
        {
          _id: 'note2',
          title: 'Seguimiento técnico',
          content: 'Revisamos los requerimientos técnicos específicos.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
          contactId: id
        }
      ];

      res.json({
        success: true,
        notes: demoNotes
      });
    } catch (error) {
      console.error('❌ Error getting contact notes:', error);
      res.json({
        success: true,
        notes: []
      });
    }
  }
}

// Export instance
module.exports = new CRMController();
