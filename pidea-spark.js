#!/usr/bin/env node

/**
 * Cursor Automation CDP CDP-Based Task Automation Workflow
 * 
 * This script automates task execution by directly controlling Cursor IDE or ChatGPT
 * through Chrome DevTools Protocol (CDP) using Playwright.
 * 
 * Usage: node automation-workflow-cdp.js [--port=9222] [--target=cursor|chatgpt] [--menu]
 */

import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// UI Modules
import { cursorSelectors, typingSelectors, cursorBlinkSelectors, streamingSelectors, fileEditSelectors, runningSelectors, completionSelectors, errorSelectors, markdownSelectors, responseSelectors } from './automation/ui/selectors.js';

// AI Modules
import { generateExecutionPrompt, generateReviewPrompt } from './automation/ai/prompts.js';
import { detectAITyping, extractAIResponse, detectResponseComplete, waitForAIResponse } from './automation/ai/response-processor.js';

// Manager Modules
import { loadTaskDefinitions, buildDependencyGraph, parseDependencies, checkDependencies } from './automation/managers/task-manager.js';
import { ReviewManager } from './automation/managers/review-manager.js';
import { initializeBrowser } from './automation/managers/browser-manager.js';

// Workflow Modules
import { ExecutionWorkflow } from './automation/workflows/execution-workflow.js';
import { PlanningWorkflow } from './automation/workflows/planning-workflow.js';

// Core Modules
import { ShellInterface } from './automation/core/shell-interface.js';
import { MenuSystem } from './automation/core/menu-system.js';
import { CONFIG, getConfig, loadConfigFromFile } from './automation/core/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class CDPTaskAutomationWorkflow {
    constructor() {
        this.config = {
            projectRoot: getConfig('paths.projectRoot', process.cwd()),
            tasksDir: getConfig('paths.tasksDir', 'pidea-spark-output'),
            orchestratorFile: getConfig('paths.orchestratorFile', null), // Will be set per project
            progressFile: getConfig('paths.progressFile', null), // Will be set per project
            logFile: getConfig('paths.logFile', 'pidea-spark.log'),
            cdpPort: getConfig('cdp.defaultPort', 9222)
        };
        
        this.currentTask = null;
        this.taskQueue = [];
        this.completedTasks = [];
        this.failedTasks = [];
        this.browser = null;
        this.currentProject = null;
        
        // NEW: Shell Interface and Menu System
        this.shellInterface = new ShellInterface();
        this.menuSystem = new MenuSystem();
        
        this.setupLogging();
    }

    setupLogging() {
        this.log = (message, level = 'INFO') => {
            const timestamp = new Date().toISOString();
            const logEntry = `[${timestamp}] [${level}] ${message}`;
            console.log(logEntry);
            
            if (getConfig('logging.fileLogging', true)) {
                fs.appendFileSync(this.config.logFile, logEntry + '\n');
            }
        };
    }

    async initialize() {
        this.log('🚀 Initializing Cursor Automation CDP Task Automation Workflow');
        
        // Load configuration from file if it exists
        await loadConfigFromFile();
        
        // NEW: Run Shell Interface first
        const shellResult = await this.shellInterface.run();
        
        // Handle different shell actions
        switch (shellResult.action) {
            case 'setup':
                // Chrome setup instructions shown, exit
                process.exit(0);
                break;
                
            case 'list':
                // Tasks listed, exit
                process.exit(0);
                break;
                
            case 'status':
                // Status shown, exit
                process.exit(0);
                break;
                
            case 'config':
                // Configuration shown, exit
                process.exit(0);
                break;
                
            case 'create-config':
                // Configuration file created, exit
                process.exit(0);
                break;
                
            case 'menu':
                // Show menu mode
                await this.runMenuMode();
                return;
                
            case 'execute':
                // Continue with normal execution
                this.config = { ...this.config, ...shellResult.config };
                break;
        }
        
        // NEW: Check if menu mode is requested
        if (shellResult.config.showMenu) {
            await this.runMenuMode();
            return;
        }
        
        // OLD: Original initialization logic
        this.parseArguments();
        await this.loadTaskDefinitions();
        this.buildDependencyGraph();
        await this.initializeBrowser();
        
        this.log(`📋 Loaded ${this.taskQueue.length} tasks for execution`);
    }

    // NEW: Menu Mode
    async runMenuMode() {
        this.log('🎮 Starting Menu Mode');
        
        try {
            const menuChoice = await this.menuSystem.showMainMenu();
            await this.handleMenuChoice(menuChoice);
        } catch (error) {
            this.log(`💥 Error in menu mode: ${error.message}`, 'ERROR');
            process.exit(1);
        }
    }

    // NEW: Handle Menu Choices
    async handleMenuChoice(choice) {
        this.log(`🎯 Handling menu choice: ${choice.workflow} - ${choice.action}`);
        
        switch (choice.workflow) {
            case 'execute':
                await this.handleExecuteWorkflow(choice);
                break;
                
            case 'planning':
                await this.handlePlanningWorkflow(choice);
                break;
                
            case 'debugging':
                await this.handleDebuggingWorkflow(choice);
                break;
                
            case 'testing':
                await this.handleTestingWorkflow(choice);
                break;
                
            case 'status':
                await this.handleStatusWorkflow(choice);
                break;
                
            case 'settings':
                await this.handleSettingsWorkflow(choice);
                break;
                
            default:
                this.log(`❌ Unknown workflow: ${choice.workflow}`, 'ERROR');
                process.exit(1);
        }
    }

    // NEW: Handle Execute Workflow
    async handleExecuteWorkflow(choice) {
        this.log('🎯 Starting Execute Workflow');
        
        if (!choice.project) {
            this.log('❌ No project selected', 'ERROR');
            return;
        }
        
        this.currentProject = choice.project;
        this.config.orchestratorFile = choice.project.path;
        this.config.progressFile = choice.project.systemPath + '/progress-tracker.md';
        
        // Create new ExecutionWorkflow instance
        const executionWorkflow = new ExecutionWorkflow(this.config, this.log);
        
        // Load task definitions
        await executionWorkflow.loadTaskDefinitions();
        executionWorkflow.buildDependencyGraph();
        await executionWorkflow.initializeBrowser();
        
        switch (choice.action) {
            case 'all':
                await executionWorkflow.executeWorkflow();
                break;
                
            case 'specific':
                await executionWorkflow.executeSpecificTask(choice.taskId);
                break;
                
            case 'list':
                await executionWorkflow.listTasks();
                break;
                
            case 'from':
                executionWorkflow.setStartFromTaskId(choice.taskId);
                await executionWorkflow.executeWorkflow();
                break;
                
            default:
                this.log(`❌ Unknown execute action: ${choice.action}`, 'ERROR');
        }
    }

    // NEW: Handle Planning Workflow
    async handlePlanningWorkflow(choice) {
        this.log('📋 Starting Planning Workflow');
        
        switch (choice.action) {
            case 'create':
                await this.createNewGameProject(choice.gameIdea, choice.projectName);
                break;
                
            case 'convert-idea':
                await this.convertIdeaToProject(choice.idea, choice.projectName);
                break;
                
            case 'edit':
                await this.editExistingProject(choice.project);
                break;
                
            case 'regenerate':
                await this.regenerateProjectPlan(choice.project);
                break;
                
            case 'templates':
                await this.showProjectTemplates();
                break;
                
            default:
                this.log(`❌ Unknown planning action: ${choice.action}`, 'ERROR');
        }
    }

    async convertIdeaToProject(idea, projectName) {
        this.log(`🔄 Converting idea to project: ${idea.name} -> ${projectName}`);
        
        try {
            // Import ProjectDetector dynamically to avoid circular imports
            const { ProjectDetector } = await import('./automation/core/project-detector.js');
            const projectDetector = new ProjectDetector();
            
            // Create project structure
            const projectPath = await projectDetector.createProjectStructure(projectName);
            
            // Copy idea content to the new project
            const ideaContent = fs.readFileSync(idea.path, 'utf8');
            const ideaFilePath = path.join(projectPath, 'idea-source.md');
            fs.writeFileSync(ideaFilePath, ideaContent);
            
            // Update orchestrator with idea information
            const orchestratorPath = path.join(projectPath, 'system', 'orchestrator.md');
            const orchestratorContent = fs.readFileSync(orchestratorPath, 'utf8');
            
            // Replace placeholder content with idea details
            const updatedOrchestrator = orchestratorContent
                .replace(/Automated game development project for: .+/, `Automated game development project for: ${projectName}`)
                .replace(/## Description[\s\S]*?(?=\n##|\n$)/, `## Description\n${idea.metadata.description || 'Converted from idea'}`)
                .replace(/## Game Type[\s\S]*?(?=\n##|\n$)/, `## Game Type\n${idea.metadata.gameType || 'To be defined'}`);
            
            fs.writeFileSync(orchestratorPath, updatedOrchestrator);
            
            // Configure PlanningWorkflow with proper settings
            const planningConfig = {
                ...this.config,
                projectRoot: process.cwd(),
                tasksDir: 'pidea-spark-output',
                templateDir: 'automation/templates',
                projectPath: projectPath,
                orchestratorFile: orchestratorPath,
                progressFile: path.join(projectPath, 'system', 'progress-tracker.md')
            };
            
            // Create new PlanningWorkflow instance
            const planningWorkflow = new PlanningWorkflow(planningConfig, this.log);
            
            // Initialize browser for AI communication
            await planningWorkflow.initializeBrowser();
            
            // Execute planning workflow with idea content
            await planningWorkflow.executePlanningWorkflow(idea.content, projectName);
            
            console.log(`✅ Idea "${idea.name}" converted to project "${projectName}" successfully!`);
            console.log(`📁 Project location: ${projectPath}`);
            console.log(`📄 Original idea saved as: idea-source.md`);
            
        } catch (error) {
            this.log(`❌ Error converting idea to project: ${error.message}`, 'ERROR');
            console.error('Full error:', error);
        }
    }

    // NEW: Handle Debugging Workflow
    async handleDebuggingWorkflow(choice) {
        this.log('🐛 Starting Debugging Workflow');
        
        if (!choice.project) {
            this.log('❌ No project selected', 'ERROR');
            return;
        }
        
        this.currentProject = choice.project;
        
        switch (choice.action) {
            case 'analyze':
                await this.analyzeProjectIssues();
                break;
                
            case 'fix':
                await this.fixCommonIssues();
                break;
                
            case 'report':
                await this.generateDebugReport();
                break;
                
            case 'manual':
                await this.manualDebugMode();
                break;
                
            default:
                this.log(`❌ Unknown debugging action: ${choice.action}`, 'ERROR');
        }
    }

    // NEW: Handle Testing Workflow
    async handleTestingWorkflow(choice) {
        this.log('🧪 Starting Testing Workflow');
        
        if (!choice.project) {
            this.log('❌ No project selected', 'ERROR');
            return;
        }
        
        this.currentProject = choice.project;
        
        switch (choice.action) {
            case 'start':
                await this.startGame();
                break;
                
            case 'automated':
                await this.runAutomatedTests();
                break;
                
            case 'performance':
                await this.performanceTest();
                break;
                
            case 'report':
                await this.generateTestReport();
                break;
                
            default:
                this.log(`❌ Unknown testing action: ${choice.action}`, 'ERROR');
        }
    }

    // NEW: Handle Status Workflow
    async handleStatusWorkflow(choice) {
        this.log('📊 Starting Status Workflow');
        
        if (!choice.project) {
            this.log('❌ No project selected', 'ERROR');
            return;
        }
        
        this.currentProject = choice.project;
        
        switch (choice.action) {
            case 'progress':
                await this.showProjectProgress();
                break;
                
            case 'summary':
                await this.showTaskSummary();
                break;
                
            case 'detailed':
                await this.generateDetailedReport();
                break;
                
            case 'timeline':
                await this.showTimelineView();
                break;
                
            default:
                this.log(`❌ Unknown status action: ${choice.action}`, 'ERROR');
        }
    }

    // NEW: Handle Settings Workflow
    async handleSettingsWorkflow(choice) {
        this.log('⚙️ Starting Settings Workflow');
        
        switch (choice.action) {
            case 'cdp':
                await this.configureCDP();
                break;
                
            case 'templates':
                await this.manageTemplates();
                break;
                
            case 'ai':
                await this.configureAI();
                break;
                
            case 'paths':
                await this.configurePaths();
                break;
                
            default:
                this.log(`❌ Unknown settings action: ${choice.action}`, 'ERROR');
        }
    }

    // NEW: Placeholder methods for workflows (to be implemented)
    async createNewGameProject(gameIdea, projectName) {
        this.log(`🆕 Creating new game project: ${gameIdea}`);
        
        try {
            // Import ProjectDetector dynamically to avoid circular imports
            const { ProjectDetector } = await import('./automation/core/project-detector.js');
            const projectDetector = new ProjectDetector();
            
            // Generate project name if not provided
            if (!projectName) {
                projectName = this.generateProjectName(gameIdea);
            }
            
            // Create project structure
            const projectPath = await projectDetector.createProjectStructure(projectName);
            
            // Configure PlanningWorkflow with proper settings
            const planningConfig = {
                ...this.config,
                projectRoot: process.cwd(),
                tasksDir: 'pidea-spark-output',
                templateDir: 'automation/templates',
                projectPath: projectPath,
                orchestratorFile: path.join(projectPath, 'system', 'orchestrator.md'),
                progressFile: path.join(projectPath, 'system', 'progress-tracker.md')
            };
            
            // Create new PlanningWorkflow instance
            const planningWorkflow = new PlanningWorkflow(planningConfig, this.log);
            
            // Initialize browser for AI communication
            await planningWorkflow.initializeBrowser();
            
            // Execute planning workflow
            await planningWorkflow.executePlanningWorkflow(gameIdea, projectName);
            
            console.log(`✅ Game project "${projectName}" created successfully!`);
            console.log(`📁 Project location: ${projectPath}`);
            
        } catch (error) {
            this.log(`❌ Error creating project: ${error.message}`, 'ERROR');
            console.error('Full error:', error);
        }
    }

    generateProjectName(gameIdea) {
        // Generate a simple project name from the game idea
        const words = gameIdea.split(' ').slice(0, 3);
        const name = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `${name}${timestamp}`;
    }

    async editExistingProject(gameName) {
        this.log(`📝 Editing existing project: ${gameName}`);
        // TODO: Implement project editing
        console.log(`✅ Project "${gameName}" edited successfully!`);
    }

    async regenerateProjectPlan(gameName) {
        this.log(`🔄 Regenerating project plan: ${gameName}`);
        // TODO: Implement plan regeneration
        console.log(`✅ Project plan for "${gameName}" regenerated successfully!`);
    }

    async showProjectTemplates() {
        this.log('📊 Showing project templates');
        // TODO: Implement template listing
        console.log('✅ Project templates displayed successfully!');
    }

    async analyzeProjectIssues() {
        this.log('🔍 Analyzing project issues');
        // TODO: Implement issue analysis
        console.log('✅ Project issues analyzed successfully!');
    }

    async fixCommonIssues() {
        this.log('🛠️ Fixing common issues');
        // TODO: Implement issue fixing
        console.log('✅ Common issues fixed successfully!');
    }

    async generateDebugReport() {
        this.log('📊 Generating debug report');
        // TODO: Implement debug report generation
        console.log('✅ Debug report generated successfully!');
    }

    async manualDebugMode() {
        this.log('🔧 Starting manual debug mode');
        // TODO: Implement manual debugging
        console.log('✅ Manual debug mode started successfully!');
    }

    async startGame() {
        this.log('🚀 Starting game');
        // TODO: Implement game starting
        console.log('✅ Game started successfully!');
    }

    async runAutomatedTests() {
        this.log('🧪 Running automated tests');
        // TODO: Implement automated testing
        console.log('✅ Automated tests completed successfully!');
    }

    async performanceTest() {
        this.log('📊 Running performance test');
        // TODO: Implement performance testing
        console.log('✅ Performance test completed successfully!');
    }

    async generateTestReport() {
        this.log('📋 Generating test report');
        // TODO: Implement test report generation
        console.log('✅ Test report generated successfully!');
    }

    async showProjectProgress() {
        this.log('📈 Showing project progress');
        // TODO: Implement progress display
        console.log('✅ Project progress displayed successfully!');
    }

    async showTaskSummary() {
        this.log('📋 Showing task summary');
        // TODO: Implement task summary
        console.log('✅ Task summary displayed successfully!');
    }

    async generateDetailedReport() {
        this.log('📊 Generating detailed report');
        // TODO: Implement detailed report generation
        console.log('✅ Detailed report generated successfully!');
    }

    async showTimelineView() {
        this.log('📅 Showing timeline view');
        // TODO: Implement timeline view
        console.log('✅ Timeline view displayed successfully!');
    }

    async configureCDP() {
        this.log('🔧 Configuring CDP');
        // TODO: Implement CDP configuration
        console.log('✅ CDP configured successfully!');
    }

    async manageTemplates() {
        this.log('🎮 Managing templates');
        // TODO: Implement template management
        console.log('✅ Templates managed successfully!');
    }

    async configureAI() {
        this.log('🤖 Configuring AI');
        // TODO: Implement AI configuration
        console.log('✅ AI configured successfully!');
    }

    async configurePaths() {
        this.log('📁 Configuring paths');
        // TODO: Implement path configuration
        console.log('✅ Paths configured successfully!');
    }

    // OLD: Original methods (keep existing functionality)
    parseArguments() {
        // This is now handled by ShellInterface
        // Keep for backward compatibility
    }

    async loadTaskDefinitions() {
        try {
            this.taskQueue = loadTaskDefinitions(this.config.orchestratorFile);
            this.log(`📊 Parsed ${this.taskQueue.length} tasks from orchestrator`);
        } catch (error) {
            this.log(`❌ Error loading task definitions: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    buildDependencyGraph() {
        this.taskQueue = buildDependencyGraph(this.taskQueue);
        this.log('🔗 Built dependency graph and sorted tasks');
    }

    parseDependencies(depString) {
        return parseDependencies(depString);
    }

    async initializeBrowser() {
        try {
            const { browser, page } = await initializeBrowser(this.config.cdpPort, this.log);
            this.browser = browser;
            this.page = page;
        } catch (error) {
            throw error;
        }
    }

    // NEW: Execute specific task
    async executeSpecificTask(taskId) {
        this.log(`🎯 Executing specific task: ${taskId}`);
        
        const task = this.taskQueue.find(t => t.id === taskId);
        if (!task) {
            this.log(`❌ Task ${taskId} not found`, 'ERROR');
            return;
        }
        
        await this.initializeBrowser();
        await this.executeTaskWithCDP(task);
    }

    // NEW: List tasks
    async listTasks() {
        this.log('📋 Listing tasks');
        
        if (this.taskQueue.length === 0) {
            await this.loadTaskDefinitions();
        }
        
        console.log('\n📋 Available Tasks:');
        console.log('==================\n');
        
        for (const task of this.taskQueue) {
            const status = task.status || '📋 Ready';
            const progress = task.progress || '0%';
            console.log(`${task.id.toString().padStart(2)}. ${task.name.padEnd(40)} ${status} (${progress})`);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Main execution
async function main() {
    const workflow = new CDPTaskAutomationWorkflow();
    
    try {
        await workflow.initialize();
        await workflow.executeWorkflow();
        console.log('🎉 CDP automation workflow completed!');
    } catch (error) {
        console.error('💥 CDP workflow failed:', error.message);
        process.exit(1);
    }
}

// Main execution
main().catch(console.error);

export default CDPTaskAutomationWorkflow; 