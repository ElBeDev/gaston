/**
 * 🚀 Multimodal Processing Routes
 * Rutas para procesamiento de documentos, imágenes y audio
 */

const express = require('express');
const router = express.Router();
const superChatController = require('../controllers/superChatController');

// 📄 Document Processing Routes
router.post('/process/document', (req, res) => {
  req.body.contentType = 'document';
  return superChatController.processMultimodalContent(req, res);
});

router.post('/search/document', (req, res) => {
  req.body.contentType = 'document';
  return superChatController.searchInContent(req, res);
});

router.post('/compare/documents', (req, res) => {
  req.body.contentType = 'document';
  return superChatController.compareMultimodalContent(req, res);
});

// 👁️ Image Processing Routes  
router.post('/process/image', (req, res) => {
  req.body.contentType = 'image';
  return superChatController.processMultimodalContent(req, res);
});

router.post('/search/image', (req, res) => {
  req.body.contentType = 'image';
  return superChatController.searchInContent(req, res);
});

router.post('/compare/images', (req, res) => {
  req.body.contentType = 'image';
  return superChatController.compareMultimodalContent(req, res);
});

// 🎵 Audio Processing Routes
router.post('/process/audio', (req, res) => {
  req.body.contentType = 'audio';
  return superChatController.processMultimodalContent(req, res);
});

router.post('/search/audio', (req, res) => {
  req.body.contentType = 'audio';
  return superChatController.searchInContent(req, res);
});

router.post('/compare/audios', (req, res) => {
  req.body.contentType = 'audio';
  return superChatController.compareMultimodalContent(req, res);
});

// 📝 Meeting Reports
router.post('/meeting/report', superChatController.generateMeetingReport.bind(superChatController));

module.exports = router;
