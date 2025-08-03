# Visual Effects System – Phase 1: Particle System

## Overview
Create a comprehensive particle system engine with particle physics, movement, spawning, management, rendering optimization, and particle effect presets for the Vibe Fighter game.

## Objectives
- [ ] Create particle system engine
- [ ] Implement particle physics and movement
- [ ] Add particle spawning and management
- [ ] Create particle rendering optimization
- [ ] Add particle effect presets

## Deliverables
- File: `src/effects/particle-system.js` - Core particle system engine
- File: `src/effects/particle-physics.js` - Particle physics and movement
- File: `src/effects/particle-manager.js` - Particle spawning and management
- Feature: Particle system engine
- Feature: Particle physics simulation
- Feature: Particle spawning and lifecycle management
- Feature: Particle rendering optimization
- Feature: Particle effect presets

## Dependencies
- Requires: Task 6 (Assets & Sprites System)
- Blocks: Phase 2 (Screen Effects)

## Estimated Time
3 hours

## Success Criteria
- [ ] Particle system engine functional
- [ ] Particle physics simulation working
- [ ] Particle spawning and management operational
- [ ] Particle rendering optimized for performance
- [ ] Particle effect presets available
- [ ] All systems integrate with existing game engine
- [ ] Performance impact minimal

## Technical Implementation

### Particle System Engine:
```javascript
class ParticleSystem {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.particles = [];
    this.emitters = new Map();
    this.particlePool = [];
    this.maxParticles = 1000;
    this.activeParticles = 0;
    
    this.gravity = { x: 0, y: 0.5 };
    this.wind = { x: 0, y: 0 };
    this.bounds = {
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height
    };
    
    this.lastTime = 0;
    this.deltaTime = 0;
  }
  
  update(currentTime) {
    this.deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // Update all emitters
    this.emitters.forEach(emitter => {
      emitter.update(this.deltaTime);
    });
    
    // Update all particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.update(this.deltaTime);
      
      // Remove dead particles
      if (particle.isDead()) {
        this.removeParticle(i);
      }
    }
  }
  
  render() {
    // Sort particles by depth for proper rendering
    this.particles.sort((a, b) => a.depth - b.depth);
    
    // Render all particles
    this.particles.forEach(particle => {
      particle.render(this.ctx);
    });
  }
  
  createEmitter(config) {
    const emitter = new ParticleEmitter(config);
    this.emitters.set(emitter.id, emitter);
    return emitter;
  }
  
  removeEmitter(emitterId) {
    this.emitters.delete(emitterId);
  }
  
  spawnParticle(config) {
    if (this.activeParticles >= this.maxParticles) {
      return null;
    }
    
    const particle = this.getParticleFromPool() || new Particle(config);
    particle.reset(config);
    
    this.particles.push(particle);
    this.activeParticles++;
    
    return particle;
  }
  
  removeParticle(index) {
    const particle = this.particles[index];
    this.particles.splice(index, 1);
    this.activeParticles--;
    
    // Return to pool
    this.returnParticleToPool(particle);
  }
  
  getParticleFromPool() {
    return this.particlePool.pop() || null;
  }
  
  returnParticleToPool(particle) {
    if (this.particlePool.length < 100) {
      particle.reset();
      this.particlePool.push(particle);
    }
  }
  
  setGravity(x, y) {
    this.gravity = { x, y };
  }
  
  setWind(x, y) {
    this.wind = { x, y };
  }
  
  setBounds(x, y, width, height) {
    this.bounds = { x, y, width, height };
  }
  
  clear() {
    this.particles = [];
    this.emitters.clear();
    this.activeParticles = 0;
  }
  
  getParticleCount() {
    return this.activeParticles;
  }
  
  getEmitterCount() {
    return this.emitters.size;
  }
}
```

### Particle Physics System:
```javascript
class ParticlePhysics {
  constructor() {
    this.forces = new Map();
    this.colliders = new Map();
  }
  
  addForce(particleId, force) {
    if (!this.forces.has(particleId)) {
      this.forces.set(particleId, []);
    }
    this.forces.get(particleId).push(force);
  }
  
  removeForce(particleId, forceId) {
    const particleForces = this.forces.get(particleId);
    if (particleForces) {
      const index = particleForces.findIndex(f => f.id === forceId);
      if (index !== -1) {
        particleForces.splice(index, 1);
      }
    }
  }
  
  addCollider(particleId, collider) {
    this.colliders.set(particleId, collider);
  }
  
  removeCollider(particleId) {
    this.colliders.delete(particleId);
  }
  
  updateParticle(particle, deltaTime) {
    // Apply forces
    const forces = this.forces.get(particle.id) || [];
    forces.forEach(force => {
      this.applyForce(particle, force, deltaTime);
    });
    
    // Apply physics
    this.applyPhysics(particle, deltaTime);
    
    // Check collisions
    this.checkCollisions(particle);
  }
  
  applyForce(particle, force, deltaTime) {
    switch (force.type) {
      case 'gravity':
        particle.velocity.y += force.strength * deltaTime;
        break;
      case 'wind':
        particle.velocity.x += force.strength * deltaTime;
        break;
      case 'attraction':
        const dx = force.target.x - particle.position.x;
        const dy = force.target.y - particle.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
          particle.velocity.x += (dx / distance) * force.strength * deltaTime;
          particle.velocity.y += (dy / distance) * force.strength * deltaTime;
        }
        break;
      case 'repulsion':
        const rdx = particle.position.x - force.target.x;
        const rdy = particle.position.y - force.target.y;
        const rDistance = Math.sqrt(rdx * rdx + rdy * rdy);
        if (rDistance > 0) {
          particle.velocity.x += (rdx / rDistance) * force.strength * deltaTime;
          particle.velocity.y += (rdy / rDistance) * force.strength * deltaTime;
        }
        break;
    }
  }
  
  applyPhysics(particle, deltaTime) {
    // Apply velocity
    particle.position.x += particle.velocity.x * deltaTime;
    particle.position.y += particle.velocity.y * deltaTime;
    
    // Apply acceleration
    particle.velocity.x += particle.acceleration.x * deltaTime;
    particle.velocity.y += particle.acceleration.y * deltaTime;
    
    // Apply friction
    particle.velocity.x *= particle.friction;
    particle.velocity.y *= particle.friction;
    
    // Apply rotation
    particle.rotation += particle.angularVelocity * deltaTime;
    
    // Apply scale change
    particle.scale += particle.scaleVelocity * deltaTime;
    
    // Apply alpha change
    particle.alpha += particle.alphaVelocity * deltaTime;
  }
  
  checkCollisions(particle) {
    const collider = this.colliders.get(particle.id);
    if (!collider) return;
    
    switch (collider.type) {
      case 'bounds':
        this.checkBoundsCollision(particle, collider);
        break;
      case 'circle':
        this.checkCircleCollision(particle, collider);
        break;
      case 'rectangle':
        this.checkRectangleCollision(particle, collider);
        break;
    }
  }
  
  checkBoundsCollision(particle, bounds) {
    if (particle.position.x < bounds.x) {
      particle.position.x = bounds.x;
      particle.velocity.x *= -bounds.bounce;
    } else if (particle.position.x > bounds.x + bounds.width) {
      particle.position.x = bounds.x + bounds.width;
      particle.velocity.x *= -bounds.bounce;
    }
    
    if (particle.position.y < bounds.y) {
      particle.position.y = bounds.y;
      particle.velocity.y *= -bounds.bounce;
    } else if (particle.position.y > bounds.y + bounds.height) {
      particle.position.y = bounds.y + bounds.height;
      particle.velocity.y *= -bounds.bounce;
    }
  }
  
  checkCircleCollision(particle, circle) {
    const dx = particle.position.x - circle.x;
    const dy = particle.position.y - circle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < circle.radius) {
      // Push particle out of circle
      const pushDistance = circle.radius - distance;
      const pushX = (dx / distance) * pushDistance;
      const pushY = (dy / distance) * pushDistance;
      
      particle.position.x += pushX;
      particle.position.y += pushY;
      
      // Reflect velocity
      const normalX = dx / distance;
      const normalY = dy / distance;
      const dotProduct = particle.velocity.x * normalX + particle.velocity.y * normalY;
      
      particle.velocity.x -= 2 * dotProduct * normalX;
      particle.velocity.y -= 2 * dotProduct * normalY;
      
      particle.velocity.x *= circle.bounce;
      particle.velocity.y *= circle.bounce;
    }
  }
  
  checkRectangleCollision(particle, rect) {
    const closestX = Math.max(rect.x, Math.min(particle.position.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(particle.position.y, rect.y + rect.height));
    
    const distanceX = particle.position.x - closestX;
    const distanceY = particle.position.y - closestY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    if (distance < particle.radius) {
      // Push particle out of rectangle
      const pushDistance = particle.radius - distance;
      const pushX = (distanceX / distance) * pushDistance;
      const pushY = (distanceY / distance) * pushDistance;
      
      particle.position.x += pushX;
      particle.position.y += pushY;
      
      // Reflect velocity
      const normalX = distanceX / distance;
      const normalY = distanceY / distance;
      const dotProduct = particle.velocity.x * normalX + particle.velocity.y * normalY;
      
      particle.velocity.x -= 2 * dotProduct * normalX;
      particle.velocity.y -= 2 * dotProduct * normalY;
      
      particle.velocity.x *= rect.bounce;
      particle.velocity.y *= rect.bounce;
    }
  }
}
```

### Particle Manager:
```javascript
class ParticleManager {
  constructor(particleSystem) {
    this.particleSystem = particleSystem;
    this.presets = new Map();
    this.activeEffects = new Map();
    
    this.loadPresets();
  }
  
  loadPresets() {
    // Fire effect preset
    this.presets.set('fire', {
      particleCount: 50,
      spawnRate: 100,
      particleConfig: {
        texture: 'fire-particle',
        size: { min: 10, max: 20 },
        velocity: { x: { min: -20, max: 20 }, y: { min: -50, max: -30 } },
        acceleration: { x: 0, y: -10 },
        friction: 0.98,
        life: { min: 1000, max: 2000 },
        color: { r: 255, g: 100, b: 0, a: 1 },
        alphaVelocity: -0.5,
        scaleVelocity: -0.1
      }
    });
    
    // Explosion effect preset
    this.presets.set('explosion', {
      particleCount: 100,
      spawnRate: 0, // Instant spawn
      particleConfig: {
        texture: 'spark-particle',
        size: { min: 5, max: 15 },
        velocity: { x: { min: -100, max: 100 }, y: { min: -100, max: 100 } },
        acceleration: { x: 0, y: 20 },
        friction: 0.95,
        life: { min: 500, max: 1500 },
        color: { r: 255, g: 255, b: 0, a: 1 },
        alphaVelocity: -1.0,
        scaleVelocity: -0.2
      }
    });
    
    // Magic effect preset
    this.presets.set('magic', {
      particleCount: 30,
      spawnRate: 200,
      particleConfig: {
        texture: 'magic-particle',
        size: { min: 8, max: 16 },
        velocity: { x: { min: -30, max: 30 }, y: { min: -40, max: -20 } },
        acceleration: { x: 0, y: -5 },
        friction: 0.99,
        life: { min: 1500, max: 2500 },
        color: { r: 100, g: 100, b: 255, a: 1 },
        alphaVelocity: -0.3,
        scaleVelocity: 0.05
      }
    });
    
    // Smoke effect preset
    this.presets.set('smoke', {
      particleCount: 20,
      spawnRate: 150,
      particleConfig: {
        texture: 'smoke-particle',
        size: { min: 15, max: 25 },
        velocity: { x: { min: -10, max: 10 }, y: { min: -20, max: -10 } },
        acceleration: { x: 0, y: -2 },
        friction: 0.99,
        life: { min: 2000, max: 3000 },
        color: { r: 100, g: 100, b: 100, a: 0.8 },
        alphaVelocity: -0.2,
        scaleVelocity: 0.1
      }
    });
  }
  
  createEffect(presetName, position, options = {}) {
    const preset = this.presets.get(presetName);
    if (!preset) {
      console.warn(`Particle preset not found: ${presetName}`);
      return null;
    }
    
    const effectId = `effect_${Date.now()}_${Math.random()}`;
    const effect = {
      id: effectId,
      preset: presetName,
      position: { ...position },
      options: { ...preset, ...options },
      emitter: null,
      isActive: true,
      startTime: Date.now()
    };
    
    // Create emitter
    effect.emitter = this.particleSystem.createEmitter({
      id: effectId,
      position: position,
      particleCount: effect.options.particleCount,
      spawnRate: effect.options.spawnRate,
      particleConfig: effect.options.particleConfig,
      duration: effect.options.duration || -1, // -1 = infinite
      onComplete: () => this.removeEffect(effectId)
    });
    
    this.activeEffects.set(effectId, effect);
    return effectId;
  }
  
  removeEffect(effectId) {
    const effect = this.activeEffects.get(effectId);
    if (effect) {
      if (effect.emitter) {
        this.particleSystem.removeEmitter(effectId);
      }
      this.activeEffects.delete(effectId);
    }
  }
  
  updateEffect(effectId, position) {
    const effect = this.activeEffects.get(effectId);
    if (effect && effect.emitter) {
      effect.position = { ...position };
      effect.emitter.setPosition(position);
    }
  }
  
  stopEffect(effectId) {
    const effect = this.activeEffects.get(effectId);
    if (effect) {
      effect.isActive = false;
      if (effect.emitter) {
        effect.emitter.stop();
      }
    }
  }
  
  resumeEffect(effectId) {
    const effect = this.activeEffects.get(effectId);
    if (effect) {
      effect.isActive = true;
      if (effect.emitter) {
        effect.emitter.resume();
      }
    }
  }
  
  getActiveEffects() {
    return Array.from(this.activeEffects.values());
  }
  
  clearAllEffects() {
    this.activeEffects.forEach((effect, effectId) => {
      this.removeEffect(effectId);
    });
  }
  
  addPreset(name, config) {
    this.presets.set(name, config);
  }
  
  removePreset(name) {
    this.presets.delete(name);
  }
  
  getPreset(name) {
    return this.presets.get(name);
  }
  
  getAllPresets() {
    return Array.from(this.presets.keys());
  }
}
```

## Testing Strategy

### Unit Tests:
- [ ] Test particle system engine
- [ ] Test particle physics simulation
- [ ] Test particle spawning and management
- [ ] Test particle rendering optimization
- [ ] Test particle effect presets

### Integration Tests:
- [ ] Test particle system integration with game engine
- [ ] Test particle physics integration
- [ ] Test particle manager integration
- [ ] Test performance under load

### Manual Testing:
- [ ] Verify particle effects render correctly
- [ ] Test particle physics behavior
- [ ] Check particle spawning and lifecycle
- [ ] Validate particle effect presets
- [ ] Test performance with multiple effects

## Success Metrics
- **Performance**: Particle rendering < 16ms
- **Memory**: Particle system < 50MB
- **Throughput**: Support 1000+ particles
- **Frame Rate**: Maintain 60 FPS
- **Quality**: Smooth and engaging effects 