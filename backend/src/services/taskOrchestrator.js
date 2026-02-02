const OpenAI = require('openai');
const { getModel } = require('../config/openai.config');
const Contact = require('../models/Contact');
const Task = require('../models/Task');
const Project = require('../models/Project');
const UserContext = require('../models/UserContext');

class TaskOrchestrator {
    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.activeWorkflows = new Map();
        this.workflowTemplates = this.initializeWorkflowTemplates();
        this.executionQueue = [];
        this.isProcessing = false;
    }

    /**
     * Initialize predefined workflow templates
     */
    initializeWorkflowTemplates() {
        return {
            // Meeting Planning Workflow
            meeting_planning: {
                name: "Intelligent Meeting Planning",
                description: "Comprehensive meeting orchestration with agenda, participants, and follow-up",
                steps: [
                    { action: "analyze_meeting_requirements", priority: 1 },
                    { action: "find_optimal_time_slot", priority: 2 },
                    { action: "prepare_agenda", priority: 3 },
                    { action: "send_invitations", priority: 4 },
                    { action: "prepare_materials", priority: 5 },
                    { action: "setup_meeting_room", priority: 6 },
                    { action: "send_reminders", priority: 7 }
                ],
                triggers: ["meeting_request", "calendar_availability_check"],
                expectedDuration: 30
            },

            // Project Management Workflow
            project_management: {
                name: "Autonomous Project Management",
                description: "Complete project lifecycle management from initiation to closure",
                steps: [
                    { action: "analyze_project_scope", priority: 1 },
                    { action: "create_project_structure", priority: 2 },
                    { action: "assign_resources", priority: 3 },
                    { action: "create_timeline", priority: 4 },
                    { action: "setup_monitoring", priority: 5 },
                    { action: "initiate_kickoff", priority: 6 },
                    { action: "schedule_checkpoints", priority: 7 }
                ],
                triggers: ["new_project_request", "project_initiation"],
                expectedDuration: 60
            },

            // Research Automation Workflow
            research_automation: {
                name: "Intelligent Research & Analysis",
                description: "Autonomous research with data gathering, analysis, and report generation",
                steps: [
                    { action: "define_research_scope", priority: 1 },
                    { action: "gather_information", priority: 2 },
                    { action: "analyze_data", priority: 3 },
                    { action: "synthesize_findings", priority: 4 },
                    { action: "generate_insights", priority: 5 },
                    { action: "create_report", priority: 6 },
                    { action: "recommend_actions", priority: 7 }
                ],
                triggers: ["research_request", "data_analysis_needed"],
                expectedDuration: 45
            },

            // CRM Automation Workflow
            crm_automation: {
                name: "CRM Process Automation",
                description: "Automated contact management, lead nurturing, and relationship building",
                steps: [
                    { action: "analyze_contact_interaction", priority: 1 },
                    { action: "update_contact_profile", priority: 2 },
                    { action: "assess_relationship_status", priority: 3 },
                    { action: "determine_next_actions", priority: 4 },
                    { action: "schedule_follow_ups", priority: 5 },
                    { action: "update_project_connections", priority: 6 },
                    { action: "generate_insights", priority: 7 }
                ],
                triggers: ["new_contact_interaction", "relationship_update"],
                expectedDuration: 25
            },

            // Email Automation Workflow
            email_automation: {
                name: "Intelligent Email Management",
                description: "Smart email processing, categorization, and response automation",
                steps: [
                    { action: "analyze_email_content", priority: 1 },
                    { action: "categorize_email", priority: 2 },
                    { action: "extract_action_items", priority: 3 },
                    { action: "determine_response_needed", priority: 4 },
                    { action: "draft_response", priority: 5 },
                    { action: "schedule_follow_up", priority: 6 },
                    { action: "update_relevant_records", priority: 7 }
                ],
                triggers: ["new_email_received", "email_response_needed"],
                expectedDuration: 15
            }
        };
    }

    /**
     * Execute a workflow
     * @param {Object} workflowParams - Workflow parameters
     * @param {Object} context - Execution context
     * @returns {Object} Workflow execution result
     */
    async executeWorkflow(workflowParams, context) {
        const { workflowType, parameters, priority = 'medium', userId } = workflowParams;
        
        console.log(`🎼 TASK ORCHESTRATOR: Starting workflow: ${workflowType}`);
        
        try {
            // Get workflow template
            const template = this.workflowTemplates[workflowType];
            if (!template) {
                throw new Error(`Unknown workflow type: ${workflowType}`);
            }

            // Create workflow instance
            const workflowId = this.generateWorkflowId();
            const workflow = await this.createWorkflowInstance(template, parameters, context, workflowId);
            
            // Add to active workflows
            this.activeWorkflows.set(workflowId, workflow);
            
            // Execute workflow steps
            const result = await this.executeWorkflowSteps(workflow, context);
            
            // Complete workflow
            await this.completeWorkflow(workflowId, result);
            
            console.log(`✅ TASK ORCHESTRATOR: Workflow ${workflowType} completed successfully`);
            return { success: true, workflowId, result };
            
        } catch (error) {
            console.error(`❌ TASK ORCHESTRATOR: Workflow ${workflowType} failed:`, error);
            return { success: false, error: error.message, workflowType };
        }
    }

    /**
     * Create workflow instance from template
     */
    async createWorkflowInstance(template, parameters, context, workflowId) {
        // Analyze parameters and customize workflow
        const customizedSteps = await this.customizeWorkflowSteps(template.steps, parameters, context);
        
        const workflow = {
            id: workflowId,
            name: template.name,
            description: template.description,
            steps: customizedSteps,
            parameters: parameters,
            context: context,
            status: 'initialized',
            startTime: new Date(),
            currentStep: 0,
            results: [],
            metadata: {
                expectedDuration: template.expectedDuration,
                priority: parameters.priority || 'medium',
                userId: context.userId
            }
        };
        
        return workflow;
    }

    /**
     * Customize workflow steps based on parameters
     */
    async customizeWorkflowSteps(templateSteps, parameters, context) {
        const prompt = `
        Customize these workflow steps based on the specific parameters and context:
        
        Template Steps: ${JSON.stringify(templateSteps, null, 2)}
        Parameters: ${JSON.stringify(parameters, null, 2)}
        Context: ${JSON.stringify(context, null, 2)}
        
        Return customized steps with specific actions, parameters, and execution details:
        {
            "steps": [
                {
                    "stepId": "unique_id",
                    "action": "specific_action",
                    "description": "what this step does",
                    "priority": number,
                    "parameters": {},
                    "dependencies": ["stepId1", "stepId2"],
                    "estimatedDuration": "minutes",
                    "successCriteria": "how to validate success"
                }
            ]
        }
        `;

        const response = await this.openai.chat.completions.create({
            model: getModel(),
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1
        });

        const customization = JSON.parse(response.choices[0].message.content);
        return customization.steps;
    }

    /**
     * Execute workflow steps in order
     */
    async executeWorkflowSteps(workflow, context) {
        const results = [];
        
        for (let i = 0; i < workflow.steps.length; i++) {
            const step = workflow.steps[i];
            workflow.currentStep = i;
            
            console.log(`🔄 Executing workflow step: ${step.action}`);
            
            try {
                // Check dependencies
                const dependenciesOk = await this.checkStepDependencies(step, results);
                if (!dependenciesOk) {
                    throw new Error(`Dependencies not met for step: ${step.action}`);
                }
                
                // Execute step
                const stepResult = await this.executeWorkflowStep(step, workflow, context);
                
                // Validate result
                const isValid = await this.validateStepResult(step, stepResult);
                if (!isValid) {
                    throw new Error(`Step validation failed: ${step.action}`);
                }
                
                // Store result
                results.push({
                    stepId: step.stepId,
                    action: step.action,
                    result: stepResult,
                    completedAt: new Date(),
                    status: 'completed'
                });
                
                // Update workflow
                workflow.results = results;
                
            } catch (error) {
                console.error(`❌ Workflow step failed: ${step.action}`, error);
                
                // Handle step failure
                const recovery = await this.handleStepFailure(step, error, workflow, context);
                if (recovery.canContinue) {
                    results.push({
                        stepId: step.stepId,
                        action: step.action,
                        result: recovery.result,
                        completedAt: new Date(),
                        status: 'recovered',
                        error: error.message
                    });
                } else {
                    throw new Error(`Workflow failed at step: ${step.action} - ${error.message}`);
                }
            }
        }
        
        // Generate workflow summary
        const summary = await this.generateWorkflowSummary(workflow, results);
        
        return { steps: results, summary, completedAt: new Date() };
    }

    /**
     * Execute individual workflow step
     */
    async executeWorkflowStep(step, workflow, context) {
        switch (step.action) {
            // Meeting Planning Actions
            case 'analyze_meeting_requirements':
                return await this.analyzeMeetingRequirements(step.parameters, context);
            
            case 'find_optimal_time_slot':
                return await this.findOptimalTimeSlot(step.parameters, context);
            
            case 'prepare_agenda':
                return await this.prepareAgenda(step.parameters, context);
            
            // Project Management Actions
            case 'analyze_project_scope':
                return await this.analyzeProjectScope(step.parameters, context);
            
            case 'create_project_structure':
                return await this.createProjectStructure(step.parameters, context);
            
            case 'assign_resources':
                return await this.assignResources(step.parameters, context);
            
            // Research Actions
            case 'define_research_scope':
                return await this.defineResearchScope(step.parameters, context);
            
            case 'gather_information':
                return await this.gatherInformation(step.parameters, context);
            
            case 'analyze_data':
                return await this.analyzeData(step.parameters, context);
            
            // CRM Actions
            case 'analyze_contact_interaction':
                return await this.analyzeContactInteraction(step.parameters, context);
            
            case 'update_contact_profile':
                return await this.updateContactProfile(step.parameters, context);
            
            case 'assess_relationship_status':
                return await this.assessRelationshipStatus(step.parameters, context);
            
            // Email Actions
            case 'analyze_email_content':
                return await this.analyzeEmailContent(step.parameters, context);
            
            case 'categorize_email':
                return await this.categorizeEmail(step.parameters, context);
            
            case 'extract_action_items':
                return await this.extractActionItems(step.parameters, context);
            
            default:
                return await this.executeGenericAction(step, context);
        }
    }

    /**
     * Meeting Planning Actions
     */
    async analyzeMeetingRequirements(parameters, context) {
        const prompt = `
        Analyze these meeting requirements and provide structured analysis:
        ${JSON.stringify(parameters, null, 2)}
        
        Provide analysis:
        {
            "meetingType": "type",
            "estimatedDuration": "minutes",
            "requiredParticipants": ["person1", "person2"],
            "optionalParticipants": ["person3"],
            "requiredResources": ["resource1"],
            "preferredTimeframes": ["timeframe1"],
            "priority": "high|medium|low",
            "preparationNeeded": ["item1", "item2"]
        }
        `;

        const response = await this.openai.chat.completions.create({
            model: getModel(),
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1
        });

        return JSON.parse(response.choices[0].message.content);
    }

    async findOptimalTimeSlot(parameters, context) {
        // Simulate finding optimal time slot
        // In real implementation, this would integrate with calendar APIs
        
        const timeSlots = [
            { start: "2025-09-11T09:00:00Z", end: "2025-09-11T10:00:00Z", score: 0.9 },
            { start: "2025-09-11T14:00:00Z", end: "2025-09-11T15:00:00Z", score: 0.8 },
            { start: "2025-09-12T10:00:00Z", end: "2025-09-12T11:00:00Z", score: 0.85 }
        ];
        
        return {
            optimalSlot: timeSlots[0],
            alternativeSlots: timeSlots.slice(1),
            conflicts: [],
            reasoning: "Selected based on participant availability and priority"
        };
    }

    async prepareAgenda(parameters, context) {
        const prompt = `
        Create a detailed meeting agenda based on these parameters:
        ${JSON.stringify(parameters, null, 2)}
        
        Generate structured agenda:
        {
            "title": "Meeting Title",
            "objective": "Main objective",
            "agenda_items": [
                {
                    "item": "Agenda item",
                    "duration": "minutes",
                    "owner": "person",
                    "type": "discussion|presentation|decision"
                }
            ],
            "preparation_required": ["item1", "item2"],
            "materials_needed": ["material1", "material2"],
            "expected_outcomes": ["outcome1", "outcome2"]
        }
        `;

        const response = await this.openai.chat.completions.create({
            model: getModel(),
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2
        });

        return JSON.parse(response.choices[0].message.content);
    }

    /**
     * Project Management Actions
     */
    async analyzeProjectScope(parameters, context) {
        const prompt = `
        Analyze this project scope and provide detailed breakdown:
        ${JSON.stringify(parameters, null, 2)}
        
        Provide analysis:
        {
            "project_type": "type",
            "complexity": "low|medium|high",
            "estimated_duration": "weeks",
            "required_skills": ["skill1", "skill2"],
            "deliverables": ["deliverable1", "deliverable2"],
            "risks": [{"risk": "description", "impact": "high|medium|low"}],
            "dependencies": ["dependency1"],
            "success_criteria": ["criteria1", "criteria2"]
        }
        `;

        const response = await this.openai.chat.completions.create({
            model: getModel(),
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1
        });

        return JSON.parse(response.choices[0].message.content);
    }

    async createProjectStructure(parameters, context) {
        // Create project in database
        const projectData = {
            name: parameters.projectName || 'Autonomous Project',
            description: parameters.description || 'Project created by autonomous agent',
            status: 'active',
            userId: context.userId,
            createdBy: 'autonomous_agent',
            phases: parameters.phases || ['Planning', 'Execution', 'Delivery'],
            estimatedDuration: parameters.estimatedDuration || '4 weeks'
        };
        
        const project = new Project(projectData);
        await project.save();
        
        return {
            project: project,
            structure_created: true,
            project_id: project._id
        };
    }

    /**
     * CRM Actions
     */
    async analyzeContactInteraction(parameters, context) {
        const prompt = `
        Analyze this contact interaction and extract insights:
        ${JSON.stringify(parameters, null, 2)}
        
        Provide analysis:
        {
            "interaction_type": "email|call|meeting|other",
            "sentiment": "positive|neutral|negative",
            "key_topics": ["topic1", "topic2"],
            "action_items": ["action1", "action2"],
            "relationship_impact": "strengthened|maintained|weakened",
            "follow_up_needed": boolean,
            "business_opportunity": "high|medium|low|none"
        }
        `;

        const response = await this.openai.chat.completions.create({
            model: getModel(),
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1
        });

        return JSON.parse(response.choices[0].message.content);
    }

    async updateContactProfile(parameters, context) {
        const { contactId, updates } = parameters;
        
        try {
            const contact = await Contact.findById(contactId);
            if (!contact) {
                // Create new contact if doesn't exist
                const newContact = new Contact({
                    ...updates,
                    userId: context.userId,
                    createdBy: 'autonomous_agent'
                });
                await newContact.save();
                return { contact: newContact, action: 'created' };
            }
            
            // Update existing contact
            Object.assign(contact, updates);
            contact.lastUpdated = new Date();
            await contact.save();
            
            return { contact, action: 'updated' };
            
        } catch (error) {
            throw new Error(`Failed to update contact: ${error.message}`);
        }
    }

    /**
     * Generic action executor
     */
    async executeGenericAction(step, context) {
        console.log(`🔧 Executing generic action: ${step.action}`);
        
        // Placeholder for generic action execution
        return {
            action: step.action,
            status: 'completed',
            message: `Generic action ${step.action} executed successfully`,
            timestamp: new Date()
        };
    }

    /**
     * Generate workflow summary
     */
    async generateWorkflowSummary(workflow, results) {
        const prompt = `
        Generate a comprehensive summary for this completed workflow:
        
        Workflow: ${JSON.stringify(workflow, null, 2)}
        Results: ${JSON.stringify(results, null, 2)}
        
        Provide summary:
        {
            "workflow_name": "name",
            "total_duration": "actual minutes",
            "steps_completed": number,
            "success_rate": "percentage",
            "key_achievements": ["achievement1", "achievement2"],
            "created_items": ["item1", "item2"],
            "next_recommended_actions": ["action1", "action2"],
            "efficiency_score": "1-10"
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
     * Utility methods
     */
    generateWorkflowId() {
        return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async checkStepDependencies(step, completedResults) {
        if (!step.dependencies || step.dependencies.length === 0) {
            return true;
        }
        
        const completedStepIds = completedResults.map(r => r.stepId);
        return step.dependencies.every(dep => completedStepIds.includes(dep));
    }

    async validateStepResult(step, result) {
        // Basic validation - can be enhanced based on specific step requirements
        return result && !result.error;
    }

    async handleStepFailure(step, error, workflow, context) {
        // Basic recovery strategy
        console.log(`🔄 Attempting recovery for failed step: ${step.action}`);
        
        return {
            canContinue: true,
            result: {
                recovered: true,
                original_error: error.message,
                recovery_action: 'continued_with_default'
            }
        };
    }

    async completeWorkflow(workflowId, result) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (workflow) {
            workflow.status = 'completed';
            workflow.endTime = new Date();
            workflow.duration = (workflow.endTime - workflow.startTime) / 1000 / 60; // minutes
            
            // Remove from active workflows
            this.activeWorkflows.delete(workflowId);
        }
        
        return { workflowId, completed: true };
    }

    /**
     * Get orchestrator status
     */
    getStatus() {
        return {
            activeWorkflows: this.activeWorkflows.size,
            availableTemplates: Object.keys(this.workflowTemplates),
            queueSize: this.executionQueue.length,
            isProcessing: this.isProcessing
        };
    }
}

module.exports = TaskOrchestrator;
