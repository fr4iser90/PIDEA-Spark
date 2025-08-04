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
