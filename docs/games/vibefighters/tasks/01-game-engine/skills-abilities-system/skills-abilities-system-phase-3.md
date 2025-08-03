# Skills & Abilities System – Phase 3: Integration & UI

## Overview
Integrate the skills and abilities system with the character system, create skill UI components, add skill controls and input handling, implement skill progression system, and add visual feedback and effects for the Vibe Fighter game engine.

## Objectives
- [ ] Integrate with character system
- [ ] Create skill UI components
- [ ] Add skill controls and input
- [ ] Implement skill progression system
- [ ] Add visual feedback and effects

## Deliverables
- File: `src/game/skills/skill-ui.js` - Skill UI and controls
- File: `src/game/skills/skill-progression.js` - Skill progression system
- Feature: Character-skill integration
- Feature: Comprehensive skill UI
- Feature: Skill input controls
- Feature: Skill progression and leveling
- Feature: Visual feedback system

## Dependencies
- Requires: Phase 2 (Ability System)
- Blocks: Character System & Movement

## Estimated Time
3 hours

## Success Criteria
- [ ] Character-skill integration functional
- [ ] Skill UI responsive and intuitive
- [ ] Skill controls work correctly
- [ ] Skill progression system operational
- [ ] Visual feedback smooth and informative
- [ ] All systems integrate with existing game engine
- [ ] Performance impact minimal

## Technical Implementation

### Character-Skill Integration:
```javascript
class CharacterSkillIntegration {
  constructor(character) {
    this.character = character;
    this.skillManager = new SkillManager();
    this.abilitySystem = new AbilitySystem();
    this.skillProgression = new SkillProgression();
    this.skillUI = new SkillUI();
    
    this.availableSkills = new Set();
    this.equippedSkills = new Map(); // slot -> skillId
    this.skillLevels = new Map(); // skillId -> level
    this.skillExperience = new Map(); // skillId -> experience
    
    this.maxEquippedSkills = 4;
    this.skillSlots = ['Q', 'W', 'E', 'R'];
  }
  
  initialize() {
    // Load character's skills
    this.loadCharacterSkills();
    
    // Set up skill progression
    this.skillProgression.initialize(this.character);
    
    // Initialize skill UI
    this.skillUI.initialize(this);
    
    // Set up input handlers
    this.setupInputHandlers();
  }
  
  loadCharacterSkills() {
    const characterSkills = this.character.getSkillList();
    
    characterSkills.forEach(skillData => {
      const skillId = skillData.id;
      
      // Register skill with manager
      this.skillManager.registerSkill(skillId, skillData);
      
      // Add to available skills
      this.availableSkills.add(skillId);
      
      // Initialize skill level and experience
      this.skillLevels.set(skillId, skillData.level || 1);
      this.skillExperience.set(skillId, skillData.experience || 0);
    });
  }
  
  equipSkill(skillId, slot) {
    if (!this.availableSkills.has(skillId)) {
      console.warn(`Skill not available: ${skillId}`);
      return false;
    }
    
    if (slot >= this.maxEquippedSkills) {
      console.warn(`Invalid slot: ${slot}`);
      return false;
    }
    
    // Unequip current skill in slot
    this.unequipSkill(slot);
    
    // Equip new skill
    this.equippedSkills.set(slot, skillId);
    
    // Update UI
    this.skillUI.updateEquippedSkill(slot, skillId);
    
    return true;
  }
  
  unequipSkill(slot) {
    const currentSkill = this.equippedSkills.get(slot);
    if (currentSkill) {
      this.equippedSkills.delete(slot);
      this.skillUI.updateEquippedSkill(slot, null);
    }
  }
  
  useSkill(slot) {
    const skillId = this.equippedSkills.get(slot);
    if (!skillId) {
      return false;
    }
    
    const target = this.getSkillTarget(skillId);
    if (!target) {
      return false;
    }
    
    return this.abilitySystem.executeAbility(skillId, this.character, target);
  }
  
  getSkillTarget(skillId) {
    const skill = this.skillManager.getSkill(skillId);
    if (!skill) return null;
    
    switch (skill.targetType) {
      case 'self':
        return this.character;
      case 'enemy':
        return this.getNearestEnemy();
      case 'ally':
        return this.getNearestAlly();
      case 'ground':
        return this.getMousePosition();
      default:
        return this.getNearestEnemy();
    }
  }
  
  getNearestEnemy() {
    // Implementation depends on game's enemy management system
    return this.character.getNearestEnemy();
  }
  
  getNearestAlly() {
    // Implementation depends on game's ally management system
    return this.character.getNearestAlly();
  }
  
  getMousePosition() {
    // Implementation depends on game's input system
    return this.character.getMousePosition();
  }
  
  gainSkillExperience(skillId, experience) {
    const currentExp = this.skillExperience.get(skillId) || 0;
    const newExp = currentExp + experience;
    this.skillExperience.set(skillId, newExp);
    
    // Check for level up
    const currentLevel = this.skillLevels.get(skillId) || 1;
    const requiredExp = this.skillProgression.getRequiredExperience(skillId, currentLevel);
    
    if (newExp >= requiredExp) {
      this.levelUpSkill(skillId);
    }
    
    // Update UI
    this.skillUI.updateSkillExperience(skillId, newExp);
  }
  
  levelUpSkill(skillId) {
    const currentLevel = this.skillLevels.get(skillId) || 1;
    const newLevel = currentLevel + 1;
    
    this.skillLevels.set(skillId, newLevel);
    
    // Update skill data with new level
    const skillData = this.skillManager.getSkill(skillId);
    if (skillData) {
      const leveledSkill = this.skillProgression.getSkillAtLevel(skillId, newLevel);
      this.skillManager.updateSkill(skillId, leveledSkill);
    }
    
    // Update UI
    this.skillUI.updateSkillLevel(skillId, newLevel);
    
    // Show level up effect
    this.showLevelUpEffect(skillId);
  }
  
  showLevelUpEffect(skillId) {
    // Create visual effect for skill level up
    this.skillUI.createLevelUpEffect(skillId);
    
    // Play sound effect
    this.playSound('skill-levelup.wav');
  }
  
  setupInputHandlers() {
    // Set up keyboard input for skill slots
    this.skillSlots.forEach((key, slot) => {
      this.character.inputManager.onKeyDown(key, () => {
        this.useSkill(slot);
      });
    });
    
    // Set up mouse input for skill targeting
    this.character.inputManager.onMouseClick((event) => {
      this.handleSkillTargeting(event);
    });
  }
  
  handleSkillTargeting(event) {
    // Handle skill targeting based on mouse position
    const mousePos = this.character.inputManager.getMousePosition();
    
    // Update skill targeting UI
    this.skillUI.updateTargeting(mousePos);
  }
  
  update(deltaTime) {
    // Update skill systems
    this.skillManager.update(deltaTime);
    this.abilitySystem.update(deltaTime);
    this.skillProgression.update(deltaTime);
    this.skillUI.update(deltaTime);
  }
  
  getSkillInfo(skillId) {
    const skill = this.skillManager.getSkill(skillId);
    const level = this.skillLevels.get(skillId) || 1;
    const experience = this.skillExperience.get(skillId) || 0;
    const requiredExp = this.skillProgression.getRequiredExperience(skillId, level);
    
    return {
      ...skill,
      level,
      experience,
      requiredExperience: requiredExp,
      progress: experience / requiredExp
    };
  }
}
```

### Skill UI System:
```javascript
class SkillUI {
  constructor() {
    this.container = null;
    this.skillBars = new Map();
    this.skillIcons = new Map();
    this.cooldownOverlays = new Map();
    this.progressBars = new Map();
    this.tooltips = new Map();
    
    this.isVisible = true;
    this.animationDuration = 300;
  }
  
  initialize(characterSkills) {
    this.characterSkills = characterSkills;
    this.createSkillUI();
    this.setupEventListeners();
  }
  
  createSkillUI() {
    // Create main skill UI container
    this.container = document.createElement('div');
    this.container.className = 'skill-ui';
    this.container.innerHTML = `
      <div class="skill-bar">
        <div class="skill-slot" data-slot="0">
          <div class="skill-icon"></div>
          <div class="cooldown-overlay"></div>
          <div class="progress-bar"></div>
          <div class="key-binding">Q</div>
        </div>
        <div class="skill-slot" data-slot="1">
          <div class="skill-icon"></div>
          <div class="cooldown-overlay"></div>
          <div class="progress-bar"></div>
          <div class="key-binding">W</div>
        </div>
        <div class="skill-slot" data-slot="2">
          <div class="skill-icon"></div>
          <div class="cooldown-overlay"></div>
          <div class="progress-bar"></div>
          <div class="key-binding">E</div>
        </div>
        <div class="skill-slot" data-slot="3">
          <div class="skill-icon"></div>
          <div class="cooldown-overlay"></div>
          <div class="progress-bar"></div>
          <div class="key-binding">R</div>
        </div>
      </div>
      <div class="skill-tooltip"></div>
    `;
    
    // Add to game UI
    document.body.appendChild(this.container);
    
    // Store references to UI elements
    this.container.querySelectorAll('.skill-slot').forEach((slot, index) => {
      this.skillIcons.set(index, slot.querySelector('.skill-icon'));
      this.cooldownOverlays.set(index, slot.querySelector('.cooldown-overlay'));
      this.progressBars.set(index, slot.querySelector('.progress-bar'));
    });
    
    this.tooltip = this.container.querySelector('.skill-tooltip');
  }
  
  setupEventListeners() {
    // Add hover events for tooltips
    this.container.querySelectorAll('.skill-slot').forEach((slot, index) => {
      slot.addEventListener('mouseenter', () => {
        this.showTooltip(index);
      });
      
      slot.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });
      
      slot.addEventListener('click', () => {
        this.characterSkills.useSkill(index);
      });
    });
  }
  
  updateEquippedSkill(slot, skillId) {
    const icon = this.skillIcons.get(slot);
    const cooldownOverlay = this.cooldownOverlays.get(slot);
    const progressBar = this.progressBars.get(slot);
    
    if (skillId) {
      const skillInfo = this.characterSkills.getSkillInfo(skillId);
      
      // Update icon
      icon.style.backgroundImage = `url(${skillInfo.icon})`;
      icon.style.display = 'block';
      
      // Update cooldown overlay
      cooldownOverlay.style.display = 'none';
      
      // Update progress bar
      progressBar.style.width = '0%';
      progressBar.style.display = 'none';
      
      // Store skill reference
      this.skillBars.set(slot, skillId);
    } else {
      // Clear slot
      icon.style.display = 'none';
      cooldownOverlay.style.display = 'none';
      progressBar.style.display = 'none';
      this.skillBars.delete(slot);
    }
  }
  
  updateSkillCooldown(slot, cooldownProgress) {
    const cooldownOverlay = this.cooldownOverlays.get(slot);
    const skillId = this.skillBars.get(slot);
    
    if (skillId && cooldownProgress < 1.0) {
      cooldownOverlay.style.display = 'block';
      cooldownOverlay.style.height = `${(1.0 - cooldownProgress) * 100}%`;
    } else {
      cooldownOverlay.style.display = 'none';
    }
  }
  
  updateSkillExperience(skillId, experience) {
    // Find slot with this skill
    for (const [slot, equippedSkillId] of this.skillBars) {
      if (equippedSkillId === skillId) {
        const skillInfo = this.characterSkills.getSkillInfo(skillId);
        const progressBar = this.progressBars.get(slot);
        
        progressBar.style.display = 'block';
        progressBar.style.width = `${skillInfo.progress * 100}%`;
        break;
      }
    }
  }
  
  updateSkillLevel(skillId, level) {
    // Find slot with this skill and update level display
    for (const [slot, equippedSkillId] of this.skillBars) {
      if (equippedSkillId === skillId) {
        const icon = this.skillIcons.get(slot);
        const levelBadge = icon.querySelector('.level-badge') || 
                          this.createLevelBadge(icon);
        
        levelBadge.textContent = level;
        break;
      }
    }
  }
  
  createLevelBadge(icon) {
    const badge = document.createElement('div');
    badge.className = 'level-badge';
    icon.appendChild(badge);
    return badge;
  }
  
  showTooltip(slot) {
    const skillId = this.skillBars.get(slot);
    if (!skillId) return;
    
    const skillInfo = this.characterSkills.getSkillInfo(skillId);
    const slotElement = this.container.querySelector(`[data-slot="${slot}"]`);
    const rect = slotElement.getBoundingClientRect();
    
    this.tooltip.innerHTML = `
      <div class="tooltip-header">
        <h3>${skillInfo.name}</h3>
        <span class="level">Level ${skillInfo.level}</span>
      </div>
      <div class="tooltip-description">${skillInfo.description}</div>
      <div class="tooltip-stats">
        <div class="stat">
          <span class="label">Cost:</span>
          <span class="value">${skillInfo.cost.energy} Energy</span>
        </div>
        <div class="stat">
          <span class="label">Cooldown:</span>
          <span class="value">${skillInfo.cooldown / 1000}s</span>
        </div>
        <div class="stat">
          <span class="label">Range:</span>
          <span class="value">${skillInfo.range}</span>
        </div>
      </div>
      <div class="tooltip-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${skillInfo.progress * 100}%"></div>
        </div>
        <span class="progress-text">${skillInfo.experience}/${skillInfo.requiredExperience} XP</span>
      </div>
    `;
    
    this.tooltip.style.display = 'block';
    this.tooltip.style.left = `${rect.right + 10}px`;
    this.tooltip.style.top = `${rect.top}px`;
  }
  
  hideTooltip() {
    this.tooltip.style.display = 'none';
  }
  
  createLevelUpEffect(skillId) {
    // Find slot with this skill
    for (const [slot, equippedSkillId] of this.skillBars) {
      if (equippedSkillId === skillId) {
        const slotElement = this.container.querySelector(`[data-slot="${slot}"]`);
        
        // Create level up animation
        const effect = document.createElement('div');
        effect.className = 'level-up-effect';
        effect.innerHTML = 'LEVEL UP!';
        
        slotElement.appendChild(effect);
        
        // Animate and remove
        setTimeout(() => {
          effect.remove();
        }, 2000);
        
        break;
      }
    }
  }
  
  updateTargeting(mousePos) {
    // Update skill targeting indicators
    this.skillBars.forEach((skillId, slot) => {
      const skillInfo = this.characterSkills.getSkillInfo(skillId);
      
      if (skillInfo.targetType === 'ground') {
        this.updateGroundTargeting(skillId, mousePos);
      }
    });
  }
  
  updateGroundTargeting(skillId, mousePos) {
    // Create or update ground targeting indicator
    let indicator = document.getElementById('ground-target-indicator');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'ground-target-indicator';
      indicator.className = 'ground-target-indicator';
      document.body.appendChild(indicator);
    }
    
    indicator.style.left = `${mousePos.x - 25}px`;
    indicator.style.top = `${mousePos.y - 25}px`;
    indicator.style.display = 'block';
  }
  
  update(deltaTime) {
    // Update cooldown displays
    this.skillBars.forEach((skillId, slot) => {
      const cooldownProgress = this.characterSkills.abilitySystem.cooldownSystem
        .getCooldownProgress(skillId, this.characterSkills.character);
      
      this.updateSkillCooldown(slot, cooldownProgress);
    });
  }
  
  show() {
    this.container.style.display = 'block';
    this.isVisible = true;
  }
  
  hide() {
    this.container.style.display = 'none';
    this.isVisible = false;
  }
  
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
}
```

### Skill Progression System:
```javascript
class SkillProgression {
  constructor() {
    this.progressionData = new Map();
    this.character = null;
    this.loadProgressionData();
  }
  
  initialize(character) {
    this.character = character;
  }
  
  loadProgressionData() {
    // Load skill progression data from configuration
    this.progressionData = new Map([
      ['basic-attack', {
        maxLevel: 10,
        experienceCurve: 'linear',
        baseExperience: 100,
        experienceMultiplier: 1.5,
        levelBonuses: {
          2: { damage: 5 },
          3: { damage: 10, cooldown: -100 },
          4: { damage: 15, range: 10 },
          5: { damage: 20, criticalChance: 0.05 },
          6: { damage: 25, cooldown: -200 },
          7: { damage: 30, range: 15 },
          8: { damage: 35, criticalChance: 0.10 },
          9: { damage: 40, cooldown: -300 },
          10: { damage: 50, range: 20, criticalChance: 0.15 }
        }
      }],
      ['fireball', {
        maxLevel: 8,
        experienceCurve: 'exponential',
        baseExperience: 200,
        experienceMultiplier: 2.0,
        levelBonuses: {
          2: { damage: 10, cost: -5 },
          3: { damage: 20, cooldown: -500 },
          4: { damage: 30, range: 25 },
          5: { damage: 40, cost: -10, burnDamage: 5 },
          6: { damage: 50, cooldown: -1000 },
          7: { damage: 60, range: 35, burnDuration: 1000 },
          8: { damage: 75, cost: -15, burnDamage: 10, burnDuration: 2000 }
        }
      }]
    ]);
  }
  
  getRequiredExperience(skillId, level) {
    const data = this.progressionData.get(skillId);
    if (!data) return 1000; // Default
    
    const baseExp = data.baseExperience;
    const multiplier = data.experienceMultiplier;
    
    if (data.experienceCurve === 'linear') {
      return Math.floor(baseExp * level * multiplier);
    } else if (data.experienceCurve === 'exponential') {
      return Math.floor(baseExp * Math.pow(multiplier, level - 1));
    }
    
    return baseExp * level;
  }
  
  getSkillAtLevel(skillId, level) {
    const baseSkill = this.getBaseSkill(skillId);
    if (!baseSkill) return null;
    
    const data = this.progressionData.get(skillId);
    if (!data) return baseSkill;
    
    const leveledSkill = { ...baseSkill };
    
    // Apply level bonuses
    for (let i = 2; i <= level; i++) {
      const bonuses = data.levelBonuses[i];
      if (bonuses) {
        this.applyLevelBonuses(leveledSkill, bonuses);
      }
    }
    
    return leveledSkill;
  }
  
  getBaseSkill(skillId) {
    // Get base skill data from skill manager
    return this.character.skillManager.getSkill(skillId);
  }
  
  applyLevelBonuses(skill, bonuses) {
    Object.entries(bonuses).forEach(([stat, value]) => {
      switch (stat) {
        case 'damage':
          skill.effects.forEach(effect => {
            if (effect.type === 'damage') {
              effect.value += value;
            }
          });
          break;
        case 'cost':
          if (skill.cost.energy) {
            skill.cost.energy = Math.max(0, skill.cost.energy + value);
          }
          break;
        case 'cooldown':
          skill.cooldown = Math.max(100, skill.cooldown + value);
          break;
        case 'range':
          skill.range += value;
          break;
        case 'criticalChance':
          skill.effects.forEach(effect => {
            if (effect.type === 'damage') {
              effect.criticalChance = (effect.criticalChance || 0) + value;
            }
          });
          break;
        case 'burnDamage':
          skill.effects.push({
            type: 'debuff',
            effect: 'burn',
            duration: 3000,
            value: value
          });
          break;
        case 'burnDuration':
          skill.effects.forEach(effect => {
            if (effect.type === 'debuff' && effect.effect === 'burn') {
              effect.duration += value;
            }
          });
          break;
      }
    });
  }
  
  canLevelUp(skillId, currentLevel) {
    const data = this.progressionData.get(skillId);
    if (!data) return false;
    
    return currentLevel < data.maxLevel;
  }
  
  getMaxLevel(skillId) {
    const data = this.progressionData.get(skillId);
    return data ? data.maxLevel : 1;
  }
  
  update(deltaTime) {
    // Update progression-related systems
    // This could include passive skill effects, etc.
  }
}
```

## Testing Strategy

### Unit Tests:
- [ ] Test character-skill integration
- [ ] Test skill UI functionality
- [ ] Test skill progression system
- [ ] Test input handling
- [ ] Test visual feedback system

### Integration Tests:
- [ ] Test skill system integration with character system
- [ ] Test UI integration with game engine
- [ ] Test progression system integration
- [ ] Test input system integration

### Manual Testing:
- [ ] Verify skill UI displays correctly
- [ ] Test skill controls and input
- [ ] Check skill progression and leveling
- [ ] Validate visual feedback
- [ ] Test performance with UI active

## Success Metrics
- **Performance**: UI updates < 16ms
- **Memory**: UI system < 2MB
- **Usability**: Intuitive skill controls
- **Visual**: Smooth animations and feedback
- **Integration**: Seamless with existing systems 