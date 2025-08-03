#!/usr/bin/env node

/**
 * Progress Tracker Module
 * 
 * Handles all progress-related file operations:
 * - Progress file updates
 * - Task completion tracking
 * - Progress statistics
 * - Timeline tracking
 */

import fs from 'fs';
import path from 'path';

export class ProgressTracker {
    constructor(config, log) {
        this.config = config;
        this.log = log;
        this.progressFile = config.progressFile;
    }

    async updateProgress(taskQueue, completedTasks, failedTasks, currentTask) {
        const totalTasks = taskQueue.length;
        const completedCount = completedTasks.length;
        const failedCount = failedTasks.length;
        const progress = Math.round((completedCount / totalTasks) * 100);
        
        this.log(`📊 Progress: ${completedCount}/${totalTasks} completed (${progress}%)`);
        
        // Update progress tracker
        const progressContent = this.generateProgressContent(
            totalTasks, 
            completedCount, 
            failedCount, 
            progress, 
            currentTask, 
            completedTasks, 
            failedTasks
        );
        
        fs.writeFileSync(this.progressFile, progressContent);
        this.log(`📝 Progress updated: ${this.progressFile}`);
    }

    generateProgressContent(totalTasks, completedCount, failedCount, progress, currentTask, completedTasks, failedTasks) {
        return `# Cursor Automation CDP Progress Tracker

## Automated Progress Update (CDP)
- **Timestamp**: ${new Date().toISOString()}
- **Total Tasks**: ${totalTasks}
- **Completed**: ${completedCount}
- **Failed**: ${failedCount}
- **In Progress**: ${totalTasks - completedCount - failedCount}
- **Overall Progress**: ${progress}%
- **CDP Port**: ${this.config.cdpPort}

## Current Task
- **ID**: ${currentTask?.id || 'N/A'}
- **Name**: ${currentTask?.name || 'N/A'}
- **Status**: ${currentTask ? 'Executing' : 'Completed'}

## Recent Completions
${completedTasks.slice(-5).map(task => `- Task ${task.id}: ${task.name}`).join('\n')}

## Failed Tasks
${failedTasks.map(task => `- Task ${task.id}: ${task.name}`).join('\n')}

## Progress Statistics
- **Success Rate**: ${Math.round((completedCount / totalTasks) * 100)}%
- **Failure Rate**: ${Math.round((failedCount / totalTasks) * 100)}%
- **Remaining Tasks**: ${totalTasks - completedCount - failedCount}

---
*Last updated by CDP automation workflow*`;
    }

    async updateTaskStatus(task, success, orchestratorFile) {
        // Update the orchestrator file
        let content = fs.readFileSync(orchestratorFile, 'utf8');
        
        const status = success ? '✅ Completed' : '❌ Failed';
        const progress = success ? '100%' : '0%';
        
        // Update task status in the table
        const taskRegex = new RegExp(`\\| ${task.id} \\| ([^|]+) \\| ([^|]+) \\| ([^|]+) \\| ([^|]+) \\| ([^|]+) \\| ([^|]+) \\| ([^|]+) \\|`, 'g');
        content = content.replace(taskRegex, `| ${task.id} | $1 | $2 | $3 | ${status} | ${progress} | $6 | $7 |`);
        
        fs.writeFileSync(orchestratorFile, content);
        this.log(`📝 Updated task ${task.id} status to ${status}`);
    }

    async generateDetailedProgressReport(taskQueue, completedTasks, failedTasks, startTime, endTime) {
        const report = {
            summary: {
                startTime: startTime || new Date().toISOString(),
                endTime: endTime || new Date().toISOString(),
                totalTasks: taskQueue.length,
                completed: completedTasks.length,
                failed: failedTasks.length,
                successRate: Math.round((completedTasks.length / taskQueue.length) * 100),
                cdpPort: this.config.cdpPort
            },
            completedTasks: completedTasks.map(task => ({
                id: task.id,
                name: task.name,
                category: task.category,
                time: task.time
            })),
            failedTasks: failedTasks.map(task => ({
                id: task.id,
                name: task.name,
                category: task.category,
                time: task.time
            })),
            recommendations: this.generateRecommendations(failedTasks.length)
        };

        return report;
    }

    generateRecommendations(failedCount) {
        if (failedCount === 0) {
            return ['All tasks completed successfully! 🎉'];
        }
        
        return [
            'Review and retry failed tasks manually',
            'Check dependencies and prerequisites',
            'Verify CDP connection and target accessibility',
            'Consider breaking down complex tasks',
            'Review AI responses for error patterns'
        ];
    }

    async saveProgressReport(report, filename = null) {
        if (!filename) {
            filename = `automation-cdp-report-${new Date().toISOString().split('T')[0]}.md`;
        }
        
        const reportContent = this.formatProgressReport(report);
        fs.writeFileSync(filename, reportContent);
        this.log(`📋 Progress report saved to ${filename}`);
        
        return filename;
    }

    formatProgressReport(report) {
        return `# Cursor Automation CDP Progress Report

## Execution Summary
- **Start Time**: ${report.summary.startTime}
- **End Time**: ${report.summary.endTime}
- **Total Tasks**: ${report.summary.totalTasks}
- **Completed**: ${report.summary.completed}
- **Failed**: ${report.summary.failed}
- **Success Rate**: ${report.summary.successRate}%
- **CDP Port**: ${report.summary.cdpPort}

## Completed Tasks
${report.completedTasks.map(task => `✅ Task ${task.id}: ${task.name} (${task.category})`).join('\n')}

## Failed Tasks
${report.failedTasks.map(task => `❌ Task ${task.id}: ${task.name} (${task.category})`).join('\n')}

## Recommendations
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*Generated by Cursor Automation CDP Progress Tracker*`;
    }

    async getProgressStatistics(taskQueue, completedTasks, failedTasks) {
        const total = taskQueue.length;
        const completed = completedTasks.length;
        const failed = failedTasks.length;
        const inProgress = total - completed - failed;
        
        return {
            total,
            completed,
            failed,
            inProgress,
            successRate: Math.round((completed / total) * 100),
            failureRate: Math.round((failed / total) * 100),
            progressRate: Math.round((completed / total) * 100)
        };
    }

    async createTimelineView(taskQueue, completedTasks, failedTasks) {
        const timeline = {
            total: taskQueue.length,
            completed: completedTasks.length,
            failed: failedTasks.length,
            timeline: []
        };

        // Add completed tasks to timeline
        completedTasks.forEach(task => {
            timeline.timeline.push({
                id: task.id,
                name: task.name,
                status: 'completed',
                timestamp: new Date().toISOString()
            });
        });

        // Add failed tasks to timeline
        failedTasks.forEach(task => {
            timeline.timeline.push({
                id: task.id,
                name: task.name,
                status: 'failed',
                timestamp: new Date().toISOString()
            });
        });

        return timeline;
    }
}

export default ProgressTracker; 