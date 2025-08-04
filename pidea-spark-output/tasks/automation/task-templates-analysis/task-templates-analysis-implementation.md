# Task Templates Implementation Plan: AI Adaptation & Template Enhancement

## Project Overview
- **Feature/Component Name**: Task Templates AI Adaptation System
- **Priority**: High
- **Category**: automation
- **Estimated Time**: 32 hours
- **Dependencies**: Template standardization, AI prompt enhancement
- **Related Issues**: Template completion, AI integration, task creation automation
- **Created**: 2024-12-19T10:30:00.000Z

## Technical Requirements

### Tech Stack
- **Framework**: Node.js with ES6 modules
- **Architecture Pattern**: Template Processor + AI Integration
- **Database Changes**: None (file-based templates)
- **API Changes**: New template processing endpoints
- **Frontend Changes**: Template management interface
- **Backend Changes**: Template processing engine

### Core Components
1. **Template Standardization System**
2. **AI Template Adaptation Engine**
3. **Placeholder Resolution System**
4. **Genre-Specific Template Generator**
5. **Technology Stack Adapter**

## Implementation Steps

### Phase 1: Template Standardization (4 hours)

#### Step 1.1: Create Unified Placeholder System
```javascript
// automation/templates/games/task/placeholder-system.js
export const PLACEHOLDERS = {
  // Universal Placeholders
  TASK_ID: '[TASK_ID]',
  TASK_NAME: '[TASK_NAME]',
  CATEGORY: '[CATEGORY]',
  ESTIMATED_TIME: '[ESTIMATED_TIME]',
  DEPENDENCIES: '[DEPENDENCIES]',
  TASK_TYPE: '[TASK_TYPE]',
  
  // Project-Specific Placeholders
  GAME_NAME: '[GAME_NAME]',
  GENRE: '[GENRE]',
  GENRE_LOWER: '[GENRE_LOWER]',
  GAME_ENGINE: '[GAME_ENGINE]',
  
  // Technology-Specific Placeholders
  FRAMEWORK: '[FRAMEWORK]',
  LIBRARY: '[LIBRARY]',
  TOOLS: '[TOOLS]',
  
  // Genre-Specific Placeholders
  GENRE_MECHANICS_DESCRIPTION: '[GENRE_MECHANICS_DESCRIPTION]',
  GENRE_MECHANIC_1: '[GENRE_MECHANIC_1]',
  GENRE_MECHANIC_2: '[GENRE_MECHANIC_2]',
  GENRE_MECHANIC_3: '[GENRE_MECHANIC_3]',
  GENRE_MECHANIC_4: '[GENRE_MECHANIC_4]',
  GENRE_MECHANIC_5: '[GENRE_MECHANIC_5]',
  
  // Phase-Specific Placeholders
  PHASE_1_NAME: '[PHASE_1_NAME]',
  PHASE_2_NAME: '[PHASE_2_NAME]',
  PHASE_3_NAME: '[PHASE_3_NAME]',
  STEP_1_1: '[STEP_1_1]',
  STEP_1_2: '[STEP_1_2]',
  STEP_1_3: '[STEP_1_3]',
  STEP_2_1: '[STEP_2_1]',
  STEP_2_2: '[STEP_2_2]',
  STEP_2_3: '[STEP_2_3]',
  STEP_3_1: '[STEP_3_1]',
  STEP_3_2: '[STEP_3_2]',
  STEP_3_3: '[STEP_3_3]',
  
  // Success Criteria Placeholders
  SUCCESS_CRITERIA_1: '[SUCCESS_CRITERIA_1]',
  SUCCESS_CRITERIA_2: '[SUCCESS_CRITERIA_2]',
  SUCCESS_CRITERIA_3: '[SUCCESS_CRITERIA_3]',
  SUCCESS_CRITERIA_4: '[SUCCESS_CRITERIA_4]',
  
  // File Placeholders
  FILE_1: '[FILE_1]',
  FILE_2: '[FILE_2]',
  FILE_3: '[FILE_3]',
  
  // Additional Placeholders
  ADDITIONAL_NOTES: '[ADDITIONAL_NOTES]',
  TEMPLATE_TYPE: '[TEMPLATE_TYPE]'
};
```

#### Step 1.2: Create Template Validation Rules
```javascript
// automation/templates/games/task/validation-rules.md
# Template Validation Rules

## Required Placeholders
Every template must include:
- [TASK_ID] - Task identifier
- [TASK_NAME] - Task name
- [CATEGORY] - Task category
- [ESTIMATED_TIME] - Time estimate
- [DEPENDENCIES] - Task dependencies

## Format Standards
- Use square brackets for placeholders: [PLACEHOLDER_NAME]
- No spaces in placeholder names
- Consistent naming convention: UPPER_CASE_WITH_UNDERSCORES
- No special characters except underscores

## Content Requirements
- Minimum 3 phases per task
- At least 3 steps per phase
- 4-5 success criteria
- 3-5 files to create/modify
- Technology considerations section
```

#### Step 1.3: Update Template Task Index
```markdown
# automation/templates/games/task/template-task-index.md
# Task [TASK_ID]: [TASK_NAME]

## Task Overview
- **Task ID**: [TASK_ID]
- **Category**: [CATEGORY]
- **Time**: [ESTIMATED_TIME]
- **Dependencies**: [DEPENDENCIES]
- **Type**: [TASK_TYPE]

## Task Description
[TASK_DESCRIPTION]

## Requirements
- [ ] [REQUIREMENT_1]
- [ ] [REQUIREMENT_2]
- [ ] [REQUIREMENT_3]
- [ ] [REQUIREMENT_4]
- [ ] [REQUIREMENT_5]

## Implementation Steps

### Phase 1: [PHASE_1_NAME]
1. [STEP_1_1]
2. [STEP_1_2]
3. [STEP_1_3]

### Phase 2: [PHASE_2_NAME]
1. [STEP_2_1]
2. [STEP_2_2]
3. [STEP_2_3]

### Phase 3: [PHASE_3_NAME]
1. [STEP_3_1]
2. [STEP_3_2]
3. [STEP_3_3]

## Success Criteria
- [ ] [SUCCESS_CRITERIA_1]
- [ ] [SUCCESS_CRITERIA_2]
- [ ] [SUCCESS_CRITERIA_3]
- [ ] [SUCCESS_CRITERIA_4]

## Files to Create/Modify
- [FILE_1]
- [FILE_2]
- [FILE_3]

## Technology Considerations
- **Framework**: [FRAMEWORK]
- **Library**: [LIBRARY]
- **Tools**: [TOOLS]

## Notes
[ADDITIONAL_NOTES]

---
*Template: [TEMPLATE_TYPE]*
```

### Phase 2: AI Template Adaptation Engine (8 hours)

#### Step 2.1: Create Template Adapter
```javascript
// automation/ai/prompts/shared/template-adapter.js
import fs from 'fs';
import path from 'path';
import { PLACEHOLDERS } from '../../templates/games/task/placeholder-system.js';

export class TemplateAdapter {
  constructor(gameConfig) {
    this.gameConfig = gameConfig;
    this.placeholders = this.generatePlaceholderValues();
  }

  generatePlaceholderValues() {
    return {
      // Universal placeholders
      '[TASK_ID]': this.generateTaskId(),
      '[TASK_NAME]': this.generateTaskName(),
      '[CATEGORY]': this.generateCategory(),
      '[ESTIMATED_TIME]': this.generateTimeEstimate(),
      '[DEPENDENCIES]': this.generateDependencies(),
      '[TASK_TYPE]': this.generateTaskType(),
      
      // Project-specific placeholders
      '[GAME_NAME]': this.gameConfig.gameName || 'MyGame',
      '[GENRE]': this.gameConfig.primaryGenre || 'Action',
      '[GENRE_LOWER]': (this.gameConfig.primaryGenre || 'Action').toLowerCase(),
      '[GAME_ENGINE]': this.gameConfig.gameEngine || 'Unity',
      
      // Technology-specific placeholders
      '[FRAMEWORK]': this.generateFramework(),
      '[LIBRARY]': this.generateLibrary(),
      '[TOOLS]': this.generateTools(),
      
      // Genre-specific placeholders
      '[GENRE_MECHANICS_DESCRIPTION]': this.generateGenreMechanicsDescription(),
      '[GENRE_MECHANIC_1]': this.generateGenreMechanic(1),
      '[GENRE_MECHANIC_2]': this.generateGenreMechanic(2),
      '[GENRE_MECHANIC_3]': this.generateGenreMechanic(3),
      '[GENRE_MECHANIC_4]': this.generateGenreMechanic(4),
      '[GENRE_MECHANIC_5]': this.generateGenreMechanic(5),
      
      // Phase-specific placeholders
      '[PHASE_1_NAME]': this.generatePhaseName(1),
      '[PHASE_2_NAME]': this.generatePhaseName(2),
      '[PHASE_3_NAME]': this.generatePhaseName(3),
      '[STEP_1_1]': this.generateStep(1, 1),
      '[STEP_1_2]': this.generateStep(1, 2),
      '[STEP_1_3]': this.generateStep(1, 3),
      '[STEP_2_1]': this.generateStep(2, 1),
      '[STEP_2_2]': this.generateStep(2, 2),
      '[STEP_2_3]': this.generateStep(2, 3),
      '[STEP_3_1]': this.generateStep(3, 1),
      '[STEP_3_2]': this.generateStep(3, 2),
      '[STEP_3_3]': this.generateStep(3, 3),
      
      // Success criteria placeholders
      '[SUCCESS_CRITERIA_1]': this.generateSuccessCriteria(1),
      '[SUCCESS_CRITERIA_2]': this.generateSuccessCriteria(2),
      '[SUCCESS_CRITERIA_3]': this.generateSuccessCriteria(3),
      '[SUCCESS_CRITERIA_4]': this.generateSuccessCriteria(4),
      
      // File placeholders
      '[FILE_1]': this.generateFile(1),
      '[FILE_2]': this.generateFile(2),
      '[FILE_3]': this.generateFile(3),
      
      // Additional placeholders
      '[ADDITIONAL_NOTES]': this.generateAdditionalNotes(),
      '[TEMPLATE_TYPE]': this.generateTemplateType()
    };
  }

  generateTaskId() {
    // Generate task ID based on category and position
    return '1.1';
  }

  generateTaskName() {
    // Generate task name based on category and context
    return 'Task Name';
  }

  generateCategory() {
    // Generate category based on directory structure
    return 'project-setup';
  }

  generateTimeEstimate() {
    // Generate time estimate based on task complexity
    return '2h';
  }

  generateDependencies() {
    // Generate dependencies based on task order
    return '1.1 (Previous Task)';
  }

  generateTaskType() {
    // Generate task type based on category
    return 'standard-template';
  }

  generateFramework() {
    // Generate framework based on game engine
    switch (this.gameConfig.gameEngine) {
      case 'Unity':
        return 'Unity Framework';
      case 'Unreal':
        return 'Unreal Engine';
      case 'Custom':
        return 'Custom Framework';
      default:
        return 'Generic Framework';
    }
  }

  generateLibrary() {
    // Generate library based on genre and engine
    return 'Standard Library';
  }

  generateTools() {
    // Generate tools based on technology stack
    return 'Development Tools';
  }

  generateGenreMechanicsDescription() {
    // Generate genre-specific mechanics description
    const genre = this.gameConfig.primaryGenre || 'Action';
    const descriptions = {
      'Fighting': 'combat systems, combo mechanics, and hit detection',
      'RPG': 'character progression, turn-based combat, and quest systems',
      'Strategy': 'resource management, unit control, and tactical gameplay',
      'Action': 'real-time mechanics, physics interactions, and dynamic gameplay',
      'Adventure': 'exploration, puzzle-solving, and narrative progression'
    };
    return descriptions[genre] || 'core gameplay mechanics';
  }

  generateGenreMechanic(index) {
    // Generate genre-specific mechanics
    const genre = this.gameConfig.primaryGenre || 'Action';
    const mechanics = {
      'Fighting': [
        'Implement combo system',
        'Add hit detection',
        'Create special moves',
        'Implement blocking mechanics',
        'Add counter-attack system'
      ],
      'RPG': [
        'Create character stats system',
        'Implement turn-based combat',
        'Add quest management',
        'Create inventory system',
        'Implement leveling mechanics'
      ],
      'Strategy': [
        'Implement resource management',
        'Create unit control system',
        'Add tactical AI',
        'Implement victory conditions',
        'Create map management'
      ]
    };
    return mechanics[genre]?.[index - 1] || `Implement mechanic ${index}`;
  }

  generatePhaseName(phaseNumber) {
    // Generate phase names based on task type
    const phases = {
      1: 'Foundation Setup',
      2: 'Core Implementation',
      3: 'Integration & Testing'
    };
    return phases[phaseNumber] || `Phase ${phaseNumber}`;
  }

  generateStep(phaseNumber, stepNumber) {
    // Generate steps based on phase and task context
    return `Step ${phaseNumber}.${stepNumber}`;
  }

  generateSuccessCriteria(index) {
    // Generate success criteria based on task type
    const criteria = [
      'All requirements implemented',
      'Tests pass successfully',
      'Documentation updated',
      'Code follows standards'
    ];
    return criteria[index - 1] || `Success criteria ${index}`;
  }

  generateFile(index) {
    // Generate file paths based on task type
    const files = [
      'src/components/Component.js',
      'tests/Component.test.js',
      'docs/Component.md'
    ];
    return files[index - 1] || `file${index}.js`;
  }

  generateAdditionalNotes() {
    // Generate additional notes based on context
    return 'Additional implementation notes and considerations.';
  }

  generateTemplateType() {
    // Generate template type based on category
    return 'Standard Template';
  }

  async processTemplate(templatePath) {
    try {
      const templateContent = await fs.promises.readFile(templatePath, 'utf8');
      return this.replacePlaceholders(templateContent);
    } catch (error) {
      console.error(`Error processing template ${templatePath}:`, error);
      throw error;
    }
  }

  replacePlaceholders(content) {
    let processedContent = content;
    
    // Replace all placeholders with their values
    for (const [placeholder, value] of Object.entries(this.placeholders)) {
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
    }
    
    return processedContent;
  }

  async generateTaskFromTemplate(templatePath, outputPath) {
    const processedContent = await this.processTemplate(templatePath);
    await fs.promises.writeFile(outputPath, processedContent, 'utf8');
    return outputPath;
  }
}
```

#### Step 2.2: Create Placeholder Resolver
```javascript
// automation/ai/prompts/shared/placeholder-resolver.js
export class PlaceholderResolver {
  constructor(gameConfig, taskContext) {
    this.gameConfig = gameConfig;
    this.taskContext = taskContext;
  }

  resolvePlaceholder(placeholder) {
    const resolverMap = {
      // Universal resolvers
      '[TASK_ID]': () => this.resolveTaskId(),
      '[TASK_NAME]': () => this.resolveTaskName(),
      '[CATEGORY]': () => this.resolveCategory(),
      '[ESTIMATED_TIME]': () => this.resolveTimeEstimate(),
      '[DEPENDENCIES]': () => this.resolveDependencies(),
      '[TASK_TYPE]': () => this.resolveTaskType(),
      
      // Project-specific resolvers
      '[GAME_NAME]': () => this.gameConfig.gameName,
      '[GENRE]': () => this.gameConfig.primaryGenre,
      '[GENRE_LOWER]': () => this.gameConfig.primaryGenre?.toLowerCase(),
      '[GAME_ENGINE]': () => this.gameConfig.gameEngine,
      
      // Technology-specific resolvers
      '[FRAMEWORK]': () => this.resolveFramework(),
      '[LIBRARY]': () => this.resolveLibrary(),
      '[TOOLS]': () => this.resolveTools(),
      
      // Genre-specific resolvers
      '[GENRE_MECHANICS_DESCRIPTION]': () => this.resolveGenreMechanicsDescription(),
      '[GENRE_MECHANIC_1]': () => this.resolveGenreMechanic(1),
      '[GENRE_MECHANIC_2]': () => this.resolveGenreMechanic(2),
      '[GENRE_MECHANIC_3]': () => this.resolveGenreMechanic(3),
      '[GENRE_MECHANIC_4]': () => this.resolveGenreMechanic(4),
      '[GENRE_MECHANIC_5]': () => this.resolveGenreMechanic(5),
      
      // Phase-specific resolvers
      '[PHASE_1_NAME]': () => this.resolvePhaseName(1),
      '[PHASE_2_NAME]': () => this.resolvePhaseName(2),
      '[PHASE_3_NAME]': () => this.resolvePhaseName(3),
      '[STEP_1_1]': () => this.resolveStep(1, 1),
      '[STEP_1_2]': () => this.resolveStep(1, 2),
      '[STEP_1_3]': () => this.resolveStep(1, 3),
      '[STEP_2_1]': () => this.resolveStep(2, 1),
      '[STEP_2_2]': () => this.resolveStep(2, 2),
      '[STEP_2_3]': () => this.resolveStep(2, 3),
      '[STEP_3_1]': () => this.resolveStep(3, 1),
      '[STEP_3_2]': () => this.resolveStep(3, 2),
      '[STEP_3_3]': () => this.resolveStep(3, 3),
      
      // Success criteria resolvers
      '[SUCCESS_CRITERIA_1]': () => this.resolveSuccessCriteria(1),
      '[SUCCESS_CRITERIA_2]': () => this.resolveSuccessCriteria(2),
      '[SUCCESS_CRITERIA_3]': () => this.resolveSuccessCriteria(3),
      '[SUCCESS_CRITERIA_4]': () => this.resolveSuccessCriteria(4),
      
      // File resolvers
      '[FILE_1]': () => this.resolveFile(1),
      '[FILE_2]': () => this.resolveFile(2),
      '[FILE_3]': () => this.resolveFile(3),
      
      // Additional resolvers
      '[ADDITIONAL_NOTES]': () => this.resolveAdditionalNotes(),
      '[TEMPLATE_TYPE]': () => this.resolveTemplateType()
    };

    const resolver = resolverMap[placeholder];
    return resolver ? resolver() : placeholder;
  }

  resolveTaskId() {
    return this.taskContext?.taskId || '1.1';
  }

  resolveTaskName() {
    return this.taskContext?.taskName || 'Task Name';
  }

  resolveCategory() {
    return this.taskContext?.category || 'project-setup';
  }

  resolveTimeEstimate() {
    return this.taskContext?.estimatedTime || '2h';
  }

  resolveDependencies() {
    return this.taskContext?.dependencies || 'None';
  }

  resolveTaskType() {
    return this.taskContext?.taskType || 'standard-template';
  }

  resolveFramework() {
    const engine = this.gameConfig.gameEngine;
    const frameworks = {
      'Unity': 'Unity Framework',
      'Unreal': 'Unreal Engine',
      'Custom': 'Custom Framework'
    };
    return frameworks[engine] || 'Generic Framework';
  }

  resolveLibrary() {
    const genre = this.gameConfig.primaryGenre;
    const libraries = {
      'Fighting': 'Combat Library',
      'RPG': 'RPG Framework',
      'Strategy': 'Strategy Library',
      'Action': 'Action Library'
    };
    return libraries[genre] || 'Standard Library';
  }

  resolveTools() {
    const engine = this.gameConfig.gameEngine;
    const tools = {
      'Unity': 'Unity Editor, Visual Studio',
      'Unreal': 'Unreal Editor, Visual Studio',
      'Custom': 'IDE, Build Tools'
    };
    return tools[engine] || 'Development Tools';
  }

  resolveGenreMechanicsDescription() {
    const genre = this.gameConfig.primaryGenre;
    const descriptions = {
      'Fighting': 'combat systems, combo mechanics, and hit detection',
      'RPG': 'character progression, turn-based combat, and quest systems',
      'Strategy': 'resource management, unit control, and tactical gameplay',
      'Action': 'real-time mechanics, physics interactions, and dynamic gameplay'
    };
    return descriptions[genre] || 'core gameplay mechanics';
  }

  resolveGenreMechanic(index) {
    const genre = this.gameConfig.primaryGenre;
    const mechanics = {
      'Fighting': [
        'Implement combo system',
        'Add hit detection',
        'Create special moves',
        'Implement blocking mechanics',
        'Add counter-attack system'
      ],
      'RPG': [
        'Create character stats system',
        'Implement turn-based combat',
        'Add quest management',
        'Create inventory system',
        'Implement leveling mechanics'
      ]
    };
    return mechanics[genre]?.[index - 1] || `Implement mechanic ${index}`;
  }

  resolvePhaseName(phaseNumber) {
    const phases = {
      1: 'Foundation Setup',
      2: 'Core Implementation',
      3: 'Integration & Testing'
    };
    return phases[phaseNumber] || `Phase ${phaseNumber}`;
  }

  resolveStep(phaseNumber, stepNumber) {
    return `Step ${phaseNumber}.${stepNumber}`;
  }

  resolveSuccessCriteria(index) {
    const criteria = [
      'All requirements implemented',
      'Tests pass successfully',
      'Documentation updated',
      'Code follows standards'
    ];
    return criteria[index - 1] || `Success criteria ${index}`;
  }

  resolveFile(index) {
    const files = [
      'src/components/Component.js',
      'tests/Component.test.js',
      'docs/Component.md'
    ];
    return files[index - 1] || `file${index}.js`;
  }

  resolveAdditionalNotes() {
    return 'Additional implementation notes and considerations.';
  }

  resolveTemplateType() {
    return 'Standard Template';
  }

  resolveAllPlaceholders(content) {
    let resolvedContent = content;
    
    // Find all placeholders in content
    const placeholderRegex = /\[[A-Z_0-9]+\]/g;
    const placeholders = content.match(placeholderRegex) || [];
    
    // Resolve each placeholder
    for (const placeholder of placeholders) {
      const resolvedValue = this.resolvePlaceholder(placeholder);
      resolvedContent = resolvedContent.replace(new RegExp(placeholder, 'g'), resolvedValue);
    }
    
    return resolvedContent;
  }
}
```

### Phase 3: Template Completion System (20 hours)

#### Step 3.1: Create Template Generator
```javascript
// automation/ai/prompts/shared/template-generator.js
import fs from 'fs';
import path from 'path';
import { TemplateAdapter } from './template-adapter.js';
import { PlaceholderResolver } from './placeholder-resolver.js';

export class TemplateGenerator {
  constructor(gameConfig) {
    this.gameConfig = gameConfig;
    this.templateAdapter = new TemplateAdapter(gameConfig);
    this.placeholderResolver = new PlaceholderResolver(gameConfig);
  }

  async generateAllTemplates() {
    const templateDirectories = await this.getTemplateDirectories();
    
    for (const directory of templateDirectories) {
      await this.generateTemplatesForDirectory(directory);
    }
  }

  async getTemplateDirectories() {
    const basePath = 'automation/templates/games/task';
    const directories = [
      '01-project-setup',
      '02-core-engine',
      '03-frontend-ui',
      '04-assets-pipeline',
      '05-data-persistence',
      '06-multiplayer-networking',
      '07-feature-development',
      '08-testing',
      '09-deployment-distribution',
      '10-monitoring-analytics',
      '11-genre-specific'
    ];
    
    return directories.map(dir => path.join(basePath, dir));
  }

  async generateTemplatesForDirectory(directoryPath) {
    const subdirectories = await this.getSubdirectories(directoryPath);
    
    for (const subdirectory of subdirectories) {
      await this.generateTemplateForTask(subdirectory);
    }
  }

  async getSubdirectories(directoryPath) {
    try {
      const items = await fs.promises.readdir(directoryPath, { withFileTypes: true });
      return items
        .filter(item => item.isDirectory())
        .map(item => path.join(directoryPath, item.name));
    } catch (error) {
      console.error(`Error reading directory ${directoryPath}:`, error);
      return [];
    }
  }

  async generateTemplateForTask(taskDirectory) {
    const taskContext = this.extractTaskContext(taskDirectory);
    
    // Generate index.md
    await this.generateIndexFile(taskDirectory, taskContext);
    
    // Generate implementation.md
    await this.generateImplementationFile(taskDirectory, taskContext);
    
    // Generate phases.md
    await this.generatePhasesFile(taskDirectory, taskContext);
  }

  extractTaskContext(taskDirectory) {
    const pathParts = taskDirectory.split(path.sep);
    const taskFolder = pathParts[pathParts.length - 1];
    const categoryFolder = pathParts[pathParts.length - 2];
    
    // Extract task ID and name from folder name
    const taskMatch = taskFolder.match(/^(\d+)-(.+)$/);
    const categoryMatch = categoryFolder.match(/^(\d+)-(.+)$/);
    
    return {
      taskId: taskMatch ? `${categoryMatch?.[1]}.${taskMatch[1]}` : '1.1',
      taskName: taskMatch ? taskMatch[2].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Task Name',
      category: categoryMatch ? categoryMatch[2].replace(/-/g, '-') : 'project-setup',
      categoryId: categoryMatch ? categoryMatch[1] : '01',
      taskNumber: taskMatch ? taskMatch[1] : '01',
      estimatedTime: this.estimateTaskTime(categoryMatch?.[2], taskMatch?.[2]),
      dependencies: this.generateDependencies(categoryMatch?.[1], taskMatch?.[1]),
      taskType: this.determineTaskType(categoryMatch?.[2])
    };
  }

  estimateTaskTime(category, taskName) {
    // Estimate time based on category and task complexity
    const categoryTimes = {
      'project-setup': '1-2h',
      'core-engine': '4-8h',
      'frontend-ui': '2-4h',
      'assets-pipeline': '3-6h',
      'data-persistence': '2-4h',
      'multiplayer-networking': '6-12h',
      'feature-development': '4-8h',
      'testing': '2-4h',
      'deployment-distribution': '2-4h',
      'monitoring-analytics': '3-6h',
      'genre-specific': '4-8h'
    };
    
    return categoryTimes[category] || '2h';
  }

  generateDependencies(categoryId, taskNumber) {
    // Generate dependencies based on task order
    if (taskNumber === '01') {
      return 'None';
    }
    
    const prevTaskNumber = String(parseInt(taskNumber) - 1).padStart(2, '0');
    return `${categoryId}.${prevTaskNumber} (Previous Task)`;
  }

  determineTaskType(category) {
    const typeMap = {
      'project-setup': 'standard-template',
      'core-engine': 'engine-specific',
      'frontend-ui': 'ui-template',
      'assets-pipeline': 'pipeline-template',
      'data-persistence': 'data-template',
      'multiplayer-networking': 'network-template',
      'feature-development': 'feature-template',
      'testing': 'test-template',
      'deployment-distribution': 'deployment-template',
      'monitoring-analytics': 'monitoring-template',
      'genre-specific': 'genre-specific'
    };
    
    return typeMap[category] || 'standard-template';
  }

  async generateIndexFile(taskDirectory, taskContext) {
    const templatePath = 'automation/templates/games/task/template-task-index.md';
    const outputPath = path.join(taskDirectory, 'index.md');
    
    try {
      const templateContent = await fs.promises.readFile(templatePath, 'utf8');
      const resolvedContent = this.placeholderResolver.resolveAllPlaceholders(templateContent);
      
      // Update task context with resolved values
      const updatedContext = { ...taskContext };
      updatedContext.taskName = this.extractTaskNameFromContent(resolvedContent);
      updatedContext.estimatedTime = this.extractTimeFromContent(resolvedContent);
      
      await fs.promises.writeFile(outputPath, resolvedContent, 'utf8');
      console.log(`Generated index.md for ${taskDirectory}`);
    } catch (error) {
      console.error(`Error generating index.md for ${taskDirectory}:`, error);
    }
  }

  async generateImplementationFile(taskDirectory, taskContext) {
    const outputPath = path.join(taskDirectory, 'implementation.md');
    
    try {
      const content = this.generateImplementationContent(taskContext);
      await fs.promises.writeFile(outputPath, content, 'utf8');
      console.log(`Generated implementation.md for ${taskDirectory}`);
    } catch (error) {
      console.error(`Error generating implementation.md for ${taskDirectory}:`, error);
    }
  }

  async generatePhasesFile(taskDirectory, taskContext) {
    const outputPath = path.join(taskDirectory, 'phases.md');
    
    try {
      const content = this.generatePhasesContent(taskContext);
      await fs.promises.writeFile(outputPath, content, 'utf8');
      console.log(`Generated phases.md for ${taskDirectory}`);
    } catch (error) {
      console.error(`Error generating phases.md for ${taskDirectory}:`, error);
    }
  }

  generateImplementationContent(taskContext) {
    return `# Implementation Guide: ${taskContext.taskName}

## Overview
This document provides detailed implementation guidance for ${taskContext.taskName}.

## Prerequisites
- Complete dependencies: ${taskContext.dependencies}
- Required tools: ${this.gameConfig.gameEngine} development environment
- Estimated time: ${taskContext.estimatedTime}

## Technical Approach
1. **Analysis**: Understand requirements and constraints
2. **Design**: Create implementation plan
3. **Development**: Implement core functionality
4. **Testing**: Validate implementation
5. **Integration**: Connect with other systems

## Implementation Details
[Detailed implementation steps will be generated based on task context]

## Testing Strategy
- Unit tests for core functionality
- Integration tests for system interactions
- Performance tests for critical paths

## Success Criteria
- All requirements implemented
- Tests pass successfully
- Documentation updated
- Code follows standards

---
*Generated: ${new Date().toISOString()}*
`;
  }

  generatePhasesContent(taskContext) {
    return `# Phase Breakdown: ${taskContext.taskName}

## Phase Overview
This task is broken down into three main phases for efficient implementation.

## Phase 1: Foundation Setup
**Duration**: ${this.calculatePhaseTime(taskContext.estimatedTime, 1)}
**Objective**: Set up basic infrastructure and dependencies

### Tasks
1. [ ] Analyze requirements
2. [ ] Set up development environment
3. [ ] Create basic structure

## Phase 2: Core Implementation
**Duration**: ${this.calculatePhaseTime(taskContext.estimatedTime, 2)}
**Objective**: Implement main functionality

### Tasks
1. [ ] Implement core features
2. [ ] Add error handling
3. [ ] Create tests

## Phase 3: Integration & Testing
**Duration**: ${this.calculatePhaseTime(taskContext.estimatedTime, 3)}
**Objective**: Integrate with other systems and validate

### Tasks
1. [ ] Integrate with existing systems
2. [ ] Perform comprehensive testing
3. [ ] Update documentation

## Progress Tracking
- **Overall Progress**: 0%
- **Current Phase**: 1
- **Next Milestone**: Phase 1 completion

---
*Generated: ${new Date().toISOString()}*
`;
  }

  calculatePhaseTime(totalTime, phaseNumber) {
    // Simple time distribution: 30% | 50% | 20%
    const phasePercentages = [0.3, 0.5, 0.2];
    const totalHours = this.parseTimeToHours(totalTime);
    const phaseHours = totalHours * phasePercentages[phaseNumber - 1];
    return `${Math.round(phaseHours * 10) / 10}h`;
  }

  parseTimeToHours(timeString) {
    const match = timeString.match(/(\d+(?:\.\d+)?)h/);
    return match ? parseFloat(match[1]) : 2;
  }

  extractTaskNameFromContent(content) {
    const match = content.match(/# Task [\d.]+: (.+)/);
    return match ? match[1] : 'Task Name';
  }

  extractTimeFromContent(content) {
    const match = content.match(/- \*\*Time\*\*: (.+)/);
    return match ? match[1] : '2h';
  }
}
```

## Files to Create/Modify

### New Files to Create:
- [ ] `automation/templates/games/task/placeholder-system.js` - Unified placeholder system
- [ ] `automation/templates/games/task/validation-rules.md` - Template validation rules
- [ ] `automation/ai/prompts/shared/template-adapter.js` - Template processing engine
- [ ] `automation/ai/prompts/shared/placeholder-resolver.js` - Placeholder resolution
- [ ] `automation/ai/prompts/shared/template-generator.js` - Template generation system

### Files to Modify:
- [ ] `automation/templates/games/task/template-task-index.md` - Enhanced with more placeholders
- [ ] `automation/templates/games/task/README.md` - Add AI integration section
- [ ] `automation/ai/prompts/shared/task-create.js` - Integrate template processing
- [ ] `automation/ai/prompts/gaming/orchestrator-planning.js` - Add template awareness

### Files to Generate:
- [ ] `automation/templates/games/task/*/index.md` - 108 task index files
- [ ] `automation/templates/games/task/*/implementation.md` - 108 implementation files
- [ ] `automation/templates/games/task/*/phases.md` - 108 phase files

## Success Criteria
- [ ] All 110+ task templates are filled with comprehensive content
- [ ] AI can automatically adapt templates for any game genre and engine
- [ ] Template processing system handles all placeholder resolution
- [ ] Task generation is fully automated and consistent
- [ ] Templates follow unified standards and validation rules
- [ ] AI prompts integrate seamlessly with template system

## Technology Considerations
- **Framework**: Node.js with ES6 modules
- **Library**: File system operations, path manipulation
- **Tools**: Template processing, AI integration

## Notes
This implementation will create a comprehensive template system that enables the AI to automatically generate detailed, project-specific task files for any game development project. The system will be extensible for different genres, engines, and technology stacks.

---
*Implementation Plan: Task Templates AI Adaptation System* 