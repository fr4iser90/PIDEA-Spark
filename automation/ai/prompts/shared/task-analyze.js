export function generateTaskAnalysisPrompt(task, codebase) {
    return `# Project-Wide Gap Analysis & Missing Components

## Goal
Generate a comprehensive analysis of what's missing, incomplete, or needs improvement across the entire project. Create actionable insights for project-wide improvements that can be used for AI auto-implementation, tracking, and execution.

**Note**: This prompt focuses on project-wide analysis, not individual task validation. For task-specific validation, use \`task-review.md\`.

Create new [Name]-analysis.md in pidea-spark-output/tasks/[category]/[name]/ with the following structure:
**Note**: The system automatically creates a hierarchical folder structure: Category → Task Name → Analysis files

## Task Information
- **Task Name**: ${task.name}
- **Category**: ${task.category}
- **Status**: ${task.status}
- **Progress**: ${task.progress}
- **Dependencies**: ${task.dependencies}
- **Estimated Time**: ${task.time}

## Codebase Context
${codebase}

## Template Structure

### 1. Analysis Overview
- **Analysis Name**: [Exact name for the analysis]
- **Analysis Type**: [Gap Analysis/Code Review/Architecture Review/Performance Audit/Security Audit/Feature Completeness]
- **Priority**: [High/Medium/Low]
- **Estimated Analysis Time**: [X hours/days]
- **Scope**: [What areas are being analyzed]
- **Related Components**: [List components being analyzed]
- **Analysis Date**: [RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"]

### 2. Current State Assessment
- **Codebase Health**: [Overall assessment]
- **Architecture Status**: [Current architectural state]
- **Test Coverage**: [Current test coverage percentage]
- **Documentation Status**: [Documentation completeness]
- **Performance Metrics**: [Current performance indicators]
- **Security Posture**: [Current security assessment]

### 3. Gap Analysis Results

#### Critical Gaps (High Priority):
- [ ] **Missing Component**: [Component name] - [Impact description]
  - **Location**: \`path/to/missing/file.js\`
  - **Required Functionality**: [What it should do]
  - **Dependencies**: [What it depends on]
  - **Estimated Effort**: [X hours]

- [ ] **Incomplete Implementation**: [Component name] - [What's missing]
  - **Current State**: [What exists]
  - **Missing Parts**: [What needs to be added]
  - **Files Affected**: \`path/to/file.js\`, \`path/to/file.jsx\`
  - **Estimated Effort**: [X hours]

#### Medium Priority Gaps:
- [ ] **Improvement Needed**: [Component name] - [Improvement description]
  - **Current Issues**: [What's wrong]
  - **Proposed Solution**: [How to fix]
  - **Files to Modify**: \`path/to/file.js\`
  - **Estimated Effort**: [X hours]

#### Low Priority Gaps:
- [ ] **Optimization Opportunity**: [Component name] - [Optimization description]
  - **Current Performance**: [Current state]
  - **Optimization Target**: [Desired state]
  - **Files to Optimize**: \`path/to/file.js\`
  - **Estimated Effort**: [X hours]

### 4. File Impact Analysis

#### Files Missing:
- [ ] \`path/to/missing/file.js\` - [Purpose and required content]
- [ ] \`path/to/missing/file.jsx\` - [Purpose and required content]
- [ ] \`path/to/missing/file.md\` - [Purpose and required content]

#### Files Incomplete:
- [ ] \`path/to/incomplete/file.js\` - [What's missing and needs to be added]
- [ ] \`path/to/incomplete/file.jsx\` - [What's missing and needs to be added]
- [ ] \`path/to/incomplete/file.md\` - [What's missing and needs to be added]

#### Files Needing Refactoring:
- [ ] \`path/to/refactor/file.js\` - [Current issues and refactoring needs]
- [ ] \`path/to/refactor/file.jsx\` - [Current issues and refactoring needs]

#### Files to Delete:
- [ ] \`path/to/obsolete/file.js\` - [Reason for deletion and replacement]

### 5. Technical Debt Assessment

#### Code Quality Issues:
- [ ] **Complexity**: [Files with high cyclomatic complexity]
- [ ] **Duplication**: [Duplicate code patterns found]
- [ ] **Dead Code**: [Unused functions and variables]
- [ ] **Inconsistent Patterns**: [Inconsistent coding patterns]

#### Architecture Issues:
- [ ] **Tight Coupling**: [Components that are too tightly coupled]
- [ ] **Missing Abstractions**: [Where abstractions are needed]
- [ ] **Violation of Principles**: [SOLID, DRY, etc. violations]

#### Performance Issues:
- [ ] **Slow Queries**: [Database queries that need optimization]
- [ ] **Memory Leaks**: [Potential memory leak locations]
- [ ] **Inefficient Algorithms**: [Algorithms that can be optimized]

### 6. Missing Features Analysis

#### Core Features Missing:
- [ ] **Feature Name**: [Description of missing feature]
  - **Business Impact**: [Why it's needed]
  - **Technical Requirements**: [What needs to be built]
  - **Estimated Effort**: [X hours]
  - **Dependencies**: [What needs to be done first]

#### Enhancement Features Missing:
- [ ] **Enhancement Name**: [Description of missing enhancement]
  - **User Value**: [Value to end users]
  - **Implementation Details**: [How to implement]
  - **Estimated Effort**: [X hours]

### 7. Testing Gaps

#### Missing Unit Tests:
- [ ] **Component**: [Component name] - [Test scenarios needed]
  - **Test File**: \`tests/unit/[ComponentName].test.js\`
  - **Test Cases**: [Specific scenarios to test]
  - **Coverage Target**: [X% coverage needed]

#### Missing Integration Tests:
- [ ] **Integration**: [Integration point] - [Test scenarios needed]
  - **Test File**: \`tests/integration/[IntegrationName].test.js\`
  - **Test Scenarios**: [API endpoints, database interactions]

#### Missing E2E Tests:
- [ ] **User Flow**: [User journey] - [Test scenarios needed]
  - **Test File**: \`tests/e2e/[FlowName].test.js\`
  - **User Journeys**: [Complete user flows to test]

### 8. Documentation Gaps

#### Missing Code Documentation:
- [ ] **Component**: [Component name] - [Documentation needed]
  - **JSDoc Comments**: [Functions/classes needing documentation]
  - **README Updates**: [Sections needing updates]
  - **API Documentation**: [Endpoints needing documentation]

#### Missing User Documentation:
- [ ] **Feature**: [Feature name] - [Documentation needed]
  - **User Guide**: [User guide sections needed]
  - **Troubleshooting**: [Common issues documentation]
  - **Migration Guide**: [If applicable]

### 9. Security Analysis

#### Security Vulnerabilities:
- [ ] **Vulnerability Type**: [Description of security issue]
  - **Location**: \`path/to/vulnerable/file.js\`
  - **Risk Level**: [High/Medium/Low]
  - **Mitigation**: [How to fix]
  - **Estimated Effort**: [X hours]

#### Missing Security Features:
- [ ] **Security Feature**: [Description of missing security feature]
  - **Implementation**: [How to implement]
  - **Files to Modify**: \`path/to/file.js\`
  - **Estimated Effort**: [X hours]

### 10. Performance Analysis

#### Performance Bottlenecks:
- [ ] **Bottleneck**: [Description of performance issue]
  - **Location**: \`path/to/slow/file.js\`
  - **Current Performance**: [Current metrics]
  - **Target Performance**: [Desired metrics]
  - **Optimization Strategy**: [How to optimize]
  - **Estimated Effort**: [X hours]

#### Missing Performance Features:
- [ ] **Performance Feature**: [Description of missing performance feature]
  - **Implementation**: [How to implement]
  - **Files to Modify**: \`path/to/file.js\`
  - **Estimated Effort**: [X hours]

### 11. Recommended Action Plan

#### Immediate Actions (Next Sprint):
- [ ] **Action**: [Description of immediate action needed]
  - **Priority**: [High/Medium/Low]
  - **Effort**: [X hours]
  - **Dependencies**: [What needs to be done first]

#### Short-term Actions (Next 2-3 Sprints):
- [ ] **Action**: [Description of short-term action needed]
  - **Priority**: [High/Medium/Low]
  - **Effort**: [X hours]
  - **Dependencies**: [What needs to be done first]

#### Long-term Actions (Next Quarter):
- [ ] **Action**: [Description of long-term action needed]
  - **Priority**: [High/Medium/Low]
  - **Effort**: [X hours]
  - **Dependencies**: [What needs to be done first]

### 12. Success Criteria for Analysis
- [ ] All gaps identified and documented
- [ ] Priority levels assigned to each gap
- [ ] Effort estimates provided for each gap
- [ ] Action plan created with clear next steps
- [ ] Stakeholders informed of findings
- [ ] Implementation tasks created for high-priority gaps

### 13. Risk Assessment

#### High Risk Gaps:
- [ ] **Risk**: [Description of high-risk gap] - Mitigation: [Specific mitigation strategy]

#### Medium Risk Gaps:
- [ ] **Risk**: [Description of medium-risk gap] - Mitigation: [Specific mitigation strategy]

#### Low Risk Gaps:
- [ ] **Risk**: [Description of low-risk gap] - Mitigation: [Specific mitigation strategy]

### 14. References & Resources
- **Codebase Analysis Tools**: [Tools used for analysis]
- **Best Practices**: [Industry standards for gap analysis]
- **Similar Projects**: [Examples of similar analyses]
- **Technical Documentation**: [Relevant technical docs]
- **Performance Benchmarks**: [Performance standards to compare against]

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

## Usage Instructions

1. **Analyze thoroughly** - Examine all aspects of the codebase
2. **Be specific with gaps** - Provide exact file paths and descriptions
3. **Include effort estimates** - Critical for prioritization
4. **Prioritize gaps** - Help stakeholders understand what to tackle first
5. **Provide actionable insights** - Each gap should have clear next steps
6. **Include success criteria** - Enable progress tracking
7. **Consider all dimensions** - Code quality, architecture, security, performance

## Important Notes
- Be thorough in your analysis
- Consider the broader codebase context
- Provide actionable recommendations
- Assess both technical and business risks
- Consider maintainability and scalability
- Focus on project-wide analysis, not individual task validation
- Create comprehensive gap analysis following the template structure
- Provide specific file paths, effort estimates, and action plans

## Example Usage
> Analyze the current project state and identify all gaps, missing components, and areas for improvement. Create a comprehensive analysis following the template structure above. Focus on critical gaps that need immediate attention and provide specific file paths, effort estimates, and action plans for each identified issue.

---

**Note**: This template is optimized for comprehensive gap analysis where markdown docs serve as detailed specifications for AI auto-implementation and tracking.`;
}
