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
