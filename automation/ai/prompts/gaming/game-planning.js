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
