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
import { generatePlanningPrompt, generateTaskCreationPrompt, generateGameIdeaAnalysisPrompt, generateComprehensiveTaskCreationPrompt, generateOrchestratorValidationPrompt, generateContinueTaskCreationPrompt } from '../ai/prompts.js';
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
            this.log('📤 Sending game idea analysis request to AI...');
            const response = await this.sendToAIviaCDP(analysisPrompt, { maxStableChecks: 20 });
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
        const categories = fs.readdirSync(templatePath + '/tasks');
        
        for (const category of categories) {
            if (category.startsWith('.')) continue;
            
            const categoryPath = path.join(templatePath, 'tasks', category);
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
        
        // Check if we have workspace detection from the main workflow
        if (this.config.workspacePath) {
            // Use the detected Cursor workspace - create directly in pidea-spark-output
            this.projectPath = path.join(this.config.workspacePath, 'pidea-spark-output');
            this.log(`🎯 Using Cursor workspace: ${this.config.workspacePath}`);
        } else {
            // Fallback to local directory - create directly in pidea-spark-output
            this.projectPath = 'pidea-spark-output';
            this.log(`⚠️ Using local directory (Cursor workspace not detected)`);
        }
        
        this.log(`📁 Creating project structure: ${this.projectPath}`);
        
        // Create main project directory
        if (!fs.existsSync(this.projectPath)) {
            fs.mkdirSync(this.projectPath, { recursive: true });
        }
        
        // Copy complete template structure
        await this.copyTemplateStructure();
        
        this.log('✅ Project structure created with complete template');
    }

    async copyTemplateStructure() {
        this.log('📋 Copying complete template structure...');
        
        const templateBasePath = path.join(__dirname, '../templates/games');
        
        if (!fs.existsSync(templateBasePath)) {
            this.log('⚠️ Template directory not found, creating basic structure', 'WARNING');
            await this.createBasicStructure();
            return;
        }
        
        // Copy system files
        const systemTemplatePath = path.join(templateBasePath, 'system');
        const systemProjectPath = path.join(this.projectPath, 'system');
        
        if (fs.existsSync(systemTemplatePath)) {
            fs.mkdirSync(systemProjectPath, { recursive: true });
            await this.copyDirectory(systemTemplatePath, systemProjectPath);
            this.log('✅ System files copied');
        }
        
        // Copy task structure
        const taskTemplatePath = path.join(templateBasePath, 'tasks');
        const taskProjectPath = path.join(this.projectPath, 'tasks');
        
        if (fs.existsSync(taskTemplatePath)) {
            fs.mkdirSync(taskProjectPath, { recursive: true });
            await this.copyDirectory(taskTemplatePath, taskProjectPath);
            this.log('✅ Task structure copied');
        }
        
        // Copy other template directories
        const otherDirs = ['docs', 'mermaid', 'assets', 'config'];
        for (const dir of otherDirs) {
            const templateDirPath = path.join(templateBasePath, dir);
            const projectDirPath = path.join(this.projectPath, dir);
            
            if (fs.existsSync(templateDirPath)) {
                fs.mkdirSync(projectDirPath, { recursive: true });
                await this.copyDirectory(templateDirPath, projectDirPath);
                this.log(`✅ ${dir} directory copied`);
            }
        }
        
        // Copy README and other root files
        const rootFiles = ['README.md', 'package.json', 'tsconfig.json', '.gitignore'];
        for (const file of rootFiles) {
            const templateFilePath = path.join(templateBasePath, file);
            const projectFilePath = path.join(this.projectPath, file);
            
            if (fs.existsSync(templateFilePath)) {
                fs.copyFileSync(templateFilePath, projectFilePath);
                this.log(`✅ ${file} copied`);
            }
        }
    }

    async copyDirectory(src, dest) {
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
                fs.mkdirSync(destPath, { recursive: true });
                await this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    async createBasicStructure() {
        // Create basic directories if template doesn't exist
        const dirs = ['system', 'tasks', 'docs', 'mermaid'];
        for (const dir of dirs) {
            const dirPath = path.join(this.projectPath, dir);
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        // Create basic task structure
        const taskStructure = {
            '01-project-setup': [
                '01-git-repository-branching',
                '02-project-structure-creation',
                '03-linter-formatter-config',
                '04-build-system-setup',
                '05-package-management'
            ],
            '02-core-engine': [
                '01-game-loop-basis',
                '02-entity-component-system',
                '03-physics-engine',
                '04-input-handling',
                '05-rendering-pipeline'
            ],
            '03-frontend-ui': [
                '01-ui-framework-setup',
                '02-main-menu',
                '03-hud-implementation',
                '04-settings-menu',
                '05-inventory-ui'
            ]
        };
        
        const taskPath = path.join(this.projectPath, 'tasks');
        for (const [category, tasks] of Object.entries(taskStructure)) {
            const categoryPath = path.join(taskPath, category);
            fs.mkdirSync(categoryPath, { recursive: true });
            
            for (const task of tasks) {
                const taskDirPath = path.join(categoryPath, task);
                fs.mkdirSync(taskDirPath, { recursive: true });
                
                // Create basic task files
                const indexContent = `# ${task.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

## Task Overview
- **Category**: ${category}
- **Task**: ${task}
- **Status**: 📋 Ready
- **Progress**: 0%

## Description
Basic task template - to be customized.

## Files
- **index.md** - This file
- **implementation.md** - Implementation plan
- **phase-1.md** - Foundation phase
- **phase-2.md** - Core phase  
- **phase-3.md** - Integration phase

---
*Generated by Planning Workflow*`;
                
                fs.writeFileSync(path.join(taskDirPath, 'index.md'), indexContent);
                fs.writeFileSync(path.join(taskDirPath, 'implementation.md'), `# Implementation Plan\n\nTo be filled.`);
                fs.writeFileSync(path.join(taskDirPath, 'phase-1.md'), `# Phase 1: Foundation\n\nTo be filled.`);
                fs.writeFileSync(path.join(taskDirPath, 'phase-2.md'), `# Phase 2: Core\n\nTo be filled.`);
                fs.writeFileSync(path.join(taskDirPath, 'phase-3.md'), `# Phase 3: Integration\n\nTo be filled.`);
            }
        }
        
        this.log('✅ Basic structure created');
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
            const response = await this.sendToAIviaCDP(prompt, { maxStableChecks: 20 });
            
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
                
                // Check if we need to continue with remaining tasks
                const orchestratorContent = fs.readFileSync(orchestratorPath, 'utf8');
                const totalTasksInOrchestrator = (orchestratorContent.match(/\|\s*\d+\.\d+\s*\|/g) || []).length;
                const tasksDir = path.join(this.projectPath, 'tasks');
                const createdTaskDirs = fs.existsSync(tasksDir) ? 
                    fs.readdirSync(tasksDir, { withFileTypes: true })
                        .filter(dirent => dirent.isDirectory())
                        .map(dirent => dirent.name).length : 0;
                
                const missingTasks = totalTasksInOrchestrator - createdTaskDirs;
                
                if (missingTasks > 0) {
                    this.log(`🔄 ${missingTasks} tasks still missing, continuing with new chat...`);
                    await this.continueTaskCreationWithNewChat(missingTasks, orchestratorPath);
                }
            }
            
            this.log('✅ Detailed task files creation via AI completed');
            
        } catch (error) {
            this.log(`❌ Error creating detailed task files: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async continueTaskCreationWithNewChat(missingTasks, orchestratorPath) {
        this.log(`🆕 Opening new chat to create remaining ${missingTasks} tasks...`);
        
        try {
            // Generate a follow-up prompt for remaining tasks
            const followUpPrompt = generateContinueTaskCreationPrompt(missingTasks, orchestratorPath, this.projectPath);
            
            // Send follow-up prompt
            this.log('📤 Sending continue task creation request to AI...');
            const response = await this.sendToAIviaCDP(followUpPrompt, { maxStableChecks: 20 });
            
            // Wait for file changes
            await this.delay(3000);
            
            // Check final status
            const finalTasksDir = path.join(this.projectPath, 'tasks');
            const finalCreatedTasks = fs.existsSync(finalTasksDir) ? 
                fs.readdirSync(finalTasksDir, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name).length : 0;
            
            const finalOrchestratorContent = fs.readFileSync(orchestratorPath, 'utf8');
            const finalTotalTasks = (finalOrchestratorContent.match(/\|\s*\d+\.\d+\s*\|/g) || []).length;
            
            this.log(`📊 Final status: ${finalCreatedTasks}/${finalTotalTasks} tasks created`);
            
            if (finalCreatedTasks >= finalTotalTasks * 0.95) { // Allow 5% tolerance
                this.log('✅ Task creation completed successfully!');
            } else {
                this.log(`⚠️ Still missing ${finalTotalTasks - finalCreatedTasks} tasks`, 'WARNING');
            }
            
        } catch (error) {
            this.log(`❌ Error continuing task creation: ${error.message}`, 'ERROR');
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
        this.log('📝 Updating task files in template structure...');
        
        // Generate tasks based on AI analysis
        const tasks = this.generateTasksFromAnalysis();
        
        // Use the copied task directory structure
        const tasksDir = path.join(this.projectPath, 'tasks');
        
        if (!fs.existsSync(tasksDir)) {
            this.log('⚠️ Task directory not found, creating basic structure', 'WARNING');
            fs.mkdirSync(tasksDir, { recursive: true });
        }
        
        // Update existing task files with generated content
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            const taskId = i + 1;
            
            await this.updateTaskFilesInTemplate(task, taskId, tasksDir);
        }
        
        this.log(`✅ Updated ${tasks.length} task files in template structure`);
    }

    async updateTaskFilesInTemplate(task, taskId, tasksDir) {
        // Find the appropriate task directory in the template structure
        const taskDir = await this.findTaskDirectory(task, taskId, tasksDir);
        
        if (taskDir) {
            // Update existing task files
            await this.updateTaskIndex(task, taskId, taskDir);
            await this.updateTaskImplementation(task, taskId, taskDir);
            await this.updateTaskPhases(task, taskId, taskDir);
        } else {
            // Create new task directory if not found in template
            await this.createTaskFilesForTask(task, taskId, tasksDir);
        }
    }

    async findTaskDirectory(task, taskId, tasksDir) {
        // Look for existing task directories that match the task
        const entries = fs.readdirSync(tasksDir, { withFileTypes: true });
        
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const categoryPath = path.join(tasksDir, entry.name);
                const categoryEntries = fs.readdirSync(categoryPath, { withFileTypes: true });
                
                for (const taskEntry of categoryEntries) {
                    if (taskEntry.isDirectory()) {
                        const taskPath = path.join(categoryPath, taskEntry.name);
                        const indexPath = path.join(taskPath, 'index.md');
                        
                        if (fs.existsSync(indexPath)) {
                            // Check if this task directory matches our task
                            const indexContent = fs.readFileSync(indexPath, 'utf8');
                            if (indexContent.includes(task.name) || taskEntry.name.includes(task.name.toLowerCase().replace(/\s+/g, '-'))) {
                                return taskPath;
                            }
                        }
                    }
                }
            }
        }
        
        return null;
    }

    async updateTaskIndex(task, taskId, taskDir) {
        const indexPath = path.join(taskDir, 'index.md');
        
        if (fs.existsSync(indexPath)) {
            const indexContent = `# Task ${taskId}: ${task.name}

## Task Overview
- **Task ID**: ${taskId}
- **Task Name**: ${task.name}
- **Category**: ${task.category || 'To be determined'}
- **Dependencies**: ${task.dependencies || '-'}
- **Status**: ${task.status || '📋 Ready'}
- **Progress**: ${task.progress || '0%'}
- **Estimated Time**: ${this.estimateTaskTime(task)}h

## Task Description
${task.notes || 'Task description to be filled based on game requirements.'}

## Requirements
- [ ] Core functionality implementation
- [ ] Integration with existing systems
- [ ] Testing and validation
- [ ] Documentation

## Files
- **[Implementation](./implementation.md)** - Complete implementation plan
- **[Phase 1](./phase-1.md)** - Foundation setup
- **[Phase 2](./phase-2.md)** - Core implementation
- **[Phase 3](./phase-3.md)** - Integration and testing

---
*Updated by Planning Workflow*`;

            fs.writeFileSync(indexPath, indexContent);
        }
    }

    async updateTaskImplementation(task, taskId, taskDir) {
        const implementationPath = path.join(taskDir, 'implementation.md');
        
        const implementationContent = `# ${task.name} - Implementation Plan

## Task Information
- **Task ID**: ${taskId}
- **Category**: ${task.category || 'To be determined'}
- **Dependencies**: ${task.dependencies || '-'}
- **Estimated Time**: ${this.estimateTaskTime(task)}h

## Implementation Overview
${task.notes || 'Implementation details to be filled based on game requirements.'}

## Technical Requirements
- **Tech Stack**: [To be determined based on game requirements]
- **Architecture**: [To be determined]
- **Dependencies**: ${task.dependencies || '-'}

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
- [ ] Integration with other systems successful

## Notes
${task.notes || 'Additional notes and considerations for this task.'}

---
*Updated by Planning Workflow*`;

        fs.writeFileSync(implementationPath, implementationContent);
    }

    async updateTaskPhases(task, taskId, taskDir) {
        const phases = [
            { name: 'phase-1.md', title: 'Foundation Setup', description: 'Basic structure and environment setup' },
            { name: 'phase-2.md', title: 'Core Implementation', description: 'Main functionality implementation' },
            { name: 'phase-3.md', title: 'Integration and Testing', description: 'Integration with other systems and testing' }
        ];
        
        for (const phase of phases) {
            const phasePath = path.join(taskDir, phase.name);
            const phaseContent = `# ${task.name} - ${phase.title}

## Phase Overview
- **Task**: ${task.name}
- **Phase**: ${phase.title}
- **Description**: ${phase.description}

## Objectives
- [ ] Objective 1
- [ ] Objective 2
- [ ] Objective 3

## Implementation Steps
1. Step 1
2. Step 2
3. Step 3

## Success Criteria
- [ ] All objectives completed
- [ ] Tests passing
- [ ] Documentation updated

## Notes
${task.notes || 'Phase-specific notes and considerations.'}

---
*Updated by Planning Workflow*`;

            fs.writeFileSync(phasePath, phaseContent);
        }
    }

    async createTaskFilesForTask(task, taskId, tasksDir) {
        // Create new task directory if not found in template
        const taskDir = path.join(tasksDir, `${taskId.toString().padStart(2, '0')}-${task.name.toLowerCase().replace(/\s+/g, '-')}`);
        fs.mkdirSync(taskDir, { recursive: true });
        
        // Create task files
        await this.updateTaskIndex(task, taskId, taskDir);
        await this.updateTaskImplementation(task, taskId, taskDir);
        await this.updateTaskPhases(task, taskId, taskDir);
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

    async sendToAIviaCDP(prompt, options = {}) {
        this.log('🤖 Sending prompt to Cursor AI via CDP...');
        
        try {
            return await this.sendToCursor.sendToCursor(prompt, options);
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
            
            // Read original content for comparison
            const originalContent = fs.readFileSync(orchestratorPath, 'utf8');
            
            // Generate orchestrator validation prompt
            const prompt = generateOrchestratorValidationPrompt(orchestratorPath, this.gameConfig);
            
            this.log('📤 Sending orchestrator validation request to AI...');
            const response = await this.sendToAIviaCDP(prompt, { maxStableChecks: 50 });
            
            // Wait a moment for file changes to be saved
            await this.delay(2000);
            
            // Read updated content
            const updatedContent = fs.readFileSync(orchestratorPath, 'utf8');
            
            // Check if file was actually modified
            const fileWasModified = originalContent !== updatedContent;
            
            if (fileWasModified) {
                this.log('✅ AI updated orchestrator file successfully');
                
                // Count changes
                const placeholdersReplaced = this.countPlaceholderReplacements(originalContent, updatedContent);
                const tasksCount = this.countTasksInOrchestrator(updatedContent);
                
                this.log(`🔄 Placeholders replaced: ${placeholdersReplaced}`);
                this.log(`📊 Tasks count: ${tasksCount}`);
                
                // Validate structure
                const hasRequiredSections = this.validateOrchestratorStructure(updatedContent);
                if (hasRequiredSections) {
                    this.log('✅ Task structure validation passed');
                }
                
                if (tasksCount >= 100) {
                    this.log('✅ Sufficient number of tasks for comprehensive project');
                } else {
                    this.log(`⚠️ Only ${tasksCount} tasks found - consider expanding the project scope`, 'WARNING');
                }
                
                this.log('✅ Orchestrator validation completed successfully');
            } else {
                this.log('⚠️ No changes detected in orchestrator file', 'WARNING');
                this.log('✅ Continuing with existing orchestrator content');
            }
            
        } catch (error) {
            this.log(`❌ Error validating orchestrator: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    validateOrchestratorStructure(content) {
        const requiredSections = [
            'Project Overview',
            'Task Status Table',
            'Progress Summary'
        ];
        
        for (const section of requiredSections) {
            if (!content.includes(section)) {
                this.log(`⚠️ Missing required section: ${section}`, 'WARNING');
                return false;
            }
        }
        
        return true;
    }

    countPlaceholderReplacements(originalContent, updatedContent) {
        const placeholders = [
            /\[GAME_NAME\]/g,
            /\[GAME_TYPE\]/g,
            /\[GENRE\]/g,
            /\[CURRENT_DATE\]/g,
            /\[GENRE_LOWER\]/g,
            /To be defined/g,
            /\[GAME_DESCRIPTION\]/g
        ];
        
        let replacements = 0;
        for (const placeholder of placeholders) {
            const originalMatches = (originalContent.match(placeholder) || []).length;
            const updatedMatches = (updatedContent.match(placeholder) || []).length;
            replacements += Math.max(0, originalMatches - updatedMatches);
        }
        
        return replacements;
    }

    countTasksInOrchestrator(content) {
        const taskMatches = content.match(/\|\s*\d+\.\d+\s*\|/g);
        return taskMatches ? taskMatches.length : 0;
    }
}

export default PlanningWorkflow;
