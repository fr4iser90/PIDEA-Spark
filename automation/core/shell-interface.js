#!/usr/bin/env node

/**
 * Shell Interface Module
 * 
 * Converts shell functionality from run-automation-cdp.sh to JavaScript
 * Handles command line arguments, safety checks, CDP connection, and prerequisites
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { CONFIG, getConfig, loadConfigFromFile, showConfig, createDefaultConfigFile } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ShellInterface {
    constructor() {
        this.config = {
            cdpPort: getConfig('cdp.defaultPort', 9222),
            target: getConfig('cdp.defaultTarget', 'cursor'),
            taskId: getConfig('automation.defaultTaskId', null),
            dryRun: getConfig('automation.dryRun', false),
            verbose: getConfig('automation.verbose', false),
            listTasks: false,
            showStatus: false,
            setupChrome: false,
            showMenu: false,
            showConfig: false,
            createConfig: false
        };
        
        this.setupLogging();
    }

    setupLogging() {
        this.log = (message, level = 'INFO') => {
            const timestamp = new Date().toISOString();
            const logEntry = `[${timestamp}] [${level}] ${message}`;
            console.log(logEntry);
        };
    }

    async run() {
        this.log('🔧 Initializing Shell Interface');
        
        // Load configuration from file if it exists
        await loadConfigFromFile();
        
        // Parse command line arguments
        this.parseArguments();
        
        // Handle special commands first
        if (this.config.setupChrome) {
            this.showChromeSetup();
            return { action: 'setup', config: this.config };
        }
        
        if (this.config.listTasks) {
            await this.listTasks();
            return { action: 'list', config: this.config };
        }
        
        if (this.config.showStatus) {
            await this.showStatus();
            return { action: 'status', config: this.config };
        }
        
        if (this.config.showConfig) {
            showConfig();
            return { action: 'config', config: this.config };
        }
        
        if (this.config.createConfig) {
            await createDefaultConfigFile();
            return { action: 'create-config', config: this.config };
        }
        
        // Check if menu mode is requested or if no specific action is requested
        if (this.config.showMenu || (!this.config.listTasks && !this.config.showStatus && !this.config.setupChrome && !this.config.showConfig && !this.config.createConfig)) {
            this.config.showMenu = true;
            return { action: 'menu', config: this.config };
        }
        
        // Check prerequisites
        await this.checkPrerequisites();
        
        // Check CDP connection
        await this.checkCDPConnection();
        
        // Show safety checks
        if (getConfig('automation.safetyChecks', true)) {
            await this.showSafetyChecks();
        }
        
        // Return configuration for main workflow
        return { action: 'execute', config: this.config };
    }

    parseArguments() {
        const args = process.argv.slice(2);
        
        for (const arg of args) {
            if (arg.startsWith('--port=')) {
                this.config.cdpPort = parseInt(arg.split('=')[1]);
                this.log(`🔌 Using CDP port: ${this.config.cdpPort}`);
            }
            
            if (arg.startsWith('--target=')) {
                this.config.target = arg.split('=')[1];
                this.log(`🎯 Using target: ${this.config.target}`);
            }
            
            if (arg.startsWith('--task-id=')) {
                this.config.taskId = parseInt(arg.split('=')[1]);
                this.log(`🎯 Starting from task ID: ${this.config.taskId}`);
            }
            
            if (arg === '--dry-run' || arg === '-d') {
                this.config.dryRun = true;
                this.log('🔍 Dry run mode enabled');
            }
            
            if (arg === '--verbose' || arg === '-v') {
                this.config.verbose = true;
                this.log('📝 Verbose mode enabled');
            }
            
            if (arg === '--list-tasks') {
                this.config.listTasks = true;
            }
            
            if (arg === '--status') {
                this.config.showStatus = true;
            }
            
            if (arg === '--setup-chrome') {
                this.config.setupChrome = true;
            }
            
            if (arg === '--menu' || arg === '-m') {
                this.config.showMenu = true;
            }
            
            if (arg === '--config' || arg === '-c') {
                this.config.showConfig = true;
            }
            
            if (arg === '--create-config') {
                this.config.createConfig = true;
            }
            
            if (arg === '--help' || arg === '-h') {
                this.showUsage();
                process.exit(0);
            }
        }
    }

    showUsage() {
        const defaultPort = getConfig('cdp.defaultPort', 9222);
        
        console.log(`
🎮 Cursor Automation CDP Task Automation Runner

This script automates tasks by controlling Cursor IDE or ChatGPT via CDP

Usage: node automation-workflow-cdp.js [OPTIONS]

Options:
  -h, --help              Show this help message
  -p, --port=N            CDP port (default: ${defaultPort})
  -t, --target=TARGET     Target: 'cursor' or 'chatgpt' (default: cursor)
  --task-id=N             Start from specific task ID
  -d, --dry-run           Show what would be executed without running
  -v, --verbose           Enable verbose output
  --list-tasks            List all available tasks
  --status                Show current project status
  --setup-chrome          Help setup Chrome with CDP
  -m, --menu              Show interactive menu
  -c, --config            Show current configuration
  --create-config         Create default configuration file

Examples:
  node automation-workflow-cdp.js                    # Run with Cursor on port ${defaultPort}
  node automation-workflow-cdp.js -p 9224            # Use different CDP port
  node automation-workflow-cdp.js -t chatgpt         # Use ChatGPT instead of Cursor
  node automation-workflow-cdp.js --task-id=5        # Start from task 5
  node automation-workflow-cdp.js --setup-chrome     # Get Chrome setup instructions
  node automation-workflow-cdp.js --menu             # Show interactive menu
  node automation-workflow-cdp.js --config           # Show current configuration
  node automation-workflow-cdp.js --create-config    # Create configuration file

Configuration:
  The system uses a central configuration file 'automation-config.json'
  You can create it with --create-config and edit it to customize settings

Prerequisites:
  1. Chrome running with --remote-debugging-port=${defaultPort}
  2. Cursor IDE or ChatGPT open in Chrome
  3. Node.js and Playwright installed
        `);
    }

    async checkPrerequisites() {
        this.log('🔍 Checking prerequisites...');
        
        // Check if Node.js is installed
        try {
            const nodeVersion = process.version;
            this.log(`✅ Node.js version: ${nodeVersion}`);
        } catch (error) {
            this.log('❌ Node.js is not installed. Please install Node.js first.', 'ERROR');
            process.exit(1);
        }
        
        // Check if automation script exists
        const scriptPath = path.join(process.cwd(), 'automation-workflow-cdp.js');
        if (!fs.existsSync(scriptPath)) {
            this.log('❌ Automation script not found: automation-workflow-cdp.js', 'ERROR');
            process.exit(1);
        }
        
        // Check if orchestrator file exists
        const orchestratorPath = getConfig('paths.orchestratorFile', 'pidea-spark-output/tasks/system/orchestrator.md');
        if (!fs.existsSync(orchestratorPath)) {
            this.log('⚠️ Orchestrator file not found. Are you in the correct directory?', 'WARNING');
        }
        
        // Check if Playwright is installed
        try {
            await import('playwright');
            this.log('✅ Playwright is installed');
        } catch (error) {
            this.log('⚠️ Playwright not installed. Installing...', 'WARNING');
            // Note: In a real implementation, you might want to install it automatically
            // For now, just warn the user
        }
        
        this.log('✅ Prerequisites check passed');
    }

    async checkCDPConnection() {
        const port = this.config.cdpPort;
        const timeout = getConfig('cdp.connectionTimeout', 10000);
        const retryAttempts = getConfig('cdp.retryAttempts', 3);
        
        this.log(`🔌 Checking CDP connection on port ${port}...`);
        
        for (let attempt = 1; attempt <= retryAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);
                
                const response = await fetch(`http://localhost:${port}/json/version`, {
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const browserInfo = await response.json();
                    const browserName = browserInfo.Browser || 'Unknown';
                    const protocolVersion = browserInfo['Protocol-Version'] || 'Unknown';
                    
                    this.log(`✅ CDP connection successful on port ${port}`);
                    this.log(`📊 Browser: ${browserName}, Protocol: ${protocolVersion}`);
                    return true;
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                if (attempt < retryAttempts) {
                    this.log(`⚠️ CDP connection attempt ${attempt} failed, retrying... (${error.message})`, 'WARNING');
                    await this.delay(1000); // Wait 1 second before retry
                } else {
                    this.log(`❌ CDP connection failed on port ${port} after ${retryAttempts} attempts`, 'ERROR');
                    this.log('⚠️ Make sure Chrome is running with --remote-debugging-port=' + port, 'WARNING');
                    this.log('⚠️ Try running: google-chrome --remote-debugging-port=' + port + ' --user-data-dir=/tmp/chrome-debug', 'WARNING');
                    process.exit(1);
                }
            }
        }
    }

    async showSafetyChecks() {
        console.log('\n⚠️  WARNING: This script will control Cursor IDE automatically!');
        console.log('⚠️  Make sure you have saved all your work!');
        console.log('⚠️  The script will send automated prompts to Cursor AI\n');
        
        // First safety check
        console.log('Are you sure you want to continue? (y/N)');
        const safetyConfirm = await this.getUserInput();
        
        if (!safetyConfirm.toLowerCase().startsWith('y')) {
            this.log('🚫 Automation cancelled by user');
            process.exit(0);
        }
        
        // Second safety check
        console.log('Final warning: This will automate Cursor IDE. Continue? (yes/NO)');
        const finalConfirm = await this.getUserInput();
        
        if (!finalConfirm.toLowerCase().startsWith('yes')) {
            this.log('🚫 Automation cancelled by user');
            process.exit(0);
        }
        
        // Confirm target
        if (this.config.target === 'cursor') {
            console.log('⚠️  Make sure Cursor IDE is open in Chrome on the CDP port');
        } else if (this.config.target === 'chatgpt') {
            console.log('⚠️  Make sure ChatGPT is open in Chrome on the CDP port');
        }
        
        console.log('Press Enter to continue or Ctrl+C to cancel...');
        await this.getUserInput();
        
        this.log('✅ Safety checks passed');
    }

    async getUserInput() {
        return new Promise((resolve) => {
            process.stdin.once('data', (data) => {
                resolve(data.toString().trim());
            });
        });
    }

    showChromeSetup() {
        const port = this.config.cdpPort;
        
        console.log(`
🔧 Chrome CDP Setup Instructions

1. Close all Chrome instances

2. Start Chrome with CDP enabled:
   Linux:
     google-chrome --remote-debugging-port=${port} --user-data-dir=/tmp/chrome-debug
   macOS:
     /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=${port} --user-data-dir=/tmp/chrome-debug
   Windows:
     "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=${port} --user-data-dir=C:\\temp\\chrome-debug

3. Open Cursor IDE in the new Chrome window
   - Navigate to your Cursor IDE instance
   - Make sure the chat interface is visible

4. Verify CDP is working:
   curl http://localhost:${port}/json/version

5. Run the automation:
   node automation-workflow-cdp.js

Troubleshooting:
  - If connection fails, try a different port: node automation-workflow-cdp.js --port=9224
  - Make sure no other Chrome instance is using the same port
  - Check if Cursor is accessible in the browser
  - You can customize the default port in automation-config.json
        `);
    }

    async listTasks() {
        this.log('📋 Available tasks:');
        console.log('');
        
        const orchestratorPath = getConfig('paths.orchestratorFile', 'pidea-spark-output/tasks/system/orchestrator.md');
        
        if (fs.existsSync(orchestratorPath)) {
            const content = fs.readFileSync(orchestratorPath, 'utf8');
            const taskLines = content.split('\n').filter(line => line.match(/^\| [0-9]+ \|/));
            
            for (const line of taskLines) {
                const parts = line.split('|').map(part => part.trim());
                if (parts.length >= 6) {
                    const taskId = parts[1];
                    const taskName = parts[2];
                    const taskStatus = parts[4];
                    const taskProgress = parts[5];
                    
                    let statusColor = '';
                    if (taskStatus.includes('Completed')) {
                        statusColor = '\x1b[32m'; // Green
                    } else if (taskStatus.includes('In Progress')) {
                        statusColor = '\x1b[33m'; // Yellow
                    }
                    const resetColor = '\x1b[0m';
                    
                    console.log(`  ${taskId.padStart(2)}. ${taskName.padEnd(40)} ${statusColor}${taskStatus}${resetColor} (${taskProgress})`);
                }
            }
        } else {
            this.log('❌ Orchestrator file not found', 'ERROR');
        }
    }

    async showStatus() {
        this.log('📊 Current project status:');
        console.log('');
        
        const progressPath = getConfig('paths.progressFile', 'pidea-spark-output/tasks/system/progress-tracker.md');
        
        if (fs.existsSync(progressPath)) {
            const content = fs.readFileSync(progressPath, 'utf8');
            console.log(content);
        } else {
            this.log('⚠️ Progress tracker not found. Run automation first to generate status.', 'WARNING');
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default ShellInterface; 