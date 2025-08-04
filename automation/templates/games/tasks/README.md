# Game Development Task Templates

## Overview
This directory contains templates for all 110 tasks in the game development orchestrator. Each task has a standardized structure that can be customized for specific projects, genres, and technologies.

## Template Structure

### Directory Organization
```
task/
├── 01-project-setup/          # 10 tasks - Foundation setup
├── 02-core-engine/            # 15 tasks - Engine development
├── 03-frontend-ui/            # 10 tasks - User interface
├── 04-assets-pipeline/        # 10 tasks - Asset management
├── 05-data-persistence/       # 5 tasks - Data handling
├── 06-multiplayer-networking/ # 10 tasks - Network features
├── 07-feature-development/    # 15 tasks - Gameplay features
├── 08-testing/                # 8 tasks - Quality assurance
├── 09-deployment-distribution/# 5 tasks - Release pipeline
├── 10-monitoring-analytics/   # 7 tasks - Post-launch
├── 11-genre-specific/         # 10 tasks - Genre adaptations
└── template-task-index.md     # Universal template
```

### Task Template Structure
Each task directory contains:
- `index.md` - Main task specification
- `implementation.md` - Detailed implementation guide
- `phases.md` - Phase breakdown and milestones
- `validation.md` - Testing and validation criteria

## How to Use Templates

### 1. For New Projects
1. Copy the orchestrator template
2. Customize project information (`[GAME_NAME]`, `[GENRE]`, etc.)
3. Use AI to fill in task-specific details
4. Generate individual task files from templates

### 2. Template Customization
Replace placeholders with project-specific information:

#### Universal Placeholders
- `[TASK_ID]` → Task identifier (e.g., "1.2", "2.1")
- `[TASK_NAME]` → Task name
- `[CATEGORY]` → Task category
- `[ESTIMATED_TIME]` → Time estimate
- `[DEPENDENCIES]` → Task dependencies

#### Project-Specific Placeholders
- `[GAME_NAME]` → Your game name
- `[GENRE]` → Game genre (Fighting, RPG, Strategy, etc.)
- `[GENRE_LOWER]` → Lowercase genre (fighting, rpg, strategy)
- `[GAME_ENGINE]` → Engine (Unity, Unreal, Custom, etc.)

#### Technology-Specific Placeholders
- `[FRAMEWORK]` → Development framework
- `[LIBRARY]` → Specific libraries
- `[TOOLS]` → Development tools

### 3. AI Integration
The AI can:
- Fill in all placeholders based on project requirements
- Adapt templates for specific genres
- Adjust time estimates based on complexity
- Modify dependencies based on technology choices
- Add project-specific requirements

## Template Types

### Standard Templates
- **Project Setup**: Universal for all projects
- **Core Engine**: Adaptable to different engines
- **Testing**: Framework-agnostic
- **Deployment**: Platform-specific

### Genre-Specific Templates
- **Fighting Games**: Combo systems, hit detection
- **RPGs**: Turn-based combat, character progression
- **Strategy Games**: Resource management, AI
- **Action Games**: Real-time mechanics, physics

### Technology-Specific Templates
- **Unity**: C# scripts, Unity-specific patterns
- **Unreal**: C++ classes, Blueprint integration
- **Custom Engine**: Framework-agnostic approach
- **Web Games**: JavaScript/TypeScript patterns

## Best Practices

### 1. Template Usage
- Always start with the universal template
- Customize for your specific project
- Maintain consistency across tasks
- Document deviations from standard

### 2. AI Customization
- Provide clear project context
- Specify technology stack
- Define genre requirements
- Set realistic time estimates

### 3. Task Dependencies
- Respect the orchestrator dependency chain
- Adjust based on technology choices
- Consider parallel development opportunities
- Document blocking dependencies

## Example Workflow

### Step 1: Project Setup
```bash
# Copy orchestrator template
cp orchestrator.md my-game-orchestrator.md

# Customize with AI
# Replace [GAME_NAME] → "VibeFighters"
# Replace [GENRE] → "Fighting Game"
# Replace [GAME_ENGINE] → "Unity"
```

### Step 2: Task Generation
```bash
# Generate task 1.2 from template
cp template-task-index.md 01-project-setup/02-project-structure-creation/index.md

# Customize with AI
# Replace [TASK_NAME] → "Project Structure Creation"
# Replace [ESTIMATED_TIME] → "1h"
# Replace [GAME_ENGINE] → "Unity"
```

### Step 3: Implementation
- Follow the task phases
- Use the implementation guide
- Validate against success criteria
- Update progress in orchestrator

## Maintenance

### Template Updates
- Keep templates current with best practices
- Add new technology patterns
- Update genre-specific examples
- Maintain dependency accuracy

### Version Control
- Track template changes
- Document major updates
- Maintain backward compatibility
- Version template releases

---
*Template System v1.0 - Game Development Orchestrator* 