#!/usr/bin/env node

/**
 * Menu System Module
 * 
 * Provides interactive menu for choosing different workflows
 * Handles user input and workflow selection
 */

export class MenuSystem {
    constructor() {
        this.setupLogging();
    }

    setupLogging() {
        this.log = (message, level = 'INFO') => {
            const timestamp = new Date().toISOString();
            const logEntry = `[${timestamp}] [${level}] ${message}`;
            console.log(logEntry);
        };
    }

    async showMainMenu() {
        this.log('🎮 Showing main menu');
        
        console.log('\n🎮 Game Automation Workflow Menu');
        console.log('================================\n');
        
        console.log('1. 🎯 Execute Workflow');
        console.log('   - Execute existing game project tasks');
        console.log('   - Run automation on current project\n');
        
        console.log('2. 📋 Planning Workflow');
        console.log('   - Create new game project');
        console.log('   - Plan tasks and generate orchestrator\n');
        
        console.log('3. 🐛 Debugging Workflow');
        console.log('   - Debug current game project');
        console.log('   - Find and fix issues\n');
        
        console.log('4. 🧪 Testing Workflow');
        console.log('   - Test current game project');
        console.log('   - Run tests and generate reports\n');
        
        console.log('5. 📊 Status & Reports');
        console.log('   - Show project status');
        console.log('   - Generate progress reports\n');
        
        console.log('6. ⚙️ Settings');
        console.log('   - Configure automation settings');
        console.log('   - Manage templates\n');
        
        console.log('0. 🚪 Exit');
        console.log('   - Exit automation system\n');
        
        const choice = await this.getUserChoice();
        return await this.handleMenuChoice(choice);
    }

    async getUserChoice(prompt = 'Enter your choice (0-6): ', min = 0, max = 6) {
        console.log(prompt);
        
        return new Promise((resolve) => {
            process.stdin.once('data', (data) => {
                const input = data.toString().trim();
                const choice = parseInt(input);
                
                if (isNaN(choice) || choice < min || choice > max) {
                    console.log(`❌ Invalid choice. Please enter a number between ${min} and ${max}.`);
                    resolve(this.getUserChoice(prompt, min, max));
                } else {
                    resolve(choice);
                }
            });
        });
    }

    async handleMenuChoice(choice) {
        switch (choice) {
            case 0:
                this.log('👋 Exiting automation system');
                process.exit(0);
                break;
                
            case 1:
                return await this.executeWorkflowMenu();
                
            case 2:
                return await this.showPlanningMenu();
                
            case 3:
                return await this.debuggingWorkflowMenu();
                
            case 4:
                return await this.testingWorkflowMenu();
                
            case 5:
                return await this.statusMenu();
                
            case 6:
                return await this.settingsMenu();
                
            default:
                this.log('❌ Invalid choice', 'ERROR');
                return await this.showMainMenu();
        }
    }

    async executeWorkflowMenu() {
        console.log('\n🎯 Execute Workflow Menu');
        console.log('=======================\n');
        
        console.log('1. 🚀 Execute All Tasks');
        console.log('   - Execute all pending tasks\n');
        
        console.log('2. 🎯 Execute Specific Task');
        console.log('   - Execute a specific task by ID\n');
        
        console.log('3. 📋 List Available Tasks');
        console.log('   - Show all tasks and their status\n');
        
        console.log('4. 🔄 Execute from Task ID');
        console.log('   - Start execution from specific task\n');
        
        console.log('0. ⬅️ Back to Main Menu\n');
        
        const choice = await this.getUserChoice();
        
        switch (choice) {
            case 0:
                return await this.showMainMenu();
            case 1:
                return { workflow: 'execute', action: 'all', gameName: null };
            case 2:
                return await this.getSpecificTask();
            case 3:
                return { workflow: 'execute', action: 'list', gameName: null };
            case 4:
                return await this.getStartTaskId();
            default:
                return await this.executeWorkflowMenu();
        }
    }

    async showPlanningMenu() {
        console.log('\n📋 Planning Workflow Menu');
        console.log('========================');
        console.log('1. Create New Game Project');
        console.log('2. Edit Existing Project');
        console.log('3. Regenerate Project Plan');
        console.log('4. Show Project Templates');
        console.log('5. Back to Main Menu');
        
        const choice = await this.getUserChoice('Enter your choice (1-5): ', 1, 5);
        
        switch (choice) {
            case 1:
                return await this.handleCreateNewProject();
            case 2:
                return await this.handleEditProject();
            case 3:
                return await this.handleRegeneratePlan();
            case 4:
                return await this.handleShowTemplates();
            case 5:
                return { workflow: 'main', action: 'back' };
            default:
                return { workflow: 'main', action: 'back' };
        }
    }

    async handleCreateNewProject() {
        console.log('\n🆕 Create New Game Project');
        console.log('=========================');
        
        // Get game idea
        const gameIdea = await this.getUserInput('Enter your game idea (describe the game concept): ');
        if (!gameIdea || gameIdea.trim() === '') {
            console.log('❌ Game idea is required');
            return { workflow: 'planning', action: 'back' };
        }
        
        // Get project name (optional)
        const projectName = await this.getUserInput('Enter project name (optional, press Enter for auto-generated): ');
        
        return {
            workflow: 'planning',
            action: 'create',
            gameIdea: gameIdea.trim(),
            projectName: projectName.trim() || null
        };
    }

    async handleEditProject() {
        console.log('\n📝 Edit Existing Project');
        console.log('======================');
        
        const gameName = await this.getUserInput('Enter game name to edit: ');
        if (!gameName || gameName.trim() === '') {
            console.log('❌ Game name is required');
            return { workflow: 'planning', action: 'back' };
        }
        
        return {
            workflow: 'planning',
            action: 'edit',
            gameName: gameName.trim()
        };
    }

    async handleRegeneratePlan() {
        console.log('\n🔄 Regenerate Project Plan');
        console.log('======================');
        
        const gameName = await this.getUserInput('Enter game name to regenerate: ');
        if (!gameName || gameName.trim() === '') {
            console.log('❌ Game name is required');
            return { workflow: 'planning', action: 'back' };
        }
        
        return {
            workflow: 'planning',
            action: 'regenerate',
            gameName: gameName.trim()
        };
    }

    async handleShowTemplates() {
        console.log('\n📊 Show Project Templates');
        console.log('======================');
        
        return {
            workflow: 'planning',
            action: 'templates',
            gameName: null
        };
    }

    async debuggingWorkflowMenu() {
        console.log('\n🐛 Debugging Workflow Menu');
        console.log('=========================\n');
        
        console.log('1. 🔍 Analyze Project Issues');
        console.log('   - Find and analyze problems\n');
        
        console.log('2. 🛠️ Fix Common Issues');
        console.log('   - Auto-fix common problems\n');
        
        console.log('3. 📊 Generate Debug Report');
        console.log('   - Create detailed debug report\n');
        
        console.log('4. 🔧 Manual Debug Mode');
        console.log('   - Interactive debugging session\n');
        
        console.log('0. ⬅️ Back to Main Menu\n');
        
        const choice = await this.getUserChoice();
        
        switch (choice) {
            case 0:
                return await this.showMainMenu();
            case 1:
                return { workflow: 'debugging', action: 'analyze', gameName: null };
            case 2:
                return { workflow: 'debugging', action: 'fix', gameName: null };
            case 3:
                return { workflow: 'debugging', action: 'report', gameName: null };
            case 4:
                return { workflow: 'debugging', action: 'manual', gameName: null };
            default:
                return await this.debuggingWorkflowMenu();
        }
    }

    async testingWorkflowMenu() {
        console.log('\n🧪 Testing Workflow Menu');
        console.log('=======================\n');
        
        console.log('1. 🚀 Start Game');
        console.log('   - Launch the game for testing\n');
        
        console.log('2. 🧪 Run Automated Tests');
        console.log('   - Execute test suite\n');
        
        console.log('3. 📊 Performance Test');
        console.log('   - Test game performance\n');
        
        console.log('4. 📋 Generate Test Report');
        console.log('   - Create comprehensive test report\n');
        
        console.log('0. ⬅️ Back to Main Menu\n');
        
        const choice = await this.getUserChoice();
        
        switch (choice) {
            case 0:
                return await this.showMainMenu();
            case 1:
                return { workflow: 'testing', action: 'start', gameName: null };
            case 2:
                return { workflow: 'testing', action: 'automated', gameName: null };
            case 3:
                return { workflow: 'testing', action: 'performance', gameName: null };
            case 4:
                return { workflow: 'testing', action: 'report', gameName: null };
            default:
                return await this.testingWorkflowMenu();
        }
    }

    async statusMenu() {
        console.log('\n📊 Status & Reports Menu');
        console.log('========================\n');
        
        console.log('1. 📈 Project Progress');
        console.log('   - Show current project status\n');
        
        console.log('2. 📋 Task Summary');
        console.log('   - Summary of all tasks\n');
        
        console.log('3. 📊 Detailed Report');
        console.log('   - Generate detailed progress report\n');
        
        console.log('4. 📅 Timeline View');
        console.log('   - Show project timeline\n');
        
        console.log('0. ⬅️ Back to Main Menu\n');
        
        const choice = await this.getUserChoice();
        
        switch (choice) {
            case 0:
                return await this.showMainMenu();
            case 1:
                return { workflow: 'status', action: 'progress', gameName: null };
            case 2:
                return { workflow: 'status', action: 'summary', gameName: null };
            case 3:
                return { workflow: 'status', action: 'detailed', gameName: null };
            case 4:
                return { workflow: 'status', action: 'timeline', gameName: null };
            default:
                return await this.statusMenu();
        }
    }

    async settingsMenu() {
        console.log('\n⚙️ Settings Menu');
        console.log('================\n');
        
        console.log('1. 🔧 CDP Configuration');
        console.log('   - Configure CDP port and settings\n');
        
        console.log('2. 🎮 Game Templates');
        console.log('   - Manage game templates\n');
        
        console.log('3. 🤖 AI Settings');
        console.log('   - Configure AI behavior\n');
        
        console.log('4. 📁 Project Paths');
        console.log('   - Configure project directories\n');
        
        console.log('0. ⬅️ Back to Main Menu\n');
        
        const choice = await this.getUserChoice();
        
        switch (choice) {
            case 0:
                return await this.showMainMenu();
            case 1:
                return { workflow: 'settings', action: 'cdp', gameName: null };
            case 2:
                return { workflow: 'settings', action: 'templates', gameName: null };
            case 3:
                return { workflow: 'settings', action: 'ai', gameName: null };
            case 4:
                return { workflow: 'settings', action: 'paths', gameName: null };
            default:
                return await this.settingsMenu();
        }
    }

    async getSpecificTask() {
        console.log('\nEnter task ID to execute: ');
        
        return new Promise((resolve) => {
            process.stdin.once('data', (data) => {
                const taskId = parseInt(data.toString().trim());
                resolve({ workflow: 'execute', action: 'specific', taskId: taskId, gameName: null });
            });
        });
    }

    async getStartTaskId() {
        console.log('\nEnter task ID to start from: ');
        
        return new Promise((resolve) => {
            process.stdin.once('data', (data) => {
                const taskId = parseInt(data.toString().trim());
                resolve({ workflow: 'execute', action: 'from', taskId: taskId, gameName: null });
            });
        });
    }

    async createNewGameProject() {
        console.log('\nEnter game name: ');
        
        return new Promise((resolve) => {
            process.stdin.once('data', (data) => {
                const gameName = data.toString().trim();
                resolve({ workflow: 'planning', action: 'create', gameName: gameName });
            });
        });
    }

    async editExistingProject() {
        console.log('\nEnter game name to edit: ');
        
        return new Promise((resolve) => {
            process.stdin.once('data', (data) => {
                const gameName = data.toString().trim();
                resolve({ workflow: 'planning', action: 'edit', gameName: gameName });
            });
        });
    }

    async regenerateProjectPlan() {
        console.log('\nEnter game name to regenerate: ');
        
        return new Promise((resolve) => {
            process.stdin.once('data', (data) => {
                const gameName = data.toString().trim();
                resolve({ workflow: 'planning', action: 'regenerate', gameName: gameName });
            });
        });
    }

    async getUserInput(prompt) {
        console.log(prompt);
        return new Promise((resolve) => {
            process.stdin.once('data', (data) => {
                resolve(data.toString().trim());
            });
        });
    }
}

export default MenuSystem;
