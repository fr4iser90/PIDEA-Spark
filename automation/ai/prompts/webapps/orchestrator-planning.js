import fs from 'fs';
import path from 'path';

export function generateWebAppComprehensiveTaskCreationPrompt(orchestratorPath, appConfig) {
    return `# Web Application Single Task Creation Request

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
**IMPORTANT: Work on ONLY ONE task at a time!**

1. **Find the FIRST incomplete task** in the orchestrator that needs work
2. **Focus ONLY on that single task** - do not touch any other tasks
3. **Create detailed implementation files for ONLY that one task**:
   - Task index with overview and requirements
   - Implementation plan with technical details
   - Three-phase breakdown (Foundation, Core, Integration)
   - Success criteria and validation methods
   - Dependencies and prerequisites
   - Estimated time and resources

4. **Update ONLY that task's status** in the orchestrator file

## Critical Instructions
- **ONLY work on ONE task** - ignore all other tasks
- **Do NOT create scripts or batch operations**
- **Do NOT try to process multiple tasks**
- **Focus on quality over quantity**
- **Make the single task production-ready**
- **Update only the specific task's progress in orchestrator**

## File Structure for Single Task
For the ONE task you're working on, create:
- \`tasks/[category-id]-[category-name]/[task-id]-[task-name]/index.md\` - Task overview
- \`tasks/[category-id]-[category-name]/[task-id]-[task-name]/implementation.md\` - Implementation plan
- \`tasks/[category-id]-[category-name]/[task-id]-[task-name]/phase-1.md\` - Foundation phase
- \`tasks/[category-id]-[category-name]/[task-id]-[task-name]/phase-2.md\` - Core phase
- \`tasks/[category-id]-[category-name]/[task-id]-[task-name]/phase-3.md\` - Integration phase

## Task Selection Priority
1. **First priority**: Tasks with missing files
2. **Second priority**: Tasks with placeholder content
3. **Third priority**: Tasks marked as "Ready" but not started

**REMEMBER: Only ONE task per chat session!**`;
}

export function generateWebAppContinueTaskCreationPrompt(missingTasks, orchestratorPath, projectPath) {
    const tasksDir = path.join(projectPath, 'tasks');
    const createdTasks = fs.existsSync(tasksDir) ? 
        fs.readdirSync(tasksDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name).length : 0;
    
    return `# Web Application Continue Task Creation - Single Task Focus

## Status Update
- **Total Tasks Required**: ${missingTasks + createdTasks}
- **Tasks Already Created**: ${createdTasks}
- **Tasks Still Missing**: ${missingTasks}

## Orchestrator File
Please read the orchestrator file at: ${orchestratorPath}

## Request
**IMPORTANT: Work on ONLY ONE task at a time!**

1. **Find the NEXT incomplete task** that needs work
2. **Focus ONLY on that single task** - do not touch any other tasks
3. **Create detailed implementation files for ONLY that one task**:
   - Task index with overview and requirements
   - Implementation plan with technical details
   - Three-phase breakdown (Foundation, Core, Integration)
   - Success criteria and validation methods

4. **Update ONLY that task's status** in the orchestrator file

## Critical Instructions
- **ONLY work on ONE task** - ignore all other tasks
- **Do NOT create scripts or batch operations**
- **Do NOT try to process multiple tasks**
- **Focus on quality over quantity**
- **Make the single task production-ready**
- **Update only the specific task's progress in orchestrator**

## Task Selection Priority
1. **First priority**: Tasks with missing files
2. **Second priority**: Tasks with placeholder content
3. **Third priority**: Tasks marked as "Ready" but not started

**REMEMBER: Only ONE task per chat session!**`;
}
