# Combat System & Collision – Phase 1: Combat Foundation

## Overview
Create the foundational combat system with attack mechanics, health and damage system, basic hit detection, combat states, and UI elements. This phase establishes the core combat architecture that will be extended with advanced features in Phase 2.

## Objectives
- [ ] Create combat system architecture (Combat class, event system)
- [ ] Implement attack system and mechanics (basic attacks, damage calculation)
- [ ] Add health and damage system (health bars, damage indicators)
- [ ] Create basic hit detection (collision-based hit detection)
- [ ] Implement combat states and animations (attack, hit, block states)
- [ ] Add combat UI elements (health bars, damage numbers)
- [ ] Create comprehensive combat tests

## Deliverables
- File: `src/game/combat.js` - Main combat system
- File: `src/game/attacks.js` - Attack definitions and mechanics
- File: `src/game/damage.js` - Damage calculation system
- File: `src/game/health.js` - Health and status system
- File: `src/config/combat.json` - Combat configuration
- File: `tests/unit/combat.test.js` - Unit tests
- File: Updated `src/game/character.js` - Combat integration

## Dependencies
- Requires: Task 2 (Character System & Movement) completion
- Blocks: Phase 2 (Advanced Combat) start

## Estimated Time
5 hours

## Success Criteria
- [ ] Combat system properly implemented with attack mechanics
- [ ] Health and damage system functional
- [ ] Basic hit detection working correctly
- [ ] Combat states and animations implemented
- [ ] Combat UI elements displaying properly
- [ ] All unit tests passing
- [ ] Integration with character system successful

## Detailed Implementation Steps

### Step 1: Create Combat System Architecture (1 hour)
- [ ] Create `src/game/combat.js` with Combat class
- [ ] Implement combat event system
- [ ] Create combat state management
- [ ] Add combat configuration system
- [ ] Set up combat initialization and cleanup

### Step 2: Implement Attack System (1 hour)
- [ ] Create `src/game/attacks.js` with Attack class
- [ ] Implement basic attack types (punch, kick, special)
- [ ] Add attack damage calculation
- [ ] Create attack cooldown system
- [ ] Add attack validation and error handling

### Step 3: Create Health and Damage System (1 hour)
- [ ] Create `src/game/health.js` with Health class
- [ ] Implement health bar system
- [ ] Add damage calculation and application
- [ ] Create damage indicators and effects
- [ ] Add health regeneration system

### Step 4: Implement Basic Hit Detection (1 hour)
- [ ] Extend collision system for combat
- [ ] Create attack hitbox system
- [ ] Implement hit detection algorithms
- [ ] Add hit validation and response
- [ ] Create hit debugging and visualization

### Step 5: Add Combat States and UI (0.5 hours)
- [ ] Implement combat state machine
- [ ] Add combat animations and effects
- [ ] Create health bar UI components
- [ ] Add damage number displays
- [ ] Implement combat feedback system

### Step 6: Create Tests and Configuration (0.5 hours)
- [ ] Create `tests/unit/combat.test.js`
- [ ] Test attack mechanics and damage
- [ ] Test hit detection accuracy
- [ ] Test health system functionality
- [ ] Create `src/config/combat.json` configuration

## Code Examples

### Combat System Architecture
```javascript
class Combat {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.attacks = new Map();
    this.activeAttacks = [];
    this.combatEvents = new EventEmitter();
    this.config = this.loadCombatConfig();
  }
  
  loadCombatConfig() {
    return {
      maxHealth: 100,
      baseDamage: 10,
      attackCooldown: 500,
      hitStunDuration: 300,
      blockDamageReduction: 0.5
    };
  }
  
  update(deltaTime) {
    // Update active attacks
    this.activeAttacks = this.activeAttacks.filter(attack => {
      attack.update(deltaTime);
      return !attack.isFinished();
    });
    
    // Check for hit detection
    this.checkHitDetection();
  }
  
  checkHitDetection() {
    this.activeAttacks.forEach(attack => {
      const targets = this.getPotentialTargets(attack.attacker);
      
      targets.forEach(target => {
        if (this.isHit(attack, target)) {
          this.processHit(attack, target);
        }
      });
    });
  }
  
  processHit(attack, target) {
    const damage = this.calculateDamage(attack, target);
    target.takeDamage(damage);
    
    // Emit hit event
    this.combatEvents.emit('hit', {
      attacker: attack.attacker,
      target: target,
      attack: attack,
      damage: damage
    });
    
    // Mark attack as hit
    attack.markAsHit(target);
  }
  
  createAttack(attacker, attackType) {
    const attack = new Attack(attacker, attackType, this.config);
    this.activeAttacks.push(attack);
    return attack;
  }
}
```

### Attack System
```javascript
class Attack {
  constructor(attacker, type, config) {
    this.attacker = attacker;
    this.type = type;
    this.config = config;
    this.damage = this.calculateDamage();
    this.range = this.getRange();
    this.cooldown = this.getCooldown();
    this.duration = this.getDuration();
    this.startTime = Date.now();
    this.hitTargets = new Set();
    this.isActive = true;
  }
  
  calculateDamage() {
    const baseDamage = this.config.baseDamage;
    const typeMultipliers = {
      'punch': 1.0,
      'kick': 1.5,
      'special': 2.0
    };
    
    return baseDamage * (typeMultipliers[this.type] || 1.0);
  }
  
  getRange() {
    const ranges = {
      'punch': 50,
      'kick': 80,
      'special': 120
    };
    
    return ranges[this.type] || 50;
  }
  
  getCooldown() {
    return this.config.attackCooldown;
  }
  
  getDuration() {
    const durations = {
      'punch': 300,
      'kick': 400,
      'special': 600
    };
    
    return durations[this.type] || 300;
  }
  
  update(deltaTime) {
    const elapsed = Date.now() - this.startTime;
    
    if (elapsed >= this.duration) {
      this.isActive = false;
    }
  }
  
  isFinished() {
    return !this.isActive;
  }
  
  isHit(target) {
    return this.hitTargets.has(target.id);
  }
  
  markAsHit(target) {
    this.hitTargets.add(target.id);
  }
  
  getHitbox() {
    const direction = this.attacker.direction;
    const x = this.attacker.x + (direction > 0 ? this.attacker.width : -this.range);
    const y = this.attacker.y;
    const width = this.range;
    const height = this.attacker.height;
    
    return { x, y, width, height };
  }
}
```

### Health System
```javascript
class Health {
  constructor(maxHealth = 100) {
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.isAlive = true;
    this.invulnerable = false;
    this.invulnerabilityTime = 0;
    this.regenerationRate = 0;
    this.regenerationDelay = 3000; // 3 seconds after taking damage
    this.lastDamageTime = 0;
  }
  
  takeDamage(amount) {
    if (this.invulnerable || !this.isAlive) return 0;
    
    const actualDamage = Math.min(this.currentHealth, amount);
    this.currentHealth -= actualDamage;
    this.lastDamageTime = Date.now();
    
    // Set invulnerability
    this.invulnerable = true;
    this.invulnerabilityTime = 1000; // 1 second invulnerability
    
    // Check if dead
    if (this.currentHealth <= 0) {
      this.die();
    }
    
    return actualDamage;
  }
  
  heal(amount) {
    if (!this.isAlive) return 0;
    
    const actualHeal = Math.min(this.maxHealth - this.currentHealth, amount);
    this.currentHealth += actualHeal;
    
    return actualHeal;
  }
  
  update(deltaTime) {
    // Update invulnerability
    if (this.invulnerable) {
      this.invulnerabilityTime -= deltaTime;
      if (this.invulnerabilityTime <= 0) {
        this.invulnerable = false;
      }
    }
    
    // Update regeneration
    if (this.regenerationRate > 0 && this.isAlive) {
      const timeSinceDamage = Date.now() - this.lastDamageTime;
      if (timeSinceDamage > this.regenerationDelay) {
        this.heal(this.regenerationRate * deltaTime / 1000);
      }
    }
  }
  
  die() {
    this.isAlive = false;
    this.currentHealth = 0;
  }
  
  revive() {
    this.isAlive = true;
    this.currentHealth = this.maxHealth;
    this.invulnerable = false;
  }
  
  getHealthPercentage() {
    return this.currentHealth / this.maxHealth;
  }
  
  isInvulnerable() {
    return this.invulnerable;
  }
}
```

### Enhanced Character Class
```javascript
class Character {
  constructor(config) {
    // ... existing properties from Task 2 ...
    
    // Combat properties
    this.health = new Health(config.maxHealth || 100);
    this.attackCooldowns = new Map();
    this.combatState = 'idle';
    this.lastAttackTime = 0;
    
    // Combat methods
    this.attack = this.attack.bind(this);
    this.takeDamage = this.takeDamage.bind(this);
    this.isAlive = this.isAlive.bind(this);
  }
  
  update(deltaTime) {
    // ... existing update logic from Task 2 ...
    
    // Update health
    this.health.update(deltaTime);
    
    // Update attack cooldowns
    this.updateAttackCooldowns(deltaTime);
  }
  
  attack(attackType) {
    if (!this.isAlive() || this.isAttackOnCooldown(attackType)) {
      return false;
    }
    
    const attack = this.gameEngine.combat.createAttack(this, attackType);
    this.lastAttackTime = Date.now();
    this.setAttackCooldown(attackType);
    this.combatState = 'attacking';
    
    return attack;
  }
  
  takeDamage(amount) {
    const damage = this.health.takeDamage(amount);
    
    if (damage > 0) {
      this.combatState = 'hit';
      this.velocity.x = -this.direction * 5; // Knockback
      
      // Emit damage event
      this.gameEngine.events.emit('characterDamaged', {
        character: this,
        damage: damage,
        remainingHealth: this.health.currentHealth
      });
    }
    
    return damage;
  }
  
  isAlive() {
    return this.health.isAlive;
  }
  
  isAttackOnCooldown(attackType) {
    const cooldown = this.attackCooldowns.get(attackType);
    return cooldown && cooldown > 0;
  }
  
  setAttackCooldown(attackType) {
    const cooldownTimes = {
      'punch': 300,
      'kick': 500,
      'special': 1000
    };
    
    this.attackCooldowns.set(attackType, cooldownTimes[attackType] || 500);
  }
  
  updateAttackCooldowns(deltaTime) {
    this.attackCooldowns.forEach((cooldown, attackType) => {
      if (cooldown > 0) {
        this.attackCooldowns.set(attackType, cooldown - deltaTime);
      }
    });
  }
  
  render(ctx) {
    // ... existing rendering logic from Task 2 ...
    
    // Render health bar
    this.renderHealthBar(ctx);
    
    // Render attack cooldowns
    this.renderAttackCooldowns(ctx);
  }
  
  renderHealthBar(ctx) {
    const barWidth = this.width;
    const barHeight = 6;
    const barX = this.x;
    const barY = this.y - 10;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Health bar
    const healthPercent = this.health.getHealthPercentage();
    const healthWidth = barWidth * healthPercent;
    
    if (healthPercent > 0.6) {
      ctx.fillStyle = '#00ff00';
    } else if (healthPercent > 0.3) {
      ctx.fillStyle = '#ffff00';
    } else {
      ctx.fillStyle = '#ff0000';
    }
    
    ctx.fillRect(barX, barY, healthWidth, barHeight);
    
    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }
}
```

## Testing Strategy

### Unit Tests
- [ ] Test attack creation and properties
- [ ] Test damage calculation and application
- [ ] Test health system functionality
- [ ] Test hit detection accuracy
- [ ] Test combat state management

### Integration Tests
- [ ] Test combat integration with character system
- [ ] Test attack cooldown system
- [ ] Test health bar rendering
- [ ] Test combat event system

## Risk Mitigation
- **Complex combat mechanics**: Start with simple attacks, add complexity gradually
- **Hit detection accuracy**: Test thoroughly, add debugging tools
- **Performance issues**: Monitor performance, optimize early
- **Combat balance**: Use data-driven configuration, test extensively

## Next Phase Preparation
- [ ] Ensure combat system is extensible for advanced features
- [ ] Prepare hit detection for combo system
- [ ] Set up combat system for victory conditions
- [ ] Document combat API for Phase 2 integration

---

**Phase 1 Complete! Combat foundation ready for advanced combat features.** 🎯⚔️ 