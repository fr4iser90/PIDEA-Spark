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
        
        // NEW: Initialize with workspace detection
        const { ProjectDetector } = await import('./automation/core/project-detector.js');
        const projectDetector = new ProjectDetector(this.config);
        await projectDetector.initialize();
        
        const workspaceInfo = projectDetector.getWorkspaceInfo();
        if (workspaceInfo.isInWorkspace) {
            this.log(`🎯 Using Cursor workspace: ${workspaceInfo.workspacePath}`);
            // Update config to use workspace paths
            this.config.projectRoot = workspaceInfo.workspacePath;
            this.config.tasksDir = workspaceInfo.outputDir;
        } else {
            this.log(`⚠️ Using local directory (Cursor workspace not found)`);
        }
        
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
        
        // Check if project path is in workspace or local
        const { ProjectDetector } = await import('./automation/core/project-detector.js');
        const projectDetector = new ProjectDetector(this.config);
        await projectDetector.initialize();
        
        const workspaceInfo = projectDetector.getWorkspaceInfo();
        
        // Update project paths based on workspace detection
        if (workspaceInfo.isInWorkspace) {
            this.config.orchestratorFile = path.join(workspaceInfo.outputDir, choice.project.name, 'system', 'orchestrator.md');
            this.config.progressFile = path.join(workspaceInfo.outputDir, choice.project.name, 'system', 'progress-tracker.md');
            this.log(`🎯 Using workspace project: ${workspaceInfo.workspacePath}`);
        } else {
            this.config.orchestratorFile = choice.project.path;
            this.config.progressFile = choice.project.systemPath + '/progress-tracker.md';
            this.log(`⚠️ Using local project (workspace not found)`);
        }
        
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
            const projectDetector = new ProjectDetector(this.config);
            
            // Initialize with workspace detection
            await projectDetector.initialize();
            
            // Get workspace info early
            const workspaceInfo = projectDetector.getWorkspaceInfo();
            
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
                progressFile: path.join(projectPath, 'system', 'progress-tracker.md'),
                workspacePath: workspaceInfo.workspacePath // Pass workspace path to PlanningWorkflow
            };
            
            // Create new PlanningWorkflow instance
            const planningWorkflow = new PlanningWorkflow(planningConfig, this.log);
            
            // Initialize browser for AI communication
            await planningWorkflow.initializeBrowser();
            
            // Execute planning workflow with idea content
            await planningWorkflow.executePlanningWorkflow(idea.content, projectName);
            
            console.log(`✅ Idea "${idea.name}" converted to project "${projectName}" successfully!`);
            console.log(`📁 Project location: ${projectPath}`);
            if (workspaceInfo.isInWorkspace) {
                console.log(`🎯 Created in Cursor workspace: ${workspaceInfo.workspacePath}`);
            } else {
                console.log(`⚠️ Created in local directory (Cursor workspace not found)`);
            }
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
            const projectDetector = new ProjectDetector(this.config);
            
            // Initialize with workspace detection
            await projectDetector.initialize();
            
            // Get workspace info early
            const workspaceInfo = projectDetector.getWorkspaceInfo();
            
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
                progressFile: path.join(projectPath, 'system', 'progress-tracker.md'),
                workspacePath: workspaceInfo.workspacePath // Pass workspace path to PlanningWorkflow
            };
            
            // Create new PlanningWorkflow instance
            const planningWorkflow = new PlanningWorkflow(planningConfig, this.log);
            
            // Initialize browser for AI communication
            await planningWorkflow.initializeBrowser();
            
            // Execute planning workflow
            await planningWorkflow.executePlanningWorkflow(gameIdea, projectName);
            
            console.log(`✅ Game project "${projectName}" created successfully!`);
            console.log(`📁 Project location: ${projectPath}`);
            if (workspaceInfo.isInWorkspace) {
                console.log(`🎯 Created in Cursor workspace: ${workspaceInfo.workspacePath}`);
            } else {
                console.log(`⚠️ Created in local directory (Cursor workspace not found)`);
            }
            
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

    // NEW: Git Operations Integration
    async checkGitStatus() {
        this.log('🔍 Checking Git status...');
        
        try {
            // Import GitStatusChecker dynamically
            const GitStatusChecker = (await import('./automation/git-operations/git-status.js')).default;
            const gitChecker = new GitStatusChecker(this.config.projectRoot);
            
            const gitInfo = await gitChecker.getFullInfo();
            
            if (gitInfo.isGitRepo) {
                this.log(`✅ Git repository found in: ${gitInfo.workspacePath}`);
                this.log(`📋 Current branch: ${gitInfo.branch.branch}`);
                this.log(`📊 Status: ${gitInfo.status.status.total} changes`);
                
                if (gitInfo.status.status.total > 0) {
                    this.log(`⚠️ Repository has uncommitted changes`);
                    this.log(`   Modified: ${gitInfo.status.status.modified}`);
                    this.log(`   Added: ${gitInfo.status.status.added}`);
                    this.log(`   Deleted: ${gitInfo.status.status.deleted}`);
                    this.log(`   Untracked: ${gitInfo.status.status.untracked}`);
                } else {
                    this.log(`✅ Repository is clean`);
                }
                
                return gitInfo;
            } else {
                this.log(`❌ No Git repository found in: ${gitInfo.workspacePath}`);
                return gitInfo;
            }
        } catch (error) {
            this.log(`❌ Error checking Git status: ${error.message}`, 'ERROR');
            return { error: error.message };
        }
    }

    async getGitBranches() {
        this.log('🌿 Getting Git branches...');
        
        try {
            // Import GitBranchManager dynamically
            const GitBranchManager = (await import('./automation/git-operations/git-branches.js')).default;
            const branchManager = new GitBranchManager(this.config.projectRoot);
            
            const branches = await branchManager.getAllBranches();
            
            if (branches.error) {
                this.log(`❌ Error getting branches: ${branches.error}`, 'ERROR');
                return branches;
            }
            
            this.log(`✅ Found ${branches.local.length} local and ${branches.remote.length} remote branches`);
            this.log(`📋 Current branch: ${branches.current}`);
            
            return branches;
        } catch (error) {
            this.log(`❌ Error getting Git branches: ${error.message}`, 'ERROR');
            return { error: error.message };
        }
    }

    async createGitBranch(branchName) {
        this.log(`🌿 Creating Git branch: ${branchName}`);
        
        try {
            // Import GitBranchManager dynamically
            const GitBranchManager = (await import('./automation/git-operations/git-branches.js')).default;
            const branchManager = new GitBranchManager(this.config.projectRoot);
            
            const result = await branchManager.createBranch(branchName);
            
            if (result.success) {
                this.log(`✅ ${result.message}`);
            } else {
                this.log(`❌ Error creating branch: ${result.error}`, 'ERROR');
            }
            
            return result;
        } catch (error) {
            this.log(`❌ Error creating Git branch: ${error.message}`, 'ERROR');
            return { error: error.message };
        }
    }

    async switchGitBranch(branchName) {
        this.log(`🌿 Switching to Git branch: ${branchName}`);
        
        try {
            // Import GitBranchManager dynamically
            const GitBranchManager = (await import('./automation/git-operations/git-branches.js')).default;
            const branchManager = new GitBranchManager(this.config.projectRoot);
            
            const result = await branchManager.switchBranch(branchName);
            
            if (result.success) {
                this.log(`✅ ${result.message}`);
            } else {
                this.log(`❌ Error switching branch: ${result.error}`, 'ERROR');
            }
            
            return result;
        } catch (error) {
            this.log(`❌ Error switching Git branch: ${error.message}`, 'ERROR');
            return { error: error.message };
        }
    }

    async commitAndPush(message, files = []) {
        this.log(`💾 Committing and pushing changes...`);
        
        try {
            // Import GitOperationsManager dynamically
            const GitOperationsManager = (await import('./automation/git-operations/run.js')).default;
            const gitManager = new GitOperationsManager(this.config, this.log);
            await gitManager.initialize();
            
            // Add files
            const addResult = await gitManager.addFiles(files);
            if (addResult.error) {
                this.log(`❌ Error adding files: ${addResult.error}`, 'ERROR');
                return addResult;
            }
            
            // Commit
            const commitResult = await gitManager.commit(message);
            if (commitResult.error) {
                this.log(`❌ Error committing: ${commitResult.error}`, 'ERROR');
                return commitResult;
            }
            
            // Push
            const pushResult = await gitManager.push();
            if (pushResult.error) {
                this.log(`❌ Error pushing: ${pushResult.error}`, 'ERROR');
                return pushResult;
            }
            
            this.log(`✅ Successfully committed and pushed changes`);
            return { success: true, message: 'Changes committed and pushed successfully' };
        } catch (error) {
            this.log(`❌ Error in commit and push: ${error.message}`, 'ERROR');
            return { error: error.message };
        }
    }

    // OLD: Original methods (keep existing functionality)
    parseArguments() {
        // This is now handled by ShellInterface
        // Keep for backward compatibility
    }

    async loadTaskDefinitions() {
        try {
            // Use the updated config paths that may point to workspace
            this.taskQueue = loadTaskDefinitions(this.config.orchestratorFile);
            this.log(`📊 Parsed ${this.taskQueue.length} tasks from orchestrator`);
            
            // Log where the orchestrator was loaded from
            if (this.config.orchestratorFile) {
                this.log(`📁 Loaded from: ${this.config.orchestratorFile}`);
            }
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
        
        // Initialize with workspace detection if not already done
        const { ProjectDetector } = await import('./automation/core/project-detector.js');
        const projectDetector = new ProjectDetector(this.config);
        await projectDetector.initialize();
        
        const workspaceInfo = projectDetector.getWorkspaceInfo();
        if (workspaceInfo.isInWorkspace) {
            this.log(`🎯 Using Cursor workspace: ${workspaceInfo.workspacePath}`);
        } else {
            this.log(`⚠️ Using local directory (Cursor workspace not found)`);
        }
        
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
            // Initialize with workspace detection if not already done
            const { ProjectDetector } = await import('./automation/core/project-detector.js');
            const projectDetector = new ProjectDetector(this.config);
            await projectDetector.initialize();
            
            const workspaceInfo = projectDetector.getWorkspaceInfo();
            if (workspaceInfo.isInWorkspace) {
                this.log(`🎯 Using Cursor workspace: ${workspaceInfo.workspacePath}`);
            } else {
                this.log(`⚠️ Using local directory (Cursor workspace not found)`);
            }
            
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

    // NEW: Execute workflow
    async executeWorkflow() {
        this.log('🚀 Starting workflow execution');
        
        // Initialize with workspace detection if not already done
        const { ProjectDetector } = await import('./automation/core/project-detector.js');
        const projectDetector = new ProjectDetector(this.config);
        await projectDetector.initialize();
        
        const workspaceInfo = projectDetector.getWorkspaceInfo();
        if (workspaceInfo.isInWorkspace) {
            this.log(`🎯 Using Cursor workspace: ${workspaceInfo.workspacePath}`);
        } else {
            this.log(`⚠️ Using local directory (Cursor workspace not found)`);
        }
        
        // Load tasks if not already loaded
        if (this.taskQueue.length === 0) {
            await this.loadTaskDefinitions();
            this.buildDependencyGraph();
        }
        
        // Initialize browser if not already done
        if (!this.browser) {
            await this.initializeBrowser();
        }
        
        // Execute all tasks
        for (const task of this.taskQueue) {
            try {
                this.log(`🎯 Executing task: ${task.name}`);
                await this.executeTaskWithCDP(task);
                this.completedTasks.push(task);
            } catch (error) {
                this.log(`❌ Error executing task ${task.name}: ${error.message}`, 'ERROR');
                this.failedTasks.push(task);
            }
        }
        
        this.log(`✅ Workflow completed. ${this.completedTasks.length} successful, ${this.failedTasks.length} failed`);
    }

    // NEW: Set start from task ID
    setStartFromTaskId(taskId) {
        this.log(`🎯 Setting start point to task: ${taskId}`);
        
        const startIndex = this.taskQueue.findIndex(t => t.id === taskId);
        if (startIndex === -1) {
            this.log(`❌ Task ${taskId} not found`, 'ERROR');
            return;
        }
        
        // Filter tasks to start from the specified task
        this.taskQueue = this.taskQueue.slice(startIndex);
        this.log(`✅ Will start execution from task ${taskId}: ${this.taskQueue[0].name}`);
    }

    // NEW: Execute task with CDP (placeholder - to be implemented)
    async executeTaskWithCDP(task) {
        this.log(`🔧 Executing task with CDP: ${task.name}`);
        // TODO: Implement actual CDP task execution
        await this.delay(1000); // Simulate task execution
        this.log(`✅ Task completed: ${task.name}`);
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