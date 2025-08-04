import fs from 'fs';
import path from 'path';

export function generateWebAppComprehensiveTaskCreationPrompt(orchestratorPath, appConfig) {
    return `# Web Application Comprehensive Task Creation Request

## Orchestrator File
Please read and analyze the orchestrator file at: ${orchestratorPath}

## Application Configuration
- **Application Type**: ${appConfig.appType}
- **Category**: ${appConfig.primaryCategory}
- **Core Features**: ${appConfig.coreFeatures}
- **User Authentication**: ${appConfig.features.authentication ? 'Yes' : 'No'}
- **Database**: ${appConfig.features.database ? 'Yes' : 'No'}
- **Real-time Features**: ${appConfig.features.realtime ? 'Yes' : 'No'}
- **File Upload**: ${appConfig.features.fileUpload ? 'Yes' : 'No'}
- **API Integration**: ${appConfig.features.apiIntegration ? 'Yes' : 'No'}

## Request
Please create detailed implementation files for ALL tasks in the orchestrator:

1. **Read the orchestrator file** and extract all tasks
2. **For each task**, create detailed implementation files:
   - Task index with overview and requirements
   - Implementation plan with technical details
   - Three-phase breakdown (Foundation, Core, Integration)
   - Success criteria and validation methods
   - Dependencies and prerequisites
   - Estimated time and resources

3. **Update the orchestrator file** with:
   - Correct progress indicators
   - Validated dependencies
   - Updated time estimates
   - Task status validation

4. **Create task directories** for each task with proper structure

## Important Instructions
- Process ALL tasks from the orchestrator
- Create comprehensive, actionable content for each task
- Follow the existing code patterns and conventions
- Ensure all dependencies are correctly mapped
- Update the orchestrator file directly with progress and validation
- Make all content production-ready with proper error handling
- Add proper documentation and testing requirements for each task

## File Structure
For each task, create directories following the template structure:
- \`tasks/[category-id]-[category-name]/[task-id]-[task-name]/index.md\` - Task overview and requirements
- \`tasks/[category-id]-[category-name]/[task-id]-[task-name]/implementation.md\` - Technical implementation plan
- \`tasks/[category-id]-[category-name]/[task-id]-[task-name]/phases.md\` - Three-phase breakdown
- \`tasks/[category-id]-[category-name]/[task-id]-[task-name]/validation.md\` - Success criteria and testing

**NAMING CONVENTIONS:**
- **Task IDs in orchestrator**: Use dots (1.1, 1.2, 2.1, etc.)
- **Directory names**: Use dashes (01-project-setup, 01-git-repository-branching)
- **Category names**: Use dashes (project-setup, frontend, backend)

**DIRECTLY UPDATE THE ORCHESTRATOR FILE** with progress and validation results.`;
}

export function generateWebAppContinueTaskCreationPrompt(missingTasks, orchestratorPath, projectPath) {
    const tasksDir = path.join(projectPath, 'tasks');
    const createdTasks = fs.existsSync(tasksDir) ? 
        fs.readdirSync(tasksDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name).length : 0;
    
    return `# Web Application Continue Task Creation - Remaining Tasks

## Status Update
- **Total Tasks Required**: ${missingTasks + createdTasks}
- **Tasks Already Created**: ${createdTasks}
- **Tasks Still Missing**: ${missingTasks}

## Orchestrator File
Please read the orchestrator file at: ${orchestratorPath}

## Request
Please create the remaining ${missingTasks} task files that are still missing:

1. **Check which tasks are missing** by comparing orchestrator tasks with existing task directories
2. **Create only the missing task files** with proper structure:
   - Task index with overview and requirements
   - Implementation plan with technical details
   - Three-phase breakdown (Foundation, Core, Integration)
   - Success criteria and validation methods

3. **Update the orchestrator file** with:
   - Correct progress indicators
   - Updated task status
   - Validation results

## File Structure
For each task, create directories following the template structure:
- \`tasks/[category-id]-[category-name]/[task-id]-[task-name]/index.md\` - Task overview and requirements
- \`tasks/[category-id]-[category-name]/[task-id]-[task-name]/implementation.md\` - Technical implementation plan
- \`tasks/[category-id]-[category-name]/[task-id]-[task-name]/phases.md\` - Three-phase breakdown
- \`tasks/[category-id]-[category-name]/[task-id]-[task-name]/validation.md\` - Success criteria and testing

**NAMING CONVENTIONS:**
- **Task IDs in orchestrator**: Use dots (1.1, 1.2, 2.1, etc.)
- **Directory names**: Use dashes (01-project-setup, 01-git-repository-branching)
- **Category names**: Use dashes (project-setup, frontend, backend)

## Important Instructions
- Focus ONLY on the missing tasks
- Don't recreate existing task files
- Ensure all ${missingTasks} missing tasks are created
- Update orchestrator progress to show 100% completion
- Make all content production-ready

**CRITICAL**: Complete the remaining task creation to reach 100% completion.`;
}
