export const TASK_PATTERNS = {
    // File naming patterns
    filePatterns: {
        index: 'pidea-spark-output/tasks/[category]/[name]/index.md',
        implementation: 'pidea-spark-output/tasks/[category]/[name]/implementation.md',
        phase: 'pidea-spark-output/tasks/[category]/[name]/phase-[number].md',
        analysis: 'pidea-spark-output/tasks/[category]/[name]/analysis.md'
    },

    // Phase management patterns
    phaseBreakdown: {
        table: `## 📊 Phase Breakdown
| Phase | File | Status | Time | Progress | Started | Completed |
|-------|------|--------|------|----------|---------|-----------|
| 1 | [Phase 1](./phase-1.md) | [Status] | [X]h | [X]% | [Date] | [Date] |
| 2 | [Phase 2](./phase-2.md) | [Status] | [X]h | [X]% | [Date] | [Date] |
| 3 | [Phase 3](./phase-3.md) | [Status] | [X]h | [X]% | [Date] | [Date] |`,
        
        phases: [
            { number: 1, title: 'Foundation Setup', description: 'Create base structures and configurations' },
            { number: 2, title: 'Core Implementation', description: 'Build all required components' },
            { number: 3, title: 'Integration & Testing', description: 'Connect components and add tests' },
            { number: 4, title: 'Documentation & Validation', description: 'Complete documentation and validation' },
            { number: 5, title: 'Deployment Preparation', description: 'Set up deployment configurations' }
        ]
    },

    // Status patterns
    status: {
        planning: '📋 Planning',
        inProgress: '🚧 In Progress',
        completed: '✅ Completed',
        blocked: '🚫 Blocked',
        failed: '❌ Failed',
        ready: '📋 Ready'
    },

    // Progress patterns
    progress: {
        format: '[X]%',
        milestones: [25, 50, 75, 100]
    },

    // Timestamp patterns
    timestamps: {
        format: '[RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"]',
        fields: {
            created: 'Created',
            lastUpdated: 'Last Updated',
            started: 'Started',
            completed: 'Completed',
            phaseCompleted: 'Phase [X] Completed',
            fileCreated: 'Created',
            fileModified: 'Modified',
            statusUpdated: 'Status Updated',
            error: 'Error'
        }
    },

    // Directory structure patterns
    directoryStructure: {
        template: `pidea-spark-output/tasks/[category]/[name]/
├── index.md (Master index)
├── implementation.md (Complete implementation plan)
├── phase-1.md (Foundation Setup)
├── phase-2.md (Core Implementation)
├── phase-3.md (Integration & Testing)
├── phase-4.md (Documentation & Validation)
└── phase-5.md (Deployment Preparation)`
    },

    // Task splitting patterns
    taskSplitting: {
        sizeThreshold: 8, // hours
        fileThreshold: 10, // files
        phaseThreshold: 5, // phases
        subtaskPattern: '[task-name-phase-[number].md](./task-name-phase-[number].md) – Phase [Number] Title'
    },

    // Validation patterns
    validation: {
        fileExistence: {
            required: ['index', 'implementation'],
            optional: ['phase-1', 'phase-2', 'phase-3', 'phase-4', 'phase-5']
        },
        codeQuality: {
            syntax: 'All code must be syntactically correct',
            patterns: 'Follow established architectural patterns',
            errorHandling: 'Implement proper error handling',
            security: 'Validate input/output and authentication',
            performance: 'Check for performance bottlenecks'
        }
    },

    // Integration patterns
    integration: {
        apiEndpoints: 'Verify all endpoints are properly connected',
        database: 'Ensure schema matches implementation',
        frontendBackend: 'Validate data flow between layers',
        eventSystem: 'Check event handling and messaging',
        websocket: 'Verify real-time communication setup'
    }
};

export const PHASE_TEMPLATES = {
    // Phase file content template
    phaseContent: `# [Task Name] – Phase [Number]: [Phase Title]

## Overview
Brief description of what this phase accomplishes.

## Objectives
- [ ] Objective 1
- [ ] Objective 2
- [ ] Objective 3

## Deliverables
- File: \`path/to/file.js\` - Description
- API: \`/api/endpoint\` - Description
- Test: \`tests/unit/feature.test.js\` - Description

## Dependencies
- Requires: Phase X completion
- Blocks: Phase Y start

## Estimated Time
X hours

## Success Criteria
- [ ] All objectives completed
- [ ] All deliverables created
- [ ] Tests passing
- [ ] Documentation updated

## Progress Tracking
- **Status**: [Status]
- **Progress**: [X]%
- **Started**: [Timestamp]
- **Completed**: [Timestamp]
- **Notes**: [Any additional notes]`,

    // Index file content template
    indexContent: `# [Task Name] - Master Index

## 📋 Task Overview
- **Name**: [Task Name]
- **Category**: [Category]
- **Priority**: [Priority]
- **Status**: [Status]
- **Total Estimated Time**: [X] hours
- **Created**: [Timestamp]
- **Last Updated**: [Timestamp]

## 📁 File Structure
\`\`\`
pidea-spark-output/tasks/[category]/[name]/
├── index.md (this file)
├── implementation.md
├── phase-1.md
├── phase-2.md
└── phase-3.md
\`\`\`

## 🎯 Main Implementation
- **[Task Name Implementation](./implementation.md)** - Complete implementation plan and specifications

## 📊 Phase Breakdown
| Phase | File | Status | Time | Progress |
|-------|------|--------|------|----------|
| 1 | [Phase 1](./phase-1.md) | [Status] | [X]h | [X]% |
| 2 | [Phase 2](./phase-2.md) | [Status] | [X]h | [X]% |
| 3 | [Phase 3](./phase-3.md) | [Status] | [X]h | [X]% |

## 📈 Progress Tracking
- **Overall Progress**: [X]% Complete
- **Current Phase**: [Phase Number]
- **Next Milestone**: [Description]
- **Estimated Completion**: [Date]

## 🔗 Related Tasks
- **Dependencies**: [List of tasks this depends on]
- **Dependents**: [List of tasks that depend on this]
- **Related**: [List of related tasks]

## 📝 Notes & Updates
### [Date] - [Update Type]
- [Description of update]
- [Files modified]
- [Progress made]

## 🚀 Quick Actions
- [View Implementation Plan](./implementation.md)
- [Start Phase 1](./phase-1.md)
- [Review Progress](#progress-tracking)
- [Update Status](#notes--updates)`,

    // Implementation file content template
    implementationContent: `# [Task Name] - Implementation Plan

## 1. Project Overview
- **Feature/Component Name**: [Task Name]
- **Priority**: [Priority]
- **Category**: [Category]
- **Estimated Time**: [X] hours
- **Dependencies**: [Dependencies]
- **Related Issues**: [Related Issues]
- **Created**: [Timestamp]
- **Last Updated**: [Timestamp]

## 2. Technical Requirements
- **Tech Stack**: [Tech Stack]
- **Architecture Pattern**: [Architecture Pattern]
- **Database Changes**: [Database Changes]
- **API Changes**: [API Changes]
- **Frontend Changes**: [Frontend Changes]
- **Backend Changes**: [Backend Changes]

## 3. File Impact Analysis
#### Files to Modify:
- [ ] [File path] - [Description]

#### Files to Create:
- [ ] [File path] - [Description]

#### Files to Delete:
- [ ] [File path] - [Description]

## 4. Implementation Phases
#### Phase 1: Foundation Setup ([X] hours)
- [ ] [Task description]

#### Phase 2: Core Implementation ([X] hours)
- [ ] [Task description]

#### Phase 3: Integration ([X] hours)
- [ ] [Task description]

#### Phase 4: Testing & Documentation ([X] hours)
- [ ] [Task description]

#### Phase 5: Deployment & Validation ([X] hours)
- [ ] [Task description]

## 5. Code Standards & Patterns
- **Coding Style**: [Coding Style]
- **Naming Conventions**: [Naming Conventions]
- **Error Handling**: [Error Handling]
- **Logging**: [Logging]
- **Testing**: [Testing]
- **Documentation**: [Documentation]

## 6. Security Considerations
- [ ] [Security consideration]

## 7. Performance Requirements
- **Response Time**: [Response Time]
- **Throughput**: [Throughput]
- **Memory Usage**: [Memory Usage]
- **Database Queries**: [Database Queries]
- **Caching Strategy**: [Caching Strategy]

## 8. Testing Strategy
#### Unit Tests:
- [ ] [Test description]

#### Integration Tests:
- [ ] [Test description]

#### E2E Tests:
- [ ] [Test description]

## 9. Documentation Requirements
- [ ] [Documentation requirement]

## 10. Deployment Checklist
- [ ] [Deployment item]

## 11. Rollback Plan
- [ ] [Rollback step]

## 12. Success Criteria
- [ ] [Success criterion]

## 13. Risk Assessment
- [ ] [Risk item]

## 14. References & Resources
- [Reference or resource]`
};

export const VALIDATION_PATTERNS = {
    // File existence validation
    fileExistence: {
        required: ['index', 'implementation'],
        optional: ['phase-1', 'phase-2', 'phase-3', 'phase-4', 'phase-5'],
        patterns: {
            index: 'pidea-spark-output/tasks/[category]/[name]/index.md',
            implementation: 'pidea-spark-output/tasks/[category]/[name]/implementation.md',
            phase: 'pidea-spark-output/tasks/[category]/[name]/phase-[number].md'
        }
    },

    // Code quality validation
    codeQuality: {
        syntax: 'All code must be syntactically correct',
        patterns: 'Follow established architectural patterns',
        errorHandling: 'Implement proper error handling throughout',
        security: 'Validate input/output and authentication',
        performance: 'Check for performance bottlenecks',
        patternValidation: 'Verify all functionality uses established patterns, never manual implementations',
        helperUsage: 'Ensure all operations use established helpers for automatic handling',
        noHardcodedValues: 'Never hardcode tokens, headers, or credentials - use established systems'
    },

    // Integration validation
    integration: {
        apiEndpoints: 'Verify all endpoints are properly connected',
        database: 'Ensure schema matches implementation',
        frontendBackend: 'Validate data flow between layers',
        eventSystem: 'Check event handling and messaging',
        websocket: 'Verify real-time communication setup'
    },

    // Task splitting validation
    taskSplitting: {
        sizeAssessment: 'Tasks > 8 hours should be split',
        complexityCheck: 'Tasks with > 10 files or > 5 phases need splitting',
        dependencyAnalysis: 'Independent components can be parallel subtasks',
        riskIsolation: 'High-risk components should be separate subtasks',
        atomicUnits: 'Each subtask should be independently testable'
    }
};

export const TIMESTAMP_PATTERNS = {
    // Timestamp format
    format: '[RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"]',
    
    // Required timestamp fields
    required: {
        taskStart: 'Started: [RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"]',
        phaseCompletion: 'Phase [X] Completed: [RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"]',
        fileCreation: 'Created: [RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"]',
        fileModification: 'Modified: [RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"]',
        statusChange: 'Status Updated: [RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"]',
        taskCompletion: 'Completed: [RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"]',
        errorEvent: 'Error: [RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"]'
    },

    // Implementation file timestamps
    implementation: {
        lastUpdated: 'Last Updated: [RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"]',
        progressEntries: 'Add timestamps to all progress entries',
        phaseStatus: 'Include timestamps in phase status updates',
        completionTimestamps: 'Record completion timestamps for all phases'
    }
};

export default {
    TASK_PATTERNS,
    PHASE_TEMPLATES,
    VALIDATION_PATTERNS,
    TIMESTAMP_PATTERNS
};
