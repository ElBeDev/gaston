const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');

// Load environment variables from root directory
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// NOTE: MongoDB connection removed from app initialization
// Routes that need MongoDB will connect on-demand
// System works 100% with Vercel Blob Storage for sessions/tokens

const app = express();

// Increase header size limits (for serverless compatibility)
app.use((req, res, next) => {
  // Increase max header size
  if (req.connection) {
    req.connection.maxHeadersCount = 0;
  }
  next();
});

// Session middleware (configure secret in .env for production)
app.use(session({
  secret: process.env.SESSION_SECRET || 'eva-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true en producción con HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://gaston-jet.vercel.app'].filter(Boolean)
    : [
        'http://localhost:3001',
        'http://localhost:3002',
        'http://192.168.10.147:3001'
      ],
  credentials: true
};

app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb', parameterLimit: 1000 }));


// --- Eva Google OAuth2 & Email Integration ---
const authRoutes = require('./routes/auth');
const emailRoutes = require('./routes/email');
const calendarRoutes = require('../routes/calendar-fallback'); // Temporary fallback

// NOTE: sessionStorage y dataBackupService comentados temporalmente
// Requieren MongoDB y pueden causar errores en serverless
// const sessionStorage = require('./services/sessionStorageService');
// const dataBackupService = require('./services/dataBackupService');

app.use('/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/calendar', calendarRoutes);

// Iniciar respaldos automáticos solo en desarrollo local (no en serverless)
// TEMPORALMENTE DESHABILITADO - requiere MongoDB
/*
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  if (process.env.ENABLE_BLOB_BACKUP === 'true') {
    dataBackupService.startAutomaticBackups(120); // Cada 2 horas
    console.log('📦 Sistema de respaldos automáticos iniciado');
  }
}
*/

// Session management routes - TEMPORALMENTE DESHABILITADAS
// Requieren sessionStorage que tiene dependencias de MongoDB
/*
app.get('/api/sessions/status', async (req, res) => {
  try {
    const status = await sessionStorage.getSessionStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting session status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Backup management routes
app.get('/api/backups/status', async (req, res) => {
  try {
    const stats = await dataBackupService.getBackupStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting backup status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/backups/trigger', async (req, res) => {
  try {
    const result = await dataBackupService.performFullBackup();
    res.json(result);
  } catch (error) {
    console.error('Error triggering backup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/backups/list', async (req, res) => {
  try {
    const backups = await dataBackupService.listBackups();
    res.json(backups);
  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
*/

// NOTE: MongoDB connection is now handled by ensureMongoConnection middleware
// This allows for on-demand connections in serverless environments

// NOTE: Socket.IO is disabled in serverless (Vercel) environment
// Socket connections require persistent server, not compatible with serverless functions
// Real-time features will need alternative implementation (polling, webhooks, etc.)

// === RUTAS BÁSICAS (SIN DEPENDENCIAS DE MONGODB) ===
// Estas rutas funcionan con Blob Storage o datos mock

// Dashboard con Blob Storage
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Contactos con Blob Storage
app.use('/api/contacts', require('./routes/contactsBlob'));

// Auth routes (Google OAuth)
app.use('/api/auth', require('./routes/auth'));
app.use('/auth', require('../routes/auth'));

// Email routes (Google Gmail)
app.use('/api/email', require('../routes/email'));

// WhatsApp routes (con Blob Storage para sesiones)
const { router: whatsappRoutes } = require('./routes/whatsapp');
app.use('/api/whatsapp', whatsappRoutes);

// === RUTAS AVANZADAS (COMENTADAS - REQUIEREN MONGODB) ===
// Descomentar cuando configures MongoDB Atlas o migres a Blob Storage
/*
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/context', require('./routes/context'));
app.use('/api/crm', require('./routes/crmRoutes'));
app.use('/api/multimodal', require('./routes/multimodal'));
app.use('/api/autonomous', require('./routes/autonomous'));
app.use('/api/google', require('./routes/googleWorkspace'));
const liveVoiceRoutes = require('./routes/liveVoice');
app.use('/api/live-voice', liveVoiceRoutes);
const { router: evaControlRoutes } = require('./routes/evaControl');
app.use('/eva/control', evaControlRoutes);
const { router: evaAutonomousRoutes } = require('./routes/evaAutonomous');
app.use('/eva/autonomous', evaAutonomousRoutes);
const evaWhatsAppRoutes = require('./routes/eva-whatsapp');
app.use('/eva/whatsapp', evaWhatsAppRoutes);
*/

// NOTE: WhatsApp WebSocket setup moved to local development section below
// Serverless functions don't support persistent WebSocket connections

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Export app for Vercel serverless
module.exports = app;

// Start server only if not in serverless environment (Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  // Socket.IO and HTTP server only in local development
  const { Server } = require('socket.io');
  const http = require('http');
  
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3001",
        "http://localhost:3002",
        "http://192.168.10.147:3001"
      ],
      methods: ["GET", "POST"]
    }
  });
  
  // Socket.IO connection handling (local development only)
  io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('👋 User disconnected:', socket.id);
    });
  });
  
  // Make io accessible to routes
  app.set('socketio', io);
  
  // WhatsApp WebSocket setup (local only)
  const { setupWhatsAppWebSocket } = require('./services/whatsappService');
  setupWhatsAppWebSocket(io);
  
  const PORT = process.env.PORT || 3002;
  server.listen(PORT, () => {
    console.log(`🚀 Eva Backend Server running on port ${PORT}`);
    console.log(`📡 API available at: http://localhost:${PORT}/api`);
    console.log(`🔌 Socket.io available at: http://localhost:${PORT}`);
    console.log(`🧠 Intelligence system: ACTIVE`);
    console.log(`🎯 Ready for advanced interactions!`);
    
    // Initialize command center in local development
    if (io) {
      const { initializeCommandCenter } = require('./routes/evaControl');
      const commandCenter = initializeCommandCenter(io);
      console.log(`✅ Eva Command Center ACTIVE`);
      
      const { initializeAutonomousController } = require('./routes/evaAutonomous');
      const autonomousController = initializeAutonomousController(commandCenter);
      console.log(`✅ Eva Autonomous Operations ACTIVE`);
    }
  });
}