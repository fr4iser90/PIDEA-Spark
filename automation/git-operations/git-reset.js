#!/usr/bin/env node

/**
 * Git Reset Operations
 * 
 * Dedicated module for Git reset operations
 * Handles soft, hard, and mixed resets
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export class GitResetManager {
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
     * Soft reset - moves HEAD but keeps changes in staging area
     */
    async softReset(commit = 'HEAD~1') {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync(`git reset --soft ${commit}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                commit,
                type: 'soft',
                message: `Soft reset to ${commit}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Hard reset - moves HEAD and discards all changes
     */
    async hardReset(commit = 'HEAD~1') {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync(`git reset --hard ${commit}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                commit,
                type: 'hard',
                message: `Hard reset to ${commit}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Mixed reset - moves HEAD and unstages changes (default)
     */
    async mixedReset(commit = 'HEAD~1') {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync(`git reset --mixed ${commit}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                commit,
                type: 'mixed',
                message: `Mixed reset to ${commit}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Reset to specific commit
     */
    async resetToCommit(commit, type = 'mixed') {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const resetType = type === 'soft' ? '--soft' : 
                             type === 'hard' ? '--hard' : '--mixed';
            
            execSync(`git reset ${resetType} ${commit}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                commit,
                type,
                message: `${type} reset to ${commit}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Reset file to HEAD
     */
    async resetFile(file) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync(`git reset HEAD ${file}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                file,
                message: `Reset file ${file} to HEAD`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Reset multiple files
     */
    async resetFiles(files) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const filesToReset = files.join(' ');
            execSync(`git reset HEAD ${filesToReset}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                files,
                message: `Reset files to HEAD: ${filesToReset}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Reset to remote branch
     */
    async resetToRemote(branch = 'origin/main') {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync(`git reset --hard ${branch}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                branch,
                type: 'hard',
                message: `Hard reset to remote branch ${branch}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get current HEAD commit
     */
    async getCurrentCommit() {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const commit = execSync('git rev-parse HEAD', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).trim();

            const shortCommit = execSync('git rev-parse --short HEAD', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).trim();

            return {
                fullHash: commit,
                shortHash: shortCommit,
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get commit history for reset target selection
     */
    async getCommitHistory(limit = 10) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const log = execSync(`git log --oneline -${limit}`, { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).split('\n')
              .filter(line => line.trim())
              .map(line => {
                  const [hash, ...messageParts] = line.split(' ');
                  return {
                      hash,
                      message: messageParts.join(' ')
                  };
              });

            return {
                commits: log,
                count: log.length,
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Check if reset is safe (no uncommitted changes)
     */
    async isResetSafe() {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const status = execSync('git status --porcelain', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            });

            const hasChanges = status.trim().length > 0;
            
            return {
                isSafe: !hasChanges,
                hasChanges,
                status: status.trim(),
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Revert a commit (creates new commit)
     */
    async revertCommit(commit) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync(`git revert ${commit}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                commit,
                message: `Reverted commit ${commit}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Revert commit without creating a new commit
     */
    async revertCommitNoCommit(commit) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync(`git revert --no-commit ${commit}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                commit,
                message: `Reverted commit ${commit} (no new commit created)`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get reflog for recovery
     */
    async getReflog() {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const reflog = execSync('git reflog', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).split('\n')
              .filter(line => line.trim())
              .map(line => {
                  const parts = line.split(' ');
                  return {
                      hash: parts[0],
                      action: parts[1],
                      message: parts.slice(2).join(' ')
                  };
              });

            return {
                reflog,
                count: reflog.length,
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }
}

// Main execution for testing
async function main() {
    const resetManager = new GitResetManager();
    
    console.log('\n🔄 Git Reset Operations Test:');
    console.log('=============================');
    
    // Check if Git repository
    if (!resetManager.isGitRepository()) {
        console.log('❌ Not a Git repository');
        return;
    }
    
    // Get current commit
    const currentCommit = await resetManager.getCurrentCommit();
    console.log(`📋 Current commit: ${currentCommit.shortHash}`);
    
    // Check if reset is safe
    const resetSafety = await resetManager.isResetSafe();
    console.log(`🛡️ Reset safe: ${resetSafety.isSafe}`);
    
    if (resetSafety.hasChanges) {
        console.log('⚠️ Has uncommitted changes - reset may be dangerous');
    }
    
    // Get commit history
    const history = await resetManager.getCommitHistory(5);
    console.log('\n📝 Recent commits:');
    history.commits.forEach((commit, index) => {
        console.log(`  ${index}: ${commit.hash} ${commit.message}`);
    });
    
    // Get reflog
    const reflog = await resetManager.getReflog();
    console.log(`\n📋 Reflog entries: ${reflog.count}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default GitResetManager; 