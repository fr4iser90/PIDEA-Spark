# Core Game Engine Foundation – Phase 2: Game Loop Implementation

## Overview
Implement the core game loop with requestAnimationFrame, delta time calculation, and basic game state management for the Vibe Fighter game engine.

## Objectives
- [ ] Create main game loop with requestAnimationFrame
- [ ] Implement update() and render() methods
- [ ] Add delta time calculation for smooth movement
- [ ] Set up game state management
- [ ] Implement basic input handling system
- [ ] Add performance monitoring

## Deliverables
- File: `game.js` - Main game engine with game loop
- Feature: 60fps game loop with delta time
- Feature: Game state management system
- Feature: Basic input handling
- Feature: Performance monitoring

## Dependencies
- Requires: Phase 1 (Canvas Setup)
- Blocks: Phase 3 (Utility Systems)

## Estimated Time
4 hours

## Success Criteria
- [ ] Game loop runs at 60fps consistently
- [ ] Delta time calculation accurate
- [ ] Update and render methods functional
- [ ] Game state management working
- [ ] Basic input handling responsive
- [ ] Performance monitoring active
- [ ] No frame drops or stuttering

## Technical Implementation

### Game Loop Architecture:
```javascript
class GameEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.lastTime = 0;
    this.gameState = 'initializing';
    this.isRunning = false;
    this.fps = 0;
    this.frameCount = 0;
    this.deltaTime = 0;
    this.accumulator = 0;
    this.fixedTimeStep = 1000 / 60; // 60 FPS
  }
  
  init() {
    this.setupCanvas();
    this.setupEventListeners();
    this.gameState = 'ready';
    this.startGameLoop();
  }
  
  startGameLoop() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }
  
  gameLoop(currentTime) {
    if (!this.isRunning) return;
    
    // Calculate delta time
    this.deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // Cap delta time to prevent spiral of death
    if (this.deltaTime > 100) {
      this.deltaTime = 100;
    }
    
    // Update game logic
    this.update(this.deltaTime);
    
    // Render game
    this.render();
    
    // Update FPS counter
    this.frameCount++;
    if (currentTime % 1000 < this.deltaTime) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.logPerformance();
    }
    
    // Continue game loop
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  update(deltaTime) {
    // Update game state
    switch (this.gameState) {
      case 'menu':
        this.updateMenu(deltaTime);
        break;
      case 'playing':
        this.updateGame(deltaTime);
        break;
      case 'paused':
        this.updatePaused(deltaTime);
        break;
      case 'gameOver':
        this.updateGameOver(deltaTime);
        break;
    }
    
    // Update input system
    this.inputSystem.update(deltaTime);
    
    // Update performance monitor
    this.performanceMonitor.update(deltaTime);
  }
  
  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render based on game state
    switch (this.gameState) {
      case 'menu':
        this.renderMenu();
        break;
      case 'playing':
        this.renderGame();
        break;
      case 'paused':
        this.renderPaused();
        break;
      case 'gameOver':
        this.renderGameOver();
        break;
    }
    
    // Render UI overlay
    this.renderUI();
    
    // Render debug info if enabled
    if (this.debugMode) {
      this.renderDebugInfo();
    }
  }
  
  updateGame(deltaTime) {
    // Update all game objects
    this.gameObjects.forEach(obj => {
      if (obj.update) {
        obj.update(deltaTime);
      }
    });
    
    // Update collision system
    this.collisionSystem.update(deltaTime);
    
    // Update animation system
    this.animationSystem.update(deltaTime);
  }
  
  renderGame() {
    // Render background
    this.renderBackground();
    
    // Render all game objects
    this.gameObjects.forEach(obj => {
      if (obj.render) {
        obj.render(this.ctx);
      }
    });
  }
  
  renderUI() {
    // Render UI elements
    this.uiSystem.render(this.ctx);
  }
  
  renderDebugInfo() {
    const debugInfo = [
      `FPS: ${this.fps}`,
      `Delta Time: ${this.deltaTime.toFixed(2)}ms`,
      `Game Objects: ${this.gameObjects.length}`,
      `Game State: ${this.gameState}`,
      `Memory: ${this.performanceMonitor.getMemoryUsage()}MB`
    ];
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = '12px monospace';
    debugInfo.forEach((info, index) => {
      this.ctx.fillText(info, 10, 20 + (index * 15));
    });
  }
  
  logPerformance() {
    if (this.fps < 55) {
      console.warn(`Low FPS detected: ${this.fps}`);
    }
    
    if (this.debugMode) {
      console.log(`FPS: ${this.fps}, Delta: ${this.deltaTime.toFixed(2)}ms`);
    }
  }
  
  stop() {
    this.isRunning = false;
  }
  
  pause() {
    this.gameState = 'paused';
  }
  
  resume() {
    this.gameState = 'playing';
  }
}
```

### Input Handling System:
```javascript
class InputSystem {
  constructor() {
    this.keys = {};
    this.mouse = {
      x: 0,
      y: 0,
      pressed: false
    };
    this.touch = {
      x: 0,
      y: 0,
      pressed: false
    };
  }
  
  init() {
    this.setupKeyboardEvents();
    this.setupMouseEvents();
    this.setupTouchEvents();
  }
  
  setupKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      this.handleKeyDown(e);
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      this.handleKeyUp(e);
    });
  }
  
  setupMouseEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
    
    this.canvas.addEventListener('mousedown', (e) => {
      this.mouse.pressed = true;
      this.handleMouseDown(e);
    });
    
    this.canvas.addEventListener('mouseup', (e) => {
      this.mouse.pressed = false;
      this.handleMouseUp(e);
    });
  }
  
  setupTouchEvents() {
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.touch.x = touch.clientX - rect.left;
      this.touch.y = touch.clientY - rect.top;
      this.touch.pressed = true;
      this.handleTouchStart(e);
    });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.touch.x = touch.clientX - rect.left;
      this.touch.y = touch.clientY - rect.top;
      this.handleTouchMove(e);
    });
    
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.touch.pressed = false;
      this.handleTouchEnd(e);
    });
  }
  
  isKeyPressed(keyCode) {
    return this.keys[keyCode] || false;
  }
  
  isMousePressed() {
    return this.mouse.pressed;
  }
  
  isTouchPressed() {
    return this.touch.pressed;
  }
  
  getMousePosition() {
    return { x: this.mouse.x, y: this.mouse.y };
  }
  
  getTouchPosition() {
    return { x: this.touch.x, y: this.touch.y };
  }
  
  update(deltaTime) {
    // Update input state
    // Handle input buffering
    // Process input events
  }
  
  handleKeyDown(e) {
    // Handle specific key presses
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        this.triggerEvent('jump');
        break;
      case 'KeyA':
        this.triggerEvent('attack');
        break;
      case 'KeyS':
        this.triggerEvent('special');
        break;
      case 'KeyD':
        this.triggerEvent('defend');
        break;
      case 'Escape':
        this.triggerEvent('pause');
        break;
    }
  }
  
  handleKeyUp(e) {
    // Handle key releases
  }
  
  handleMouseDown(e) {
    // Handle mouse clicks
  }
  
  handleMouseUp(e) {
    // Handle mouse releases
  }
  
  handleTouchStart(e) {
    // Handle touch start
  }
  
  handleTouchMove(e) {
    // Handle touch move
  }
  
  handleTouchEnd(e) {
    // Handle touch end
  }
  
  triggerEvent(eventName, data = {}) {
    // Trigger custom events
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
  }
}
```

### Performance Monitor:
```javascript
class PerformanceMonitor {
  constructor() {
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = 0;
    this.fpsHistory = [];
    this.memoryUsage = 0;
    this.renderTime = 0;
    this.updateTime = 0;
  }
  
  update(deltaTime) {
    this.frameCount++;
    
    if (performance.now() - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.fpsHistory.push(this.fps);
      
      // Keep only last 10 FPS readings
      if (this.fpsHistory.length > 10) {
        this.fpsHistory.shift();
      }
      
      this.frameCount = 0;
      this.lastTime = performance.now();
      
      // Get memory usage if available
      if (performance.memory) {
        this.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
      }
    }
  }
  
  getAverageFPS() {
    if (this.fpsHistory.length === 0) return 0;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }
  
  getMemoryUsage() {
    return this.memoryUsage.toFixed(2);
  }
  
  isPerformanceGood() {
    return this.getAverageFPS() >= 55;
  }
  
  logPerformance() {
    console.log(`Performance: FPS=${this.fps}, Avg=${this.getAverageFPS().toFixed(1)}, Memory=${this.getMemoryUsage()}MB`);
  }
}
```

## Testing Checklist
- [ ] Game loop runs at 60fps on target devices
- [ ] Delta time calculation is accurate
- [ ] Input handling responds immediately
- [ ] Game state transitions work correctly
- [ ] Performance monitoring shows correct data
- [ ] No memory leaks detected
- [ ] Game loop stops and resumes properly
- [ ] Debug information displays correctly

## Notes
- Focus on smooth 60fps performance
- Implement proper delta time handling
- Ensure input responsiveness
- Add comprehensive performance monitoring
- Test on different devices and browsers 