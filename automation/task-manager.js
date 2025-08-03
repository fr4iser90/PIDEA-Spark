/**
 * Task Manager Module for CDP Automation
 * 
 * Handles task loading, parsing, dependency management, and task lifecycle.
 */

import fs from 'fs';

// Task management functions (extracted from automation-workflow-cdp.js)
export function loadTaskDefinitions(orchestratorFile) {
    try {
        const orchestratorContent = fs.readFileSync(orchestratorFile, 'utf8');
        
        // Parse task table from orchestrator
        const taskTableRegex = /\| (\d+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|/g;
        let match;
        const taskQueue = [];
        
        while ((match = taskTableRegex.exec(orchestratorContent)) !== null) {
            const task = {
                id: parseInt(match[1]),
                name: match[2].trim(),
                category: match[3].trim(),
                time: match[4].trim(),
                status: match[5].trim(),
                progress: match[6].trim(),
                dependencies: match[7].trim(),
                nextAction: match[8].trim()
            };
            
            taskQueue.push(task);
        }
        
        return taskQueue;
        
    } catch (error) {
        throw new Error(`Error loading task definitions: ${error.message}`);
    }
}

export function buildDependencyGraph(taskQueue) {
    // Sort tasks by dependencies
    taskQueue.sort((a, b) => {
        const aDeps = parseDependencies(a.dependencies);
        const bDeps = parseDependencies(b.dependencies);
        
        // If task A depends on task B, B should come first
        if (aDeps.includes(b.id)) return 1;
        if (bDeps.includes(a.id)) return -1;
        
        // Otherwise, sort by ID
        return a.id - b.id;
    });
    
    return taskQueue;
}

export function parseDependencies(depString) {
    if (!depString || depString === '-') return [];
    
    return depString
        .split(',')
        .map(dep => dep.trim())
        .filter(dep => dep.startsWith('Task '))
        .map(dep => parseInt(dep.replace('Task ', '')));
}

export function checkDependencies(task, completedTasks) {
    const dependencies = parseDependencies(task.dependencies);
    
    for (const depId of dependencies) {
        const depTask = completedTasks.find(t => t.id === depId);
        if (!depTask) {
            return false;
        }
    }
    
    return true;
} 