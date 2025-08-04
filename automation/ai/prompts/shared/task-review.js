export function generateTaskReviewPrompt(task, implementation, codebase) {
    return `# Task Review Request

## Task Information
- **Task Name**: ${task.name}
- **Category**: ${task.category}
- **Status**: ${task.status}
- **Progress**: ${task.progress}

## Implementation Details
${implementation}

## Codebase Context
${codebase}

## Review Request
Please review this task implementation and provide:

1. **Code Quality Assessment**
   - Evaluate code structure and organization
   - Check for best practices adherence
   - Identify potential improvements

2. **Functionality Validation**
   - Verify all requirements are met
   - Test edge cases and error handling
   - Validate integration with existing code

3. **Performance Analysis**
   - Assess performance implications
   - Identify potential bottlenecks
   - Suggest optimizations

4. **Security Review**
   - Check for security vulnerabilities
   - Validate input handling
   - Review authentication/authorization

5. **Documentation Review**
   - Verify documentation completeness
   - Check code comments quality
   - Validate API documentation

## Important Notes
- Be thorough and objective in your review
- Provide specific, actionable feedback
- Consider both technical and business requirements
- Focus on maintainability and scalability
- Ensure security best practices are followed
- Validate that the implementation meets all requirements`;
}
