# Character System & Movement – Phase 1: Character Foundation

## Overview
Create the foundational character system with basic properties, state management, team formation, and input handling. This phase establishes the core character architecture that will be extended with physics and movement in Phase 2.

## Objectives
- [ ] Create Character class with basic properties (position, health, state)
- [ ] Implement character state management (idle, walking, jumping, attacking)
- [ ] Add character configuration system (JSON-based)
- [ ] Create team formation system (2v2, 3v3, 4v4)
- [ ] Implement basic character rendering on canvas
- [ ] Add character input handling (keyboard, gamepad)
- [ ] Create comprehensive character tests

## Deliverables
- File: `src/game/character.js` - Complete character class
- File: `src/game/team.js` - Team management system
- File: `src/config/characters.json` - Character configurations
- File: `tests/unit/character.test.js` - Unit tests
- File: Updated `src/game/characters.js` - Integration with existing system

## Dependencies
- Requires: Task 1 (Core Game Engine Foundation) completion
- Blocks: Phase 2 (Movement & Physics) start

## Estimated Time
5 hours

## Success Criteria
- [ ] Character class properly implemented with all required properties
- [ ] Character state management working correctly
- [ ] Team formation system functional
- [ ] Character rendering on canvas working
- [ ] Input handling for characters implemented
- [ ] All unit tests passing
- [ ] Integration with existing game engine successful

## Detailed Implementation Steps

### Step 1: Create Character Class (1 hour)
- [ ] Create `src/game/character.js` with basic Character class
- [ ] Implement constructor with position, health, state properties
- [ ] Add basic methods (update, render, takeDamage, heal)
- [ ] Create character type system (Fighter, Tank, Speedster)
- [ ] Add character ID and team assignment

### Step 2: Implement State Management (1 hour)
- [ ] Create character state machine
- [ ] Implement states: idle, walking, jumping, attacking, hit, dead
- [ ] Add state transition logic
- [ ] Create state-specific behavior methods
- [ ] Add state validation and error handling

### Step 3: Create Configuration System (0.5 hours)
- [ ] Create `src/config/characters.json` with character definitions
- [ ] Define character types with stats and properties
- [ ] Add character sprite references
- [ ] Create character factory for instantiation
- [ ] Add configuration validation

### Step 4: Implement Team System (1 hour)
- [ ] Create `src/game/team.js` with Team class
- [ ] Implement team formation (2v2, 3v3, 4v4)
- [ ] Add team coordination methods
- [ ] Create team assignment logic
- [ ] Add team validation and error handling

### Step 5: Add Character Rendering (0.5 hours)
- [ ] Implement character rendering on canvas
- [ ] Add sprite loading and management
- [ ] Create basic animation system
- [ ] Add debug rendering for collision boxes
- [ ] Optimize rendering performance

### Step 6: Implement Input Handling (0.5 hours)
- [ ] Add character input handling to existing input system
- [ ] Implement keyboard controls for movement
- [ ] Add gamepad support
- [ ] Create input mapping system
- [ ] Add input validation and error handling

### Step 7: Create Tests (0.5 hours)
- [ ] Create `tests/unit/character.test.js`
- [ ] Test character creation and properties
- [ ] Test state management and transitions
- [ ] Test team formation and coordination
- [ ] Test input handling and validation

## Code Examples

### Character Class Structure
```javascript
class Character {
  constructor(config) {
    this.id = generateId();
    this.name = config.name;
    this.type = config.type;
    this.team = config.team;
    
    // Physical properties
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.width = config.width || 32;
    this.height = config.height || 48;
    
    // Game properties
    this.health = config.health || 100;
    this.maxHealth = config.maxHealth || 100;
    this.speed = config.speed || 3;
    this.jumpForce = config.jumpForce || 12;
    
    // State management
    this.state = 'idle';
    this.stateMachine = new CharacterStateMachine(this);
    
    // Team
    this.teamId = config.teamId;
  }
  
  update(deltaTime) {
    this.stateMachine.update(deltaTime);
  }
  
  render(ctx) {
    // Basic rendering implementation
    ctx.fillStyle = this.teamId === 1 ? 'blue' : 'red';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    this.stateMachine.setState('hit');
  }
}
```

### Team System
```javascript
class Team {
  constructor(id, size = 2) {
    this.id = id;
    this.size = size;
    this.characters = [];
    this.formation = 'default';
  }
  
  addCharacter(character) {
    if (this.characters.length < this.size) {
      character.teamId = this.id;
      this.characters.push(character);
      return true;
    }
    return false;
  }
  
  removeCharacter(character) {
    const index = this.characters.indexOf(character);
    if (index > -1) {
      this.characters.splice(index, 1);
      character.teamId = null;
      return true;
    }
    return false;
  }
}
```

## Testing Strategy

### Unit Tests
- [ ] Test character creation with different configurations
- [ ] Test state transitions and validation
- [ ] Test team formation and character assignment
- [ ] Test input handling and validation
- [ ] Test character rendering and sprite loading

### Integration Tests
- [ ] Test character integration with game engine
- [ ] Test team coordination and formation
- [ ] Test input system integration
- [ ] Test rendering system integration

## Risk Mitigation
- **Complex state management**: Start with simple states, add complexity gradually
- **Team coordination**: Begin with basic team formation, add advanced features later
- **Input handling**: Leverage existing input system, extend as needed
- **Performance**: Monitor rendering performance, optimize if needed

## Next Phase Preparation
- [ ] Ensure character class is extensible for physics
- [ ] Prepare state machine for movement states
- [ ] Set up team system for coordination features
- [ ] Document API for Phase 2 integration

---

**Phase 1 Complete! Character foundation ready for movement and physics implementation.** 🎯 