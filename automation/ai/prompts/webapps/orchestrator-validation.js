export function generateWebAppOrchestratorValidationPrompt(orchestratorPath, appConfig) {
    return `# Web Application Orchestrator Validation and Update Request

## Orchestrator File
Please read and validate the orchestrator file at: ${orchestratorPath}

## Application Configuration
- **Application Type**: ${appConfig.appType}
- **Category**: ${appConfig.primaryCategory}
- **Core Features**: ${appConfig.coreFeatures}
- **User Authentication**: ${appConfig.features.authentication ? 'Yes' : 'No'}
- **Database**: ${appConfig.features.database ? 'Yes' : 'No'}
- **Real-time Features**: ${appConfig.features.realtime ? 'Yes' : 'No'}
- **File Upload**: ${appConfig.features.fileUpload ? 'Yes' : 'No'}
- **API Integration**: ${appConfig.features.apiIntegration ? 'Yes' : 'No'}

## Validation Tasks

### 1. **Replace All Placeholders**
Replace the following placeholders with actual values:
- \`[APP_NAME]\` → Actual application name (extract from project path or app idea)
- \`[APP_TYPE]\` → ${appConfig.appType}
- \`[CATEGORY]\` → ${appConfig.primaryCategory}
- \`[CURRENT_DATE]\` → Current date (${new Date().toISOString().split('T')[0]})
- \`[CATEGORY_LOWER]\` → ${(appConfig.primaryCategory || 'General').toLowerCase()}
- \`To be defined\` → Appropriate values based on app analysis
- \`[APP_DESCRIPTION]\` → Application description from analysis

### 2. **Validate Task Structure**
- Count total tasks in the orchestrator
- Ensure all required sections are present:
  - Project Overview
  - Task Status Table
  - Progress Summary
- Verify task dependencies are logical
- Check that task categories match the application type

### 3. **Customize Tasks Based on Application Type**
- Remove tasks that don't apply to this application type
- Adjust task descriptions to match the specific application
- Update time estimates based on complexity
- Modify dependencies based on application requirements
- Ensure category-specific tasks are properly configured

### 4. **Update Application-Specific Information**
- Update project description with application details
- Add core features and functionality
- Include technical requirements
- List development priorities
- Update progress summary with correct task counts

## Important Instructions
- **DIRECTLY UPDATE THE ORCHESTRATOR FILE** - don't just report, actually modify the file
- Replace ALL placeholders with appropriate values
- Ensure the file is production-ready with no placeholder text
- Validate that all tasks are properly configured
- Make sure task dependencies are logical and complete
- Update progress indicators and status information
- Ensure the file structure is complete and professional

**CRITICAL**: The orchestrator file must be completely free of placeholders and ready for task creation. Update it directly with all necessary changes.`;
}
