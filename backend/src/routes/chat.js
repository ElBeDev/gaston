const express = require('express');
const superChatController = require('../controllers/superChatController'); // NEW: Eva Super-Chat Controller
const chatController = require('../controllers/chatController'); // Fallback for other methods
const router = express.Router();

// 🚀 NEW: Super-Advanced Chat Routes with Predictive Intelligence
router.post('/', (req, res) => superChatController.sendMessage(req, res));
router.get('/history/:userId', (req, res) => superChatController.getConversationHistory(req, res));

// Legacy routes (fallback)
router.delete('/clear/:userId', (req, res) => chatController.clearConversation(req, res));
router.get('/health/:userId', (req, res) => chatController.getHealthStatus(req, res));

module.exports = router;