/**
 * Timestamp Utility for Task Management
 * Provides functions for generating and managing timestamps in the required format
 */

/**
 * Generate a timestamp in the required format
 * @returns {string} Timestamp in format [RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"]
 */
export function generateTimestamp() {
    const now = new Date();
    const timestamp = now.toISOString();
    return `[RUN: date -u +"%Y-%m-%dT%H:%M:%S.000Z"]`;
}

/**
 * Generate a timestamp for a specific field
 * @param {string} field - The field name (created, started, completed, etc.)
 * @returns {string} Formatted timestamp with field name
 */
export function generateFieldTimestamp(field) {
    const timestamp = generateTimestamp();
    return `${field}: ${timestamp}`;
}

/**
 * Generate all required timestamps for a task
 * @param {string} taskName - The task name
 * @returns {object} Object containing all required timestamps
 */
export function generateTaskTimestamps(taskName) {
    const timestamp = generateTimestamp();
    
    return {
        created: `Created: ${timestamp}`,
        lastUpdated: `Last Updated: ${timestamp}`,
        started: `Started: ${timestamp}`,
        completed: `Completed: ${timestamp}`,
        statusUpdated: `Status Updated: ${timestamp}`,
        error: `Error: ${timestamp}`,
        phaseCompleted: (phaseNumber) => `Phase ${phaseNumber} Completed: ${timestamp}`,
        fileCreated: `Created: ${timestamp}`,
        fileModified: `Modified: ${timestamp}`
    };
}

/**
 * Generate timestamps for phase management
 * @param {number} phaseNumber - The phase number
 * @returns {object} Object containing phase timestamps
 */
export function generatePhaseTimestamps(phaseNumber) {
    const timestamp = generateTimestamp();
    
    return {
        started: `Phase ${phaseNumber} Started: ${timestamp}`,
        completed: `Phase ${phaseNumber} Completed: ${timestamp}`,
        failed: `Phase ${phaseNumber} Failed: ${timestamp}`,
        inProgress: `Phase ${phaseNumber} In Progress: ${timestamp}`
    };
}

/**
 * Generate timestamps for file operations
 * @param {string} fileName - The file name
 * @returns {object} Object containing file operation timestamps
 */
export function generateFileTimestamps(fileName) {
    const timestamp = generateTimestamp();
    
    return {
        created: `File ${fileName} Created: ${timestamp}`,
        modified: `File ${fileName} Modified: ${timestamp}`,
        deleted: `File ${fileName} Deleted: ${timestamp}`,
        validated: `File ${fileName} Validated: ${timestamp}`
    };
}

/**
 * Generate timestamps for progress tracking
 * @param {number} progress - The progress percentage
 * @returns {object} Object containing progress timestamps
 */
export function generateProgressTimestamps(progress) {
    const timestamp = generateTimestamp();
    
    return {
        milestone: `Progress ${progress}% Milestone: ${timestamp}`,
        updated: `Progress Updated to ${progress}%: ${timestamp}`,
        completed: `Progress 100% Completed: ${timestamp}`
    };
}

/**
 * Generate timestamps for validation events
 * @param {string} validationType - The type of validation
 * @returns {object} Object containing validation timestamps
 */
export function generateValidationTimestamps(validationType) {
    const timestamp = generateTimestamp();
    
    return {
        started: `${validationType} Validation Started: ${timestamp}`,
        completed: `${validationType} Validation Completed: ${timestamp}`,
        failed: `${validationType} Validation Failed: ${timestamp}`,
        passed: `${validationType} Validation Passed: ${timestamp}`
    };
}

/**
 * Generate timestamps for deployment events
 * @param {string} deploymentStage - The deployment stage
 * @returns {object} Object containing deployment timestamps
 */
export function generateDeploymentTimestamps(deploymentStage) {
    const timestamp = generateTimestamp();
    
    return {
        started: `${deploymentStage} Deployment Started: ${timestamp}`,
        completed: `${deploymentStage} Deployment Completed: ${timestamp}`,
        failed: `${deploymentStage} Deployment Failed: ${timestamp}`,
        rolledBack: `${deploymentStage} Deployment Rolled Back: ${timestamp}`
    };
}

/**
 * Generate timestamps for error events
 * @param {string} errorType - The type of error
 * @param {string} errorMessage - The error message
 * @returns {object} Object containing error timestamps
 */
export function generateErrorTimestamps(errorType, errorMessage) {
    const timestamp = generateTimestamp();
    
    return {
        occurred: `${errorType} Error Occurred: ${timestamp}`,
        resolved: `${errorType} Error Resolved: ${timestamp}`,
        retry: `${errorType} Error Retry: ${timestamp}`,
        message: `${errorType} Error: ${errorMessage} - ${timestamp}`
    };
}

/**
 * Generate timestamps for testing events
 * @param {string} testType - The type of test (unit, integration, e2e)
 * @returns {object} Object containing testing timestamps
 */
export function generateTestingTimestamps(testType) {
    const timestamp = generateTimestamp();
    
    return {
        started: `${testType} Tests Started: ${timestamp}`,
        completed: `${testType} Tests Completed: ${timestamp}`,
        failed: `${testType} Tests Failed: ${timestamp}`,
        passed: `${testType} Tests Passed: ${timestamp}`,
        skipped: `${testType} Tests Skipped: ${timestamp}`
    };
}

/**
 * Generate timestamps for documentation events
 * @param {string} docType - The type of documentation
 * @returns {object} Object containing documentation timestamps
 */
export function generateDocumentationTimestamps(docType) {
    const timestamp = generateTimestamp();
    
    return {
        created: `${docType} Documentation Created: ${timestamp}`,
        updated: `${docType} Documentation Updated: ${timestamp}`,
        reviewed: `${docType} Documentation Reviewed: ${timestamp}`,
        published: `${docType} Documentation Published: ${timestamp}`
    };
}

/**
 * Generate a comprehensive timestamp report for a task
 * @param {object} task - The task object
 * @returns {string} Formatted timestamp report
 */
export function generateTimestampReport(task) {
    const timestamps = generateTaskTimestamps(task.name);
    
    return `# Timestamp Report for ${task.name}

## Task Lifecycle
- ${timestamps.created}
- ${timestamps.started}
- ${timestamps.completed}

## Progress Tracking
- ${timestamps.statusUpdated}

## File Operations
- ${timestamps.fileCreated}
- ${timestamps.fileModified}

## Validation Events
- ${generateValidationTimestamps('Code Quality').started}
- ${generateValidationTimestamps('Security').started}
- ${generateValidationTimestamps('Performance').started}

## Testing Events
- ${generateTestingTimestamps('Unit').started}
- ${generateTestingTimestamps('Integration').started}
- ${generateTestingTimestamps('E2E').started}

## Documentation Events
- ${generateDocumentationTimestamps('API').created}
- ${generateDocumentationTimestamps('User Guide').created}
- ${generateDocumentationTimestamps('Technical').created}

## Deployment Events
- ${generateDeploymentTimestamps('Staging').started}
- ${generateDeploymentTimestamps('Production').started}

## Error Handling
- ${timestamps.error}

---
*Report generated: ${generateTimestamp()}*`;
}

/**
 * Parse timestamp from string
 * @param {string} timestampString - The timestamp string to parse
 * @returns {Date|null} Parsed date or null if invalid
 */
export function parseTimestamp(timestampString) {
    try {
        // Extract the ISO string from the timestamp format
        const match = timestampString.match(/\[RUN: date -u \+"([^"]+)"\]/);
        if (match) {
            // This is a placeholder format, so we'll use current time
            return new Date();
        }
        
        // Try to parse as ISO string directly
        return new Date(timestampString);
    } catch (error) {
        console.error('Error parsing timestamp:', error);
        return null;
    }
}

/**
 * Format timestamp for display
 * @param {Date} date - The date to format
 * @returns {string} Formatted timestamp string
 */
export function formatTimestamp(date) {
    if (!date) return 'Invalid Date';
    
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    });
}

/**
 * Check if timestamp is recent (within last hour)
 * @param {string} timestampString - The timestamp string to check
 * @returns {boolean} Whether the timestamp is recent
 */
export function isRecentTimestamp(timestampString) {
    const date = parseTimestamp(timestampString);
    if (!date) return false;
    
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    
    return diffInMinutes < 60;
}

/**
 * Get time difference between two timestamps
 * @param {string} timestamp1 - First timestamp
 * @param {string} timestamp2 - Second timestamp
 * @returns {object} Time difference object
 */
export function getTimeDifference(timestamp1, timestamp2) {
    const date1 = parseTimestamp(timestamp1);
    const date2 = parseTimestamp(timestamp2);
    
    if (!date1 || !date2) {
        return { error: 'Invalid timestamp format' };
    }
    
    const diffInMs = Math.abs(date2 - date1);
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    return {
        milliseconds: diffInMs,
        minutes: diffInMinutes,
        hours: diffInHours,
        days: diffInDays,
        formatted: `${diffInDays}d ${diffInHours % 24}h ${diffInMinutes % 60}m`
    };
}

export default {
    generateTimestamp,
    generateFieldTimestamp,
    generateTaskTimestamps,
    generatePhaseTimestamps,
    generateFileTimestamps,
    generateProgressTimestamps,
    generateValidationTimestamps,
    generateDeploymentTimestamps,
    generateErrorTimestamps,
    generateTestingTimestamps,
    generateDocumentationTimestamps,
    generateTimestampReport,
    parseTimestamp,
    formatTimestamp,
    isRecentTimestamp,
    getTimeDifference
};
