# Prompt Organization

This directory contains all the prompt functions organized by category and functionality.

## Directory Structure

```
prompts/
├── debugging/           # Debugging and issue resolution prompts
├── gaming/             # Game development specific prompts
├── shared/             # Shared prompts used across different project types
├── webapps/            # Web application development prompts
└── README.md           # This documentation file
```

## Categories

### Debugging (`debugging/`)
Prompts for analyzing and resolving issues in the codebase.

- **`issue-analysis.js`** - `generateIssueAnalysisPrompt()` - Analyze issues and provide root cause analysis
- **`issue-execution.js`** - `generateIssueExecutionPrompt()` - Execute fixes for identified issues
- **`issue-planning.js`** - `generateIssuePlanningPrompt()` - Plan issue resolution strategies

### Gaming (`gaming/`)
Prompts specifically for game development projects.

- **`game-idea-analysis.js`** - `generateGameIdeaAnalysisPrompt()` - Analyze game ideas and requirements
- **`game-planning.js`** - `generatePlanningPrompt()` - Create game development plans
- **`orchestrator-planning.js`** - `generateComprehensiveTaskCreationPrompt()`, `generateContinueTaskCreationPrompt()` - Create and manage game development tasks
- **`orchestrator-validation.js`** - `generateOrchestratorValidationPrompt()` - Validate and update game orchestrator files
- **`orchestrator-review.js`** - `generateReviewPrompt()` - Review game project progress and update orchestrator

### Shared (`shared/`)
Prompts that can be used across different project types.

- **`task-create.js`** - `generateTaskCreationPrompt()` - Create individual tasks
- **`task-execute.js`** - `generateExecutionPrompt()` - Execute specific tasks
- **`task-analyze.js`** - `generateTaskAnalysisPrompt()` - Analyze task complexity and requirements
- **`task-review.js`** - `generateTaskReviewPrompt()` - Review completed task implementations

### Web Applications (`webapps/`)
Prompts specifically for web application development.

- **`app-idea-analysis.js`** - `generateWebAppIdeaAnalysisPrompt()` - Analyze web app ideas and requirements
- **`app-planning.js`** - `generateWebAppPlanningPrompt()` - Create web app development plans
- **`orchestrator-planning.js`** - `generateWebAppComprehensiveTaskCreationPrompt()`, `generateWebAppContinueTaskCreationPrompt()` - Create and manage web app development tasks
- **`orchestrator-validation.js`** - `generateWebAppOrchestratorValidationPrompt()` - Validate and update web app orchestrator files
- **`orchestrator-review.js`** - `generateWebAppReviewPrompt()` - Review web app project progress and update orchestrator

## Usage

All prompts are imported and re-exported from the main `prompts.js` file for backward compatibility. You can import them directly from the main file:

```javascript
import { 
    generateGameIdeaAnalysisPrompt,
    generateExecutionPrompt,
    generateIssueAnalysisPrompt 
} from './prompts.js';
```

Or import them directly from their respective files:

```javascript
import { generateGameIdeaAnalysisPrompt } from './prompts/gaming/game-idea-analysis.js';
import { generateExecutionPrompt } from './prompts/shared/task-execute.js';
```

## Adding New Prompts

When adding new prompts:

1. **Choose the appropriate category** based on the prompt's purpose
2. **Create a new file** in the relevant directory with a descriptive name
3. **Export the function** with a clear, descriptive name
4. **Update the main `prompts.js`** file to import and re-export the new function
5. **Update this README** to document the new prompt

## Naming Conventions

- **File names**: Use kebab-case (e.g., `game-idea-analysis.js`)
- **Function names**: Use camelCase with descriptive prefixes (e.g., `generateGameIdeaAnalysisPrompt`)
- **Directory names**: Use kebab-case and be descriptive (e.g., `gaming`, `webapps`)

## Response Formats

All prompts are designed to return structured JSON responses that can be easily parsed and processed by the automation system. Each prompt includes:

- Clear instructions for the AI
- Specific response format requirements
- Important notes and considerations
- Validation criteria where applicable 