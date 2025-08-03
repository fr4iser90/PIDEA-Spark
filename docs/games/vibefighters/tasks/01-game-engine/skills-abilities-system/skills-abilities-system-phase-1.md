# Skills & Abilities System – Phase 1: Skill Foundation

## Overview
Implement the core skill management system with skill data structures, registration system, and basic skill execution framework for the Vibe Fighter game engine.

## Objectives
- [ ] Create skill manager system
- [ ] Implement skill data structure
- [ ] Set up skill registration system
- [ ] Add basic skill execution framework
- [ ] Create skill configuration system

## Deliverables
- File: `src/game/skills/skill-manager.js` - Core skill management system
- File: `src/game/skills/skill-data.js` - Skill definitions and configurations
- Feature: Skill registration and management
- Feature: Skill data structure and validation
- Feature: Basic skill execution framework
- Feature: Skill configuration system

## Dependencies
- Requires: Task 3 (Combat System & Collision)
- Blocks: Phase 2 (Ability System)

## Estimated Time
3 hours

## Success Criteria
- [ ] Skill manager system functional
- [ ] Skill data structure properly defined
- [ ] Skill registration system working
- [ ] Basic skill execution framework operational
- [ ] Skill configuration system accessible
- [ ] All systems integrate with existing game engine
- [ ] Performance impact minimal

## Technical Implementation

### Skill Manager System:
```javascript
class SkillManager {
  constructor() {
    this.skills = new Map();
    this.activeSkills = new Set();
    this.skillQueue = [];
    this.config = {
      maxActiveSkills: 5,
      skillTimeout: 5000,
      enableSkillChaining: true
    };
  }
  
  registerSkill(skillId, skillData) {
    if (this.validateSkillData(skillData)) {
      this.skills.set(skillId, {
        ...skillData,
        id: skillId,
        isActive: false,
        lastUsed: 0,
        cooldownEnd: 0
      });
      return true;
    }
    return false;
  }
  
  validateSkillData(skillData) {
    const required = ['name', 'type', 'cost', 'cooldown', 'effects'];
    return required.every(field => skillData.hasOwnProperty(field));
  }
  
  activateSkill(skillId, character, target) {
    const skill = this.skills.get(skillId);
    if (!skill || !this.canActivateSkill(skill, character)) {
      return false;
    }
    
    if (this.executeSkill(skill, character, target)) {
      skill.lastUsed = Date.now();
      skill.cooldownEnd = skill.lastUsed + skill.cooldown;
      this.activeSkills.add(skillId);
      return true;
    }
    return false;
  }
  
  canActivateSkill(skill, character) {
    const now = Date.now();
    return (
      now >= skill.cooldownEnd &&
      character.energy >= skill.cost &&
      !skill.isActive
    );
  }
  
  executeSkill(skill, character, target) {
    try {
      // Execute skill effects
      skill.effects.forEach(effect => {
        this.applyEffect(effect, character, target);
      });
      
      // Consume energy
      character.energy -= skill.cost;
      
      return true;
    } catch (error) {
      console.error(`Skill execution failed: ${skill.id}`, error);
      return false;
    }
  }
  
  applyEffect(effect, character, target) {
    switch (effect.type) {
      case 'damage':
        this.applyDamageEffect(effect, character, target);
        break;
      case 'heal':
        this.applyHealEffect(effect, character, target);
        break;
      case 'buff':
        this.applyBuffEffect(effect, character, target);
        break;
      case 'debuff':
        this.applyDebuffEffect(effect, character, target);
        break;
      default:
        console.warn(`Unknown effect type: ${effect.type}`);
    }
  }
  
  update(deltaTime) {
    // Update active skills
    this.activeSkills.forEach(skillId => {
      const skill = this.skills.get(skillId);
      if (skill && this.shouldDeactivateSkill(skill)) {
        this.activeSkills.delete(skillId);
        skill.isActive = false;
      }
    });
    
    // Process skill queue
    this.processSkillQueue();
  }
  
  shouldDeactivateSkill(skill) {
    return Date.now() - skill.lastUsed > skill.duration;
  }
  
  processSkillQueue() {
    while (this.skillQueue.length > 0) {
      const { skillId, character, target } = this.skillQueue.shift();
      this.activateSkill(skillId, character, target);
    }
  }
}
```

### Skill Data Structure:
```javascript
// Skill configuration structure
const skillConfig = {
  // Basic skill info
  name: 'Fireball',
  description: 'Launches a powerful fireball at the target',
  type: 'offensive',
  category: 'elemental',
  
  // Resource costs
  cost: {
    energy: 25,
    mana: 0,
    health: 0
  },
  
  // Timing
  cooldown: 3000, // 3 seconds
  castTime: 500,  // 0.5 seconds
  duration: 2000, // 2 seconds
  
  // Targeting
  range: 150,
  areaOfEffect: 50,
  targetType: 'enemy', // enemy, ally, self, ground
  
  // Effects
  effects: [
    {
      type: 'damage',
      value: 45,
      scaling: 0.8, // 80% of character's attack power
      element: 'fire',
      criticalChance: 0.15
    },
    {
      type: 'debuff',
      effect: 'burn',
      duration: 3000,
      value: 5 // 5 damage per second
    }
  ],
  
  // Visual effects
  animation: {
    cast: 'fireball-cast',
    projectile: 'fireball-projectile',
    impact: 'fireball-impact'
  },
  
  // Sound effects
  audio: {
    cast: 'fireball-cast.wav',
    projectile: 'fireball-fly.wav',
    impact: 'fireball-impact.wav'
  },
  
  // Requirements
  requirements: {
    level: 5,
    skills: ['basic-magic'],
    equipment: []
  }
};
```

### Skill Registration System:
```javascript
class SkillRegistry {
  constructor() {
    this.skillTemplates = new Map();
    this.skillCategories = new Set();
    this.loadedSkills = new Set();
  }
  
  registerSkillTemplate(templateId, template) {
    if (this.validateTemplate(template)) {
      this.skillTemplates.set(templateId, template);
      this.skillCategories.add(template.category);
      return true;
    }
    return false;
  }
  
  validateTemplate(template) {
    const required = ['name', 'type', 'cost', 'cooldown', 'effects'];
    return required.every(field => template.hasOwnProperty(field));
  }
  
  createSkillFromTemplate(templateId, overrides = {}) {
    const template = this.skillTemplates.get(templateId);
    if (!template) {
      throw new Error(`Skill template not found: ${templateId}`);
    }
    
    return {
      ...template,
      ...overrides,
      id: `${templateId}_${Date.now()}`,
      created: Date.now()
    };
  }
  
  getSkillsByCategory(category) {
    return Array.from(this.skillTemplates.values())
      .filter(skill => skill.category === category);
  }
  
  getSkillsByType(type) {
    return Array.from(this.skillTemplates.values())
      .filter(skill => skill.type === type);
  }
  
  loadSkillLibrary() {
    // Load predefined skills
    const skillLibrary = {
      'basic-attack': {
        name: 'Basic Attack',
        type: 'offensive',
        category: 'physical',
        cost: { energy: 5 },
        cooldown: 500,
        effects: [{ type: 'damage', value: 15, scaling: 1.0 }]
      },
      'fireball': {
        name: 'Fireball',
        type: 'offensive',
        category: 'elemental',
        cost: { energy: 25 },
        cooldown: 3000,
        effects: [
          { type: 'damage', value: 45, scaling: 0.8, element: 'fire' },
          { type: 'debuff', effect: 'burn', duration: 3000, value: 5 }
        ]
      },
      'heal': {
        name: 'Heal',
        type: 'support',
        category: 'healing',
        cost: { energy: 30 },
        cooldown: 5000,
        effects: [{ type: 'heal', value: 40, scaling: 1.2 }]
      }
    };
    
    Object.entries(skillLibrary).forEach(([id, template]) => {
      this.registerSkillTemplate(id, template);
    });
  }
}
```

## Testing Strategy

### Unit Tests:
- [ ] Test skill registration and validation
- [ ] Test skill activation and execution
- [ ] Test cooldown management
- [ ] Test effect application
- [ ] Test skill data structure validation

### Integration Tests:
- [ ] Test skill manager integration with character system
- [ ] Test skill execution in game loop
- [ ] Test skill configuration loading
- [ ] Test skill registry functionality

### Manual Testing:
- [ ] Verify skill registration works correctly
- [ ] Test skill activation with valid/invalid conditions
- [ ] Check cooldown timing accuracy
- [ ] Validate effect application
- [ ] Test performance with multiple skills

## Success Metrics
- **Performance**: Skill activation < 16ms
- **Memory**: Skill system < 2MB
- **Reliability**: 100% skill execution success rate
- **Extensibility**: Easy to add new skill types
- **Integration**: Seamless with existing systems 