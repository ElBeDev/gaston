const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');

const session = require('express-session');

// Load environment variables from root directory
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const app = express();
const server = http.createServer(app);

// Increase header size limits
server.maxHeadersCount = 0; // Remove headers count limit
app.use((req, res, next) => {
  // Increase max header size
  req.connection.maxHeadersCount = 0;
  next();
});

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : [
      "http://localhost:3001",
      "http://localhost:3002",
      "http://192.168.10.147:3001"
    ],
    methods: ["GET", "POST"]
  }
});

// Session middleware (configure secret in .env for production)
app.use(session({
  secret: process.env.SESSION_SECRET || 'eva-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Solo true en producción con HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3002',
    'http://192.168.10.147:3001'
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb', parameterLimit: 1000 }));


// --- Eva Google OAuth2 & Email Integration ---
const authRoutes = require('./routes/auth');
const emailRoutes = require('./routes/email');
const calendarRoutes = require('../routes/calendar-fallback'); // Temporary fallback
const sessionStorage = require('./services/sessionStorageService');

app.use('/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/calendar', calendarRoutes);

// Session management route
app.get('/api/sessions/status', async (req, res) => {
  try {
    const status = await sessionStorage.getSessionStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting session status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined room`);
  });

  socket.on('user_message', async (data) => {
    console.log('📥 Received message from user:', data);
    
    try {
      socket.emit('typing');
      
      const { message, userId } = data;
      
      // Use the superChatController's enhanced sendMessage method
      const superChatController = require('./controllers/superChatController');
      
      // Create a mock request and response object for the controller
      const mockReq = {
        body: { message, userId },
        app: { get: () => io }
      };
      
      const mockRes = {
        json: (data) => {
          console.log('📤 Sending response to user:', data);
          
          // Send response back to user via socket
          socket.emit('assistant_message', {
            message: data.response || data.message || data,
            timestamp: new Date().toISOString()
          });
        },
        status: (code) => ({
          json: (error) => {
            console.error('❌ Controller error:', error);
            socket.emit('error', { message: error.error || 'Something went wrong' });
          }
        })
      };
      
      // Call the controller method - use handleMessage
      await superChatController.sendMessage(mockReq, mockRes);
      
    } catch (error) {
      console.error('❌ Error processing message:', error);
      socket.emit('error', { message: 'Sorry, I encountered an error processing your message.' });
    }
  });

  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('socketio', io);

// Routes - Use the comprehensive chatRoutes.js
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/context', require('./routes/context'));
app.use('/api/crm', require('./routes/crmRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes')); // Dashboard stats routes
app.use('/api/multimodal', require('./routes/multimodal')); // NEW: Multimodal processing routes
app.use('/api/autonomous', require('./routes/autonomous')); // NEW: Autonomous Agent System routes
app.use('/api/google', require('./routes/googleWorkspace')); // NEW: Google Workspace Integration routes
app.use('/api/auth', require('./routes/auth'));
app.use('/auth', require('../routes/auth'));
app.use('/api/email', require('../routes/email'));
const liveVoiceRoutes = require('./routes/liveVoice');
app.use('/api/live-voice', liveVoiceRoutes);

// 🎛️ EVA COMMAND CENTER - PHASE 1 CONTROL SYSTEM
const { router: evaControlRoutes, initializeCommandCenter } = require('./routes/evaControl');
app.use('/eva/control', evaControlRoutes);

// 🤖 EVA AUTONOMOUS OPERATIONS - PHASE 2 AUTONOMOUS SYSTEM
const { router: evaAutonomousRoutes, initializeAutonomousController } = require('./routes/evaAutonomous');
app.use('/eva/autonomous', evaAutonomousRoutes);

// 📱 EVA WHATSAPP AUTONOMOUS - PHASE 3 INTELLIGENCE ORCHESTRATION
const evaWhatsAppRoutes = require('./routes/eva-whatsapp');
app.use('/eva/whatsapp', evaWhatsAppRoutes);

// WhatsApp Web integration
const { router: whatsappRoutes, setupWhatsAppWebSocket } = require('./routes/whatsapp');
app.use('/api/whatsapp', whatsappRoutes);

// Setup WhatsApp WebSocket events
setupWhatsAppWebSocket(io);

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

// Start server with Socket.io (CRITICAL FIX)
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {  // Use 'server.listen' NOT 'app.listen'
  console.log(`🚀 Eva Backend Server running on port ${PORT}`);
  console.log(`📡 API available at: http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.io available at: http://localhost:${PORT}`);
  console.log(`🧠 Intelligence system: ACTIVE`);
  console.log(`🎯 Ready for advanced interactions!`);
  
  // 🎛️ INITIALIZE EVA COMMAND CENTER
  console.log(`🎛️ Initializing Eva Command Center...`);
  const { initializeCommandCenter } = require('./routes/evaControl');
  const commandCenter = initializeCommandCenter(io);
  console.log(`✅ Eva Command Center available at: http://localhost:${PORT}/eva/control`);
  console.log(`🎯 Phase 1 - Command Center: ACTIVE`);
  
  // 🤖 INITIALIZE EVA AUTONOMOUS OPERATIONS
  console.log(`🤖 Initializing Eva Autonomous Operations...`);
  const { initializeAutonomousController } = require('./routes/evaAutonomous');
  const autonomousController = initializeAutonomousController(commandCenter);
  console.log(`✅ Eva Autonomous Operations available at: http://localhost:${PORT}/eva/autonomous`);
  console.log(`🎯 Phase 2 - Autonomous Operations: ACTIVE`);
  console.log(`🧠 100% Autonomía Avanzada: ONLINE`);
});