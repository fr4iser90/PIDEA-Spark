// Prompt generation function (extracted from automation-workflow-cdp.js)
export function generateExecutionPrompt(task, taskDetails) {
    return `# VibeFighters Task Execution

## Task Information
- **ID**: ${task.id}
- **Name**: ${task.name}
- **Category**: ${task.category}
- **Estimated Time**: ${task.time}
- **Current Status**: ${task.status}
- **Progress**: ${task.progress}

## Task Details
${taskDetails}

## Instructions
Please execute this task completely by:

1. **Analyzing the current codebase** and understanding the existing structure update Orchestrator to show correct progress
2. **Implementing all required functionality** according to the task specifications
3. **Creating/modifying all necessary files** with proper code structure
4. **Adding comprehensive tests** for all new functionality
5. **Updating documentation** to reflect the changes
6. **Validating the implementation** against the requirements

## Response Format
Please respond with:

\`\`\`json
{
  "status": "completed|failed|partial",
  "files_created": ["file1.js", "file2.js"],
  "files_modified": ["existing.js"],
  "tests_added": ["test1.test.js"],
  "documentation_updated": ["README.md"],
  "validation_passed": true,
  "next_steps": "What should be done next",
  "estimated_completion_time": "2h",
  "dependencies_resolved": true
}
\`\`\`

## Important Notes
- Implement complete functionality, not stubs
- Follow the existing code patterns and conventions
- Ensure all code is production-ready
- Add proper error handling and validation
- Update all relevant documentation files`;
}

// NEW: Review prompt for initial analysis and orchestrator update
export function generateReviewPrompt(taskQueue, completedTasks, failedTasks) {
    const completedTaskIds = completedTasks.map(t => t.id);
    const failedTaskIds = failedTasks.map(t => t.id);
    const pendingTaskIds = taskQueue.filter(t => 
        !completedTaskIds.includes(t.id) && !failedTaskIds.includes(t.id)
    ).map(t => t.id);

    return `# VibeFighters Project Review & Orchestrator Update

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

Please perform a comprehensive review of the VibeFighters project and update the orchestrator:

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

## Response Format

Please respond with:

\`\`\`json
{
  "review_status": "completed|issues_found|requires_manual_intervention",
  "orchestrator_updates": {
    "tasks_to_update": [
      {
        "task_id": 1,
        "current_status": "pending",
        "new_status": "completed",
        "reason": "Implementation found in codebase"
      }
    ],
    "progress_corrections": [
      {
        "category": "game-engine",
        "current_progress": "25%",
        "corrected_progress": "40%",
        "reason": "Core engine components already implemented"
      }
    ]
  },
  "critical_issues": [
    {
      "type": "missing_dependency|circular_dependency|incomplete_implementation",
      "description": "Detailed description of the issue",
      "affected_tasks": [1, 2, 3],
      "recommended_action": "What needs to be done"
    }
  ],
  "recommendations": [
    "Specific recommendations for next steps",
    "Tasks that should be prioritized",
    "Any manual interventions needed"
  ],
  "can_proceed_with_automation": true,
  "next_review_needed": false
}
\`\`\`

## Important Notes
- Be thorough in your analysis
- Don't assume tasks are complete just because they're marked as such
- Look for actual implementation evidence in the codebase
- **DIRECTLY UPDATE THE ORCHESTRATOR FILES** - modify the markdown files to reflect the true state
- Update task statuses, progress indicators, and dependencies in the actual files
- Provide specific, actionable recommendations
- The orchestrator should reflect the true state of the project after your updates`;
} 