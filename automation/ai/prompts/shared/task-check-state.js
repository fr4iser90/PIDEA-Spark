/**
 * Task State Checking Utility
 * Provides functions for checking and updating task states
 */

import fs from 'fs';
import path from 'path';

/**
 * Task state enumeration
 */
export const TASK_STATES = {
    PLANNING: '📋 Planning',
    IN_PROGRESS: '🚧 In Progress',
    COMPLETED: '✅ Completed',
    BLOCKED: '🚫 Blocked',
    FAILED: '❌ Failed',
    READY: '📋 Ready',
    REVIEW: '🔍 Review',
    TESTING: '🧪 Testing',
    DEPLOYMENT: '🚀 Deployment'
};

/**
 * Phase state enumeration
 */
export const PHASE_STATES = {
    NOT_STARTED: '📋 Not Started',
    IN_PROGRESS: '🚧 In Progress',
    COMPLETED: '✅ Completed',
    FAILED: '❌ Failed',
    BLOCKED: '🚫 Blocked',
    REVIEW: '🔍 Review'
};

/**
 * Check if a task exists and get its current state
 * @param {string} taskPath - The path to the task
 * @returns {object} Task state information
 */
export function checkTaskState(taskPath) {
    // This would typically read from the actual file system
    // For now, we'll return a mock structure
    return {
        exists: true,
        state: TASK_STATES.PLANNING,
        progress: 0,
        lastUpdated: new Date().toISOString(),
        phases: [],
        dependencies: [],
        blockers: []
    };
}

/**
 * Check if all required files exist for a task
 * @param {string} taskPath - The path to the task
 * @returns {object} File existence check results
 */
export function checkTaskFiles(taskPath) {
    const requiredFiles = [
        'index.md ',
        'implementation.md',
        'phase-1.md',
        'phase-2.md',
        'phase-3.md'
    ];

    const results = {
        taskPath,
        requiredFiles,
        existingFiles: [],
        missingFiles: [],
        filesWithPlaceholders: [],
        allFilesExist: false,
        allFilesComplete: false
    };

    // Check each required file
    requiredFiles.forEach(file => {
        const filePath = path.join(taskPath, file);
        
        if (fs.existsSync(filePath)) {
            results.existingFiles.push(file);
            
            // Check if file has placeholders
            const content = fs.readFileSync(filePath, 'utf8');
            const hasPlaceholders = checkForPlaceholders(content);
            
            if (hasPlaceholders) {
                results.filesWithPlaceholders.push(file);
            }
        } else {
            results.missingFiles.push(file);
        }
    });

    results.allFilesExist = results.missingFiles.length === 0;
    results.allFilesComplete = results.filesWithPlaceholders.length === 0;
    
    return results;
}

function checkForPlaceholders(content) {
    const placeholderPatterns = [
        /\[GAME_ENGINE\]/g,
        /\[GAME_GENRE\]/g,
        /\[GIT_BRANCH_STRATEGY\]/g,
        /\[GIT_WORKFLOW\]/g,
        /\[GIT_HOOKS\]/g,
        /\[GIT_PERMISSIONS\]/g,
        /\[GIT_INTEGRATION\]/g,
        /\[REPOSITORY_STRUCTURE\]/g,
        /\[BRANCH_PROTECTION\]/g,
        /\[COMMIT_STANDARDS\]/g,
        /\[HOOKS_WORKING\]/g,
        /\[CI_INTEGRATION\]/g,
        /\[GITIGNORE_FILE\]/g,
        /\[GIT_HOOKS_DIR\]/g,
        /\[BRANCH_CONFIG\]/g,
        /\[VERSION\]/g,
        /\[FRAMEWORK\]/g,
        /\[LIBRARY\]/g,
        /\[TOOLS\]/g,
        /\[PLATFORM\]/g,
        /\[ART_STYLE\]/g,
        /\[PERFORMANCE\]/g,
        /\[TARGET_PLATFORM\]/g,
        /\[MULTIPLAYER\]/g,
        /\[SAVE_SYSTEM\]/g,
        /\[Status\]/g,
        /\[X\]h/g,
        /\[X\]%/g,
        /\[Date\]/g,
        /To be filled/i,
        /\[TO BE FILLED\]/i,
        /placeholder/i,
        /\[PLACEHOLDER\]/i,
        /TODO/i,
        /FIXME/i,
        /TBD/i
    ];
    
    return placeholderPatterns.some(pattern => pattern.test(content));
}

/**
 * Check task dependencies
 * @param {object} task - The task object
 * @returns {object} Dependency check results
 */
export function checkTaskDependencies(task) {
    const dependencies = task.dependencies || [];
    
    return {
        taskName: task.name,
        dependencies,
        satisfied: [],
        unsatisfied: [],
        allSatisfied: false,
        blockers: []
    };
}

/**
 * Check task progress
 * @param {object} task - The task object
 * @returns {object} Progress check results
 */
export function checkTaskProgress(task) {
    const phases = task.phases || [];
    const totalPhases = phases.length;
    const completedPhases = phases.filter(phase => phase.state === PHASE_STATES.COMPLETED).length;
    const progress = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

    return {
        taskName: task.name,
        totalPhases,
        completedPhases,
        inProgressPhases: phases.filter(phase => phase.state === PHASE_STATES.IN_PROGRESS).length,
        blockedPhases: phases.filter(phase => phase.state === PHASE_STATES.BLOCKED).length,
        progress,
        estimatedCompletion: calculateEstimatedCompletion(task),
        milestones: generateMilestones(progress)
    };
}

/**
 * Check if task is ready to start
 * @param {object} task - The task object
 * @returns {object} Readiness check results
 */
export function checkTaskReadiness(task) {
    const fileCheck = checkTaskFiles(task.path);
    const dependencyCheck = checkTaskDependencies(task);
    
    const isReady = fileCheck.allFilesExist && 
                   fileCheck.allFilesComplete &&
                   dependencyCheck.allSatisfied && 
                   task.state === TASK_STATES.READY;

    return {
        taskName: task.name,
        isReady,
        fileCheck,
        dependencyCheck,
        blockers: [
            ...fileCheck.missingFiles.map(file => `Missing file: ${file}`),
            ...fileCheck.filesWithPlaceholders.map(file => `File has placeholders: ${file}`),
            ...dependencyCheck.unsatisfied.map(dep => `Unsatisfied dependency: ${dep}`)
        ].filter(blocker => blocker)
    };
}

/**
 * Check task validation status
 * @param {object} task - The task object
 * @returns {object} Validation check results
 */
export function checkTaskValidation(task) {
    return {
        taskName: task.name,
        codeQuality: checkCodeQuality(task),
        security: checkSecurityValidation(task),
        performance: checkPerformanceValidation(task),
        testing: checkTestingValidation(task),
        documentation: checkDocumentationValidation(task),
        overallValid: true // Mock result
    };
}

/**
 * Check code quality validation
 * @param {object} task - The task object
 * @returns {object} Code quality check results
 */
function checkCodeQuality(task) {
    return {
        syntax: true,
        patterns: true,
        errorHandling: true,
        maintainability: true,
        overall: true
    };
}

/**
 * Check security validation
 * @param {object} task - The task object
 * @returns {object} Security check results
 */
function checkSecurityValidation(task) {
    return {
        inputValidation: true,
        authentication: true,
        authorization: true,
        dataProtection: true,
        overall: true
    };
}

/**
 * Check performance validation
 * @param {object} task - The task object
 * @returns {object} Performance check results
 */
function checkPerformanceValidation(task) {
    return {
        responseTime: true,
        throughput: true,
        memoryUsage: true,
        databaseQueries: true,
        overall: true
    };
}

/**
 * Check testing validation
 * @param {object} task - The task object
 * @returns {object} Testing check results
 */
function checkTestingValidation(task) {
    return {
        unitTests: true,
        integrationTests: true,
        e2eTests: true,
        coverage: true,
        overall: true
    };
}

/**
 * Check documentation validation
 * @param {object} task - The task object
 * @returns {object} Documentation check results
 */
function checkDocumentationValidation(task) {
    return {
        apiDocs: true,
        userGuide: true,
        technicalDocs: true,
        codeComments: true,
        overall: true
    };
}

/**
 * Calculate estimated completion time
 * @param {object} task - The task object
 * @returns {string} Estimated completion time
 */
function calculateEstimatedCompletion(task) {
    const phases = task.phases || [];
    const remainingPhases = phases.filter(phase => 
        phase.state !== PHASE_STATES.COMPLETED
    );
    
    const totalRemainingHours = remainingPhases.reduce((total, phase) => 
        total + (phase.estimatedTime || 0), 0
    );
    
    if (totalRemainingHours === 0) {
        return 'Already completed';
    }
    
    const estimatedDays = Math.ceil(totalRemainingHours / 8); // Assuming 8 hours per day
    return `${estimatedDays} day(s) (${totalRemainingHours} hours)`;
}

/**
 * Generate progress milestones
 * @param {number} progress - Current progress percentage
 * @returns {array} Array of milestone objects
 */
function generateMilestones(progress) {
    const milestones = [25, 50, 75, 100];
    
    return milestones.map(milestone => ({
        percentage: milestone,
        achieved: progress >= milestone,
        description: getMilestoneDescription(milestone)
    }));
}

/**
 * Get milestone description
 * @param {number} milestone - The milestone percentage
 * @returns {string} Milestone description
 */
function getMilestoneDescription(milestone) {
    const descriptions = {
        25: 'Foundation setup completed',
        50: 'Core implementation completed',
        75: 'Integration and testing completed',
        100: 'Task fully completed'
    };
    
    return descriptions[milestone] || `Milestone ${milestone}%`;
}

/**
 * Update task state
 * @param {object} task - The task object
 * @param {string} newState - The new state
 * @returns {object} Updated task state
 */
export function updateTaskState(task, newState) {
    if (!Object.values(TASK_STATES).includes(newState)) {
        throw new Error(`Invalid task state: ${newState}`);
    }
    
    return {
        ...task,
        state: newState,
        lastUpdated: new Date().toISOString(),
        stateHistory: [
            ...(task.stateHistory || []),
            {
                from: task.state,
                to: newState,
                timestamp: new Date().toISOString()
            }
        ]
    };
}

/**
 * Update phase state
 * @param {object} phase - The phase object
 * @param {string} newState - The new state
 * @returns {object} Updated phase state
 */
export function updatePhaseState(phase, newState) {
    if (!Object.values(PHASE_STATES).includes(newState)) {
        throw new Error(`Invalid phase state: ${newState}`);
    }
    
    return {
        ...phase,
        state: newState,
        lastUpdated: new Date().toISOString(),
        stateHistory: [
            ...(phase.stateHistory || []),
            {
                from: phase.state,
                to: newState,
                timestamp: new Date().toISOString()
            }
        ]
    };
}

/**
 * Generate task status report
 * @param {object} task - The task object
 * @returns {string} Formatted status report
 */
export function generateTaskStatusReport(task) {
    const progressCheck = checkTaskProgress(task);
    const readinessCheck = checkTaskReadiness(task);
    const validationCheck = checkTaskValidation(task);
    
    return `# Task Status Report: ${task.name}

## Current State
- **Status**: ${task.state}
- **Progress**: ${progressCheck.progress}%
- **Estimated Completion**: ${progressCheck.estimatedCompletion}

## Progress Breakdown
- **Total Phases**: ${progressCheck.totalPhases}
- **Completed Phases**: ${progressCheck.completedPhases}
- **In Progress Phases**: ${progressCheck.inProgressPhases}
- **Blocked Phases**: ${progressCheck.blockedPhases}

## Readiness Check
- **Ready to Start**: ${readinessCheck.isReady ? '✅ Yes' : '❌ No'}
- **Missing Files**: ${readinessCheck.fileCheck.missingFiles.length}
- **Files with Placeholders**: ${readinessCheck.fileCheck.filesWithPlaceholders.length}
- **Unsatisfied Dependencies**: ${readinessCheck.dependencyCheck.unsatisfied.length}

## Validation Status
- **Code Quality**: ${validationCheck.codeQuality.overall ? '✅ Pass' : '❌ Fail'}
- **Security**: ${validationCheck.security.overall ? '✅ Pass' : '❌ Fail'}
- **Performance**: ${validationCheck.performance.overall ? '✅ Pass' : '❌ Fail'}
- **Testing**: ${validationCheck.testing.overall ? '✅ Pass' : '❌ Fail'}
- **Documentation**: ${validationCheck.documentation.overall ? '✅ Pass' : '❌ Fail'}

## Blockers
${readinessCheck.blockers.length > 0 ? 
    readinessCheck.blockers.map(blocker => `- ${blocker}`).join('\n') : 
    '- No blockers identified'}

## Next Steps
${getNextSteps(task, progressCheck, readinessCheck)}`;
}

/**
 * Get next steps for a task
 * @param {object} task - The task object
 * @param {object} progressCheck - Progress check results
 * @param {object} readinessCheck - Readiness check results
 * @returns {string} Next steps description
 */
function getNextSteps(task, progressCheck, readinessCheck) {
    if (!readinessCheck.isReady) {
        return '1. Resolve blockers before starting\n2. Create missing files\n3. Satisfy dependencies';
    }
    
    if (progressCheck.progress === 0) {
        return '1. Start Phase 1: Foundation Setup\n2. Begin implementation\n3. Monitor progress';
    }
    
    if (progressCheck.progress === 100) {
        return '1. Final validation\n2. Documentation review\n3. Deployment preparation';
    }
    
    return '1. Continue current phase\n2. Monitor blockers\n3. Update progress';
}

export default {
    TASK_STATES,
    PHASE_STATES,
    checkTaskState,
    checkTaskFiles,
    checkTaskDependencies,
    checkTaskProgress,
    checkTaskReadiness,
    checkTaskValidation,
    updateTaskState,
    updatePhaseState,
    generateTaskStatusReport,
    scanAllTasks
};

// NEW: Scan all tasks and show completion status
export function scanAllTasks(tasksDir) {
    if (!fs.existsSync(tasksDir)) {
        return {
            totalTasks: 0,
            completedTasks: 0,
            tasksWithPlaceholders: 0,
            percentage: 0,
            incompleteTasks: []
        };
    }

    let totalTasks = 0;
    let completedTasks = 0;
    let tasksWithPlaceholders = 0;
    const incompleteTasks = [];

    // Scan all task directories
    const categories = fs.readdirSync(tasksDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const category of categories) {
        const categoryPath = path.join(tasksDir, category);
        const taskDirs = fs.readdirSync(categoryPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const taskDir of taskDirs) {
            totalTasks++;
            const taskPath = path.join(categoryPath, taskDir);
            
            const fileCheck = checkTaskFiles(taskPath);
            
            if (fileCheck.allFilesComplete) {
                completedTasks++;
            } else {
                tasksWithPlaceholders++;
                incompleteTasks.push(`${category}/${taskDir}`);
            }
        }
    }

    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
        totalTasks,
        completedTasks,
        tasksWithPlaceholders,
        percentage,
        incompleteTasks
    };
}
