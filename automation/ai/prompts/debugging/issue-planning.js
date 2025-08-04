export function generateIssuePlanningPrompt(issue, codebase) {
    return `# Issue Resolution Planning Request

## Issue Description
${issue}

## Codebase Context
${codebase}

## Planning Request
Please create a comprehensive plan to resolve this issue including:

1. **Issue Analysis**
   - Identify the root cause and contributing factors
   - Assess the scope and impact
   - Determine urgency and priority

2. **Solution Strategy**
   - Propose multiple solution approaches
   - Evaluate trade-offs between different solutions
   - Recommend the optimal approach

3. **Implementation Plan**
   - Break down the solution into specific steps
   - Identify required changes and files
   - Estimate time and resources needed

4. **Testing Strategy**
   - Define validation criteria
   - Plan regression testing
   - Identify potential risks

5. **Prevention Measures**
   - Suggest ways to prevent similar issues
   - Recommend monitoring and alerting
   - Propose process improvements

## Important Notes
- Consider the broader system impact
- Evaluate both immediate fixes and long-term solutions
- Include risk assessment and mitigation strategies
- Provide clear success criteria
- Consider maintenance and future-proofing`;
}
