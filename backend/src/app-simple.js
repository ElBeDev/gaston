const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Cargar variables de entorno desde el directorio raíz
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
// Si existe .env.production y estamos en producción, sobreescribir
if (process.env.NODE_ENV === 'production') {
    require('dotenv').config({ path: path.join(__dirname, '../../.env.production'), override: true });
}

// Inicializar base de datos SQLite
const db = require('./config/database');
console.log('✅ SQLite Database loaded');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware básico
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'eva-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, // HTTPS enabled
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL}/auth/google/callback`
}, (accessToken, refreshToken, profile, done) => {
    const user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        picture: profile.photos[0].value
    };
    return done(null, user);
}));

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: 'sqlite',
        uptime: process.uptime()
    });
});

// API básicas
app.get('/api/test', (req, res) => {
    res.json({ message: 'Eva API funcionando con SQLite' });
});

// Ruta simple de chat
const simpleChatController = require('./controllers/simpleChatController');
app.post('/api/simple-chat', simpleChatController.sendMessage);

// Auth routes
app.get('/auth/status', (req, res) => {
    if (req.session && req.session.user) {
        res.json({
            authenticated: true,
            user: req.session.user
        });
    } else {
        res.json({
            authenticated: false,
            user: null
        });
    }
});

app.post('/auth/login', (req, res) => {
    // Simular login - en producción esto vendría de Google OAuth
    const user = {
        id: 'gaston',
        name: 'Gaston',
        email: 'gaston@example.com'
    };
    
    req.session.user = user;
    
    res.json({
        success: true,
        user: user
    });
});

// Google OAuth routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        req.session.user = req.user;
        res.redirect(process.env.FRONTEND_URL || 'http://76.13.122.125');
    }
);

// Logout - support both GET and POST
// Use /api/auth/logout to work with Nginx proxy
app.get('/api/auth/logout', (req, res) => {
    // Destroy session if it exists
    if (req.session) {
        req.session.destroy(() => {
            res.redirect(`${process.env.FRONTEND_URL || 'http://76.13.122.125'}?auth=logout`);
        });
    } else {
        res.redirect(`${process.env.FRONTEND_URL || 'http://76.13.122.125'}?auth=logout`);
    }
});

app.post('/api/auth/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(() => {
            res.json({ success: true });
        });
    } else {
        res.json({ success: true });
    }
});

// Keep old route for backward compatibility
app.get('/auth/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(() => {
            res.redirect(`${process.env.FRONTEND_URL || 'http://76.13.122.125'}?auth=logout`);
        });
    } else {
        res.redirect(`${process.env.FRONTEND_URL || 'http://76.13.122.125'}?auth=logout`);
    }
});

app.post('/auth/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(() => {
            res.json({ success: true });
        });
    } else {
        res.json({ success: true });
    }
});

// Dashboard routes
app.get('/api/dashboard/stats', (req, res) => {
    const userId = req.query.userId || 'gaston';
    
    // Get counts from SQLite
    const totalContacts = db.prepare('SELECT COUNT(*) as count FROM contacts').get().count;
    const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
    const pendingTasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE status != ?').get('completed').count;
    const completedTasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE status = ?').get('completed').count;
    const totalProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;
    const totalNotes = db.prepare('SELECT COUNT(*) as count FROM notes').get().count;
    
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Get recent activity
    const recentContacts = db.prepare('SELECT * FROM contacts ORDER BY createdAt DESC LIMIT 5').all();
    const recentActivity = recentContacts.map(contact => ({
        type: 'contact',
        message: `Nuevo contacto: ${contact.name}`,
        timestamp: contact.createdAt
    }));
    
    res.json({
        success: true,
        stats: {
            totalConversations: 0,
            totalContacts,
            totalProjects,
            totalTasks,
            totalNotes,
            pendingTasks,
            completedTasks,
            completionRate,
            whatsappConnected: false,
            totalEmails: 0,
            unreadEmails: 0
        },
        recentActivity,
        timestamp: new Date().toISOString(),
        storage: 'SQLite'
    });
});

app.get('/api/dashboard/activity', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    
    const recentContacts = db.prepare('SELECT * FROM contacts ORDER BY createdAt DESC LIMIT ?').all(limit);
    const recentTasks = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC LIMIT ?').all(limit);
    
    const activity = [
        ...recentContacts.map(c => ({
            type: 'contact',
            title: c.name,
            timestamp: c.createdAt,
            description: c.email || c.phone
        })),
        ...recentTasks.map(t => ({
            type: 'task',
            title: t.title,
            timestamp: t.createdAt,
            description: t.description,
            status: t.status
        }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
    
    res.json({
        success: true,
        activity,
        timestamp: new Date().toISOString()
    });
});

// Chat routes
app.get('/api/chat/history/:userId', (req, res) => {
    const { userId } = req.params;
    
    // Get or create conversation for user
    let conversation = db.prepare('SELECT * FROM conversations WHERE userId = ? ORDER BY updatedAt DESC LIMIT 1').get(userId);
    
    if (!conversation) {
        // Create new conversation
        const insert = db.prepare('INSERT INTO conversations (userId, messages) VALUES (?, ?)');
        const result = insert.run(userId, JSON.stringify([]));
        conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(result.lastInsertRowid);
    }
    
    const messages = JSON.parse(conversation.messages || '[]');
    
    res.json({
        success: true,
        messages,
        conversationId: conversation.id
    });
});

app.post('/api/chat/message', async (req, res) => {
    try {
        const { message, userId = 'gaston' } = req.body;
        
        // Get or create conversation
        let conversation = db.prepare('SELECT * FROM conversations WHERE userId = ? ORDER BY updatedAt DESC LIMIT 1').get(userId);
        
        if (!conversation) {
            const insert = db.prepare('INSERT INTO conversations (userId, messages) VALUES (?, ?)');
            const result = insert.run(userId, JSON.stringify([]));
            conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(result.lastInsertRowid);
        }
        
        const messages = JSON.parse(conversation.messages || '[]');
        
        // Add user message
        const userMessage = {
            from: 'user',
            text: message,
            type: 'text',
            timestamp: new Date().toISOString()
        };
        messages.push(userMessage);
        
        // Call OpenAI for response
        const { getModel } = require('./config/openai.config');
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        const completion = await openai.chat.completions.create({
            model: getModel(),
            messages: [
                { role: 'system', content: 'Eres Eva, una asistente inteligente y útil. Responde de manera concisa y amigable.' },
                ...messages.slice(-10).map(m => ({
                    role: m.from === 'user' ? 'user' : 'assistant',
                    content: m.text
                }))
            ]
        });
        
        const evaResponse = completion.choices[0].message.content;
        
        // Add Eva's response
        const evaMessage = {
            from: 'eva',
            text: evaResponse,
            type: 'text',
            timestamp: new Date().toISOString()
        };
        messages.push(evaMessage);
        
        // Update conversation in DB
        const update = db.prepare('UPDATE conversations SET messages = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?');
        update.run(JSON.stringify(messages), conversation.id);
        
        res.json({
            success: true,
            message: evaMessage,
            conversationId: conversation.id
        });
        
    } catch (error) {
        console.error('❌ Error in chat:', error);
        res.status(500).json({
            success: false,
            error: 'Error processing chat message',
            message: {
                from: 'eva',
                text: 'Lo siento, hubo un error. Por favor intenta de nuevo.',
                type: 'text',
                timestamp: new Date().toISOString()
            }
        });
    }
});

// Email routes (stub for now)
app.get('/api/email/messages', (req, res) => {
    res.json({
        success: true,
        messages: [],
        total: 0,
        folder: req.query.folder || 'INBOX'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Eva Backend running on port ${PORT}`);
    console.log(`📊 Database: SQLite`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
