# Skills & Abilities System – Phase 2: Ability System

## Overview
Implement the ability execution engine with effect system, cooldown management, skill targeting, and ability animations for the Vibe Fighter game engine.

## Objectives
- [ ] Implement ability execution engine
- [ ] Create effect system for abilities
- [ ] Add cooldown management
- [ ] Implement skill targeting system
- [ ] Add ability animations and effects

## Deliverables
- File: `src/game/skills/ability-system.js` - Ability execution and effects
- File: `src/game/skills/cooldown-system.js` - Cooldown management
- File: `src/game/skills/effect-system.js` - Visual and gameplay effects
- Feature: Advanced ability execution engine
- Feature: Comprehensive effect system
- Feature: Robust cooldown management
- Feature: Skill targeting and validation
- Feature: Ability animations and visual effects

## Dependencies
- Requires: Phase 1 (Skill Foundation)
- Blocks: Phase 3 (Integration & UI)

## Estimated Time
4 hours

## Success Criteria
- [ ] Ability execution engine functional
- [ ] Effect system handles all effect types
- [ ] Cooldown management accurate and responsive
- [ ] Skill targeting system working correctly
- [ ] Ability animations smooth and performant
- [ ] All systems integrate with existing game engine
- [ ] Performance impact minimal

## Technical Implementation

### Ability Execution Engine:
```javascript
class AbilitySystem {
  constructor() {
    this.activeAbilities = new Map();
    this.abilityQueue = [];
    this.effectSystem = new EffectSystem();
    this.cooldownSystem = new CooldownSystem();
    this.targetingSystem = new TargetingSystem();
    this.animationSystem = new AnimationSystem();
  }
  
  executeAbility(abilityId, caster, target, options = {}) {
    const ability = this.getAbility(abilityId);
    if (!ability || !this.validateExecution(ability, caster, target)) {
      return false;
    }
    
    // Start ability execution
    const execution = {
      id: `${abilityId}_${Date.now()}`,
      ability,
      caster,
      target,
      startTime: Date.now(),
      state: 'casting',
      options
    };
    
    this.activeAbilities.set(execution.id, execution);
    
    // Handle cast time
    if (ability.castTime > 0) {
      this.startCasting(execution);
    } else {
      this.executeImmediate(execution);
    }
    
    return execution.id;
  }
  
  validateExecution(ability, caster, target) {
    // Check cooldown
    if (!this.cooldownSystem.canUseAbility(ability.id, caster)) {
      return false;
    }
    
    // Check resources
    if (!this.hasRequiredResources(ability, caster)) {
      return false;
    }
    
    // Check targeting
    if (!this.targetingSystem.validateTarget(ability, caster, target)) {
      return false;
    }
    
    // Check conditions
    if (!this.checkAbilityConditions(ability, caster, target)) {
      return false;
    }
    
    return true;
  }
  
  hasRequiredResources(ability, caster) {
    if (ability.cost.energy && caster.energy < ability.cost.energy) {
      return false;
    }
    if (ability.cost.mana && caster.mana < ability.cost.mana) {
      return false;
    }
    if (ability.cost.health && caster.health < ability.cost.health) {
      return false;
    }
    return true;
  }
  
  checkAbilityConditions(ability, caster, target) {
    // Check level requirements
    if (ability.requirements.level && caster.level < ability.requirements.level) {
      return false;
    }
    
    // Check skill requirements
    if (ability.requirements.skills) {
      const hasSkills = ability.requirements.skills.every(skillId => 
        caster.hasSkill(skillId)
      );
      if (!hasSkills) return false;
    }
    
    // Check equipment requirements
    if (ability.requirements.equipment) {
      const hasEquipment = ability.requirements.equipment.every(itemId => 
        caster.hasEquipment(itemId)
      );
      if (!hasEquipment) return false;
    }
    
    return true;
  }
  
  startCasting(execution) {
    execution.state = 'casting';
    execution.castEndTime = execution.startTime + execution.ability.castTime;
    
    // Start cast animation
    this.animationSystem.playAnimation(execution.caster, execution.ability.animation.cast);
    
    // Play cast sound
    if (execution.ability.audio.cast) {
      this.playSound(execution.ability.audio.cast);
    }
    
    // Add to update loop
    this.abilityQueue.push(execution);
  }
  
  executeImmediate(execution) {
    execution.state = 'executing';
    
    // Consume resources
    this.consumeResources(execution.ability, execution.caster);
    
    // Apply cooldown
    this.cooldownSystem.startCooldown(execution.ability.id, execution.caster);
    
    // Execute effects
    this.executeEffects(execution);
    
    // Start ability duration
    if (execution.ability.duration > 0) {
      execution.durationEndTime = Date.now() + execution.ability.duration;
    } else {
      this.completeAbility(execution);
    }
  }
  
  consumeResources(ability, caster) {
    if (ability.cost.energy) {
      caster.energy -= ability.cost.energy;
    }
    if (ability.cost.mana) {
      caster.mana -= ability.cost.mana;
    }
    if (ability.cost.health) {
      caster.health -= ability.cost.health;
    }
  }
  
  executeEffects(execution) {
    const { ability, caster, target } = execution;
    
    ability.effects.forEach(effect => {
      this.effectSystem.applyEffect(effect, caster, target, execution);
    });
    
    // Play execution animations
    if (ability.animation.projectile) {
      this.animationSystem.playProjectile(ability.animation.projectile, caster, target);
    }
    
    // Play execution sound
    if (ability.audio.projectile) {
      this.playSound(ability.audio.projectile);
    }
  }
  
  update(deltaTime) {
    const now = Date.now();
    
    // Update active abilities
    for (const [executionId, execution] of this.activeAbilities) {
      switch (execution.state) {
        case 'casting':
          this.updateCasting(execution, now);
          break;
        case 'executing':
          this.updateExecuting(execution, now);
          break;
        case 'completed':
          this.activeAbilities.delete(executionId);
          break;
      }
    }
    
    // Update systems
    this.effectSystem.update(deltaTime);
    this.cooldownSystem.update(deltaTime);
    this.animationSystem.update(deltaTime);
  }
  
  updateCasting(execution, now) {
    if (now >= execution.castEndTime) {
      this.executeImmediate(execution);
    } else {
      // Update cast progress
      const progress = (now - execution.startTime) / execution.ability.castTime;
      this.updateCastProgress(execution, progress);
    }
  }
  
  updateExecuting(execution, now) {
    if (execution.durationEndTime && now >= execution.durationEndTime) {
      this.completeAbility(execution);
    }
  }
  
  completeAbility(execution) {
    execution.state = 'completed';
    
    // Play completion animation
    if (execution.ability.animation.impact) {
      this.animationSystem.playAnimation(execution.target, execution.ability.animation.impact);
    }
    
    // Play completion sound
    if (execution.ability.audio.impact) {
      this.playSound(execution.ability.audio.impact);
    }
    
    // Clean up
    this.cleanupAbility(execution);
  }
  
  cleanupAbility(execution) {
    // Remove from active abilities
    this.activeAbilities.delete(execution.id);
    
    // Stop animations
    this.animationSystem.stopAnimation(execution.caster, execution.ability.animation.cast);
    
    // Clean up effects
    this.effectSystem.cleanupAbility(execution.id);
  }
}
```

### Effect System:
```javascript
class EffectSystem {
  constructor() {
    this.activeEffects = new Map();
    this.effectTypes = new Map();
    this.registerEffectTypes();
  }
  
  registerEffectTypes() {
    this.effectTypes.set('damage', this.applyDamageEffect.bind(this));
    this.effectTypes.set('heal', this.applyHealEffect.bind(this));
    this.effectTypes.set('buff', this.applyBuffEffect.bind(this));
    this.effectTypes.set('debuff', this.applyDebuffEffect.bind(this));
    this.effectTypes.set('movement', this.applyMovementEffect.bind(this));
    this.effectTypes.set('visual', this.applyVisualEffect.bind(this));
  }
  
  applyEffect(effect, caster, target, execution) {
    const effectHandler = this.effectTypes.get(effect.type);
    if (effectHandler) {
      return effectHandler(effect, caster, target, execution);
    } else {
      console.warn(`Unknown effect type: ${effect.type}`);
      return false;
    }
  }
  
  applyDamageEffect(effect, caster, target, execution) {
    const damage = this.calculateDamage(effect, caster, target);
    
    // Apply damage
    target.takeDamage(damage, {
      source: caster,
      ability: execution.ability,
      effect: effect,
      isCritical: this.isCriticalHit(effect, caster)
    });
    
    // Create damage number
    this.createDamageNumber(target, damage);
    
    return true;
  }
  
  calculateDamage(effect, caster, target) {
    let damage = effect.value || 0;
    
    // Apply scaling
    if (effect.scaling) {
      const stat = effect.scalingStat || 'attack';
      damage += caster.stats[stat] * effect.scaling;
    }
    
    // Apply critical hit
    if (this.isCriticalHit(effect, caster)) {
      damage *= effect.criticalMultiplier || 1.5;
    }
    
    // Apply elemental modifiers
    if (effect.element && target.elementalResistance) {
      const resistance = target.elementalResistance[effect.element] || 1.0;
      damage *= resistance;
    }
    
    // Apply random variation
    if (effect.variation) {
      const variation = 1 + (Math.random() - 0.5) * effect.variation;
      damage *= variation;
    }
    
    return Math.max(1, Math.floor(damage));
  }
  
  isCriticalHit(effect, caster) {
    const criticalChance = effect.criticalChance || caster.stats.criticalChance || 0.05;
    return Math.random() < criticalChance;
  }
  
  applyHealEffect(effect, caster, target, execution) {
    const healAmount = this.calculateHeal(effect, caster, target);
    
    // Apply healing
    target.heal(healAmount, {
      source: caster,
      ability: execution.ability,
      effect: effect
    });
    
    // Create heal number
    this.createHealNumber(target, healAmount);
    
    return true;
  }
  
  calculateHeal(effect, caster, target) {
    let heal = effect.value || 0;
    
    // Apply scaling
    if (effect.scaling) {
      const stat = effect.scalingStat || 'magic';
      heal += caster.stats[stat] * effect.scaling;
    }
    
    // Apply random variation
    if (effect.variation) {
      const variation = 1 + (Math.random() - 0.5) * effect.variation;
      heal *= variation;
    }
    
    return Math.max(1, Math.floor(heal));
  }
  
  applyBuffEffect(effect, caster, target, execution) {
    const buff = {
      id: `${effect.buff}_${Date.now()}`,
      type: effect.buff,
      value: effect.value,
      duration: effect.duration,
      source: caster,
      ability: execution.ability,
      startTime: Date.now()
    };
    
    // Apply buff to target
    target.addBuff(buff);
    
    // Create buff visual effect
    this.createBuffEffect(target, buff);
    
    return true;
  }
  
  applyDebuffEffect(effect, caster, target, execution) {
    const debuff = {
      id: `${effect.debuff}_${Date.now()}`,
      type: effect.debuff,
      value: effect.value,
      duration: effect.duration,
      source: caster,
      ability: execution.ability,
      startTime: Date.now()
    };
    
    // Apply debuff to target
    target.addDebuff(debuff);
    
    // Create debuff visual effect
    this.createDebuffEffect(target, debuff);
    
    return true;
  }
  
  applyMovementEffect(effect, caster, target, execution) {
    switch (effect.movementType) {
      case 'push':
        this.pushTarget(target, effect.distance, effect.direction);
        break;
      case 'pull':
        this.pullTarget(target, effect.distance, effect.direction);
        break;
      case 'teleport':
        this.teleportTarget(target, effect.position);
        break;
      case 'stun':
        this.stunTarget(target, effect.duration);
        break;
    }
    
    return true;
  }
  
  applyVisualEffect(effect, caster, target, execution) {
    // Create visual effects
    if (effect.particles) {
      this.createParticleEffect(target, effect.particles);
    }
    
    if (effect.screenShake) {
      this.createScreenShake(effect.screenShake);
    }
    
    if (effect.flash) {
      this.createFlashEffect(target, effect.flash);
    }
    
    return true;
  }
  
  update(deltaTime) {
    // Update active effects
    for (const [effectId, effect] of this.activeEffects) {
      effect.update(deltaTime);
      
      if (effect.isExpired()) {
        this.activeEffects.delete(effectId);
      }
    }
  }
  
  cleanupAbility(executionId) {
    // Remove effects associated with this ability
    for (const [effectId, effect] of this.activeEffects) {
      if (effect.executionId === executionId) {
        this.activeEffects.delete(effectId);
      }
    }
  }
}
```

### Cooldown System:
```javascript
class CooldownSystem {
  constructor() {
    this.cooldowns = new Map(); // characterId -> Map<abilityId, cooldown>
    this.globalCooldowns = new Map(); // characterId -> globalCooldown
    this.globalCooldownDuration = 1500; // 1.5 seconds
  }
  
  startCooldown(abilityId, character) {
    const characterId = character.id;
    
    // Initialize character cooldowns if needed
    if (!this.cooldowns.has(characterId)) {
      this.cooldowns.set(characterId, new Map());
    }
    
    const characterCooldowns = this.cooldowns.get(characterId);
    const ability = character.getAbility(abilityId);
    
    if (ability) {
      const cooldownEnd = Date.now() + ability.cooldown;
      characterCooldowns.set(abilityId, cooldownEnd);
      
      // Start global cooldown if ability triggers it
      if (ability.triggersGlobalCooldown !== false) {
        this.startGlobalCooldown(character);
      }
    }
  }
  
  startGlobalCooldown(character) {
    const characterId = character.id;
    const globalCooldownEnd = Date.now() + this.globalCooldownDuration;
    this.globalCooldowns.set(characterId, globalCooldownEnd);
  }
  
  canUseAbility(abilityId, character) {
    const characterId = character.id;
    
    // Check if character has cooldowns
    if (!this.cooldowns.has(characterId)) {
      return true;
    }
    
    const characterCooldowns = this.cooldowns.get(characterId);
    const now = Date.now();
    
    // Check ability cooldown
    if (characterCooldowns.has(abilityId)) {
      const cooldownEnd = characterCooldowns.get(abilityId);
      if (now < cooldownEnd) {
        return false;
      }
    }
    
    // Check global cooldown
    if (this.globalCooldowns.has(characterId)) {
      const globalCooldownEnd = this.globalCooldowns.get(characterId);
      if (now < globalCooldownEnd) {
        return false;
      }
    }
    
    return true;
  }
  
  getCooldownRemaining(abilityId, character) {
    const characterId = character.id;
    
    if (!this.cooldowns.has(characterId)) {
      return 0;
    }
    
    const characterCooldowns = this.cooldowns.get(characterId);
    const now = Date.now();
    
    if (characterCooldowns.has(abilityId)) {
      const cooldownEnd = characterCooldowns.get(abilityId);
      return Math.max(0, cooldownEnd - now);
    }
    
    return 0;
  }
  
  getGlobalCooldownRemaining(character) {
    const characterId = character.id;
    const now = Date.now();
    
    if (this.globalCooldowns.has(characterId)) {
      const globalCooldownEnd = this.globalCooldowns.get(characterId);
      return Math.max(0, globalCooldownEnd - now);
    }
    
    return 0;
  }
  
  getCooldownProgress(abilityId, character) {
    const remaining = this.getCooldownRemaining(abilityId, character);
    const ability = character.getAbility(abilityId);
    
    if (!ability || remaining === 0) {
      return 1.0; // Fully ready
    }
    
    return 1.0 - (remaining / ability.cooldown);
  }
  
  resetCooldown(abilityId, character) {
    const characterId = character.id;
    
    if (this.cooldowns.has(characterId)) {
      const characterCooldowns = this.cooldowns.get(characterId);
      characterCooldowns.delete(abilityId);
    }
  }
  
  resetAllCooldowns(character) {
    const characterId = character.id;
    this.cooldowns.delete(characterId);
    this.globalCooldowns.delete(characterId);
  }
  
  update(deltaTime) {
    const now = Date.now();
    
    // Clean up expired cooldowns
    for (const [characterId, characterCooldowns] of this.cooldowns) {
      for (const [abilityId, cooldownEnd] of characterCooldowns) {
        if (now >= cooldownEnd) {
          characterCooldowns.delete(abilityId);
        }
      }
      
      // Remove character if no cooldowns left
      if (characterCooldowns.size === 0) {
        this.cooldowns.delete(characterId);
      }
    }
    
    // Clean up expired global cooldowns
    for (const [characterId, globalCooldownEnd] of this.globalCooldowns) {
      if (now >= globalCooldownEnd) {
        this.globalCooldowns.delete(characterId);
      }
    }
  }
}
```

## Testing Strategy

### Unit Tests:
- [ ] Test ability execution validation
- [ ] Test effect application for all effect types
- [ ] Test cooldown management accuracy
- [ ] Test resource consumption
- [ ] Test targeting validation

### Integration Tests:
- [ ] Test ability system integration with character system
- [ ] Test effect system integration with combat system
- [ ] Test cooldown system integration with UI
- [ ] Test animation system integration

### Manual Testing:
- [ ] Verify ability execution works correctly
- [ ] Test effect application and visual feedback
- [ ] Check cooldown timing accuracy
- [ ] Validate targeting system
- [ ] Test performance with multiple abilities

## Success Metrics
- **Performance**: Effect application < 8ms
- **Memory**: Effect system < 3MB
- **Reliability**: 100% effect application success rate
- **Accuracy**: Cooldown timing within 16ms
- **Integration**: Seamless with existing systems 