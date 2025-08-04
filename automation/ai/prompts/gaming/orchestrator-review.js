export function generateReviewPrompt(taskQueue, completedTasks, failedTasks) {
    const completedTaskIds = completedTasks.map(t => t.id);
    const failedTaskIds = failedTasks.map(t => t.id);
    const pendingTaskIds = taskQueue.filter(t => 
        !completedTaskIds.includes(t.id) && !failedTaskIds.includes(t.id)
    ).map(t => t.id);

    return `# Cursor Automation CDP Project Review & Orchestrator Update

## Current Project State Analysis

### Task Queue Overview
- **Total Tasks**: ${taskQueue.length}
- **Completed Tasks**: ${completedTasks.length} (IDs: ${completedTaskIds.join(', ') || 'none'})
- **Failed Tasks**: ${failedTasks.length} (IDs: ${failedTaskIds.join(', ') || 'none'})
- **Pending Tasks**: ${pendingTaskIds.length} (IDs: ${pendingTaskIds.join(', ') || 'none'})

### Task Details
${taskQueue.map(task => `
**Task ${task.id}**: ${task.name}
- Category: ${task.category}
- Status: ${task.status}
- Progress: ${task.progress}
- Dependencies: ${task.dependencies}
- Estimated Time: ${task.time}
`).join('\n')}

## Review Instructions

Please perform a comprehensive review of the Cursor Automation CDP project and update the orchestrator:

1. **Analyze Current Codebase State**
   - Review existing implementations
   - Check for completed vs incomplete features
   - Identify any inconsistencies or missing components

2. **Validate Task Dependencies**
   - Verify that completed tasks actually satisfy their dependencies
   - Identify any circular dependencies or missing prerequisites
   - Update task status based on actual implementation state

3. **Update Orchestrator Progress**
   - Correct any inaccurate progress indicators
   - Update task statuses based on actual codebase state
   - Ensure dependency relationships are accurate
   - **DIRECTLY UPDATE THE FILES** - don't just report, actually modify the orchestrator files

4. **Identify Critical Issues**
   - Find any blocking issues that prevent task execution
   - Identify missing infrastructure or setup requirements
   - Flag any tasks that need manual intervention

## Important Notes
- Be thorough in your analysis
- Don't assume tasks are complete just because they're marked as such
- Look for actual implementation evidence in the codebase
- **DIRECTLY UPDATE THE ORCHESTRATOR FILES** - modify the markdown files to reflect the true state
- Update task statuses, progress indicators, and dependencies in the actual files
- Provide specific, actionable recommendations
- The orchestrator should reflect the true state of the project after your updates`;
}
