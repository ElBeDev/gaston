const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crmController');

// ===== CONTACT ANALYTICS ROUTES =====
router.get('/contacts/analytics/summary', crmController.getContactAnalyticsSummary);

// ===== CONTACTS ROUTES =====
router.get('/contacts', crmController.getContacts);
router.post('/contacts', crmController.createContact);
router.put('/contacts/:id', crmController.updateContact);
router.delete('/contacts/:id', crmController.deleteContact);

// ===== CONTACT NOTES ROUTES =====
router.get('/contacts/:id/notes', crmController.getContactNotes);

// ===== HEALTH CHECK =====
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'CRM Controller (Demo Mode)',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
