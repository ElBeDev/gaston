// Contact analytics summary
router.get('/contacts/analytics/summary', crmController.getContactAnalyticsSummary);
const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crmController');

router.get('/contacts/:userId?', crmController.getContacts);
router.post('/contacts/:userId?', crmController.addContact);
router.put('/contacts/:userId/:contactId', crmController.updateContact);
router.delete('/contacts/:userId/:contactId', crmController.deleteContact);

router.get('/agenda/:userId?', crmController.getAgenda);
router.post('/agenda/:userId?', crmController.addAgendaItem);

router.get('/notes/:userId?', crmController.getNotes);
router.post('/notes/:userId?', crmController.addNote);

module.exports = router;