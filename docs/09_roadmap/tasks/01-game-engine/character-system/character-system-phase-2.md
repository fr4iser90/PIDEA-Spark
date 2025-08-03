# Character System & Movement – Phase 2: Movement & Physics

## Overview
Implement movement physics system, gravity, jumping mechanics, collision detection, character switching, and team coordination. This phase builds upon the character foundation from Phase 1 to create responsive and realistic movement.

## Objectives
- [ ] Implement movement physics system (velocity, acceleration, friction)
- [ ] Add gravity and jumping mechanics (realistic physics)
- [ ] Create collision detection for character-to-character interactions
- [ ] Implement character switching system (team coordination)
- [ ] Add team coordination mechanics (formation, tactics)
- [ ] Optimize performance for multiple characters (object pooling, efficient rendering)
- [ ] Test movement and physics thoroughly

## Deliverables
- File: `src/utils/physics.js` - Movement physics system
- File: `src/utils/animation.js` - Character animation system
- File: Updated `src/game/character.js` - Physics integration
- File: Updated `src/game/team.js` - Team coordination features
- File: `tests/integration/character-system.test.js` - Integration tests
- File: Performance optimizations for multiple characters

## Dependencies
- Requires: Phase 1 (Character Foundation) completion
- Requires: Task 1 (Core Game Engine) completion
- Blocks: Task 3 (Combat System) start

## Estimated Time
5 hours

## Success Criteria
- [ ] Movement physics feel natural and responsive
- [ ] Gravity and jumping mechanics work correctly
- [ ] Collision detection accurate for character interactions
- [ ] Character switching system functional
- [ ] Team coordination mechanics working
- [ ] Performance optimized for multiple characters
- [ ] All integration tests passing
- [ ] Smooth 60fps gameplay with 8 characters

## Detailed Implementation Steps

### Step 1: Implement Physics System (1.5 hours)
- [ ] Create `src/utils/physics.js` with Physics class
- [ ] Implement velocity and acceleration calculations
- [ ] Add friction and air resistance
- [ ] Create gravity system
- [ ] Add physics constants and configuration
- [ ] Implement physics update loop

### Step 2: Add Movement Mechanics (1 hour)
- [ ] Extend Character class with physics properties
- [ ] Implement walking, running, and jumping
- [ ] Add movement input handling
- [ ] Create movement state transitions
- [ ] Add movement validation and limits
- [ ] Implement smooth movement interpolation

### Step 3: Create Collision Detection (1 hour)
- [ ] Implement character-to-character collision detection
- [ ] Add collision response and resolution
- [ ] Create collision event system
- [ ] Add collision debugging and visualization
- [ ] Optimize collision detection performance
- [ ] Test collision accuracy and edge cases

### Step 4: Implement Character Switching (1 hour)
- [ ] Create character switching system
- [ ] Add team-based character selection
- [ ] Implement switching animations and transitions
- [ ] Add switching input handling
- [ ] Create switching validation and rules
- [ ] Test switching with multiple players

### Step 5: Add Team Coordination (0.5 hours)
- [ ] Extend Team class with coordination features
- [ ] Implement team formation system
- [ ] Add team tactics and positioning
- [ ] Create team communication system
- [ ] Add team performance metrics
- [ ] Test team coordination scenarios

### Step 6: Performance Optimization (0.5 hours)
- [ ] Implement object pooling for characters
- [ ] Optimize rendering for multiple characters
- [ ] Add LOD (Level of Detail) system
- [ ] Optimize collision detection algorithms
- [ ] Add performance monitoring
- [ ] Test performance with maximum characters

### Step 7: Integration Testing (0.5 hours)
- [ ] Create `tests/integration/character-system.test.js`
- [ ] Test physics integration with game engine
- [ ] Test collision system integration
- [ ] Test team system integration
- [ ] Test performance under load
- [ ] Validate all systems work together

## Code Examples

### Physics System
```javascript
class Physics {
  constructor() {
    this.gravity = 0.8;
    this.friction = 0.85;
    this.airResistance = 0.95;
    this.maxVelocity = 15;
    this.maxJumpVelocity = 12;
  }
  
  updateCharacter(character, deltaTime) {
    // Apply gravity
    if (!character.isOnGround) {
      character.velocity.y += this.gravity;
    }
    
    // Apply friction
    if (character.isOnGround) {
      character.velocity.x *= this.friction;
    } else {
      character.velocity.x *= this.airResistance;
    }
    
    // Limit velocity
    character.velocity.x = Math.max(-this.maxVelocity, 
                                   Math.min(this.maxVelocity, character.velocity.x));
    character.velocity.y = Math.max(-this.maxVelocity, 
                                   Math.min(this.maxVelocity, character.velocity.y));
    
    // Update position
    character.x += character.velocity.x;
    character.y += character.velocity.y;
    
    // Check ground collision
    this.checkGroundCollision(character);
  }
  
  checkGroundCollision(character) {
    const groundY = 600 - character.height; // Canvas height - character height
    
    if (character.y >= groundY) {
      character.y = groundY;
      character.velocity.y = 0;
      character.isOnGround = true;
    } else {
      character.isOnGround = false;
    }
  }
  
  applyJump(character) {
    if (character.isOnGround) {
      character.velocity.y = -this.maxJumpVelocity;
      character.isOnGround = false;
      return true;
    }
    return false;
  }
}
```

### Enhanced Character Class
```javascript
class Character {
  constructor(config) {
    // ... existing properties from Phase 1 ...
    
    // Physics properties
    this.velocity = { x: 0, y: 0 };
    this.acceleration = { x: 0, y: 0 };
    this.isOnGround = false;
    this.physics = new Physics();
    
    // Movement properties
    this.speed = config.speed || 3;
    this.jumpForce = config.jumpForce || 12;
    this.direction = 1; // 1 for right, -1 for left
    
    // Collision properties
    this.collisionBox = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
  
  update(deltaTime) {
    // Update physics
    this.physics.updateCharacter(this, deltaTime);
    
    // Update state machine
    this.stateMachine.update(deltaTime);
    
    // Update collision box
    this.updateCollisionBox();
    
    // Update animation
    this.updateAnimation(deltaTime);
  }
  
  updateCollisionBox() {
    this.collisionBox.x = this.x;
    this.collisionBox.y = this.y;
    this.collisionBox.width = this.width;
    this.collisionBox.height = this.height;
  }
  
  // Movement methods
  moveLeft() {
    this.velocity.x = -this.speed;
    this.direction = -1;
    this.stateMachine.setState('walking');
  }
  
  moveRight() {
    this.velocity.x = this.speed;
    this.direction = 1;
    this.stateMachine.setState('walking');
  }
  
  jump() {
    if (this.physics.applyJump(this)) {
      this.stateMachine.setState('jumping');
    }
  }
  
  stop() {
    this.velocity.x = 0;
    this.stateMachine.setState('idle');
  }
  
  // Collision methods
  checkCollision(otherCharacter) {
    const box1 = this.collisionBox;
    const box2 = otherCharacter.collisionBox;
    
    return box1.x < box2.x + box2.width &&
           box1.x + box1.width > box2.x &&
           box1.y < box2.y + box2.height &&
           box1.y + box1.height > box2.y;
  }
  
  resolveCollision(otherCharacter) {
    // Simple collision resolution
    const overlapX = Math.min(
      this.collisionBox.x + this.collisionBox.width - otherCharacter.collisionBox.x,
      otherCharacter.collisionBox.x + otherCharacter.collisionBox.width - this.collisionBox.x
    );
    
    const overlapY = Math.min(
      this.collisionBox.y + this.collisionBox.height - otherCharacter.collisionBox.y,
      otherCharacter.collisionBox.y + otherCharacter.collisionBox.height - this.collisionBox.y
    );
    
    if (overlapX < overlapY) {
      // Resolve horizontal collision
      if (this.collisionBox.x < otherCharacter.collisionBox.x) {
        this.x -= overlapX;
      } else {
        this.x += overlapX;
      }
      this.velocity.x = 0;
    } else {
      // Resolve vertical collision
      if (this.collisionBox.y < otherCharacter.collisionBox.y) {
        this.y -= overlapY;
        this.isOnGround = true;
        this.velocity.y = 0;
      } else {
        this.y += overlapY;
        this.velocity.y = 0;
      }
    }
    
    this.updateCollisionBox();
  }
}
```

### Enhanced Team System
```javascript
class Team {
  constructor(id, size = 2) {
    // ... existing properties from Phase 1 ...
    
    // Coordination properties
    this.formation = 'default';
    this.tactics = 'balanced';
    this.activeCharacterIndex = 0;
  }
  
  switchCharacter() {
    if (this.characters.length > 1) {
      this.activeCharacterIndex = (this.activeCharacterIndex + 1) % this.characters.length;
      return this.characters[this.activeCharacterIndex];
    }
    return null;
  }
  
  getActiveCharacter() {
    return this.characters[this.activeCharacterIndex];
  }
  
  setFormation(formation) {
    this.formation = formation;
    this.updateFormation();
  }
  
  updateFormation() {
    const baseX = 100;
    const baseY = 500;
    const spacing = 80;
    
    this.characters.forEach((character, index) => {
      switch (this.formation) {
        case 'line':
          character.x = baseX + (index * spacing);
          character.y = baseY;
          break;
        case 'triangle':
          if (index === 0) {
            character.x = baseX + spacing;
            character.y = baseY;
          } else {
            character.x = baseX + ((index - 1) * spacing);
            character.y = baseY - 40;
          }
          break;
        case 'square':
          const row = Math.floor(index / 2);
          const col = index % 2;
          character.x = baseX + (col * spacing);
          character.y = baseY - (row * 40);
          break;
        default:
          character.x = baseX + (index * spacing);
          character.y = baseY;
      }
    });
  }
  
  coordinate() {
    // Basic team coordination logic
    const activeChar = this.getActiveCharacter();
    const enemies = this.getEnemies();
    
    if (enemies.length > 0) {
      // Simple coordination: support active character
      this.characters.forEach(character => {
        if (character !== activeChar) {
          // Support logic here
          this.supportActiveCharacter(character, activeChar);
        }
      });
    }
  }
  
  supportActiveCharacter(supportChar, activeChar) {
    // Basic support behavior
    const distance = Math.abs(supportChar.x - activeChar.x);
    
    if (distance > 150) {
      // Move closer to active character
      if (supportChar.x < activeChar.x) {
        supportChar.moveRight();
      } else {
        supportChar.moveLeft();
      }
    } else if (distance < 50) {
      // Move away to avoid crowding
      if (supportChar.x < activeChar.x) {
        supportChar.moveLeft();
      } else {
        supportChar.moveRight();
      }
    }
  }
}
```

## Testing Strategy

### Unit Tests
- [ ] Test physics calculations (gravity, friction, velocity limits)
- [ ] Test movement mechanics (walking, jumping, stopping)
- [ ] Test collision detection accuracy
- [ ] Test character switching functionality
- [ ] Test team coordination features

### Integration Tests
- [ ] Test physics integration with character system
- [ ] Test collision system with multiple characters
- [ ] Test team coordination in gameplay scenarios
- [ ] Test performance with maximum character load

### Performance Tests
- [ ] Test 60fps with 8 characters
- [ ] Test collision detection performance
- [ ] Test rendering performance optimization
- [ ] Test memory usage with object pooling

## Risk Mitigation
- **Complex physics**: Start with simple physics, add complexity gradually
- **Performance issues**: Monitor performance, optimize early
- **Collision accuracy**: Test thoroughly, add debugging tools
- **Team coordination**: Start with basic coordination, add advanced features later

## Performance Optimization

### Object Pooling
```javascript
class CharacterPool {
  constructor() {
    this.pool = [];
    this.active = [];
  }
  
  getCharacter() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return new Character();
  }
  
  returnCharacter(character) {
    character.reset();
    this.pool.push(character);
  }
}
```

### Rendering Optimization
```javascript
class RenderOptimizer {
  constructor() {
    this.visibleCharacters = [];
    this.cullingEnabled = true;
  }
  
  updateVisibleCharacters(characters, camera) {
    this.visibleCharacters = characters.filter(char => 
      this.isInViewport(char, camera)
    );
  }
  
  isInViewport(character, camera) {
    return character.x + character.width > camera.x &&
           character.x < camera.x + camera.width &&
           character.y + character.height > camera.y &&
           character.y < camera.y + camera.height;
  }
}
```

## Next Phase Preparation
- [ ] Ensure physics system is ready for combat integration
- [ ] Prepare collision system for attack detection
- [ ] Set up team system for combat coordination
- [ ] Document physics API for Task 3 integration

---

**Phase 2 Complete! Movement and physics system ready for combat implementation.** 🎯⚔️ 