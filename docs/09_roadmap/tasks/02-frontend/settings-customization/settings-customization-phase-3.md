# Settings & Customization – Phase 3: Integration & Customization

## Overview
Integrate the settings system with game systems, add audio settings controls, implement control customization, create visual customization options, and add settings export/import functionality for the Vibe Fighter game.

## Objectives
- [ ] Integrate with game systems
- [ ] Add audio settings controls
- [ ] Implement control customization
- [ ] Create visual customization options
- [ ] Add settings export/import functionality

## Deliverables
- File: `src/ui/settings/game-settings.js` - Game-specific settings
- File: `src/ui/settings/audio-settings.js` - Audio preferences
- File: `src/ui/settings/control-settings.js` - Control customization
- Feature: Game system integration
- Feature: Audio settings controls
- Feature: Control customization system
- Feature: Visual customization options
- Feature: Settings export/import

## Dependencies
- Requires: Phase 2 (Settings UI)
- Blocks: None

## Estimated Time
2 hours

## Success Criteria
- [ ] Game system integration functional
- [ ] Audio settings controls working
- [ ] Control customization system operational
- [ ] Visual customization options available
- [ ] Settings export/import functionality working
- [ ] All systems integrate with existing game engine
- [ ] Performance impact minimal

## Technical Implementation

### Game Settings Integration:
```javascript
class GameSettingsIntegration {
  constructor(settingsManager, gameEngine) {
    this.settingsManager = settingsManager;
    this.gameEngine = gameEngine;
    this.observers = new Set();
    
    this.setupObservers();
    this.applyCurrentSettings();
  }
  
  setupObservers() {
    // Observe settings changes and apply them to game systems
    this.settingsManager.addObserver((key, newValue, oldValue) => {
      this.handleSettingChange(key, newValue, oldValue);
    });
  }
  
  handleSettingChange(key, newValue, oldValue) {
    const [category, setting] = key.split('.');
    
    switch (category) {
      case 'game':
        this.handleGameSetting(setting, newValue, oldValue);
        break;
      case 'audio':
        this.handleAudioSetting(setting, newValue, oldValue);
        break;
      case 'controls':
        this.handleControlSetting(setting, newValue, oldValue);
        break;
      case 'graphics':
        this.handleGraphicsSetting(setting, newValue, oldValue);
        break;
      case 'ui':
        this.handleUISetting(setting, newValue, oldValue);
        break;
    }
    
    // Notify observers
    this.notifyObservers(key, newValue, oldValue);
  }
  
  handleGameSetting(setting, newValue, oldValue) {
    switch (setting) {
      case 'difficulty':
        this.gameEngine.setDifficulty(newValue);
        break;
      case 'language':
        this.gameEngine.setLanguage(newValue);
        break;
      case 'autoSave':
        this.gameEngine.setAutoSave(newValue);
        break;
    }
  }
  
  handleAudioSetting(setting, newValue, oldValue) {
    const audioManager = this.gameEngine.getAudioManager();
    if (!audioManager) return;
    
    switch (setting) {
      case 'masterVolume':
        audioManager.setMasterVolume(newValue);
        break;
      case 'musicVolume':
        audioManager.setMusicVolume(newValue);
        break;
      case 'sfxVolume':
        audioManager.setSFXVolume(newValue);
        break;
      case 'voiceVolume':
        audioManager.setVoiceVolume(newValue);
        break;
    }
  }
  
  handleControlSetting(setting, newValue, oldValue) {
    const inputManager = this.gameEngine.getInputManager();
    if (!inputManager) return;
    
    switch (setting) {
      case 'keyboardLayout':
        inputManager.setKeyboardLayout(newValue);
        break;
      case 'mouseSensitivity':
        inputManager.setMouseSensitivity(newValue);
        break;
      case 'invertY':
        inputManager.setInvertY(newValue);
        break;
    }
  }
  
  handleGraphicsSetting(setting, newValue, oldValue) {
    const graphicsManager = this.gameEngine.getGraphicsManager();
    if (!graphicsManager) return;
    
    switch (setting) {
      case 'quality':
        graphicsManager.setQuality(newValue);
        break;
      case 'resolution':
        graphicsManager.setResolution(newValue);
        break;
      case 'fullscreen':
        graphicsManager.setFullscreen(newValue);
        break;
      case 'vsync':
        graphicsManager.setVSync(newValue);
        break;
    }
  }
  
  handleUISetting(setting, newValue, oldValue) {
    const uiManager = this.gameEngine.getUIManager();
    if (!uiManager) return;
    
    switch (setting) {
      case 'scale':
        uiManager.setScale(newValue);
        break;
      case 'showFPS':
        uiManager.setShowFPS(newValue);
        break;
      case 'showDamage':
        uiManager.setShowDamage(newValue);
        break;
    }
  }
  
  applyCurrentSettings() {
    // Apply all current settings to game systems
    const allSettings = this.settingsManager.getAllSettings();
    
    Object.entries(allSettings).forEach(([key, setting]) => {
      this.handleSettingChange(key, setting.value, null);
    });
  }
  
  addObserver(observer) {
    this.observers.add(observer);
  }
  
  removeObserver(observer) {
    this.observers.delete(observer);
  }
  
  notifyObservers(key, newValue, oldValue) {
    this.observers.forEach(observer => {
      if (typeof observer === 'function') {
        observer(key, newValue, oldValue);
      } else if (observer.onSettingApplied) {
        observer.onSettingApplied(key, newValue, oldValue);
      }
    });
  }
}
```

### Audio Settings System:
```javascript
class AudioSettings {
  constructor(settingsManager, audioManager) {
    this.settingsManager = settingsManager;
    this.audioManager = audioManager;
    this.audioContext = null;
    this.audioNodes = new Map();
    
    this.initializeAudioContext();
    this.setupAudioNodes();
  }
  
  initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }
  
  setupAudioNodes() {
    if (!this.audioContext) return;
    
    // Create gain nodes for different audio types
    this.audioNodes.set('master', this.audioContext.createGain());
    this.audioNodes.set('music', this.audioContext.createGain());
    this.audioNodes.set('sfx', this.audioContext.createGain());
    this.audioNodes.set('voice', this.audioContext.createGain());
    
    // Connect nodes
    const masterGain = this.audioNodes.get('master');
    const musicGain = this.audioNodes.get('music');
    const sfxGain = this.audioNodes.get('sfx');
    const voiceGain = this.audioNodes.get('voice');
    
    musicGain.connect(masterGain);
    sfxGain.connect(masterGain);
    voiceGain.connect(masterGain);
    masterGain.connect(this.audioContext.destination);
    
    // Set initial volumes
    this.updateVolumes();
  }
  
  updateVolumes() {
    const masterVolume = this.settingsManager.get('audio.masterVolume', 0.8);
    const musicVolume = this.settingsManager.get('audio.musicVolume', 0.7);
    const sfxVolume = this.settingsManager.get('audio.sfxVolume', 0.9);
    const voiceVolume = this.settingsManager.get('audio.voiceVolume', 0.8);
    
    if (this.audioNodes.has('master')) {
      this.audioNodes.get('master').gain.value = masterVolume;
    }
    if (this.audioNodes.has('music')) {
      this.audioNodes.get('music').gain.value = musicVolume;
    }
    if (this.audioNodes.has('sfx')) {
      this.audioNodes.get('sfx').gain.value = sfxVolume;
    }
    if (this.audioNodes.has('voice')) {
      this.audioNodes.get('voice').gain.value = voiceVolume;
    }
  }
  
  setMasterVolume(volume) {
    this.settingsManager.set('audio.masterVolume', volume);
    this.updateVolumes();
  }
  
  setMusicVolume(volume) {
    this.settingsManager.set('audio.musicVolume', volume);
    this.updateVolumes();
  }
  
  setSFXVolume(volume) {
    this.settingsManager.set('audio.sfxVolume', volume);
    this.updateVolumes();
  }
  
  setVoiceVolume(volume) {
    this.settingsManager.set('audio.voiceVolume', volume);
    this.updateVolumes();
  }
  
  playSound(type, soundId, options = {}) {
    if (!this.audioContext) return;
    
    const gainNode = this.audioNodes.get(type);
    if (!gainNode) return;
    
    // Create audio source
    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioManager.getSoundBuffer(soundId);
    source.connect(gainNode);
    
    // Apply options
    if (options.volume !== undefined) {
      const volumeGain = this.audioContext.createGain();
      volumeGain.gain.value = options.volume;
      source.disconnect();
      source.connect(volumeGain);
      volumeGain.connect(gainNode);
    }
    
    if (options.loop) {
      source.loop = true;
    }
    
    source.start(options.startTime || 0);
    
    return source;
  }
  
  stopSound(source) {
    if (source && source.stop) {
      source.stop();
    }
  }
  
  pauseAll() {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
  }
  
  resumeAll() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
  
  getAudioContext() {
    return this.audioContext;
  }
  
  getAudioNodes() {
    return this.audioNodes;
  }
}
```

### Control Customization System:
```javascript
class ControlCustomization {
  constructor(settingsManager, inputManager) {
    this.settingsManager = settingsManager;
    this.inputManager = inputManager;
    this.keyBindings = new Map();
    this.customBindings = new Map();
    
    this.loadKeyBindings();
    this.setupCustomization();
  }
  
  loadKeyBindings() {
    // Default key bindings
    this.keyBindings.set('move-left', 'ArrowLeft');
    this.keyBindings.set('move-right', 'ArrowRight');
    this.keyBindings.set('jump', 'Space');
    this.keyBindings.set('attack', 'KeyA');
    this.keyBindings.set('block', 'KeyS');
    this.keyBindings.set('skill-1', 'KeyQ');
    this.keyBindings.set('skill-2', 'KeyW');
    this.keyBindings.set('skill-3', 'KeyE');
    this.keyBindings.set('skill-4', 'KeyR');
    this.keyBindings.set('pause', 'Escape');
    this.keyBindings.set('inventory', 'KeyI');
    this.keyBindings.set('map', 'KeyM');
    
    // Load custom bindings from settings
    const customBindings = this.settingsManager.get('controls.customBindings', {});
    Object.entries(customBindings).forEach(([action, key]) => {
      this.customBindings.set(action, key);
    });
  }
  
  setupCustomization() {
    // Set up input handlers with current bindings
    this.updateInputHandlers();
    
    // Observe settings changes
    this.settingsManager.addObserver((key, newValue, oldValue) => {
      if (key === 'controls.customBindings') {
        this.loadKeyBindings();
        this.updateInputHandlers();
      }
    });
  }
  
  updateInputHandlers() {
    // Clear existing handlers
    this.inputManager.clearHandlers();
    
    // Set up handlers for each action
    this.keyBindings.forEach((defaultKey, action) => {
      const customKey = this.customBindings.get(action) || defaultKey;
      this.inputManager.onKeyDown(customKey, () => {
        this.handleAction(action);
      });
    });
  }
  
  handleAction(action) {
    // Handle different actions
    switch (action) {
      case 'move-left':
        this.inputManager.triggerAction('move', { direction: 'left' });
        break;
      case 'move-right':
        this.inputManager.triggerAction('move', { direction: 'right' });
        break;
      case 'jump':
        this.inputManager.triggerAction('jump');
        break;
      case 'attack':
        this.inputManager.triggerAction('attack');
        break;
      case 'block':
        this.inputManager.triggerAction('block');
        break;
      case 'skill-1':
      case 'skill-2':
      case 'skill-3':
      case 'skill-4':
        const skillIndex = parseInt(action.split('-')[1]) - 1;
        this.inputManager.triggerAction('skill', { index: skillIndex });
        break;
      case 'pause':
        this.inputManager.triggerAction('pause');
        break;
      case 'inventory':
        this.inputManager.triggerAction('inventory');
        break;
      case 'map':
        this.inputManager.triggerAction('map');
        break;
    }
  }
  
  setKeyBinding(action, key) {
    this.customBindings.set(action, key);
    this.saveCustomBindings();
    this.updateInputHandlers();
  }
  
  resetKeyBinding(action) {
    this.customBindings.delete(action);
    this.saveCustomBindings();
    this.updateInputHandlers();
  }
  
  resetAllKeyBindings() {
    this.customBindings.clear();
    this.saveCustomBindings();
    this.updateInputHandlers();
  }
  
  saveCustomBindings() {
    const customBindings = Object.fromEntries(this.customBindings);
    this.settingsManager.set('controls.customBindings', customBindings);
  }
  
  getKeyBinding(action) {
    return this.customBindings.get(action) || this.keyBindings.get(action);
  }
  
  getAllKeyBindings() {
    const bindings = {};
    this.keyBindings.forEach((defaultKey, action) => {
      bindings[action] = {
        default: defaultKey,
        current: this.getKeyBinding(action),
        isCustom: this.customBindings.has(action)
      };
    });
    return bindings;
  }
  
  isKeyConflicting(key) {
    const currentBindings = Array.from(this.customBindings.values());
    return currentBindings.includes(key);
  }
  
  getConflictingAction(key) {
    for (const [action, binding] of this.customBindings) {
      if (binding === key) {
        return action;
      }
    }
    return null;
  }
  
  validateKeyBinding(action, key) {
    // Check if key is valid
    if (!key || key.length === 0) {
      return { valid: false, message: 'Invalid key' };
    }
    
    // Check for conflicts
    const conflictingAction = this.getConflictingAction(key);
    if (conflictingAction && conflictingAction !== action) {
      return { 
        valid: false, 
        message: `Key already bound to ${conflictingAction}` 
      };
    }
    
    return { valid: true };
  }
}
```

### Visual Customization System:
```javascript
class VisualCustomization {
  constructor(settingsManager, gameEngine) {
    this.settingsManager = settingsManager;
    this.gameEngine = gameEngine;
    this.customizationData = new Map();
    
    this.loadCustomizationData();
    this.setupCustomization();
  }
  
  loadCustomizationData() {
    // Load visual customization data from settings
    const data = this.settingsManager.get('ui.customization', {});
    
    this.customizationData.set('characterColors', data.characterColors || {});
    this.customizationData.set('uiTheme', data.uiTheme || 'default');
    this.customizationData.set('particleEffects', data.particleEffects || 'normal');
    this.customizationData.set('screenShake', data.screenShake || true);
    this.customizationData.set('bloomEffect', data.bloomEffect || false);
    this.customizationData.set('motionBlur', data.motionBlur || false);
  }
  
  setupCustomization() {
    // Apply current customization
    this.applyCustomization();
    
    // Observe settings changes
    this.settingsManager.addObserver((key, newValue, oldValue) => {
      if (key.startsWith('ui.customization')) {
        this.loadCustomizationData();
        this.applyCustomization();
      }
    });
  }
  
  applyCustomization() {
    // Apply character colors
    this.applyCharacterColors();
    
    // Apply UI theme
    this.applyUITheme();
    
    // Apply visual effects
    this.applyVisualEffects();
  }
  
  applyCharacterColors() {
    const characterColors = this.customizationData.get('characterColors');
    const characterManager = this.gameEngine.getCharacterManager();
    
    if (characterManager) {
      Object.entries(characterColors).forEach(([characterId, colors]) => {
        characterManager.setCharacterColors(characterId, colors);
      });
    }
  }
  
  applyUITheme() {
    const theme = this.customizationData.get('uiTheme');
    const uiManager = this.gameEngine.getUIManager();
    
    if (uiManager) {
      uiManager.setTheme(theme);
    }
  }
  
  applyVisualEffects() {
    const particleEffects = this.customizationData.get('particleEffects');
    const screenShake = this.customizationData.get('screenShake');
    const bloomEffect = this.customizationData.get('bloomEffect');
    const motionBlur = this.customizationData.get('motionBlur');
    
    const effectsManager = this.gameEngine.getEffectsManager();
    if (effectsManager) {
      effectsManager.setParticleLevel(particleEffects);
      effectsManager.setScreenShake(screenShake);
      effectsManager.setBloomEffect(bloomEffect);
      effectsManager.setMotionBlur(motionBlur);
    }
  }
  
  setCharacterColor(characterId, colorType, color) {
    const characterColors = this.customizationData.get('characterColors');
    if (!characterColors[characterId]) {
      characterColors[characterId] = {};
    }
    characterColors[characterId][colorType] = color;
    
    this.saveCustomization();
    this.applyCharacterColors();
  }
  
  setUITheme(theme) {
    this.customizationData.set('uiTheme', theme);
    this.saveCustomization();
    this.applyUITheme();
  }
  
  setParticleEffects(level) {
    this.customizationData.set('particleEffects', level);
    this.saveCustomization();
    this.applyVisualEffects();
  }
  
  setScreenShake(enabled) {
    this.customizationData.set('screenShake', enabled);
    this.saveCustomization();
    this.applyVisualEffects();
  }
  
  setBloomEffect(enabled) {
    this.customizationData.set('bloomEffect', enabled);
    this.saveCustomization();
    this.applyVisualEffects();
  }
  
  setMotionBlur(enabled) {
    this.customizationData.set('motionBlur', enabled);
    this.saveCustomization();
    this.applyVisualEffects();
  }
  
  saveCustomization() {
    const customization = {
      characterColors: this.customizationData.get('characterColors'),
      uiTheme: this.customizationData.get('uiTheme'),
      particleEffects: this.customizationData.get('particleEffects'),
      screenShake: this.customizationData.get('screenShake'),
      bloomEffect: this.customizationData.get('bloomEffect'),
      motionBlur: this.customizationData.get('motionBlur')
    };
    
    this.settingsManager.set('ui.customization', customization);
  }
  
  getCustomizationData() {
    return Object.fromEntries(this.customizationData);
  }
  
  resetCustomization() {
    this.customizationData.clear();
    this.loadCustomizationData();
    this.saveCustomization();
    this.applyCustomization();
  }
}
```

### Settings Export/Import System:
```javascript
class SettingsExportImport {
  constructor(settingsManager) {
    this.settingsManager = settingsManager;
  }
  
  exportSettings() {
    const exportData = {
      version: '1.0',
      timestamp: Date.now(),
      settings: this.settingsManager.getAllSettings(),
      customization: this.settingsManager.get('ui.customization', {}),
      keyBindings: this.settingsManager.get('controls.customBindings', {})
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  importSettings(jsonData) {
    try {
      const importData = JSON.parse(jsonData);
      
      if (importData.version !== '1.0') {
        throw new Error('Unsupported settings version');
      }
      
      // Import settings
      if (importData.settings) {
        Object.entries(importData.settings).forEach(([key, setting]) => {
          this.settingsManager.set(key, setting.value);
        });
      }
      
      // Import customization
      if (importData.customization) {
        this.settingsManager.set('ui.customization', importData.customization);
      }
      
      // Import key bindings
      if (importData.keyBindings) {
        this.settingsManager.set('controls.customBindings', importData.keyBindings);
      }
      
      return { success: true, message: 'Settings imported successfully' };
    } catch (error) {
      console.error('Failed to import settings:', error);
      return { success: false, message: error.message };
    }
  }
  
  exportToFile() {
    const data = this.exportSettings();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibe-fighter-settings-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const result = this.importSettings(event.target.result);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }
  
  validateImportData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.version) {
        return { valid: false, message: 'Missing version information' };
      }
      
      if (data.version !== '1.0') {
        return { valid: false, message: 'Unsupported version' };
      }
      
      if (!data.settings) {
        return { valid: false, message: 'Missing settings data' };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, message: 'Invalid JSON format' };
    }
  }
}
```

## Testing Strategy

### Unit Tests:
- [ ] Test game settings integration
- [ ] Test audio settings functionality
- [ ] Test control customization
- [ ] Test visual customization
- [ ] Test settings export/import

### Integration Tests:
- [ ] Test integration with game engine
- [ ] Test audio system integration
- [ ] Test input system integration
- [ ] Test UI system integration
- [ ] Test settings persistence

### Manual Testing:
- [ ] Verify game settings apply correctly
- [ ] Test audio controls and volume
- [ ] Check control customization
- [ ] Test visual customization options
- [ ] Validate settings export/import

## Success Metrics
- **Performance**: Settings application < 100ms
- **Memory**: Customization system < 2MB
- **Integration**: Seamless with all game systems
- **Usability**: Intuitive customization options
- **Reliability**: 100% settings persistence 