export function generateIssueExecutionPrompt(issue, solution, codebase) {
    return `# Issue Fix Execution Request

## Issue Summary
${issue}

## Proposed Solution
${solution}

## Codebase Context
${codebase}

## Execution Instructions
Please implement the proposed fix by:

1. **Apply the Solution**
   - Make the necessary code changes
   - Update configuration files if needed
   - Implement any required error handling

2. **Validate the Fix**
   - Test the specific functionality that was broken
   - Ensure no regressions in related components
   - Verify the fix addresses the root cause

3. **Add Preventive Measures**
   - Implement suggested error handling
   - Add validation where appropriate
   - Include logging for future debugging

4. **Update Documentation**
   - Document the fix and its rationale
   - Update any relevant configuration documentation
   - Add notes for future maintenance

## Important Notes
- Implement the fix exactly as specified in the solution
- Ensure the fix is complete and addresses the root cause
- Test thoroughly to prevent regressions
- Add appropriate error handling and validation
- Document the changes for future reference
- Consider the broader impact on the codebase`;
}
