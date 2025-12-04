/**
 * Contacts API Routes - Blob Storage
 * CRUD completo de contactos usando Vercel Blob Storage
 */

const express = require('express');
const router = express.Router();
const blobDB = require('../utils/blobDatabase');

/**
 * GET /api/contacts
 * Obtener todos los contactos
 */
router.get('/', async (req, res) => {
  try {
    const contacts = await blobDB.find('contacts');
    
    res.json({
      success: true,
      contacts,
      count: contacts.length,
      storage: 'Vercel Blob Storage'
    });
  } catch (error) {
    console.error('❌ Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener contactos',
      details: error.message
    });
  }
});

/**
 * GET /api/contacts/:id
 * Obtener un contacto específico
 */
router.get('/:id', async (req, res) => {
  try {
    const contact = await blobDB.findById('contacts', req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contacto no encontrado'
      });
    }
    
    res.json({
      success: true,
      contact,
      storage: 'Vercel Blob Storage'
    });
  } catch (error) {
    console.error('❌ Error fetching contact:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener contacto',
      details: error.message
    });
  }
});

/**
 * POST /api/contacts
 * Crear un nuevo contacto
 */
router.post('/', async (req, res) => {
  try {
    const contactData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      company: req.body.company,
      position: req.body.position,
      segment: req.body.segment || 'general',
      tags: req.body.tags || [],
      notes: req.body.notes || '',
      metadata: req.body.metadata || {}
    };
    
    const contact = await blobDB.create('contacts', contactData);
    
    res.status(201).json({
      success: true,
      contact,
      message: 'Contacto creado exitosamente',
      storage: 'Vercel Blob Storage'
    });
  } catch (error) {
    console.error('❌ Error creating contact:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear contacto',
      details: error.message
    });
  }
});

/**
 * PUT /api/contacts/:id
 * Actualizar un contacto
 */
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates._id; // No permitir cambiar el ID
    
    const contact = await blobDB.findByIdAndUpdate(
      'contacts',
      req.params.id,
      updates,
      { new: true }
    );
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contacto no encontrado'
      });
    }
    
    res.json({
      success: true,
      contact,
      message: 'Contacto actualizado exitosamente',
      storage: 'Vercel Blob Storage'
    });
  } catch (error) {
    console.error('❌ Error updating contact:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar contacto',
      details: error.message
    });
  }
});

/**
 * DELETE /api/contacts/:id
 * Eliminar un contacto
 */
router.delete('/:id', async (req, res) => {
  try {
    const contact = await blobDB.findByIdAndDelete('contacts', req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contacto no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Contacto eliminado exitosamente',
      contact,
      storage: 'Vercel Blob Storage'
    });
  } catch (error) {
    console.error('❌ Error deleting contact:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar contacto',
      details: error.message
    });
  }
});

/**
 * GET /api/contacts/search/:query
 * Buscar contactos
 */
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query.toLowerCase();
    const allContacts = await blobDB.find('contacts');
    
    const results = allContacts.filter(contact => 
      contact.name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.company?.toLowerCase().includes(query) ||
      contact.phone?.includes(query)
    );
    
    res.json({
      success: true,
      contacts: results,
      count: results.length,
      query: req.params.query,
      storage: 'Vercel Blob Storage'
    });
  } catch (error) {
    console.error('❌ Error searching contacts:', error);
    res.status(500).json({
      success: false,
      error: 'Error al buscar contactos',
      details: error.message
    });
  }
});

module.exports = router;
