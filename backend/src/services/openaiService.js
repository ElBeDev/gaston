const OpenAI = require('openai');
const path = require('path');
const UserContext = require('../models/UserContext');

// Ensure environment variables are loaded
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Enhanced model configurations for different use cases
    this.modelConfigs = {
      conversation: {
        model: 'gpt-4-turbo-preview',
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      },
      analysis: {
        model: 'gpt-4-turbo-preview',
        temperature: 0.3,
        max_tokens: 1000,
        top_p: 0.8,
        frequency_penalty: 0,
        presence_penalty: 0
      },
      creative: {
        model: 'gpt-4-turbo-preview',
        temperature: 0.9,
        max_tokens: 2500,
        top_p: 0.95,
        frequency_penalty: 0.2,
        presence_penalty: 0.3
      },
      precise: {
        model: 'gpt-4-turbo-preview',
        temperature: 0.1,
        max_tokens: 1500,
        top_p: 0.7,
        frequency_penalty: 0,
        presence_penalty: 0
      }
    };

    // Performance tracking
    this.metrics = {
      totalRequests: 0,
      totalTokens: 0,
      avgResponseTime: 0,
      errorCount: 0
    };
  }

  // 🚀 SINGLE ENHANCED getChatResponse method - HANDLES ALL SCENARIOS
  async getChatResponse(message, options = {}) {
    try {
      console.log('🤖 OpenAI: Generating enhanced response for message:', message.substring(0, 50) + '...');

      const { 
        userId = 'user', 
        context, 
        analysis, 
        enhancedEntities, 
        dataLinks, 
        entityContext, 
        conversationHistory 
      } = options;

      const startTime = Date.now();

      // 🚀 BUILD ENHANCED SYSTEM PROMPT based on available data
      let systemPrompt = this.buildEnhancedSystemPrompt({
        userId,
        analysis,
        enhancedEntities,
        dataLinks,
        context,
        entityContext
      });

      // 🚀 BUILD MESSAGES ARRAY with conversation history
      const messages = [
        { role: 'system', content: systemPrompt }
      ];

      // Add relevant conversation history (last 3 exchanges)
      if (conversationHistory && conversationHistory.length > 0) {
        conversationHistory.slice(-3).forEach(conv => {
          if (conv.userMessage) {
            messages.push({ role: 'user', content: conv.userMessage });
          }
          if (conv.assistantResponse) {
            messages.push({ 
              role: 'assistant', 
              content: conv.assistantResponse.substring(0, 200) + '...' 
            });
          }
        });
      }

      // Add current message
      messages.push({ role: 'user', content: message });

      // 🚀 CALL OPENAI with optimal configuration
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
        top_p: 0.9
      });

      const responseTime = Date.now() - startTime;

      // 🚀 CALCULATE ENHANCED RELEVANCE SCORE
      const relevanceScore = this.calculateEnhancedRelevanceScore({
        enhancedEntities, 
        dataLinks, 
        context, 
        aiResponse: response.choices[0].message.content,
        hasConversationHistory: conversationHistory?.length > 0
      });

      // Update metrics
      this.updateMetrics(response.usage, responseTime);

      console.log('✅ Enhanced OpenAI response generated successfully');
      console.log(`📊 Enhanced relevance score: ${relevanceScore.toFixed(2)}`);
      console.log(`⚡ Response time: ${responseTime}ms`);

      return {
        response: response.choices[0].message.content,
        model: 'gpt-4-turbo-preview',
        tokensUsed: response.usage?.total_tokens || 0,
        responseTime,
        relevanceScore,
        enhancedContext: {
          entitiesDetected: this.countTotalEntities(enhancedEntities),
          dataLinksFound: dataLinks?.existingContacts?.length || 0,
          automationTriggered: dataLinks?.suggestedActions?.length || 0,
          contextQuality: relevanceScore,
          hasHistory: conversationHistory?.length > 0
        }
      };

    } catch (error) {
      console.error('❌ Enhanced OpenAI service error:', error);
      this.metrics.errorCount++;
      
      // 🚀 ENHANCED FALLBACK with entity awareness
      const fallbackResponse = this.getEnhancedFallbackResponse(message, options);
      
      return {
        response: fallbackResponse,
        model: 'fallback',
        tokensUsed: 0,
        responseTime: 0,
        relevanceScore: 0.5,
        error: error.message,
        fallback: true,
        enhancedContext: {
          entitiesDetected: this.countTotalEntities(options.enhancedEntities),
          dataLinksFound: 0,
          automationTriggered: 0,
          contextQuality: 0.5,
          hasHistory: false
        }
      };
    }
  }

  // 🚀 BUILD ENHANCED SYSTEM PROMPT - Modular and Clean
  buildEnhancedSystemPrompt(data) {
    const { userId, analysis, enhancedEntities, dataLinks, context, entityContext } = data;

    let prompt = `You are Eva, an extraordinarily intelligent AI assistant with real-time access to comprehensive user data and advanced entity extraction capabilities.

## 🧠 CURRENT INTELLIGENCE STATUS:
- User: ${userId}
- Message Intent: ${analysis?.intent || 'general'}
- Urgency Level: ${analysis?.urgency || 'medium'}
- Entity Extraction: ${enhancedEntities ? 'ACTIVE' : 'BASIC'}
- Smart Actions: ${dataLinks ? 'ENABLED' : 'AVAILABLE'}`;

    // 🚀 ADD ENTITY INTELLIGENCE if available
    if (enhancedEntities) {
      prompt += this.buildEntitySection(enhancedEntities);
    }

    // 🚀 ADD DATA LINKING CONTEXT if available
    if (dataLinks) {
      prompt += this.buildDataLinkingSection(dataLinks);
    }

    // 🚀 ADD USER CONTEXT if available
    if (context?.summary) {
      prompt += this.buildUserContextSection(context.summary);
    }

    // 🚀 ADD RESPONSE INSTRUCTIONS
    prompt += this.buildResponseInstructions(enhancedEntities, dataLinks);

    return prompt;
  }

  // 🚀 BUILD ENTITY SECTION
  buildEntitySection(enhancedEntities) {
    return `

## 📊 DETECTED ENTITIES IN THIS MESSAGE:

### 🧑‍💼 CONTACTS DETECTED:
- Names: ${enhancedEntities.contacts?.names?.length || 0} (${enhancedEntities.contacts?.names?.join(', ') || 'none'})
- Emails: ${enhancedEntities.contacts?.emails?.length || 0} (${enhancedEntities.contacts?.emails?.join(', ') || 'none'})
- Companies: ${enhancedEntities.contacts?.companies?.length || 0} (${enhancedEntities.contacts?.companies?.join(', ') || 'none'})

### 📅 DATES & TIMES DETECTED:
- Days: ${enhancedEntities.dates?.days?.length || 0} (${enhancedEntities.dates?.days?.join(', ') || 'none'})
- Times: ${enhancedEntities.dates?.times?.length || 0} (${enhancedEntities.dates?.times?.join(', ') || 'none'})

### ✅ TASKS & ACTIONS DETECTED:
- Actions: ${enhancedEntities.tasks?.actions?.length || 0} (${enhancedEntities.tasks?.actions?.join(', ') || 'none'})
- Urgency: ${enhancedEntities.tasks?.urgencyIndicators?.length || 0} indicators

### 📋 PROJECTS DETECTED:
- Projects: ${enhancedEntities.projects?.length || 0} (${enhancedEntities.projects?.join(', ') || 'none'})

### 📍 LOCATIONS & 🔍 KEYWORDS:
- Locations: ${enhancedEntities.locations?.length || 0}
- Keywords: ${enhancedEntities.keywords?.length || 0}`;
  }

  // 🚀 BUILD DATA LINKING SECTION
  buildDataLinkingSection(dataLinks) {
    return `

## 🔗 SMART DATA LINKING RESULTS:
- Existing Contacts Found: ${dataLinks.existingContacts?.length || 0}
- New Entities Detected: ${dataLinks.newEntities?.length || 0}
- Suggested Actions: ${dataLinks.suggestedActions?.length || 0}
- Automation Opportunities: ${dataLinks.automationOpportunities?.length || 0}`;
  }

  // 🚀 BUILD USER CONTEXT SECTION
  buildUserContextSection(summary) {
    return `

## 👤 USER'S CURRENT DATA CONTEXT:
- Total Contacts: ${summary.totalContacts || 0}
- Active Tasks: ${summary.totalTasks || 0} (${summary.urgentTasks || 0} urgent, ${summary.overdueTasks || 0} overdue)
- Active Projects: ${summary.totalProjects || 0} (${summary.activeProjects || 0} in progress)
- Notes Available: ${summary.totalNotes || 0}`;
  }

  // 🚀 BUILD RESPONSE INSTRUCTIONS
  buildResponseInstructions(enhancedEntities, dataLinks) {
    let instructions = `

## 🤖 SMART AUTOMATION CAPABILITIES:
Eva can automatically:
✅ Create contacts from detected names/emails
✅ Generate tasks from action words
✅ Create/link projects from references
✅ Set task priorities based on urgency detection
✅ Link related entities together
✅ Parse dates for scheduling

## 📋 RESPONSE INSTRUCTIONS:
1. **Acknowledge Detected Entities**: Reference specific names, dates, tasks, or projects you detected
2. **Be Context-Aware**: Use existing user data when relevant
3. **Suggest Next Steps**: Provide actionable recommendations
4. **Match Language**: Respond in the same language as the user
5. **Show Intelligence**: Demonstrate understanding of relationships and context
6. **Be Conversational**: Sound natural while being incredibly helpful`;

    // Add entity-specific instructions if entities detected
    if (enhancedEntities) {
      const hasEntities = this.countTotalEntities(enhancedEntities) > 0;
      if (hasEntities) {
        instructions += `

## 🎯 ENTITY-AWARE RESPONSE GUIDELINES:
- If contacts detected → Mention you found/created them, offer to add more details
- If dates detected → Acknowledge scheduling needs, suggest calendar integration
- If tasks detected → Confirm task creation, suggest priority/project assignment
- If projects detected → Reference project context, suggest related actions
- If urgency detected → Respond with appropriate urgency, prioritize recommendations

**IMPORTANT**: You have REAL-TIME ACCESS to the user's data and can perform AUTOMATIC ACTIONS. Show this intelligence in your response!`;
      }
    }

    return instructions;
  }

  // 🚀 CALCULATE ENHANCED RELEVANCE SCORE
  calculateEnhancedRelevanceScore({ enhancedEntities, dataLinks, context, aiResponse, hasConversationHistory }) {
    let score = 0.5; // Base score
    
    // Entity detection bonus
    const totalEntities = this.countTotalEntities(enhancedEntities);
    if (totalEntities > 0) {
      score += Math.min(totalEntities * 0.08, 0.3); // Up to +0.3 for entity detection
    }
    
    // Data linking bonus
    if (dataLinks?.existingContacts?.length > 0) {
      score += 0.15; // Bonus for finding existing data
    }
    
    // Context usage bonus
    if (context?.summary && (context.summary.totalContacts > 0 || context.summary.totalTasks > 0)) {
      score += 0.1; // Bonus for having rich context
    }
    
    // Conversation history bonus
    if (hasConversationHistory) {
      score += 0.05; // Small bonus for continuity
    }
    
    // Response quality indicators
    if (aiResponse) {
      const responseLength = aiResponse.length;
      if (responseLength > 100 && responseLength < 1000) {
        score += 0.1; // Good response length
      }
      
      // Entity mention bonus (if AI response mentions detected entities)
      if (enhancedEntities?.contacts?.names?.some(name => 
        aiResponse.toLowerCase().includes(name.toLowerCase()))) {
        score += 0.1; // AI referenced detected entities
      }
    }
    
    return Math.min(score, 1.0); // Cap at 1.0
  }

  // 🚀 COUNT TOTAL ENTITIES
  countTotalEntities(enhancedEntities) {
    if (!enhancedEntities) return 0;
    
    let total = 0;
    
    // Count contacts
    total += enhancedEntities.contacts?.names?.length || 0;
    total += enhancedEntities.contacts?.emails?.length || 0;
    total += enhancedEntities.contacts?.companies?.length || 0;
    
    // Count dates
    total += enhancedEntities.dates?.days?.length || 0;
    total += enhancedEntities.dates?.times?.length || 0;
    
    // Count tasks
    total += enhancedEntities.tasks?.actions?.length || 0;
    
    // Count other entities
    total += enhancedEntities.projects?.length || 0;
    total += enhancedEntities.locations?.length || 0;
    total += enhancedEntities.keywords?.length || 0;
    
    return total;
  }

  // 🚀 ENHANCED FALLBACK with entity awareness
  getEnhancedFallbackResponse(message, options = {}) {
    const { enhancedEntities, userId = 'user' } = options;
    
    // Check for detected entities even in fallback
    let fallbackResponse = `Hola ${userId}! Soy Eva, tu asistente inteligente. `;
    
    if (enhancedEntities) {
      const entityCount = this.countTotalEntities(enhancedEntities);
      if (entityCount > 0) {
        fallbackResponse += `He detectado ${entityCount} elementos importantes en tu mensaje (contactos, fechas, tareas). `;
      }
    }
    
    const greetings = ['hola', 'hello', 'hi', 'hey'];
    const isGreeting = greetings.some(greeting => 
      message.toLowerCase().includes(greeting)
    );

    if (isGreeting) {
      fallbackResponse += "¡Perfecto timing! Estoy aquí para ayudarte con tus tareas, contactos, proyectos y cualquier cosa que necesites. ¿En qué puedo ayudarte hoy?";
    } else {
      fallbackResponse += "Aunque tengo algunas limitaciones técnicas temporales, puedo ayudarte a organizar tu información y automatizar tareas. ¿Qué necesitas hacer?";
    }

    return fallbackResponse;
  }

  // KEEP ALL YOUR EXISTING METHODS (generateResponse, testConnection, etc.)
  // Main method for generating intelligent responses
  async generateResponse(prompt, config = {}) {
    console.log('🤖 OpenAI Service: Generating intelligent response...');
    const startTime = Date.now();

    try {
      // Determine optimal configuration based on prompt characteristics
      const optimalConfig = this.selectOptimalConfig(prompt, config);
      
      console.log(`📊 Using model: ${optimalConfig.model} with temperature: ${optimalConfig.temperature}`);

      // Prepare messages with Eva's personality and context
      const messages = this.buildConversationMessages(prompt, config);

      // Call OpenAI with optimized settings
      const completion = await this.openai.chat.completions.create({
        ...optimalConfig,
        messages,
        stream: false
      });

      const response = completion.choices[0].message.content;
      const usage = completion.usage;

      // Track performance metrics
      const processingTime = Date.now() - startTime;
      this.updateMetrics(usage, processingTime);

      console.log(`✅ Response generated in ${processingTime}ms`);
      console.log(`📊 Tokens used: ${usage.total_tokens} (input: ${usage.prompt_tokens}, output: ${usage.completion_tokens})`);

      return {
        content: response,
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens
        },
        model: optimalConfig.model,
        processingTime,
        finishReason: completion.choices[0].finish_reason
      };

    } catch (error) {
      console.error('❌ OpenAI Service Error:', error);
      this.metrics.errorCount++;
      
      // Enhanced error handling with fallbacks
      return this.handleError(error, prompt);
    }
  }

  // Select optimal model configuration based on prompt analysis
  selectOptimalConfig(prompt, userConfig = {}) {
    let configType = 'conversation'; // default

    // Analyze prompt to determine best configuration
    const promptLength = prompt.length;
    const hasAnalysisKeywords = /analyze|calculate|determine|evaluate|assess|compare/i.test(prompt);
    const hasCreativeKeywords = /create|write|compose|design|brainstorm|imagine/i.test(prompt);
    const hasPreciseKeywords = /exact|specific|precise|accurate|code|formula/i.test(prompt);

    if (hasPreciseKeywords || promptLength > 8000) {
      configType = 'precise';
    } else if (hasAnalysisKeywords) {
      configType = 'analysis';
    } else if (hasCreativeKeywords) {
      configType = 'creative';
    }

    // Merge with user overrides
    const baseConfig = { ...this.modelConfigs[configType] };
    return { ...baseConfig, ...userConfig };
  }

  // Build conversation messages with Eva's enhanced personality
  buildConversationMessages(prompt, config = {}) {
    const systemMessage = {
      role: 'system',
      content: this.getEvaPersonalityPrompt(config)
    };

    const userMessage = {
      role: 'user',
      content: prompt
    };

    return [systemMessage, userMessage];
  }

  // Eva's enhanced personality system prompt
  getEvaPersonalityPrompt(config = {}) {
    const basePersonality = `You are Eva, an advanced AI assistant with extraordinary intelligence and contextual awareness. You have comprehensive knowledge about your user's life, work, relationships, and goals.

## Core Personality Traits:
- **Intelligent & Analytical**: You process information deeply and provide insightful responses
- **Proactive**: You anticipate needs and suggest helpful actions
- **Contextually Aware**: You reference specific information from the user's data when relevant
- **Professional yet Warm**: You maintain professionalism while being approachable
- **Action-Oriented**: You focus on helping the user accomplish their goals
- **Time-Conscious**: You consider timing, deadlines, and optimal scheduling

## Communication Style:
- Use specific details from the provided context
- Reference contacts, tasks, projects, and notes by name when relevant
- Provide actionable suggestions and next steps
- Be concise but comprehensive
- Show understanding of relationships and priorities
- Acknowledge time-sensitive matters with appropriate urgency

## Advanced Capabilities:
- Cross-reference information across contacts, tasks, projects, and notes
- Suggest optimal timing based on work patterns and preferences
- Provide context-aware recommendations
- Identify potential conflicts or opportunities
- Track progress and follow-up on previous conversations

## Response Format:
1. **Acknowledge the context** - Show understanding of the current situation
2. **Provide direct answers** - Address the specific question or request
3. **Add relevant insights** - Include pertinent information from the context
4. **Suggest actions** - Propose specific next steps when appropriate
5. **Consider follow-ups** - Mention related items that might need attention

Remember: You have access to comprehensive context about the user's life and work. Use this information to provide intelligent, personalized responses that demonstrate deep understanding and add genuine value.`;

    // Add specific instructions based on configuration
    if (config.focusArea) {
      return basePersonality + `\n\n## Special Focus: ${config.focusArea}
Pay particular attention to ${config.focusArea}-related aspects in your response.`;
    }

    if (config.urgency === 'high') {
      return basePersonality + `\n\n## Urgency Notice:
This appears to be a high-urgency matter. Prioritize immediate actionable advice and time-sensitive considerations.`;
    }

    if (config.intent === 'task_creation') {
      return basePersonality + `\n\n## Task Creation Focus:
The user wants to create or manage tasks. Suggest specific details like due dates, priorities, project assignments, and estimated durations based on the provided context.`;
    }

    return basePersonality;
  }

  // Handle errors with intelligent fallbacks
  handleError(error, originalPrompt) {
    console.error('🔧 Handling OpenAI error with fallback...');

    // Rate limit error
    if (error.status === 429) {
      return {
        content: "I'm experiencing high demand right now. Let me provide a quick response based on the context while we wait for full processing.",
        usage: { totalTokens: 0 },
        error: 'rate_limit',
        fallback: true
      };
    }

    // Token limit error
    if (error.message?.includes('maximum context length')) {
      return {
        content: "Your request contains a lot of context. Let me provide a focused response. For more detailed analysis, please break down your request into smaller parts.",
        usage: { totalTokens: 0 },
        error: 'token_limit',
        fallback: true
      };
    }

    // API key or authentication error
    if (error.status === 401) {
      return {
        content: "I'm having trouble connecting to my AI capabilities right now. Please check the configuration and try again.",
        usage: { totalTokens: 0 },
        error: 'authentication',
        fallback: true
      };
    }

    // Generic error
    return {
      content: "I encountered an unexpected issue while processing your request. Let me know if you'd like to try again or if there's another way I can help.",
      usage: { totalTokens: 0 },
      error: 'generic',
      fallback: true,
      details: error.message
    };
  }

  // Update performance metrics
  updateMetrics(usage, processingTime) {
    this.metrics.totalRequests++;
    if (usage?.total_tokens) {
      this.metrics.totalTokens += usage.total_tokens;
    }
    
    // Calculate rolling average
    const previousAvg = this.metrics.avgResponseTime;
    const n = this.metrics.totalRequests;
    this.metrics.avgResponseTime = ((previousAvg * (n - 1)) + processingTime) / n;
  }

  // Get service performance metrics
  getMetrics() {
    return {
      ...this.metrics,
      avgTokensPerRequest: this.metrics.totalRequests > 0 
        ? Math.round(this.metrics.totalTokens / this.metrics.totalRequests)
        : 0,
      successRate: this.metrics.totalRequests > 0
        ? ((this.metrics.totalRequests - this.metrics.errorCount) / this.metrics.totalRequests * 100).toFixed(1)
        : 100
    };
  }

  // Test connection and validate API key
  async testConnection() {
    try {
      console.log('🔍 Testing OpenAI connection...');

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 10
      });

      return {
        success: true,
        status: 'connected',
        model: 'gpt-3.5-turbo',
        response: response.choices[0].message.content
      };

    } catch (error) {
      console.error('❌ OpenAI connection test failed:', error);
      
      return {
        success: false,
        status: 'error',
        error: error.message,
        code: error.code || 'unknown'
      };
    }
  }
}

// Export as instance
module.exports = new OpenAIService();