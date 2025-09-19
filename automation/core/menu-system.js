#!/usr/bin/env node

/**
 * Menu System Module
 * 
 * Provides interactive menu for choosing different workflows
 * Handles user input and workflow selection
 */

import { ProjectDetector } from './project-detector.js';

export class MenuSystem {
    constructor() {
        this.projectDetector = new ProjectDetector();
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
        
        console.log('\n🎮 Pidea Spark - Game Automation Menu');
        console.log('=====================================\n');
        
        // Initialize project detector first
        await this.projectDetector.initialize();
        
        // Detect available projects and ideas
        const { projects, ideas } = await this.projectDetector.detectProjects();
        
        if (projects.length > 0) {
            console.log('📁 Available Projects:');
            console.log('======================');
            for (let i = 0; i < projects.length; i++) {
                const project = projects[i];
                const stats = project.stats;
                const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                console.log(`${i + 1}. ${project.name} (${progress}% - ${stats.completed}/${stats.total} tasks)`);
            }
            console.log('');
        }
        
        if (ideas.length > 0) {
            console.log('💡 Available Ideas:');
            console.log('==================');
            for (let i = 0; i < ideas.length; i++) {
                const idea = ideas[i];
                const title = idea.metadata.title || idea.name;
                console.log(`${i + 1}. ${title} (idea - can be converted to project)`);
            }
            console.log('');
        }
        
        console.log('🎯 Workflow Options:');
        console.log('===================\n');
        
        console.log('1. 🚀 Execute Workflow');
        console.log('   - Execute existing game project tasks');
        console.log('   - Run automation on current project\n');
        
        console.log('2. 📋 Planning Workflow');
        console.log('   - Create new game project');
        console.log('   - Convert ideas to projects');
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
        return await this.handleMenuChoice(choice, projects, ideas);
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

    async handleMenuChoice(choice, projects = [], ideas = []) {
        switch (choice) {
            case 0:
                this.log('👋 Exiting automation system');
                process.exit(0);
                break;
                
            case 1:
                return await this.executeWorkflowMenu(projects);
                
            case 2:
                return await this.showPlanningMenu(projects, ideas);
                
            case 3:
                return await this.debuggingWorkflowMenu(projects);
                
            case 4:
                return await this.testingWorkflowMenu(projects);
                
            case 5:
                return await this.statusMenu(projects);
                
            case 6:
                return await this.settingsMenu();
                
            default:
                this.log('❌ Invalid choice', 'ERROR');
                return await this.showMainMenu();
        }
    }

    async executeWorkflowMenu(projects) {
        console.log('\n🎯 Execute Workflow Menu');
        console.log('=======================\n');
        
        // Show project selection if multiple projects exist
        let selectedProject = null;
        if (projects.length > 1) {
            console.log('📁 Select Project:');
            for (let i = 0; i < projects.length; i++) {
                const project = projects[i];
                console.log(`${i + 1}. ${project.name}`);
            }
            console.log('0. Back to Main Menu\n');
            
            const projectChoice = await this.getUserChoice('Select project (0-' + projects.length + '): ', 0, projects.length);
            if (projectChoice === 0) {
                return await this.showMainMenu();
            }
            selectedProject = projects[projectChoice - 1];
        } else if (projects.length === 1) {
            selectedProject = projects[0];
            console.log(`📁 Using project: ${selectedProject.name}\n`);
        } else {
            console.log('⚠️ No projects found. Create a project first.\n');
        }
        
        console.log('🎯 Execute Options:');
        console.log('==================\n');
        
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
                return { workflow: 'execute', action: 'all', project: selectedProject };
            case 2:
                return await this.getSpecificTask(selectedProject);
            case 3:
                return { workflow: 'execute', action: 'list', project: selectedProject };
            case 4:
                return await this.getStartTaskId(selectedProject);
            default:
                return await this.executeWorkflowMenu(projects);
        }
    }

    async showPlanningMenu(projects, ideas) {
        console.log('\n📋 Planning Workflow Menu');
        console.log('========================\n');
        
        console.log('1. 🆕 Create New Game Project');
        console.log('   - Start a new game development project\n');
        
        if (ideas.length > 0) {
            console.log('2. 🔄 Convert Idea to Project');
            console.log('   - Convert existing idea to full project\n');
            
            console.log('3. 📝 Edit Existing Project');
            console.log('   - Modify an existing project\n');
            
            console.log('4. 🔄 Regenerate Project Plan');
            console.log('   - Recreate the project plan\n');
            
            console.log('5. 📊 Show Project Templates');
            console.log('   - View available templates\n');
            
            console.log('0. ⬅️ Back to Main Menu\n');
            
            const choice = await this.getUserChoice('Enter your choice (0-5): ', 0, 5);
            
            switch (choice) {
                case 0:
                    return await this.showMainMenu();
                case 1:
                    return await this.handleCreateNewProject();
                case 2:
                    return await this.handleConvertIdeaToProject(ideas);
                case 3:
                    return await this.handleEditProject(projects);
                case 4:
                    return await this.handleRegeneratePlan(projects);
                case 5:
                    return await this.handleShowTemplates();
                default:
                    return await this.showPlanningMenu(projects, ideas);
            }
        } else {
            console.log('2. 📝 Edit Existing Project');
            console.log('   - Modify an existing project\n');
            
            console.log('3. 🔄 Regenerate Project Plan');
            console.log('   - Recreate the project plan\n');
            
            console.log('4. 📊 Show Project Templates');
            console.log('   - View available templates\n');
            
            console.log('0. ⬅️ Back to Main Menu\n');
            
            const choice = await this.getUserChoice('Enter your choice (0-4): ', 0, 4);
            
            switch (choice) {
                case 0:
                    return await this.showMainMenu();
                case 1:
                    return await this.handleCreateNewProject();
                case 2:
                    return await this.handleEditProject(projects);
                case 3:
                    return await this.handleRegeneratePlan(projects);
                case 4:
                    return await this.handleShowTemplates();
                default:
                    return await this.showPlanningMenu(projects, ideas);
            }
        }
    }

    async handleCreateNewProject() {
        console.log('\n🆕 Create New Game Project');
        console.log('=========================\n');
        
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

    async handleEditProject(projects) {
        console.log('\n📝 Edit Existing Project');
        console.log('======================\n');
        
        if (projects.length === 0) {
            console.log('❌ No projects found. Create a project first.');
            return { workflow: 'planning', action: 'back' };
        }
        
        console.log('📁 Select Project to Edit:');
        for (let i = 0; i < projects.length; i++) {
            const project = projects[i];
            console.log(`${i + 1}. ${project.name}`);
        }
        console.log('0. Back to Planning Menu\n');
        
        const choice = await this.getUserChoice('Select project (0-' + projects.length + '): ', 0, projects.length);
        if (choice === 0) {
            return await this.showPlanningMenu(projects, []); // Pass empty ideas for now
        }
        
        const selectedProject = projects[choice - 1];
        
        return {
            workflow: 'planning',
            action: 'edit',
            project: selectedProject
        };
    }

    async handleRegeneratePlan(projects) {
        console.log('\n🔄 Regenerate Project Plan');
        console.log('=========================\n');
        
        if (projects.length === 0) {
            console.log('❌ No projects found. Create a project first.');
            return { workflow: 'planning', action: 'back' };
        }
        
        console.log('📁 Select Project to Regenerate:');
        for (let i = 0; i < projects.length; i++) {
            const project = projects[i];
            console.log(`${i + 1}. ${project.name}`);
        }
        console.log('0. Back to Planning Menu\n');
        
        const choice = await this.getUserChoice('Select project (0-' + projects.length + '): ', 0, projects.length);
        if (choice === 0) {
            return await this.showPlanningMenu(projects, []); // Pass empty ideas for now
        }
        
        const selectedProject = projects[choice - 1];
        
        return {
            workflow: 'planning',
            action: 'regenerate',
            project: selectedProject
        };
    }

    async handleShowTemplates() {
        console.log('\n📊 Show Project Templates');
        console.log('=========================\n');
        
        return {
            workflow: 'planning',
            action: 'templates'
        };
    }

    async handleConvertIdeaToProject(ideas) {
        console.log('\n🔄 Convert Idea to Project');
        console.log('=========================\n');
        
        console.log('💡 Select Idea to Convert:');
        for (let i = 0; i < ideas.length; i++) {
            const idea = ideas[i];
            const title = idea.metadata.title || idea.name;
            const description = idea.metadata.description || 'No description available';
            console.log(`${i + 1}. ${title}`);
            console.log(`   ${description}`);
            console.log('');
        }
        console.log('0. Back to Planning Menu\n');
        
        const choice = await this.getUserChoice('Select idea (0-' + ideas.length + '): ', 0, ideas.length);
        if (choice === 0) {
            return await this.showPlanningMenu([], ideas);
        }
        
        const selectedIdea = ideas[choice - 1];
        
        // Show idea details
        console.log(`\n📋 Idea Details: ${selectedIdea.metadata.title || selectedIdea.name}`);
        console.log('=====================================');
        console.log(`Description: ${selectedIdea.metadata.description || 'No description'}`);
        if (selectedIdea.metadata.gameType) {
            console.log(`Game Type: ${selectedIdea.metadata.gameType}`);
        }
        if (selectedIdea.metadata.genre) {
            console.log(`Genre: ${selectedIdea.metadata.genre}`);
        }
        console.log(`\nContent Preview:`);
        console.log(selectedIdea.content);
        console.log('\n');
        
        // Confirm conversion
        const confirm = await this.getUserInput('Convert this idea to a project? (y/N): ');
        if (!confirm.toLowerCase().startsWith('y')) {
            console.log('❌ Conversion cancelled');
            return await this.showPlanningMenu([], ideas);
        }
        
        // Get project name
        //const projectName = await this.getUserInput('Enter project name (optional, press Enter to use idea name): ');
        // Auto-generate project name from idea path
        const projectName = selectedIdea.name;
        console.log(`📁 Project name: ${projectName} (auto-generated from idea path)`);
        
        return {
            workflow: 'planning',
            action: 'convert-idea',
            idea: selectedIdea,
           // projectName: projectName.trim() || selectedIdea.name
            projectName: projectName
        };
    }

    async debuggingWorkflowMenu(projects) {
        console.log('\n🐛 Debugging Workflow Menu');
        console.log('=========================\n');
        
        // Show project selection if multiple projects exist
        let selectedProject = null;
        if (projects.length > 1) {
            console.log('📁 Select Project:');
            for (let i = 0; i < projects.length; i++) {
                const project = projects[i];
                console.log(`${i + 1}. ${project.name}`);
            }
            console.log('0. Back to Main Menu\n');
            
            const projectChoice = await this.getUserChoice('Select project (0-' + projects.length + '): ', 0, projects.length);
            if (projectChoice === 0) {
                return await this.showMainMenu();
            }
            selectedProject = projects[projectChoice - 1];
        } else if (projects.length === 1) {
            selectedProject = projects[0];
            console.log(`📁 Using project: ${selectedProject.name}\n`);
        } else {
            console.log('⚠️ No projects found. Create a project first.\n');
        }
        
        console.log('🐛 Debugging Options:');
        console.log('====================\n');
        
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
                return { workflow: 'debugging', action: 'analyze', project: selectedProject };
            case 2:
                return { workflow: 'debugging', action: 'fix', project: selectedProject };
            case 3:
                return { workflow: 'debugging', action: 'report', project: selectedProject };
            case 4:
                return { workflow: 'debugging', action: 'manual', project: selectedProject };
            default:
                return await this.debuggingWorkflowMenu(projects);
        }
    }

    async testingWorkflowMenu(projects) {
        console.log('\n🧪 Testing Workflow Menu');
        console.log('=======================\n');
        
        // Show project selection if multiple projects exist
        let selectedProject = null;
        if (projects.length > 1) {
            console.log('📁 Select Project:');
            for (let i = 0; i < projects.length; i++) {
                const project = projects[i];
                console.log(`${i + 1}. ${project.name}`);
            }
            console.log('0. Back to Main Menu\n');
            
            const projectChoice = await this.getUserChoice('Select project (0-' + projects.length + '): ', 0, projects.length);
            if (projectChoice === 0) {
                return await this.showMainMenu();
            }
            selectedProject = projects[projectChoice - 1];
        } else if (projects.length === 1) {
            selectedProject = projects[0];
            console.log(`📁 Using project: ${selectedProject.name}\n`);
        } else {
            console.log('⚠️ No projects found. Create a project first.\n');
        }
        
        console.log('🧪 Testing Options:');
        console.log('==================\n');
        
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
                return { workflow: 'testing', action: 'start', project: selectedProject };
            case 2:
                return { workflow: 'testing', action: 'automated', project: selectedProject };
            case 3:
                return { workflow: 'testing', action: 'performance', project: selectedProject };
            case 4:
                return { workflow: 'testing', action: 'report', project: selectedProject };
            default:
                return await this.testingWorkflowMenu(projects);
        }
    }

    async statusMenu(projects) {
        console.log('\n📊 Status & Reports Menu');
        console.log('========================\n');
        
        // Show project selection if multiple projects exist
        let selectedProject = null;
        if (projects.length > 1) {
            console.log('📁 Select Project:');
            for (let i = 0; i < projects.length; i++) {
                const project = projects[i];
                console.log(`${i + 1}. ${project.name}`);
            }
            console.log('0. Back to Main Menu\n');
            
            const projectChoice = await this.getUserChoice('Select project (0-' + projects.length + '): ', 0, projects.length);
            if (projectChoice === 0) {
                return await this.showMainMenu();
            }
            selectedProject = projects[projectChoice - 1];
        } else if (projects.length === 1) {
            selectedProject = projects[0];
            console.log(`📁 Using project: ${selectedProject.name}\n`);
        } else {
            console.log('⚠️ No projects found. Create a project first.\n');
        }
        
        console.log('📊 Status Options:');
        console.log('=================\n');
        
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
                return { workflow: 'status', action: 'progress', project: selectedProject };
            case 2:
                return { workflow: 'status', action: 'summary', project: selectedProject };
            case 3:
                return { workflow: 'status', action: 'detailed', project: selectedProject };
            case 4:
                return { workflow: 'status', action: 'timeline', project: selectedProject };
            default:
                return await this.statusMenu(projects);
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
                return { workflow: 'settings', action: 'cdp' };
            case 2:
                return { workflow: 'settings', action: 'templates' };
            case 3:
                return { workflow: 'settings', action: 'ai' };
            case 4:
                return { workflow: 'settings', action: 'paths' };
            default:
                return await this.settingsMenu();
        }
    }

    async getSpecificTask(project) {
        console.log('\nEnter task ID to execute: ');
        
        return new Promise((resolve) => {
            process.stdin.once('data', (data) => {
                const taskId = parseInt(data.toString().trim());
                resolve({ workflow: 'execute', action: 'specific', taskId: taskId, project: project });
            });
        });
    }

    async getStartTaskId(project) {
        console.log('\nEnter task ID to start from: ');
        
        return new Promise((resolve) => {
            process.stdin.once('data', (data) => {
                const taskId = parseInt(data.toString().trim());
                resolve({ workflow: 'execute', action: 'from', taskId: taskId, project: project });
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
