#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Template base directory
const TEMPLATE_BASE = path.join(__dirname, '01-project-setup/02-project-structure-creation');
const TASK_BASE = path.join(__dirname);

// Template file names
const TEMPLATE_FILES = {
  index: 'project-structure-creation-index.md',
  implementation: 'project-structure-creation-implementation.md',
  phase: 'project-structure-creation-phase-1.md'
};

// Task categories and their tasks
const TASK_STRUCTURE = {
  '01-project-setup': [
    '01-git-repository-branching',
    '02-project-structure-creation',
    '03-linter-formatter-config',
    '04-build-system-setup',
    '05-package-management',
    '06-code-formatting',
    '07-logging-system',
    '08-config-system',
    '09-documentation',
    '10-ci-cd-skeleton'
  ],
  '02-core-engine': [
    '01-game-loop-basis',
    '02-entity-component-system',
    '03-physics-engine',
    '04-input-handling',
    '05-rendering-pipeline',
    '06-audio-engine',
    '07-ai-pathfinding',
    '08-ai-behavior-trees',
    '09-event-system',
    '10-resource-management',
    '11-serialization',
    '12-plugin-system',
    '13-mod-support',
    '14-performance-benchmarking',
    '15-engine-documentation'
  ],
  '03-frontend-ui': [
    '01-ui-framework-setup',
    '02-main-menu',
    '03-hud-implementation',
    '04-settings-menu',
    '05-inventory-ui',
    '06-responsive-design',
    '07-ui-animations',
    '08-localization-ui',
    '09-accessibility',
    '10-ui-testing'
  ],
  '04-assets-pipeline': [
    '01-asset-pipeline-setup',
    '02-asset-loader',
    '03-texture-optimization',
    '04-spritesheet-integration',
    '05-model-importer',
    '06-audio-assets',
    '07-music-system',
    '08-asset-cache',
    '09-asset-versioning',
    '10-asset-testing'
  ],
  '05-data-persistence': [
    '01-save-load-system',
    '02-cloud-save',
    '03-database-integration',
    '04-data-migration',
    '05-data-security'
  ],
  '06-multiplayer-networking': [
    '01-networking-stack',
    '02-client-server-architecture',
    '03-matchmaking',
    '04-lobby-system',
    '05-realtime-sync',
    '06-lag-compensation',
    '07-anti-cheat',
    '08-network-compression',
    '09-multiplayer-testing',
    '10-network-monitoring'
  ],
  '07-feature-development': [
    '01-movement-core',
    '02-combat-core',
    '03-enemy-spawner',
    '04-leveling-system',
    '05-quest-system',
    '06-crafting-system',
    '07-inventory-logic',
    '08-npc-dialog',
    '09-boss-mechanics',
    '10-skill-trees',
    '11-special-abilities',
    '12-environmental-hazards',
    '13-achievement-system',
    '14-replay-system',
    '15-sandbox-features'
  ],
  '08-testing': [
    '01-unit-test-setup',
    '02-core-engine-tests',
    '03-integration-tests',
    '04-multiplayer-tests',
    '05-ui-tests',
    '06-load-stress-tests',
    '07-security-tests',
    '08-final-test-suite'
  ],
  '09-deployment-distribution': [
    '01-build-scripts',
    '02-ci-cd-pipeline',
    '03-platform-packaging',
    '04-distribution-setup',
    '05-auto-updater'
  ],
  '10-monitoring-analytics': [
    '01-monitoring-dashboard',
    '02-crash-reporting',
    '03-analytics-integration',
    '04-feedback-system',
    '05-patch-management',
    '06-content-pipeline',
    '07-community-tools'
  ],
  '11-genre-specific': [
    '01-genre-core-mechanics',
    '02-genre-ui-elements',
    '03-genre-asset-integration',
    '04-genre-balancing',
    '05-genre-testing',
    '06-genre-performance',
    '07-genre-accessibility',
    '08-genre-localization',
    '09-genre-multiplayer',
    '10-genre-final-polish'
  ]
};

// Task name mappings for better display names
const TASK_NAME_MAPPINGS = {
  '01-git-repository-branching': 'Git Repository Branching',
  '02-project-structure-creation': 'Project Structure Creation',
  '03-linter-formatter-config': 'Linter & Formatter Configuration',
  '04-build-system-setup': 'Build System Setup',
  '05-package-management': 'Package Management',
  '06-code-formatting': 'Code Formatting',
  '07-logging-system': 'Logging System',
  '08-config-system': 'Configuration System',
  '09-documentation': 'Documentation',
  '10-ci-cd-skeleton': 'CI/CD Skeleton',
  '01-game-loop-basis': 'Game Loop Basis',
  '02-entity-component-system': 'Entity Component System',
  '03-physics-engine': 'Physics Engine',
  '04-input-handling': 'Input Handling',
  '05-rendering-pipeline': 'Rendering Pipeline',
  '06-audio-engine': 'Audio Engine',
  '07-ai-pathfinding': 'AI Pathfinding',
  '08-ai-behavior-trees': 'AI Behavior Trees',
  '09-event-system': 'Event System',
  '10-resource-management': 'Resource Management',
  '11-serialization': 'Serialization',
  '12-plugin-system': 'Plugin System',
  '13-mod-support': 'Mod Support',
  '14-performance-benchmarking': 'Performance Benchmarking',
  '15-engine-documentation': 'Engine Documentation',
  '01-ui-framework-setup': 'UI Framework Setup',
  '02-main-menu': 'Main Menu',
  '03-hud-implementation': 'HUD Implementation',
  '04-settings-menu': 'Settings Menu',
  '05-inventory-ui': 'Inventory UI',
  '06-responsive-design': 'Responsive Design',
  '07-ui-animations': 'UI Animations',
  '08-localization-ui': 'Localization UI',
  '09-accessibility': 'Accessibility',
  '10-ui-testing': 'UI Testing',
  '01-asset-pipeline-setup': 'Asset Pipeline Setup',
  '02-asset-loader': 'Asset Loader',
  '03-texture-optimization': 'Texture Optimization',
  '04-spritesheet-integration': 'Spritesheet Integration',
  '05-model-importer': 'Model Importer',
  '06-audio-assets': 'Audio Assets',
  '07-music-system': 'Music System',
  '08-asset-cache': 'Asset Cache',
  '09-asset-versioning': 'Asset Versioning',
  '10-asset-testing': 'Asset Testing',
  '01-save-load-system': 'Save/Load System',
  '02-cloud-save': 'Cloud Save',
  '03-database-integration': 'Database Integration',
  '04-data-migration': 'Data Migration',
  '05-data-security': 'Data Security',
  '01-networking-stack': 'Networking Stack',
  '02-client-server-architecture': 'Client-Server Architecture',
  '03-matchmaking': 'Matchmaking',
  '04-lobby-system': 'Lobby System',
  '05-realtime-sync': 'Realtime Synchronization',
  '06-lag-compensation': 'Lag Compensation',
  '07-anti-cheat': 'Anti-Cheat',
  '08-network-compression': 'Network Compression',
  '09-multiplayer-testing': 'Multiplayer Testing',
  '10-network-monitoring': 'Network Monitoring',
  '01-movement-core': 'Movement Core',
  '02-combat-core': 'Combat Core',
  '03-enemy-spawner': 'Enemy Spawner',
  '04-leveling-system': 'Leveling System',
  '05-quest-system': 'Quest System',
  '06-crafting-system': 'Crafting System',
  '07-inventory-logic': 'Inventory Logic',
  '08-npc-dialog': 'NPC Dialog',
  '09-boss-mechanics': 'Boss Mechanics',
  '10-skill-trees': 'Skill Trees',
  '11-special-abilities': 'Special Abilities',
  '12-environmental-hazards': 'Environmental Hazards',
  '13-achievement-system': 'Achievement System',
  '14-replay-system': 'Replay System',
  '15-sandbox-features': 'Sandbox Features',
  '01-unit-test-setup': 'Unit Test Setup',
  '02-core-engine-tests': 'Core Engine Tests',
  '03-integration-tests': 'Integration Tests',
  '04-multiplayer-tests': 'Multiplayer Tests',
  '05-ui-tests': 'UI Tests',
  '06-load-stress-tests': 'Load & Stress Tests',
  '07-security-tests': 'Security Tests',
  '08-final-test-suite': 'Final Test Suite',
  '01-build-scripts': 'Build Scripts',
  '02-ci-cd-pipeline': 'CI/CD Pipeline',
  '03-platform-packaging': 'Platform Packaging',
  '04-distribution-setup': 'Distribution Setup',
  '05-auto-updater': 'Auto Updater',
  '01-monitoring-dashboard': 'Monitoring Dashboard',
  '02-crash-reporting': 'Crash Reporting',
  '03-analytics-integration': 'Analytics Integration',
  '04-feedback-system': 'Feedback System',
  '05-patch-management': 'Patch Management',
  '06-content-pipeline': 'Content Pipeline',
  '07-community-tools': 'Community Tools',
  '01-genre-core-mechanics': 'Genre Core Mechanics',
  '02-genre-ui-elements': 'Genre UI Elements',
  '03-genre-asset-integration': 'Genre Asset Integration',
  '04-genre-balancing': 'Genre Balancing',
  '05-genre-testing': 'Genre Testing',
  '06-genre-performance': 'Genre Performance',
  '07-genre-accessibility': 'Genre Accessibility',
  '08-genre-localization': 'Genre Localization',
  '09-genre-multiplayer': 'Genre Multiplayer',
  '10-genre-final-polish': 'Genre Final Polish'
};

// Category name mappings
const CATEGORY_NAME_MAPPINGS = {
  '01-project-setup': 'Project Setup',
  '02-core-engine': 'Core Engine',
  '03-frontend-ui': 'Frontend UI',
  '04-assets-pipeline': 'Assets Pipeline',
  '05-data-persistence': 'Data Persistence',
  '06-multiplayer-networking': 'Multiplayer & Networking',
  '07-feature-development': 'Feature Development',
  '08-testing': 'Testing',
  '09-deployment-distribution': 'Deployment & Distribution',
  '10-monitoring-analytics': 'Monitoring & Analytics',
  '11-genre-specific': 'Genre Specific'
};

function readTemplate(templatePath) {
  try {
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error(`❌ Error reading template ${templatePath}:`, error.message);
    return null;
  }
}

function replacePlaceholders(content, taskId, taskName, categoryName, taskDir) {
  return content
    .replace(/\[TASK_ID\]/g, taskId)
    .replace(/\[TASK_NAME\]/g, taskName)
    .replace(/\[CATEGORY\]/g, categoryName)
    .replace(/\[name\]/g, taskDir)
    .replace(/\[CREATED_DATE\]/g, new Date().toISOString())
    .replace(/\[LAST_UPDATED_DATE\]/g, new Date().toISOString())
    .replace(/\[STATUS\]/g, 'pending')
    .replace(/\[PRIORITY\]/g, 'Medium')
    .replace(/\[TIME\]/g, '4h')
    .replace(/\[DEPENDENCIES\]/g, 'None')
    .replace(/\[TYPE\]/g, 'standard-template')
    .replace(/\[GAME_ENGINE\]/g, 'Custom')
    .replace(/\[GAME_GENRE\]/g, 'RPG')
    .replace(/\[DESCRIPTION\]/g, `Implementation of ${taskName.toLowerCase()} for the game development project.`)
    .replace(/\[REQUIREMENT_\d+\]/g, (match) => {
      const num = match.match(/\d+/)[0];
      return `Requirement ${num}`;
    })
    .replace(/\[CRITERIA_\d+\]/g, (match) => {
      const num = match.match(/\d+/)[0];
      return `Success criteria ${num}`;
    })
    .replace(/\[DIRECTORY_\d+\]/g, (match) => {
      const num = match.match(/\d+/)[0];
      return `directory-${num}`;
    })
    .replace(/\[FILE_\d+\]/g, (match) => {
      const num = match.match(/\d+/)[0];
      return `file-${num}.js`;
    })
    .replace(/\[GAME_ENGINE\]/g, 'Custom Engine')
    .replace(/\[VERSION\]/g, '1.0.0')
    .replace(/\[FRAMEWORK\]/g, 'Custom Framework')
    .replace(/\[LIBRARY\]/g, 'Custom Library')
    .replace(/\[TOOLS\]/g, 'Development Tools')
    .replace(/\[PLATFORM\]/g, 'PC')
    .replace(/\[ART_STYLE\]/g, 'Pixel Art')
    .replace(/\[PERFORMANCE\]/g, '60 FPS')
    .replace(/\[TARGET_PLATFORM\]/g, 'Windows')
    .replace(/\[MULTIPLAYER\]/g, 'No')
    .replace(/\[SAVE_SYSTEM\]/g, 'Local')
    .replace(/\[NOTES\]/g, 'Additional notes specific to this task.')
    .replace(/\[LIST_OF_DEPENDENCIES\]/g, 'None')
    .replace(/\[LIST_OF_DEPENDENTS\]/g, 'None')
    .replace(/\[LIST_OF_RELATED_TASKS\]/g, 'None');
}

function createTaskFiles(category, taskDir, taskId) {
  const taskPath = path.join(TASK_BASE, category, taskDir);
  const taskName = TASK_NAME_MAPPINGS[taskDir] || taskDir;
  const categoryName = CATEGORY_NAME_MAPPINGS[category] || category;
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(taskPath)) {
    fs.mkdirSync(taskPath, { recursive: true });
    console.log(`📁 Created directory: ${taskPath}`);
  }

  // Check if files already exist
  const indexFile = path.join(taskPath, `${taskDir}-index.md`);
  const implementationFile = path.join(taskPath, `${taskDir}-implementation.md`);
  const phaseFile = path.join(taskPath, `${taskDir}-phase-1.md`);

  let filesCreated = 0;

  // Create index file
  if (!fs.existsSync(indexFile)) {
    const template = readTemplate(path.join(TEMPLATE_BASE, TEMPLATE_FILES.index));
    if (template) {
      const content = replacePlaceholders(template, taskId, taskName, categoryName, taskDir);
      fs.writeFileSync(indexFile, content);
      console.log(`✅ Created: ${indexFile}`);
      filesCreated++;
    }
  } else {
    console.log(`⏭️  Skipped (exists): ${indexFile}`);
  }

  // Create implementation file
  if (!fs.existsSync(implementationFile)) {
    const template = readTemplate(path.join(TEMPLATE_BASE, TEMPLATE_FILES.implementation));
    if (template) {
      const content = replacePlaceholders(template, taskId, taskName, categoryName, taskDir);
      fs.writeFileSync(implementationFile, content);
      console.log(`✅ Created: ${implementationFile}`);
      filesCreated++;
    }
  } else {
    console.log(`⏭️  Skipped (exists): ${implementationFile}`);
  }

  // Create phase file
  if (!fs.existsSync(phaseFile)) {
    const template = readTemplate(path.join(TEMPLATE_BASE, TEMPLATE_FILES.phase));
    if (template) {
      const content = replacePlaceholders(template, taskId, taskName, categoryName, taskDir);
      fs.writeFileSync(phaseFile, content);
      console.log(`✅ Created: ${phaseFile}`);
      filesCreated++;
    }
  } else {
    console.log(`⏭️  Skipped (exists): ${phaseFile}`);
  }

  return filesCreated;
}

function main() {
  console.log('🚀 Starting Task Template Generation...\n');

  let totalFilesCreated = 0;
  let totalTasksProcessed = 0;

  // Process each category and its tasks
  for (const [category, tasks] of Object.entries(TASK_STRUCTURE)) {
    console.log(`📂 Processing category: ${CATEGORY_NAME_MAPPINGS[category] || category}`);
    
    for (let i = 0; i < tasks.length; i++) {
      const taskDir = tasks[i];
      const taskId = `${category.split('-')[0]}.${i + 1}`;
      
      console.log(`  📋 Processing task: ${TASK_NAME_MAPPINGS[taskDir] || taskDir}`);
      const filesCreated = createTaskFiles(category, taskDir, taskId);
      totalFilesCreated += filesCreated;
      totalTasksProcessed++;
    }
    console.log('');
  }

  console.log('🎉 Task Template Generation Complete!');
  console.log(`📊 Summary:`);
  console.log(`   - Tasks processed: ${totalTasksProcessed}`);
  console.log(`   - Files created: ${totalFilesCreated}`);
  console.log(`   - Templates used: ${Object.keys(TEMPLATE_FILES).join(', ')}`);
  console.log('\n✨ All task directories now have consistent templates!');
}

// Run the script
main(); 