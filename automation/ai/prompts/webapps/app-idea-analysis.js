export function generateWebAppIdeaAnalysisPrompt(appIdea, orchestratorPath = null) {
    return `# Web Application Idea Analysis Request

## Application Idea
${appIdea}

## Analysis Requirements
Please analyze this web application idea and provide:

1. **Application Type**: (SaaS, E-commerce, Social Media, Dashboard, CMS, API, Progressive Web App, Single Page App)
2. **Primary Category**: (Business, Entertainment, Education, Productivity, Social, Utility)
3. **Core Features**: (Main functionality and user interactions)
4. **Required Features**:
   - User Authentication: (Yes/No - if yes, specify type: basic, OAuth, SSO)
   - Database: (Yes/No - if yes, specify type: SQL, NoSQL, hybrid)
   - Real-time Features: (Yes/No - WebSockets, Server-Sent Events)
   - File Upload: (Yes/No - images, documents, media)
   - API Integration: (Yes/No - external services, third-party APIs)
   - Mobile Responsive: (Yes/No)
   - Offline Support: (Yes/No - PWA capabilities)
   - Analytics: (Yes/No - user tracking, performance monitoring)
   - Payment Processing: (Yes/No - subscriptions, one-time payments)
   - Multi-tenancy: (Yes/No - SaaS features)

5. **Technical Requirements**:
   - Frontend Framework: (React, Vue, Angular, Svelte, vanilla)
   - Backend Technology: (Node.js, Python, PHP, Java, .NET)
   - Database: (PostgreSQL, MongoDB, MySQL, Redis)
   - Deployment: (Cloud, VPS, Serverless, Container)
   - Performance: (Low, Medium, High traffic expectations)

6. **Development Priority**:
   - Core Features: (List essential features)
   - Optional Features: (List nice-to-have features)
   - Excluded Features: (List features to skip)

## Important Instructions
${orchestratorPath ? `**DIRECTLY UPDATE THE ORCHESTRATOR FILE**: ${orchestratorPath}

The orchestrator file contains a comprehensive template with detailed tasks. Please customize it by:

1. **Replace Placeholders**:
   - [APP_NAME] → Actual application name
   - [APP_TYPE] → Analyzed application type
   - [CATEGORY] → Primary category
   - [CURRENT_DATE] → Current date

2. **Customize Task Categories**:
   - Remove tasks that don't apply (e.g., remove payment tasks if payments=No)
   - Adjust task descriptions to match the application type
   - Update time estimates based on complexity
   - Modify dependencies based on application requirements

3. **Add Application-Specific Information**:
   - Update the description with the application idea
   - Add core features and functionality
   - Include technical requirements
   - List development priorities

4. **Task Customization**:
   - Keep relevant tasks from the template
   - Remove unnecessary tasks
   - Adjust task counts and categories
   - Update progress summary

**IMPORTANT**: Don't replace it with a simple list - customize the existing comprehensive structure to match this specific application.

Do not just provide the analysis - actually modify the orchestrator file to reflect the analysis results while preserving the detailed task structure.` : 'Please provide a structured analysis that can be used to customize the web application development template.'}

Please provide a structured analysis that can be used to customize the web application development template.`;
}
