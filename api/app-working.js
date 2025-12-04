// Progressive Express app - adding real routes
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');

const app = express();

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'eva-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Try loading routes one by one
try {
  const dashboardRoutes = require('../backend/src/routes/dashboardRoutes');
  app.use('/api/dashboard', dashboardRoutes);
  console.log('✅ Dashboard routes loaded');
} catch (error) {
  console.error('❌ Error loading dashboard routes:', error.message);
}

try {
  const contactsRoutes = require('../backend/src/routes/contactsBlob');
  app.use('/api/contacts', contactsRoutes);
  console.log('✅ Contacts routes loaded');
} catch (error) {
  console.error('❌ Error loading contacts routes:', error.message);
}

try {
  const authRoutes = require('../backend/src/routes/auth');
  app.use('/api/auth', authRoutes);
  app.use('/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
}

// Auth status endpoint
app.get('/auth/status', (req, res) => {
  res.json({
    authenticated: !!(req.session && req.session.tokens),
    user: req.session?.user || null
  });
});

try {
  const emailRoutes = require('../backend/src/routes/email');
  app.use('/api/email', emailRoutes);
  console.log('✅ Email routes loaded');
} catch (error) {
  console.error('❌ Error loading email routes:', error.message);
}

try {
  const calendarRoutes = require('../backend/routes/calendar-fallback');
  app.use('/api/calendar', calendarRoutes);
  console.log('✅ Calendar routes loaded');
} catch (error) {
  console.error('❌ Error loading calendar routes:', error.message);
}

try {
  const { router: whatsappRoutes } = require('../backend/src/routes/whatsapp');
  app.use('/api/whatsapp', whatsappRoutes);
  console.log('✅ WhatsApp routes loaded');
} catch (error) {
  console.error('❌ Error loading WhatsApp routes:', error.message);
}

// CRM routes (mock - pendiente migración a Blob)
app.get('/api/crm/contacts', async (req, res) => {
  // Usar contacts de Blob Storage
  try {
    const contactsBlob = require('../backend/src/routes/contactsBlob');
    // Redirigir a /api/contacts
    return res.redirect('/api/contacts');
  } catch (error) {
    res.json({ success: true, contacts: [], total: 0, message: 'CRM usando Blob Storage' });
  }
});

app.get('/api/crm/contacts/analytics/summary', (req, res) => {
  res.json({
    success: true,
    summary: {
      total: 0,
      bySegment: {},
      byStatus: {},
      recentActivity: 0
    },
    message: 'Analytics disponible después de migración completa'
  });
});

// Chat routes (mock - pendiente migración a Blob)
app.get('/api/chat/history/:userId', (req, res) => {
  res.json({
    success: true,
    conversations: [],
    message: 'Chat history disponible después de migración a Blob Storage'
  });
});

app.post('/api/chat/message', (req, res) => {
  res.json({
    success: false,
    message: 'Chat temporalmente deshabilitado - migración en proceso',
    error: 'MIGRATION_IN_PROGRESS'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Express with real routes',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

module.exports = app;
