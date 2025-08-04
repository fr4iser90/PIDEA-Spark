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

// Task-specific content mappings
const TASK_SPECIFIC_CONTENT = {
  // Project Setup Tasks
  '01-git-repository-branching': {
    description: 'Set up Git repository with proper branching strategy and workflow for collaborative game development.',
    requirements: [
      '[GIT_BRANCH_STRATEGY] - Define branching strategy (main, develop, feature branches)',
      '[GIT_WORKFLOW] - Set up Git workflow and commit conventions',
      '[GIT_HOOKS] - Configure pre-commit and post-commit hooks',
      '[GIT_PERMISSIONS] - Set up branch protection rules',
      '[GIT_INTEGRATION] - Integrate with CI/CD pipeline'
    ],
    success_criteria: [
      '[REPOSITORY_STRUCTURE] - Repository structure follows GitFlow or similar strategy',
      '[BRANCH_PROTECTION] - Main branch is protected with required reviews',
      '[COMMIT_STANDARDS] - Commit messages follow conventional commits format',
      '[HOOKS_WORKING] - Pre-commit hooks prevent bad commits',
      '[CI_INTEGRATION] - CI/CD pipeline triggers on branch pushes'
    ],
    files: [
      '[GITIGNORE_FILE] - .gitignore configured for game development',
      '[GIT_HOOKS_DIR] - Git hooks directory with custom scripts',
      '[BRANCH_CONFIG] - Branch protection configuration',
      '[WORKFLOW_DOCS] - Git workflow documentation'
    ]
  },
  '02-project-structure-creation': {
    description: 'Create organized project structure with proper folder hierarchy for game development.',
    requirements: [
      '[FOLDER_HIERARCHY] - Define logical folder structure for game components',
      '[NAMING_CONVENTIONS] - Establish consistent naming conventions',
      '[MODULE_SEPARATION] - Separate code into logical modules',
      '[ASSET_ORGANIZATION] - Organize assets by type and purpose',
      '[DOCUMENTATION_STRUCTURE] - Set up documentation folder structure'
    ],
    success_criteria: [
      '[STRUCTURE_CLEAR] - Project structure is intuitive and well-organized',
      '[NAVIGATION_EASY] - Easy to navigate and find specific files',
      '[SCALABILITY] - Structure supports project growth',
      '[TEAM_UNDERSTANDING] - Team members understand the structure',
      '[DOCUMENTATION_COMPLETE] - Structure is documented'
    ],
    files: [
      '[PROJECT_STRUCTURE] - Main project directory structure',
      '[README_FILE] - Project README with structure explanation',
      '[FOLDER_TEMPLATES] - Template folders for new components',
      '[STRUCTURE_DOCS] - Detailed structure documentation'
    ]
  },
  '03-linter-formatter-config': {
    description: 'Configure code linting and formatting tools for consistent code quality.',
    requirements: [
      '[LINTER_SETUP] - Set up ESLint or similar linter for code quality',
      '[FORMATTER_CONFIG] - Configure Prettier or similar formatter',
      '[RULES_DEFINITION] - Define coding standards and rules',
      '[EDITOR_INTEGRATION] - Integrate with development editors',
      '[CI_INTEGRATION] - Integrate linting in CI/CD pipeline'
    ],
    success_criteria: [
      '[LINTING_WORKS] - Linter catches code quality issues',
      '[FORMATTING_CONSISTENT] - Code formatting is consistent across team',
      '[RULES_ENFORCED] - Coding standards are enforced automatically',
      '[EDITOR_SUPPORT] - Editors show linting errors in real-time',
      '[CI_BLOCKS] - CI pipeline blocks commits with linting errors'
    ],
    files: [
      '[ESLINT_CONFIG] - ESLint configuration file',
      '[PRETTIER_CONFIG] - Prettier configuration file',
      '[EDITOR_CONFIG] - Editor configuration files',
      '[LINT_SCRIPTS] - NPM scripts for linting and formatting'
    ]
  },

  // Core Engine Tasks
  '01-game-loop-basis': {
    description: 'Implement core game loop with proper timing and frame management.',
    requirements: [
      '[LOOP_STRUCTURE] - Create main game loop with update and render cycles',
      '[TIMING_SYSTEM] - Implement precise timing and delta time calculation',
      '[FRAME_RATE] - Set up frame rate limiting and vsync support',
      '[STATE_MANAGEMENT] - Implement game state management (menu, playing, paused)',
      '[PERFORMANCE_MONITORING] - Add performance monitoring and profiling'
    ],
    success_criteria: [
      '[STABLE_FPS] - Game maintains consistent frame rate',
      '[SMOOTH_ANIMATION] - Animations are smooth and responsive',
      '[STATE_TRANSITIONS] - Game states transition smoothly',
      '[PERFORMANCE_GOOD] - Performance meets target requirements',
      '[DEBUGGING_SUPPORT] - Performance issues can be identified'
    ],
    files: [
      '[GAME_LOOP_JS] - Main game loop implementation',
      '[TIMING_UTILS] - Timing and performance utilities',
      '[STATE_MANAGER] - Game state management system',
      '[PERFORMANCE_MONITOR] - Performance monitoring tools'
    ]
  },
  '02-entity-component-system': {
    description: 'Implement Entity-Component-System architecture for flexible game object management.',
    requirements: [
      '[ENTITY_MANAGER] - Create entity management system',
      '[COMPONENT_SYSTEM] - Implement component-based architecture',
      '[SYSTEM_PROCESSOR] - Create system processors for component logic',
      '[QUERY_SYSTEM] - Implement efficient entity querying',
      '[MEMORY_OPTIMIZATION] - Optimize memory usage and garbage collection'
    ],
    success_criteria: [
      '[ECS_WORKING] - ECS system functions correctly',
      '[PERFORMANCE_SCALABLE] - System scales with entity count',
      '[COMPONENT_FLEXIBLE] - Components can be easily added/removed',
      '[QUERY_EFFICIENT] - Entity queries are fast and efficient',
      '[MEMORY_EFFICIENT] - Memory usage is optimized'
    ],
    files: [
      '[ENTITY_MANAGER_JS] - Entity management system',
      '[COMPONENT_BASE] - Base component classes',
      '[SYSTEM_PROCESSOR] - System processing logic',
      '[ECS_UTILS] - ECS utility functions'
    ]
  },

  // Frontend UI Tasks
  '01-ui-framework-setup': {
    description: 'Set up UI framework and component system for game user interface.',
    requirements: [
      '[UI_FRAMEWORK] - Choose and integrate UI framework (React, Vue, etc.)',
      '[COMPONENT_SYSTEM] - Create reusable UI component library',
      '[THEME_SYSTEM] - Implement theming and styling system',
      '[RESPONSIVE_DESIGN] - Set up responsive design principles',
      '[ACCESSIBILITY] - Implement accessibility features'
    ],
    success_criteria: [
      '[UI_RESPONSIVE] - UI adapts to different screen sizes',
      '[COMPONENTS_REUSABLE] - UI components are reusable',
      '[THEME_CONSISTENT] - Theming is consistent across UI',
      '[ACCESSIBILITY_COMPLIANT] - UI meets accessibility standards',
      '[PERFORMANCE_GOOD] - UI performance is smooth'
    ],
    files: [
      '[UI_FRAMEWORK_CONFIG] - UI framework configuration',
      '[COMPONENT_LIBRARY] - Reusable UI components',
      '[THEME_SYSTEM] - Theming and styling system',
      '[UI_UTILS] - UI utility functions'
    ]
  },

  // Assets Pipeline Tasks
  '01-asset-pipeline-setup': {
    description: 'Set up automated asset processing pipeline for game assets.',
    requirements: [
      '[PIPELINE_STRUCTURE] - Define asset processing pipeline structure',
      '[ASSET_TYPES] - Support for different asset types (textures, models, audio)',
      '[PROCESSING_TOOLS] - Integrate asset processing tools',
      '[OPTIMIZATION_RULES] - Define asset optimization rules',
      '[VERSION_CONTROL] - Implement asset version control'
    ],
    success_criteria: [
      '[PIPELINE_AUTOMATED] - Asset processing is automated',
      '[ASSETS_OPTIMIZED] - Assets are properly optimized',
      '[FORMATS_SUPPORTED] - All required asset formats supported',
      '[VERSIONING_WORKS] - Asset versioning works correctly',
      '[PERFORMANCE_GOOD] - Pipeline performance is acceptable'
    ],
    files: [
      '[PIPELINE_CONFIG] - Asset pipeline configuration',
      '[PROCESSING_SCRIPTS] - Asset processing scripts',
      '[OPTIMIZATION_RULES] - Asset optimization rules',
      '[PIPELINE_DOCS] - Pipeline documentation'
    ]
  },
  '06-audio-assets': {
    description: 'Create and optimize audio assets including sound effects and music.',
    requirements: [
      '[SOUND_EFFECTS] - Create comprehensive sound effects library',
      '[MUSIC_TRACKS] - Compose and produce background music',
      '[AUDIO_FORMATS] - Support multiple audio formats (WAV, MP3, OGG)',
      '[VOLUME_BALANCING] - Balance volume levels across all audio',
      '[AUDIO_COMPRESSION] - Apply appropriate audio compression'
    ],
    success_criteria: [
      '[AUDIO_QUALITY] - Audio quality meets game requirements',
      '[FORMATS_COMPATIBLE] - Audio formats work on target platforms',
      '[VOLUME_BALANCED] - Audio levels are properly balanced',
      '[FILE_SIZES_OPTIMIZED] - Audio file sizes are optimized',
      '[AUDIO_INTEGRATED] - Audio integrates well with game'
    ],
    files: [
      '[SOUND_EFFECTS_DIR] - Sound effects library',
      '[MUSIC_TRACKS_DIR] - Background music tracks',
      '[AUDIO_CONFIG] - Audio configuration files',
      '[AUDIO_METADATA] - Audio metadata and documentation'
    ]
  },

  // Data Persistence Tasks
  '01-save-load-system': {
    description: 'Implement save and load system for game progress and settings.',
    requirements: [
      '[SAVE_FORMAT] - Define save file format and structure',
      '[SAVE_LOCATIONS] - Implement save file storage locations',
      '[DATA_SERIALIZATION] - Create data serialization system',
      '[SAVE_UI] - Implement save/load user interface',
      '[SAVE_VALIDATION] - Add save file validation and error handling'
    ],
    success_criteria: [
      '[SAVE_RELIABLE] - Save system is reliable and doesn\'t corrupt data',
      '[LOAD_WORKS] - Load system correctly restores game state',
      '[SAVE_UI_INTUITIVE] - Save/load UI is intuitive to use',
      '[ERROR_HANDLING] - Errors are handled gracefully',
      '[PERFORMANCE_GOOD] - Save/load operations are fast'
    ],
    files: [
      '[SAVE_MANAGER] - Save/load system manager',
      '[SAVE_FORMAT_SPEC] - Save file format specification',
      '[SAVE_UI_COMPONENTS] - Save/load UI components',
      '[SAVE_UTILS] - Save/load utility functions'
    ]
  },

  // Multiplayer Tasks
  '01-networking-stack': {
    description: 'Implement networking stack for multiplayer game functionality.',
    requirements: [
      '[NETWORK_PROTOCOL] - Define network protocol for game communication',
      '[CLIENT_SERVER] - Implement client-server architecture',
      '[CONNECTION_MANAGEMENT] - Handle connection establishment and maintenance',
      '[DATA_SYNCHRONIZATION] - Synchronize game state across clients',
      '[LATENCY_HANDLING] - Implement latency compensation'
    ],
    success_criteria: [
      '[CONNECTIONS_STABLE] - Network connections are stable',
      '[SYNC_ACCURATE] - Game state synchronization is accurate',
      '[LATENCY_ACCEPTABLE] - Latency is within acceptable limits',
      '[SCALABILITY] - System scales with player count',
      '[ERROR_RECOVERY] - Network errors are handled gracefully'
    ],
    files: [
      '[NETWORK_MANAGER] - Network management system',
      '[PROTOCOL_SPEC] - Network protocol specification',
      '[SYNC_SYSTEM] - State synchronization system',
      '[NETWORK_UTILS] - Network utility functions'
    ]
  },

  // Feature Development Tasks
  '01-movement-core': {
    description: 'Implement core movement system for player and entity movement.',
    requirements: [
      '[MOVEMENT_TYPES] - Support different movement types (walk, run, jump)',
      '[PHYSICS_INTEGRATION] - Integrate with physics system',
      '[INPUT_HANDLING] - Handle movement input from various sources',
      '[ANIMATION_SYNC] - Synchronize movement with animations',
      '[COLLISION_DETECTION] - Implement collision detection for movement'
    ],
    success_criteria: [
      '[MOVEMENT_SMOOTH] - Movement feels smooth and responsive',
      '[PHYSICS_ACCURATE] - Physics integration is accurate',
      '[INPUT_RESPONSIVE] - Input handling is responsive',
      '[ANIMATION_SYNCED] - Animations sync with movement',
      '[COLLISION_WORKS] - Collision detection works correctly'
    ],
    files: [
      '[MOVEMENT_SYSTEM] - Core movement system',
      '[MOVEMENT_COMPONENTS] - Movement-related components',
      '[INPUT_HANDLER] - Movement input handling',
      '[MOVEMENT_UTILS] - Movement utility functions'
    ]
  },

  // Testing Tasks
  '01-unit-test-setup': {
    description: 'Set up unit testing framework and testing infrastructure.',
    requirements: [
      '[TEST_FRAMEWORK] - Choose and configure testing framework (Jest, Mocha, etc.)',
      '[TEST_STRUCTURE] - Define test file structure and organization',
      '[MOCKING_SYSTEM] - Set up mocking and stubbing capabilities',
      '[COVERAGE_REPORTING] - Implement test coverage reporting',
      '[CI_INTEGRATION] - Integrate testing with CI/CD pipeline'
    ],
    success_criteria: [
      '[TESTS_RUNNING] - All tests run successfully',
      '[COVERAGE_ADEQUATE] - Test coverage meets requirements',
      '[MOCKING_WORKS] - Mocking system works correctly',
      '[CI_INTEGRATED] - Tests run automatically in CI',
      '[DEBUGGING_SUPPORT] - Failed tests provide useful debugging info'
    ],
    files: [
      '[TEST_CONFIG] - Testing framework configuration',
      '[TEST_UTILS] - Testing utility functions',
      '[MOCK_FACTORIES] - Mock and stub factories',
      '[TEST_DOCS] - Testing documentation'
    ]
  },

  // Genre Specific Tasks
  '10-genre-final-polish': {
    description: 'Apply final polish and optimizations specific to the game genre.',
    requirements: [
      '[PERFORMANCE_OPTIMIZATION] - Optimize performance for target platforms',
      '[BALANCE_ADJUSTMENTS] - Fine-tune game balance and difficulty',
      '[POLISH_EFFECTS] - Add polish effects (particles, animations, sounds)',
      '[BUG_FIXES] - Fix remaining bugs and issues',
      '[USER_EXPERIENCE] - Polish user experience and interface'
    ],
    success_criteria: [
      '[PERFORMANCE_TARGETS] - Performance meets target requirements',
      '[BALANCE_ENJOYABLE] - Game balance is enjoyable and fair',
      '[POLISH_VISIBLE] - Polish effects enhance the experience',
      '[BUGS_MINIMAL] - Critical bugs are fixed',
      '[UX_SMOOTH] - User experience is smooth and intuitive'
    ],
    files: [
      '[POLISH_CONFIG] - Polish configuration files',
      '[BALANCE_DATA] - Game balance data files',
      '[POLISH_ASSETS] - Polish effect assets',
      '[POLISH_DOCS] - Polish implementation documentation'
    ]
  }
};

// Category-specific technology mappings
const CATEGORY_TECHNOLOGIES = {
  '01-project-setup': {
    game_engine: 'Custom Engine',
    framework: 'Node.js / Web Technologies',
    library: 'Development Tools',
    tools: 'Git, ESLint, Prettier, Webpack'
  },
  '02-core-engine': {
    game_engine: 'Custom Engine',
    framework: 'WebGL / Canvas API',
    library: 'Math Libraries, Physics Libraries',
    tools: 'Performance Profilers, Debug Tools'
  },
  '03-frontend-ui': {
    game_engine: 'Custom Engine',
    framework: 'React / Vue.js',
    library: 'UI Component Libraries',
    tools: 'CSS Preprocessors, Design Systems'
  },
  '04-assets-pipeline': {
    game_engine: 'Custom Engine',
    framework: 'Asset Processing Tools',
    library: 'Image Processing, Audio Processing',
    tools: 'Texture Packers, Model Converters'
  },
  '05-data-persistence': {
    game_engine: 'Custom Engine',
    framework: 'Database Systems',
    library: 'Serialization Libraries',
    tools: 'Data Migration Tools'
  },
  '06-multiplayer-networking': {
    game_engine: 'Custom Engine',
    framework: 'WebSocket / WebRTC',
    library: 'Networking Libraries',
    tools: 'Network Analyzers, Load Testers'
  },
  '07-feature-development': {
    game_engine: 'Custom Engine',
    framework: 'Game Development Framework',
    library: 'AI Libraries, Animation Libraries',
    tools: 'Level Editors, Animation Tools'
  },
  '08-testing': {
    game_engine: 'Custom Engine',
    framework: 'Testing Frameworks',
    library: 'Mock Libraries, Assertion Libraries',
    tools: 'Test Runners, Coverage Tools'
  },
  '09-deployment-distribution': {
    game_engine: 'Custom Engine',
    framework: 'Build Tools',
    library: 'Packaging Libraries',
    tools: 'CI/CD Tools, Distribution Platforms'
  },
  '10-monitoring-analytics': {
    game_engine: 'Custom Engine',
    framework: 'Analytics Frameworks',
    library: 'Monitoring Libraries',
    tools: 'Analytics Tools, Monitoring Dashboards'
  },
  '11-genre-specific': {
    game_engine: 'Custom Engine',
    framework: 'Genre-Specific Frameworks',
    library: 'Genre-Specific Libraries',
    tools: 'Genre-Specific Tools'
  }
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

function getTaskSpecificContent(taskDir) {
  return TASK_SPECIFIC_CONTENT[taskDir] || {
    description: `Implementation of ${TASK_NAME_MAPPINGS[taskDir] || taskDir} for the game development project.`,
    requirements: [
      '[TASK_SPECIFIC_REQ_1] - Define specific requirement for this task',
      '[TASK_SPECIFIC_REQ_2] - Implement specific functionality',
      '[TASK_SPECIFIC_REQ_3] - Configure specific settings',
      '[TASK_SPECIFIC_REQ_4] - Test specific features',
      '[TASK_SPECIFIC_REQ_5] - Document specific implementation'
    ],
    success_criteria: [
      '[TASK_SPECIFIC_CRITERIA_1] - Specific measurable outcome',
      '[TASK_SPECIFIC_CRITERIA_2] - Specific functionality working',
      '[TASK_SPECIFIC_CRITERIA_3] - Specific performance target met',
      '[TASK_SPECIFIC_CRITERIA_4] - Specific integration successful',
      '[TASK_SPECIFIC_CRITERIA_5] - Specific documentation complete'
    ],
    files: [
      '[TASK_SPECIFIC_FILE_1] - Specific file for this task',
      '[TASK_SPECIFIC_FILE_2] - Specific configuration file',
      '[TASK_SPECIFIC_FILE_3] - Specific documentation file',
      '[TASK_SPECIFIC_FILE_4] - Specific utility file'
    ]
  };
}

function getCategoryTechnologies(category) {
  return CATEGORY_TECHNOLOGIES[category] || {
    game_engine: 'Custom Engine',
    framework: 'Custom Framework',
    library: 'Custom Library',
    tools: 'Development Tools'
  };
}

function readTemplate(templatePath) {
  try {
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error(`❌ Error reading template ${templatePath}:`, error.message);
    return null;
  }
}

function replacePlaceholders(content, taskId, taskName, categoryName, taskDir) {
  const taskContent = getTaskSpecificContent(taskDir);
  const categoryTech = getCategoryTechnologies(taskDir.split('-')[0] + '-' + taskDir.split('-')[1]);
  
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
    .replace(/\[GAME_ENGINE\]/g, '[GAME_ENGINE]')
    .replace(/\[GAME_GENRE\]/g, '[GAME_GENRE]')
    .replace(/\[DESCRIPTION\]/g, taskContent.description)
    .replace(/\[REQUIREMENT_1\]/g, taskContent.requirements[0])
    .replace(/\[REQUIREMENT_2\]/g, taskContent.requirements[1])
    .replace(/\[REQUIREMENT_3\]/g, taskContent.requirements[2])
    .replace(/\[REQUIREMENT_4\]/g, taskContent.requirements[3])
    .replace(/\[REQUIREMENT_5\]/g, taskContent.requirements[4])
    .replace(/\[CRITERIA_1\]/g, taskContent.success_criteria[0])
    .replace(/\[CRITERIA_2\]/g, taskContent.success_criteria[1])
    .replace(/\[CRITERIA_3\]/g, taskContent.success_criteria[2])
    .replace(/\[CRITERIA_4\]/g, taskContent.success_criteria[3])
    .replace(/\[CRITERIA_5\]/g, taskContent.success_criteria[4])
    .replace(/\[DIRECTORY_1\]/g, taskContent.files[0])
    .replace(/\[DIRECTORY_2\]/g, taskContent.files[1])
    .replace(/\[DIRECTORY_3\]/g, taskContent.files[2])
    .replace(/\[FILE_1\]/g, taskContent.files[0])
    .replace(/\[FILE_2\]/g, taskContent.files[1])
    .replace(/\[FILE_3\]/g, taskContent.files[2])
    .replace(/\[VERSION\]/g, '[VERSION]')
    .replace(/\[FRAMEWORK\]/g, '[FRAMEWORK]')
    .replace(/\[LIBRARY\]/g, '[LIBRARY]')
    .replace(/\[TOOLS\]/g, '[TOOLS]')
    .replace(/\[PLATFORM\]/g, '[PLATFORM]')
    .replace(/\[ART_STYLE\]/g, '[ART_STYLE]')
    .replace(/\[PERFORMANCE\]/g, '[PERFORMANCE]')
    .replace(/\[TARGET_PLATFORM\]/g, '[TARGET_PLATFORM]')
    .replace(/\[MULTIPLAYER\]/g, '[MULTIPLAYER]')
    .replace(/\[SAVE_SYSTEM\]/g, '[SAVE_SYSTEM]')
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
    const template = readTemplate(path.join(TEMPLATE_BASE, 'project-structure-creation-index.md'));
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
    const template = readTemplate(path.join(TEMPLATE_BASE, 'project-structure-creation-implementation.md'));
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
    const template = readTemplate(path.join(TEMPLATE_BASE, 'project-structure-creation-phase-1.md'));
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
  console.log('🚀 Starting Specific Task Template Generation...\n');

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

  console.log('🎉 Specific Task Template Generation Complete!');
  console.log(`📊 Summary:`);
  console.log(`   - Tasks processed: ${totalTasksProcessed}`);
  console.log(`   - Files created: ${totalFilesCreated}`);
  console.log('\n✨ All task directories now have task-specific templates!');
}

// Task structure (same as before)
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

let totalFilesCreated = 0;
let totalTasksProcessed = 0;

// Run the script
main(); 