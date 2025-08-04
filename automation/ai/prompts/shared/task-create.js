export function generateTaskCreationPrompt(task, category) {
    return `# Task Creation Request

## Goal
Create comprehensive implementation files for development tasks with detailed specifications, phase breakdown, and complete implementation plans. **AUTOMATICALLY CREATE ALL REQUIRED FILES** following the mandatory file pattern structure.

> **File Pattern Requirement:**  
> All Index, Implementation and Phase files must always be created using this pattern:  
> - **Index**: pidea-spark-output/tasks/[category]/[name]/index.md  
> - **Implementation**: pidea-spark-output/tasks/[category]/[name]/implementation.md  
> - **Phase**: pidea-spark-output/tasks/[category]/[name]/phase-[number].md  
> If ANY file is missing, it MUST be created automatically. This pattern is required for orchestration and grouping in the system.

## Task Information
- **Task Name**: ${task.name}
- **Category**: ${category.name}
- **Priority**: ${task.priority || 'Medium'}
- **Estimated Time**: ${task.time || 'To be determined'}
- **Created**: [RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"]

## Required File Creation

### 1. Index File: pidea-spark-output/tasks/[category]/[name]/index.md
Create a master index file with:
- Task overview and metadata
- File structure documentation
- Phase breakdown table with status tracking
- Progress tracking with timestamps
- Related tasks and dependencies
- Quick action links

### 2. Implementation File: pidea-spark-output/tasks/[category]/[name]/implementation.md
Create comprehensive implementation plan with:
- Project overview and technical requirements
- File impact analysis (modify/create/delete)
- Implementation phases with detailed breakdown
- Code standards and patterns
- Security considerations
- Performance requirements
- Testing strategy
- Documentation requirements
- Deployment checklist
- Success criteria

### 3. Phase Files: pidea-spark-output/tasks/[category]/[name]/phase-[number].md
Create individual phase files for:
- Phase 1: Foundation Setup
- Phase 2: Core Implementation  
- Phase 3: Integration & Testing
- Phase 4: Documentation & Validation
- Phase 5: Deployment Preparation

Each phase file must include:
- Overview and objectives
- Deliverables with file paths
- Dependencies and prerequisites
- Estimated time
- Success criteria
- Progress tracking

## File Structure Requirements

### Hierarchical Organization
\`\`\`
pidea-spark-output/tasks/[category]/[name]/
├── index.md (Master index)
├── implementation.md (Complete implementation plan)
├── phase-1.md (Foundation Setup)
├── phase-2.md (Core Implementation)
├── phase-3.md (Integration & Testing)
├── phase-4.md (Documentation & Validation)
└── phase-5.md (Deployment Preparation)
\`\`\`

### Naming Conventions
- Use kebab-case for file names
- Extract category and name from task information
- Ensure consistent naming across all files
- Include proper file extensions (.md)

## Content Requirements

### Technical Specifications
- Detailed file paths for all components
- Complete implementation steps
- Code examples and patterns
- Error handling strategies
- Testing requirements
- Performance considerations

### Progress Tracking
- Timestamp integration: [RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"]
- Status updates with timestamps
- Progress percentage tracking
- Phase completion markers
- Dependency resolution

### Quality Standards
- Production-ready specifications
- Security best practices
- Performance optimization
- Maintainability considerations
- Scalability planning

## Success Criteria
- All required files created with proper structure
- Complete implementation specifications
- Detailed phase breakdown
- Proper file naming and organization
- Timestamp integration throughout
- Actionable implementation steps
- Comprehensive testing strategy
- Complete documentation requirements

## Usage Instructions
1. Analyze task requirements and category context
2. Create all required files following the pattern structure
3. Provide comprehensive implementation details
4. Include all technical specifications
5. Add proper progress tracking with timestamps
6. Ensure all files are properly linked and referenced
7. Validate file structure and naming conventions

## Example Output Structure
The system should create:
- **Index file** with task overview and phase tracking
- **Implementation file** with complete technical specifications
- **Phase files** with detailed implementation steps
- **Proper file organization** in hierarchical structure
- **Timestamp integration** for progress tracking
- **Complete documentation** for automated development

Provide comprehensive, actionable content for automated development with zero user input required.`;
}
