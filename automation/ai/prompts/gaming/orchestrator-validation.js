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
