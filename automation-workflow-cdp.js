#!/usr/bin/env node

/**
 * VibeFighters CDP-Based Task Automation Workflow
 * 
 * This script automates task execution by directly controlling Cursor IDE or ChatGPT
 * through Chrome DevTools Protocol (CDP) using Playwright.
 * 
 * Usage: node automation-workflow-cdp.js [--port=9223] [--target=cursor|chatgpt]
 */

import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { cursorSelectors, typingSelectors, cursorBlinkSelectors, streamingSelectors, fileEditSelectors, runningSelectors, completionSelectors, errorSelectors, markdownSelectors, responseSelectors } from './automation/selectors.js';
import { generateExecutionPrompt, generateReviewPrompt } from './automation/prompts.js';
import { loadTaskDefinitions, buildDependencyGraph, parseDependencies, checkDependencies } from './automation/task-manager.js';
import { ReviewManager } from './automation/review-manager.js';
import { initializeBrowser, cleanup } from './automation/browser-manager.js';
import { detectAITyping, extractAIResponse, detectResponseComplete, waitForAIResponse } from './automation/response-processor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class CDPTaskAutomationWorkflow {
    constructor() {
        this.config = {
            projectRoot: process.cwd(),
            tasksDir: 'docs/09_roadmap/tasks',
            orchestratorFile: 'docs/09_roadmap/tasks/system/orchestrator.md',
            progressFile: 'docs/09_roadmap/tasks/system/progress-tracker.md',
            logFile: 'automation-workflow-cdp.log',
            cdpPort: 9223
        };
        
        this.currentTask = null;
        this.taskQueue = [];
        this.completedTasks = [];
        this.failedTasks = [];
        this.browser = null;
        
        this.setupLogging();
    }

    setupLogging() {
        this.log = (message, level = 'INFO') => {
            const timestamp = new Date().toISOString();
            const logEntry = `[${timestamp}] [${level}] ${message}`;
            console.log(logEntry);
            fs.appendFileSync(this.config.logFile, logEntry + '\n');
        };
    }

    async initialize() {
        this.log('🚀 Initializing VibeFighters CDP Task Automation Workflow');
        
        // Parse command line arguments
        this.parseArguments();
        
        // Load task definitions
        await this.loadTaskDefinitions();
        
        // Build dependency graph
        this.buildDependencyGraph();
        
        // Initialize browser connection
        await this.initializeBrowser();
        
        this.log(`📋 Loaded ${this.taskQueue.length} tasks for execution`);
    }

    parseArguments() {
        const args = process.argv.slice(2);
        
        for (const arg of args) {
            if (arg.startsWith('--port=')) {
                this.config.cdpPort = parseInt(arg.split('=')[1]);
                this.log(`🔌 Using CDP port: ${this.config.cdpPort}`);
            }
            
            if (arg.startsWith('--task-id=')) {
                const taskId = parseInt(arg.split('=')[1]);
                this.startFromTaskId = taskId;
                this.log(`🎯 Starting from task ID: ${taskId}`);
            }
        }
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



    async executeWorkflow() {
        this.log('🎬 Starting CDP-based automated task execution workflow');
        
        // PHASE 1: Initial Review (NEW!)
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
        
        // PHASE 2: Task Execution (existing logic)
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
        await this.cleanup();
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
            
            // 4. Validate response
            const validation = await this.validateTaskCompletion(task, response);
            
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

    async sendToAIviaCDP(prompt) {
        this.log('🤖 Sending prompt to Cursor AI via CDP...');
        
        try {
            return await this.sendToCursor(prompt);
        } catch (error) {
            this.log(`❌ Failed to send prompt: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async sendToCursor(prompt) {
        // Use imported selectors
        const chatSelectors = cursorSelectors;

        // 1. Try multiple strategies to start a new chat
        let newChatCreated = false;
        
        // Strategy 1: Try to click "New Chat" button
        try {
            await this.page.click(chatSelectors.newChatButton);
            this.log('🆕 Clicked New Chat button');
            newChatCreated = true;
            await this.delay(1000); // Wait for new chat to load
        } catch (error) {
            this.log('⚠️ Could not click New Chat button, trying keyboard shortcut', 'WARNING');
        }
        
        // Strategy 2: Try keyboard shortcut Ctrl+N
        if (!newChatCreated) {
            try {
                await this.page.keyboard.press('Control+n');
                this.log('⌨️ Used Ctrl+N shortcut for new chat');
                newChatCreated = true;
                await this.delay(1000); // Wait for new chat to load
            } catch (error) {
                this.log('⚠️ Could not use Ctrl+N shortcut, using existing chat', 'WARNING');
            }
        }
        
        // Strategy 3: Try to find and click the specific button from your example
        if (!newChatCreated) {
            try {
                await this.page.click('.action-label.codicon.codicon-add-two[aria-label*="New Chat"]');
                this.log('🆕 Clicked specific New Chat button');
                newChatCreated = true;
                await this.delay(1000);
            } catch (error) {
                this.log('⚠️ Could not find specific New Chat button, using existing chat', 'WARNING');
            }
        }

        // 2. Wait for chat input to be available
        await this.page.waitForSelector(chatSelectors.input);
        
        // 3. Find the input field
        const inputSelector = await this.page.$(chatSelectors.input);
        
        if (!inputSelector) {
            throw new Error('Could not find Cursor chat input');
        }
        
        // 4. Click input and paste the entire prompt at once
        await inputSelector.click();
        await inputSelector.fill(prompt); // Paste entire prompt at once!
        
        // 5. Send the message
        await inputSelector.press('Enter');
        
        this.log('📤 Prompt sent to Cursor, waiting for response...');
        
        // 6. Wait for response
        const response = await this.waitForAIResponse(chatSelectors);
        
        return response;
    }

    async detectAITyping(chatSelectors) {
        return detectAITyping(this.page, typingSelectors, cursorBlinkSelectors, streamingSelectors, this.log);
    }

    async extractAIResponse(chatSelectors) {
        return extractAIResponse(this.page, chatSelectors, this.log);
    }

    async detectResponseComplete(chatSelectors, currentText, lastLength) {
        return detectResponseComplete(this.page, currentText, lastLength, this.log);
    }

    async waitForAIResponse(chatSelectors) {
        return waitForAIResponse(
            this.page, 
            chatSelectors, 
            typingSelectors, 
            cursorBlinkSelectors, 
            streamingSelectors, 
            errorSelectors, 
            this.log, 
            this.delay
        );
    }

    async validateTaskCompletion(task, aiResponse) {
        try {
            // Check if AI gave a meaningful response
            if (!aiResponse || aiResponse.length < 100) {
                this.log('⚠️ AI response too short or empty', 'WARNING');
                return { success: false, reason: 'AI response too short' };
            }
            
            // Check for common success indicators in AI response
            const successIndicators = [
                'completed', 'success', 'done', 'finished', 'implemented', 
                'created', 'added', 'updated', 'working', 'functional'
            ];
            
            const hasSuccessIndicator = successIndicators.some(indicator => 
                aiResponse.toLowerCase().includes(indicator)
            );
            
            // Check for error indicators
            const errorIndicators = [
                'error', 'failed', 'cannot', 'unable', 'missing', 'not found',
                'invalid', 'broken', 'doesn\'t work', 'failed to'
            ];
            
            const hasErrorIndicator = errorIndicators.some(indicator => 
                aiResponse.toLowerCase().includes(indicator)
            );
            
            if (hasErrorIndicator) {
                this.log('❌ AI response contains error indicators', 'ERROR');
                return { success: false, reason: 'AI reported errors in response' };
            }
            
            if (hasSuccessIndicator) {
                this.log('✅ AI response indicates success', 'SUCCESS');
                return { success: true, result: { status: 'completed' } };
            }
            
            // If no clear indicators, assume success if response is substantial
            if (aiResponse.length > 500) {
                this.log('✅ AI provided substantial response, assuming success', 'SUCCESS');
                return { success: true, result: { status: 'completed' } };
            }
            
            this.log('⚠️ AI response unclear, marking as failed', 'WARNING');
            return { success: false, reason: 'Unclear AI response' };
            
        } catch (error) {
            this.log(`❌ Validation error: ${error.message}`, 'ERROR');
            return { success: false, reason: `Validation error: ${error.message}` };
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
        const progressContent = `# VibeFighters Progress Tracker

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
        const report = `# VibeFighters CDP Automation Workflow Report

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
*Generated by VibeFighters CDP Automation Workflow*`;
        
        const reportFile = `automation-cdp-report-${new Date().toISOString().split('T')[0]}.md`;
        fs.writeFileSync(reportFile, report);
        this.log(`📋 Final report saved to ${reportFile}`);
    }

    async cleanup() {
        await cleanup(this.browser, this.log);
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