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
import { initializeBrowser } from '../managers/browser-manager.js';
import { TemplateManager } from '../file-operations/template-manager.js';

// AI Modules
import { generatePlanningPrompt, generateTaskCreationPrompt, generateGameIdeaAnalysisPrompt, generateComprehensiveTaskCreationPrompt, generateOrchestratorValidationPrompt } from '../ai/prompts.js';
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
        this.templateManager = new TemplateManager(config, log);
        this.gameIdea = null;
        this.gameConfig = null;
        this.customizedTasks = [];
        this.projectPath = null;
    }

    async executePlanningWorkflow(gameIdea, projectName = null) {
        this.log('🎬 Starting CDP-based automated project planning workflow');
        this.gameIdea = gameIdea;
        
        // Initialize browser for AI communication
        this.log('🌐 PHASE 0: Initializing browser connection...');
        await this.initializeBrowser();
        
        // PHASE 1: Project Structure Creation
        this.log('📁 PHASE 1: Creating project structure...');
        await this.createProjectStructure(projectName);
        
        // PHASE 2: Game Idea Analysis
        this.log('🔍 PHASE 2: Analyzing game idea...');
        await this.analyzeGameIdea();
        
        // PHASE 3: Template Customization
        this.log('🎨 PHASE 3: Customizing templates...');
        await this.customizeTemplates();
        
        // PHASE 4: Orchestrator Generation
        this.log('📋 PHASE 4: Generating orchestrator...');
        await this.generateOrchestrator();

        // PHASE 5: Orchestrator Validation
        this.log('📋 PHASE 5: Validating orchestrator...');
        await this.validateOrchestrator();
        
        // PHASE 6: AI Task Creation via CDP
        this.log('🤖 PHASE 6: Creating detailed task files via AI...');
        await this.createDetailedTaskFilesViaAI();
        
        // PHASE 7: Task File Creation
        this.log('📝 PHASE 7: Creating individual task files...');
        await this.createTaskFiles();
        
        // PHASE 8: Final Validation
        this.log('✅ PHASE 8: Final validation...');
        await this.validateProjectStructure();
        
        this.log('🎉 Planning workflow completed successfully!');
        await this.generatePlanningReport();
    }

    async analyzeGameIdea() {
        this.log('🤖 Analyzing game idea with AI...');
        
        // Get orchestrator path for AI to update directly
        const orchestratorPath = path.join(this.projectPath, 'system', 'orchestrator.md');
        const analysisPrompt = generateGameIdeaAnalysisPrompt(this.gameIdea, orchestratorPath);

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
        const defaultName = this.gameConfig?.gameType?.toLowerCase().replace(/\s+/g, '-') || 'game';
        this.projectPath = projectName || `game-${defaultName}`;
        
        // Ensure the path is in pidea-spark-output directory
        if (!this.projectPath.startsWith('pidea-spark-output/')) {
            this.projectPath = path.join('pidea-spark-output', this.projectPath);
        }
        
        this.log(`📁 Creating project structure: ${this.projectPath}`);
        
        // Create main project directory
        if (!fs.existsSync(this.projectPath)) {
            fs.mkdirSync(this.projectPath, { recursive: true });
        }
        
        // Create task directory structure
        const taskPath = path.join(this.projectPath, 'tasks');
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
        
        // Copy the template orchestrator first
        const templatePath = path.join(__dirname, '../templates/games/system/orchestrator.md');
        const orchestratorPath = path.join(this.projectPath, 'system', 'orchestrator.md');
        
        if (fs.existsSync(templatePath)) {
            // Copy template content
            const templateContent = fs.readFileSync(templatePath, 'utf8');
            fs.writeFileSync(orchestratorPath, templateContent);
            this.log('✅ Template orchestrator copied');
        } else {
            // Fallback to simple orchestrator if template doesn't exist
            const orchestratorContent = this.generateSimpleOrchestratorContent();
            fs.writeFileSync(orchestratorPath, orchestratorContent);
            this.log('⚠️ Template not found, using simple orchestrator');
        }
        
        this.log('✅ Orchestrator file generated');
    }

    generateSimpleOrchestratorContent() {
        // Extract project name from path
        const projectName = this.projectPath.split('/').pop();
        
        let content = `# ${projectName} - Game Project Orchestrator

## Description
${this.gameIdea}

## Game Type
${this.gameConfig.gameType || 'To be defined'}

## Game Configuration
- **Primary Genre**: ${this.gameConfig.primaryGenre || 'To be defined'}
- **Core Mechanics**: ${this.gameConfig.coreMechanics || 'To be defined'}
- **Target Platforms**: ${this.gameConfig.technical?.platforms || 'To be defined'}
- **Performance**: ${this.gameConfig.technical?.performance || 'To be defined'}

## Required Features
- **Multiplayer**: ${this.gameConfig.features?.multiplayer ? 'Yes' : 'No'}
- **3D Graphics**: ${this.gameConfig.features?.graphics3d ? 'Yes' : 'No'}
- **Audio**: ${this.gameConfig.features?.audio ? 'Yes' : 'No'}
- **AI**: ${this.gameConfig.features?.ai ? 'Yes' : 'No'}
- **Physics**: ${this.gameConfig.features?.physics ? 'Yes' : 'No'}
- **Networking**: ${this.gameConfig.features?.networking ? 'Yes' : 'No'}
- **Mobile Support**: ${this.gameConfig.features?.mobile ? 'Yes' : 'No'}
- **Cloud Saves**: ${this.gameConfig.features?.cloudSaves ? 'Yes' : 'No'}
- **Modding**: ${this.gameConfig.features?.modding ? 'Yes' : 'No'}
- **Analytics**: ${this.gameConfig.features?.analytics ? 'Yes' : 'No'}

## Development Priority
### Core Features
${this.gameConfig.priority?.core?.map(feature => `- ${feature}`).join('\n') || '- To be defined'}

### Optional Features
${this.gameConfig.priority?.optional?.map(feature => `- ${feature}`).join('\n') || '- To be defined'}

### Excluded Features
${this.gameConfig.priority?.excluded?.map(feature => `- ${feature}`).join('\n') || '- To be defined'}

## Task Orchestrator

| ID | Task Name | Dependencies | Status | Progress | Notes |
|----|-----------|--------------|--------|----------|-------|
`;

        let taskId = 1;
        
        // Generate tasks based on AI analysis
        const tasks = this.generateTasksFromAnalysis();
        
        for (const task of tasks) {
            content += `| ${taskId} | ${task.name} | ${task.dependencies} | ${task.status} | ${task.progress} | ${task.notes} |\n`;
            taskId++;
        }
        
        content += `
## Project Metadata
- Created: ${new Date().toISOString()}
- Status: Planning
- Version: 1.0.0
- Total Tasks: ${taskId - 1}
- Estimated Development Time: ${this.calculateTotalTime(tasks)} hours
`;

        return content;
    }

    generateTasksFromAnalysis() {
        const tasks = [];
        
        // Always include core setup tasks
        tasks.push({
            name: 'Project Setup',
            dependencies: '-',
            status: 'Pending',
            progress: '0%',
            notes: 'Initial project setup and configuration'
        });
        
        tasks.push({
            name: 'Game Design Documentation',
            dependencies: '1',
            status: 'Pending',
            progress: '0%',
            notes: 'Complete game design document based on analysis'
        });
        
        // Add tasks based on features
        if (this.gameConfig.features?.graphics3d) {
            tasks.push({
                name: '3D Graphics Pipeline Setup',
                dependencies: '1,2',
                status: 'Pending',
                progress: '0%',
                notes: '3D rendering and graphics system'
            });
        } else {
            tasks.push({
                name: '2D Graphics System',
                dependencies: '1,2',
                status: 'Pending',
                progress: '0%',
                notes: '2D rendering and sprite system'
            });
        }
        
        if (this.gameConfig.features?.audio) {
            tasks.push({
                name: 'Audio System Implementation',
                dependencies: '1,2',
                status: 'Pending',
                progress: '0%',
                notes: 'Music, sound effects, and audio management'
            });
        }
        
        if (this.gameConfig.features?.ai) {
            tasks.push({
                name: 'AI System Development',
                dependencies: '1,2',
                status: 'Pending',
                progress: '0%',
                notes: 'NPCs, enemies, and AI behavior'
            });
        }
        
        if (this.gameConfig.features?.physics) {
            tasks.push({
                name: 'Physics Engine Integration',
                dependencies: '1,2',
                status: 'Pending',
                progress: '0%',
                notes: 'Physics simulation and collision detection'
            });
        }
        
        if (this.gameConfig.features?.multiplayer) {
            tasks.push({
                name: 'Multiplayer System',
                dependencies: '1,2',
                status: 'Pending',
                progress: '0%',
                notes: 'Networking and multiplayer functionality'
            });
        }
        
        if (this.gameConfig.features?.cloudSaves) {
            tasks.push({
                name: 'Cloud Save System',
                dependencies: '1,2',
                status: 'Pending',
                progress: '0%',
                notes: 'Cloud storage and synchronization'
            });
        }
        
        if (this.gameConfig.features?.analytics) {
            tasks.push({
                name: 'Analytics Implementation',
                dependencies: '1,2',
                status: 'Pending',
                progress: '0%',
                notes: 'Game statistics and analytics tracking'
            });
        }
        
        // Add platform-specific tasks
        if (this.gameConfig.technical?.platforms?.toLowerCase().includes('web')) {
            tasks.push({
                name: 'Web Deployment Setup',
                dependencies: '1,2',
                status: 'Pending',
                progress: '0%',
                notes: 'Web build and deployment configuration'
            });
        }
        
        if (this.gameConfig.features?.mobile) {
            tasks.push({
                name: 'Mobile Optimization',
                dependencies: '1,2',
                status: 'Pending',
                progress: '0%',
                notes: 'Mobile-specific optimizations and UI'
            });
        }
        
        // Add testing and deployment
        tasks.push({
            name: 'Testing Framework',
            dependencies: '1,2',
            status: 'Pending',
            progress: '0%',
            notes: 'Unit tests and integration testing'
        });
        
        tasks.push({
            name: 'Final Deployment',
            dependencies: '1-' + (tasks.length - 1),
            status: 'Pending',
            progress: '0%',
            notes: 'Production deployment and release'
        });
        
        return tasks;
    }

    calculateTotalTime(tasks) {
        // Simple time estimation based on task count and complexity
        const baseTimePerTask = 4; // hours
        const totalTasks = tasks.length;
        return totalTasks * baseTimePerTask;
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

    async createDetailedTaskFilesViaAI() {
        this.log('🤖 Creating detailed task files via AI...');
        
        try {
            // Get orchestrator path
            const orchestratorPath = path.join(this.projectPath, 'system', 'orchestrator.md');
            
            // Generate comprehensive task creation prompt
            const prompt = generateComprehensiveTaskCreationPrompt(orchestratorPath, this.gameConfig);
            
            this.log('📤 Sending comprehensive task creation request to AI...');
            const response = await this.sendToAIviaCDP(prompt);
            
            // Parse the response to extract task creation results
            const result = this.parseTaskCreationResponse(response);
            
            if (result.status === 'completed') {
                this.log(`✅ Successfully created ${result.tasks_created} detailed task files`);
                this.log(`📊 Progress: ${result.tasks_created}/${result.tasks_processed} tasks processed`);
                this.log(`⏱️ Estimated completion time: ${result.estimated_completion_time}`);
                
                if (result.orchestrator_updated) {
                    this.log('✅ Orchestrator file updated with progress and validation');
                }
                
                if (result.validation_passed) {
                    this.log('✅ All task dependencies validated successfully');
                }
            } else {
                this.log(`⚠️ Task creation partially completed: ${result.tasks_created}/${result.tasks_processed} tasks`, 'WARNING');
            }
            
            this.log('✅ Detailed task files creation via AI completed');
            
        } catch (error) {
            this.log(`❌ Error creating detailed task files: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    parseTaskCreationResponse(response) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1]);
            }
            
            // If no JSON found, return a default structure
            return {
                status: 'partial',
                tasks_processed: 0,
                tasks_created: 0,
                orchestrator_updated: false,
                validation_passed: false,
                next_steps: 'Manual review required',
                estimated_completion_time: 'Unknown',
                dependencies_resolved: false
            };
        } catch (error) {
            this.log(`⚠️ Could not parse AI response: ${error.message}`, 'WARNING');
            return {
                status: 'failed',
                tasks_processed: 0,
                tasks_created: 0,
                orchestrator_updated: false,
                validation_passed: false,
                next_steps: 'Manual intervention required',
                estimated_completion_time: 'Unknown',
                dependencies_resolved: false
            };
        }
    }

    async createTaskFiles() {
        this.log('📝 Creating individual task files...');
        
        // Generate tasks based on AI analysis
        const tasks = this.generateTasksFromAnalysis();
        
        // Create tasks directory
        const tasksDir = path.join(this.projectPath, 'tasks');
        fs.mkdirSync(tasksDir, { recursive: true });
        
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            const taskId = i + 1;
            
            await this.createTaskFilesForTask(task, taskId, tasksDir);
        }
        
        this.log(`✅ Created ${tasks.length} task files`);
    }

    async createTaskFilesForTask(task, taskId, tasksDir) {
        const taskDir = path.join(tasksDir, `${taskId.toString().padStart(2, '0')}-${task.name.toLowerCase().replace(/\s+/g, '-')}`);
        fs.mkdirSync(taskDir, { recursive: true });
        
        // Create task files
        await this.createTaskIndex(task, taskId, taskDir);
        await this.createTaskImplementation(task, taskId, taskDir);
        await this.createTaskPhases(task, taskId, taskDir);
    }

    async createTaskIndex(task, taskId, taskDir) {
        const indexContent = `# Task ${taskId}: ${task.name}

## Task Overview
- **Task ID**: ${taskId}
- **Task Name**: ${task.name}
- **Dependencies**: ${task.dependencies}
- **Status**: ${task.status}
- **Progress**: ${task.progress}
- **Estimated Time**: ${this.estimateTaskTime(task)}h

## Task Description
${task.notes}

## Requirements
- [ ] Core functionality implementation
- [ ] Integration with existing systems
- [ ] Testing and validation
- [ ] Documentation

## Files
- **[Implementation](./${task.name.toLowerCase().replace(/\s+/g, '-')}-implementation.md)** - Complete implementation plan
- **[Phase 1](./${task.name.toLowerCase().replace(/\s+/g, '-')}-phase-1.md)** - Foundation setup
- **[Phase 2](./${task.name.toLowerCase().replace(/\s+/g, '-')}-phase-2.md)** - Core implementation
- **[Phase 3](./${task.name.toLowerCase().replace(/\s+/g, '-')}-phase-3.md)** - Integration and testing

---
*Generated by Planning Workflow*`;

        const indexPath = path.join(taskDir, `${task.name.toLowerCase().replace(/\s+/g, '-')}-index.md`);
        fs.writeFileSync(indexPath, indexContent);
    }

    async createTaskImplementation(task, taskId, taskDir) {
        const implementationContent = `# ${task.name} - Implementation Plan

## Task Information
- **Task ID**: ${taskId}
- **Dependencies**: ${task.dependencies}
- **Estimated Time**: ${this.estimateTaskTime(task)}h

## Implementation Overview
${task.notes}

## Technical Requirements
- **Tech Stack**: [To be determined based on game requirements]
- **Architecture**: [To be determined]
- **Dependencies**: ${task.dependencies}

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

        const implementationPath = path.join(taskDir, `${task.name.toLowerCase().replace(/\s+/g, '-')}-implementation.md`);
        fs.writeFileSync(implementationPath, implementationContent);
    }

    async createTaskPhases(task, taskId, taskDir) {
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

            const phasePath = path.join(taskDir, `${task.name.toLowerCase().replace(/\s+/g, '-')}-phase-${phase.number}.md`);
            fs.writeFileSync(phasePath, phaseContent);
        }
    }

    async validateProjectStructure() {
        this.log('✅ Validating project structure...');
        
        const requiredFiles = [
            'system/orchestrator.md',
            'tasks',
            'docs',
            'mermaid'
        ];
        
        for (const file of requiredFiles) {
            const filePath = path.join(this.projectPath, file);
            if (!fs.existsSync(filePath)) {
                throw new Error(`Required file/directory missing: ${file}`);
            }
        }
        
        // Validate orchestrator file
        const orchestratorPath = path.join(this.projectPath, 'system', 'orchestrator.md');
        if (fs.existsSync(orchestratorPath)) {
            const orchestratorContent = fs.readFileSync(orchestratorPath, 'utf8');
            
            // Count tasks in orchestrator
            const taskMatches = orchestratorContent.match(/\|\s*\d+\.\d+\s*\|/g);
            const totalTasksInOrchestrator = taskMatches ? taskMatches.length : 0;
            
            // Count task directories
            const tasksDir = path.join(this.projectPath, 'tasks');
            let createdTaskDirs = 0;
            if (fs.existsSync(tasksDir)) {
                const taskDirs = fs.readdirSync(tasksDir, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name);
                createdTaskDirs = taskDirs.length;
            }
            
            this.log(`📊 Orchestrator tasks: ${totalTasksInOrchestrator}`);
            this.log(`📁 Created task directories: ${createdTaskDirs}`);
            
            // Validate completion
            if (createdTaskDirs >= totalTasksInOrchestrator * 0.8) { // Allow 20% tolerance
                this.log(`✅ Task creation validation passed (${createdTaskDirs}/${totalTasksInOrchestrator} tasks)`);
            } else {
                this.log(`⚠️ Task creation incomplete (${createdTaskDirs}/${totalTasksInOrchestrator} tasks)`, 'WARNING');
            }
        }
        
        // Count total tasks from customized structure
        let totalTasks = 0;
        for (const category of this.customizedTasks) {
            totalTasks += category.tasks.length;
        }
        
        this.log(`✅ Project structure validated - ${totalTasks} tasks planned`);
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

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async validateOrchestrator() {
        this.log('🔍 Validating orchestrator file via AI...');
        
        try {
            // Get orchestrator path
            const orchestratorPath = path.join(this.projectPath, 'system', 'orchestrator.md');
            
            // Generate orchestrator validation prompt
            const prompt = generateOrchestratorValidationPrompt(orchestratorPath, this.gameConfig);
            
            this.log('📤 Sending orchestrator validation request to AI...');
            const response = await this.sendToAIviaCDP(prompt);
            
            // Parse the response to extract validation results
            const result = this.parseOrchestratorValidationResponse(response);
            
            if (result.status === 'validated' || result.status === 'updated') {
                this.log(`✅ Orchestrator validation completed successfully`);
                this.log(`🔄 Placeholders replaced: ${result.placeholders_replaced}`);
                this.log(`📊 Tasks count: ${result.tasks_count}`);
                
                if (result.structure_valid) {
                    this.log('✅ Task structure validation passed');
                }
                
                if (result.customization_complete) {
                    this.log('✅ Task customization completed');
                }
                
                if (result.updates_made && result.updates_made.length > 0) {
                    this.log('📝 Updates made:');
                    result.updates_made.forEach(update => this.log(`   - ${update}`));
                }
                
                if (result.issues_found && result.issues_found.length > 0) {
                    this.log('⚠️ Issues found:', 'WARNING');
                    result.issues_found.forEach(issue => this.log(`   - ${issue}`, 'WARNING'));
                }
            } else {
                this.log(`❌ Orchestrator validation failed: ${result.next_steps}`, 'ERROR');
                throw new Error('Orchestrator validation failed');
            }
            
            this.log('✅ Orchestrator validation via AI completed');
            
        } catch (error) {
            this.log(`❌ Error validating orchestrator: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    parseOrchestratorValidationResponse(response) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1]);
            }
            
            // If no JSON found, return a default structure
            return {
                status: 'failed',
                placeholders_replaced: 0,
                tasks_count: 0,
                structure_valid: false,
                customization_complete: false,
                validation_passed: false,
                updates_made: [],
                issues_found: ['Could not parse AI response'],
                next_steps: 'Manual review required'
            };
        } catch (error) {
            this.log(`⚠️ Could not parse AI validation response: ${error.message}`, 'WARNING');
            return {
                status: 'failed',
                placeholders_replaced: 0,
                tasks_count: 0,
                structure_valid: false,
                customization_complete: false,
                validation_passed: false,
                updates_made: [],
                issues_found: ['Response parsing failed'],
                next_steps: 'Manual intervention required'
            };
        }
    }
}

export default PlanningWorkflow;
