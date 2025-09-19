#!/usr/bin/env node

/**
 * Execution Workflow Module
 * 
 * Handles the complete task execution workflow including:
 * - Initial project review
 * - Task execution with CDP
 * - Progress tracking
 * - Final reporting
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Manager Modules
import { ReviewManager } from '../managers/review-manager.js';
import { loadTaskDefinitions, buildDependencyGraph, checkDependencies } from '../managers/task-manager.js';
import { initializeBrowser } from '../managers/browser-manager.js';

// AI Modules
import { generateExecutionPrompt } from '../ai/prompts.js';
import { detectAITyping, extractAIResponse, detectResponseComplete, waitForAIResponse } from '../ai/response-processor.js';
import { SendToCursor } from '../ai/send-to-cursor.js';
import { ValidateTaskCompletion } from '../ai/validate-task-completion.js';

// UI Modules
import { cursorSelectors, typingSelectors, cursorBlinkSelectors, streamingSelectors, errorSelectors } from '../ui/selectors.js';

// Core Modules
import { getConfig } from '../core/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ExecutionWorkflow {
    constructor(config, log) {
        this.config = config;
        this.log = log;
        this.currentTask = null;
        this.taskQueue = [];
        this.completedTasks = [];
        this.failedTasks = [];
        this.browser = null;
        this.page = null;
        this.startFromTaskId = null;
        this.sendToCursor = null; // Will be initialized when browser is ready
        this.validateTaskCompletion = new ValidateTaskCompletion(log); // Initialize validation
    }

    async executeWorkflow() {
        this.log('🎬 Starting CDP-based automated task execution workflow');
        
        // PHASE 1: Task Execution (Skip Review - Go Directly to Tasks)
        this.log('🚀 PHASE 1: Starting direct task execution...');
        
        // Process ALL tasks - no safety limit
        let processedTasks = 0;
        let maxRetries = 3; // Maximum retry attempts per task
        let retryCount = 0;
        
        // Keep track of tasks that need to be retried
        let pendingTasks = [...this.taskQueue];
        let completedThisRound = [];
        
        while (pendingTasks.length > 0 && retryCount < maxRetries) {
            this.log(`🔄 Round ${retryCount + 1}: Processing ${pendingTasks.length} pending tasks`);
            
            let tasksToProcess = [...pendingTasks];
            pendingTasks = []; // Reset for next round
            
            for (const task of tasksToProcess) {
                // Skip if starting from specific task
                if (this.startFromTaskId && task.id < this.startFromTaskId) {
                    this.log(`⏭️ Skipping task ${task.id} (starting from ${this.startFromTaskId})`);
                    continue;
                }
                
                // Skip if task is already completed
                if (task.status === '✅ Completed' || task.status === 'Completed') {
                    this.log(`✅ Task ${task.id} already completed, skipping`);
                    this.completedTasks.push(task);
                    continue;
                }
                
                // Check dependencies - only skip if task has dependencies that aren't met
                if (task.dependencies && task.dependencies !== '-' && !this.checkDependencies(task)) {
                    this.log(`⏳ Task ${task.id} dependencies not met, will retry in next round`);
                    pendingTasks.push(task); // Add back to pending for next round
                    continue;
                }
                
                this.currentTask = task;
                this.log(`🎯 Executing Task ${task.id}: ${task.name}`);
                
                try {
                    const success = await this.executeTaskWithCDP(task);
                    
                    if (success) {
                        this.completedTasks.push(task);
                        completedThisRound.push(task.id);
                        this.log(`✅ Task ${task.id} completed successfully`);
                    } else {
                        this.failedTasks.push(task);
                        this.log(`❌ Task ${task.id} failed`);
                    }
                    
                    // Update progress
                    await this.updateProgress();
                    
                    // Wait between tasks
                    await this.delay(5000); // 5 seconds between tasks
                    
                    processedTasks++;
                    
                } catch (error) {
                    this.log(`💥 Error executing task ${task.id}: ${error.message}`, 'ERROR');
                    this.failedTasks.push(task);
                }
            }
            
            // If no tasks were completed this round, increment retry count
            if (completedThisRound.length === 0) {
                retryCount++;
                this.log(`⚠️ No tasks completed in round ${retryCount}, retry ${retryCount}/${maxRetries}`);
            } else {
                retryCount = 0; // Reset retry count if we made progress
                this.log(`✅ Completed ${completedThisRound.length} tasks this round`);
            }
            
            // Small delay between rounds
            if (pendingTasks.length > 0) {
                await this.delay(2000);
            }
        }
        
        // Report on any remaining pending tasks
        if (pendingTasks.length > 0) {
            this.log(`⚠️ ${pendingTasks.length} tasks could not be completed due to dependency issues:`, 'WARNING');
            for (const task of pendingTasks) {
                this.log(`   - Task ${task.id}: ${task.name} (dependencies: ${task.dependencies})`);
            }
        }
        
        await this.generateFinalReport();
    }

    checkDependencies(task) {
        return checkDependencies(task, this.completedTasks);
    }

    async executeTaskWithCDP(task) {
        try {
            // 1. Load task index.md file
            const taskIndexPath = await this.loadTaskIndex(task);
            
            if (!taskIndexPath) {
                this.log(`❌ Task index.md not found for task ${task.id}`, 'ERROR');
                return false;
            }
            
            // 2. Send task execute command with index.md content
            const taskExecutePrompt = `task execute\n\n${taskIndexPath}`;
            
            this.log(`📤 Sending task execute for Task ${task.id}: ${task.name}`);
            const response = await this.sendToAIviaCDP(taskExecutePrompt);
            
            // 3. Check if task was completed by looking for completion indicators
            const isCompleted = await this.checkTaskCompletion(task);
            
            // 4. Update task status
            await this.updateTaskStatus(task, isCompleted);
            
            return isCompleted;
            
        } catch (error) {
            this.log(`💥 Error in CDP task execution: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async loadTaskIndex(task) {
        // Map task ID to actual directory name
        const taskDirName = this.mapTaskIdToDirectory(task.id);
        
        if (!taskDirName) {
            this.log(`❌ Could not map task ${task.id} to directory name`, 'ERROR');
            return null;
        }
        
        // Map category to actual directory name
        const categoryDirName = this.mapCategoryToDirectory(task.category);
        
        // Use the full path to the tasks directory (go up from system/ to project root, then to tasks/)
        const projectRoot = path.dirname(path.dirname(this.config.orchestratorFile));
        const tasksDir = path.join(projectRoot, 'tasks');
        
        // Find the task directory and index.md file
        const taskDir = path.join(
            tasksDir,
            categoryDirName,
            taskDirName
        );
        
        const indexPath = path.join(taskDir, 'index.md');
        
        if (fs.existsSync(indexPath)) {
            const indexContent = fs.readFileSync(indexPath, 'utf8');
            this.log(`📁 Found task index: ${indexPath}`);
            return indexContent;
        }
        
        // Try alternative paths
        const alternativePaths = [
            path.join(taskDir, `${taskDirName}-index.md`),
            path.join(taskDir, 'task-index.md'),
            path.join(taskDir, 'README.md')
        ];
        
        for (const altPath of alternativePaths) {
            if (fs.existsSync(altPath)) {
                const indexContent = fs.readFileSync(altPath, 'utf8');
                this.log(`📁 Found task index (alternative): ${altPath}`);
                return indexContent;
            }
        }
        
        this.log(`❌ No index.md found for task ${task.id} in directory: ${taskDir}`, 'ERROR');
        return null;
    }

    mapTaskIdToDirectory(taskId) {
        // Map task IDs to actual directory names based on the template structure
        const taskMapping = {
            // Project Setup (01)
            '1.1': '01-git-repository-branching',
            '1.2': '02-project-structure-creation',
            '1.3': '03-linter-formatter-config',
            '1.4': '04-build-system-setup',
            '1.5': '05-package-management',
            '1.6': '06-code-formatting',
            '1.7': '07-logging-system',
            '1.8': '08-config-system',
            '1.9': '09-documentation',
            '1.10': '10-ci-cd-skeleton',
            
            // Core Engine (02)
            '2.1': '01-game-loop-basis',
            '2.2': '02-entity-component-system',
            '2.3': '03-physics-engine',
            '2.4': '04-input-handling',
            '2.5': '05-rendering-pipeline',
            '2.6': '06-audio-engine',
            '2.7': '07-ai-pathfinding',
            '2.8': '08-ai-behavior-trees',
            '2.9': '09-event-system',
            '2.10': '10-resource-management',
            '2.11': '11-serialization',
            '2.12': '12-plugin-system',
            '2.13': '13-mod-support',
            '2.14': '14-performance-benchmarking',
            '2.15': '15-engine-documentation',
            
            // Frontend UI (03)
            '3.1': '01-ui-framework-setup',
            '3.2': '02-main-menu',
            '3.3': '03-hud-implementation',
            '3.4': '04-settings-menu',
            '3.5': '05-inventory-ui',
            '3.6': '06-responsive-design',
            '3.7': '07-ui-animations',
            '3.8': '08-localization-ui',
            '3.9': '09-accessibility',
            '3.10': '10-ui-testing',
            
            // Assets Pipeline (04)
            '4.1': '01-asset-pipeline-setup',
            '4.2': '02-asset-loader',
            '4.3': '03-texture-optimization',
            '4.4': '04-spritesheet-integration',
            '4.5': '05-model-importer',
            '4.6': '06-audio-assets',
            '4.7': '07-music-system',
            '4.8': '08-asset-cache',
            '4.9': '09-asset-versioning',
            '4.10': '10-asset-testing',
            
            // Data Persistence (05)
            '5.1': '01-save-load-system',
            '5.2': '02-cloud-save',
            '5.3': '03-database-integration',
            '5.4': '04-data-migration',
            '5.5': '05-data-security',
            
            // Multiplayer (06)
            '6.1': '01-networking-stack',
            '6.2': '02-client-server-architecture',
            '6.3': '03-matchmaking',
            '6.4': '04-lobby-system',
            '6.5': '05-realtime-sync',
            '6.6': '06-lag-compensation',
            '6.7': '07-anti-cheat',
            '6.8': '08-network-compression',
            '6.9': '09-multiplayer-testing',
            '6.10': '10-network-monitoring',
            
            // Feature Development (07)
            '7.1': '01-movement-core',
            '7.2': '02-combat-core',
            '7.3': '03-enemy-spawner',
            '7.4': '04-leveling-system',
            '7.5': '05-quest-system',
            '7.6': '06-crafting-system',
            '7.7': '07-inventory-logic',
            '7.8': '08-npc-dialog',
            '7.9': '09-boss-mechanics',
            '7.10': '10-skill-trees',
            '7.11': '11-special-abilities',
            '7.12': '12-environmental-hazards',
            '7.13': '13-achievement-system',
            '7.14': '14-replay-system',
            '7.15': '15-sandbox-features',
            
            // Testing (08)
            '8.1': '01-unit-test-setup',
            '8.2': '02-core-engine-tests',
            '8.3': '03-integration-tests',
            '8.4': '04-multiplayer-tests',
            '8.5': '05-ui-tests',
            '8.6': '06-load-stress-tests',
            '8.7': '07-security-tests',
            '8.8': '08-final-test-suite',
            
            // Deployment (09)
            '9.1': '01-build-scripts',
            '9.2': '02-ci-cd-pipeline',
            '9.3': '03-platform-packaging',
            '9.4': '04-distribution-setup',
            '9.5': '05-auto-updater',
            
            // Monitoring (10)
            '10.1': '01-monitoring-dashboard',
            '10.2': '02-crash-reporting',
            '10.3': '03-analytics-integration',
            '10.4': '04-feedback-system',
            '10.5': '05-patch-management',
            '10.6': '06-content-pipeline',
            '10.7': '07-community-tools',
            
            // Genre Specific (11)
            '11.1': '01-genre-core-mechanics',
            '11.2': '02-genre-ui-elements',
            '11.3': '03-genre-asset-integration',
            '11.4': '04-genre-balancing',
            '11.5': '05-genre-testing',
            '11.6': '06-genre-performance',
            '11.7': '07-genre-accessibility',
            '11.8': '08-genre-localization',
            '11.9': '09-genre-multiplayer',
            '11.10': '10-genre-final-polish'
        };
        
        return taskMapping[taskId] || null;
    }

    mapCategoryToDirectory(category) {
        // Map category names from orchestrator to actual directory names
        const categoryMapping = {
            'project-setup': '01-project-setup',
            'core-engine': '02-core-engine',
            'frontend-ui': '03-frontend-ui',
            'assets-pipeline': '04-assets-pipeline',
            'data-persistence': '05-data-persistence',
            'multiplayer': '06-multiplayer-networking',
            'feature-dev': '07-feature-development',
            'testing': '08-testing',
            'deployment': '09-deployment-distribution',
            'monitoring': '10-monitoring-analytics',
            'genre-specific': '11-genre-specific'
        };
        
        return categoryMapping[category] || category.replace(/\s+/g, '-').toLowerCase();
    }

    async checkTaskCompletion(task) {
        // Map task ID to actual directory name
        const taskDirName = this.mapTaskIdToDirectory(task.id);
        
        if (!taskDirName) {
            this.log(`❌ Could not map task ${task.id} to directory name for completion check`, 'ERROR');
            return false;
        }
        
        // Map category to actual directory name
        const categoryDirName = this.mapCategoryToDirectory(task.category);
        
        // Use the full path to the tasks directory (go up from system/ to project root, then to tasks/)
        const projectRoot = path.dirname(path.dirname(this.config.orchestratorFile));
        const tasksDir = path.join(projectRoot, 'tasks');
        
        // Check if task was completed by looking at the index.md file
        const taskDir = path.join(
            tasksDir,
            categoryDirName,
            taskDirName
        );
        
        const indexPath = path.join(taskDir, 'index.md');
        
        if (fs.existsSync(indexPath)) {
            const indexContent = fs.readFileSync(indexPath, 'utf8');
            
            // Look for completion indicators
            const completionIndicators = [
                'Status: ✅ Completed',
                'Status: Completed',
                'Progress: 100%',
                'Overall Progress: 100%',
                '✅ Task completed',
                'Task completed successfully'
            ];
            
            for (const indicator of completionIndicators) {
                if (indexContent.includes(indicator)) {
                    this.log(`✅ Task ${task.id} appears to be completed (found: ${indicator})`);
                    return true;
                }
            }
            
            this.log(`⚠️ Task ${task.id} may not be completed yet`);
            return false;
        }
        
        this.log(`❌ Cannot check completion - index.md not found for task ${task.id}`, 'ERROR');
        return false;
    }

    generateExecutionPrompt(task, taskDetails) {
        return generateExecutionPrompt(task, taskDetails);
    }

    async sendToAIviaCDP(prompt, options = {}) {
        this.log('🤖 Sending prompt to Cursor AI via CDP...');
        
        try {
            return await this.sendToCursor.sendToCursor(prompt, options);
        } catch (error) {
            this.log(`❌ Failed to send prompt: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async updateTaskStatus(task, success) {
        // Update the orchestrator file
        const orchestratorPath = this.config.orchestratorFile;
        let content = fs.readFileSync(orchestratorPath, 'utf8');
        
        const status = success ? '✅ Completed' : '❌ Failed';
        const progress = success ? '100%' : '0%';
        
        // Update task status in the table
        const taskRegex = new RegExp(`\\| ${task.id} \\| ([^|]+) \\| ([^|]+) \\| ([^|]+) \\| ([^|]+) \\| ([^|]+) \\| ([^|]+) \\| ([^|]+) \\|`, 'g');
        content = content.replace(taskRegex, `| ${task.id} | $1 | $2 | $3 | ${status} | ${progress} | $6 | $7 |`);
        
        fs.writeFileSync(orchestratorPath, content);
        this.log(`📝 Updated task ${task.id} status to ${status}`);
    }

    async updateProgress() {
        const totalTasks = this.taskQueue.length;
        const completedCount = this.completedTasks.length;
        const failedCount = this.failedTasks.length;
        const progress = Math.round((completedCount / totalTasks) * 100);
        
        this.log(`📊 Progress: ${completedCount}/${totalTasks} completed (${progress}%)`);
        
        // Update progress tracker
        const progressContent = `# Cursor Automation CDP Progress Tracker

## Automated Progress Update (CDP)
- **Timestamp**: ${new Date().toISOString()}
- **Total Tasks**: ${totalTasks}
- **Completed**: ${completedCount}
- **Failed**: ${failedCount}
- **In Progress**: ${totalTasks - completedCount - failedCount}
- **Overall Progress**: ${progress}%
- **CDP Port**: ${this.config.cdpPort}

## Current Task
- **ID**: ${this.currentTask?.id || 'N/A'}
- **Name**: ${this.currentTask?.name || 'N/A'}
- **Status**: ${this.currentTask ? 'Executing' : 'Completed'}

## Recent Completions
${this.completedTasks.slice(-5).map(task => `- Task ${task.id}: ${task.name}`).join('\n')}

## Failed Tasks
${this.failedTasks.map(task => `- Task ${task.id}: ${task.name}`).join('\n')}

---
*Last updated by CDP automation workflow*`;
        
        fs.writeFileSync(this.config.progressFile, progressContent);
    }

    async generateFinalReport() {
        const report = `# Cursor Automation CDP CDP Automation Workflow Report

## Execution Summary
- **Start Time**: ${new Date().toISOString()}
- **End Time**: ${new Date().toISOString()}
- **Total Tasks**: ${this.taskQueue.length}
- **Completed**: ${this.completedTasks.length}
- **Failed**: ${this.failedTasks.length}
- **Success Rate**: ${Math.round((this.completedTasks.length / this.taskQueue.length) * 100)}%
- **CDP Port**: ${this.config.cdpPort}

## Completed Tasks
${this.completedTasks.map(task => `✅ Task ${task.id}: ${task.name}`).join('\n')}

## Failed Tasks
${this.failedTasks.map(task => `❌ Task ${task.id}: ${task.name}`).join('\n')}

## Recommendations
${this.failedTasks.length > 0 ? 
    `- Review and retry failed tasks manually
- Check dependencies and prerequisites
- Verify CDP connection and target accessibility` : 
    '- All tasks completed successfully! 🎉'}

---
*Generated by Cursor Automation CDP CDP Automation Workflow*`;
        
        const reportFile = `automation-cdp-report-${new Date().toISOString().split('T')[0]}.md`;
        fs.writeFileSync(reportFile, report);
        this.log(`📋 Final report saved to ${reportFile}`);
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

    async initializeBrowser() {
        try {
            const { browser, page } = await initializeBrowser(this.config.cdpPort, this.log);
            this.browser = browser;
            this.page = page;
            
            // Initialize SendToCursor with page, log, and delay function
            this.sendToCursor = new SendToCursor(this.page, this.log, this.delay.bind(this));
        } catch (error) {
            throw error;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Setter for startFromTaskId
    setStartFromTaskId(taskId) {
        this.startFromTaskId = taskId;
    }

    // Setter for task queue
    setTaskQueue(taskQueue) {
        this.taskQueue = taskQueue;
    }

    // NEW: List tasks method
    async listTasks() {
        this.log('📋 Listing tasks');
        
        if (this.taskQueue.length === 0) {
            this.log('❌ No tasks loaded', 'ERROR');
            return;
        }
        
        console.log('\n📋 Available Tasks:');
        console.log('==================\n');
        
        for (const task of this.taskQueue) {
            const status = task.status || '📋 Ready';
            const progress = task.progress || '0%';
            console.log(`${task.id.toString().padStart(2)}. ${task.name.padEnd(40)} ${status} (${progress})`);
        }
    }

    // NEW: Execute specific task method
    async executeSpecificTask(taskId) {
        this.log(`🎯 Executing specific task: ${taskId}`);
        
        const task = this.taskQueue.find(t => t.id === taskId);
        if (!task) {
            this.log(`❌ Task ${taskId} not found`, 'ERROR');
            return;
        }
        
        try {
            const success = await this.executeTaskWithCDP(task);
            
            if (success) {
                this.completedTasks.push(task);
                this.log(`✅ Task ${taskId} completed successfully`);
            } else {
                this.failedTasks.push(task);
                this.log(`❌ Task ${taskId} failed`);
            }
            
            // Update progress
            await this.updateProgress();
            
        } catch (error) {
            this.log(`💥 Error executing task ${taskId}: ${error.message}`, 'ERROR');
            this.failedTasks.push(task);
        }
    }
}

export default ExecutionWorkflow;