export function generateWebAppPlanningPrompt(appIdea, requirements) {
    return `# Web Application Development Planning Request

## Application Idea
${appIdea}

## Planning Requirements
${requirements}

## Request
Please analyze this web application idea and create a comprehensive development plan including:
1. Technical architecture recommendations
2. Feature prioritization
3. Development timeline estimation
4. Resource requirements
5. Risk assessment
6. Technology stack selection
7. Deployment strategy

Provide a structured plan that can be used for automated task generation.`;
}
