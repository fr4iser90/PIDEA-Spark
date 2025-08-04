#!/usr/bin/env node

/**
 * Central Configuration Module
 * 
 * Contains all configurable settings for the automation system
 * Users can modify these settings to customize the automation behavior
 */

export const CONFIG = {
    // CDP Configuration
    cdp: {
        defaultPort: 9222,
        defaultTarget: 'cursor',
        connectionTimeout: 10000, // 10 seconds
        retryAttempts: 3
    },
    
    // Automation Settings
    automation: {
        defaultTaskId: null,
        dryRun: false,
        verbose: false,
        showMenu: false,
        safetyChecks: true
    },
    
    // File Paths
    paths: {
        projectRoot: process.cwd(),
        tasksDir: 'pidea-spark-output/tasks',
        orchestratorFile: 'pidea-spark-output/tasks/system/orchestrator.md',
        progressFile: 'pidea-spark-output/tasks/system/progress-tracker.md',
        logFile: 'automation-workflow-cdp.log',
        templateDir: 'pidea-spark-output/template/games/template',
        gamesDir: 'pidea-spark-output/games'
    },
    
    // AI Settings
    ai: {
        maxResponseTime: 30000, // 30 seconds
        retryOnFailure: true,
        maxRetries: 3,
        promptTimeout: 60000 // 60 seconds
    },
    
    // Browser Settings
    browser: {
        headless: false,
        slowMo: 100,
        timeout: 30000,
        viewport: { width: 1280, height: 720 }
    },
    
    // Logging
    logging: {
        level: 'INFO', // DEBUG, INFO, WARNING, ERROR
        timestamp: true,
        colors: true,
        fileLogging: true
    },
    
    // Game Development Settings
    game: {
        defaultGenre: 'Action',
        defaultPlatform: 'Browser',
        defaultEngine: 'Web-based',
        defaultLanguage: 'JavaScript'
    }
};

// Helper function to get config value with fallback
export function getConfig(path, defaultValue = null) {
    const keys = path.split('.');
    let value = CONFIG;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return defaultValue;
        }
    }
    
    return value;
}

// Helper function to set config value
export function setConfig(path, value) {
    const keys = path.split('.');
    let current = CONFIG;
    
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
}

// Helper function to load config from file
export async function loadConfigFromFile(configPath = 'automation-config.json') {
    try {
        const fs = await import('fs');
        const path = await import('path');
        
        const fullPath = path.join(process.cwd(), configPath);
        
        if (fs.existsSync(fullPath)) {
            const configData = fs.readFileSync(fullPath, 'utf8');
            const userConfig = JSON.parse(configData);
            
            // Merge user config with default config
            mergeConfig(CONFIG, userConfig);
            console.log(`✅ Loaded configuration from ${configPath}`);
        }
    } catch (error) {
        console.log(`⚠️ Could not load config file: ${error.message}`);
    }
}

// Helper function to save config to file
export async function saveConfigToFile(configPath = 'automation-config.json') {
    try {
        const fs = await import('fs');
        const path = await import('path');
        
        const fullPath = path.join(process.cwd(), configPath);
        const configData = JSON.stringify(CONFIG, null, 2);
        
        fs.writeFileSync(fullPath, configData);
        console.log(`✅ Configuration saved to ${configPath}`);
    } catch (error) {
        console.log(`❌ Could not save config file: ${error.message}`);
    }
}

// Helper function to merge configs
function mergeConfig(target, source) {
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key] || typeof target[key] !== 'object') {
                target[key] = {};
            }
            mergeConfig(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
}

// Helper function to show current config
export function showConfig() {
    console.log('\n🔧 Current Configuration:');
    console.log('========================\n');
    
    console.log('CDP Settings:');
    console.log(`  Default Port: ${CONFIG.cdp.defaultPort}`);
    console.log(`  Default Target: ${CONFIG.cdp.defaultTarget}`);
    console.log(`  Connection Timeout: ${CONFIG.cdp.connectionTimeout}ms`);
    console.log(`  Retry Attempts: ${CONFIG.cdp.retryAttempts}\n`);
    
    console.log('Automation Settings:');
    console.log(`  Safety Checks: ${CONFIG.automation.safetyChecks}`);
    console.log(`  Verbose Mode: ${CONFIG.automation.verbose}`);
    console.log(`  Dry Run: ${CONFIG.automation.dryRun}\n`);
    
    console.log('File Paths:');
    console.log(`  Project Root: ${CONFIG.paths.projectRoot}`);
    console.log(`  Tasks Directory: ${CONFIG.paths.tasksDir}`);
    console.log(`  Orchestrator File: ${CONFIG.paths.orchestratorFile}`);
    console.log(`  Log File: ${CONFIG.paths.logFile}\n`);
    
    console.log('AI Settings:');
    console.log(`  Max Response Time: ${CONFIG.ai.maxResponseTime}ms`);
    console.log(`  Retry On Failure: ${CONFIG.ai.retryOnFailure}`);
    console.log(`  Max Retries: ${CONFIG.ai.maxRetries}\n`);
    
    console.log('Game Development Settings:');
    console.log(`  Default Genre: ${CONFIG.game.defaultGenre}`);
    console.log(`  Default Platform: ${CONFIG.game.defaultPlatform}`);
    console.log(`  Default Engine: ${CONFIG.game.defaultEngine}`);
    console.log(`  Default Language: ${CONFIG.game.defaultLanguage}\n`);
}

// Helper function to create default config file
export async function createDefaultConfigFile(configPath = 'automation-config.json') {
    try {
        const fs = await import('fs');
        const path = await import('path');
        
        const fullPath = path.join(process.cwd(), configPath);
        
        if (!fs.existsSync(fullPath)) {
            const configData = JSON.stringify(CONFIG, null, 2);
            fs.writeFileSync(fullPath, configData);
            console.log(`✅ Created default configuration file: ${configPath}`);
            console.log('📝 You can now edit this file to customize your settings');
        } else {
            console.log(`⚠️ Configuration file already exists: ${configPath}`);
        }
    } catch (error) {
        console.log(`❌ Could not create config file: ${error.message}`);
    }
}

export default CONFIG; 