#!/usr/bin/env node

/**
 * Project Detector Module
 * 
 * Automatically detects and lists all available game projects
 * Scans pidea-spark-output directory for orchestrator files
 * Integrates with WorkspaceFinder to create projects in correct Cursor workspace
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ProjectDetector {
    constructor(config = {}) {
        this.outputDir = 'pidea-spark-output';
        this.config = config;
        this.workspacePath = null;
        this.setupLogging();
    }

    setupLogging() {
        this.log = (message, level = 'INFO') => {
            const timestamp = new Date().toISOString();
            const logEntry = `[${timestamp}] [${level}] ${message}`;
            console.log(logEntry);
        };
    }

    async initialize() {
        // Try to find Cursor workspace
        await this.findCursorWorkspace();
    }

    async findCursorWorkspace() {
        try {
            this.log('🔍 Looking for Cursor IDE workspace...');
            
            // Import WorkspaceFinder dynamically
            const WorkspaceFinder = (await import('../file-operations/find-workspace.js')).default;
            const finder = new WorkspaceFinder(this.config.cdpPort || 9222);
            
            const connected = await finder.connect();
            if (connected) {
                const workspaceInfo = await finder.getWorkspaceInfo();
                this.workspacePath = workspaceInfo.workspacePath;
                
                if (this.workspacePath) {
                    this.log(`✅ Found Cursor workspace: ${this.workspacePath}`);
                    // Update output directory to be in the workspace
                    this.outputDir = path.join(this.workspacePath, 'pidea-spark-output');
                } else {
                    this.log('⚠️ Could not find Cursor workspace, using local directory');
                }
                
                await finder.disconnect();
            } else {
                this.log('⚠️ Could not connect to Cursor IDE, using local directory');
            }
        } catch (error) {
            this.log(`⚠️ Error finding workspace: ${error.message}, using local directory`);
        }
    }

    async detectProjects() {
        this.log('🔍 Detecting available projects...');
        
        const projects = [];
        const ideas = [];
        
        try {
            // Check if output directory exists
            if (!fs.existsSync(this.outputDir)) {
                this.log('📁 Creating output directory', 'INFO');
                fs.mkdirSync(this.outputDir, { recursive: true });
                return { projects, ideas };
            }
            
            // Scan for project directories
            const projectDirs = fs.readdirSync(this.outputDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);
            
            for (const projectDir of projectDirs) {
                const projectPath = path.join(this.outputDir, projectDir);
                const systemPath = path.join(projectPath, 'system');
                const orchestratorPath = path.join(systemPath, 'orchestrator.md');
                
                if (fs.existsSync(orchestratorPath)) {
                    // Full project with orchestrator
                    const projectInfo = await this.getProjectInfo(projectDir, orchestratorPath);
                    projects.push(projectInfo);
                } else {
                    // Check if it's an idea folder
                    const ideaInfo = await this.checkForIdea(projectDir, projectPath);
                    if (ideaInfo) {
                        ideas.push(ideaInfo);
                    }
                }
            }
            
            this.log(`✅ Found ${projects.length} projects and ${ideas.length} ideas`);
            return { projects, ideas };
            
        } catch (error) {
            this.log(`❌ Error detecting projects: ${error.message}`, 'ERROR');
            return { projects: [], ideas: [] };
        }
    }

    async getProjectInfo(projectName, orchestratorPath) {
        try {
            const content = fs.readFileSync(orchestratorPath, 'utf8');
            
            // Extract project metadata
            const metadata = this.extractMetadata(content);
            
            // Count tasks and their status
            const taskStats = this.analyzeTasks(content);
            
            return {
                name: projectName,
                path: orchestratorPath,
                systemPath: path.dirname(orchestratorPath),
                metadata: metadata,
                stats: taskStats,
                lastModified: fs.statSync(orchestratorPath).mtime
            };
            
        } catch (error) {
            this.log(`❌ Error reading project ${projectName}: ${error.message}`, 'ERROR');
            return {
                name: projectName,
                path: orchestratorPath,
                systemPath: path.dirname(orchestratorPath),
                metadata: {},
                stats: { total: 0, completed: 0, inProgress: 0, pending: 0 },
                lastModified: new Date()
            };
        }
    }

    extractMetadata(content) {
        const metadata = {};
        
        // Extract title
        const titleMatch = content.match(/^# (.+)$/m);
        if (titleMatch) {
            metadata.title = titleMatch[1];
        }
        
        // Extract description
        const descMatch = content.match(/## Description\s*\n\s*(.+?)(?=\n##|\n$)/s);
        if (descMatch) {
            metadata.description = descMatch[1].trim();
        }
        
        // Extract game type
        const typeMatch = content.match(/## Game Type\s*\n\s*(.+?)(?=\n##|\n$)/s);
        if (typeMatch) {
            metadata.gameType = typeMatch[1].trim();
        }
        
        return metadata;
    }

    analyzeTasks(content) {
        const taskLines = content.split('\n').filter(line => line.match(/^\| [0-9]+ \|/));
        
        let total = taskLines.length;
        let completed = 0;
        let inProgress = 0;
        let pending = 0;
        
        for (const line of taskLines) {
            const parts = line.split('|').map(part => part.trim());
            if (parts.length >= 5) {
                const status = parts[4].toLowerCase();
                
                if (status.includes('completed') || status.includes('done')) {
                    completed++;
                } else if (status.includes('in progress') || status.includes('working')) {
                    inProgress++;
                } else {
                    pending++;
                }
            }
        }
        
        return { total, completed, inProgress, pending };
    }

    async checkForIdea(projectDir, projectPath) {
        try {
            // Look for idea files
            const ideaFiles = [
                'idea.md',
                'concept.md',
                'game-idea.md',
                'project-idea.md',
                'description.md',
                'README.md'
            ];
            
            for (const ideaFile of ideaFiles) {
                const ideaPath = path.join(projectPath, ideaFile);
                if (fs.existsSync(ideaPath)) {
                    const content = fs.readFileSync(ideaPath, 'utf8');
                    
                    // Check if content is readable (not empty and has some structure)
                    if (content.trim().length > 50) {
                        const ideaInfo = await this.extractIdeaInfo(projectDir, ideaPath, content);
                        return ideaInfo;
                    }
                }
            }
            
            // Check if directory has any markdown files
            const files = fs.readdirSync(projectPath);
            const markdownFiles = files.filter(file => file.endsWith('.md'));
            
            if (markdownFiles.length > 0) {
                // Use the first markdown file as idea
                const ideaPath = path.join(projectPath, markdownFiles[0]);
                const content = fs.readFileSync(ideaPath, 'utf8');
                
                if (content.trim().length > 50) {
                    const ideaInfo = await this.extractIdeaInfo(projectDir, ideaPath, content);
                    return ideaInfo;
                }
            }
            
            return null;
            
        } catch (error) {
            this.log(`❌ Error checking idea ${projectDir}: ${error.message}`, 'ERROR');
            return null;
        }
    }

    async extractIdeaInfo(projectDir, ideaPath, content) {
        try {
            // Extract idea metadata
            const metadata = this.extractIdeaMetadata(content);
            
            return {
                name: projectDir,
                type: 'idea',
                path: ideaPath,
                projectPath: path.dirname(ideaPath),
                metadata: metadata,
                content: content.substring(0, 500) + (content.length > 500 ? '...' : ''), // Preview
                lastModified: fs.statSync(ideaPath).mtime,
                canConvertToProject: true
            };
            
        } catch (error) {
            this.log(`❌ Error extracting idea info ${projectDir}: ${error.message}`, 'ERROR');
            return {
                name: projectDir,
                type: 'idea',
                path: ideaPath,
                projectPath: path.dirname(ideaPath),
                metadata: {},
                content: 'Error reading idea content',
                lastModified: new Date(),
                canConvertToProject: false
            };
        }
    }

    extractIdeaMetadata(content) {
        const metadata = {};
        
        // Extract title from first line or filename
        const lines = content.split('\n');
        const firstLine = lines[0].trim();
        if (firstLine.startsWith('# ')) {
            metadata.title = firstLine.substring(2);
        } else if (firstLine.length > 0) {
            metadata.title = firstLine;
        }
        
        // Extract description (first paragraph)
        const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
        if (paragraphs.length > 0) {
            const firstPara = paragraphs[0].replace(/^#+\s*/, '').trim();
            if (firstPara.length > 0) {
                metadata.description = firstPara.substring(0, 200) + (firstPara.length > 200 ? '...' : '');
            }
        }
        
        // Extract game type if mentioned
        const gameTypeMatch = content.match(/game\s*type[:\s]+([^\n]+)/i);
        if (gameTypeMatch) {
            metadata.gameType = gameTypeMatch[1].trim();
        }
        
        // Extract genre if mentioned
        const genreMatch = content.match(/genre[:\s]+([^\n]+)/i);
        if (genreMatch) {
            metadata.genre = genreMatch[1].trim();
        }
        
        return metadata;
    }

    async createProjectStructure(projectName) {
        this.log(`🆕 Creating project structure for: ${projectName}`);
        
        // Ensure we have the latest workspace info
        if (!this.workspacePath) {
            await this.findCursorWorkspace();
        }
        
        // Create project directly in pidea-spark-output (no subdirectory)
        const projectPath = this.outputDir;
        const systemPath = path.join(projectPath, 'system');
        const tasksPath = path.join(projectPath, 'tasks');
        
        try {
            // Create directories
            fs.mkdirSync(projectPath, { recursive: true });
            fs.mkdirSync(systemPath, { recursive: true });
            fs.mkdirSync(tasksPath, { recursive: true });
            
            // Create default orchestrator
            const orchestratorPath = path.join(systemPath, 'orchestrator.md');
            const defaultOrchestrator = this.generateDefaultOrchestrator(projectName);
            fs.writeFileSync(orchestratorPath, defaultOrchestrator);
            
            // Create progress tracker
            const progressPath = path.join(systemPath, 'progress-tracker.md');
            const defaultProgress = this.generateDefaultProgress(projectName);
            fs.writeFileSync(progressPath, defaultProgress);
            
            this.log(`✅ Project structure created: ${projectPath}`);
            return projectPath;
            
        } catch (error) {
            this.log(`❌ Error creating project structure: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    generateDefaultOrchestrator(projectName) {
        return `# ${projectName} - Game Project Orchestrator

## Description
Automated game development project for: ${projectName}

## Game Type
To be defined

## Task Orchestrator

| ID | Task Name | Dependencies | Status | Progress | Notes |
|----|-----------|--------------|--------|----------|-------|
| 1 | Project Setup | - | Pending | 0% | Initial project setup |
| 2 | Game Design | - | Pending | 0% | Define game mechanics |
| 3 | Technical Architecture | 1,2 | Pending | 0% | Plan technical structure |

## Project Metadata
- Created: ${new Date().toISOString()}
- Status: Planning
- Version: 1.0.0
`;
    }

    generateDefaultProgress(projectName) {
        return `# ${projectName} - Progress Tracker

## Project Status
- **Status**: Planning
- **Last Updated**: ${new Date().toISOString()}
- **Total Tasks**: 3
- **Completed**: 0
- **In Progress**: 0
- **Pending**: 3

## Recent Activity
- Project created: ${new Date().toISOString()}

## Next Steps
1. Define game concept
2. Plan technical architecture
3. Set up development environment
`;
    }

    getProjectPath(projectName) {
        return this.outputDir;
    }

    getOrchestratorPath(projectName) {
        return path.join(this.outputDir, 'system', 'orchestrator.md');
    }

    getProgressPath(projectName) {
        return path.join(this.outputDir, 'system', 'progress-tracker.md');
    }

    // NEW: Get workspace information
    getWorkspaceInfo() {
        return {
            workspacePath: this.workspacePath,
            outputDir: this.outputDir,
            isInWorkspace: !!this.workspacePath
        };
    }
}

export default ProjectDetector; 