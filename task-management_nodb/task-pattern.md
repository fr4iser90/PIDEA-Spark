# Task Management Patterns & Standards

## Goal
Centralized reference for all task management patterns, file structures, task fields, and AI execution contexts. This file serves as the single source of truth for all task management standards.

## Core File Patterns

### File Path Structure
```
pidea-spark-output/tasks/[category]/[name]/
├── [name]-index.md
├── [name]-implementation.md
├── [name]-phase-[number].md
├── [name]-analysis.md
└── [name]-review.md
```

### File Pattern Requirements
> **File Pattern Requirement:**  
> All Index, Implementation and Phase files must always be created using this pattern:
> - **Index**: `pidea-spark-output/tasks/[category]/[name]/[name]-index.md`  
> - **Implementation**: `pidea-spark-output/tasks/[category]/[name]/[name]-implementation.md`  
> - **Phase**: `pidea-spark-output/tasks/[category]/[name]/[name]-phase-[number].md`  
> - **Analysis**: `pidea-spark-output/tasks/[category]/[name]/[name]-analysis.md`
> - **Review**: `pidea-spark-output/tasks/[category]/[name]/[name]-review.md`
> 
> If ANY file is missing, it MUST be created automatically. This pattern is required for orchestration and grouping in the system.

## Task Field Patterns

### Task Information Fields
```markdown
-- Core Task Fields
title: [Task Name]
description: [Task Description]
type: [feature|bug|refactor|test|documentation|analysis]
category: [ai|automation|backend|frontend|ide|migration|performance|security|testing|documentation]
priority: [low|medium|high|critical]
status: [pending|in_progress|completed|failed|cancelled]

-- Source Information
source_path: [pidea-spark-output/tasks/[category]/[name]/[name]-implementation.md]
source_content: [Full markdown content for reference]

-- AI Automation Fields
automation_level: [semi_auto|full_auto|manual]
confirmation_required: [true|false]
max_attempts: [number]
git_branch_required: [true|false]
new_chat_required: [true|false]

-- Time Tracking
estimated_hours: [number]
actual_hours: [number]
created_at: [timestamp]
updated_at: [timestamp]
completed_at: [timestamp]
started_at: [timestamp]

-- Progress Tracking
progress: [percentage]
```

## Timestamp Patterns

### Timestamp Generation
Reference `@timestamp-utility.md` for timestamp generation commands and usage patterns.

**Quick Command**: `date -u +"%Y-%m-%dT%H:%M:%S.000Z"`

### Timestamp Usage Patterns
```markdown
## Current Status - Last Updated: [RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"] - Reference `@timestamp-utility.md`
## Language Status - Last Updated: [RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"] - Reference `@timestamp-utility.md`
## Progress Tracking - Last Updated: [RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"] - Reference `@timestamp-utility.md`

- **Created**: [RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"] - Reference `@timestamp-utility.md`
- **Last Updated**: [RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"] - Reference `@timestamp-utility.md`
- **Started**: [RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"] - Reference `@timestamp-utility.md`
- **Completed**: [RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"] - Reference `@timestamp-utility.md`
```

## Status Patterns

### Status Categories
- **✅ Completed** - File exists and is fully implemented
- **🔄 In Progress** - File exists but implementation is partial
- **❌ Missing** - File doesn't exist
- **⚠️ Issues Found** - File exists but has problems
- **🔧 Needs Update** - File exists but needs modification
- **🌐 Language Issues** - Non-English content detected and needs translation

### Status Indicators
```markdown
### ✅ Completed Items
- [x] `path/to/file.js` - Fully implemented with description

### 🔄 In Progress
- [~] `path/to/file.js` - Basic structure exists, needs completion

### ❌ Missing Items
- [ ] `path/to/file.js` - Not found in codebase

### ⚠️ Issues Found
- [ ] `path/to/file.js` - Missing validation

### 🔧 Needs Update
- [ ] `path/to/file.js` - Needs refactoring

### 🌐 Language Standardization
- [x] All content automatically translated to English
- [x] Non-English content replaced with English equivalents
- [x] Language consistency verified across all files
```

## Progress Tracking Patterns

### Progress Metrics
```markdown
### 📊 Current Metrics
- **Files Implemented**: 15/20 (75%)
- **Features Working**: 8/12 (67%)
- **Test Coverage**: 60%
- **Documentation**: 70% complete
- **Language Optimization**: 100% (English)

### 📈 Progress Tracking
- **Overall Progress**: [X]% Complete
- **Current Phase**: [Phase Number]
- **Next Milestone**: [Description]
- **Estimated Completion**: [Date]
- **Time Remaining**: [X hours]
- **Velocity**: [X hours/day]
```

## Phase Management Patterns

### Phase Breakdown Table
```markdown
## 📊 Phase Breakdown
| Phase | File | Status | Time | Progress | Started | Completed |
|-------|------|--------|------|----------|---------|-----------|
| 1 | [Phase 1](./[name]-phase-1.md) | [Status] | [X]h | [X]% | [Date] | [Date] |
| 2 | [Phase 2](./[name]-phase-2.md) | [Status] | [X]h | [X]% | [Date] | [Date] |
| 3 | [Phase 3](./[name]-phase-3.md) | [Status] | [X]h | [X]% | [Date] | [Date] |

**Status Legend**: 🟢 Planning | 🟡 In Progress | 🔴 Blocked | ✅ Completed
```


### Review & Repair Requirements
- **File Structure**: Validate and create missing files
- **Implementation Accuracy**: Check against actual codebase
- **Auto-Repair**: Fix issues automatically when possible
- **Validation**: Ensure everything is correct after repair
- **Documentation**: Update files with findings and fixes

### Review & Repair Process
1. **Analyze**: Identify issues and inconsistencies
2. **Repair**: Automatically fix problems found
3. **Validate**: Ensure repairs are correct
4. **Document**: Update files with changes made
5. **Verify**: Final check that everything works

## Integration Patterns

### Prompt Integration Flow
1. **task-create.md** → Creates implementation plan and specifications
2. **task-review.md** → Analyzes, repairs, and validates implementation files
3. **task-execute.md** → Executes implementation
4. **task-check-state.md** → Tracks progress and status updates
5. **task-analyze.md** → Performs project-wide gap analysis

### File Creation Order
1. Create category folder if missing
2. Create task folder if missing
3. Create index file
4. Create implementation file
5. Create phase files as needed
6. Create analysis file if required
7. **Language Standardization**: Automatically translate all content to English
8. **Review & Repair**: Validate and fix any issues found

## Usage Instructions

### Reference This File
In all task management prompts, reference this file using:
```markdown
Reference `@task-pattern.md` for all patterns and standards
```

### Pattern Updates
When updating patterns:
1. Update this file first
2. Update all task management prompts to reference this file
3. Remove duplicate pattern definitions from individual prompts
4. Test pattern consistency across all prompts

### Pattern Validation
Before using any pattern:
1. Check this file for the latest version
2. Ensure consistency with implementation requirements
3. Verify AI execution context compatibility
4. Test file path resolution
5. Validate timestamp generation

---

**Note**: This file serves as the single source of truth for all task management patterns. All task management prompts should reference this file instead of duplicating pattern definitions.
