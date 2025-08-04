#!/usr/bin/env node

/**
 * Git Operations Manager
 * 
 * Centralized Git operations management with CDP integration
 * Handles all Git operations through a unified interface
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export class GitOperationsManager {
    constructor(config = {}, log = console.log) {
        this.config = config;
        this.log = log;
        this.workspacePath = null;
    }

    async initialize() {
        // Try to find workspace path
        await this.findWorkspacePath();
    }

    async findWorkspacePath() {
        try {
            // Import WorkspaceFinder dynamically
            const WorkspaceFinder = (await import('../file-operations/find-workspace.js')).default;
            const finder = new WorkspaceFinder(this.config.cdpPort || 9222);
            
            const connected = await finder.connect();
            if (connected) {
                const workspaceInfo = await finder.getWorkspaceInfo();
                this.workspacePath = workspaceInfo.workspacePath;
                
                if (this.workspacePath) {
                    this.log(`✅ Found workspace for Git operations: ${this.workspacePath}`);
                } else {
                    this.log('⚠️ No workspace found, using current directory');
                    this.workspacePath = process.cwd();
                }
                
                await finder.disconnect();
            } else {
                this.log('⚠️ Could not connect to Cursor IDE, using current directory');
                this.workspacePath = process.cwd();
            }
        } catch (error) {
            this.log(`⚠️ Error finding workspace: ${error.message}, using current directory`);
            this.workspacePath = process.cwd();
        }
    }

    // Basic Git Status Operations
    async getGitStatus() {
        try {
            if (!this.isGitRepository()) {
                return { isGitRepo: false, error: 'Not a Git repository' };
            }

            const status = execSync('git status --porcelain', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            });

            const statusLines = status.split('\n').filter(line => line.trim());
            
            return {
                isGitRepo: true,
                status: {
                    modified: statusLines.filter(line => line.startsWith('M')).length,
                    added: statusLines.filter(line => line.startsWith('A')).length,
                    deleted: statusLines.filter(line => line.startsWith('D')).length,
                    untracked: statusLines.filter(line => line.startsWith('??')).length,
                    renamed: statusLines.filter(line => line.startsWith('R')).length,
                    total: statusLines.length
                },
                rawStatus: statusLines
            };
        } catch (error) {
            return { isGitRepo: false, error: error.message };
        }
    }

    async getCurrentBranch() {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const branch = execSync('git branch --show-current', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).trim();

            return { branch };
        } catch (error) {
            return { error: error.message };
        }
    }

    async getAllBranches() {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const localBranches = execSync('git branch', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).split('\n')
          .map(line => line.trim())
          .filter(line => line)
          .map(line => line.replace(/^\*?\s*/, ''));

            const remoteBranches = execSync('git branch -r', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).split('\n')
          .map(line => line.trim())
          .filter(line => line.startsWith('origin/'))
          .filter(line => !line.includes('HEAD ->'))
          .map(line => line.replace(/^origin\//, ''));

            return {
                local: localBranches,
                remote: remoteBranches,
                all: [...new Set([...localBranches, ...remoteBranches])]
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    async getLastCommit() {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const lastCommit = execSync('git log -1 --oneline', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).trim();

            return { lastCommit };
        } catch (error) {
            return { error: error.message };
        }
    }

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

            return { remotes };
        } catch (error) {
            return { error: error.message };
        }
    }

    // Git Operations
    async addFiles(files = []) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const filesToAdd = files.length > 0 ? files.join(' ') : '.';
            execSync(`git add ${filesToAdd}`, { cwd: this.workspacePath });
            
            this.log(`✅ Added files to staging: ${filesToAdd}`);
            return { success: true };
        } catch (error) {
            return { error: error.message };
        }
    }

    async commit(message) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync(`git commit -m "${message}"`, { cwd: this.workspacePath });
            
            this.log(`✅ Committed with message: ${message}`);
            return { success: true };
        } catch (error) {
            return { error: error.message };
        }
    }

    async push(branch = null) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const pushCommand = branch ? `git push origin ${branch}` : 'git push';
            execSync(pushCommand, { cwd: this.workspacePath });
            
            this.log(`✅ Pushed to remote${branch ? ` branch ${branch}` : ''}`);
            return { success: true };
        } catch (error) {
            return { error: error.message };
        }
    }

    async pull() {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync('git pull', { cwd: this.workspacePath });
            
            this.log('✅ Pulled from remote');
            return { success: true };
        } catch (error) {
            return { error: error.message };
        }
    }

    async createBranch(branchName) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync(`git checkout -b ${branchName}`, { cwd: this.workspacePath });
            
            this.log(`✅ Created and switched to branch: ${branchName}`);
            return { success: true };
        } catch (error) {
            return { error: error.message };
        }
    }

    async switchBranch(branchName) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync(`git checkout ${branchName}`, { cwd: this.workspacePath });
            
            this.log(`✅ Switched to branch: ${branchName}`);
            return { success: true };
    } catch (error) {
            return { error: error.message };
        }
    }

    // Utility Methods
    isGitRepository() {
        if (!this.workspacePath) {
            return false;
        }
        
        const gitPath = path.join(this.workspacePath, '.git');
        return fs.existsSync(gitPath);
    }

    async getFullGitInfo() {
        const status = await this.getGitStatus();
        const branch = await this.getCurrentBranch();
        const branches = await this.getAllBranches();
        const lastCommit = await this.getLastCommit();
        const remotes = await this.getRemotes();

      return {
            workspacePath: this.workspacePath,
            isGitRepo: status.isGitRepo,
            status,
            branch,
            branches,
            lastCommit,
            remotes
        };
    }
}

// Main execution for testing
async function main() {
    const gitManager = new GitOperationsManager();
    await gitManager.initialize();
    
    const gitInfo = await gitManager.getFullGitInfo();
    
    console.log('\n📊 Git Repository Information:');
    console.log('============================');
    console.log(`Workspace: ${gitInfo.workspacePath}`);
    console.log(`Is Git Repo: ${gitInfo.isGitRepo}`);
    
    if (gitInfo.isGitRepo) {
        console.log(`Current Branch: ${gitInfo.branch.branch || 'Unknown'}`);
        console.log(`Status: ${JSON.stringify(gitInfo.status.status, null, 2)}`);
        console.log(`Last Commit: ${gitInfo.lastCommit.lastCommit || 'Unknown'}`);
        
        if (gitInfo.remotes.remotes) {
            console.log('\n🌐 Remotes:');
            gitInfo.remotes.remotes.forEach(remote => {
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

export default GitOperationsManager;
