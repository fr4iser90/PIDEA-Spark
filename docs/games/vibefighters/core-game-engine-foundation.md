# Vibe Fighter - Core Game Engine Foundation

## Overview

The Core Game Engine Foundation provides a robust, component-based architecture for the Vibe Fighter game. It serves as the central hub for all game systems, providing canvas management, game loop, performance monitoring, and system integration.

## Architecture

### Core Components

#### 1. CoreGameEngine Class
The main engine class that orchestrates all game systems and provides the foundation for game development.

**Key Features:**
- Canvas setup and management
- Game loop with requestAnimationFrame
- Delta time calculation
- Performance monitoring
- Component and system registry
- Event system
- Error handling

#### 2. Component System
A flexible component-based architecture that allows for modular game development.

**Features:**
- Dynamic component registration/unregistration
- Automatic update and render cycles
- Component lifecycle management
- Event-driven communication

#### 3. System Management
Centralized management of game systems with automatic integration.

**Systems:**
- Collision Detection System
- Animation System
- Error Handler
- Debug Manager

## Usage

### Basic Setup

```javascript
import { CoreGameEngine } from './src/game/core-engine.js';

// Create engine instance
const engine = new CoreGameEngine({
  width: 1280,
  height: 720
});

// Initialize engine
await engine.init();

// Start game loop
await engine.start();
```

### Component Registration

```javascript
// Register a custom component
const playerComponent = {
  update: (deltaTime) => {
    // Update player logic
  },
  render: (ctx) => {
    // Render player
  }
};

engine.registerComponent('player', playerComponent);
```

### System Integration

```javascript
// Access core systems
const collisionSystem = engine.collisionSystem;
const animationSystem = engine.animationSystem;

// Add objects to collision detection
collisionSystem.addObject(player, 'characters');

// Create animations
animationSystem.addAnimation('player-walk', {
  frames: [...],
  duration: 1000
});
```

### Event System

```javascript
// Add event listeners
engine.addEventListener('gameStart', (data) => {
  console.log('Game started:', data);
});

// Emit events
engine.emitEvent('gameStart', { level: 1 });
```

## Configuration

The engine uses the centralized game configuration system:

```javascript
import { GameConfig, getConfig } from './src/config/game-config.js';

// Access configuration values
const targetFPS = getConfig('canvas.targetFPS', 60);
const debugMode = getConfig('debug.showFPS', false);
```

## Performance Monitoring

The engine provides comprehensive performance tracking:

```javascript
// Get performance statistics
const stats = engine.getPerformanceStats();
console.log('FPS:', stats.fps);
console.log('Frame Time:', stats.frameTime);
console.log('Update Time:', stats.updateTime);
console.log('Render Time:', stats.renderTime);
```

## Game States

The engine manages different game states:

- `initializing`: Engine is being initialized
- `ready`: Engine is ready to start
- `loading`: Loading game resources
- `playing`: Game is running
- `paused`: Game is paused
- `gameOver`: Game has ended

## Error Handling

Robust error handling ensures the engine continues running even when components fail:

```javascript
// Errors in components are caught and logged
const errorComponent = {
  update: () => {
    throw new Error('Component error');
  }
};

// Engine continues running despite component errors
engine.registerComponent('error', errorComponent);
```

## Canvas Management

Automatic canvas setup and responsive sizing:

```javascript
// Canvas is automatically configured
engine.setupCanvas();

// Handle window resize
engine.handleResize();

// Get canvas dimensions
const { width, height } = engine.getDimensions();
```

## Integration with Existing Systems

The core engine integrates seamlessly with existing game systems:

### Game Engine Integration

```javascript
// Pass core engine to game engine
const gameEngine = new GameEngine({
  coreEngine: engine,
  // ... other dependencies
});
```

### Utility Systems

All utility systems are automatically available:

- **CollisionSystem**: Spatial partitioning and collision detection
- **AnimationSystem**: Sprite animations and transitions
- **ErrorHandler**: Centralized error management
- **DebugManager**: Debug information and logging

## Testing

Comprehensive test suites ensure reliability:

### Unit Tests
- Engine initialization and lifecycle
- Component system functionality
- Performance monitoring
- Error handling

### Integration Tests
- System integration
- Canvas management
- Event system
- Memory management

## Performance Considerations

### Optimization Features
- Delta time capping to prevent spiral of death
- Spatial partitioning for collision detection
- Efficient component updates
- Memory leak prevention

### Best Practices
- Register components only when needed
- Clean up resources properly
- Monitor performance statistics
- Handle errors gracefully

## Debug Features

Enable debug mode for development:

```javascript
// Enable debug information
GameConfig.debug.showFPS = true;
GameConfig.debug.showPerformanceInfo = true;

// Debug information is rendered on canvas
```

## API Reference

### CoreGameEngine Methods

#### Lifecycle
- `init()`: Initialize the engine
- `start()`: Start the game loop
- `stop()`: Stop the game loop
- `pause()`: Pause the game
- `resume()`: Resume the game

#### Component Management
- `registerComponent(name, component)`: Register a component
- `unregisterComponent(name)`: Unregister a component

#### System Management
- `registerSystem(name, system)`: Register a system
- `unregisterSystem(name)`: Unregister a system

#### Event System
- `addEventListener(event, callback)`: Add event listener
- `removeEventListener(event, callback)`: Remove event listener
- `emitEvent(event, data)`: Emit an event

#### Canvas Management
- `setupCanvas()`: Setup canvas and context
- `handleResize()`: Handle window resize
- `getDimensions()`: Get canvas dimensions

#### Status and Statistics
- `getStatus()`: Get engine status
- `getPerformanceStats()`: Get performance statistics

### Component Interface

Components should implement:

```javascript
{
  update: (deltaTime) => {
    // Update logic
  },
  render: (ctx) => {
    // Render logic
  },
  init: () => {
    // Initialization (optional)
  },
  cleanup: () => {
    // Cleanup (optional)
  }
}
```

## Migration Guide

### From Legacy Engine

1. **Replace direct canvas access**:
   ```javascript
   // Old
   const canvas = document.getElementById('game-canvas');
   
   // New
   const canvas = engine.getCanvas();
   ```

2. **Use component system**:
   ```javascript
   // Old
   function updatePlayer() { /* ... */ }
   
   // New
   engine.registerComponent('player', {
     update: updatePlayer
   });
   ```

3. **Use event system**:
   ```javascript
   // Old
   // Direct function calls
   
   // New
   engine.emitEvent('playerMove', { x, y });
   ```

## Future Enhancements

### Planned Features
- WebGL rendering support
- Multi-threading for heavy computations
- Advanced profiling tools
- Plugin system for extensions

### Performance Improvements
- Web Workers for physics calculations
- GPU-accelerated rendering
- Advanced memory management
- Predictive loading

## Troubleshooting

### Common Issues

1. **Canvas not found**: Ensure `#game-canvas` exists in HTML
2. **Performance issues**: Monitor FPS and optimize components
3. **Memory leaks**: Properly cleanup components and systems
4. **Event errors**: Check event handler implementations

### Debug Tips

1. Enable debug mode for performance monitoring
2. Use browser dev tools for profiling
3. Monitor console for error messages
4. Check component update frequencies

## Contributing

When contributing to the core engine:

1. Follow the existing code patterns
2. Add comprehensive tests
3. Update documentation
4. Ensure backward compatibility
5. Test performance impact

## License

This core engine is part of the Vibe Fighter project and follows the same licensing terms. 