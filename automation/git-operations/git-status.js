#!/usr/bin/env node

/**
 * Git Status Operations
 * 
 * Dedicated module for Git status checking and monitoring
 * Can be used independently or as part of the GitOperationsManager
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export class GitStatusChecker {
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
     * Get detailed Git status information
     */
    async getStatus() {
        try {
            if (!this.isGitRepository()) {
                return { 
                    isGitRepo: false, 
                    error: 'Not a Git repository',
                    workspacePath: this.workspacePath 
                };
            }

            const status = execSync('git status --porcelain', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            });

            const statusLines = status.split('\n').filter(line => line.trim());
            
            const statusSummary = {
                modified: statusLines.filter(line => line.startsWith('M')).length,
                added: statusLines.filter(line => line.startsWith('A')).length,
                deleted: statusLines.filter(line => line.startsWith('D')).length,
                untracked: statusLines.filter(line => line.startsWith('??')).length,
                renamed: statusLines.filter(line => line.startsWith('R')).length,
                total: statusLines.length
            };

            return {
                isGitRepo: true,
                workspacePath: this.workspacePath,
                status: statusSummary,
                rawStatus: statusLines,
                hasChanges: statusSummary.total > 0,
                isClean: statusSummary.total === 0
            };
        } catch (error) {
            return { 
                isGitRepo: false, 
                error: error.message,
                workspacePath: this.workspacePath 
            };
        }
    }

    /**
     * Get current branch information
     */
    async getCurrentBranch() {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const branch = execSync('git branch --show-current', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).trim();

            return { 
                branch,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Check if branch exists (local or remote)
     */
    async branchExists(branchName) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            // Check local branches
            const localBranches = execSync('git branch', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).split('\n')
              .map(line => line.trim())
              .filter(line => line)
              .map(line => line.replace(/^\*?\s*/, ''));

            const isLocal = localBranches.includes(branchName);

            // Check remote branches
            const remoteBranches = execSync('git branch -r', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).split('\n')
              .map(line => line.trim())
              .filter(line => line.startsWith('origin/'))
              .filter(line => !line.includes('HEAD ->'))
              .map(line => line.replace(/^origin\//, ''));

            const isRemote = remoteBranches.includes(branchName);

            return {
                branchName,
                exists: isLocal || isRemote,
                isLocal,
                isRemote,
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get last commit information
     */
    async getLastCommit() {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const lastCommit = execSync('git log -1 --oneline', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).trim();

            const commitHash = execSync('git rev-parse HEAD', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).trim();

            const commitDate = execSync('git log -1 --format=%cd', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).trim();

            return { 
                lastCommit,
                commitHash,
                commitDate,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get remote repository information
     */
    async getRemotes() {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const remotes = execSync('git remote -v', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).split('\n')
              .filter(line => line.trim())
              .map(line => {
                  const parts = line.split('\t');
                  if (parts.length >= 2) {
                      const name = parts[0];
                      const url = parts[1].split(' ')[0];
                      return { name, url };
                  }
                  return null;
              })
              .filter(remote => remote);

            return { 
                remotes,
                hasRemotes: remotes.length > 0,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get comprehensive Git information
     */
    async getFullInfo() {
        const status = await this.getStatus();
        const branch = await this.getCurrentBranch();
        const lastCommit = await this.getLastCommit();
        const remotes = await this.getRemotes();

        return {
            workspacePath: this.workspacePath,
            isGitRepo: status.isGitRepo,
            status,
            branch,
            lastCommit,
            remotes,
            timestamp: new Date().toISOString()
        };
    }
}

// Main execution for testing
async function main() {
    const checker = new GitStatusChecker();
    const info = await checker.getFullInfo();
    
    console.log('\n📊 Git Status Information:');
    console.log('==========================');
    console.log(`Workspace: ${info.workspacePath}`);
    console.log(`Is Git Repo: ${info.isGitRepo}`);
    
    if (info.isGitRepo) {
        console.log(`Current Branch: ${info.branch.branch || 'Unknown'}`);
        console.log(`Status: ${JSON.stringify(info.status.status, null, 2)}`);
        console.log(`Last Commit: ${info.lastCommit.lastCommit || 'Unknown'}`);
        
        if (info.remotes.remotes) {
            console.log('\n🌐 Remotes:');
            info.remotes.remotes.forEach(remote => {
                console.log(`  ${remote.name}: ${remote.url}`);
            });
        }
    } else {
        console.log('❌ Not a Git repository');
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default GitStatusChecker; 