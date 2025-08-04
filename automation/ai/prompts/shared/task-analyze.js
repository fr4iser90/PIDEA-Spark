export function generateTaskAnalysisPrompt(task, codebase) {
    return `# Task Analysis Request

## Task Information
- **Task Name**: ${task.name}
- **Category**: ${task.category}
- **Status**: ${task.status}
- **Progress**: ${task.progress}
- **Dependencies**: ${task.dependencies}
- **Estimated Time**: ${task.time}

## Codebase Context
${codebase}

## Analysis Request
Please analyze this task and provide:

1. **Task Complexity Assessment**
   - Evaluate the technical complexity
   - Identify potential challenges
   - Assess resource requirements

2. **Dependency Analysis**
   - Verify all dependencies are satisfied
   - Identify any missing prerequisites
   - Check for circular dependencies

3. **Implementation Strategy**
   - Recommend the best approach
   - Identify potential risks
   - Suggest alternative solutions

4. **Resource Requirements**
   - Estimate actual time needed
   - Identify required skills
   - List necessary tools/libraries

## Important Notes
- Be thorough in your analysis
- Consider the broader codebase context
- Provide actionable recommendations
- Assess both technical and business risks
- Consider maintainability and scalability`;
}
