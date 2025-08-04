#!/usr/bin/env node

/**
 * Git Stash Operations
 * 
 * Dedicated module for Git stash management
 * Handles stashing changes, applying stashes, and stash management
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export class GitStashManager {
    constructor(workspacePath = null) {
        this.workspacePath = workspacePath || process.cwd();
    }

    /**
     * Check if current directory is a Git repository
     */
    isGitRepository() {
        const gitPath = path.join(this.workspacePath, '.git');
        return fs.existsSync(gitPath);
    }

    /**
     * Stash changes with optional message
     */
    async stash(message = null) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const command = message ? `git stash push -m "${message}"` : 'git stash push';
            execSync(command, { cwd: this.workspacePath });
            
            return { 
                success: true,
                message: message || 'Stashed changes',
                stashMessage: message,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Apply the most recent stash
     */
    async stashPop() {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync('git stash pop', { cwd: this.workspacePath });
            
            return { 
                success: true,
                message: 'Applied most recent stash',
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Apply a specific stash by index
     */
    async stashApply(index = 0) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync(`git stash apply stash@{${index}}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                index,
                message: `Applied stash@{${index}}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * List all stashes
     */
    async stashList() {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const stashes = execSync('git stash list', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).split('\n')
              .filter(line => line.trim())
              .map(line => {
                  const match = line.match(/^stash@{(\d+)}: (.+)$/);
                  if (match) {
                      return {
                          index: parseInt(match[1]),
                          message: match[2],
                          fullLine: line
                      };
                  }
                  return null;
              })
              .filter(stash => stash);

            return {
                stashes,
                count: stashes.length,
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Show stash content
     */
    async stashShow(index = 0, stat = false) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const command = stat ? `git stash show -p stash@{${index}}` : `git stash show stash@{${index}}`;
            const content = execSync(command, { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            });

            return {
                index,
                content,
                stat,
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Drop a specific stash
     */
    async stashDrop(index = 0) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync(`git stash drop stash@{${index}}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                index,
                message: `Dropped stash@{${index}}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Clear all stashes
     */
    async stashClear() {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync('git stash clear', { cwd: this.workspacePath });
            
            return { 
                success: true,
                message: 'Cleared all stashes',
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Create a branch from a stash
     */
    async stashBranch(branchName, index = 0) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync(`git stash branch ${branchName} stash@{${index}}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                branchName,
                index,
                message: `Created branch ${branchName} from stash@{${index}}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Check if there are any stashes
     */
    async hasStashes() {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const stashes = await this.stashList();
            if (stashes.error) {
                return stashes;
            }

            return {
                hasStashes: stashes.count > 0,
                count: stashes.count,
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get stash information
     */
    async getStashInfo(index = 0) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const stashes = await this.stashList();
            if (stashes.error) {
                return stashes;
            }

            const stash = stashes.stashes.find(s => s.index === index);
            if (!stash) {
                return { error: `Stash@{${index}} not found` };
            }

            const content = await this.stashShow(index, true);
            
            return {
                index,
                message: stash.message,
                content: content.content,
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Stash specific files
     */
    async stashFiles(files, message = null) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const filesToStash = files.join(' ');
            const command = message ? 
                `git stash push -m "${message}" -- ${filesToStash}` : 
                `git stash push -- ${filesToStash}`;
            
            execSync(command, { cwd: this.workspacePath });
            
            return { 
                success: true,
                files,
                message: message || 'Stashed specific files',
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Stash with include-untracked flag
     */
    async stashIncludeUntracked(message = null) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const command = message ? 
                `git stash push -m "${message}" --include-untracked` : 
                'git stash push --include-untracked';
            
            execSync(command, { cwd: this.workspacePath });
            
            return { 
                success: true,
                message: message || 'Stashed changes including untracked files',
                includeUntracked: true,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }
}

// Main execution for testing
async function main() {
    const stashManager = new GitStashManager();
    
    console.log('\n📦 Git Stash Operations Test:');
    console.log('==============================');
    
    // Check if Git repository
    if (!stashManager.isGitRepository()) {
        console.log('❌ Not a Git repository');
        return;
    }
    
    // Check for stashes
    const hasStashes = await stashManager.hasStashes();
    console.log(`Has stashes: ${hasStashes.hasStashes}`);
    
    if (hasStashes.hasStashes) {
        console.log(`📦 Found ${hasStashes.count} stashes`);
        
        // List stashes
        const stashes = await stashManager.stashList();
        console.log('\n📋 Stash list:');
        stashes.stashes.forEach(stash => {
            console.log(`  ${stash.fullLine}`);
        });
        
        // Show first stash info
        if (stashes.count > 0) {
            const stashInfo = await stashManager.getStashInfo(0);
            console.log('\n📋 First stash info:');
            console.log(`  Message: ${stashInfo.message}`);
            console.log(`  Content length: ${stashInfo.content.length} characters`);
        }
    } else {
        console.log('📦 No stashes found');
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default GitStashManager; 