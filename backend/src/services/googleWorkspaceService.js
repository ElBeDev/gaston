const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const OpenAI = require('openai');

class GoogleWorkspaceService {
    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        // Google OAuth2 Configuration
        this.oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback'
        );
        
        // Google API Services
        this.gmail = null;
        this.calendar = null;
        this.drive = null;
        
        // Configuration
        this.isAuthenticated = false;
        this.userEmail = null;
        this.scopes = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.modify',
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/drive.readonly',
            'https://www.googleapis.com/auth/drive.file'
        ];
    }

    /**
     * Initialize Google Workspace services
     */
    async initialize(accessToken, refreshToken) {
        try {
            // Set credentials
            this.oauth2Client.setCredentials({
                access_token: accessToken,
                refresh_token: refreshToken
            });
            
            // Initialize services
            this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
            this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
            this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
            
            this.isAuthenticated = true;
            
            // Get user profile
            const profile = await this.gmail.users.getProfile({ userId: 'me' });
            this.userEmail = profile.data.emailAddress;
            
            console.log(`✅ Google Workspace initialized for: ${this.userEmail}`);
            return { success: true, userEmail: this.userEmail };
            
        } catch (error) {
            console.error('❌ Google Workspace initialization failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get OAuth2 authorization URL
     */
    getAuthUrl() {
        const authUrl = this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.scopes,
            prompt: 'consent'
        });
        
        return authUrl;
    }

    /**
     * Exchange authorization code for tokens
     */
    async getTokens(authCode) {
        try {
            const { tokens } = await this.oauth2Client.getToken(authCode);
            return { success: true, tokens };
        } catch (error) {
            console.error('❌ Token exchange failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ==================== GMAIL AUTOMATION ====================

    /**
     * Get recent emails with intelligent filtering
     */
    async getRecentEmails(options = {}) {
        const { maxResults = 20, timeframe = '7d', importance = 'all' } = options;
        
        try {
            // Build query based on options
            let query = '';
            if (timeframe === '1d') query += 'newer_than:1d ';
            if (timeframe === '7d') query += 'newer_than:7d ';
            if (importance === 'important') query += 'is:important ';
            if (importance === 'unread') query += 'is:unread ';
            
            const response = await this.gmail.users.messages.list({
                userId: 'me',
                maxResults,
                q: query.trim()
            });
            
            const emails = [];
            if (response.data.messages) {
                for (const message of response.data.messages.slice(0, 10)) {
                    const email = await this.getEmailDetails(message.id);
                    if (email) emails.push(email);
                }
            }
            
            return {
                success: true,
                emails,
                total: response.data.resultSizeEstimate || 0
            };
            
        } catch (error) {
            console.error('❌ Error getting emails:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get detailed email information
     */
    async getEmailDetails(messageId) {
        try {
            const response = await this.gmail.users.messages.get({
                userId: 'me',
                id: messageId,
                format: 'full'
            });
            
            const message = response.data;
            const headers = message.payload.headers;
            
            // Extract key information
            const email = {
                id: messageId,
                threadId: message.threadId,
                subject: this.getHeader(headers, 'Subject') || 'No Subject',
                from: this.getHeader(headers, 'From'),
                to: this.getHeader(headers, 'To'),
                date: this.getHeader(headers, 'Date'),
                snippet: message.snippet,
                body: this.extractEmailBody(message.payload),
                labels: message.labelIds || [],
                isUnread: message.labelIds?.includes('UNREAD') || false,
                isImportant: message.labelIds?.includes('IMPORTANT') || false
            };
            
            return email;
            
        } catch (error) {
            console.error(`❌ Error getting email ${messageId}:`, error);
            return null;
        }
    }

    /**
     * Analyze email with AI for intelligent processing
     */
    async analyzeEmail(email) {
        const prompt = `
        Analyze this email for intelligent processing:
        
        Subject: ${email.subject}
        From: ${email.from}
        Body: ${email.body?.substring(0, 1000) || email.snippet}
        
        Provide analysis in JSON format:
        {
            "category": "work|personal|promotion|notification|urgent",
            "priority": "high|medium|low",
            "sentiment": "positive|neutral|negative",
            "action_required": boolean,
            "suggested_actions": ["action1", "action2"],
            "key_topics": ["topic1", "topic2"],
            "response_needed": boolean,
            "estimated_read_time": "minutes",
            "summary": "brief summary"
        }
        `;

        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1,
                response_format: { type: "json_object" }
            });

            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error('❌ Email analysis failed:', error);
            return {
                category: 'unknown',
                priority: 'medium',
                action_required: false,
                summary: 'Analysis failed'
            };
        }
    }

    /**
     * Generate intelligent email response
     */
    async generateEmailResponse(email, context = {}) {
        const analysis = await this.analyzeEmail(email);
        
        const prompt = `
        Generate an intelligent email response:
        
        Original Email:
        Subject: ${email.subject}
        From: ${email.from}
        Body: ${email.body?.substring(0, 1000) || email.snippet}
        
        Analysis: ${JSON.stringify(analysis)}
        Context: ${JSON.stringify(context)}
        
        Generate response in JSON format:
        {
            "subject": "Re: appropriate subject",
            "body": "professional email response",
            "tone": "professional|friendly|formal",
            "confidence": "0.0-1.0",
            "send_immediately": boolean,
            "schedule_for": "datetime or null"
        }
        `;

        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.2,
                response_format: { type: "json_object" }
            });

            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error('❌ Response generation failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send email
     */
    async sendEmail(to, subject, body, options = {}) {
        try {
            const { cc, bcc, attachments } = options;
            
            // Create email message
            const emailLines = [
                `To: ${to}`,
                `Subject: ${subject}`,
                cc ? `Cc: ${cc}` : '',
                bcc ? `Bcc: ${bcc}` : '',
                'Content-Type: text/html; charset=utf-8',
                '',
                body
            ].filter(line => line !== '');
            
            const email = emailLines.join('\r\n');
            const encodedEmail = Buffer.from(email).toString('base64url');
            
            const response = await this.gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedEmail
                }
            });
            
            return {
                success: true,
                messageId: response.data.id,
                threadId: response.data.threadId
            };
            
        } catch (error) {
            console.error('❌ Email sending failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ==================== CALENDAR AUTOMATION ====================

    /**
     * Get calendar events with intelligent filtering
     */
    async getCalendarEvents(options = {}) {
        const { 
            timeMin = new Date().toISOString(),
            timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            maxResults = 50 
        } = options;
        
        try {
            const response = await this.calendar.events.list({
                calendarId: 'primary',
                timeMin,
                timeMax,
                maxResults,
                singleEvents: true,
                orderBy: 'startTime'
            });
            
            const events = response.data.items || [];
            
            return {
                success: true,
                events: events.map(event => ({
                    id: event.id,
                    summary: event.summary,
                    description: event.description,
                    start: event.start,
                    end: event.end,
                    attendees: event.attendees || [],
                    location: event.location,
                    status: event.status,
                    organizer: event.organizer
                })),
                total: events.length
            };
            
        } catch (error) {
            console.error('❌ Error getting calendar events:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Find optimal meeting time
     */
    async findOptimalMeetingTime(options = {}) {
        const { 
            duration = 60, // minutes
            attendees = [],
            timeframe = 'next_week',
            preferences = {}
        } = options;
        
        try {
            // Get current calendar events
            const events = await this.getCalendarEvents({
                timeMax: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 2 weeks
            });
            
            if (!events.success) {
                return events;
            }
            
            // Analyze calendar and find free slots
            const freeSlots = this.findFreeTimeSlots(events.events, duration, preferences);
            
            // Score and rank time slots
            const rankedSlots = await this.rankTimeSlots(freeSlots, attendees, preferences);
            
            return {
                success: true,
                optimal_slots: rankedSlots.slice(0, 5),
                total_options: rankedSlots.length
            };
            
        } catch (error) {
            console.error('❌ Error finding optimal time:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create calendar event
     */
    async createCalendarEvent(eventData) {
        try {
            const {
                summary,
                description,
                start,
                end,
                attendees = [],
                location,
                reminders = [{ method: 'email', minutes: 15 }]
            } = eventData;
            
            const event = {
                summary,
                description,
                start: {
                    dateTime: start,
                    timeZone: 'America/Mexico_City'
                },
                end: {
                    dateTime: end,
                    timeZone: 'America/Mexico_City'
                },
                attendees: attendees.map(email => ({ email })),
                location,
                reminders: {
                    useDefault: false,
                    overrides: reminders
                }
            };
            
            const response = await this.calendar.events.insert({
                calendarId: 'primary',
                requestBody: event,
                sendUpdates: 'all'
            });
            
            return {
                success: true,
                event: response.data,
                eventId: response.data.id,
                meetingLink: response.data.htmlLink
            };
            
        } catch (error) {
            console.error('❌ Event creation failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ==================== DRIVE AUTOMATION ====================

    /**
     * Get Drive files with intelligent search
     */
    async getDriveFiles(options = {}) {
        const { 
            query = '',
            maxResults = 20,
            fileType = 'all',
            timeframe = 'all'
        } = options;
        
        try {
            let searchQuery = '';
            
            if (query) searchQuery += `name contains '${query}' or fullText contains '${query}'`;
            if (fileType !== 'all') {
                const mimeTypes = {
                    'docs': 'application/vnd.google-apps.document',
                    'sheets': 'application/vnd.google-apps.spreadsheet',
                    'slides': 'application/vnd.google-apps.presentation',
                    'pdf': 'application/pdf'
                };
                if (mimeTypes[fileType]) {
                    searchQuery += searchQuery ? ` and mimeType='${mimeTypes[fileType]}'` : `mimeType='${mimeTypes[fileType]}'`;
                }
            }
            
            if (timeframe === 'recent') {
                const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
                searchQuery += searchQuery ? ` and modifiedTime > '${oneWeekAgo}'` : `modifiedTime > '${oneWeekAgo}'`;
            }
            
            const response = await this.drive.files.list({
                q: searchQuery || undefined,
                pageSize: maxResults,
                fields: 'files(id,name,mimeType,modifiedTime,webViewLink,thumbnailLink,size,owners)'
            });
            
            const files = response.data.files || [];
            
            return {
                success: true,
                files: files.map(file => ({
                    id: file.id,
                    name: file.name,
                    type: file.mimeType,
                    modified: file.modifiedTime,
                    link: file.webViewLink,
                    thumbnail: file.thumbnailLink,
                    size: file.size,
                    owner: file.owners?.[0]?.displayName
                })),
                total: files.length
            };
            
        } catch (error) {
            console.error('❌ Error getting Drive files:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Organize Drive files intelligently
     */
    async organizeDriveFiles(options = {}) {
        try {
            // Get all files
            const filesResult = await this.getDriveFiles({ maxResults: 100 });
            if (!filesResult.success) return filesResult;
            
            const files = filesResult.files;
            const organizationPlan = await this.createOrganizationPlan(files);
            
            return {
                success: true,
                analysis: organizationPlan,
                files_analyzed: files.length,
                suggestions: organizationPlan.suggestions
            };
            
        } catch (error) {
            console.error('❌ Drive organization failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Extract email body from payload
     */
    extractEmailBody(payload) {
        let body = '';
        
        if (payload.body && payload.body.data) {
            body = Buffer.from(payload.body.data, 'base64').toString();
        } else if (payload.parts) {
            for (const part of payload.parts) {
                if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
                    if (part.body && part.body.data) {
                        body += Buffer.from(part.body.data, 'base64').toString();
                    }
                }
            }
        }
        
        return body;
    }

    /**
     * Get header value from email headers
     */
    getHeader(headers, name) {
        const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
        return header ? header.value : null;
    }

    /**
     * Find free time slots in calendar
     */
    findFreeTimeSlots(events, duration, preferences = {}) {
        const slots = [];
        const workingHours = preferences.workingHours || { start: 9, end: 17 };
        
        // Implementation for finding free slots
        // This is a simplified version - real implementation would be more complex
        
        const now = new Date();
        for (let i = 1; i <= 14; i++) { // Next 14 days
            const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
            
            // Skip weekends if preference set
            if (preferences.weekdaysOnly && (date.getDay() === 0 || date.getDay() === 6)) {
                continue;
            }
            
            // Add morning slot
            slots.push({
                start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), workingHours.start),
                end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), workingHours.start + 1),
                score: 0.8
            });
            
            // Add afternoon slot
            slots.push({
                start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 14),
                end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 15),
                score: 0.9
            });
        }
        
        return slots.slice(0, 10); // Return top 10 slots
    }

    /**
     * Rank time slots based on various factors
     */
    async rankTimeSlots(slots, attendees, preferences) {
        // Score slots based on preferences, attendee availability, etc.
        return slots.sort((a, b) => b.score - a.score);
    }

    /**
     * Create organization plan for Drive files
     */
    async createOrganizationPlan(files) {
        const prompt = `
        Analyze these Drive files and suggest organization:
        
        Files: ${JSON.stringify(files.slice(0, 20), null, 2)}
        
        Provide organization suggestions in JSON:
        {
            "suggested_folders": ["folder1", "folder2"],
            "file_categorization": [
                {"file_id": "id", "suggested_folder": "folder", "reason": "reason"}
            ],
            "naming_improvements": [
                {"file_id": "id", "current_name": "name", "suggested_name": "new_name"}
            ],
            "duplicate_candidates": [
                {"files": ["id1", "id2"], "confidence": "0.0-1.0"}
            ],
            "suggestions": ["suggestion1", "suggestion2"]
        }
        `;

        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1,
                response_format: { type: "json_object" }
            });

            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error('❌ Organization plan failed:', error);
            return {
                suggestions: ['Unable to analyze files for organization'],
                error: error.message
            };
        }
    }

    /**
     * Get service status
     */
    getStatus() {
        return {
            authenticated: this.isAuthenticated,
            userEmail: this.userEmail,
            services: {
                gmail: !!this.gmail,
                calendar: !!this.calendar,
                drive: !!this.drive
            },
            scopes: this.scopes.length,
            timestamp: new Date()
        };
    }
}

module.exports = GoogleWorkspaceService;
