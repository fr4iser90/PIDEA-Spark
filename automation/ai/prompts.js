// Prompt generation function (extracted from automation-workflow-cdp.js)
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

## Response Format
Please respond with:

\`\`\`json
{
  "status": "completed|failed|partial",
  "files_created": ["file1.js", "file2.js"],
  "files_modified": ["existing.js"],
  "tests_added": ["test1.test.js"],
  "documentation_updated": ["README.md"],
  "validation_passed": true,
  "next_steps": "What should be done next",
  "estimated_completion_time": "2h",
  "dependencies_resolved": true
}
\`\`\`

## Important Notes
- Implement complete functionality, not stubs
- Follow the existing code patterns and conventions
- Ensure all code is production-ready
- Add proper error handling and validation
- Update all relevant documentation files`;
}

// NEW: Review prompt for initial analysis and orchestrator update
export function generateReviewPrompt(taskQueue, completedTasks, failedTasks) {
    const completedTaskIds = completedTasks.map(t => t.id);
    const failedTaskIds = failedTasks.map(t => t.id);
    const pendingTaskIds = taskQueue.filter(t => 
        !completedTaskIds.includes(t.id) && !failedTaskIds.includes(t.id)
    ).map(t => t.id);

    return `# Cursor Automation CDP Project Review & Orchestrator Update

## Current Project State Analysis

### Task Queue Overview
- **Total Tasks**: ${taskQueue.length}
- **Completed Tasks**: ${completedTasks.length} (IDs: ${completedTaskIds.join(', ') || 'none'})
- **Failed Tasks**: ${failedTasks.length} (IDs: ${failedTaskIds.join(', ') || 'none'})
- **Pending Tasks**: ${pendingTaskIds.length} (IDs: ${pendingTaskIds.join(', ') || 'none'})

### Task Details
${taskQueue.map(task => `
**Task ${task.id}**: ${task.name}
- Category: ${task.category}
- Status: ${task.status}
- Progress: ${task.progress}
- Dependencies: ${task.dependencies}
- Estimated Time: ${task.time}
`).join('\n')}

## Review Instructions

Please perform a comprehensive review of the Cursor Automation CDP project and update the orchestrator:

1. **Analyze Current Codebase State**
   - Review existing implementations
   - Check for completed vs incomplete features
   - Identify any inconsistencies or missing components

2. **Validate Task Dependencies**
   - Verify that completed tasks actually satisfy their dependencies
   - Identify any circular dependencies or missing prerequisites
   - Update task status based on actual implementation state

3. **Update Orchestrator Progress**
   - Correct any inaccurate progress indicators
   - Update task statuses based on actual codebase state
   - Ensure dependency relationships are accurate
   - **DIRECTLY UPDATE THE FILES** - don't just report, actually modify the orchestrator files

4. **Identify Critical Issues**
   - Find any blocking issues that prevent task execution
   - Identify missing infrastructure or setup requirements
   - Flag any tasks that need manual intervention

## Response Format

Please respond with:

\`\`\`json
{
  "review_status": "completed|issues_found|requires_manual_intervention",
  "orchestrator_updates": {
    "tasks_to_update": [
      {
        "task_id": 1,
        "current_status": "pending",
        "new_status": "completed",
        "reason": "Implementation found in codebase"
      }
    ],
    "progress_corrections": [
      {
        "category": "game-engine",
        "current_progress": "25%",
        "corrected_progress": "40%",
        "reason": "Core engine components already implemented"
      }
    ]
  },
  "critical_issues": [
    {
      "type": "missing_dependency|circular_dependency|incomplete_implementation",
      "description": "Detailed description of the issue",
      "affected_tasks": [1, 2, 3],
      "recommended_action": "What needs to be done"
    }
  ],
  "recommendations": [
    "Specific recommendations for next steps",
    "Tasks that should be prioritized",
    "Any manual interventions needed"
  ],
  "can_proceed_with_automation": true,
  "next_review_needed": false
}
\`\`\`

## Important Notes
- Be thorough in your analysis
- Don't assume tasks are complete just because they're marked as such
- Look for actual implementation evidence in the codebase
- **DIRECTLY UPDATE THE ORCHESTRATOR FILES** - modify the markdown files to reflect the true state
- Update task statuses, progress indicators, and dependencies in the actual files
- Provide specific, actionable recommendations
- The orchestrator should reflect the true state of the project after your updates`;
} 

export function generatePlanningPrompt(gameIdea, requirements) {
    return `# Game Development Planning Request

## Game Idea
${gameIdea}

## Planning Requirements
${requirements}

## Request
Please analyze this game idea and create a comprehensive development plan including:
1. Technical architecture recommendations
2. Feature prioritization
3. Development timeline estimation
4. Resource requirements
5. Risk assessment

Provide a structured plan that can be used for automated task generation.`;
}

export function generateTaskCreationPrompt(task, category, gameConfig) {
    return `# Task Creation Request

## Task Information
- **Task Name**: ${task.name}
- **Category**: ${category.name}
- **Game Type**: ${gameConfig.gameType}
- **Genre**: ${gameConfig.primaryGenre}

## Game Configuration
- **Core Mechanics**: ${gameConfig.coreMechanics}
- **Multiplayer**: ${gameConfig.features.multiplayer ? 'Yes' : 'No'}
- **3D Graphics**: ${gameConfig.features.graphics3d ? 'Yes' : 'No'}
- **Audio**: ${gameConfig.features.audio ? 'Yes' : 'No'}
- **AI**: ${gameConfig.features.ai ? 'Yes' : 'No'}
- **Physics**: ${gameConfig.features.physics ? 'Yes' : 'No'}

## Request
Please create detailed implementation files for this task:
1. Task index with overview and requirements
2. Implementation plan with technical details
3. Three-phase breakdown (Foundation, Core, Integration)
4. Success criteria and validation methods

Provide comprehensive, actionable content for automated development.`;
}

// NEW: Game Idea Analysis Prompt for Planning Workflow
export function generateGameIdeaAnalysisPrompt(gameIdea, orchestratorPath = null) {
    return `# Game Idea Analysis Request

## Game Idea
${gameIdea}

## Analysis Requirements
Please analyze this game idea and provide:

1. **Game Type**: (Action, Strategy, Puzzle, Simulation, Adventure, Sports, Racing, Horror, Arcade, Educational)
2. **Primary Genre**: (Specific genre classification)
3. **Core Mechanics**: (Main gameplay elements)
4. **Required Features**:
   - Multiplayer: (Yes/No - if yes, specify type: local, online, co-op, competitive)
   - 3D Graphics: (Yes/No)
   - Audio: (Yes/No - music, sound effects, voice acting)
   - AI: (Yes/No - NPCs, enemies, pathfinding)
   - Physics: (Yes/No - realistic, arcade-style)
   - Networking: (Yes/No - online features)
   - Mobile Support: (Yes/No)
   - Cloud Saves: (Yes/No)
   - Modding: (Yes/No)
   - Analytics: (Yes/No)

5. **Technical Requirements**:
   - Target Platforms: (Web, Desktop, Mobile, Console)
   - Performance Requirements: (Low, Medium, High)
   - Scalability: (Single player, small multiplayer, large multiplayer)

6. **Development Priority**:
   - Core Features: (List essential features)
   - Optional Features: (List nice-to-have features)
   - Excluded Features: (List features to skip)

## Important Instructions
${orchestratorPath ? `**DIRECTLY UPDATE THE ORCHESTRATOR FILE**: ${orchestratorPath}

The orchestrator file contains a comprehensive template with 110+ detailed tasks. Please customize it by:

1. **Replace Placeholders**:
   - [GAME_NAME] → Actual game name
   - [GAME_TYPE] → Analyzed game type
   - [GENRE] → Primary genre
   - [CURRENT_DATE] → Current date

2. **Customize Task Categories**:
   - Remove tasks that don't apply (e.g., remove multiplayer tasks if multiplayer=No)
   - Adjust task descriptions to match the game type
   - Update time estimates based on complexity
   - Modify dependencies based on game requirements

3. **Add Game-Specific Information**:
   - Update the description with the game idea
   - Add core mechanics and features
   - Include technical requirements
   - List development priorities

4. **Task Customization**:
   - Keep relevant tasks from the template
   - Remove unnecessary tasks (e.g., 3D graphics if 2D only)
   - Adjust task counts and categories
   - Update progress summary

**IMPORTANT**: The template has 110+ detailed tasks organized in categories. Don't replace it with a simple list - customize the existing comprehensive structure to match this specific game.

Do not just provide the analysis - actually modify the orchestrator file to reflect the analysis results while preserving the detailed task structure.` : 'Please provide a structured analysis that can be used to customize the game development template.'}

Please provide a structured analysis that can be used to customize the game development template.`;
} 

// NEW: Comprehensive Task Creation Prompt for all tasks from orchestrator
export function generateComprehensiveTaskCreationPrompt(orchestratorPath, gameConfig) {
    return `# Comprehensive Task Creation Request

## Orchestrator File
Please read and analyze the orchestrator file at: ${orchestratorPath}

## Game Configuration
- **Game Type**: ${gameConfig.gameType}
- **Genre**: ${gameConfig.primaryGenre}
- **Core Mechanics**: ${gameConfig.coreMechanics}
- **Multiplayer**: ${gameConfig.features.multiplayer ? 'Yes' : 'No'}
- **3D Graphics**: ${gameConfig.features.graphics3d ? 'Yes' : 'No'}
- **Audio**: ${gameConfig.features.audio ? 'Yes' : 'No'}
- **AI**: ${gameConfig.features.ai ? 'Yes' : 'No'}
- **Physics**: ${gameConfig.features.physics ? 'Yes' : 'No'}

## Request
Please create detailed implementation files for ALL tasks in the orchestrator:

1. **Read the orchestrator file** and extract all tasks
2. **For each task**, create detailed implementation files:
   - Task index with overview and requirements
   - Implementation plan with technical details
   - Three-phase breakdown (Foundation, Core, Integration)
   - Success criteria and validation methods
   - Dependencies and prerequisites
   - Estimated time and resources

3. **Update the orchestrator file** with:
   - Correct progress indicators
   - Validated dependencies
   - Updated time estimates
   - Task status validation

4. **Create task directories** for each task with proper structure

## Response Format
Please respond with:

\`\`\`json
{
  "status": "completed|partial|failed",
  "tasks_processed": 110,
  "tasks_created": 110,
  "orchestrator_updated": true,
  "validation_passed": true,
  "next_steps": "All tasks created successfully, ready for development",
  "estimated_completion_time": "110h",
  "dependencies_resolved": true,
  "files_created": ["task-1.1/index.md", "task-1.1/implementation.md", "task-1.1/phases.md", ...],
  "orchestrator_changes": {
    "progress_updated": true,
    "dependencies_validated": true,
    "time_estimates_adjusted": true
  }
}
\`\`\`

## Important Instructions
- Process ALL tasks from the orchestrator (should be 110+ tasks)
- Create comprehensive, actionable content for each task
- Follow the existing code patterns and conventions
- Ensure all dependencies are correctly mapped
- Update the orchestrator file directly with progress and validation
- Make all content production-ready with proper error handling
- Add proper documentation and testing requirements for each task

## File Structure
For each task, create:
- \`tasks/[task-id]-[task-name]/index.md\` - Task overview and requirements
- \`tasks/[task-id]-[task-name]/implementation.md\` - Technical implementation plan
- \`tasks/[task-id]-[task-name]/phases.md\` - Three-phase breakdown
- \`tasks/[task-id]-[task-name]/validation.md\` - Success criteria and testing

**DIRECTLY UPDATE THE ORCHESTRATOR FILE** with progress and validation results.`;
}

// NEW: Orchestrator Validation Prompt for Planning Workflow
export function generateOrchestratorValidationPrompt(orchestratorPath, gameConfig) {
    return `# Orchestrator Validation and Update Request

## Orchestrator File
Please read and validate the orchestrator file at: ${orchestratorPath}

## Game Configuration
- **Game Type**: ${gameConfig.gameType}
- **Genre**: ${gameConfig.primaryGenre}
- **Core Mechanics**: ${gameConfig.coreMechanics}
- **Multiplayer**: ${gameConfig.features.multiplayer ? 'Yes' : 'No'}
- **3D Graphics**: ${gameConfig.features.graphics3d ? 'Yes' : 'No'}
- **Audio**: ${gameConfig.features.audio ? 'Yes' : 'No'}
- **AI**: ${gameConfig.features.ai ? 'Yes' : 'No'}
- **Physics**: ${gameConfig.features.physics ? 'Yes' : 'No'}

## Validation Tasks

### 1. **Replace All Placeholders**
Replace the following placeholders with actual values:
- \`[GAME_NAME]\` → Actual game name (extract from project path or game idea)
- \`[GAME_TYPE]\` → ${gameConfig.gameType}
- \`[GENRE]\` → ${gameConfig.primaryGenre}
- \`[CURRENT_DATE]\` → Current date (${new Date().toISOString().split('T')[0]})
- \`[GENRE_LOWER]\` → ${(gameConfig.primaryGenre || 'General').toLowerCase()}
- \`To be defined\` → Appropriate values based on game analysis
- \`[GAME_DESCRIPTION]\` → Game description from analysis

### 2. **Validate Task Structure**
- Count total tasks in the orchestrator
- Ensure all required sections are present:
  - Project Overview
  - Task Status Table
  - Progress Summary
- Verify task dependencies are logical
- Check that task categories match the game type

### 3. **Customize Tasks Based on Game Type**
- Remove tasks that don't apply to this game type
- Adjust task descriptions to match the specific game
- Update time estimates based on complexity
- Modify dependencies based on game requirements
- Ensure genre-specific tasks are properly configured

### 4. **Update Game-Specific Information**
- Update project description with game details
- Add core mechanics and features
- Include technical requirements
- List development priorities
- Update progress summary with correct task counts

## Important Instructions
- **DIRECTLY UPDATE THE ORCHESTRATOR FILE** - don't just report, actually modify the file
- Replace ALL placeholders with appropriate values
- Ensure the file is production-ready with no placeholder text
- Validate that all 110+ tasks are properly configured
- Make sure task dependencies are logical and complete
- Update progress indicators and status information
- Ensure the file structure is complete and professional

**CRITICAL**: The orchestrator file must be completely free of placeholders and ready for task creation. Update it directly with all necessary changes.`;
} 