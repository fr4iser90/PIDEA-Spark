#!/usr/bin/env node

/**
 * Git Remote Operations
 * 
 * Dedicated module for Git remote repository management
 * Handles remote URLs, branches, and remote operations
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export class GitRemoteManager {
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
     * List all remotes
     */
    async listRemotes() {
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
                      const type = parts[1].includes('(fetch)') ? 'fetch' : 'push';
                      return { name, url, type };
                  }
                  return null;
              })
              .filter(remote => remote);

            // Group by remote name
            const groupedRemotes = {};
            remotes.forEach(remote => {
                if (!groupedRemotes[remote.name]) {
                    groupedRemotes[remote.name] = {};
                }
                groupedRemotes[remote.name][remote.type] = remote.url;
            });

            return {
                remotes: groupedRemotes,
                count: Object.keys(groupedRemotes).length,
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Add a new remote
     */
    async addRemote(name, url) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync(`git remote add ${name} ${url}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                name,
                url,
                message: `Added remote ${name}: ${url}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Remove a remote
     */
    async removeRemote(name) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync(`git remote remove ${name}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                name,
                message: `Removed remote ${name}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Rename a remote
     */
    async renameRemote(oldName, newName) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync(`git remote rename ${oldName} ${newName}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                oldName,
                newName,
                message: `Renamed remote ${oldName} to ${newName}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Set remote URL
     */
    async setRemoteUrl(name, url) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync(`git remote set-url ${name} ${url}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                name,
                url,
                message: `Set remote ${name} URL to ${url}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get remote URL
     */
    async getRemoteUrl(name) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const url = execSync(`git remote get-url ${name}`, { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).trim();

            return {
                name,
                url,
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Fetch from remote
     */
    async fetchRemote(name = 'origin') {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync(`git fetch ${name}`, { cwd: this.workspacePath });
            
            return { 
                success: true,
                remote: name,
                message: `Fetched from remote ${name}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Fetch all remotes
     */
    async fetchAll() {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync('git fetch --all', { cwd: this.workspacePath });
            
            return { 
                success: true,
                message: 'Fetched from all remotes',
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Push to remote
     */
    async pushToRemote(branch = null, remote = 'origin') {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const pushCommand = branch ? `git push ${remote} ${branch}` : `git push ${remote}`;
            execSync(pushCommand, { cwd: this.workspacePath });
            
            return { 
                success: true,
                remote,
                branch: branch || 'current',
                message: `Pushed to remote ${remote}${branch ? ` branch ${branch}` : ''}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Pull from remote
     */
    async pullFromRemote(branch = null, remote = 'origin') {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const pullCommand = branch ? `git pull ${remote} ${branch}` : `git pull ${remote}`;
            execSync(pullCommand, { cwd: this.workspacePath });
            
            return { 
                success: true,
                remote,
                branch: branch || 'current',
                message: `Pulled from remote ${remote}${branch ? ` branch ${branch}` : ''}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * List remote branches
     */
    async listRemoteBranches(remote = 'origin') {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const branches = execSync(`git branch -r`, { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).split('\n')
              .filter(line => line.trim())
              .filter(line => line.startsWith(`${remote}/`))
              .filter(line => !line.includes('HEAD ->'))
              .map(line => line.trim());

            return {
                remote,
                branches,
                count: branches.length,
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Check if remote exists
     */
    async remoteExists(name) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const remotes = await this.listRemotes();
            if (remotes.error) {
                return remotes;
            }

            return {
                exists: name in remotes.remotes,
                remote: name,
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get remote tracking information
     */
    async getTrackingInfo() {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const tracking = execSync('git branch -vv', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).split('\n')
              .filter(line => line.trim())
              .map(line => {
                  const match = line.match(/^\*?\s*(\S+)\s+([a-f0-9]+)\s+\[([^\]]+)\]/);
                  if (match) {
                      return {
                          branch: match[1],
                          commit: match[2],
                          tracking: match[3]
                      };
                  }
                  return null;
              })
              .filter(info => info);

            return {
                tracking,
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Set upstream branch
     */
    async setUpstream(branch, remote, remoteBranch) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            execSync(`git branch --set-upstream-to=${remote}/${remoteBranch} ${branch}`, { 
                cwd: this.workspacePath 
            });
            
            return { 
                success: true,
                branch,
                remote,
                remoteBranch,
                message: `Set upstream for ${branch} to ${remote}/${remoteBranch}`,
                workspacePath: this.workspacePath 
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get remote status (ahead/behind)
     */
    async getRemoteStatus(branch = null) {
        try {
            if (!this.isGitRepository()) {
                return { error: 'Not a Git repository' };
            }

            const currentBranch = branch || execSync('git branch --show-current', { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).trim();

            const status = execSync(`git status -uno --porcelain --branch`, { 
                cwd: this.workspacePath, 
                encoding: 'utf8' 
            }).split('\n')[0];

            const aheadMatch = status.match(/ahead (\d+)/);
            const behindMatch = status.match(/behind (\d+)/);

            return {
                branch: currentBranch,
                ahead: aheadMatch ? parseInt(aheadMatch[1]) : 0,
                behind: behindMatch ? parseInt(behindMatch[1]) : 0,
                status,
                workspacePath: this.workspacePath
            };
        } catch (error) {
            return { error: error.message };
        }
    }
}

// Main execution for testing
async function main() {
    const remoteManager = new GitRemoteManager();
    
    console.log('\n🌐 Git Remote Operations Test:');
    console.log('==============================');
    
    // Check if Git repository
    if (!remoteManager.isGitRepository()) {
        console.log('❌ Not a Git repository');
        return;
    }
    
    // List remotes
    const remotes = await remoteManager.listRemotes();
    console.log(`📋 Found ${remotes.count} remotes:`);
    
    Object.entries(remotes.remotes).forEach(([name, urls]) => {
        console.log(`  ${name}:`);
        if (urls.fetch) console.log(`    fetch: ${urls.fetch}`);
        if (urls.push) console.log(`    push: ${urls.push}`);
    });
    
    // Get remote status
    const status = await remoteManager.getRemoteStatus();
    console.log(`\n📊 Remote status:`);
    console.log(`  Branch: ${status.branch}`);
    console.log(`  Ahead: ${status.ahead}`);
    console.log(`  Behind: ${status.behind}`);
    
    // List remote branches
    if (remotes.count > 0) {
        const remoteBranches = await remoteManager.listRemoteBranches('origin');
        console.log(`\n🌿 Remote branches (origin): ${remoteBranches.count}`);
        remoteBranches.branches.forEach(branch => {
            console.log(`  ${branch}`);
        });
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default GitRemoteManager; 