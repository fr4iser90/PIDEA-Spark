#!/usr/bin/env node

/**
 * Git Commit Operations
 * 
 * Dedicated module for Git commit, push, pull, and fetch operations
 * Handles the complete commit workflow
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export class GitCommitManager {
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
     * Add files to staging area
     */
    async addFiles(files = []) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const filesToAdd = files.length > 0 ? files.join(' ') : '.';
            execSync(`git add ${filesToAdd}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                filesAdded: filesToAdd,
                message: `Added files to staging: ${filesToAdd}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Add all changes to staging area
     */
    async addAll() {
        return await this.addFiles([]);
    }

    /**
     * Commit staged changes
     */
    async commit(message) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            if (!message || message.trim() === '') {
                return { error: 'Commit message is required' };
            }

            execSync(`git commit -m "${message}"`, { cwd: this.workspacePath });
            
            // Get the commit hash
            const commitHash = execSync('git rev-parse HEAD', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).trim();
            
            return { 
                success: true,
                commitHash,
                message: `Committed with message: ${message}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Add and commit in one operation
     */
    async addAndCommit(files, message) {
        try {
            const addResult = await this.addFiles(files);
            if (addResult.error) {
                return addResult;
            }

            const commitResult = await this.commit(message);
            if (commitResult.error) {
                return commitResult;
            }

            return {
                success: true,
                addResult,
                commitResult,
                message: `Added and committed: ${message}`,
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Push changes to remote repository
     */
    async push(branch = null, remote = 'origin') {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const pushCommand = branch ? `git push ${remote} ${branch}` : `git push ${remote}`;
            execSync(pushCommand, { cwd: this.workspacePath });
            
            return { 
                success: true,
                branch: branch || 'current',
                remote,
                message: `Pushed to ${remote}${branch ? ` branch ${branch}` : ''}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Pull changes from remote repository
     */
    async pull(branch = null, remote = 'origin') {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const pullCommand = branch ? `git pull ${remote} ${branch}` : `git pull ${remote}`;
            execSync(pullCommand, { cwd: this.workspacePath });
            
            return { 
                success: true,
                branch: branch || 'current',
                remote,
                message: `Pulled from ${remote}${branch ? ` branch ${branch}` : ''}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Fetch changes from remote repository (without merging)
     */
    async fetch(remote = 'origin') {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync(`git fetch ${remote}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                remote,
                message: `Fetched from ${remote}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Complete workflow: add, commit, and push
     */
    async addCommitPush(files, message, branch = null) {
        try {
            const addResult = await this.addFiles(files);
            if (addResult.error) {
                return addResult;
            }

            const commitResult = await this.commit(message);
            if (commitResult.error) {
                return commitResult;
            }

            const pushResult = await this.push(branch);
            if (pushResult.error) {
                return pushResult;
            }

            return {
                success: true,
                addResult,
                commitResult,
                pushResult,
                message: `Complete workflow: ${message}`,
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get commit history
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
     * Get detailed commit information
     */
    async getCommitInfo(commitHash = 'HEAD') {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const info = execSync(`git show --stat ${commitHash}`, { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            });

            const lines = info.split('\n');
            const commitLine = lines[0];
            const authorLine = lines[1];
            const dateLine = lines[2];
            const messageLines = lines.slice(4, lines.findIndex(line => line.startsWith('diff')));

            return {
                commitHash,
                commitLine: commitLine.replace('commit ', ''),
                author: authorLine.replace('Author: ', ''),
                date: dateLine.replace('Date: ', ''),
                message: messageLines.join('\n').trim(),
                fullInfo: info,
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Check if there are uncommitted changes
     */
    async hasUncommittedChanges() {
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
                hasChanges,
                status: status.trim(),
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get diff of changes
     */
    async getDiff(staged = false) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const command = staged ? 'git diff --cached' : 'git diff';
            const diff = execSync(command, { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            });

            return {
                diff,
                staged,
                hasChanges: diff.trim().length > 0,
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }
}

// Main execution for testing
async function main() {
    const commitManager = new GitCommitManager();
    
    console.log('\n💾 Git Commit Operations Test:');
    console.log('==============================');
    
    // Check if Git repository
    if (!commitManager.isGitRepository()) {
        console.log('❌ Not a Git repository');
        return;
    }
    
    // Check for uncommitted changes
    const changes = await commitManager.hasUncommittedChanges();
    console.log(`Has uncommitted changes: ${changes.hasChanges}`);
    
    if (changes.hasChanges) {
        console.log('📊 Changes detected:');
        console.log(changes.status);
    }
    
    // Get commit history
    const history = await commitManager.getCommitHistory(5);
    console.log('\n📝 Recent commits:');
    history.commits.forEach(commit => {
        console.log(`  ${commit.hash} ${commit.message}`);
    });
    
    // Get current commit info
    const commitInfo = await commitManager.getCommitInfo();
    console.log('\n📋 Current commit:');
    console.log(`  Hash: ${commitInfo.commitLine}`);
    console.log(`  Author: ${commitInfo.author}`);
    console.log(`  Message: ${commitInfo.message.split('\n')[0]}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default GitCommitManager; 