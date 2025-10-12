const express = require('express');
const router = express.Router();
const GoogleWorkspaceService = require('../services/googleWorkspaceService');

// Initialize Google Workspace service
const googleService = new GoogleWorkspaceService();

/**
 * @route GET /api/google/auth/url
 * @description Get Google OAuth2 authorization URL
 */
router.get('/auth/url', async (req, res) => {
    try {
        const authUrl = googleService.getAuthUrl();
        
        res.json({
            success: true,
            authUrl,
            message: 'Visit this URL to authorize Eva to access your Google Workspace',
            scopes: googleService.scopes
        });
        
    } catch (error) {
        console.error('❌ Auth URL generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route POST /api/google/auth/callback
 * @description Handle OAuth2 callback and exchange code for tokens
 */
router.post('/auth/callback', async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({
                success: false,
                error: 'Authorization code is required'
            });
        }
        
        // Exchange code for tokens
        const tokenResult = await googleService.getTokens(code);
        if (!tokenResult.success) {
            return res.status(400).json(tokenResult);
        }
        
        // Initialize services with tokens
        const initResult = await googleService.initialize(
            tokenResult.tokens.access_token,
            tokenResult.tokens.refresh_token
        );
        
        if (initResult.success) {
            // Store tokens in session or database
            req.session.googleTokens = tokenResult.tokens;
            req.session.googleUserEmail = initResult.userEmail;
        }
        
        res.json({
            success: true,
            message: 'Google Workspace successfully connected',
            userEmail: initResult.userEmail,
            services: ['Gmail', 'Calendar', 'Drive']
        });
        
    } catch (error) {
        console.error('❌ OAuth callback error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route GET /api/google/status
 * @description Get Google Workspace connection status
 */
router.get('/status', async (req, res) => {
    try {
        const status = googleService.getStatus();
        
        res.json({
            success: true,
            status,
            session: {
                hasTokens: !!req.session.googleTokens,
                userEmail: req.session.googleUserEmail
            }
        });
        
    } catch (error) {
        console.error('❌ Status error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== GMAIL ROUTES ====================

/**
 * @route GET /api/google/gmail/emails
 * @description Get recent emails with intelligent filtering
 */
router.get('/gmail/emails', async (req, res) => {
    try {
        // Check authentication
        if (!req.session.googleTokens) {
            return res.status(401).json({
                success: false,
                error: 'Google Workspace not connected. Please authenticate first.'
            });
        }
        
        // Initialize if needed
        if (!googleService.isAuthenticated) {
            await googleService.initialize(
                req.session.googleTokens.access_token,
                req.session.googleTokens.refresh_token
            );
        }
        
        const options = {
            maxResults: parseInt(req.query.maxResults) || 20,
            timeframe: req.query.timeframe || '7d',
            importance: req.query.importance || 'all'
        };
        
        const result = await googleService.getRecentEmails(options);
        
        res.json({
            success: true,
            data: result,
            timestamp: new Date()
        });
        
    } catch (error) {
        console.error('❌ Gmail emails error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route GET /api/google/gmail/emails/:emailId/analyze
 * @description Analyze specific email with AI
 */
router.get('/gmail/emails/:emailId/analyze', async (req, res) => {
    try {
        if (!googleService.isAuthenticated) {
            await googleService.initialize(
                req.session.googleTokens.access_token,
                req.session.googleTokens.refresh_token
            );
        }
        
        const { emailId } = req.params;
        
        // Get email details
        const email = await googleService.getEmailDetails(emailId);
        if (!email) {
            return res.status(404).json({
                success: false,
                error: 'Email not found'
            });
        }
        
        // Analyze email
        const analysis = await googleService.analyzeEmail(email);
        
        res.json({
            success: true,
            email,
            analysis,
            timestamp: new Date()
        });
        
    } catch (error) {
        console.error('❌ Email analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route POST /api/google/gmail/emails/:emailId/respond
 * @description Generate and optionally send intelligent response
 */
router.post('/gmail/emails/:emailId/respond', async (req, res) => {
    try {
        if (!googleService.isAuthenticated) {
            await googleService.initialize(
                req.session.googleTokens.access_token,
                req.session.googleTokens.refresh_token
            );
        }
        
        const { emailId } = req.params;
        const { context, autoSend = false } = req.body;
        
        // Get email details
        const email = await googleService.getEmailDetails(emailId);
        if (!email) {
            return res.status(404).json({
                success: false,
                error: 'Email not found'
            });
        }
        
        // Generate response
        const response = await googleService.generateEmailResponse(email, context);
        
        // Send if requested and confidence is high
        if (autoSend && response.send_immediately && response.confidence > 0.8) {
            const sendResult = await googleService.sendEmail(
                email.from,
                response.subject,
                response.body
            );
            
            return res.json({
                success: true,
                response,
                sent: sendResult.success,
                messageId: sendResult.messageId
            });
        }
        
        res.json({
            success: true,
            response,
            sent: false,
            message: 'Response generated but not sent (requires manual approval)'
        });
        
    } catch (error) {
        console.error('❌ Email response error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route POST /api/google/gmail/send
 * @description Send email
 */
router.post('/gmail/send', async (req, res) => {
    try {
        if (!googleService.isAuthenticated) {
            await googleService.initialize(
                req.session.googleTokens.access_token,
                req.session.googleTokens.refresh_token
            );
        }
        
        const { to, subject, body, cc, bcc } = req.body;
        
        if (!to || !subject || !body) {
            return res.status(400).json({
                success: false,
                error: 'To, subject, and body are required'
            });
        }
        
        const result = await googleService.sendEmail(to, subject, body, { cc, bcc });
        
        res.json({
            success: true,
            result,
            timestamp: new Date()
        });
        
    } catch (error) {
        console.error('❌ Email send error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== CALENDAR ROUTES ====================

/**
 * @route GET /api/google/calendar/events
 * @description Get calendar events
 */
router.get('/calendar/events', async (req, res) => {
    try {
        if (!googleService.isAuthenticated) {
            await googleService.initialize(
                req.session.googleTokens.access_token,
                req.session.googleTokens.refresh_token
            );
        }
        
        const options = {
            timeMin: req.query.timeMin,
            timeMax: req.query.timeMax,
            maxResults: parseInt(req.query.maxResults) || 50
        };
        
        const result = await googleService.getCalendarEvents(options);
        
        res.json({
            success: true,
            data: result,
            timestamp: new Date()
        });
        
    } catch (error) {
        console.error('❌ Calendar events error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route POST /api/google/calendar/find-time
 * @description Find optimal meeting time
 */
router.post('/calendar/find-time', async (req, res) => {
    try {
        if (!googleService.isAuthenticated) {
            await googleService.initialize(
                req.session.googleTokens.access_token,
                req.session.googleTokens.refresh_token
            );
        }
        
        const { duration, attendees, timeframe, preferences } = req.body;
        
        const result = await googleService.findOptimalMeetingTime({
            duration: duration || 60,
            attendees: attendees || [],
            timeframe: timeframe || 'next_week',
            preferences: preferences || {}
        });
        
        res.json({
            success: true,
            data: result,
            timestamp: new Date()
        });
        
    } catch (error) {
        console.error('❌ Find time error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route POST /api/google/calendar/events
 * @description Create calendar event
 */
router.post('/calendar/events', async (req, res) => {
    try {
        if (!googleService.isAuthenticated) {
            await googleService.initialize(
                req.session.googleTokens.access_token,
                req.session.googleTokens.refresh_token
            );
        }
        
        const eventData = req.body;
        
        if (!eventData.summary || !eventData.start || !eventData.end) {
            return res.status(400).json({
                success: false,
                error: 'Summary, start, and end times are required'
            });
        }
        
        const result = await googleService.createCalendarEvent(eventData);
        
        res.json({
            success: true,
            data: result,
            timestamp: new Date()
        });
        
    } catch (error) {
        console.error('❌ Create event error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== DRIVE ROUTES ====================

/**
 * @route GET /api/google/drive/files
 * @description Get Drive files with intelligent search
 */
router.get('/drive/files', async (req, res) => {
    try {
        if (!googleService.isAuthenticated) {
            await googleService.initialize(
                req.session.googleTokens.access_token,
                req.session.googleTokens.refresh_token
            );
        }
        
        const options = {
            query: req.query.q || '',
            maxResults: parseInt(req.query.maxResults) || 20,
            fileType: req.query.type || 'all',
            timeframe: req.query.timeframe || 'all'
        };
        
        const result = await googleService.getDriveFiles(options);
        
        res.json({
            success: true,
            data: result,
            timestamp: new Date()
        });
        
    } catch (error) {
        console.error('❌ Drive files error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route POST /api/google/drive/organize
 * @description Analyze and suggest Drive organization
 */
router.post('/drive/organize', async (req, res) => {
    try {
        if (!googleService.isAuthenticated) {
            await googleService.initialize(
                req.session.googleTokens.access_token,
                req.session.googleTokens.refresh_token
            );
        }
        
        const result = await googleService.organizeDriveFiles(req.body);
        
        res.json({
            success: true,
            data: result,
            timestamp: new Date()
        });
        
    } catch (error) {
        console.error('❌ Drive organize error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== AUTOMATION ROUTES ====================

/**
 * @route POST /api/google/automate/email-processing
 * @description Process emails automatically with AI
 */
router.post('/automate/email-processing', async (req, res) => {
    try {
        if (!googleService.isAuthenticated) {
            await googleService.initialize(
                req.session.googleTokens.access_token,
                req.session.googleTokens.refresh_token
            );
        }
        
        const { maxEmails = 10, autoRespond = false } = req.body;
        
        // Get recent unread emails
        const emailsResult = await googleService.getRecentEmails({
            maxResults: maxEmails,
            importance: 'unread'
        });
        
        if (!emailsResult.success) {
            return res.status(500).json(emailsResult);
        }
        
        const processedEmails = [];
        
        // Process each email
        for (const email of emailsResult.emails) {
            const analysis = await googleService.analyzeEmail(email);
            
            let response = null;
            if (autoRespond && analysis.response_needed && analysis.priority !== 'low') {
                response = await googleService.generateEmailResponse(email);
                
                // Auto-send if confidence is very high
                if (response.confidence > 0.9 && response.send_immediately) {
                    await googleService.sendEmail(
                        email.from,
                        response.subject,
                        response.body
                    );
                    response.sent = true;
                }
            }
            
            processedEmails.push({
                email: {
                    id: email.id,
                    subject: email.subject,
                    from: email.from,
                    snippet: email.snippet
                },
                analysis,
                response
            });
        }
        
        res.json({
            success: true,
            data: {
                emails_processed: processedEmails.length,
                emails: processedEmails,
                auto_responses_sent: processedEmails.filter(e => e.response?.sent).length
            },
            timestamp: new Date()
        });
        
    } catch (error) {
        console.error('❌ Email automation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
