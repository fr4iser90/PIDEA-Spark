#!/usr/bin/env node

/**
 * Template Manager Module
 * 
 * Handles all template-related file operations:
 * - Game project template creation
 * - Template structure management
 * - Template file generation
 * - Template customization
 */

import fs from 'fs';
import path from 'path';

export class TemplateManager {
    constructor(config, log) {
        this.config = config;
        this.log = log;
        this.templateDir = config.templateDir || 'docs/template/games/template';
        this.gamesDir = config.gamesDir || 'docs/games';
    }

    async createGameProjectTemplate(gameName, gameType, genre) {
        this.log(`🎮 Creating game project template: ${gameName}`);
        
        const gameDir = path.join(this.gamesDir, gameName);
        
        try {
            // Create game directory
            if (!fs.existsSync(gameDir)) {
                fs.mkdirSync(gameDir, { recursive: true });
                this.log(`📁 Created game directory: ${gameDir}`);
            }

            // Copy template structure
            await this.copyTemplateStructure(gameDir);
            
            // Generate game-specific files
            await this.generateGameFiles(gameDir, gameName, gameType, genre);
            
            // Update orchestrator with game details
            await this.updateOrchestrator(gameDir, gameName, gameType, genre);
            
            this.log(`✅ Game project template created successfully: ${gameName}`);
            return gameDir;
            
        } catch (error) {
            this.log(`❌ Error creating game template: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async copyTemplateStructure(gameDir) {
        this.log('📋 Copying template structure...');
        
        // Create comprehensive task directory structure with 100+ granular tasks
        const taskStructure = {
            '01-project-setup': [
                '01-git-repository-branching',
                '02-project-structure',
                '03-linter-formatter-config',
                '04-typescript-build-setup',
                '05-package-management',
                '06-eslint-prettier-setup',
                '07-basis-logging-system',
                '08-config-system',
                '09-basis-documentation',
                '10-ci-cd-skeleton'
            ],
            '02-core-engine': [
                '01-game-loop-basis',
                '02-entity-component-system',
                '03-physics-engine-integration',
                '04-input-handling',
                '05-rendering-pipeline-setup',
                '06-audio-engine-integration',
                '07-ai-pathfinding-basis',
                '08-ai-behavior-trees',
                '09-event-system',
                '10-resource-management',
                '11-serialization-savegames',
                '12-plugin-system',
                '13-mod-support-grundstruktur',
                '14-performance-benchmarking',
                '15-engine-documentation'
            ],
            '03-frontend-ui': [
                '01-ui-framework-setup',
                '02-hauptmenu-implementation',
                '03-hud-implementation',
                '04-optionsmenu-audio-video-steuerung',
                '05-inventar-ui-komponenten',
                '06-responsive-design',
                '07-animationen-ui',
                '08-localization-support-ui',
                '09-accessibility-features',
                '10-ui-tests'
            ],
            '04-assets-art-pipeline': [
                '01-asset-pipeline-setup',
                '02-asset-loader',
                '03-texture-kompression-optimierung',
                '04-spritesheet-integration',
                '05-3d-modell-importer',
                '06-sound-assets-handling',
                '07-musik-looping-cues',
                '08-asset-cache',
                '09-asset-versionierung',
                '10-asset-tests'
            ],
            '05-data-persistence': [
                '01-save-load-system',
                '02-cloud-save-integration',
                '03-datenbank-anbindung',
                '04-data-migration',
                '05-encryption-integrity-check'
            ],
            '06-multiplayer-networking': [
                '01-networking-stack-auswahl',
                '02-client-server-architektur',
                '03-matchmaking-basis',
                '04-lobby-system',
                '05-realtime-sync',
                '06-lag-compensation',
                '07-security-anti-cheat',
                '08-network-compression',
                '09-multiplayer-testing',
                '10-netzwerk-monitoring'
            ],
            '07-feature-development': [
                '01-movement-core',
                '02-combat-core',
                '03-enemy-spawner',
                '04-leveling-system',
                '05-quest-system',
                '06-crafting-system',
                '07-inventory-logic',
                '08-npc-dialog-system',
                '09-boss-mechanics',
                '10-skill-trees',
                '11-special-abilities',
                '12-environmental-hazards',
                '13-achievement-system',
                '14-replay-system',
                '15-sandbox-features'
            ],
            '08-testing': [
                '01-unit-tests-setup',
                '02-core-engine-unit-tests',
                '03-integration-tests',
                '04-multiplayer-tests',
                '05-ui-tests',
                '06-load-stress-tests',
                '07-security-penetration-tests',
                '08-final-test-suite'
            ],
            '09-deployment-distribution': [
                '01-build-scripts',
                '02-ci-cd-pipeline',
                '03-packaging-plattformen',
                '04-distribution-setup',
                '05-auto-updater'
            ],
            '10-monitoring-analytics': [
                '01-monitoring-dashboard',
                '02-crash-reporting',
                '03-analytics-integration',
                '04-feedback-system',
                '05-patch-management',
                '06-post-launch-content-pipeline',
                '07-community-support-tools'
            ],
            '11-game-action': [
                '01-combat-system',
                '02-weapon-system',
                '03-enemy-ai',
                '04-boss-battles',
                '05-combo-system',
                '06-damage-system',
                '07-hit-detection',
                '08-movement-mechanics',
                '09-cover-system',
                '10-stealth-mechanics'
            ],
            '12-game-strategy': [
                '01-resource-management',
                '02-unit-system',
                '03-ai-strategy',
                '04-map-system',
                '05-diplomacy-system',
                '06-research-tree',
                '07-economy-system',
                '08-tactical-combat',
                '09-fog-of-war',
                '10-victory-conditions'
            ],
            '13-game-puzzle': [
                '01-puzzle-mechanics',
                '02-level-design',
                '03-hint-system',
                '04-scoring-system',
                '05-progression-system',
                '06-puzzle-generator',
                '07-solution-validator',
                '08-difficulty-curve',
                '09-puzzle-variations',
                '10-tutorial-system'
            ],
            '14-game-simulation': [
                '01-physics-engine',
                '02-life-simulation',
                '03-weather-system',
                '04-time-system',
                '05-economy-simulation',
                '06-social-simulation',
                '07-realistic-ai',
                '08-emergence-systems',
                '09-procedural-generation',
                '10-simulation-balancing'
            ],
            '15-game-adventure': [
                '01-story-system',
                '02-dialogue-system',
                '03-exploration-system',
                '04-inventory-puzzles',
                '05-character-relationships',
                '06-world-building',
                '07-narrative-branching',
                '08-cutscene-system',
                '09-environmental-storytelling',
                '10-choice-consequences'
            ],
            '16-game-sports': [
                '01-team-management',
                '02-match-system',
                '03-scoring-system',
                '04-player-stats',
                '05-league-system',
                '06-training-system',
                '07-replay-system',
                '08-physics-simulation',
                '09-ai-opponents',
                '10-multiplayer-leagues'
            ],
            '17-game-racing': [
                '01-vehicle-system',
                '02-track-system',
                '03-physics-engine',
                '04-ai-drivers',
                '05-upgrade-system',
                '06-championship-mode',
                '07-multiplayer-racing',
                '08-damage-system',
                '09-weather-effects',
                '10-replay-system'
            ],
            '18-game-horror': [
                '01-atmosphere-system',
                '02-sound-design',
                '03-jump-scare-system',
                '04-survival-mechanics',
                '05-fear-progression',
                '06-environmental-storytelling',
                '07-sanity-system',
                '08-light-shadow-system',
                '09-ai-behavior',
                '10-puzzle-horror-elements'
            ],
            '19-game-arcade': [
                '01-score-system',
                '02-power-up-system',
                '03-level-progression',
                '04-bonus-rounds',
                '05-high-score-tables',
                '06-coin-system',
                '07-arcade-cabinet',
                '08-quick-play-modes',
                '09-difficulty-scaling',
                '10-retro-aesthetics'
            ],
            '20-game-educational': [
                '01-learning-objectives',
                '02-progress-tracking',
                '03-adaptive-difficulty',
                '04-feedback-system',
                '05-assessment-tools',
                '06-content-management',
                '07-teacher-dashboard',
                '08-gamification-elements',
                '09-subject-integration',
                '10-accessibility-education'
            ]
        };

        // Create all task directories and subdirectories
        for (const [mainDir, subDirs] of Object.entries(taskStructure)) {
            const mainPath = path.join(gameDir, 'task', mainDir);
            if (!fs.existsSync(mainPath)) {
                fs.mkdirSync(mainPath, { recursive: true });
            }
            
            for (const subDir of subDirs) {
                const subPath = path.join(mainPath, subDir);
                if (!fs.existsSync(subPath)) {
                    fs.mkdirSync(subPath, { recursive: true });
                }
            }
        }

        // Create system directory
        const systemDir = path.join(gameDir, 'system');
        if (!fs.existsSync(systemDir)) {
            fs.mkdirSync(systemDir, { recursive: true });
        }

        this.log('✅ Template structure copied');
    }

    async generateGameFiles(gameDir, gameName, gameType, genre) {
        this.log('📝 Generating game-specific files...');
        
        // Generate information.md
        await this.generateInformationFile(gameDir, gameName, gameType, genre);
        
        // Generate orchestrator.md with 100+ tasks
        await this.generateOrchestratorFile(gameDir, gameName, gameType, genre);
        
        // Generate README.md
        await this.generateReadmeFile(gameDir, gameName, gameType, genre);
        
        this.log('✅ Game-specific files generated');
    }

    async generateInformationFile(gameDir, gameName, gameType, genre) {
        const infoContent = `# Game Project Information

## Project Overview
- **Game Name**: ${gameName}
- **Game Type**: ${gameType}
- **Genre**: ${genre}
- **Target Audience**: [TO BE FILLED]
- **Platform**: [TO BE FILLED]
- **Main Idea**: [TO BE FILLED]
- **USP**: [TO BE FILLED]
- **Inspiration**: [TO BE FILLED]

## Technical Specifications
- **Engine**: [TO BE FILLED]
- **Language**: [TO BE FILLED]
- **Graphics API**: [TO BE FILLED]
- **Target Platform**: [TO BE FILLED]
- **Architecture**: [TO BE FILLED]
- **Design Patterns**: [TO BE FILLED]
- **Data Storage**: [TO BE FILLED]
- **Networking**: [TO BE FILLED]

## Gameplay Features
### Core Mechanics
- [TO BE FILLED]

### Required Features
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3

### Optional Features
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3

### Features to Avoid
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3

## Art & Design
- **Art Style**: [TO BE FILLED]
- **Color Palette**: [TO BE FILLED]
- **UI/UX**: [TO BE FILLED]
- **Sound Design**: [TO BE FILLED]

## Project Scope
- **Timeline**: [TO BE FILLED]
- **Team Size**: [TO BE FILLED]
- **Budget**: [TO BE FILLED]
- **Milestones**: [TO BE FILLED]

## AI Automation Preferences
- **Automation Level**: [TO BE FILLED]
- **Review Frequency**: [TO BE FILLED]
- **Manual Intervention**: [TO BE FILLED]

## Additional Requirements
- [TO BE FILLED]

---
*Generated by Template Manager*`;

        const infoFile = path.join(gameDir, 'system', 'information.md');
        fs.writeFileSync(infoFile, infoContent);
        this.log(`📝 Generated information.md`);
    }

    async generateOrchestratorFile(gameDir, gameName, gameType, genre) {
        const orchestratorContent = `# ${gameName} - Project Orchestrator

## Project Overview
- **Game Name**: ${gameName}
- **Game Type**: ${gameType}
- **Genre**: ${genre}
- **Status**: 🚀 Planning Phase
- **Last Updated**: ${new Date().toISOString()}

## Task Status Table

### 1. Project Setup & Architecture (10 Tasks)
| ID | Task Name | Category | Time | Status | Progress | Dependencies | Notes |
|----|-----------|----------|------|--------|----------|--------------|-------|
| 1.1 | Git Repository & Branching Strategy | project-setup | 1h | 📋 Ready | 0% | - | Version control setup |
| 1.2 | Project Structure Creation | project-setup | 1h | 📋 Ready | 0% | 1.1 | Directory organization |
| 1.3 | Linter & Formatter Configuration | project-setup | 1h | 📋 Ready | 0% | 1.2 | Code quality tools |
| 1.4 | TypeScript/JS Build Setup | project-setup | 2h | 📋 Ready | 0% | 1.2 | Build system configuration |
| 1.5 | Package Management Configuration | project-setup | 1h | 📋 Ready | 0% | 1.2 | Dependency management |
| 1.6 | ESLint + Prettier Setup | project-setup | 1h | 📋 Ready | 0% | 1.3 | Code formatting |
| 1.7 | Basis Logging System | project-setup | 1h | 📋 Ready | 0% | 1.2 | Logging infrastructure |
| 1.8 | Config System Implementation | project-setup | 2h | 📋 Ready | 0% | 1.2 | Configuration management |
| 1.9 | Basis Documentation | project-setup | 2h | 📋 Ready | 0% | 1.2 | Project documentation |
| 1.10 | CI/CD Skeleton | project-setup | 2h | 📋 Ready | 0% | 1.2 | Continuous integration |

### 2. Core Engine / Backend (15 Tasks)
| ID | Task Name | Category | Time | Status | Progress | Dependencies | Notes |
|----|-----------|----------|------|--------|----------|--------------|-------|
| 2.1 | Game Loop Basis | core-engine | 3h | 📋 Ready | 0% | 1.4 | Main game loop |
| 2.2 | Entity Component System | core-engine | 4h | 📋 Ready | 0% | 2.1 | ECS architecture |
| 2.3 | Physics Engine Integration | core-engine | 3h | 📋 Ready | 0% | 2.1 | Physics simulation |
| 2.4 | Input Handling | core-engine | 2h | 📋 Ready | 0% | 2.1 | Input management |
| 2.5 | Rendering Pipeline Setup | core-engine | 4h | 📋 Ready | 0% | 2.1 | Graphics pipeline |
| 2.6 | Audio Engine Integration | core-engine | 3h | 📋 Ready | 0% | 2.1 | Audio system |
| 2.7 | AI Pathfinding Basis | core-engine | 3h | 📋 Ready | 0% | 2.2 | Pathfinding algorithms |
| 2.8 | AI Behavior Trees | core-engine | 4h | 📋 Ready | 0% | 2.7 | AI decision making |
| 2.9 | Event System | core-engine | 2h | 📋 Ready | 0% | 2.2 | Event management |
| 2.10 | Resource Management | core-engine | 3h | 📋 Ready | 0% | 2.1 | Asset management |
| 2.11 | Serialization / Savegames | core-engine | 3h | 📋 Ready | 0% | 2.2 | Data persistence |
| 2.12 | Plugin System | core-engine | 4h | 📋 Ready | 0% | 2.9 | Extensibility |
| 2.13 | Mod Support Grundstruktur | core-engine | 3h | 📋 Ready | 0% | 2.12 | Modding support |
| 2.14 | Performance Benchmarking | core-engine | 2h | 📋 Ready | 0% | 2.1 | Performance monitoring |
| 2.15 | Engine Documentation | core-engine | 3h | 📋 Ready | 0% | 2.1-2.14 | Technical documentation |

### 3. Frontend & UI (10 Tasks)
| ID | Task Name | Category | Time | Status | Progress | Dependencies | Notes |
|----|-----------|----------|------|--------|----------|--------------|-------|
| 3.1 | UI Framework Setup | frontend-ui | 2h | 📋 Ready | 0% | 2.5 | UI framework initialization |
| 3.2 | Hauptmenu Implementation | frontend-ui | 3h | 📋 Ready | 0% | 3.1 | Main menu system |
| 3.3 | HUD Implementation | frontend-ui | 3h | 📋 Ready | 0% | 3.1 | Heads-up display |
| 3.4 | Optionsmenu (Audio, Video, Steuerung) | frontend-ui | 4h | 📋 Ready | 0% | 3.1 | Settings interface |
| 3.5 | Inventar / UI Komponenten | frontend-ui | 3h | 📋 Ready | 0% | 3.1 | Inventory interface |
| 3.6 | Responsive Design | frontend-ui | 3h | 📋 Ready | 0% | 3.1 | Multi-platform UI |
| 3.7 | Animationen UI | frontend-ui | 3h | 📋 Ready | 0% | 3.1 | UI animations |
| 3.8 | Localization Support UI | frontend-ui | 2h | 📋 Ready | 0% | 3.1 | Multi-language support |
| 3.9 | Accessibility Features | frontend-ui | 3h | 📋 Ready | 0% | 3.1 | Accessibility compliance |
| 3.10 | UI Tests | frontend-ui | 2h | 📋 Ready | 0% | 3.1-3.9 | UI testing |

### 4. Assets & Art Pipeline (10 Tasks)
| ID | Task Name | Category | Time | Status | Progress | Dependencies | Notes |
|----|-----------|----------|------|--------|----------|--------------|-------|
| 4.1 | Asset Pipeline Setup | assets-pipeline | 3h | 📋 Ready | 0% | 2.10 | Asset processing pipeline |
| 4.2 | Asset Loader | assets-pipeline | 2h | 📋 Ready | 0% | 4.1 | Asset loading system |
| 4.3 | Texture Kompression & Optimierung | assets-pipeline | 3h | 📋 Ready | 0% | 4.1 | Texture optimization |
| 4.4 | Spritesheet Integration | assets-pipeline | 2h | 📋 Ready | 0% | 4.2 | Sprite management |
| 4.5 | 3D Modell Importer | assets-pipeline | 3h | 📋 Ready | 0% | 4.2 | 3D model support |
| 4.6 | Sound Assets Handling | assets-pipeline | 2h | 📋 Ready | 0% | 2.6 | Audio asset management |
| 4.7 | Musik Looping & Cues | assets-pipeline | 3h | 📋 Ready | 0% | 4.6 | Music system |
| 4.8 | Asset Cache | assets-pipeline | 2h | 📋 Ready | 0% | 4.2 | Asset caching |
| 4.9 | Asset Versionierung | assets-pipeline | 2h | 📋 Ready | 0% | 4.1 | Asset versioning |
| 4.10 | Asset Tests | assets-pipeline | 2h | 📋 Ready | 0% | 4.1-4.9 | Asset validation |

### 5. Data & Persistence (5 Tasks)
| ID | Task Name | Category | Time | Status | Progress | Dependencies | Notes |
|----|-----------|----------|------|--------|----------|--------------|-------|
| 5.1 | Save/Load System | data-persistence | 3h | 📋 Ready | 0% | 2.11 | Save game functionality |
| 5.2 | Cloud Save Integration | data-persistence | 4h | 📋 Ready | 0% | 5.1 | Cloud storage |
| 5.3 | Datenbank Anbindung | data-persistence | 3h | 📋 Ready | 0% | 5.1 | Database integration |
| 5.4 | Data Migration | data-persistence | 2h | 📋 Ready | 0% | 5.3 | Data migration tools |
| 5.5 | Encryption/Integrity Check | data-persistence | 3h | 📋 Ready | 0% | 5.1 | Data security |

### 6. Multiplayer & Networking (10 Tasks)
| ID | Task Name | Category | Time | Status | Progress | Dependencies | Notes |
|----|-----------|----------|------|--------|----------|--------------|-------|
| 6.1 | Networking Stack Auswahl | multiplayer | 2h | 📋 Ready | 0% | 2.9 | Network technology choice |
| 6.2 | Client-Server Architektur | multiplayer | 4h | 📋 Ready | 0% | 6.1 | Network architecture |
| 6.3 | Matchmaking Basis | multiplayer | 3h | 📋 Ready | 0% | 6.2 | Player matching |
| 6.4 | Lobby System | multiplayer | 3h | 📋 Ready | 0% | 6.3 | Game lobbies |
| 6.5 | Realtime Sync | multiplayer | 4h | 📋 Ready | 0% | 6.2 | Real-time synchronization |
| 6.6 | Lag Compensation | multiplayer | 3h | 📋 Ready | 0% | 6.5 | Network latency handling |
| 6.7 | Security Anti-Cheat | multiplayer | 4h | 📋 Ready | 0% | 6.2 | Anti-cheat measures |
| 6.8 | Network Compression | multiplayer | 2h | 📋 Ready | 0% | 6.5 | Data compression |
| 6.9 | Multiplayer Testing | multiplayer | 3h | 📋 Ready | 0% | 6.1-6.8 | Network testing |
| 6.10 | Netzwerk-Monitoring | multiplayer | 2h | 📋 Ready | 0% | 6.2 | Network monitoring |

### 7. Feature Development (15 Tasks)
| ID | Task Name | Category | Time | Status | Progress | Dependencies | Notes |
|----|-----------|----------|------|--------|----------|--------------|-------|
| 7.1 | Movement Core | feature-dev | 4h | 📋 Ready | 0% | 2.3,2.4 | Character movement |
| 7.2 | Combat Core | feature-dev | 5h | 📋 Ready | 0% | 7.1 | Combat system |
| 7.3 | Enemy Spawner | feature-dev | 3h | 📋 Ready | 0% | 7.2 | Enemy generation |
| 7.4 | Leveling System | feature-dev | 4h | 📋 Ready | 0% | 7.1 | Character progression |
| 7.5 | Quest System | feature-dev | 5h | 📋 Ready | 0% | 2.8 | Quest management |
| 7.6 | Crafting System | feature-dev | 4h | 📋 Ready | 0% | 7.1 | Item crafting |
| 7.7 | Inventory Logic | feature-dev | 3h | 📋 Ready | 0% | 7.6 | Inventory management |
| 7.8 | NPC Dialog System | feature-dev | 4h | 📋 Ready | 0% | 2.8 | NPC interactions |
| 7.9 | Boss Mechanics | feature-dev | 5h | 📋 Ready | 0% | 7.2 | Boss battles |
| 7.10 | Skill Trees | feature-dev | 4h | 📋 Ready | 0% | 7.4 | Skill progression |
| 7.11 | Special Abilities | feature-dev | 4h | 📋 Ready | 0% | 7.10 | Special powers |
| 7.12 | Environmental Hazards | feature-dev | 3h | 📋 Ready | 0% | 2.3 | Environmental challenges |
| 7.13 | Achievement System | feature-dev | 3h | 📋 Ready | 0% | 7.1-7.12 | Achievements |
| 7.14 | Replay System | feature-dev | 4h | 📋 Ready | 0% | 2.11 | Game replay |
| 7.15 | Sandbox Features | feature-dev | 5h | 📋 Ready | 0% | 7.1-7.14 | Sandbox mode |

### 8. Testing (8 Tasks)
| ID | Task Name | Category | Time | Status | Progress | Dependencies | Notes |
|----|-----------|----------|------|--------|----------|--------------|-------|
| 8.1 | Unit Tests Setup | testing | 2h | 📋 Ready | 0% | 1.3 | Unit testing framework |
| 8.2 | Core Engine Unit Tests | testing | 4h | 📋 Ready | 0% | 8.1,2.1-2.15 | Engine testing |
| 8.3 | Integration Tests | testing | 3h | 📋 Ready | 0% | 8.2 | Integration testing |
| 8.4 | Multiplayer Tests | testing | 4h | 📋 Ready | 0% | 8.3,6.1-6.10 | Network testing |
| 8.5 | UI Tests | testing | 3h | 📋 Ready | 0% | 8.1,3.1-3.10 | UI testing |
| 8.6 | Load & Stress Tests | testing | 4h | 📋 Ready | 0% | 8.3 | Performance testing |
| 8.7 | Security Penetration Tests | testing | 3h | 📋 Ready | 0% | 8.3 | Security testing |
| 8.8 | Final Test Suite | testing | 4h | 📋 Ready | 0% | 8.1-8.7 | Comprehensive testing |

### 9. Deployment & Distribution (5 Tasks)
| ID | Task Name | Category | Time | Status | Progress | Dependencies | Notes |
|----|-----------|----------|------|--------|----------|--------------|-------|
| 9.1 | Build Scripts | deployment | 3h | 📋 Ready | 0% | 1.4 | Build automation |
| 9.2 | CI/CD Pipeline | deployment | 4h | 📋 Ready | 0% | 9.1 | Continuous deployment |
| 9.3 | Packaging für Plattformen | deployment | 3h | 📋 Ready | 0% | 9.1 | Platform packaging |
| 9.4 | Distribution Setup | deployment | 3h | 📋 Ready | 0% | 9.3 | Distribution channels |
| 9.5 | Auto-Updater | deployment | 3h | 📋 Ready | 0% | 9.4 | Update system |

### 10. Monitoring, Analytics, Post-Launch (7 Tasks)
| ID | Task Name | Category | Time | Status | Progress | Dependencies | Notes |
|----|-----------|----------|------|--------|----------|--------------|-------|
| 10.1 | Monitoring Dashboard | monitoring | 3h | 📋 Ready | 0% | 9.2 | System monitoring |
| 10.2 | Crash Reporting | monitoring | 2h | 📋 Ready | 0% | 10.1 | Error tracking |
| 10.3 | Analytics Integration | monitoring | 3h | 📋 Ready | 0% | 10.1 | User analytics |
| 10.4 | Feedback System | monitoring | 2h | 📋 Ready | 0% | 10.3 | User feedback |
| 10.5 | Patch Management | monitoring | 3h | 📋 Ready | 0% | 9.5 | Update management |
| 10.6 | Post-Launch Content Pipeline | monitoring | 4h | 📋 Ready | 0% | 10.5 | Content updates |
| 10.7 | Community Support Tools | monitoring | 3h | 📋 Ready | 0% | 10.4 | Community features |

### 11. Genre-Specific Tasks - ${genre} (10 Tasks)
| ID | Task Name | Category | Time | Status | Progress | Dependencies | Notes |
|----|-----------|----------|------|--------|----------|--------------|-------|
| 11.1 | ${genre} Core Mechanics | game-${genre.toLowerCase()} | 5h | 📋 Ready | 0% | 7.1-7.15 | ${genre} specific gameplay |
| 11.2 | ${genre} UI Elements | game-${genre.toLowerCase()} | 4h | 📋 Ready | 0% | 3.1-3.10,11.1 | ${genre} specific UI |
| 11.3 | ${genre} Asset Integration | game-${genre.toLowerCase()} | 4h | 📋 Ready | 0% | 4.1-4.10,11.1 | ${genre} specific assets |
| 11.4 | ${genre} Balancing | game-${genre.toLowerCase()} | 4h | 📋 Ready | 0% | 11.1-11.3 | ${genre} game balance |
| 11.5 | ${genre} Testing | game-${genre.toLowerCase()} | 3h | 📋 Ready | 0% | 8.1-8.8,11.1-11.4 | ${genre} specific testing |
| 11.6 | ${genre} Performance Optimization | game-${genre.toLowerCase()} | 3h | 📋 Ready | 0% | 11.1-11.5 | ${genre} optimization |
| 11.7 | ${genre} Accessibility | game-${genre.toLowerCase()} | 2h | 📋 Ready | 0% | 3.9,11.1-11.6 | ${genre} accessibility |
| 11.8 | ${genre} Localization | game-${genre.toLowerCase()} | 3h | 📋 Ready | 0% | 3.8,11.1-11.7 | ${genre} localization |
| 11.9 | ${genre} Multiplayer Features | game-${genre.toLowerCase()} | 4h | 📋 Ready | 0% | 6.1-6.10,11.1-11.8 | ${genre} multiplayer |
| 11.10 | ${genre} Final Polish | game-${genre.toLowerCase()} | 3h | 📋 Ready | 0% | 11.1-11.9 | ${genre} final touches |

## Progress Summary
- **Total Tasks**: 110
- **Completed**: 0
- **In Progress**: 0
- **Ready**: 110
- **Blocked**: 0
- **Overall Progress**: 0%

## Next Steps
1. Review and customize project information
2. Adjust task priorities based on requirements
3. Set up development environment
4. Begin with Project Setup (Task 1.1)

---
*Generated by Template Manager*`;

        const orchestratorFile = path.join(gameDir, 'system', 'orchestrator.md');
        fs.writeFileSync(orchestratorFile, orchestratorContent);
        this.log(`📝 Generated orchestrator.md`);
    }

    async generateReadmeFile(gameDir, gameName, gameType, genre) {
        const readmeContent = `# ${gameName}

## Overview
${gameName} is a ${gameType} game in the ${genre} genre.

## Project Structure
\`\`\`
${gameName}/
├── task/                    # Task directories (110+ granular tasks)
│   ├── 01-project-setup/    # Project setup & architecture (10 tasks)
│   ├── 02-core-engine/      # Core engine & backend (15 tasks)
│   ├── 03-frontend-ui/      # Frontend & UI (10 tasks)
│   ├── 04-assets-art-pipeline/ # Assets & art pipeline (10 tasks)
│   ├── 05-data-persistence/ # Data & persistence (5 tasks)
│   ├── 06-multiplayer-networking/ # Multiplayer & networking (10 tasks)
│   ├── 07-feature-development/ # Feature development (15 tasks)
│   ├── 08-testing/          # Testing (8 tasks)
│   ├── 09-deployment-distribution/ # Deployment & distribution (5 tasks)
│   ├── 10-monitoring-analytics/ # Monitoring & analytics (7 tasks)
│   └── 11-20-game-*/        # Genre-specific tasks (10 tasks each)
└── system/                  # System files
    ├── information.md      # Project information
    ├── orchestrator.md     # Task orchestrator (110+ tasks)
    └── progress-tracker.md # Progress tracking
\`\`\`

## Getting Started
1. Review \`system/information.md\` and fill in project details
2. Check \`system/orchestrator.md\` for comprehensive task overview (110+ tasks)
3. Start with Task 1.1: Git Repository & Branching Strategy

## Development
This project uses the Cursor Automation CDP system for automated task execution with granular task management.

## License
[TO BE FILLED]

---
*Generated by Template Manager*`;

        const readmeFile = path.join(gameDir, 'README.md');
        fs.writeFileSync(readmeFile, readmeContent);
        this.log(`📝 Generated README.md`);
    }

    async updateOrchestrator(gameDir, gameName, gameType, genre) {
        this.log(`🔄 Updating orchestrator for ${gameName}...`);
        
        const orchestratorFile = path.join(gameDir, 'system', 'orchestrator.md');
        if (fs.existsSync(orchestratorFile)) {
            let content = fs.readFileSync(orchestratorFile, 'utf8');
            
            // Update game-specific placeholders
            content = content.replace(/\[GAME_NAME\]/g, gameName);
            content = content.replace(/\[GAME_TYPE\]/g, gameType);
            content = content.replace(/\[GENRE\]/g, genre);
            
            fs.writeFileSync(orchestratorFile, content);
            this.log(`✅ Updated orchestrator with game details`);
        }
    }

    async listAvailableTemplates() {
        this.log('📋 Available templates:');
        
        const templates = [
            { name: 'Action Game', type: '2D/3D', genre: 'Action' },
            { name: 'Strategy Game', type: '2D/3D', genre: 'Strategy' },
            { name: 'Puzzle Game', type: '2D', genre: 'Puzzle' },
            { name: 'Simulation Game', type: '2D/3D', genre: 'Simulation' },
            { name: 'Adventure Game', type: '2D/3D', genre: 'Adventure' },
            { name: 'Sports Game', type: '3D', genre: 'Sports' },
            { name: 'Racing Game', type: '3D', genre: 'Racing' },
            { name: 'Horror Game', type: '3D', genre: 'Horror' },
            { name: 'Arcade Game', type: '2D', genre: 'Arcade' },
            { name: 'Educational Game', type: '2D/3D', genre: 'Educational' }
        ];

        templates.forEach((template, index) => {
            console.log(`  ${index + 1}. ${template.name} (${template.type}) - ${template.genre}`);
        });

        return templates;
    }

    async validateTemplateStructure(gameDir) {
        this.log('🔍 Validating template structure...');
        
        const requiredDirs = [
            'task',
            'system',
            'task/01-project-setup',
            'task/02-core-engine',
            'task/03-frontend-ui',
            'task/04-assets-art-pipeline',
            'task/05-data-persistence',
            'task/06-multiplayer-networking',
            'task/07-feature-development',
            'task/08-testing',
            'task/09-deployment-distribution',
            'task/10-monitoring-analytics'
        ];

        const requiredFiles = [
            'system/information.md',
            'system/orchestrator.md',
            'README.md'
        ];

        const missing = [];

        // Check directories
        for (const dir of requiredDirs) {
            const fullPath = path.join(gameDir, dir);
            if (!fs.existsSync(fullPath)) {
                missing.push(`Directory: ${dir}`);
            }
        }

        // Check files
        for (const file of requiredFiles) {
            const fullPath = path.join(gameDir, file);
            if (!fs.existsSync(fullPath)) {
                missing.push(`File: ${file}`);
            }
        }

        if (missing.length === 0) {
            this.log('✅ Template structure is valid');
            return true;
        } else {
            this.log('❌ Template structure validation failed:', 'ERROR');
            missing.forEach(item => this.log(`   - Missing: ${item}`, 'ERROR'));
            return false;
        }
    }
}

export default TemplateManager; 