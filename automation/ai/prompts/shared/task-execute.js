export function generateExecutionPrompt(task, taskDetails) {
    return `# Cursor Automation CDP Task Execution

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

## Important Notes
- Implement complete functionality, not stubs
- Follow the existing code patterns and conventions
- Ensure all code is production-ready
- Add proper error handling and validation
- Update all relevant documentation files`;
}
