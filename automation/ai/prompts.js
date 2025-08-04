import fs from 'fs';
import path from 'path';

// Import all prompt functions from their respective directories
import { generateGameIdeaAnalysisPrompt } from './prompts/gaming/game-idea-analysis.js';
import { generatePlanningPrompt } from './prompts/gaming/game-planning.js';
import { generateComprehensiveTaskCreationPrompt, generateContinueTaskCreationPrompt } from './prompts/gaming/orchestrator-planning.js';
import { generateOrchestratorValidationPrompt } from './prompts/gaming/orchestrator-validation.js';
import { generateReviewPrompt } from './prompts/gaming/orchestrator-review.js';

import { generateTaskCreationPrompt } from './prompts/shared/task-create.js';
import { generateExecutionPrompt } from './prompts/shared/task-execute.js';
import { generateTaskAnalysisPrompt } from './prompts/shared/task-analyze.js';
import { generateTaskReviewPrompt } from './prompts/shared/task-review.js';

import { generateWebAppIdeaAnalysisPrompt } from './prompts/webapps/app-idea-analysis.js';
import { generateWebAppPlanningPrompt } from './prompts/webapps/app-planning.js';
import { generateWebAppComprehensiveTaskCreationPrompt, generateWebAppContinueTaskCreationPrompt } from './prompts/webapps/orchestrator-planning.js';
import { generateWebAppOrchestratorValidationPrompt } from './prompts/webapps/orchestrator-validation.js';
import { generateWebAppReviewPrompt } from './prompts/webapps/orchestrator-review.js';

import { generateIssueAnalysisPrompt } from './prompts/debugging/issue-analysis.js';
import { generateIssueExecutionPrompt } from './prompts/debugging/issue-execution.js';
import { generateIssuePlanningPrompt } from './prompts/debugging/issue-planning.js';

// Re-export all prompt functions for backward compatibility
export {
    // Gaming prompts
    generateGameIdeaAnalysisPrompt,
    generatePlanningPrompt,
    generateComprehensiveTaskCreationPrompt,
    generateContinueTaskCreationPrompt,
    generateOrchestratorValidationPrompt,
    generateReviewPrompt,
    
    // Shared task prompts
    generateTaskCreationPrompt,
    generateExecutionPrompt,
    generateTaskAnalysisPrompt,
    generateTaskReviewPrompt,
    
    // Webapp prompts
    generateWebAppIdeaAnalysisPrompt,
    generateWebAppPlanningPrompt,
    generateWebAppComprehensiveTaskCreationPrompt,
    generateWebAppContinueTaskCreationPrompt,
    generateWebAppOrchestratorValidationPrompt,
    generateWebAppReviewPrompt,
    
    // Debugging prompts
    generateIssueAnalysisPrompt,
    generateIssueExecutionPrompt,
    generateIssuePlanningPrompt
}; 