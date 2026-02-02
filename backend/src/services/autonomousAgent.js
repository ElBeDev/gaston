const OpenAI = require('openai');
const { getModel } = require('../config/openai.config');
const TaskOrchestrator = require('./taskOrchestrator');
const DecisionEngine = require('./decisionEngine');
const ExecutionMonitor = require('./executionMonitor');
const MemoryService = require('./memoryService');
const EmotionalIntelligence = require('./emotionalIntelligence');
const DocumentProcessor = require('./documentProcessor');
const VisionAnalyzer = require('./visionAnalyzer');
const AudioProcessor = require('./audioProcessor');
const Contact = require('../models/Contact');
const Task = require('../models/Task');
const Project = require('../models/Project');
const UserContext = require('../models/UserContext');

class AutonomousAgent {
    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.taskOrchestrator = new TaskOrchestrator();
        this.decisionEngine = new DecisionEngine();
        this.executionMonitor = new ExecutionMonitor();
        this.memoryService = new MemoryService();
        this.emotionalIntelligence = new EmotionalIntelligence();
        this.documentProcessor = new DocumentProcessor();
        this.visionAnalyzer = new VisionAnalyzer();
        this.audioProcessor = new AudioProcessor();
        
        // Agent state and capabilities
        this.isActive = false;
        this.currentTasks = new Map();
        this.executionHistory = [];
        this.autonomyLevel = 'moderate'; // conservative, moderate, aggressive
        this.capabilities = {
            meeting_planning: true,
            project_management: true,
            research_automation: true,
            email_automation: true,
            crm_automation: true,
            document_processing: true,
            workflow_orchestration: true,
            decision_making: true,
            learning_adaptation: true,
            proactive_assistance: true
        };
    }

    /**
     * Main autonomous execution method
     * @param {Object} params - Execution parameters
     * @returns {Object} Execution result
     */
    async executeAutonomously(params) {
        const { task, context, priority = 'medium', autonomyLevel = 'moderate' } = params;
        
        console.log(`🤖 AUTONOMOUS AGENT: Starting execution for task: ${task.type}`);
        
        try {
            // 1. Analyze task complexity and requirements
            const taskAnalysis = await this.analyzeTask(task, context);
            
            // 2. Create execution plan
            const executionPlan = await this.createExecutionPlan(taskAnalysis, priority);
            
            // 3. Request human approval if needed (based on autonomy level)
            const approvalResult = await this.requestApprovalIfNeeded(executionPlan, autonomyLevel);
            if (!approvalResult.approved) {
                return { success: false, reason: 'Human approval required but not granted' };
            }
            
            // 4. Start execution monitoring
            const executionId = this.executionMonitor.startExecution(executionPlan);
            
            // 5. Execute the plan
            const result = await this.executePlan(executionPlan, executionId, context);
            
            // 6. Learn from execution
            await this.learnFromExecution(executionPlan, result, context);
            
            // 7. Update execution history
            this.updateExecutionHistory(executionPlan, result);
            
            console.log(`✅ AUTONOMOUS AGENT: Task completed successfully`);
            return result;
            
        } catch (error) {
            console.error('❌ AUTONOMOUS AGENT: Error during execution:', error);
            return { 
                success: false, 
                error: error.message,
                needsHumanIntervention: true 
            };
        }
    }

    /**
     * Analyze task complexity and requirements
     */
    async analyzeTask(task, context) {
        const prompt = `
        As Eva's Autonomous Agent, analyze this task for autonomous execution:
        
        Task: ${JSON.stringify(task, null, 2)}
        Context: ${JSON.stringify(context, null, 2)}
        
        Provide analysis in this format:
        {
            "complexity": "low|medium|high|critical",
            "estimatedDuration": "duration in minutes",
            "requiredCapabilities": ["capability1", "capability2"],
            "riskLevel": "low|medium|high",
            "humanApprovalRequired": boolean,
            "dependencies": ["dependency1", "dependency2"],
            "expectedOutcome": "description",
            "successCriteria": ["criteria1", "criteria2"]
        }
        `;

        const response = await this.openai.chat.completions.create({
            model: getModel(),
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1
        });

        return JSON.parse(response.choices[0].message.content);
    }

    /**
     * Create detailed execution plan
     */
    async createExecutionPlan(taskAnalysis, priority) {
        const prompt = `
        Create a detailed execution plan for this task analysis:
        ${JSON.stringify(taskAnalysis, null, 2)}
        Priority: ${priority}
        
        Create a step-by-step execution plan:
        {
            "planId": "unique_id",
            "steps": [
                {
                    "stepNumber": 1,
                    "action": "action_description",
                    "method": "api_call|database_operation|external_service",
                    "parameters": {},
                    "expectedResult": "description",
                    "rollbackPlan": "rollback_description",
                    "timeoutMinutes": number
                }
            ],
            "totalEstimatedTime": "minutes",
            "checkpoints": ["checkpoint1", "checkpoint2"],
            "fallbackStrategies": ["strategy1", "strategy2"]
        }
        `;

        const response = await this.openai.chat.completions.create({
            model: getModel(),
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1
        });

        return JSON.parse(response.choices[0].message.content);
    }

    /**
     * Execute the planned steps
     */
    async executePlan(executionPlan, executionId, context) {
        const results = [];
        
        for (const step of executionPlan.steps) {
            console.log(`🔄 Executing step ${step.stepNumber}: ${step.action}`);
            
            try {
                // Update execution monitor
                this.executionMonitor.updateStep(executionId, step.stepNumber, 'in_progress');
                
                // Execute step based on method
                const stepResult = await this.executeStep(step, context);
                
                // Validate result
                const validation = await this.validateStepResult(step, stepResult);
                
                if (validation.success) {
                    this.executionMonitor.updateStep(executionId, step.stepNumber, 'completed');
                    results.push({ step: step.stepNumber, result: stepResult, status: 'success' });
                } else {
                    // Try fallback strategy
                    const fallbackResult = await this.executeFallback(step, validation.error, context);
                    if (fallbackResult.success) {
                        results.push({ step: step.stepNumber, result: fallbackResult, status: 'fallback_success' });
                    } else {
                        throw new Error(`Step ${step.stepNumber} failed: ${validation.error}`);
                    }
                }
                
            } catch (error) {
                console.error(`❌ Step ${step.stepNumber} failed:`, error);
                this.executionMonitor.updateStep(executionId, step.stepNumber, 'failed', error.message);
                
                // Execute rollback if needed
                if (step.rollbackPlan) {
                    await this.executeRollback(step, results, context);
                }
                
                throw error;
            }
        }
        
        // Complete execution
        this.executionMonitor.completeExecution(executionId, 'success');
        
        return {
            success: true,
            executionId,
            results,
            summary: await this.generateExecutionSummary(executionPlan, results)
        };
    }

    /**
     * Execute individual step
     */
    async executeStep(step, context) {
        switch (step.method) {
            case 'api_call':
                return await this.executeApiCall(step, context);
            
            case 'database_operation':
                return await this.executeDatabaseOperation(step, context);
            
            case 'external_service':
                return await this.executeExternalService(step, context);
            
            case 'multimodal_processing':
                return await this.executeMultimodalProcessing(step, context);
            
            case 'workflow_orchestration':
                return await this.taskOrchestrator.executeWorkflow(step.parameters, context);
            
            case 'decision_making':
                return await this.decisionEngine.makeDecision(step.parameters, context);
            
            default:
                throw new Error(`Unknown execution method: ${step.method}`);
        }
    }

    /**
     * Execute API call step
     */
    async executeApiCall(step, context) {
        const { endpoint, method, data, headers } = step.parameters;
        
        // Implementation for various API calls
        if (endpoint.includes('/chat/message')) {
            return await this.executeChatMessage(data, context);
        } else if (endpoint.includes('/crm/')) {
            return await this.executeCrmOperation(endpoint, method, data, context);
        } else if (endpoint.includes('/multimodal/')) {
            return await this.executeMultimodalApi(endpoint, method, data, context);
        }
        
        // Generic API call handling
        return { success: true, data: 'API call executed', endpoint };
    }

    /**
     * Execute database operation step
     */
    async executeDatabaseOperation(step, context) {
        const { operation, model, data, query } = step.parameters;
        
        switch (operation) {
            case 'create':
                return await this.createDatabaseRecord(model, data, context);
            
            case 'update':
                return await this.updateDatabaseRecord(model, query, data, context);
            
            case 'find':
                return await this.findDatabaseRecords(model, query, context);
            
            case 'delete':
                return await this.deleteDatabaseRecord(model, query, context);
            
            default:
                throw new Error(`Unknown database operation: ${operation}`);
        }
    }

    /**
     * Create database record
     */
    async createDatabaseRecord(modelName, data, context) {
        const ModelClass = this.getModelClass(modelName);
        
        // Add context and metadata
        const enrichedData = {
            ...data,
            createdBy: 'autonomous_agent',
            createdAt: new Date(),
            userId: context.userId,
            context: context.currentContext
        };
        
        const record = new ModelClass(enrichedData);
        await record.save();
        
        return { success: true, record, action: 'created' };
    }

    /**
     * Execute multimodal processing step
     */
    async executeMultimodalProcessing(step, context) {
        const { type, content, options } = step.parameters;
        
        switch (type) {
            case 'document':
                return await this.documentProcessor.processDocument(content, options);
            
            case 'image':
                return await this.visionAnalyzer.analyzeImage(content, options);
            
            case 'audio':
                return await this.audioProcessor.processAudio(content, options);
            
            default:
                throw new Error(`Unknown multimodal type: ${type}`);
        }
    }

    /**
     * Generate execution summary
     */
    async generateExecutionSummary(executionPlan, results) {
        const prompt = `
        Generate a concise execution summary for this autonomous task:
        
        Plan: ${JSON.stringify(executionPlan, null, 2)}
        Results: ${JSON.stringify(results, null, 2)}
        
        Provide summary in format:
        {
            "taskCompleted": "description",
            "keyAchievements": ["achievement1", "achievement2"],
            "timeSpent": "actual time",
            "efficencyRating": "1-10",
            "lessonsLearned": ["lesson1", "lesson2"],
            "recommendedImprovements": ["improvement1", "improvement2"]
        }
        `;

        const response = await this.openai.chat.completions.create({
            model: getModel(),
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1
        });

        return JSON.parse(response.choices[0].message.content);
    }

    /**
     * Learn from execution for future improvements
     */
    async learnFromExecution(executionPlan, result, context) {
        const learningData = {
            planId: executionPlan.planId,
            success: result.success,
            duration: result.actualDuration,
            estimatedDuration: executionPlan.totalEstimatedTime,
            context: context,
            improvements: result.summary?.recommendedImprovements || [],
            timestamp: new Date()
        };
        
        // Store learning for future optimization
        await this.memoryService.storeLearning(learningData);
        
        // Update agent capabilities based on learning
        await this.updateCapabilities(learningData);
    }

    /**
     * Request human approval if needed
     */
    async requestApprovalIfNeeded(executionPlan, autonomyLevel) {
        // Conservative mode: always ask for approval
        if (autonomyLevel === 'conservative') {
            return { approved: false, reason: 'Conservative mode requires human approval' };
        }
        
        // Moderate mode: ask for high-risk or complex tasks
        if (autonomyLevel === 'moderate') {
            const riskLevel = executionPlan.riskLevel || 'medium';
            const complexity = executionPlan.complexity || 'medium';
            
            if (riskLevel === 'high' || complexity === 'critical') {
                return { approved: false, reason: 'High-risk or critical task requires approval' };
            }
        }
        
        // Aggressive mode: proceed unless explicitly forbidden
        return { approved: true };
    }

    /**
     * Get model class by name
     */
    getModelClass(modelName) {
        const models = {
            'Contact': Contact,
            'Task': Task,
            'Project': Project,
            'UserContext': UserContext
        };
        
        return models[modelName] || null;
    }

    /**
     * Validate step result
     */
    async validateStepResult(step, result) {
        // Basic validation logic
        if (!result) {
            return { success: false, error: 'No result returned' };
        }
        
        if (result.error) {
            return { success: false, error: result.error };
        }
        
        return { success: true };
    }

    /**
     * Execute fallback strategy
     */
    async executeFallback(step, error, context) {
        console.log(`🔄 Executing fallback for step ${step.stepNumber}`);
        
        // Generic fallback: retry with modified parameters
        const modifiedStep = { ...step };
        modifiedStep.parameters = { ...step.parameters, retry: true };
        
        try {
            const result = await this.executeStep(modifiedStep, context);
            return { success: true, result, fallback: true };
        } catch (fallbackError) {
            return { success: false, error: fallbackError.message };
        }
    }

    /**
     * Execute rollback plan
     */
    async executeRollback(step, completedResults, context) {
        console.log(`↩️ Executing rollback for step ${step.stepNumber}`);
        
        // Implementation depends on specific rollback requirements
        // This is a placeholder for rollback logic
        return { success: true, rollback: true };
    }

    /**
     * Update execution history
     */
    updateExecutionHistory(executionPlan, result) {
        this.executionHistory.push({
            planId: executionPlan.planId,
            timestamp: new Date(),
            success: result.success,
            duration: result.actualDuration,
            summary: result.summary
        });
        
        // Keep only last 100 executions
        if (this.executionHistory.length > 100) {
            this.executionHistory = this.executionHistory.slice(-100);
        }
    }

    /**
     * Update agent capabilities based on learning
     */
    async updateCapabilities(learningData) {
        // Analyze performance and adjust capabilities
        if (learningData.success && learningData.duration < learningData.estimatedDuration) {
            // Performance was better than expected
            console.log('📈 Agent performance improved, updating capabilities');
        }
        
        // Store capability updates
        const capabilityUpdate = {
            timestamp: new Date(),
            learningId: learningData.planId,
            improvements: learningData.improvements,
            performanceMetric: learningData.duration / learningData.estimatedDuration
        };
        
        await this.memoryService.storeCapabilityUpdate(capabilityUpdate);
    }

    /**
     * Get agent status and capabilities
     */
    getStatus() {
        return {
            isActive: this.isActive,
            autonomyLevel: this.autonomyLevel,
            capabilities: this.capabilities,
            currentTasks: this.currentTasks.size,
            executionHistory: this.executionHistory.length,
            lastExecution: this.executionHistory[this.executionHistory.length - 1] || null
        };
    }

    /**
     * Set autonomy level
     */
    setAutonomyLevel(level) {
        const validLevels = ['conservative', 'moderate', 'aggressive'];
        if (!validLevels.includes(level)) {
            throw new Error(`Invalid autonomy level. Must be one of: ${validLevels.join(', ')}`);
        }
        
        this.autonomyLevel = level;
        console.log(`🎚️ Autonomy level set to: ${level}`);
        
        return { success: true, autonomyLevel: level };
    }
}

module.exports = AutonomousAgent;
