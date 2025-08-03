# Core Game Engine Foundation – Phase 3: Utility Systems

## Overview
Implement essential utility systems including collision detection, animation system, game configuration, and error handling for the Vibe Fighter game engine.

## Objectives
- [ ] Create collision detection system
- [ ] Implement animation system
- [ ] Set up game configuration system
- [ ] Add utility functions for common operations
- [ ] Implement error handling and logging

## Deliverables
- File: `utils/collision.js` - Collision detection system
- File: `utils/animation.js` - Animation system
- File: `config/game-config.js` - Game configuration
- Feature: Robust collision detection
- Feature: Flexible animation system
- Feature: Centralized configuration
- Feature: Error handling and logging

## Dependencies
- Requires: Phase 2 (Game Loop Implementation)
- Blocks: Character System & Movement

## Estimated Time
3 hours

## Success Criteria
- [ ] Collision detection system functional
- [ ] Animation system supports multiple animations
- [ ] Game configuration centralized and accessible
- [ ] Utility functions work correctly
- [ ] Error handling robust and informative
- [ ] Performance impact minimal
- [ ] Systems are extensible

## Technical Implementation

### Collision Detection System:
```javascript
class CollisionSystem {
  constructor() {
    this.objects = [];
    this.quadTree = null;
    this.broadPhase = true;
    this.narrowPhase = true;
  }
  
  init() {
    this.quadTree = new QuadTree({
      x: 0,
      y: 0,
      width: 800,
      height: 600
    }, 10);
  }
  
  addObject(object) {
    if (object.collisionBox) {
      this.objects.push(object);
      this.quadTree.insert(object);
    }
  }
  
  removeObject(object) {
    const index = this.objects.indexOf(object);
    if (index > -1) {
      this.objects.splice(index, 1);
      this.quadTree.clear();
      this.objects.forEach(obj => this.quadTree.insert(obj));
    }
  }
  
  update(deltaTime) {
    // Clear and rebuild quad tree
    this.quadTree.clear();
    this.objects.forEach(obj => this.quadTree.insert(obj));
    
    // Check collisions
    this.checkCollisions();
  }
  
  checkCollisions() {
    const collisions = [];
    
    // Broad phase using quad tree
    if (this.broadPhase) {
      this.objects.forEach(obj1 => {
        const candidates = this.quadTree.retrieve(obj1);
        
        candidates.forEach(obj2 => {
          if (obj1 !== obj2 && this.broadPhaseCheck(obj1, obj2)) {
            if (this.narrowPhaseCheck(obj1, obj2)) {
              collisions.push({ obj1, obj2 });
            }
          }
        });
      });
    } else {
      // Simple O(n²) collision check
      for (let i = 0; i < this.objects.length; i++) {
        for (let j = i + 1; j < this.objects.length; j++) {
          const obj1 = this.objects[i];
          const obj2 = this.objects[j];
          
          if (this.narrowPhaseCheck(obj1, obj2)) {
            collisions.push({ obj1, obj2 });
          }
        }
      }
    }
    
    // Handle collisions
    collisions.forEach(collision => {
      this.handleCollision(collision.obj1, collision.obj2);
    });
  }
  
  broadPhaseCheck(obj1, obj2) {
    // Simple AABB broad phase check
    return obj1.collisionBox.x < obj2.collisionBox.x + obj2.collisionBox.width &&
           obj1.collisionBox.x + obj1.collisionBox.width > obj2.collisionBox.x &&
           obj1.collisionBox.y < obj2.collisionBox.y + obj2.collisionBox.height &&
           obj1.collisionBox.y + obj1.collisionBox.height > obj2.collisionBox.y;
  }
  
  narrowPhaseCheck(obj1, obj2) {
    // More precise collision detection
    if (obj1.collisionType === 'circle' && obj2.collisionType === 'circle') {
      return this.circleCircleCollision(obj1, obj2);
    } else if (obj1.collisionType === 'rectangle' && obj2.collisionType === 'rectangle') {
      return this.rectangleRectangleCollision(obj1, obj2);
    } else {
      // Mixed collision types
      return this.mixedCollision(obj1, obj2);
    }
  }
  
  circleCircleCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = obj1.radius + obj2.radius;
    
    return distance < minDistance;
  }
  
  rectangleRectangleCollision(obj1, obj2) {
    return obj1.collisionBox.x < obj2.collisionBox.x + obj2.collisionBox.width &&
           obj1.collisionBox.x + obj1.collisionBox.width > obj2.collisionBox.x &&
           obj1.collisionBox.y < obj2.collisionBox.y + obj2.collisionBox.height &&
           obj1.collisionBox.y + obj1.collisionBox.height > obj2.collisionBox.y;
  }
  
  mixedCollision(obj1, obj2) {
    // Handle mixed collision types (circle vs rectangle)
    if (obj1.collisionType === 'circle' && obj2.collisionType === 'rectangle') {
      return this.circleRectangleCollision(obj1, obj2);
    } else {
      return this.circleRectangleCollision(obj2, obj1);
    }
  }
  
  circleRectangleCollision(circle, rectangle) {
    const closestX = Math.max(rectangle.collisionBox.x, 
                             Math.min(circle.x, rectangle.collisionBox.x + rectangle.collisionBox.width));
    const closestY = Math.max(rectangle.collisionBox.y, 
                             Math.min(circle.y, rectangle.collisionBox.y + rectangle.collisionBox.height));
    
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    
    return distanceSquared < circle.radius * circle.radius;
  }
  
  handleCollision(obj1, obj2) {
    // Trigger collision events
    if (obj1.onCollision) {
      obj1.onCollision(obj2);
    }
    if (obj2.onCollision) {
      obj2.onCollision(obj1);
    }
    
    // Emit collision event
    this.emitCollisionEvent(obj1, obj2);
  }
  
  emitCollisionEvent(obj1, obj2) {
    const event = new CustomEvent('collision', {
      detail: { obj1, obj2, timestamp: performance.now() }
    });
    document.dispatchEvent(event);
  }
  
  getCollisionResponse(obj1, obj2) {
    // Calculate collision response (separation, velocity changes, etc.)
    const response = {
      separation: { x: 0, y: 0 },
      velocityChange: { x: 0, y: 0 }
    };
    
    // Implement collision response logic based on collision types
    // This will be extended for specific game mechanics
    
    return response;
  }
}

// QuadTree for spatial partitioning
class QuadTree {
  constructor(bounds, maxObjects, maxLevels, level) {
    this.bounds = bounds;
    this.maxObjects = maxObjects || 10;
    this.maxLevels = maxLevels || 4;
    this.level = level || 0;
    
    this.objects = [];
    this.nodes = [];
  }
  
  split() {
    const subWidth = this.bounds.width / 2;
    const subHeight = this.bounds.height / 2;
    const x = this.bounds.x;
    const y = this.bounds.y;
    
    this.nodes[0] = new QuadTree({
      x: x + subWidth,
      y: y,
      width: subWidth,
      height: subHeight
    }, this.maxObjects, this.maxLevels, this.level + 1);
    
    this.nodes[1] = new QuadTree({
      x: x,
      y: y,
      width: subWidth,
      height: subHeight
    }, this.maxObjects, this.maxLevels, this.level + 1);
    
    this.nodes[2] = new QuadTree({
      x: x,
      y: y + subHeight,
      width: subWidth,
      height: subHeight
    }, this.maxObjects, this.maxLevels, this.level + 1);
    
    this.nodes[3] = new QuadTree({
      x: x + subWidth,
      y: y + subHeight,
      width: subWidth,
      height: subHeight
    }, this.maxObjects, this.maxLevels, this.level + 1);
  }
  
  getIndex(rect) {
    let index = -1;
    const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
    const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;
    
    const topQuadrant = rect.y < horizontalMidpoint && rect.y + rect.height < horizontalMidpoint;
    const bottomQuadrant = rect.y > horizontalMidpoint;
    
    if (rect.x < verticalMidpoint && rect.x + rect.width < verticalMidpoint) {
      if (topQuadrant) {
        index = 1;
      } else if (bottomQuadrant) {
        index = 2;
      }
    } else if (rect.x > verticalMidpoint) {
      if (topQuadrant) {
        index = 0;
      } else if (bottomQuadrant) {
        index = 3;
      }
    }
    
    return index;
  }
  
  insert(rect) {
    if (this.nodes.length) {
      const index = this.getIndex(rect);
      
      if (index !== -1) {
        this.nodes[index].insert(rect);
        return;
      }
    }
    
    this.objects.push(rect);
    
    if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
      if (!this.nodes.length) {
        this.split();
      }
      
      let i = 0;
      while (i < this.objects.length) {
        const index = this.getIndex(this.objects[i]);
        if (index !== -1) {
          this.nodes[index].insert(this.objects.splice(i, 1)[0]);
        } else {
          i++;
        }
      }
    }
  }
  
  retrieve(rect) {
    const index = this.getIndex(rect);
    let returnObjects = this.objects;
    
    if (this.nodes.length) {
      if (index !== -1) {
        returnObjects = returnObjects.concat(this.nodes[index].retrieve(rect));
      } else {
        for (let i = 0; i < this.nodes.length; i++) {
          returnObjects = returnObjects.concat(this.nodes[i].retrieve(rect));
        }
      }
    }
    
    return returnObjects;
  }
  
  clear() {
    this.objects = [];
    
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i]) {
        this.nodes[i].clear();
      }
    }
    
    this.nodes = [];
  }
}
```

### Animation System:
```javascript
class AnimationSystem {
  constructor() {
    this.animations = new Map();
    this.currentTime = 0;
    this.spriteSheets = new Map();
  }
  
  addSpriteSheet(name, image, frameWidth, frameHeight, frameCount) {
    this.spriteSheets.set(name, {
      image,
      frameWidth,
      frameHeight,
      frameCount,
      frames: []
    });
    
    // Generate frame data
    const sheet = this.spriteSheets.get(name);
    const cols = Math.floor(image.width / frameWidth);
    
    for (let i = 0; i < frameCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      sheet.frames.push({
        x: col * frameWidth,
        y: row * frameHeight,
        width: frameWidth,
        height: frameHeight
      });
    }
  }
  
  createAnimation(name, spriteSheetName, frames, duration, loop = true) {
    const spriteSheet = this.spriteSheets.get(spriteSheetName);
    if (!spriteSheet) {
      console.error(`Sprite sheet '${spriteSheetName}' not found`);
      return;
    }
    
    const animationFrames = frames.map(frameIndex => spriteSheet.frames[frameIndex]);
    
    this.animations.set(name, {
      frames: animationFrames,
      duration,
      loop,
      currentFrame: 0,
      startTime: 0,
      isPlaying: false
    });
  }
  
  playAnimation(name, reset = true) {
    const animation = this.animations.get(name);
    if (!animation) {
      console.error(`Animation '${name}' not found`);
      return;
    }
    
    if (reset || !animation.isPlaying) {
      animation.startTime = this.currentTime;
      animation.currentFrame = 0;
    }
    
    animation.isPlaying = true;
  }
  
  stopAnimation(name) {
    const animation = this.animations.get(name);
    if (animation) {
      animation.isPlaying = false;
    }
  }
  
  getCurrentFrame(name) {
    const animation = this.animations.get(name);
    if (!animation || !animation.isPlaying) {
      return null;
    }
    
    const elapsed = this.currentTime - animation.startTime;
    const frameIndex = Math.floor((elapsed / animation.duration) * animation.frames.length);
    
    if (animation.loop) {
      return animation.frames[frameIndex % animation.frames.length];
    } else {
      if (frameIndex >= animation.frames.length) {
        animation.isPlaying = false;
        return animation.frames[animation.frames.length - 1];
      }
      return animation.frames[frameIndex];
    }
  }
  
  isAnimationPlaying(name) {
    const animation = this.animations.get(name);
    return animation ? animation.isPlaying : false;
  }
  
  update(deltaTime) {
    this.currentTime += deltaTime;
  }
  
  renderAnimation(ctx, name, x, y, width, height, flipX = false) {
    const frame = this.getCurrentFrame(name);
    if (!frame) return;
    
    ctx.save();
    
    if (flipX) {
      ctx.scale(-1, 1);
      ctx.translate(-x - width, y);
    } else {
      ctx.translate(x, y);
    }
    
    // Get sprite sheet image
    const animation = this.animations.get(name);
    const spriteSheetName = this.getSpriteSheetName(name);
    const spriteSheet = this.spriteSheets.get(spriteSheetName);
    
    if (spriteSheet && spriteSheet.image) {
      ctx.drawImage(
        spriteSheet.image,
        frame.x, frame.y, frame.width, frame.height,
        0, 0, width, height
      );
    }
    
    ctx.restore();
  }
  
  getSpriteSheetName(animationName) {
    // This would need to be tracked when creating animations
    // For now, return a default or implement a mapping
    return 'default';
  }
}
```

### Game Configuration System:
```javascript
const GameConfig = {
  // Canvas settings
  canvas: {
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    pixelRatio: window.devicePixelRatio || 1
  },
  
  // Game settings
  game: {
    targetFPS: 60,
    maxFPS: 120,
    enableVSync: true,
    debugMode: false,
    showFPS: false,
    showCollisionBoxes: false
  },
  
  // Physics settings
  physics: {
    gravity: 0.5,
    friction: 0.8,
    airResistance: 0.95,
    maxVelocity: 10
  },
  
  // Character settings
  characters: {
    defaultHealth: 100,
    defaultSpeed: 3,
    defaultJumpForce: 12,
    defaultWidth: 32,
    defaultHeight: 48
  },
  
  // Combat settings
  combat: {
    attackDamage: 20,
    specialDamage: 35,
    defenseMultiplier: 0.5,
    comboWindow: 500, // milliseconds
    hitStunDuration: 300
  },
  
  // AI settings
  ai: {
    decisionInterval: 100, // milliseconds
    personalityChangeInterval: 5000,
    learningRate: 0.1,
    maxMemorySize: 100
  },
  
  // Audio settings
  audio: {
    masterVolume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.8,
    enableAudio: true
  },
  
  // Performance settings
  performance: {
    enableFPSMonitoring: true,
    enableMemoryMonitoring: true,
    logPerformance: false,
    maxParticles: 100,
    maxAnimations: 50
  },
  
  // Mobile settings
  mobile: {
    enableTouchControls: true,
    virtualJoystickSize: 80,
    buttonSize: 60,
    enableHapticFeedback: true
  },
  
  // Debug settings
  debug: {
    showFPS: false,
    showCollisionBoxes: false,
    showPerformanceInfo: false,
    enableConsoleLogging: true,
    enableErrorReporting: true
  }
};

// Configuration manager
class ConfigManager {
  constructor() {
    this.config = GameConfig;
    this.loadUserSettings();
  }
  
  get(path) {
    return this.getNestedValue(this.config, path);
  }
  
  set(path, value) {
    this.setNestedValue(this.config, path, value);
    this.saveUserSettings();
  }
  
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }
  
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    
    target[lastKey] = value;
  }
  
  loadUserSettings() {
    try {
      const saved = localStorage.getItem('gameConfig');
      if (saved) {
        const userSettings = JSON.parse(saved);
        this.mergeConfig(this.config, userSettings);
      }
    } catch (error) {
      console.warn('Failed to load user settings:', error);
    }
  }
  
  saveUserSettings() {
    try {
      localStorage.setItem('gameConfig', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save user settings:', error);
    }
  }
  
  mergeConfig(target, source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) {
          target[key] = {};
        }
        this.mergeConfig(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  
  resetToDefaults() {
    this.config = JSON.parse(JSON.stringify(GameConfig));
    this.saveUserSettings();
  }
}
```

### Error Handling and Logging:
```javascript
class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
    this.levels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3
    };
    this.currentLevel = this.levels.INFO;
  }
  
  debug(message, data = null) {
    this.log('DEBUG', message, data);
  }
  
  info(message, data = null) {
    this.log('INFO', message, data);
  }
  
  warn(message, data = null) {
    this.log('WARN', message, data);
  }
  
  error(message, data = null) {
    this.log('ERROR', message, data);
  }
  
  log(level, message, data = null) {
    if (this.levels[level] >= this.currentLevel) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        data
      };
      
      this.logs.push(logEntry);
      
      // Keep only the last maxLogs entries
      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }
      
      // Console output
      const consoleMethod = level === 'ERROR' ? 'error' : 
                           level === 'WARN' ? 'warn' : 
                           level === 'INFO' ? 'info' : 'log';
      
      console[consoleMethod](`[${level}] ${message}`, data || '');
    }
  }
  
  getLogs(level = null, limit = 100) {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level);
    }
    
    return filteredLogs.slice(-limit);
  }
  
  clearLogs() {
    this.logs = [];
  }
  
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Global error handler
window.addEventListener('error', (event) => {
  Logger.error('Unhandled error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  Logger.error('Unhandled promise rejection', {
    reason: event.reason
  });
});
```

## Testing Checklist
- [ ] Collision detection works accurately
- [ ] Animation system plays animations correctly
- [ ] Game configuration loads and saves properly
- [ ] Utility functions work as expected
- [ ] Error handling catches and logs errors
- [ ] Performance impact is minimal
- [ ] Systems are extensible and modular
- [ ] Memory usage is reasonable

## Notes
- Focus on performance and accuracy for collision detection
- Make animation system flexible for different sprite sheets
- Ensure configuration system is user-friendly
- Implement comprehensive error handling
- Test on different devices and browsers 