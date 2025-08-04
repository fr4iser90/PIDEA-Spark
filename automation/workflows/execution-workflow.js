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
        
        // PHASE 1: Initial Review
        this.log('🔍 PHASE 1: Performing initial project review...');
        const reviewManager = new ReviewManager(this.config, this.log);
        
        try {
            // Generate review prompt
            const reviewResult = await reviewManager.performInitialReview(this.taskQueue, this.completedTasks, this.failedTasks);
            
            if (reviewResult.status === 'error') {
                this.log('❌ Review phase failed, but continuing with task execution', 'WARNING');
            } else {
                // Send review prompt to AI via CDP
                this.log('🤖 Sending review prompt to AI for analysis...');
                const reviewResponse = await this.sendToAIviaCDP(reviewResult.prompt);
                
                // Process review response
                const reviewProcessResult = await reviewManager.processReviewResponse(reviewResponse);
                
                if (reviewProcessResult.status === 'completed') {
                    this.log('✅ Review phase completed successfully');
                    
                    if (!reviewProcessResult.canProceed) {
                        this.log('🚨 Review indicates automation should not proceed', 'ERROR');
                        this.log('Critical issues found that require manual intervention');
                        return;
                    }
                    
                    // AI has already updated the orchestrator files directly
                    this.log('✅ AI has updated orchestrator files - reloading task definitions...');
                    await this.loadTaskDefinitions(); // Reload with updated data
                } else {
                    this.log('⚠️ Review processing failed, continuing with original task queue', 'WARNING');
                }
            }
        } catch (error) {
            this.log(`💥 Error in review phase: ${error.message}`, 'ERROR');
            this.log('Continuing with task execution...', 'WARNING');
        }
        
        // PHASE 2: Task Execution
        this.log('🚀 PHASE 2: Starting task execution...');
        
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
            // 1. Load task details
            const taskDetails = await this.loadTaskDetails(task);
            
            // 2. Generate prompt
            const prompt = this.generateExecutionPrompt(task, taskDetails);
            
            // 3. Send to AI via CDP
            const response = await this.sendToAIviaCDP(prompt);
            
            // 4. Validate response using the new class
            const validation = await this.validateTaskCompletion.validateTaskCompletion(task, response);
            
            // 5. Update task status
            await this.updateTaskStatus(task, validation.success);
            
            return validation.success;
            
        } catch (error) {
            this.log(`💥 Error in CDP task execution: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async loadTaskDetails(task) {
        const taskDir = path.join(
            this.config.tasksDir,
            task.category.replace(/\s+/g, '-').toLowerCase(),
            task.name.replace(/\s+/g, '-').toLowerCase()
        );
        
        const implementationFile = path.join(taskDir, `${task.name.replace(/\s+/g, '-').toLowerCase()}-implementation.md`);
        
        if (fs.existsSync(implementationFile)) {
            return fs.readFileSync(implementationFile, 'utf8');
        }
        
        return `Task: ${task.name}\nCategory: ${task.category}\nTime: ${task.time}\nStatus: ${task.status}`;
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
}

export default ExecutionWorkflow;