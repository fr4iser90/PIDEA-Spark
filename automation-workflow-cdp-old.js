#!/usr/bin/env node

/**
 * Cursor Automation CDP CDP-Based Task Automation Workflow
 * 
 * This script automates task execution by directly controlling Cursor IDE or ChatGPT
 * through Chrome DevTools Protocol (CDP) using Playwright.
 * 
 * Usage: node automation-workflow-cdp.js [--port=9222] [--target=cursor|chatgpt]
 */

import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
            cdpPort: 9222
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
        this.log('🚀 Initializing Cursor Automation CDP CDP Task Automation Workflow');
        
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
            const orchestratorContent = fs.readFileSync(this.config.orchestratorFile, 'utf8');
            
            // Parse task table from orchestrator
            const taskTableRegex = /\| (\d+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|/g;
            let match;
            
            while ((match = taskTableRegex.exec(orchestratorContent)) !== null) {
                const task = {
                    id: parseInt(match[1]),
                    name: match[2].trim(),
                    category: match[3].trim(),
                    time: match[4].trim(),
                    status: match[5].trim(),
                    progress: match[6].trim(),
                    dependencies: match[7].trim(),
                    nextAction: match[8].trim()
                };
                
                this.taskQueue.push(task);
            }
            
            this.log(`📊 Parsed ${this.taskQueue.length} tasks from orchestrator`);
            
        } catch (error) {
            this.log(`❌ Error loading task definitions: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    buildDependencyGraph() {
        // Sort tasks by dependencies
        this.taskQueue.sort((a, b) => {
            const aDeps = this.parseDependencies(a.dependencies);
            const bDeps = this.parseDependencies(b.dependencies);
            
            // If task A depends on task B, B should come first
            if (aDeps.includes(b.id)) return 1;
            if (bDeps.includes(a.id)) return -1;
            
            // Otherwise, sort by ID
            return a.id - b.id;
        });
        
        this.log('🔗 Built dependency graph and sorted tasks');
    }

    parseDependencies(depString) {
        if (!depString || depString === '-') return [];
        
        return depString
            .split(',')
            .map(dep => dep.trim())
            .filter(dep => dep.startsWith('Task '))
            .map(dep => parseInt(dep.replace('Task ', '')));
    }

    async initializeBrowser() {
        try {
            this.log(`🌐 Connecting to browser via CDP port ${this.config.cdpPort}`);
            
            // Connect to existing browser instance
            this.browser = await chromium.connectOverCDP(`http://localhost:${this.config.cdpPort}`);
            this.log('🔗 CDP connection established');
            
            // Verify connection and get context
            const contexts = this.browser.contexts();
            this.log(`📋 Found ${contexts.length} browser contexts`);
            
            if (contexts.length === 0) {
                throw new Error('No browser contexts found');
            }
            
            // Get the first context and page
            const context = contexts[0];
            const pages = await context.pages();
            this.page = pages[0];
            this.log('🎯 Connected to Cursor IDE');
            
        } catch (error) {
            this.log(`❌ Failed to connect to browser: ${error.message}`, 'ERROR');
            this.log('💡 Make sure Chrome is running with --remote-debugging-port=9222', 'INFO');
            this.log('🔧 Try running: google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug', 'INFO');
            throw error;
        }
    }



    async executeWorkflow() {
        this.log('🎬 Starting CDP-based automated task execution workflow');
        
        // SAFETY LIMIT - Only process first 3 tasks for testing
        const maxTasks = 3;
        let processedTasks = 0;
        
        for (const task of this.taskQueue) {
            // Stop after maxTasks for safety
            if (processedTasks >= maxTasks) {
                this.log(`🛑 Safety limit reached (${maxTasks} tasks). Stopping automation.`);
                break;
            }
            
            // Skip if starting from specific task
            if (this.startFromTaskId && task.id < this.startFromTaskId) {
                this.log(`⏭️ Skipping task ${task.id} (starting from ${this.startFromTaskId})`);
                continue;
            }
            
            // Check dependencies
            if (!this.checkDependencies(task)) {
                this.log(`⏳ Task ${task.id} dependencies not met, skipping for now`);
                continue;
            }
            
            this.currentTask = task;
            this.log(`🎯 Executing Task ${task.id}: ${task.name}`);
            
            try {
                const success = await this.executeTaskWithCDP(task);
                
                if (success) {
                    this.completedTasks.push(task);
                    this.log(`✅ Task ${task.id} completed successfully`);
                } else {
                    this.failedTasks.push(task);
                    this.log(`❌ Task ${task.id} failed`);
                }
                
                // Update progress
                await this.updateProgress();
                
                // Wait between tasks - LONGER DELAY FOR SAFETY
                await this.delay(10000); // 10 seconds between tasks
                
                processedTasks++;
                
            } catch (error) {
                this.log(`💥 Error executing task ${task.id}: ${error.message}`, 'ERROR');
                this.failedTasks.push(task);
            }
        }
        
        await this.generateFinalReport();
        await this.cleanup();
    }

    checkDependencies(task) {
        const dependencies = this.parseDependencies(task.dependencies);
        
        for (const depId of dependencies) {
            const depTask = this.completedTasks.find(t => t.id === depId);
            if (!depTask) {
                return false;
            }
        }
        
        return true;
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
        return `# Cursor Automation CDP Task Execution

## Task Information
- **ID**: ${task.id}
- **Name**: ${task.name}
- **Category**: ${task.category}
- **Estimated Time**: ${task.time}
- **Current Status**: ${task.status}
- **Progress**: ${task.progress}

## Task Details
${taskDetails}

## Instructions
Please execute this task completely by:

1. **Analyzing the current codebase** and understanding the existing structure
2. **Implementing all required functionality** according to the task specifications
3. **Creating/modifying all necessary files** with proper code structure
4. **Adding comprehensive tests** for all new functionality
5. **Updating documentation** to reflect the changes
6. **Validating the implementation** against the requirements

## Response Format
Please respond with:

\`\`\`json
{
  "status": "completed|failed|partial",
  "files_created": ["file1.js", "file2.js"],
  "files_modified": ["existing.js"],
  "tests_added": ["test1.test.js"],
  "documentation_updated": ["README.md"],
  "validation_passed": true,
  "next_steps": "What should be done next",
  "estimated_completion_time": "2h",
  "dependencies_resolved": true
}
\`\`\`

## Important Notes
- Implement complete functionality, not stubs
- Follow the existing code patterns and conventions
- Ensure all code is production-ready
- Add proper error handling and validation
- Update all relevant documentation files`;
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
        // Cursor-specific chat selectors
        const chatSelectors = {
            newChatButton: '[data-testid="new-chat-button"], .new-chat-button, button[aria-label*="New"], button[aria-label*="new"]',
            input: '.aislash-editor-input[contenteditable="true"]',
            inputContainer: '.aislash-editor-container',
            userMessages: 'div.aislash-editor-input-readonly[contenteditable="false"][data-lexical-editor="true"]',
            aiMessages: 'span.anysphere-markdown-container-root',
            messagesContainer: 'div[style*="display: flex; flex-direction: column"]',
            chatContainer: '.aislash-container',
            isActive: '.aislash-container',
            isInputReady: '.aislash-editor-input[contenteditable="true"]'
        };

        // 1. Try to click "New Chat" button first
        try {
            await this.page.click(chatSelectors.newChatButton);
            this.log('🆕 Clicked New Chat button');
            await this.delay(1000); // Wait for new chat to load
        } catch (error) {
            this.log('⚠️ Could not find New Chat button, using existing chat', 'WARNING');
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
        try {
            // Check for the specific "Generating" indicator
            const generatingElements = await this.page.$$('span:has-text("Generating")');
            if (generatingElements.length > 0) {
                return true;
            }
            
            // Check for various typing indicators (more specific)
            const typingSelectors = [
                'span:has-text("Generating")',
                'span:has-text("Typing")',
                'span:has-text("Thinking")',
                '.typing-indicator:visible',
                '.loading-indicator:visible', 
                '[data-testid="typing"]:visible',
                '.cursor-typing:visible',
                '.aislash-typing:visible',
                '.typing-dots:visible',
                '.loading-dots:visible',
                '[aria-label*="typing"]:visible',
                '[title*="typing"]:visible',
                '.response-loading:visible',
                '.ai-typing:visible'
            ];
            
            for (const selector of typingSelectors) {
                try {
                    const elements = await this.page.$$(selector);
                    if (elements.length > 0) {
                        // Double-check that the element is actually visible and contains typing text
                        for (const element of elements) {
                            const text = await element.textContent();
                            const isVisible = await element.isVisible();
                            if (isVisible && text && (text.includes('Generating') || text.includes('Typing') || text.includes('Thinking'))) {
                                return true;
                            }
                        }
                    }
                } catch (error) {
                    // Skip invalid selectors
                    continue;
                }
            }
            
            // Check for cursor blinking in response areas (only if visible)
            const cursorSelectors = [
                '.cursor-blink:visible',
                '.typing-cursor:visible',
                '.response-cursor:visible'
            ];
            
            for (const selector of cursorSelectors) {
                try {
                    const elements = await this.page.$$(selector);
                    if (elements.length > 0) {
                        return true;
                    }
                } catch (error) {
                    continue;
                }
            }
            
            // Check for streaming text indicators (only if visible)
            const streamingSelectors = [
                '[data-streaming="true"]:visible',
                '.streaming:visible',
                '.partial-response:visible',
                '.incomplete-response:visible'
            ];
            
            for (const selector of streamingSelectors) {
                try {
                    const elements = await this.page.$$(selector);
                    if (elements.length > 0) {
                        return true;
                    }
                } catch (error) {
                    continue;
                }
            }
            
            return false;
            
        } catch (error) {
            this.log(`⚠️ Error detecting AI typing: ${error.message}`, 'WARNING');
            return false;
        }
    }

    async extractAIResponse(chatSelectors) {
        try {
            // Try multiple strategies to find the AI response
            const responseStrategies = [
                // Strategy 1: Direct AI message selectors
                async () => {
                    const messages = await this.page.$$(chatSelectors.aiMessages);
                    if (messages.length > 0) {
                        const lastMessage = messages[messages.length - 1];
                        return await lastMessage.textContent();
                    }
                    return null;
                },
                
                // Strategy 2: Look for markdown containers
                async () => {
                    const markdownSelectors = [
                        'span.anysphere-markdown-container-root',
                        '.markdown-content',
                        '.response-markdown',
                        '[data-markdown="true"]'
                    ];
                    
                    for (const selector of markdownSelectors) {
                        const elements = await this.page.$$(selector);
                        if (elements.length > 0) {
                            const lastElement = elements[elements.length - 1];
                            return await lastElement.textContent();
                        }
                    }
                    return null;
                },
                
                // Strategy 3: Look for any response-like content
                async () => {
                    const responseSelectors = [
                        '.ai-response',
                        '.assistant-message',
                        '.response-message',
                        '.message.assistant',
                        '.chat-response'
                    ];
                    
                    for (const selector of responseSelectors) {
                        const elements = await this.page.$$(selector);
                        if (elements.length > 0) {
                            const lastElement = elements[elements.length - 1];
                            return await lastElement.textContent();
                        }
                    }
                    return null;
                },
                
                // Strategy 4: Look for content in the last message container
                async () => {
                    const messageContainers = await this.page.$$(chatSelectors.messagesContainer);
                    if (messageContainers.length > 0) {
                        const lastContainer = messageContainers[messageContainers.length - 1];
                        return await lastContainer.textContent();
                    }
                    return null;
                },
                
                // Strategy 5: Look for any substantial text content that's not user input
                async () => {
                    const allTextElements = await this.page.$$('p, div, span');
                    let bestCandidate = null;
                    let maxLength = 0;
                    
                    for (const element of allTextElements) {
                        const text = await element.textContent();
                        if (text && text.length > 200 && text.length > maxLength) {
                            // Check if it looks like an AI response (not user input)
                            const lowerText = text.toLowerCase();
                            if (!lowerText.includes('user:') && !lowerText.includes('me:') && 
                                !lowerText.includes('input:') && !lowerText.includes('prompt:')) {
                                bestCandidate = text;
                                maxLength = text.length;
                            }
                        }
                    }
                    
                    return bestCandidate;
                }
            ];
            
            // Try each strategy until we find a response
            for (const strategy of responseStrategies) {
                try {
                    const response = await strategy();
                    if (response && response.trim().length > 0) {
                        return response.trim();
                    }
                } catch (error) {
                    continue;
                }
            }
            
            return null;
            
        } catch (error) {
            this.log(`⚠️ Error extracting AI response: ${error.message}`, 'WARNING');
            return null;
        }
    }

    async detectResponseComplete(chatSelectors, currentText, lastLength) {
        try {
            // Check for "X files edited" completion indicator
            const fileEditSelectors = [
                'span:has-text("file edited")',
                'span:has-text("files edited")',
                'div:has-text("file edited")',
                'div:has-text("files edited")'
            ];
            
            for (const selector of fileEditSelectors) {
                const elements = await this.page.$$(selector);
                if (elements.length > 0) {
                    for (const element of elements) {
                        const isVisible = await element.isVisible();
                        if (isVisible) {
                            const text = await element.textContent();
                            if (text && (text.includes('file edited') || text.includes('files edited'))) {
                                this.log(`🔍 Detected file edit completion: "${text}"`);
                                return true;
                            }
                        }
                    }
                }
            }
            
            // Check for "Running terminal command" - means AI is still working
            const runningSelectors = [
                'span:has-text("Running terminal command")',
                'div:has-text("Running terminal command")',
                'span:has-text("Generating")',
                'div:has-text("Generating")'
            ];
            
            for (const selector of runningSelectors) {
                const elements = await this.page.$$(selector);
                if (elements.length > 0) {
                    for (const element of elements) {
                        const isVisible = await element.isVisible();
                        if (isVisible) {
                            const text = await element.textContent();
                            if (text && (text.includes('Running terminal command') || text.includes('Generating'))) {
                                this.log(`🔍 AI still working: "${text}"`);
                                return false; // Not complete yet
                            }
                        }
                    }
                }
            }
            
            // Check for completion indicators
            const completionSelectors = [
                '.response-complete',
                '[data-complete="true"]',
                '.finished-response',
                '.response-done'
            ];
            
            for (const selector of completionSelectors) {
                const elements = await this.page.$$(selector);
                if (elements.length > 0) {
                    return true;
                }
            }
            
            // Check if text has stopped growing and is substantial
            if (currentText && currentText.length > 100 && currentText.length === lastLength) {
                // Additional check: look for common response endings
                const responseEndings = [
                    '```',
                    '**Summary:**',
                    '**Next Steps:**',
                    '**Status:**',
                    'completed',
                    'finished',
                    'done'
                ];
                
                const lowerText = currentText.toLowerCase();
                for (const ending of responseEndings) {
                    if (lowerText.includes(ending.toLowerCase())) {
                        return true;
                    }
                }
            }
            
            return false;
            
        } catch (error) {
            this.log(`⚠️ Error detecting response completion: ${error.message}`, 'WARNING');
            return false;
        }
    }

    async waitForAIResponse(chatSelectors) {
        this.log('⏳ Waiting for AI response to start...');
        
        // Wait for response to start appearing
        await this.delay(3000);
        
        // Wait for response to complete
        let responseText = '';
        let lastLength = 0;
        let stableCount = 0;
        
        while (true) {
            try {
                // Check for typing indicators first
                const isTyping = await this.detectAITyping(chatSelectors);
                
                if (isTyping) {
                    this.log('⌨️ AI is actively typing...');
                    stableCount = 0;
                    await this.delay(2000);
                    continue;
                }
                
                // Get the latest response text using enhanced extraction
                const currentText = await this.extractAIResponse(chatSelectors);
                
                if (currentText && currentText.length > lastLength) {
                    responseText = currentText;
                    lastLength = currentText.length;
                    stableCount = 0;
                    this.log(`📝 Response growing: ${currentText.length} characters`);
                } else if (currentText && currentText.length === lastLength && currentText.length > 0) {
                    stableCount++;
                    this.log(`⏸️ Response stable for ${stableCount} seconds`);
                } else if (!currentText) {
                    // No response found yet, wait a bit longer
                    stableCount++;
                }
                
                // Check if response appears to be complete
                const isComplete = await this.detectResponseComplete(chatSelectors, currentText, lastLength);
                
                // Only break if completion is detected
                if (isComplete) {
                    this.log('✅ Response appears to be complete');
                    break;
                }
                
                // If no response after 2 minutes, check if there's an error
                if (responseText.length === 0) {
                    // Check for error messages or failed responses
                    const errorSelectors = [
                        '.error-message',
                        '.failed-response',
                        '[data-error="true"]',
                        '.response-error'
                    ];
                    
                    for (const errorSelector of errorSelectors) {
                        const errors = await this.page.$$(errorSelector);
                        if (errors.length > 0) {
                            this.log('❌ Error detected in AI response', 'ERROR');
                            return '';
                        }
                    }
                }
                
                await this.delay(1000);
                
            } catch (error) {
                this.log(`⚠️ Error while waiting for response: ${error.message}`, 'WARNING');
                await this.delay(2000);
            }
        }
        
        if (responseText.length === 0) {
            this.log('⚠️ No response received', 'WARNING');
        } else {
            this.log(`📥 Received response (${responseText.length} characters)`);
        }
        
        return responseText;
    }

    async validateTaskCompletion(task, aiResponse) {
        try {
            // Try to parse JSON response
            const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
            if (!jsonMatch) {
                this.log('⚠️ No JSON response found in AI response', 'WARNING');
                return { success: false, reason: 'No JSON response found' };
            }
            
            const result = JSON.parse(jsonMatch[1]);
            
            // Basic validation
            if (result.status === 'completed' && result.validation_passed) {
                this.log('✅ Task validation passed', 'SUCCESS');
                return { success: true, result };
            } else {
                this.log(`❌ Task validation failed: ${result.next_steps || 'Task not fully completed'}`, 'ERROR');
                return { success: false, reason: result.next_steps || 'Task not fully completed' };
            }
            
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

    async cleanup() {
        if (this.browser) {
            // Don't close the browser, just disconnect
            await this.browser.disconnect();
            this.log('🔌 Disconnected from browser');
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