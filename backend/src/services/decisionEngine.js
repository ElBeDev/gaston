const OpenAI = require('openai');
const MemoryService = require('./memoryService');
const EmotionalIntelligence = require('./emotionalIntelligence');
const Contact = require('../models/Contact');
const Task = require('../models/Task');
const Project = require('../models/Project');
const UserContext = require('../models/UserContext');

class DecisionEngine {
    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.memoryService = new MemoryService();
        this.emotionalIntelligence = new EmotionalIntelligence();
        
        // Decision rules and weights
        this.decisionRules = this.initializeDecisionRules();
        this.contextWeights = {
            emotional_state: 0.25,
            historical_patterns: 0.20,
            current_workload: 0.15,
            relationship_context: 0.15,
            business_priority: 0.25
        };
        
        // Decision history for learning
        this.decisionHistory = [];
        this.confidenceThreshold = 0.7;
    }

    /**
     * Initialize decision rules framework
     */
    initializeDecisionRules() {
        return {
            // Communication decisions
            communication: {
                response_urgency: {
                    immediate: { keywords: ['urgent', 'asap', 'emergency'], weight: 1.0 },
                    priority: { keywords: ['important', 'priority', 'deadline'], weight: 0.8 },
                    normal: { keywords: ['when possible', 'convenient'], weight: 0.5 },
                    low: { keywords: ['fyi', 'no rush'], weight: 0.2 }
                },
                response_style: {
                    formal: { triggers: ['client', 'vendor', 'executive'], tone: 'professional' },
                    friendly: { triggers: ['team', 'colleague', 'internal'], tone: 'warm' },
                    direct: { triggers: ['technical', 'data', 'report'], tone: 'concise' }
                }
            },

            // Task prioritization decisions
            task_prioritization: {
                urgency_factors: {
                    deadline_proximity: { weight: 0.3 },
                    stakeholder_importance: { weight: 0.25 },
                    business_impact: { weight: 0.25 },
                    dependency_blocking: { weight: 0.2 }
                },
                resource_allocation: {
                    time_availability: { weight: 0.4 },
                    skill_match: { weight: 0.3 },
                    energy_level: { weight: 0.3 }
                }
            },

            // Meeting scheduling decisions
            meeting_scheduling: {
                optimal_times: {
                    morning: { hours: [9, 10, 11], energy_level: 'high' },
                    afternoon: { hours: [14, 15, 16], energy_level: 'medium' },
                    late: { hours: [17, 18], energy_level: 'low' }
                },
                conflict_resolution: {
                    reschedule_lower_priority: { threshold: 0.3 },
                    find_alternative_time: { threshold: 0.6 },
                    decline_meeting: { threshold: 0.9 }
                }
            },

            // Project management decisions
            project_management: {
                milestone_assessment: {
                    on_track: { variance: 0.1, action: 'continue' },
                    minor_delay: { variance: 0.2, action: 'adjust_timeline' },
                    major_delay: { variance: 0.4, action: 'escalate_issue' }
                },
                resource_reallocation: {
                    skill_gap: { threshold: 0.7, action: 'find_expertise' },
                    capacity_overload: { threshold: 0.8, action: 'redistribute_tasks' }
                }
            }
        };
    }

    /**
     * Main decision making method
     * @param {Object} decisionParams - Decision parameters
     * @param {Object} context - Current context
     * @returns {Object} Decision result with confidence score
     */
    async makeDecision(decisionParams, context) {
        const { type, data, options, priority = 'medium' } = decisionParams;
        
        console.log(`🧠 DECISION ENGINE: Making decision for type: ${type}`);
        
        try {
            // Gather decision context
            const decisionContext = await this.gatherDecisionContext(type, data, context);
            
            // Analyze options using multiple frameworks
            const analysis = await this.analyzeOptions(type, options, decisionContext);
            
            // Apply decision rules
            const ruleBasedDecision = this.applyDecisionRules(type, analysis, decisionContext);
            
            // Get AI-powered insights
            const aiInsights = await this.getAIDecisionInsights(type, analysis, decisionContext);
            
            // Combine and weight different decision factors
            const finalDecision = await this.synthesizeDecision(ruleBasedDecision, aiInsights, decisionContext);
            
            // Store decision for learning
            await this.storeDecision(type, finalDecision, decisionContext);
            
            console.log(`✅ DECISION ENGINE: Decision made with confidence: ${finalDecision.confidence}`);
            return finalDecision;
            
        } catch (error) {
            console.error('❌ DECISION ENGINE: Error making decision:', error);
            return {
                success: false,
                error: error.message,
                fallbackRecommendation: 'Request human intervention'
            };
        }
    }

    /**
     * Gather comprehensive context for decision making
     */
    async gatherDecisionContext(type, data, context) {
        // Get emotional context
        const emotionalContext = await this.emotionalIntelligence.analyzeEmotionalContext({
            userMessages: context.recentMessages || [],
            currentMood: context.currentMood
        });

        // Get historical patterns
        const historicalPatterns = await this.memoryService.getHistoricalPatterns({
            userId: context.userId,
            decisionType: type,
            timeframe: '30_days'
        });

        // Get current workload
        const currentWorkload = await this.assessCurrentWorkload(context.userId);

        // Get relationship context
        const relationshipContext = await this.getRelationshipContext(data, context);

        return {
            emotional: emotionalContext,
            historical: historicalPatterns,
            workload: currentWorkload,
            relationships: relationshipContext,
            timestamp: new Date(),
            priority: data.priority || 'medium'
        };
    }

    /**
     * Analyze decision options using multiple frameworks
     */
    async analyzeOptions(type, options, decisionContext) {
        const analysis = {
            type,
            options: [],
            factors: {},
            constraints: []
        };

        // Analyze each option
        for (const option of options || []) {
            const optionAnalysis = await this.analyzeIndividualOption(option, decisionContext);
            analysis.options.push(optionAnalysis);
        }

        // Identify key decision factors
        analysis.factors = await this.identifyDecisionFactors(type, decisionContext);

        // Identify constraints
        analysis.constraints = await this.identifyConstraints(type, decisionContext);

        return analysis;
    }

    /**
     * Analyze individual option
     */
    async analyzeIndividualOption(option, decisionContext) {
        const prompt = `
        Analyze this decision option considering the context:
        
        Option: ${JSON.stringify(option, null, 2)}
        Context: ${JSON.stringify(decisionContext, null, 2)}
        
        Provide analysis:
        {
            "option_id": "id",
            "pros": ["pro1", "pro2"],
            "cons": ["con1", "con2"],
            "risk_level": "low|medium|high",
            "effort_required": "low|medium|high",
            "time_impact": "immediate|short_term|long_term",
            "stakeholder_impact": ["positive", "neutral", "negative"],
            "alignment_score": "0.0-1.0",
            "feasibility": "0.0-1.0"
        }
        `;

        const response = await this.openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1
        });

        return JSON.parse(response.choices[0].message.content);
    }

    /**
     * Apply rule-based decision logic
     */
    applyDecisionRules(type, analysis, decisionContext) {
        const rules = this.decisionRules[type] || {};
        const scores = {};

        // Apply specific rules based on decision type
        switch (type) {
            case 'communication_response':
                return this.applyCommunicationRules(analysis, decisionContext, rules);
            
            case 'task_prioritization':
                return this.applyTaskPrioritizationRules(analysis, decisionContext, rules);
            
            case 'meeting_scheduling':
                return this.applyMeetingSchedulingRules(analysis, decisionContext, rules);
            
            case 'project_management':
                return this.applyProjectManagementRules(analysis, decisionContext, rules);
            
            default:
                return this.applyGenericRules(analysis, decisionContext);
        }
    }

    /**
     * Apply communication-specific rules
     */
    applyCommunicationRules(analysis, decisionContext, rules) {
        const scores = {};
        
        // Analyze urgency
        const urgencyScore = this.calculateUrgencyScore(analysis, rules.response_urgency);
        
        // Determine response style
        const responseStyle = this.determineResponseStyle(analysis, rules.response_style);
        
        // Consider emotional context
        const emotionalAdjustment = this.applyEmotionalAdjustment(decisionContext.emotional);
        
        return {
            recommendation: 'respond',
            urgency: urgencyScore,
            style: responseStyle,
            emotional_adjustment: emotionalAdjustment,
            confidence: 0.8,
            reasoning: 'Based on urgency indicators and relationship context'
        };
    }

    /**
     * Apply task prioritization rules
     */
    applyTaskPrioritizationRules(analysis, decisionContext, rules) {
        const priorities = [];
        
        // Calculate priority scores for each option
        for (const option of analysis.options) {
            const urgencyScore = this.calculateTaskUrgency(option, rules.urgency_factors);
            const resourceScore = this.calculateResourceFit(option, rules.resource_allocation, decisionContext);
            
            const totalScore = (urgencyScore * 0.6) + (resourceScore * 0.4);
            
            priorities.push({
                task: option,
                score: totalScore,
                urgency: urgencyScore,
                resource_fit: resourceScore
            });
        }
        
        // Sort by priority score
        priorities.sort((a, b) => b.score - a.score);
        
        return {
            recommendation: 'prioritize',
            priorities: priorities,
            confidence: 0.85,
            reasoning: 'Based on urgency factors and resource allocation'
        };
    }

    /**
     * Apply meeting scheduling rules
     */
    applyMeetingSchedulingRules(analysis, decisionContext, rules) {
        const timeSlots = analysis.options;
        const scored = [];
        
        for (const slot of timeSlots) {
            const timeScore = this.calculateTimeSlotScore(slot, rules.optimal_times);
            const conflictScore = this.calculateConflictScore(slot, decisionContext);
            const energyScore = this.calculateEnergyAlignment(slot, decisionContext);
            
            const totalScore = (timeScore * 0.4) + (conflictScore * 0.4) + (energyScore * 0.2);
            
            scored.push({
                timeSlot: slot,
                score: totalScore,
                factors: { time: timeScore, conflicts: conflictScore, energy: energyScore }
            });
        }
        
        scored.sort((a, b) => b.score - a.score);
        
        return {
            recommendation: 'schedule',
            optimal_slot: scored[0],
            alternatives: scored.slice(1, 3),
            confidence: 0.9,
            reasoning: 'Based on time optimization and conflict analysis'
        };
    }

    /**
     * Get AI-powered decision insights
     */
    async getAIDecisionInsights(type, analysis, decisionContext) {
        const prompt = `
        As Eva's Decision Engine, provide intelligent insights for this decision:
        
        Decision Type: ${type}
        Analysis: ${JSON.stringify(analysis, null, 2)}
        Context: ${JSON.stringify(decisionContext, null, 2)}
        
        Consider:
        1. Long-term implications
        2. Stakeholder relationships
        3. Strategic alignment
        4. Risk assessment
        5. Alternative approaches
        
        Provide insights:
        {
            "primary_recommendation": {
                "action": "specific_action",
                "confidence": "0.0-1.0",
                "reasoning": "detailed_reasoning"
            },
            "alternative_approaches": [
                {
                    "approach": "alternative",
                    "pros": ["pro1", "pro2"],
                    "cons": ["con1", "con2"]
                }
            ],
            "risk_assessment": {
                "primary_risks": ["risk1", "risk2"],
                "mitigation_strategies": ["strategy1", "strategy2"]
            },
            "success_indicators": ["indicator1", "indicator2"],
            "recommended_follow_up": ["action1", "action2"]
        }
        `;

        const response = await this.openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2
        });

        return JSON.parse(response.choices[0].message.content);
    }

    /**
     * Synthesize final decision from multiple sources
     */
    async synthesizeDecision(ruleBasedDecision, aiInsights, decisionContext) {
        // Weight the different decision sources
        const ruleWeight = 0.4;
        const aiWeight = 0.6;
        
        // Calculate combined confidence
        const combinedConfidence = (
            (ruleBasedDecision.confidence * ruleWeight) +
            (aiInsights.primary_recommendation.confidence * aiWeight)
        );
        
        // Determine if confidence meets threshold
        const meetsThreshold = combinedConfidence >= this.confidenceThreshold;
        
        const finalDecision = {
            success: true,
            action: aiInsights.primary_recommendation.action,
            confidence: combinedConfidence,
            meets_threshold: meetsThreshold,
            reasoning: {
                rule_based: ruleBasedDecision.reasoning,
                ai_insights: aiInsights.primary_recommendation.reasoning
            },
            recommendations: {
                primary: aiInsights.primary_recommendation,
                alternatives: aiInsights.alternative_approaches,
                rule_based: ruleBasedDecision
            },
            risk_assessment: aiInsights.risk_assessment,
            success_indicators: aiInsights.success_indicators,
            follow_up_actions: aiInsights.recommended_follow_up,
            decision_id: this.generateDecisionId(),
            timestamp: new Date(),
            context_factors: {
                emotional_weight: this.contextWeights.emotional_state,
                historical_weight: this.contextWeights.historical_patterns,
                workload_consideration: decisionContext.workload?.level || 'unknown'
            }
        };
        
        // Add human approval requirement if confidence is low
        if (!meetsThreshold) {
            finalDecision.requires_human_approval = true;
            finalDecision.approval_reason = `Confidence ${combinedConfidence.toFixed(2)} below threshold ${this.confidenceThreshold}`;
        }
        
        return finalDecision;
    }

    /**
     * Store decision for learning and future reference
     */
    async storeDecision(type, decision, context) {
        const decisionRecord = {
            decisionId: decision.decision_id,
            type: type,
            decision: decision,
            context: context,
            timestamp: new Date(),
            userId: context.userId || 'autonomous_agent'
        };
        
        this.decisionHistory.push(decisionRecord);
        
        // Store in memory service for learning
        await this.memoryService.storeDecision(decisionRecord);
        
        // Keep decision history manageable
        if (this.decisionHistory.length > 200) {
            this.decisionHistory = this.decisionHistory.slice(-100);
        }
    }

    /**
     * Helper methods for specific calculations
     */
    calculateUrgencyScore(analysis, urgencyRules) {
        // Placeholder for urgency calculation
        return 0.7;
    }

    determineResponseStyle(analysis, styleRules) {
        // Placeholder for response style determination
        return { tone: 'professional', formality: 'moderate' };
    }

    applyEmotionalAdjustment(emotionalContext) {
        // Adjust response based on emotional state
        if (emotionalContext.currentEmotion === 'stressed') {
            return { tone_adjustment: 'supportive', urgency_modifier: 1.2 };
        }
        return { tone_adjustment: 'normal', urgency_modifier: 1.0 };
    }

    async assessCurrentWorkload(userId) {
        try {
            const activeTasks = await Task.find({ userId, status: { $in: ['pending', 'in_progress'] } });
            const activeProjects = await Project.find({ userId, status: 'active' });
            
            return {
                level: activeTasks.length > 10 ? 'high' : activeTasks.length > 5 ? 'medium' : 'low',
                active_tasks: activeTasks.length,
                active_projects: activeProjects.length,
                capacity: activeTasks.length <= 5 ? 'available' : 'limited'
            };
        } catch (error) {
            return { level: 'unknown', error: error.message };
        }
    }

    async getRelationshipContext(data, context) {
        // Get relationship information from contact data
        if (data.contactId) {
            try {
                const contact = await Contact.findById(data.contactId);
                return {
                    relationship_type: contact?.relationshipType || 'unknown',
                    interaction_history: contact?.interactionHistory?.length || 0,
                    last_interaction: contact?.lastInteraction,
                    priority_level: contact?.priority || 'medium'
                };
            } catch (error) {
                return { error: error.message };
            }
        }
        
        return { relationship_type: 'none' };
    }

    generateDecisionId() {
        return `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get decision engine status and metrics
     */
    getStatus() {
        const recentDecisions = this.decisionHistory.slice(-10);
        const avgConfidence = recentDecisions.reduce((sum, d) => sum + d.decision.confidence, 0) / recentDecisions.length || 0;
        
        return {
            total_decisions: this.decisionHistory.length,
            recent_decisions: recentDecisions.length,
            average_confidence: avgConfidence.toFixed(2),
            confidence_threshold: this.confidenceThreshold,
            available_decision_types: Object.keys(this.decisionRules),
            context_weights: this.contextWeights
        };
    }

    /**
     * Update decision rules based on learning
     */
    async updateDecisionRules(learningData) {
        // Implementation for updating rules based on outcomes
        console.log('📊 Updating decision rules based on learning data');
        
        // This could involve machine learning to optimize rule weights
        // For now, it's a placeholder for future enhancement
        
        return { rules_updated: true, timestamp: new Date() };
    }
}

module.exports = DecisionEngine;
