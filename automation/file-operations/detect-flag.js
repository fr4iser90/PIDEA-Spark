#!/usr/bin/env node

/**
 * AI Flag Detection Module
 * 
 * Dedicated module for detecting AI_FLAGS in task files.
 * Separated from planning-workflow.js to avoid code duplication.
 */

import fs from 'fs';
import path from 'path';

export class AIFlagDetector {
    constructor(log) {
        this.log = log;
    }

    /**
     * Scan all tasks for AI_FLAGS and return detailed results
     */
    async scanAllTasksForAIFlags(tasksDir) {
        this.log('🔍 Scanning all tasks for AI_FLAGS...');
        
        if (!fs.existsSync(tasksDir)) {
            this.log('❌ Tasks directory does not exist');
            return { tasksWithFlags: [], completedTasks: [], totalTasks: 0 };
        }
        
        const tasksWithFlags = [];
        const completedTasks = [];
        
        // Recursively scan all task directories
        const scanDirectory = (dir) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    // ALWAYS scan subdirectories recursively
                    scanDirectory(path.join(dir, entry.name));
                    
                    // ALSO check if this directory has an index.md (it's a task directory)
                    const indexPath = path.join(dir, entry.name, 'index.md');
                    
                    if (fs.existsSync(indexPath)) {
                        const content = fs.readFileSync(indexPath, 'utf8');
                        
                        // Extract task info from the index.md content
                        const taskNameMatch = content.match(/#\s*(.+)/);
                        const taskName = taskNameMatch ? taskNameMatch[1].trim() : entry.name;
                        
                        // Get category from directory structure (parent directory)
                        const category = path.basename(dir);
                        
                        const task = {
                            id: entry.name.split('-')[0] || '1.1',
                            name: taskName,
                            category: category,
                            path: path.join(dir, entry.name)
                        };
                        
                        // Check AI_FLAG status
                        const aiFlag = this.getAIFlagFromContent(content);
                        
                        if (aiFlag === 'REMOVE_THIS' || aiFlag === 'IN_PROGRESS') {
                            tasksWithFlags.push({ ...task, aiFlag: aiFlag });
                        } else {
                            completedTasks.push({ ...task, aiFlag: aiFlag });
                        }
                    }
                }
            }
        };
        
        scanDirectory(tasksDir);
        
        const totalTasks = tasksWithFlags.length + completedTasks.length;
        
        return {
            tasksWithFlags,
            completedTasks,
            totalTasks
        };
    }

    /**
     * Find the next incomplete task with AI_FLAG: REMOVE_THIS
     */
    async findNextIncompleteTask(tasksDir) {
        this.log('🔍 Scanning all task index.md files for AI_FLAG: REMOVE_THIS...');
        
        if (!fs.existsSync(tasksDir)) {
            this.log('❌ Tasks directory does not exist');
            return null;
        }
        
        // Recursively scan all task directories
        const incompleteTasks = [];
        
        const scanDirectory = (dir) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    // ALWAYS scan subdirectories recursively
                    scanDirectory(path.join(dir, entry.name));
                    
                    // ALSO check if this directory has an index.md (it's a task directory)
                    const indexPath = path.join(dir, entry.name, 'index.md');
                    
                    if (fs.existsSync(indexPath)) {
                        const content = fs.readFileSync(indexPath, 'utf8');
                        
                        // Check for AI_FLAG: REMOVE_THIS (with or without markdown formatting)
                        if (content.includes('AI_FLAG: REMOVE_THIS') || content.includes('**AI_FLAG**: REMOVE_THIS')) {
                            // Extract task info from the index.md content
                            const taskNameMatch = content.match(/#\s*(.+)/);
                            const taskName = taskNameMatch ? taskNameMatch[1].trim() : entry.name;
                            
                            // Get category from directory structure (parent directory)
                            const category = path.basename(dir);
                            
                            const task = {
                                id: entry.name.split('-')[0] || '1.1',
                                name: taskName,
                                category: category,
                                path: path.join(dir, entry.name)
                            };
                            
                            incompleteTasks.push(task);
                            this.log(`🔍 Found task with AI_FLAG: REMOVE_THIS: ${task.name} (${task.category})`);
                        }
                    }
                }
            }
        };
        
        scanDirectory(tasksDir);
        
        if (incompleteTasks.length === 0) {
            this.log('✅ No tasks with AI_FLAG: REMOVE_THIS found');
            return null;
        }
        
        // Return the first incomplete task
        const nextTask = incompleteTasks[0];
        this.log(`🎯 Next task to process: ${nextTask.name} (${nextTask.category})`);
        return nextTask;
    }

    /**
     * Get AI_FLAG from task content
     */
    getAIFlagFromContent(content) {
        // Check for AI_FLAG: REMOVE_THIS specifically (with or without markdown formatting)
        if (content.includes('AI_FLAG: REMOVE_THIS') || content.includes('**AI_FLAG**: REMOVE_THIS')) {
            return 'REMOVE_THIS';
        }
        
        // Use a more flexible regex that can handle markdown formatting and underscores/hyphens
        const aiFlagMatch = content.match(/\*\*?AI_FLAG\*\*?\s*:\s*([A-Z_]+)/i);
        return aiFlagMatch ? aiFlagMatch[1] : 'REMOVE_THIS';
    }

    /**
     * Check if a specific task is complete
     */
    async isTaskComplete(taskPath) {
        const indexPath = path.join(taskPath, 'index.md');
        
        if (fs.existsSync(indexPath)) {
            const content = fs.readFileSync(indexPath, 'utf8');
            const aiFlag = this.getAIFlagFromContent(content);
            return aiFlag === 'READY_FOR_EXECUTION' || aiFlag === 'COMPLETED';
        }
        
        return false;
    }

    /**
     * Find task path by task object
     */
    async findTaskPath(task, tasksDir) {
        if (!fs.existsSync(tasksDir)) {
            return null;
        }
        
        const categories = fs.readdirSync(tasksDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        
        for (const category of categories) {
            const categoryPath = path.join(tasksDir, category);
            const taskDirs = fs.readdirSync(categoryPath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);
            
            for (const taskDir of taskDirs) {
                const taskPath = path.join(categoryPath, taskDir);
                const indexPath = path.join(taskPath, 'index.md');
                
                if (fs.existsSync(indexPath)) {
                    const content = fs.readFileSync(indexPath, 'utf8');
                    if (content.includes(task.name) || taskDir.includes(task.name.toLowerCase().replace(/\s+/g, '-'))) {
                        return taskPath;
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * Display AI_FLAG scan results
     */
    displayAIFlagResults(results) {
        this.log(`📊 AI_FLAG Scan Results:`);
        this.log(`   🔴 Tasks with AI_FLAGS: ${results.tasksWithFlags.length}`);
        this.log(`   🟢 Completed tasks: ${results.completedTasks.length}`);
        this.log(`   📋 Total tasks: ${results.totalTasks}`);
        
        if (results.tasksWithFlags.length > 0) {
            this.log(`\n🔴 Tasks that need AI processing:`);
            results.tasksWithFlags.forEach((task, index) => {
                this.log(`   ${index + 1}. ${task.id} - ${task.name} (${task.category}) - AI_FLAG: ${task.aiFlag}`);
            });
        }
        
        this.log(''); // Empty line for readability
    }
}

export default AIFlagDetector;
