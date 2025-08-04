export function generateIssueAnalysisPrompt(error, context, codebase) {
    return `# Issue Analysis Request

## Error Information
${error}

## Context
${context}

## Codebase Information
${codebase}

## Analysis Request
Please analyze this issue and provide:

1. **Root Cause Analysis**
   - Identify the primary cause of the error
   - Determine if it's a code issue, configuration problem, or external dependency
   - Check for common patterns or known issues

2. **Impact Assessment**
   - Determine the scope of the issue
   - Identify affected components or functionality
   - Assess severity and urgency

3. **Solution Recommendations**
   - Provide specific code fixes or configuration changes
   - Suggest alternative approaches if applicable
   - Recommend preventive measures

4. **Debugging Steps**
   - Outline specific steps to reproduce and verify the fix
   - Suggest additional logging or debugging tools
   - Provide validation criteria

## Important Notes
- Be thorough in your analysis
- Provide specific, actionable solutions
- Consider the broader codebase context
- Suggest both immediate fixes and long-term improvements
- Include validation steps to ensure the fix works`;
}
