#!/usr/bin/env node

/**
 * Find Cursor IDE Workspace Path via CDP
 * 
 * This script connects to Cursor IDE via Chrome DevTools Protocol (CDP)
 * and extracts the current workspace path from the IDE's state.
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

class WorkspaceFinder {
    constructor(port = 9222) {
        this.cdpPort = port;
        this.browser = null;
        this.page = null;
    }

    async connect() {
        try {
            console.log(`🔌 Connecting to Cursor IDE on port ${this.cdpPort}...`);
            
            this.browser = await chromium.connectOverCDP(`http://localhost:${this.cdpPort}`);
            
            // Fix: Use the correct method like browser-manager.js
            const contexts = this.browser.contexts();
            console.log(`📋 Found ${contexts.length} browser contexts`);
            
            if (contexts.length === 0) {
                throw new Error('No browser contexts found');
            }
            
            // Get the first context and page
            const context = contexts[0];
            const pages = await context.pages();
            
            if (pages.length === 0) {
                throw new Error('No pages found in Cursor IDE');
            }
            
            // Use the first page (usually the main IDE window)
            this.page = pages[0];
            
            console.log('✅ Connected to Cursor IDE successfully');
            return true;
        } catch (error) {
            console.error(`❌ Failed to connect to Cursor IDE: ${error.message}`);
            return false;
        }
    }

    async findWorkspacePath() {
        if (!this.page) {
            throw new Error('Not connected to Cursor IDE');
        }

        try {
            console.log('🔍 Searching for workspace path...');

            // Method 1: Try to get workspace from VS Code API (Cursor is based on VS Code)
            const workspacePath = await this.page.evaluate(() => {
                // Try multiple approaches to find the workspace path
                
                // Approach 1: Check if VS Code API is available
                if (window.vscode && window.vscode.workspace && window.vscode.workspace.workspaceFolders) {
                    return window.vscode.workspace.workspaceFolders[0]?.uri?.fsPath;
                }
                
                // Approach 2: Look for workspace path in DOM elements
                const workspaceElements = document.querySelectorAll('[data-workspace-path], [data-path], .workspace-path, [title*="/"]');
                for (const element of workspaceElements) {
                    const path = element.getAttribute('data-workspace-path') || 
                                element.getAttribute('data-path') || 
                                element.getAttribute('title') ||
                                element.textContent;
                    if (path && path.includes('/') && !path.includes('http') && path.length > 5) {
                        return path;
                    }
                }
                
                // Approach 3: Check title bar for workspace name
                const titleBar = document.querySelector('.titlebar, .window-title, [role="banner"], .title');
                if (titleBar) {
                    const title = titleBar.textContent || titleBar.innerText;
                    // Extract workspace name from title (usually format: "workspace-name - Cursor")
                    const match = title.match(/([^-]+)\s*-\s*Cursor/);
                    if (match) {
                        return match[1].trim();
                    }
                }
                
                // Approach 4: Look for file explorer paths
                const fileExplorer = document.querySelector('.explorer-viewlet, .file-explorer, [data-testid="file-explorer"], .monaco-list');
                if (fileExplorer) {
                    const pathElements = fileExplorer.querySelectorAll('[title*="/"], [data-path], .monaco-list-row');
                    for (const element of pathElements) {
                        const title = element.getAttribute('title') || element.getAttribute('data-path') || element.textContent;
                        if (title && title.includes('/') && !title.includes('http')) {
                            // Extract the root path from the file path
                            const parts = title.split('/');
                            if (parts.length > 1) {
                                return parts.slice(0, -1).join('/');
                            }
                        }
                    }
                }
                
                // Approach 5: Look for breadcrumb navigation
                const breadcrumbs = document.querySelector('.breadcrumbs, .breadcrumb, [role="navigation"]');
                if (breadcrumbs) {
                    const breadcrumbItems = breadcrumbs.querySelectorAll('li, .breadcrumb-item');
                    for (const item of breadcrumbItems) {
                        const text = item.textContent || item.innerText;
                        if (text && text.includes('/') && !text.includes('http')) {
                            return text;
                        }
                    }
                }
                
                // Approach 6: Check for any element with a path-like title
                const allElements = document.querySelectorAll('[title*="/"]');
                for (const element of allElements) {
                    const title = element.getAttribute('title');
                    if (title && title.includes('/') && !title.includes('http') && title.length > 10) {
                        // Try to extract workspace root from file path
                        const parts = title.split('/');
                        if (parts.length > 2) {
                            // Remove filename and get directory path
                            return parts.slice(0, -1).join('/');
                        }
                    }
                }
                
                // Approach 7: Look for status bar items
                const statusBar = document.querySelector('.statusbar, .status-bar, [role="status"]');
                if (statusBar) {
                    const statusItems = statusBar.querySelectorAll('.statusbar-item, [title*="/"]');
                    for (const item of statusItems) {
                        const title = item.getAttribute('title') || item.textContent;
                        if (title && title.includes('/') && !title.includes('http')) {
                            return title;
                        }
                    }
                }
                
                // Approach 8: Check for any text content that looks like a path
                const allTextNodes = document.querySelectorAll('*');
                for (const node of allTextNodes) {
                    const text = node.textContent || node.innerText;
                    if (text && text.includes('/') && !text.includes('http') && text.length > 10) {
                        // Check if it looks like a file path
                        if (text.match(/^\/[a-zA-Z0-9\/\-_\.]+$/)) {
                            return text;
                        }
                    }
                }
                
                return null;
            });

            if (workspacePath) {
                console.log(`✅ Found workspace path: ${workspacePath}`);
                
                // Check if it's an absolute path
                if (path.isAbsolute(workspacePath)) {
                    return workspacePath;
                } else {
                    // Try to resolve relative path
                    const resolvedPath = await this.resolveRelativePath(workspacePath);
                    if (resolvedPath) {
                        return resolvedPath;
                    }
                }
            }

            // Method 2: Try to get workspace from localStorage
            const localStorageData = await this.page.evaluate(() => {
                try {
                    const keys = Object.keys(localStorage);
                    for (const key of keys) {
                        if (key.includes('workspace') || key.includes('folder') || key.includes('path') || key.includes('root')) {
                            const value = localStorage.getItem(key);
                            if (value && value.includes('/') && !value.includes('http')) {
                                return { key, value };
                            }
                        }
                    }
                    return null;
                } catch (error) {
                    return null;
                }
            });

            if (localStorageData) {
                console.log(`✅ Found workspace in localStorage: ${localStorageData.key} = ${localStorageData.value}`);
                if (path.isAbsolute(localStorageData.value)) {
                    return localStorageData.value;
                } else {
                    const resolvedPath = await this.resolveRelativePath(localStorageData.value);
                    if (resolvedPath) {
                        return resolvedPath;
                    }
                }
            }

            // Method 3: Try to get workspace from sessionStorage
            const sessionStorageData = await this.page.evaluate(() => {
                try {
                    const keys = Object.keys(sessionStorage);
                    for (const key of keys) {
                        if (key.includes('workspace') || key.includes('folder') || key.includes('path') || key.includes('root')) {
                            const value = sessionStorage.getItem(key);
                            if (value && value.includes('/') && !value.includes('http')) {
                                return { key, value };
                            }
                        }
                    }
                    return null;
                } catch (error) {
                    return null;
                }
            });

            if (sessionStorageData) {
                console.log(`✅ Found workspace in sessionStorage: ${sessionStorageData.key} = ${sessionStorageData.value}`);
                if (path.isAbsolute(sessionStorageData.value)) {
                    return sessionStorageData.value;
                } else {
                    const resolvedPath = await this.resolveRelativePath(sessionStorageData.value);
                    if (resolvedPath) {
                        return resolvedPath;
                    }
                }
            }

            // Method 4: Try to get workspace from window object properties
            const windowData = await this.page.evaluate(() => {
                const possibleProps = [
                    'workspacePath',
                    'workspaceFolder',
                    'currentWorkspace',
                    'projectPath',
                    'rootPath',
                    'basePath',
                    'workspaceRoot',
                    'projectRoot'
                ];
                
                for (const prop of possibleProps) {
                    if (window[prop] && typeof window[prop] === 'string' && window[prop].includes('/')) {
                        return window[prop];
                    }
                }
                
                return null;
            });

            if (windowData) {
                console.log(`✅ Found workspace in window object: ${windowData}`);
                if (path.isAbsolute(windowData)) {
                    return windowData;
                } else {
                    const resolvedPath = await this.resolveRelativePath(windowData);
                    if (resolvedPath) {
                        return resolvedPath;
                    }
                }
            }

            // Method 5: Try to get from URL parameters or hash
            const urlData = await this.page.evaluate(() => {
                const url = window.location.href;
                const urlParams = new URLSearchParams(window.location.search);
                const hash = window.location.hash;
                
                // Check URL parameters
                for (const [key, value] of urlParams.entries()) {
                    if (value && value.includes('/') && !value.includes('http')) {
                        return value;
                    }
                }
                
                // Check hash
                if (hash && hash.includes('/') && !hash.includes('http')) {
                    return hash.substring(1); // Remove #
                }
                
                return null;
            });

            if (urlData) {
                console.log(`✅ Found workspace in URL: ${urlData}`);
                if (path.isAbsolute(urlData)) {
                    return urlData;
                } else {
                    const resolvedPath = await this.resolveRelativePath(urlData);
                    if (resolvedPath) {
                        return resolvedPath;
                    }
                }
            }

            // Method 6: Try to get from any script tags or meta tags
            const scriptData = await this.page.evaluate(() => {
                // Check meta tags
                const metaTags = document.querySelectorAll('meta[name*="path"], meta[name*="workspace"], meta[name*="root"]');
                for (const meta of metaTags) {
                    const content = meta.getAttribute('content');
                    if (content && content.includes('/') && !content.includes('http')) {
                        return content;
                    }
                }
                
                // Check script tags with data attributes
                const scriptTags = document.querySelectorAll('script[data-path], script[data-workspace]');
                for (const script of scriptTags) {
                    const path = script.getAttribute('data-path') || script.getAttribute('data-workspace');
                    if (path && path.includes('/') && !path.includes('http')) {
                        return path;
                    }
                }
                
                return null;
            });

            if (scriptData) {
                console.log(`✅ Found workspace in script/meta tags: ${scriptData}`);
                if (path.isAbsolute(scriptData)) {
                    return scriptData;
                } else {
                    const resolvedPath = await this.resolveRelativePath(scriptData);
                    if (resolvedPath) {
                        return resolvedPath;
                    }
                }
            }

            console.log('❌ Could not find workspace path');
            return null;

        } catch (error) {
            console.error(`❌ Error finding workspace path: ${error.message}`);
            return null;
        }
    }

    async findWorkspaceFromFileSystem() {
        try {
            console.log('🔍 Searching for workspace from file system...');
            
            // Start from current directory and search up
            let currentDir = process.cwd();
            const maxDepth = 10;
            let depth = 0;
            
            while (currentDir !== '/' && depth < maxDepth) {
                console.log(`🔍 Checking directory: ${currentDir}`);
                
                // Check for workspace indicators
                const indicators = [
                    '.vscode',
                    '.cursor',
                    'package.json',
                    'tsconfig.json',
                    'webpack.config.js',
                    'vite.config.js',
                    'angular.json',
                    'pom.xml',
                    'build.gradle',
                    'Cargo.toml',
                    'requirements.txt',
                    'setup.py',
                    'Gemfile',
                    'composer.json',
                    'go.mod',
                    'pubspec.yaml',
                    'project.json',
                    'workspace.code-workspace',
                    '.git',
                    '.svn',
                    '.hg'
                ];
                
                for (const indicator of indicators) {
                    const indicatorPath = path.join(currentDir, indicator);
                    if (fs.existsSync(indicatorPath)) {
                        console.log(`✅ Found workspace indicator: ${indicator} in ${currentDir}`);
                        return currentDir;
                    }
                }
                
                // Check if this directory contains the relative path we found
                const relativePath = 'pidea-spark-output/320250804';
                const fullPath = path.join(currentDir, relativePath);
                if (fs.existsSync(fullPath)) {
                    console.log(`✅ Found relative path in: ${currentDir}`);
                    return currentDir;
                }
                
                // Move up one directory
                currentDir = path.dirname(currentDir);
                depth++;
            }
            
            console.log('❌ Could not find workspace from file system');
            return null;
        } catch (error) {
            console.error(`❌ Error searching file system: ${error.message}`);
            return null;
        }
    }

    async findWorkspaceFromTitle() {
        try {
            console.log('🔍 Extracting workspace from page title...');
            
            const pageTitle = await this.page.evaluate(() => {
                return document.title;
            });
            
            console.log(`📄 Page title: ${pageTitle}`);
            
            // Extract workspace name from title (format: "filename - workspace - Cursor")
            const titleMatch = pageTitle.match(/([^-]+)\s*-\s*Cursor/);
            if (titleMatch) {
                const workspaceName = titleMatch[1].trim();
                console.log(`🎯 Extracted workspace name: ${workspaceName}`);
                
                // Search for this workspace starting from current directory and going up
                let currentDir = process.cwd();
                const maxDepth = 10;
                let depth = 0;
                
                while (currentDir !== '/' && depth < maxDepth) {
                    const workspacePath = path.join(currentDir, workspaceName);
                    if (fs.existsSync(workspacePath)) {
                        console.log(`✅ Found workspace: ${workspacePath}`);
                        return workspacePath;
                    }
                    
                    // Move up one directory
                    currentDir = path.dirname(currentDir);
                    depth++;
                }
                
                console.log(`❌ Could not find workspace: ${workspaceName}`);
                return null;
            }
            
            console.log('❌ Could not extract workspace name from title');
            return null;
        } catch (error) {
            console.error(`❌ Error finding workspace from title: ${error.message}`);
            return null;
        }
    }

    async resolveRelativePath(relativePath) {
        try {
            console.log(`🔄 Trying to resolve relative path: ${relativePath}`);
            
            // Try to find the absolute path by searching from current directory up
            const possibleRoots = [
                process.cwd(),
                path.resolve(process.cwd(), '..'),
                path.resolve(process.cwd(), '../..'),
                path.resolve(process.cwd(), '../../..'),
                path.resolve(process.cwd(), '../../../..'),
                path.resolve(process.cwd(), '../../../../..')
            ];

            for (const root of possibleRoots) {
                const fullPath = path.resolve(root, relativePath);
                if (fs.existsSync(fullPath)) {
                    console.log(`✅ Resolved to absolute path: ${fullPath}`);
                    return fullPath;
                }
            }

            // Try to find by searching for the directory name
            const dirName = path.basename(relativePath);
            console.log(`🔍 Searching for directory: ${dirName}`);
            
            for (const root of possibleRoots) {
                const searchPath = path.join(root, dirName);
                if (fs.existsSync(searchPath)) {
                    console.log(`✅ Found directory: ${searchPath}`);
                    return searchPath;
                }
            }

            console.log(`❌ Could not resolve relative path: ${relativePath}`);
            return null;
        } catch (error) {
            console.error(`❌ Error resolving relative path: ${error.message}`);
            return null;
        }
    }

    async getCurrentFile() {
        if (!this.page) {
            throw new Error('Not connected to Cursor IDE');
        }

        try {
            const currentFile = await this.page.evaluate(() => {
                // Try to get current file from VS Code API
                if (window.vscode && window.vscode.window.activeTextEditor) {
                    return window.vscode.window.activeTextEditor.document.uri.fsPath;
                }
                
                // Try to get from DOM elements
                const activeTab = document.querySelector('.tab.active, .editor-tab.active, [data-testid="tab-active"]');
                if (activeTab) {
                    const title = activeTab.getAttribute('title') || activeTab.textContent;
                    if (title && title.includes('/')) {
                        return title;
                    }
                }
                
                return null;
            });

            if (currentFile) {
                console.log(`📄 Current file: ${currentFile}`);
                return currentFile;
            }

            return null;
        } catch (error) {
            console.error(`❌ Error getting current file: ${error.message}`);
            return null;
        }
    }

    async getWorkspaceInfo() {
        // Try to find workspace from title first (most reliable)
        let workspacePath = await this.findWorkspaceFromTitle();
        
        // If that didn't work, try the other methods
        if (!workspacePath) {
            workspacePath = await this.findWorkspacePath();
        }
        
        const currentFile = await this.getCurrentFile();
        
        const info = {
            workspacePath,
            currentFile,
            workspaceName: workspacePath ? path.basename(workspacePath) : null,
            isGitRepo: false,
            gitRoot: null
        };

        // Check if it's a git repository
        if (workspacePath && fs.existsSync(workspacePath)) {
            const gitPath = path.join(workspacePath, '.git');
            if (fs.existsSync(gitPath)) {
                info.isGitRepo = true;
                info.gitRoot = workspacePath;
            }
        }

        return info;
    }

    async debugPageContent() {
        if (!this.page) {
            throw new Error('Not connected to Cursor IDE');
        }

        try {
            console.log('🔍 Debugging page content...');

            const debugInfo = await this.page.evaluate(() => {
                const info = {
                    title: document.title,
                    url: window.location.href,
                    hasVscode: !!window.vscode,
                    localStorageKeys: [],
                    sessionStorageKeys: [],
                    windowProps: [],
                    elementsWithTitle: [],
                    elementsWithDataPath: [],
                    statusBarItems: [],
                    fileExplorerElements: [],
                    allElementsWithPath: [],
                    breadcrumbElements: [],
                    titleBarElements: []
                };

                // Get localStorage keys
                try {
                    info.localStorageKeys = Object.keys(localStorage).filter(key => 
                        key.includes('workspace') || key.includes('folder') || key.includes('path') || key.includes('root')
                    );
                } catch (e) {}

                // Get sessionStorage keys
                try {
                    info.sessionStorageKeys = Object.keys(sessionStorage).filter(key => 
                        key.includes('workspace') || key.includes('folder') || key.includes('path') || key.includes('root')
                    );
                } catch (e) {}

                // Get window properties
                const possibleProps = [
                    'workspacePath', 'workspaceFolder', 'currentWorkspace', 'projectPath', 
                    'rootPath', 'basePath', 'workspaceRoot', 'projectRoot'
                ];
                info.windowProps = possibleProps.filter(prop => window[prop]);

                // Get elements with title containing path
                const titleElements = document.querySelectorAll('[title*="/"]');
                info.elementsWithTitle = Array.from(titleElements).slice(0, 20).map(el => ({
                    tag: el.tagName,
                    className: el.className,
                    id: el.id,
                    title: el.getAttribute('title'),
                    text: el.textContent?.substring(0, 100)
                }));

                // Get elements with data-path
                const dataPathElements = document.querySelectorAll('[data-path]');
                info.elementsWithDataPath = Array.from(dataPathElements).slice(0, 20).map(el => ({
                    tag: el.tagName,
                    className: el.className,
                    id: el.id,
                    dataPath: el.getAttribute('data-path'),
                    text: el.textContent?.substring(0, 100)
                }));

                // Get status bar items
                const statusBar = document.querySelector('.statusbar, .status-bar, [role="status"]');
                if (statusBar) {
                    const statusItems = statusBar.querySelectorAll('.statusbar-item, [title]');
                    info.statusBarItems = Array.from(statusItems).slice(0, 20).map(el => ({
                        tag: el.tagName,
                        className: el.className,
                        id: el.id,
                        title: el.getAttribute('title'),
                        text: el.textContent?.substring(0, 100)
                    }));
                }

                // Get file explorer elements
                const fileExplorer = document.querySelector('.explorer-viewlet, .file-explorer, .monaco-list');
                if (fileExplorer) {
                    const explorerItems = fileExplorer.querySelectorAll('[title], [data-path], .monaco-list-row');
                    info.fileExplorerElements = Array.from(explorerItems).slice(0, 20).map(el => ({
                        tag: el.tagName,
                        className: el.className,
                        id: el.id,
                        title: el.getAttribute('title'),
                        dataPath: el.getAttribute('data-path'),
                        text: el.textContent?.substring(0, 100)
                    }));
                }

                // Get breadcrumb elements
                const breadcrumbs = document.querySelector('.breadcrumbs, .breadcrumb, [role="navigation"]');
                if (breadcrumbs) {
                    const breadcrumbItems = breadcrumbs.querySelectorAll('li, .breadcrumb-item, *');
                    info.breadcrumbElements = Array.from(breadcrumbItems).slice(0, 20).map(el => ({
                        tag: el.tagName,
                        className: el.className,
                        id: el.id,
                        text: el.textContent?.substring(0, 100)
                    }));
                }

                // Get title bar elements
                const titleBar = document.querySelector('.titlebar, .window-title, [role="banner"], .title');
                if (titleBar) {
                    const titleBarItems = titleBar.querySelectorAll('*');
                    info.titleBarElements = Array.from(titleBarItems).slice(0, 20).map(el => ({
                        tag: el.tagName,
                        className: el.className,
                        id: el.id,
                        text: el.textContent?.substring(0, 100)
                    }));
                }

                // Get all elements that might contain path information
                const allElements = document.querySelectorAll('*');
                info.allElementsWithPath = Array.from(allElements).slice(0, 50).map(el => {
                    const text = el.textContent || el.innerText;
                    const title = el.getAttribute('title');
                    const dataPath = el.getAttribute('data-path');
                    
                    if ((text && text.includes('/') && text.length > 10) || 
                        (title && title.includes('/') && title.length > 10) ||
                        (dataPath && dataPath.includes('/') && dataPath.length > 10)) {
                        return {
                            tag: el.tagName,
                            className: el.className,
                            id: el.id,
                            text: text?.substring(0, 100),
                            title: title,
                            dataPath: dataPath
                        };
                    }
                    return null;
                }).filter(Boolean);

                return info;
            });

            console.log('\n📊 Debug Information:');
            console.log('====================');
            console.log(`Title: ${debugInfo.title}`);
            console.log(`URL: ${debugInfo.url}`);
            console.log(`Has VS Code API: ${debugInfo.hasVscode}`);
            console.log(`LocalStorage Keys: ${debugInfo.localStorageKeys.join(', ')}`);
            console.log(`SessionStorage Keys: ${debugInfo.sessionStorageKeys.join(', ')}`);
            console.log(`Window Properties: ${debugInfo.windowProps.join(', ')}`);
            
            if (debugInfo.elementsWithTitle.length > 0) {
                console.log('\n🔍 Elements with title containing path:');
                debugInfo.elementsWithTitle.forEach((el, i) => {
                    console.log(`  ${i + 1}. ${el.tag}.${el.className}#${el.id}: "${el.title}"`);
                });
            }

            if (debugInfo.elementsWithDataPath.length > 0) {
                console.log('\n🔍 Elements with data-path:');
                debugInfo.elementsWithDataPath.forEach((el, i) => {
                    console.log(`  ${i + 1}. ${el.tag}.${el.className}#${el.id}: "${el.dataPath}"`);
                });
            }

            if (debugInfo.statusBarItems.length > 0) {
                console.log('\n🔍 Status Bar Items:');
                debugInfo.statusBarItems.forEach((item, i) => {
                    console.log(`  ${i + 1}. ${item.tag}.${item.className}#${item.id}: "${item.title}"`);
                });
            }

            if (debugInfo.fileExplorerElements.length > 0) {
                console.log('\n🔍 File Explorer Elements:');
                debugInfo.fileExplorerElements.forEach((el, i) => {
                    console.log(`  ${i + 1}. ${el.tag}.${el.className}#${el.id}: "${el.title || el.dataPath}"`);
                });
            }

            if (debugInfo.breadcrumbElements.length > 0) {
                console.log('\n🔍 Breadcrumb Elements:');
                debugInfo.breadcrumbElements.forEach((el, i) => {
                    console.log(`  ${i + 1}. ${el.tag}.${el.className}#${el.id}: "${el.text}"`);
                });
            }

            if (debugInfo.titleBarElements.length > 0) {
                console.log('\n🔍 Title Bar Elements:');
                debugInfo.titleBarElements.forEach((el, i) => {
                    console.log(`  ${i + 1}. ${el.tag}.${el.className}#${el.id}: "${el.text}"`);
                });
            }

            if (debugInfo.allElementsWithPath.length > 0) {
                console.log('\n🔍 All Elements with Path Information:');
                debugInfo.allElementsWithPath.forEach((el, i) => {
                    console.log(`  ${i + 1}. ${el.tag}.${el.className}#${el.id}:`);
                    if (el.text) console.log(`     Text: "${el.text}"`);
                    if (el.title) console.log(`     Title: "${el.title}"`);
                    if (el.dataPath) console.log(`     Data-Path: "${el.dataPath}"`);
                });
            }

            return debugInfo;
        } catch (error) {
            console.error(`❌ Error debugging page content: ${error.message}`);
            return null;
        }
    }

    async disconnect() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔌 Disconnected from Cursor IDE');
        }
    }
}

// Main execution
async function main() {
    const port = process.argv[2] || 9222;
    const finder = new WorkspaceFinder(port);
    
    try {
        const connected = await finder.connect();
        if (!connected) {
            console.log('\n💡 To start Cursor IDE with CDP enabled, run:');
            console.log('cursor --remote-debugging-port=9222');
            process.exit(1);
        }

        const workspaceInfo = await finder.getWorkspaceInfo();
        
        console.log('\n📊 Workspace Information:');
        console.log('========================');
        console.log(`Workspace Path: ${workspaceInfo.workspacePath || 'Not found'}`);
        console.log(`Workspace Name: ${workspaceInfo.workspaceName || 'Not found'}`);
        console.log(`Current File: ${workspaceInfo.currentFile || 'Not found'}`);
        console.log(`Git Repository: ${workspaceInfo.isGitRepo ? 'Yes' : 'No'}`);
        console.log(`Git Root: ${workspaceInfo.gitRoot || 'N/A'}`);

        if (workspaceInfo.workspacePath) {
            console.log('\n✅ Successfully found workspace path!');
        } else {
            console.log('\n❌ Could not determine workspace path');
            console.log('\n🔍 Running debug analysis...');
            await finder.debugPageContent();
        }

    } catch (error) {
        console.error(`💥 Error: ${error.message}`);
        process.exit(1);
    } finally {
        await finder.disconnect();
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default WorkspaceFinder;
