# Combat System & Collision – Phase 2: Advanced Combat

## Overview
Implement advanced combat features including sophisticated hit detection, combo system, special moves, victory conditions, combat balance, effects, and performance optimizations. This phase builds upon the combat foundation from Phase 1 to create a complete and polished combat system.

## Objectives
- [ ] Implement advanced hit detection (hitbox system, frame-perfect detection)
- [ ] Add combo system and special moves (combo chains, special attacks)
- [ ] Create victory conditions and scoring (team elimination, point system)
- [ ] Implement combat balance system (damage scaling, cooldowns)
- [ ] Add combat effects and feedback (screen shake, particle effects)
- [ ] Optimize combat performance (efficient hit detection, effect pooling)
- [ ] Test advanced combat features thoroughly

## Deliverables
- File: `src/utils/hit-detection.js` - Advanced hit detection system
- File: Updated `src/game/combat.js` - Advanced combat features
- File: Updated `src/game/attacks.js` - Combo and special move system
- File: Updated `src/game/damage.js` - Balance and scaling system
- File: `tests/integration/combat-system.test.js` - Integration tests
- File: Performance optimizations for combat system

## Dependencies
- Requires: Phase 1 (Combat Foundation) completion
- Requires: Task 2 (Character System) completion
- Blocks: Task 4 (UI System) start

## Estimated Time
5 hours

## Success Criteria
- [ ] Advanced hit detection accurate and responsive
- [ ] Combo system functional with proper timing
- [ ] Special moves working correctly
- [ ] Victory conditions properly implemented
- [ ] Combat balance system effective
- [ ] Visual effects smooth and engaging
- [ ] Performance optimized for multiple characters
- [ ] All integration tests passing

## Detailed Implementation Steps

### Step 1: Implement Advanced Hit Detection (1.5 hours)
- [ ] Create `src/utils/hit-detection.js` with HitDetection class
- [ ] Implement hitbox system with multiple hitbox types
- [ ] Add frame-perfect hit detection
- [ ] Create hit validation and response system
- [ ] Add hit debugging and visualization tools
- [ ] Optimize hit detection performance

### Step 2: Create Combo System (1 hour)
- [ ] Extend Attack class with combo properties
- [ ] Implement combo chain detection
- [ ] Add combo damage scaling
- [ ] Create combo window management
- [ ] Add combo counter display
- [ ] Test combo system thoroughly

### Step 3: Implement Special Moves (1 hour)
- [ ] Create special move definitions
- [ ] Add special move input detection
- [ ] Implement special move effects
- [ ] Create special move cooldowns
- [ ] Add special move animations
- [ ] Test special move functionality

### Step 4: Add Victory Conditions (0.5 hours)
- [ ] Implement team elimination victory
- [ ] Add point-based victory system
- [ ] Create time limit victory
- [ ] Add victory screen and celebration
- [ ] Implement round management
- [ ] Test victory conditions

### Step 5: Create Combat Balance System (0.5 hours)
- [ ] Implement damage scaling system
- [ ] Add dynamic cooldown management
- [ ] Create balance monitoring tools
- [ ] Add difficulty adjustment
- [ ] Implement fairness algorithms
- [ ] Test balance system

### Step 6: Add Combat Effects (0.5 hours)
- [ ] Implement screen shake effects
- [ ] Add particle effect system
- [ ] Create hit impact effects
- [ ] Add sound effect integration
- [ ] Implement visual feedback
- [ ] Test effect system

### Step 7: Performance Optimization (0.5 hours)
- [ ] Optimize hit detection algorithms
- [ ] Implement effect pooling
- [ ] Add performance monitoring
- [ ] Optimize rendering for effects
- [ ] Create performance benchmarks
- [ ] Test performance under load

## Code Examples

### Advanced Hit Detection System
```javascript
class HitDetection {
  constructor() {
    this.hitboxes = new Map();
    this.activeHits = new Set();
    this.frameCount = 0;
    this.debugMode = false;
  }
  
  createHitbox(character, type, config) {
    const hitbox = {
      id: `${character.id}_${type}_${Date.now()}`,
      character: character,
      type: type,
      x: config.x,
      y: config.y,
      width: config.width,
      height: config.height,
      damage: config.damage,
      knockback: config.knockback,
      stun: config.stun,
      activeFrames: config.activeFrames,
      currentFrame: 0,
      isActive: true
    };
    
    this.hitboxes.set(hitbox.id, hitbox);
    return hitbox;
  }
  
  update(deltaTime) {
    this.frameCount++;
    
    // Update all hitboxes
    this.hitboxes.forEach((hitbox, id) => {
      hitbox.currentFrame++;
      
      // Deactivate hitbox after active frames
      if (hitbox.currentFrame >= hitbox.activeFrames) {
        hitbox.isActive = false;
        this.hitboxes.delete(id);
      }
    });
    
    // Check for collisions
    this.checkCollisions();
  }
  
  checkCollisions() {
    const activeHitboxes = Array.from(this.hitboxes.values()).filter(h => h.isActive);
    
    for (let i = 0; i < activeHitboxes.length; i++) {
      for (let j = i + 1; j < activeHitboxes.length; j++) {
        const hitbox1 = activeHitboxes[i];
        const hitbox2 = activeHitboxes[j];
        
        // Skip if same character or same team
        if (hitbox1.character === hitbox2.character || 
            hitbox1.character.teamId === hitbox2.character.teamId) {
          continue;
        }
        
        if (this.isColliding(hitbox1, hitbox2)) {
          this.processHit(hitbox1, hitbox2);
        }
      }
    }
  }
  
  isColliding(hitbox1, hitbox2) {
    // Get world coordinates of hitboxes
    const box1 = this.getWorldHitbox(hitbox1);
    const box2 = this.getWorldHitbox(hitbox2);
    
    return box1.x < box2.x + box2.width &&
           box1.x + box1.width > box2.x &&
           box1.y < box2.y + box2.height &&
           box1.y + box1.height > box2.y;
  }
  
  getWorldHitbox(hitbox) {
    const character = hitbox.character;
    const direction = character.direction;
    
    return {
      x: character.x + (direction > 0 ? hitbox.x : character.width - hitbox.x - hitbox.width),
      y: character.y + hitbox.y,
      width: hitbox.width,
      height: hitbox.height
    };
  }
  
  processHit(attackerHitbox, defenderHitbox) {
    const attacker = attackerHitbox.character;
    const defender = defenderHitbox.character;
    
    // Calculate damage
    const damage = this.calculateDamage(attackerHitbox, defender);
    
    // Apply damage
    defender.takeDamage(damage);
    
    // Apply knockback
    this.applyKnockback(attacker, defender, attackerHitbox.knockback);
    
    // Apply stun
    if (attackerHitbox.stun > 0) {
      defender.applyStun(attackerHitbox.stun);
    }
    
    // Mark hitbox as used
    attackerHitbox.isActive = false;
    
    // Emit hit event
    this.emitHitEvent(attacker, defender, damage);
  }
  
  calculateDamage(hitbox, target) {
    let damage = hitbox.damage;
    
    // Apply combo multiplier
    if (hitbox.character.comboCount > 1) {
      damage *= (1 + (hitbox.character.comboCount - 1) * 0.2);
    }
    
    // Apply defense modifier
    if (target.isDefending) {
      damage *= 0.5;
    }
    
    // Apply random variation (±10%)
    const variation = 0.9 + Math.random() * 0.2;
    damage *= variation;
    
    return Math.round(damage);
  }
  
  applyKnockback(attacker, defender, knockback) {
    const direction = attacker.direction;
    const force = {
      x: direction * knockback.x,
      y: knockback.y
    };
    
    defender.velocity.x += force.x;
    defender.velocity.y += force.y;
  }
  
  emitHitEvent(attacker, defender, damage) {
    const event = new CustomEvent('combatHit', {
      detail: {
        attacker: attacker,
        defender: defender,
        damage: damage,
        frame: this.frameCount
      }
    });
    document.dispatchEvent(event);
  }
  
  renderDebug(ctx) {
    if (!this.debugMode) return;
    
    this.hitboxes.forEach(hitbox => {
      if (!hitbox.isActive) return;
      
      const worldBox = this.getWorldHitbox(hitbox);
      
      ctx.strokeStyle = hitbox.type === 'attack' ? 'red' : 'blue';
      ctx.lineWidth = 2;
      ctx.strokeRect(worldBox.x, worldBox.y, worldBox.width, worldBox.height);
      
      // Draw hitbox info
      ctx.fillStyle = 'white';
      ctx.font = '10px Arial';
      ctx.fillText(`${hitbox.type} ${hitbox.currentFrame}/${hitbox.activeFrames}`, 
                   worldBox.x, worldBox.y - 5);
    });
  }
}
```

### Combo System
```javascript
class ComboSystem {
  constructor() {
    this.comboWindow = 1000; // 1 second
    this.maxCombo = 10;
    this.comboDamageMultiplier = 0.2; // 20% increase per combo
  }
  
  updateCharacter(character, deltaTime) {
    // Update combo timer
    if (character.lastAttackTime > 0) {
      const timeSinceLastAttack = Date.now() - character.lastAttackTime;
      
      if (timeSinceLastAttack > this.comboWindow) {
        character.comboCount = 0;
        character.comboTimer = 0;
      } else {
        character.comboTimer = this.comboWindow - timeSinceLastAttack;
      }
    }
  }
  
  processAttack(character, attackType) {
    const currentTime = Date.now();
    
    // Check if within combo window
    if (currentTime - character.lastAttackTime < this.comboWindow) {
      character.comboCount++;
      character.comboCount = Math.min(character.comboCount, this.maxCombo);
    } else {
      character.comboCount = 1;
    }
    
    character.lastAttackTime = currentTime;
    character.comboTimer = this.comboWindow;
    
    // Apply combo damage multiplier
    const comboMultiplier = 1 + (character.comboCount - 1) * this.comboDamageMultiplier;
    
    return {
      comboCount: character.comboCount,
      damageMultiplier: comboMultiplier,
      comboWindow: this.comboWindow
    };
  }
  
  getComboDamage(baseDamage, comboCount) {
    const multiplier = 1 + (comboCount - 1) * this.comboDamageMultiplier;
    return Math.round(baseDamage * multiplier);
  }
  
  renderComboCounter(ctx, character) {
    if (character.comboCount <= 1) return;
    
    const x = character.x + character.width / 2;
    const y = character.y - 30;
    
    // Combo background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - 30, y - 15, 60, 20);
    
    // Combo text
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${character.comboCount}x COMBO!`, x, y);
    
    // Combo timer bar
    const timerWidth = 50;
    const timerHeight = 3;
    const timerX = x - timerWidth / 2;
    const timerY = y + 5;
    
    // Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(timerX, timerY, timerWidth, timerHeight);
    
    // Timer
    const timerPercent = character.comboTimer / this.comboWindow;
    const timerFillWidth = timerWidth * timerPercent;
    
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(timerX, timerY, timerFillWidth, timerHeight);
  }
}
```

### Special Moves System
```javascript
class SpecialMoves {
  constructor() {
    this.specialMoves = new Map();
    this.activeSpecials = [];
    this.loadSpecialMoves();
  }
  
  loadSpecialMoves() {
    this.specialMoves.set('fireball', {
      name: 'Fireball',
      input: ['down', 'down-forward', 'forward', 'attack'],
      damage: 30,
      range: 200,
      cooldown: 3000,
      effect: 'projectile'
    });
    
    this.specialMoves.set('uppercut', {
      name: 'Uppercut',
      input: ['down', 'up', 'attack'],
      damage: 40,
      range: 60,
      cooldown: 2000,
      effect: 'launcher'
    });
    
    this.specialMoves.set('hadouken', {
      name: 'Hadouken',
      input: ['down', 'down-forward', 'forward', 'attack'],
      damage: 35,
      range: 300,
      cooldown: 2500,
      effect: 'energy_ball'
    });
  }
  
  checkSpecialMove(character, inputSequence) {
    this.specialMoves.forEach((move, moveId) => {
      if (this.matchesInput(inputSequence, move.input)) {
        if (this.canUseSpecialMove(character, moveId)) {
          this.executeSpecialMove(character, moveId);
        }
      }
    });
  }
  
  matchesInput(inputSequence, moveInput) {
    if (inputSequence.length < moveInput.length) return false;
    
    const recentInputs = inputSequence.slice(-moveInput.length);
    
    for (let i = 0; i < moveInput.length; i++) {
      if (recentInputs[i] !== moveInput[i]) {
        return false;
      }
    }
    
    return true;
  }
  
  canUseSpecialMove(character, moveId) {
    const move = this.specialMoves.get(moveId);
    if (!move) return false;
    
    const lastUse = character.specialMoveCooldowns.get(moveId) || 0;
    const currentTime = Date.now();
    
    return currentTime - lastUse >= move.cooldown;
  }
  
  executeSpecialMove(character, moveId) {
    const move = this.specialMoves.get(moveId);
    if (!move) return;
    
    // Set cooldown
    character.specialMoveCooldowns.set(moveId, Date.now());
    
    // Create special move instance
    const specialMove = new SpecialMove(character, move);
    this.activeSpecials.push(specialMove);
    
    // Emit special move event
    const event = new CustomEvent('specialMove', {
      detail: {
        character: character,
        move: move,
        moveId: moveId
      }
    });
    document.dispatchEvent(event);
  }
  
  update(deltaTime) {
    // Update active special moves
    this.activeSpecials = this.activeSpecials.filter(special => {
      special.update(deltaTime);
      return !special.isFinished();
    });
  }
}

class SpecialMove {
  constructor(character, moveConfig) {
    this.character = character;
    this.config = moveConfig;
    this.startTime = Date.now();
    this.duration = 1000;
    this.isActive = true;
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
  
  getDamage() {
    return this.config.damage;
  }
  
  getRange() {
    return this.config.range;
  }
  
  getEffect() {
    return this.config.effect;
  }
}
```

### Victory Conditions System
```javascript
class VictoryConditions {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.conditions = {
      teamElimination: true,
      pointSystem: false,
      timeLimit: false
    };
    this.roundTime = 0;
    this.maxRoundTime = 300000; // 5 minutes
    this.pointLimit = 100;
    this.teamScores = new Map();
  }
  
  update(deltaTime) {
    this.roundTime += deltaTime;
    
    // Check time limit
    if (this.conditions.timeLimit && this.roundTime >= this.maxRoundTime) {
      this.handleTimeLimitVictory();
    }
    
    // Check team elimination
    if (this.conditions.teamElimination) {
      this.checkTeamElimination();
    }
    
    // Check point system
    if (this.conditions.pointSystem) {
      this.checkPointVictory();
    }
  }
  
  checkTeamElimination() {
    const teams = this.gameEngine.teamSystem.getAllTeams();
    const aliveTeams = teams.filter(team => this.isTeamAlive(team));
    
    if (aliveTeams.length <= 1) {
      const winner = aliveTeams.length === 1 ? aliveTeams[0] : null;
      this.handleVictory(winner, 'teamElimination');
    }
  }
  
  isTeamAlive(team) {
    return team.members.some(member => member.isAlive());
  }
  
  checkPointVictory() {
    this.teamScores.forEach((score, teamId) => {
      if (score >= this.pointLimit) {
        const winningTeam = this.gameEngine.teamSystem.getTeam(teamId);
        this.handleVictory(winningTeam, 'pointSystem');
      }
    });
  }
  
  handleTimeLimitVictory() {
    // Determine winner by health percentage
    const teams = this.gameEngine.teamSystem.getAllTeams();
    let winningTeam = null;
    let highestHealthPercent = 0;
    
    teams.forEach(team => {
      const healthPercent = this.getTeamHealthPercentage(team);
      if (healthPercent > highestHealthPercent) {
        highestHealthPercent = healthPercent;
        winningTeam = team;
      }
    });
    
    this.handleVictory(winningTeam, 'timeLimit');
  }
  
  getTeamHealthPercentage(team) {
    const aliveMembers = team.members.filter(member => member.isAlive());
    if (aliveMembers.length === 0) return 0;
    
    const totalHealth = aliveMembers.reduce((sum, member) => {
      return sum + member.health.getHealthPercentage();
    }, 0);
    
    return totalHealth / aliveMembers.length;
  }
  
  handleVictory(winningTeam, victoryType) {
    this.gameEngine.setGameState('victory');
    
    // Emit victory event
    const event = new CustomEvent('gameVictory', {
      detail: {
        winningTeam: winningTeam,
        victoryType: victoryType,
        roundTime: this.roundTime,
        teamScores: Object.fromEntries(this.teamScores)
      }
    });
    document.dispatchEvent(event);
    
    // Show victory screen
    this.showVictoryScreen(winningTeam, victoryType);
  }
  
  showVictoryScreen(winningTeam, victoryType) {
    // Create victory screen UI
    const victoryScreen = document.createElement('div');
    victoryScreen.className = 'victory-screen';
    victoryScreen.innerHTML = `
      <div class="victory-content">
        <h1>VICTORY!</h1>
        <h2>${winningTeam ? winningTeam.name : 'Draw'}</h2>
        <p>Victory Type: ${victoryType}</p>
        <p>Round Time: ${Math.floor(this.roundTime / 1000)}s</p>
        <button onclick="restartGame()">Play Again</button>
      </div>
    `;
    
    document.body.appendChild(victoryScreen);
  }
  
  addTeamScore(teamId, points) {
    const currentScore = this.teamScores.get(teamId) || 0;
    this.teamScores.set(teamId, currentScore + points);
  }
  
  resetRound() {
    this.roundTime = 0;
    this.teamScores.clear();
  }
}
```

## Testing Strategy

### Unit Tests
- [ ] Test advanced hit detection accuracy
- [ ] Test combo system timing and damage
- [ ] Test special move execution
- [ ] Test victory condition logic
- [ ] Test balance system effectiveness

### Integration Tests
- [ ] Test combat system with multiple characters
- [ ] Test combo system in real combat
- [ ] Test special moves in gameplay
- [ ] Test victory conditions in full matches

### Performance Tests
- [ ] Test hit detection performance with 8 characters
- [ ] Test effect system performance
- [ ] Test memory usage with multiple special moves
- [ ] Test overall combat performance

## Risk Mitigation
- **Complex hit detection**: Start with simple hitboxes, add complexity gradually
- **Combo timing**: Use generous timing windows, adjust based on testing
- **Performance issues**: Monitor performance, optimize early
- **Balance problems**: Use data-driven balance, test extensively

## Performance Optimization

### Effect Pooling
```javascript
class EffectPool {
  constructor() {
    this.pools = new Map();
    this.activeEffects = [];
  }
  
  getEffect(type) {
    if (!this.pools.has(type)) {
      this.pools.set(type, []);
    }
    
    const pool = this.pools.get(type);
    
    if (pool.length > 0) {
      return pool.pop();
    }
    
    return this.createEffect(type);
  }
  
  returnEffect(effect) {
    effect.reset();
    const pool = this.pools.get(effect.type) || [];
    pool.push(effect);
    this.pools.set(effect.type, pool);
  }
  
  update(deltaTime) {
    this.activeEffects = this.activeEffects.filter(effect => {
      effect.update(deltaTime);
      
      if (effect.isFinished()) {
        this.returnEffect(effect);
        return false;
      }
      
      return true;
    });
  }
}
```

## Next Phase Preparation
- [ ] Ensure combat system integrates well with UI system
- [ ] Prepare victory screens for UI integration
- [ ] Set up combat feedback for UI display
- [ ] Document combat API for Task 4 integration

---

**Phase 2 Complete! Advanced combat system ready for UI integration.** 🎯⚔️ 