const express = require('express');
const router = express.Router();
const AutonomousAgent = require('../services/autonomousAgent');
const TaskOrchestrator = require('../services/taskOrchestrator');
const DecisionEngine = require('../services/decisionEngine');
const ExecutionMonitor = require('../services/executionMonitor');

// Initialize services
const autonomousAgent = new AutonomousAgent();
const taskOrchestrator = new TaskOrchestrator();
const decisionEngine = new DecisionEngine();
const executionMonitor = new ExecutionMonitor();

/**
 * @route POST /api/autonomous/execute
 * @description Execute autonomous task
 */
router.post('/execute', async (req, res) => {
    try {
        const { task, context, priority, autonomyLevel } = req.body;
        
        if (!task || !task.type) {
            return res.status(400).json({
                success: false,
                error: 'Task type is required'
            });
        }
        
        console.log(`🤖 AUTONOMOUS API: Executing task: ${task.type}`);
        
        const result = await autonomousAgent.executeAutonomously({
            task,
            context: context || {},
            priority: priority || 'medium',
            autonomyLevel: autonomyLevel || 'moderate'
        });
        
        res.json({
            success: true,
            result,
            timestamp: new Date(),
            service: 'autonomous_agent'
        });
        
    } catch (error) {
        console.error('❌ Autonomous execution error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            service: 'autonomous_agent'
        });
    }
});

/**
 * @route POST /api/autonomous/workflow
 * @description Execute workflow
 */
router.post('/workflow', async (req, res) => {
    try {
        const { workflowType, parameters, priority, userId } = req.body;
        
        if (!workflowType) {
            return res.status(400).json({
                success: false,
                error: 'Workflow type is required'
            });
        }
        
        console.log(`🎼 WORKFLOW API: Executing workflow: ${workflowType}`);
        
        const result = await taskOrchestrator.executeWorkflow({
            workflowType,
            parameters: parameters || {},
            priority: priority || 'medium',
            userId
        }, { userId });
        
        res.json({
            success: true,
            result,
            timestamp: new Date(),
            service: 'task_orchestrator'
        });
        
    } catch (error) {
        console.error('❌ Workflow execution error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            service: 'task_orchestrator'
        });
    }
});

/**
 * @route POST /api/autonomous/decision
 * @description Make autonomous decision
 */
router.post('/decision', async (req, res) => {
    try {
        const { type, data, options, priority } = req.body;
        
        if (!type) {
            return res.status(400).json({
                success: false,
                error: 'Decision type is required'
            });
        }
        
        console.log(`🧠 DECISION API: Making decision: ${type}`);
        
        const result = await decisionEngine.makeDecision({
            type,
            data: data || {},
            options: options || [],
            priority: priority || 'medium'
        }, { userId: req.body.userId });
        
        res.json({
            success: true,
            result,
            timestamp: new Date(),
            service: 'decision_engine'
        });
        
    } catch (error) {
        console.error('❌ Decision making error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            service: 'decision_engine'
        });
    }
});

/**
 * @route GET /api/autonomous/status
 * @description Get autonomous agent status
 */
router.get('/status', async (req, res) => {
    try {
        const agentStatus = autonomousAgent.getStatus();
        const orchestratorStatus = taskOrchestrator.getStatus();
        const decisionStatus = decisionEngine.getStatus();
        const monitorStatus = executionMonitor.getStatus();
        
        res.json({
            success: true,
            status: {
                autonomous_agent: agentStatus,
                task_orchestrator: orchestratorStatus,
                decision_engine: decisionStatus,
                execution_monitor: monitorStatus
            },
            system: {
                timestamp: new Date(),
                uptime: process.uptime(),
                memory: process.memoryUsage()
            }
        });
        
    } catch (error) {
        console.error('❌ Status retrieval error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route GET /api/autonomous/executions
 * @description Get active executions
 */
router.get('/executions', async (req, res) => {
    try {
        const activeExecutions = executionMonitor.getActiveExecutions();
        const performanceMetrics = executionMonitor.getPerformanceMetrics();
        
        res.json({
            success: true,
            data: {
                active_executions: activeExecutions,
                performance_metrics: performanceMetrics
            },
            timestamp: new Date()
        });
        
    } catch (error) {
        console.error('❌ Executions retrieval error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route GET /api/autonomous/executions/:executionId
 * @description Get specific execution status
 */
router.get('/executions/:executionId', async (req, res) => {
    try {
        const { executionId } = req.params;
        const executionStatus = executionMonitor.getExecutionStatus(executionId);
        
        if (executionStatus.error) {
            return res.status(404).json({
                success: false,
                error: executionStatus.error
            });
        }
        
        res.json({
            success: true,
            data: executionStatus,
            timestamp: new Date()
        });
        
    } catch (error) {
        console.error('❌ Execution status error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route GET /api/autonomous/performance/report
 * @description Generate performance report
 */
router.get('/performance/report', async (req, res) => {
    try {
        const { timeframe = '24h' } = req.query;
        const report = await executionMonitor.generatePerformanceReport(timeframe);
        
        res.json({
            success: true,
            report,
            timestamp: new Date()
        });
        
    } catch (error) {
        console.error('❌ Performance report error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route POST /api/autonomous/agent/config
 * @description Configure autonomous agent
 */
router.post('/agent/config', async (req, res) => {
    try {
        const { autonomyLevel } = req.body;
        
        if (!autonomyLevel) {
            return res.status(400).json({
                success: false,
                error: 'Autonomy level is required'
            });
        }
        
        const result = autonomousAgent.setAutonomyLevel(autonomyLevel);
        
        res.json({
            success: true,
            result,
            timestamp: new Date()
        });
        
    } catch (error) {
        console.error('❌ Agent configuration error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route GET /api/autonomous/workflows/templates
 * @description Get available workflow templates
 */
router.get('/workflows/templates', async (req, res) => {
    try {
        const templates = taskOrchestrator.workflowTemplates;
        
        const templateSummary = Object.entries(templates).map(([key, template]) => ({
            id: key,
            name: template.name,
            description: template.description,
            steps: template.steps.length,
            expectedDuration: template.expectedDuration,
            triggers: template.triggers
        }));
        
        res.json({
            success: true,
            templates: templateSummary,
            total: templateSummary.length,
            timestamp: new Date()
        });
        
    } catch (error) {
        console.error('❌ Templates retrieval error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route POST /api/autonomous/meeting/plan
 * @description Autonomous meeting planning
 */
router.post('/meeting/plan', async (req, res) => {
    try {
        const { meetingDetails, participants, preferences } = req.body;
        
        if (!meetingDetails || !meetingDetails.topic) {
            return res.status(400).json({
                success: false,
                error: 'Meeting topic is required'
            });
        }
        
        console.log(`📅 MEETING PLANNER: Planning meeting: ${meetingDetails.topic}`);
        
        const task = {
            type: 'meeting_planning',
            data: {
                meetingDetails,
                participants: participants || [],
                preferences: preferences || {}
            }
        };
        
        const result = await autonomousAgent.executeAutonomously({
            task,
            context: { userId: req.body.userId },
            priority: 'high',
            autonomyLevel: 'moderate'
        });
        
        res.json({
            success: true,
            result,
            timestamp: new Date(),
            service: 'meeting_planner'
        });
        
    } catch (error) {
        console.error('❌ Meeting planning error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route POST /api/autonomous/project/manage
 * @description Autonomous project management
 */
router.post('/project/manage', async (req, res) => {
    try {
        const { projectData, managementType } = req.body;
        
        if (!projectData || !managementType) {
            return res.status(400).json({
                success: false,
                error: 'Project data and management type are required'
            });
        }
        
        console.log(`📊 PROJECT MANAGER: Managing project: ${managementType}`);
        
        const task = {
            type: 'project_management',
            data: {
                projectData,
                managementType,
                scope: projectData.scope || 'standard'
            }
        };
        
        const result = await autonomousAgent.executeAutonomously({
            task,
            context: { userId: req.body.userId },
            priority: projectData.priority || 'medium',
            autonomyLevel: 'moderate'
        });
        
        res.json({
            success: true,
            result,
            timestamp: new Date(),
            service: 'project_manager'
        });
        
    } catch (error) {
        console.error('❌ Project management error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route POST /api/autonomous/research/execute
 * @description Autonomous research execution
 */
router.post('/research/execute', async (req, res) => {
    try {
        const { researchTopic, scope, deliverables } = req.body;
        
        if (!researchTopic) {
            return res.status(400).json({
                success: false,
                error: 'Research topic is required'
            });
        }
        
        console.log(`🔍 RESEARCH ENGINE: Executing research: ${researchTopic}`);
        
        const task = {
            type: 'research_automation',
            data: {
                topic: researchTopic,
                scope: scope || 'standard',
                deliverables: deliverables || ['report', 'insights']
            }
        };
        
        const result = await autonomousAgent.executeAutonomously({
            task,
            context: { userId: req.body.userId },
            priority: 'medium',
            autonomyLevel: 'moderate'
        });
        
        res.json({
            success: true,
            result,
            timestamp: new Date(),
            service: 'research_engine'
        });
        
    } catch (error) {
        console.error('❌ Research execution error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route GET /api/autonomous/capabilities
 * @description Get autonomous capabilities
 */
router.get('/capabilities', async (req, res) => {
    try {
        const agentStatus = autonomousAgent.getStatus();
        const capabilities = agentStatus.capabilities;
        
        const detailedCapabilities = {
            meeting_planning: {
                enabled: capabilities.meeting_planning,
                description: 'Autonomous meeting orchestration with agenda, participants, and follow-up',
                endpoints: ['/api/autonomous/meeting/plan'],
                autonomy_level: 'moderate'
            },
            project_management: {
                enabled: capabilities.project_management,
                description: 'Complete project lifecycle management from initiation to closure',
                endpoints: ['/api/autonomous/project/manage'],
                autonomy_level: 'moderate'
            },
            research_automation: {
                enabled: capabilities.research_automation,
                description: 'Autonomous research with data gathering, analysis, and report generation',
                endpoints: ['/api/autonomous/research/execute'],
                autonomy_level: 'moderate'
            },
            email_automation: {
                enabled: capabilities.email_automation,
                description: 'Smart email processing, categorization, and response automation',
                endpoints: ['/api/autonomous/email/process'],
                autonomy_level: 'conservative'
            },
            crm_automation: {
                enabled: capabilities.crm_automation,
                description: 'Automated contact management, lead nurturing, and relationship building',
                endpoints: ['/api/autonomous/crm/process'],
                autonomy_level: 'moderate'
            },
            workflow_orchestration: {
                enabled: capabilities.workflow_orchestration,
                description: 'Intelligent workflow execution with decision-making capabilities',
                endpoints: ['/api/autonomous/workflow'],
                autonomy_level: 'moderate'
            }
        };
        
        res.json({
            success: true,
            capabilities: detailedCapabilities,
            autonomous_agent: {
                status: agentStatus.isActive,
                autonomy_level: agentStatus.autonomyLevel,
                current_tasks: agentStatus.currentTasks,
                last_execution: agentStatus.lastExecution
            },
            timestamp: new Date()
        });
        
    } catch (error) {
        console.error('❌ Capabilities retrieval error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
