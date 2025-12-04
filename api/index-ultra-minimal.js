// Progressive Express app - adding routes
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

// Try loading blobDatabase
let blobDB;
try {
  blobDB = require('../backend/src/utils/blobDatabase');
  console.log('✅ blobDatabase loaded successfully');
} catch (error) {
  console.error('❌ Error loading blobDatabase:', error.message);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Express with session + routes loading test',
    blobDB: blobDB ? 'loaded' : 'failed'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

module.exports = app;
