#!/usr/bin/env node

/**
 * Planning Workflow Module
 * 
 * Handles the complete project planning workflow including:
 * - Game idea analysis
 * - Template customization
 * - Task generation
 * - Orchestrator creation
 * - Individual task file creation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Manager Modules
import { initializeBrowser, cleanup } from '../managers/browser-manager.js';
import { TemplateManager } from '../file-operations/template-manager.js';

// AI Modules
import { generatePlanningPrompt, generateTaskCreationPrompt } from '../ai/prompts.js';
import { detectAITyping, extractAIResponse, detectResponseComplete, waitForAIResponse } from '../ai/response-processor.js';
import { SendToCursor } from '../ai/send-to-cursor.js';

// UI Modules
import { cursorSelectors, typingSelectors, cursorBlinkSelectors, streamingSelectors, errorSelectors } from '../ui/selectors.js';

// Core Modules
import { getConfig } from '../core/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class PlanningWorkflow {
    constructor(config, log) {
        this.config = config;
        this.log = log;
        this.browser = null;
        this.page = null;
        this.sendToCursor = null;
        this.templateManager = new TemplateManager();
        this.gameIdea = null;
        this.gameConfig = null;
        this.customizedTasks = [];
        this.projectPath = null;
    }

    async executePlanningWorkflow(gameIdea, projectName = null) {
        this.log('🎬 Starting CDP-based automated project planning workflow');
        this.gameIdea = gameIdea;
        
        // PHASE 1: Game Idea Analysis
        this.log('🔍 PHASE 1: Analyzing game idea...');
        await this.analyzeGameIdea();
        
        // PHASE 2: Template Customization
        this.log('🎨 PHASE 2: Customizing templates...');
        await this.customizeTemplates();
        
        // PHASE 3: Project Structure Creation
        this.log('📁 PHASE 3: Creating project structure...');
        await this.createProjectStructure(projectName);
        
        // PHASE 4: Orchestrator Generation
        this.log('📋 PHASE 4: Generating orchestrator...');
        await this.generateOrchestrator();
        
        // PHASE 5: Task File Creation
        this.log('📝 PHASE 5: Creating individual task files...');
        await this.createTaskFiles();
        
        // PHASE 6: Final Validation
        this.log('✅ PHASE 6: Final validation...');
        await this.validateProjectStructure();
        
        this.log('🎉 Planning workflow completed successfully!');
        await this.generatePlanningReport();
        await this.cleanup();
    }

    async analyzeGameIdea() {
        this.log('🤖 Analyzing game idea with AI...');
        
        const analysisPrompt = `# Game Idea Analysis Request

## Game Idea
${this.gameIdea}

## Analysis Requirements
Please analyze this game idea and provide:

1. **Game Type**: (Action, Strategy, Puzzle, Simulation, Adventure, Sports, Racing, Horror, Arcade, Educational)
2. **Primary Genre**: (Specific genre classification)
3. **Core Mechanics**: (Main gameplay elements)
4. **Required Features**:
   - Multiplayer: (Yes/No - if yes, specify type: local, online, co-op, competitive)
   - 3D Graphics: (Yes/No)
   - Audio: (Yes/No - music, sound effects, voice acting)
   - AI: (Yes/No - NPCs, enemies, pathfinding)
   - Physics: (Yes/No - realistic, arcade-style)
   - Networking: (Yes/No - online features)
   - Mobile Support: (Yes/No)
   - Cloud Saves: (Yes/No)
   - Modding: (Yes/No)
   - Analytics: (Yes/No)

5. **Technical Requirements**:
   - Target Platforms: (Web, Desktop, Mobile, Console)
   - Performance Requirements: (Low, Medium, High)
   - Scalability: (Single player, small multiplayer, large multiplayer)

6. **Development Priority**:
   - Core Features: (List essential features)
   - Optional Features: (List nice-to-have features)
   - Excluded Features: (List features to skip)

Please provide a structured analysis that can be used to customize the game development template.`;

        try {
            const response = await this.sendToAIviaCDP(analysisPrompt);
            this.gameConfig = this.parseGameAnalysis(response);
            this.log('✅ Game idea analysis completed');
        } catch (error) {
            this.log(`❌ Error analyzing game idea: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    parseGameAnalysis(response) {
        // Extract structured data from AI response
        const config = {
            gameType: this.extractValue(response, 'Game Type'),
            primaryGenre: this.extractValue(response, 'Primary Genre'),
            coreMechanics: this.extractValue(response, 'Core Mechanics'),
            features: {
                multiplayer: this.extractFeature(response, 'Multiplayer'),
                graphics3d: this.extractFeature(response, '3D Graphics'),
                audio: this.extractFeature(response, 'Audio'),
                ai: this.extractFeature(response, 'AI'),
                physics: this.extractFeature(response, 'Physics'),
                networking: this.extractFeature(response, 'Networking'),
                mobile: this.extractFeature(response, 'Mobile Support'),
                cloudSaves: this.extractFeature(response, 'Cloud Saves'),
                modding: this.extractFeature(response, 'Modding'),
                analytics: this.extractFeature(response, 'Analytics')
            },
            technical: {
                platforms: this.extractValue(response, 'Target Platforms'),
                performance: this.extractValue(response, 'Performance Requirements'),
                scalability: this.extractValue(response, 'Scalability')
            },
            priority: {
                core: this.extractList(response, 'Core Features'),
                optional: this.extractList(response, 'Optional Features'),
                excluded: this.extractList(response, 'Excluded Features')
            }
        };

        return config;
    }

    extractValue(text, key) {
        const regex = new RegExp(`${key}[:\\s]*([^\\n]+)`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : '';
    }

    extractFeature(text, key) {
        const value = this.extractValue(text, key);
        return value.toLowerCase().includes('yes') || value.toLowerCase().includes('true');
    }

    extractList(text, key) {
        const lines = text.split('\n');
        const list = [];
        let inList = false;
        
        for (const line of lines) {
            if (line.includes(key + ':')) {
                inList = true;
                continue;
            }
            if (inList && line.trim().startsWith('-')) {
                list.push(line.trim().substring(1).trim());
            } else if (inList && line.trim() === '') {
                break;
            }
        }
        
        return list;
    }

    async customizeTemplates() {
        this.log('🎨 Customizing templates based on game analysis...');
        
        // Load base template structure
        const baseTemplatePath = path.join(__dirname, '../templates/games');
        const templateStructure = this.loadTemplateStructure(baseTemplatePath);
        
        // Customize based on game config
        this.customizedTasks = this.customizeTaskStructure(templateStructure);
        
        this.log(`✅ Customized ${this.customizedTasks.length} task categories`);
    }

    loadTemplateStructure(templatePath) {
        const structure = [];
        const categories = fs.readdirSync(templatePath + '/task');
        
        for (const category of categories) {
            if (category.startsWith('.')) continue;
            
            const categoryPath = path.join(templatePath, 'task', category);
            const categoryName = category.split('-').slice(1).join(' ');
            const tasks = [];
            
            const taskDirs = fs.readdirSync(categoryPath);
            for (const taskDir of taskDirs) {
                if (taskDir.startsWith('.')) continue;
                
                const taskPath = path.join(categoryPath, taskDir);
                const taskName = taskDir.split('-').slice(1).join(' ');
                tasks.push({
                    id: taskDir.split('-')[0],
                    name: taskName,
                    path: taskPath,
                    category: categoryName
                });
            }
            
            structure.push({
                id: category.split('-')[0],
                name: categoryName,
                path: categoryPath,
                tasks: tasks
            });
        }
        
        return structure;
    }

    customizeTaskStructure(templateStructure) {
        const customized = [];
        
        for (const category of templateStructure) {
            const shouldInclude = this.shouldIncludeCategory(category);
            
            if (shouldInclude) {
                const customizedCategory = {
                    ...category,
                    tasks: category.tasks.filter(task => this.shouldIncludeTask(task, category))
                };
                
                if (customizedCategory.tasks.length > 0) {
                    customized.push(customizedCategory);
                }
            }
        }
        
        return customized;
    }

    shouldIncludeCategory(category) {
        const categoryName = category.name.toLowerCase();
        
        // Always include core categories
        if (categoryName.includes('project setup') || 
            categoryName.includes('core engine') || 
            categoryName.includes('frontend') || 
            categoryName.includes('testing') || 
            categoryName.includes('deployment')) {
            return true;
        }
        
        // Conditional categories based on game config
        if (categoryName.includes('multiplayer') && !this.gameConfig.features.multiplayer) {
            return false;
        }
        
        if (categoryName.includes('assets') && !this.gameConfig.features.graphics3d && !this.gameConfig.features.audio) {
            return false;
        }
        
        if (categoryName.includes('data persistence') && !this.gameConfig.features.cloudSaves) {
            return false;
        }
        
        if (categoryName.includes('monitoring') && !this.gameConfig.features.analytics) {
            return false;
        }
        
        return true;
    }

    shouldIncludeTask(task, category) {
        const taskName = task.name.toLowerCase();
        const categoryName = category.name.toLowerCase();
        
        // Skip tasks based on game config
        if (taskName.includes('multiplayer') && !this.gameConfig.features.multiplayer) {
            return false;
        }
        
        if (taskName.includes('3d') && !this.gameConfig.features.graphics3d) {
            return false;
        }
        
        if (taskName.includes('audio') && !this.gameConfig.features.audio) {
            return false;
        }
        
        if (taskName.includes('ai') && !this.gameConfig.features.ai) {
            return false;
        }
        
        if (taskName.includes('physics') && !this.gameConfig.features.physics) {
            return false;
        }
        
        if (taskName.includes('cloud') && !this.gameConfig.features.cloudSaves) {
            return false;
        }
        
        if (taskName.includes('mod') && !this.gameConfig.features.modding) {
            return false;
        }
        
        if (taskName.includes('mobile') && !this.gameConfig.features.mobile) {
            return false;
        }
        
        return true;
    }

    async createProjectStructure(projectName) {
        const defaultName = this.gameConfig.gameType.toLowerCase().replace(/\s+/g, '-');
        this.projectPath = projectName || `game-${defaultName}`;
        
        this.log(`📁 Creating project structure: ${this.projectPath}`);
        
        // Create main project directory
        if (!fs.existsSync(this.projectPath)) {
            fs.mkdirSync(this.projectPath, { recursive: true });
        }
        
        // Create task directory structure
        const taskPath = path.join(this.projectPath, 'task');
        fs.mkdirSync(taskPath, { recursive: true });
        
        // Create system directory
        const systemPath = path.join(this.projectPath, 'system');
        fs.mkdirSync(systemPath, { recursive: true });
        
        // Create docs directory
        const docsPath = path.join(this.projectPath, 'docs');
        fs.mkdirSync(docsPath, { recursive: true });
        
        // Create mermaid directory
        const mermaidPath = path.join(this.projectPath, 'mermaid');
        fs.mkdirSync(mermaidPath, { recursive: true });
        
        this.log('✅ Project structure created');
    }

    async generateOrchestrator() {
        this.log('📋 Generating orchestrator file...');
        
        const orchestratorContent = this.generateOrchestratorContent();
        const orchestratorPath = path.join(this.projectPath, 'system', 'orchestrator.md');
        
        fs.writeFileSync(orchestratorPath, orchestratorContent);
        this.log('✅ Orchestrator file generated');
    }

    generateOrchestratorContent() {
        let content = `# ${this.gameConfig.gameType} Project - Project Orchestrator

## Project Overview
- **Game Name**: ${this.gameConfig.gameType}
- **Game Type**: ${this.gameConfig.gameType}
- **Genre**: ${this.gameConfig.primaryGenre}
- **Status**: 🚀 Planning Phase
- **Last Updated**: ${new Date().toISOString()}

## Game Configuration
- **Core Mechanics**: ${this.gameConfig.coreMechanics}
- **Target Platforms**: ${this.gameConfig.technical.platforms}
- **Performance**: ${this.gameConfig.technical.performance}
- **Multiplayer**: ${this.gameConfig.features.multiplayer ? 'Yes' : 'No'}
- **3D Graphics**: ${this.gameConfig.features.graphics3d ? 'Yes' : 'No'}
- **Audio**: ${this.gameConfig.features.audio ? 'Yes' : 'No'}

## Task Status Table

`;

        let taskId = 1;
        
        for (const category of this.customizedTasks) {
            content += `### ${category.id}. ${category.name} (${category.tasks.length} Tasks)\n`;
            content += `| ID | Task Name | Category | Time | Status | Progress | Dependencies | Notes |\n`;
            content += `|----|-----------|----------|------|--------|----------|--------------|-------|\n`;
            
            for (const task of category.tasks) {
                const estimatedTime = this.estimateTaskTime(task);
                const dependencies = this.calculateDependencies(task, category);
                
                content += `| ${taskId} | ${task.name} | ${category.name.toLowerCase().replace(/\s+/g, '-')} | ${estimatedTime}h | 📋 Ready | 0% | ${dependencies} | ${task.name.toLowerCase()} |\n`;
                taskId++;
            }
            content += '\n';
        }
        
        content += `## Progress Summary
- **Total Tasks**: ${taskId - 1}
- **Completed**: 0
- **In Progress**: 0
- **Ready**: ${taskId - 1}
- **Blocked**: 0
- **Overall Progress**: 0%

## Next Steps
1. Review and customize project information
2. Adjust task priorities based on requirements
3. Set up development environment
4. Begin with Project Setup (Task 1.1)

---
*Generated by Planning Workflow*`;

        return content;
    }

    estimateTaskTime(task) {
        const taskName = task.name.toLowerCase();
        
        if (taskName.includes('setup') || taskName.includes('config')) return 1;
        if (taskName.includes('core') || taskName.includes('engine')) return 3;
        if (taskName.includes('ui') || taskName.includes('frontend')) return 2;
        if (taskName.includes('multiplayer') || taskName.includes('networking')) return 4;
        if (taskName.includes('testing')) return 2;
        if (taskName.includes('deployment')) return 3;
        
        return 2; // Default time
    }

    calculateDependencies(task, category) {
        // Simple dependency calculation
        if (category.id === '01') return '-';
        if (category.id === '02') return '1.1-1.10';
        if (category.id === '03') return '2.5';
        if (category.id === '04') return '2.10';
        if (category.id === '05') return '2.11';
        if (category.id === '06') return '2.9';
        if (category.id === '07') return '2.3,2.4';
        if (category.id === '08') return '1.3';
        if (category.id === '09') return '1.4';
        if (category.id === '10') return '9.2';
        
        return '-';
    }

    async createTaskFiles() {
        this.log('📝 Creating individual task files...');
        
        let taskId = 1;
        
        for (const category of this.customizedTasks) {
            this.log(`📁 Creating tasks for category: ${category.name}`);
            
            // Create category directory
            const categoryDir = path.join(this.projectPath, 'task', category.path.split('/').pop());
            fs.mkdirSync(categoryDir, { recursive: true });
            
            for (const task of category.tasks) {
                await this.createTaskFilesForTask(task, category, taskId);
                taskId++;
            }
        }
        
        this.log(`✅ Created ${taskId - 1} task files`);
    }

    async createTaskFilesForTask(task, category, taskId) {
        const taskDir = path.join(this.projectPath, 'task', category.path.split('/').pop(), task.path.split('/').pop());
        fs.mkdirSync(taskDir, { recursive: true });
        
        // Create task files
        await this.createTaskIndex(task, category, taskId, taskDir);
        await this.createTaskImplementation(task, category, taskId, taskDir);
        await this.createTaskPhases(task, category, taskId, taskDir);
    }

    async createTaskIndex(task, category, taskId, taskDir) {
        const indexContent = `# Task ${taskId}: ${task.name}

## Task Overview
- **Task ID**: ${taskId}
- **Task Name**: ${task.name}
- **Category**: ${category.name}
- **Estimated Time**: ${this.estimateTaskTime(task)}h
- **Dependencies**: ${this.calculateDependencies(task, category)}
- **Status**: 📋 Ready
- **Progress**: 0%

## Task Description
${task.name} implementation for ${this.gameConfig.gameType} game.

## Requirements
- [ ] Core functionality implementation
- [ ] Integration with existing systems
- [ ] Testing and validation
- [ ] Documentation

## Files
- **[Implementation](./${task.name.replace(/\s+/g, '-').toLowerCase()}-implementation.md)** - Complete implementation plan
- **[Phase 1](./${task.name.replace(/\s+/g, '-').toLowerCase()}-phase-1.md)** - Foundation setup
- **[Phase 2](./${task.name.replace(/\s+/g, '-').toLowerCase()}-phase-2.md)** - Core implementation
- **[Phase 3](./${task.name.replace(/\s+/g, '-').toLowerCase()}-phase-3.md)** - Integration and testing

---
*Generated by Planning Workflow*`;

        const indexPath = path.join(taskDir, `${task.name.replace(/\s+/g, '-').toLowerCase()}-index.md`);
        fs.writeFileSync(indexPath, indexContent);
    }

    async createTaskImplementation(task, category, taskId, taskDir) {
        const implementationContent = `# ${task.name} - Implementation Plan

## Task Information
- **Task ID**: ${taskId}
- **Category**: ${category.name}
- **Estimated Time**: ${this.estimateTaskTime(task)}h
- **Dependencies**: ${this.calculateDependencies(task, category)}

## Implementation Overview
Complete implementation of ${task.name} for ${this.gameConfig.gameType} game.

## Technical Requirements
- **Tech Stack**: [To be determined based on game requirements]
- **Architecture**: [To be determined]
- **Dependencies**: ${this.calculateDependencies(task, category)}

## Implementation Phases

### Phase 1: Foundation Setup
- [ ] Create basic structure
- [ ] Set up dependencies
- [ ] Configure environment

### Phase 2: Core Implementation
- [ ] Implement main functionality
- [ ] Add error handling
- [ ] Create unit tests

### Phase 3: Integration and Testing
- [ ] Integrate with existing systems
- [ ] Perform integration testing
- [ ] Update documentation

## Success Criteria
- [ ] Functionality works as expected
- [ ] All tests pass
- [ ] Documentation is complete
- [ ] Integration successful

---
*Generated by Planning Workflow*`;

        const implementationPath = path.join(taskDir, `${task.name.replace(/\s+/g, '-').toLowerCase()}-implementation.md`);
        fs.writeFileSync(implementationPath, implementationContent);
    }

    async createTaskPhases(task, category, taskId, taskDir) {
        const phases = [
            { number: 1, name: 'Foundation Setup', description: 'Create basic structure and setup dependencies' },
            { number: 2, name: 'Core Implementation', description: 'Implement main functionality and add error handling' },
            { number: 3, name: 'Integration and Testing', description: 'Integrate with existing systems and perform testing' }
        ];
        
        for (const phase of phases) {
            const phaseContent = `# ${task.name} - Phase ${phase.number}: ${phase.name}

## Phase Overview
${phase.description}

## Tasks
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Deliverables
- [ ] Deliverable 1
- [ ] Deliverable 2
- [ ] Deliverable 3

## Success Criteria
- [ ] All tasks completed
- [ ] All deliverables ready
- [ ] Phase validated

---
*Generated by Planning Workflow*`;

            const phasePath = path.join(taskDir, `${task.name.replace(/\s+/g, '-').toLowerCase()}-phase-${phase.number}.md`);
            fs.writeFileSync(phasePath, phaseContent);
        }
    }

    async validateProjectStructure() {
        this.log('✅ Validating project structure...');
        
        const requiredFiles = [
            'system/orchestrator.md',
            'task',
            'docs',
            'mermaid'
        ];
        
        for (const file of requiredFiles) {
            const filePath = path.join(this.projectPath, file);
            if (!fs.existsSync(filePath)) {
                throw new Error(`Required file/directory missing: ${file}`);
            }
        }
        
        // Count total tasks
        let totalTasks = 0;
        for (const category of this.customizedTasks) {
            totalTasks += category.tasks.length;
        }
        
        this.log(`✅ Project structure validated - ${totalTasks} tasks created`);
    }

    async generatePlanningReport() {
        const report = `# Planning Workflow Report

## Project Information
- **Game Name**: ${this.gameConfig.gameType}
- **Genre**: ${this.gameConfig.primaryGenre}
- **Project Path**: ${this.projectPath}
- **Created**: ${new Date().toISOString()}

## Game Configuration
- **Core Mechanics**: ${this.gameConfig.coreMechanics}
- **Multiplayer**: ${this.gameConfig.features.multiplayer ? 'Yes' : 'No'}
- **3D Graphics**: ${this.gameConfig.features.graphics3d ? 'Yes' : 'No'}
- **Audio**: ${this.gameConfig.features.audio ? 'Yes' : 'No'}
- **AI**: ${this.gameConfig.features.ai ? 'Yes' : 'No'}
- **Physics**: ${this.gameConfig.features.physics ? 'Yes' : 'No'}

## Task Summary
${this.customizedTasks.map(category => 
    `### ${category.name}: ${category.tasks.length} tasks`
).join('\n')}

## Total Tasks Created: ${this.customizedTasks.reduce((sum, cat) => sum + cat.tasks.length, 0)}

## Next Steps
1. Review the generated project structure
2. Customize task priorities if needed
3. Start execution workflow
4. Begin with Task 1.1

---
*Generated by Planning Workflow*`;

        const reportPath = path.join(this.projectPath, 'planning-report.md');
        fs.writeFileSync(reportPath, report);
        this.log(`📋 Planning report saved to ${reportPath}`);
    }

    async sendToAIviaCDP(prompt) {
        this.log('🤖 Sending prompt to Cursor AI via CDP...');
        
        try {
            return await this.sendToCursor.sendToCursor(prompt);
        } catch (error) {
            this.log(`❌ Failed to send prompt: ${error.message}`, 'ERROR');
            throw error;
        }
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

    async cleanup() {
        await cleanup(this.browser, this.log);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default PlanningWorkflow;
