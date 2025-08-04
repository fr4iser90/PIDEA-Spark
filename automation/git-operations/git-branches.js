#!/usr/bin/env node

/**
 * Git Branch Operations
 * 
 * Dedicated module for Git branch management
 * Handles branch creation, switching, listing, and management
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export class GitBranchManager {
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
     * Get all branches (local and remote)
     */
    async getAllBranches() {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            // Get local branches
            const localBranches = execSync('git branch', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).split('\n')
              .map(line => line.trim())
              .filter(line => line)
              .map(line => {
                  const isCurrent = line.startsWith('*');
                  const branchName = line.replace(/^\*?\s*/, '');
                  return { name: branchName, isCurrent, type: 'local' };
              });

            // Get remote branches
            const remoteBranches = execSync('git branch -r', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).split('\n')
              .map(line => line.trim())
              .filter(line => line.startsWith('origin/'))
              .filter(line => !line.includes('HEAD ->'))
              .map(line => {
                  const branchName = line.replace(/^origin\//, '');
                  return { name: branchName, isCurrent: false, type: 'remote' };
              });

            // Get current branch
            const currentBranch = execSync('git branch --show-current', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).trim();

            return {
                local: localBranches,
                remote: remoteBranches,
                current: currentBranch,
                all: [...localBranches, ...remoteBranches],
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get current branch
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
     * Check if branch exists
     */
    async branchExists(branchName) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const branches = await this.getAllBranches();
            if (branches.error) {
                return branches;
            }

            const localExists = branches.local.some(b => b.name === branchName);
            const remoteExists = branches.remote.some(b => b.name === branchName);

            return {
                branchName,
                exists: localExists || remoteExists,
                isLocal: localExists,
                isRemote: remoteExists,
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Create a new branch
     */
    async createBranch(branchName) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            // Check if branch already exists
            const exists = await this.branchExists(branchName);
            if (exists.exists) {
                return { error: `Branch '${branchName}' already exists` };
            }

            execSync(`git checkout -b ${branchName}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                branchName,
                message: `Created and switched to branch: ${branchName}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Switch to an existing branch
     */
    async switchBranch(branchName) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            // Check if branch exists
            const exists = await this.branchExists(branchName);
            if (!exists.exists) {
                return { error: `Branch '${branchName}' does not exist` };
            }

            execSync(`git checkout ${branchName}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                branchName,
                message: `Switched to branch: ${branchName}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Delete a branch
     */
    async deleteBranch(branchName, force = false) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            // Check if branch exists
            const exists = await this.branchExists(branchName);
            if (!exists.exists) {
                return { error: `Branch '${branchName}' does not exist` };
            }

            // Check if trying to delete current branch
            const current = await this.getCurrentBranch();
            if (current.branch === branchName) {
                return { error: `Cannot delete current branch '${branchName}'` };
            }

            const command = force ? `git branch -D ${branchName}` : `git branch -d ${branchName}`;
            execSync(command, { cwd: this.workspacePath });
            
            return { 
                success: true,
                branchName,
                message: `Deleted branch: ${branchName}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Merge a branch into current branch
     */
    async mergeBranch(branchName) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            // Check if branch exists
            const exists = await this.branchExists(branchName);
            if (!exists.exists) {
                return { error: `Branch '${branchName}' does not exist` };
            }

            // Check if trying to merge current branch
            const current = await this.getCurrentBranch();
            if (current.branch === branchName) {
                return { error: `Cannot merge current branch '${branchName}' into itself` };
            }

            execSync(`git merge ${branchName}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                branchName,
                message: `Merged branch '${branchName}' into '${current.branch}'`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get branch information
     */
    async getBranchInfo(branchName) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const exists = await this.branchExists(branchName);
            if (!exists.exists) {
                return { error: `Branch '${branchName}' does not exist` };
            }

            const current = await this.getCurrentBranch();
            const isCurrent = current.branch === branchName;

            // Get last commit on branch
            const lastCommit = execSync(`git log -1 --oneline ${branchName}`, { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).trim();

            // Get commit count
            const commitCount = execSync(`git rev-list --count ${branchName}`, { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).trim();

            return {
                branchName,
                isCurrent,
                isLocal: exists.isLocal,
                isRemote: exists.isRemote,
                lastCommit,
                commitCount: parseInt(commitCount),
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }
}

// Main execution for testing
async function main() {
    const branchManager = new GitBranchManager();
    const branches = await branchManager.getAllBranches();
    
    console.log('\n🌿 Git Branch Information:');
    console.log('==========================');
    
    if (branches.error) {
        console.log(`❌ Error: ${branches.error}`);
        return;
    }
    
    console.log(`Current Branch: ${branches.current}`);
    console.log(`Workspace: ${branches.workspacePath}`);
    
    console.log('\n📋 Local Branches:');
    branches.local.forEach(branch => {
        const indicator = branch.isCurrent ? '→ ' : '  ';
        console.log(`${indicator}${branch.name}`);
    });
    
    if (branches.remote.length > 0) {
        console.log('\n🌐 Remote Branches:');
        branches.remote.forEach(branch => {
            console.log(`  ${branch.name}`);
        });
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default GitBranchManager; 