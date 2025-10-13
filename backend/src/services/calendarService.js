const googleAuthService = require('./googleAuthService');
const sessionStorage = require('./sessionStorageService');

class CalendarService {
  constructor() {
    this.userSessions = new Map(); // Runtime cache
    this.loadExistingSessions();
  }

  // Load existing sessions from persistent storage
  async loadExistingSessions() {
    try {
      const sessions = await sessionStorage.listGoogleSessions();
      for (const session of sessions) {
        this.userSessions.set(session.userId, session);
      }
      console.log(`📅 Loaded ${sessions.length} existing Google calendar sessions`);
    } catch (error) {
      console.error('❌ Error loading existing calendar sessions:', error);
    }
  }

  // Set user session for calendar access
  async setUserSession(userId, sessionData) {
    const sessionWithLastUsed = {
      tokens: sessionData.tokens,
      user: sessionData.user,
      lastUsed: new Date()
    };
    
    this.userSessions.set(userId, sessionWithLastUsed);
    
    // Save to persistent storage
    await sessionStorage.saveGoogleSession(userId, sessionWithLastUsed);
  }

  // Get user session for calendar access
  async getUserSession(userId) {
    // Try runtime cache first
    let session = this.userSessions.get(userId);
    
    // If not in cache, try persistent storage
    if (!session) {
      session = await sessionStorage.loadGoogleSession(userId);
      if (session) {
        this.userSessions.set(userId, session);
      }
    }
    
    return session;
  }

  // Create calendar event on behalf of user
  async createEvent(userId, eventData) {
    const session = await this.getUserSession(userId);
    
    if (!session || !session.tokens) {
      throw new Error('Usuario no autenticado con Google');
    }

    try {
      const calendar = googleAuthService.getCalendarClient(session.tokens);
      
      const { 
        summary, 
        description, 
        startDateTime, 
        endDateTime, 
        timeZone = 'America/Mexico_City',
        attendees = [],
        location 
      } = eventData;
      
      // Build event object
      const event = {
        summary,
        description,
        start: {
          dateTime: startDateTime,
          timeZone: timeZone,
        },
        end: {
          dateTime: endDateTime,
          timeZone: timeZone,
        },
        attendees: attendees.map(email => ({ email })),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      };

      if (location) {
        event.location = location;
      }
      
      const result = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        sendUpdates: 'all' // Send email invitations
      });
      
      // Update last used timestamp
      session.lastUsed = new Date();
      
      return {
        success: true,
        eventId: result.data.id,
        eventLink: result.data.htmlLink,
        createdBy: session.user.email,
        createdAt: new Date().toISOString(),
        event: result.data
      };
      
    } catch (error) {
      console.error('Error creating calendar event:', error);
      
      // If token expired, try to refresh
      if (error.message.includes('invalid_grant') || error.message.includes('unauthorized')) {
        try {
          const newTokens = await googleAuthService.refreshTokenIfNeeded(session.tokens);
          session.tokens = newTokens;
          
          // Retry creating event with new token
          return await this.createEvent(userId, eventData);
        } catch (refreshError) {
          throw new Error('Token de autenticación expirado. El usuario debe volver a iniciar sesión.');
        }
      }
      
      throw error;
    }
  }

  // Get user's calendar events
  async getEvents(userId, options = {}) {
    const session = await this.getUserSession(userId);
    
    if (!session || !session.tokens) {
      throw new Error('Usuario no autenticado con Google');
    }

    try {
      const calendar = googleAuthService.getCalendarClient(session.tokens);
      
      const {
        timeMin = new Date().toISOString(),
        timeMax,
        maxResults = 10,
        orderBy = 'startTime',
        singleEvents = true
      } = options;
      
      const result = await calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        maxResults,
        singleEvents,
        orderBy
      });
      
      session.lastUsed = new Date();
      
      return {
        success: true,
        events: result.data.items || [],
        nextPageToken: result.data.nextPageToken
      };
      
    } catch (error) {
      console.error('Error getting calendar events:', error);
      
      if (error.message.includes('invalid_grant') || error.message.includes('unauthorized')) {
        try {
          const newTokens = await googleAuthService.refreshTokenIfNeeded(session.tokens);
          session.tokens = newTokens;
          
          return await this.getEvents(userId, options);
        } catch (refreshError) {
          throw new Error('Token de autenticación expirado. El usuario debe volver a iniciar sesión.');
        }
      }
      
      throw error;
    }
  }

  // Update calendar event
  async updateEvent(userId, eventId, updateData) {
    const session = await this.getUserSession(userId);
    
    if (!session || !session.tokens) {
      throw new Error('Usuario no autenticado con Google');
    }

    try {
      const calendar = googleAuthService.getCalendarClient(session.tokens);
      
      // First get the existing event
      const existingEvent = await calendar.events.get({
        calendarId: 'primary',
        eventId: eventId
      });

      // Merge with updates
      const updatedEvent = {
        ...existingEvent.data,
        ...updateData
      };

      const result = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: updatedEvent,
        sendUpdates: 'all'
      });
      
      session.lastUsed = new Date();
      
      return {
        success: true,
        eventId: result.data.id,
        eventLink: result.data.htmlLink,
        updatedBy: session.user.email,
        updatedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  // Delete calendar event
  async deleteEvent(userId, eventId) {
    const session = await this.getUserSession(userId);
    
    if (!session || !session.tokens) {
      throw new Error('Usuario no autenticado con Google');
    }

    try {
      const calendar = googleAuthService.getCalendarClient(session.tokens);
      
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all'
      });
      
      session.lastUsed = new Date();
      
      return {
        success: true,
        deletedBy: session.user.email,
        deletedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  // Check if user can access calendar
  async canUserAccessCalendar(userId) {
    const session = await this.getUserSession(userId);
    return !!(session && session.tokens);
  }

  // Get user calendar info
  async getUserCalendarInfo(userId) {
    const session = await this.getUserSession(userId);
    
    if (!session) {
      return null;
    }

    return {
      email: session.user.email,
      name: session.user.name,
      canAccessCalendar: !!session.tokens,
      lastUsed: session.lastUsed
    };
  }

  // Clean expired sessions (call periodically)
  cleanExpiredSessions() {
    const expiredTime = 24 * 60 * 60 * 1000; // 24 hours
    const now = new Date();
    
    for (const [userId, session] of this.userSessions.entries()) {
      if (now - session.lastUsed > expiredTime) {
        this.userSessions.delete(userId);
      }
    }
  }
}

module.exports = new CalendarService();