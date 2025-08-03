# Settings & Customization – Phase 1: Settings Foundation

## Overview
Create the core settings management system with data structures, persistence using Local Storage, validation system, and default settings configuration for the Vibe Fighter game.

## Objectives
- [ ] Create settings manager system
- [ ] Implement settings data structure
- [ ] Set up settings persistence with Local Storage
- [ ] Create settings validation system
- [ ] Add default settings configuration

## Deliverables
- File: `src/ui/settings/settings-manager.js` - Core settings management system
- File: `src/ui/settings/settings-storage.js` - Settings persistence
- Feature: Settings data structure and validation
- Feature: Local Storage persistence
- Feature: Default settings configuration
- Feature: Settings validation system

## Dependencies
- Requires: Task 4 (UI System & Controls)
- Blocks: Phase 2 (Settings UI)

## Estimated Time
2 hours

## Success Criteria
- [ ] Settings manager system functional
- [ ] Settings data structure properly defined
- [ ] Local Storage persistence working
- [ ] Settings validation system operational
- [ ] Default settings configuration complete
- [ ] All systems integrate with existing game engine
- [ ] Performance impact minimal

## Technical Implementation

### Settings Manager System:
```javascript
class SettingsManager {
  constructor() {
    this.settings = new Map();
    this.defaults = new Map();
    this.validators = new Map();
    this.storage = new SettingsStorage();
    this.observers = new Set();
    
    this.categories = {
      game: 'Game Settings',
      audio: 'Audio Settings',
      controls: 'Control Settings',
      graphics: 'Graphics Settings',
      ui: 'UI Settings'
    };
    
    this.initializeDefaults();
    this.loadSettings();
  }
  
  initializeDefaults() {
    // Game Settings
    this.setDefault('game.difficulty', 'normal', {
      type: 'select',
      options: ['easy', 'normal', 'hard', 'expert'],
      category: 'game',
      label: 'Difficulty Level',
      description: 'Set the game difficulty level'
    });
    
    this.setDefault('game.language', 'en', {
      type: 'select',
      options: ['en', 'es', 'fr', 'de', 'ja'],
      category: 'game',
      label: 'Language',
      description: 'Select your preferred language'
    });
    
    this.setDefault('game.autoSave', true, {
      type: 'boolean',
      category: 'game',
      label: 'Auto Save',
      description: 'Automatically save game progress'
    });
    
    // Audio Settings
    this.setDefault('audio.masterVolume', 0.8, {
      type: 'range',
      min: 0,
      max: 1,
      step: 0.1,
      category: 'audio',
      label: 'Master Volume',
      description: 'Overall game volume'
    });
    
    this.setDefault('audio.musicVolume', 0.7, {
      type: 'range',
      min: 0,
      max: 1,
      step: 0.1,
      category: 'audio',
      label: 'Music Volume',
      description: 'Background music volume'
    });
    
    this.setDefault('audio.sfxVolume', 0.9, {
      type: 'range',
      min: 0,
      max: 1,
      step: 0.1,
      category: 'audio',
      label: 'Sound Effects Volume',
      description: 'Sound effects volume'
    });
    
    this.setDefault('audio.voiceVolume', 0.8, {
      type: 'range',
      min: 0,
      max: 1,
      step: 0.1,
      category: 'audio',
      label: 'Voice Volume',
      description: 'Character voice volume'
    });
    
    // Control Settings
    this.setDefault('controls.keyboardLayout', 'qwerty', {
      type: 'select',
      options: ['qwerty', 'azerty', 'dvorak'],
      category: 'controls',
      label: 'Keyboard Layout',
      description: 'Select your keyboard layout'
    });
    
    this.setDefault('controls.mouseSensitivity', 1.0, {
      type: 'range',
      min: 0.1,
      max: 3.0,
      step: 0.1,
      category: 'controls',
      label: 'Mouse Sensitivity',
      description: 'Adjust mouse movement sensitivity'
    });
    
    this.setDefault('controls.invertY', false, {
      type: 'boolean',
      category: 'controls',
      label: 'Invert Y-Axis',
      description: 'Invert mouse Y-axis movement'
    });
    
    // Graphics Settings
    this.setDefault('graphics.quality', 'medium', {
      type: 'select',
      options: ['low', 'medium', 'high', 'ultra'],
      category: 'graphics',
      label: 'Graphics Quality',
      description: 'Set graphics quality level'
    });
    
    this.setDefault('graphics.resolution', '1920x1080', {
      type: 'select',
      options: ['1280x720', '1920x1080', '2560x1440', '3840x2160'],
      category: 'graphics',
      label: 'Resolution',
      description: 'Game resolution'
    });
    
    this.setDefault('graphics.fullscreen', false, {
      type: 'boolean',
      category: 'graphics',
      label: 'Fullscreen',
      description: 'Run game in fullscreen mode'
    });
    
    this.setDefault('graphics.vsync', true, {
      type: 'boolean',
      category: 'graphics',
      label: 'V-Sync',
      description: 'Enable vertical synchronization'
    });
    
    // UI Settings
    this.setDefault('ui.scale', 1.0, {
      type: 'range',
      min: 0.5,
      max: 2.0,
      step: 0.1,
      category: 'ui',
      label: 'UI Scale',
      description: 'Scale the user interface'
    });
    
    this.setDefault('ui.showFPS', false, {
      type: 'boolean',
      category: 'ui',
      label: 'Show FPS',
      description: 'Display frames per second counter'
    });
    
    this.setDefault('ui.showDamage', true, {
      type: 'boolean',
      category: 'ui',
      label: 'Show Damage Numbers',
      description: 'Display damage numbers during combat'
    });
  }
  
  setDefault(key, value, metadata = {}) {
    this.defaults.set(key, { value, metadata });
    this.validators.set(key, this.createValidator(metadata));
  }
  
  createValidator(metadata) {
    return (value) => {
      // Type validation
      switch (metadata.type) {
        case 'boolean':
          return typeof value === 'boolean';
        case 'number':
        case 'range':
          return typeof value === 'number' && 
                 value >= (metadata.min || -Infinity) && 
                 value <= (metadata.max || Infinity);
        case 'select':
          return metadata.options && metadata.options.includes(value);
        case 'string':
          return typeof value === 'string';
        default:
          return true;
      }
    };
  }
  
  get(key, defaultValue = null) {
    // Return saved setting or default
    if (this.settings.has(key)) {
      return this.settings.get(key);
    }
    
    const defaultSetting = this.defaults.get(key);
    return defaultSetting ? defaultSetting.value : defaultValue;
  }
  
  set(key, value) {
    // Validate the value
    const validator = this.validators.get(key);
    if (validator && !validator(value)) {
      throw new Error(`Invalid value for setting: ${key}`);
    }
    
    const oldValue = this.settings.get(key);
    this.settings.set(key, value);
    
    // Notify observers
    this.notifyObservers(key, value, oldValue);
    
    // Save to storage
    this.storage.save(key, value);
    
    return true;
  }
  
  reset(key) {
    const defaultSetting = this.defaults.get(key);
    if (defaultSetting) {
      this.set(key, defaultSetting.value);
    }
  }
  
  resetAll() {
    this.defaults.forEach((defaultSetting, key) => {
      this.set(key, defaultSetting.value);
    });
  }
  
  getMetadata(key) {
    const defaultSetting = this.defaults.get(key);
    return defaultSetting ? defaultSetting.metadata : null;
  }
  
  getSettingsByCategory(category) {
    const settings = {};
    
    this.defaults.forEach((defaultSetting, key) => {
      if (defaultSetting.metadata.category === category) {
        settings[key] = {
          value: this.get(key),
          metadata: defaultSetting.metadata
        };
      }
    });
    
    return settings;
  }
  
  getAllSettings() {
    const settings = {};
    
    this.defaults.forEach((defaultSetting, key) => {
      settings[key] = {
        value: this.get(key),
        metadata: defaultSetting.metadata
      };
    });
    
    return settings;
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
      } else if (observer.onSettingChanged) {
        observer.onSettingChanged(key, newValue, oldValue);
      }
    });
  }
  
  loadSettings() {
    // Load all settings from storage
    this.defaults.forEach((defaultSetting, key) => {
      const savedValue = this.storage.load(key);
      if (savedValue !== null) {
        this.settings.set(key, savedValue);
      }
    });
  }
  
  exportSettings() {
    const exportData = {
      version: '1.0',
      timestamp: Date.now(),
      settings: Object.fromEntries(this.settings)
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  importSettings(jsonData) {
    try {
      const importData = JSON.parse(jsonData);
      
      if (importData.version !== '1.0') {
        throw new Error('Unsupported settings version');
      }
      
      Object.entries(importData.settings).forEach(([key, value]) => {
        this.set(key, value);
      });
      
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }
}
```

### Settings Storage System:
```javascript
class SettingsStorage {
  constructor() {
    this.storageKey = 'vibe-fighter-settings';
    this.storage = window.localStorage;
  }
  
  save(key, value) {
    try {
      const settings = this.loadAllSettings();
      settings[key] = value;
      this.storage.setItem(this.storageKey, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Failed to save setting:', key, error);
      return false;
    }
  }
  
  load(key) {
    try {
      const settings = this.loadAllSettings();
      return settings[key] !== undefined ? settings[key] : null;
    } catch (error) {
      console.error('Failed to load setting:', key, error);
      return null;
    }
  }
  
  loadAllSettings() {
    try {
      const data = this.storage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load settings:', error);
      return {};
    }
  }
  
  delete(key) {
    try {
      const settings = this.loadAllSettings();
      delete settings[key];
      this.storage.setItem(this.storageKey, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Failed to delete setting:', key, error);
      return false;
    }
  }
  
  clear() {
    try {
      this.storage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Failed to clear settings:', error);
      return false;
    }
  }
  
  getStorageSize() {
    try {
      const data = this.storage.getItem(this.storageKey);
      return data ? new Blob([data]).size : 0;
    } catch (error) {
      console.error('Failed to get storage size:', error);
      return 0;
    }
  }
  
  isStorageAvailable() {
    try {
      const testKey = '__test__';
      this.storage.setItem(testKey, 'test');
      this.storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  backup() {
    try {
      const data = this.storage.getItem(this.storageKey);
      if (data) {
        const backupKey = `${this.storageKey}_backup_${Date.now()}`;
        this.storage.setItem(backupKey, data);
        return backupKey;
      }
      return null;
    } catch (error) {
      console.error('Failed to backup settings:', error);
      return null;
    }
  }
  
  restore(backupKey) {
    try {
      const backupData = this.storage.getItem(backupKey);
      if (backupData) {
        this.storage.setItem(this.storageKey, backupData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to restore settings:', error);
      return false;
    }
  }
}
```

### Settings Validation System:
```javascript
class SettingsValidator {
  constructor() {
    this.validators = new Map();
    this.registerValidators();
  }
  
  registerValidators() {
    // Boolean validator
    this.validators.set('boolean', (value) => {
      return typeof value === 'boolean';
    });
    
    // Number validator
    this.validators.set('number', (value, metadata) => {
      if (typeof value !== 'number') return false;
      
      if (metadata.min !== undefined && value < metadata.min) return false;
      if (metadata.max !== undefined && value > metadata.max) return false;
      
      return true;
    });
    
    // Range validator
    this.validators.set('range', (value, metadata) => {
      if (typeof value !== 'number') return false;
      
      if (metadata.min !== undefined && value < metadata.min) return false;
      if (metadata.max !== undefined && value > metadata.max) return false;
      
      if (metadata.step !== undefined) {
        const steps = (metadata.max - metadata.min) / metadata.step;
        const currentStep = Math.round((value - metadata.min) / metadata.step);
        const expectedValue = metadata.min + (currentStep * metadata.step);
        
        return Math.abs(value - expectedValue) < 0.001;
      }
      
      return true;
    });
    
    // Select validator
    this.validators.set('select', (value, metadata) => {
      return metadata.options && metadata.options.includes(value);
    });
    
    // String validator
    this.validators.set('string', (value, metadata) => {
      if (typeof value !== 'string') return false;
      
      if (metadata.minLength !== undefined && value.length < metadata.minLength) return false;
      if (metadata.maxLength !== undefined && value.length > metadata.maxLength) return false;
      
      if (metadata.pattern !== undefined) {
        const regex = new RegExp(metadata.pattern);
        return regex.test(value);
      }
      
      return true;
    });
  }
  
  validate(key, value, metadata) {
    const validator = this.validators.get(metadata.type);
    if (!validator) {
      console.warn(`No validator found for type: ${metadata.type}`);
      return true;
    }
    
    return validator(value, metadata);
  }
  
  validateAll(settings, defaults) {
    const errors = [];
    
    defaults.forEach((defaultSetting, key) => {
      const value = settings.get(key);
      if (value !== undefined) {
        if (!this.validate(key, value, defaultSetting.metadata)) {
          errors.push({
            key,
            value,
            expected: defaultSetting.metadata,
            message: `Invalid value for setting: ${key}`
          });
        }
      }
    });
    
    return errors;
  }
  
  sanitizeValue(value, metadata) {
    switch (metadata.type) {
      case 'boolean':
        return Boolean(value);
      case 'number':
      case 'range':
        const num = Number(value);
        if (isNaN(num)) return metadata.default || 0;
        if (metadata.min !== undefined && num < metadata.min) return metadata.min;
        if (metadata.max !== undefined && num > metadata.max) return metadata.max;
        return num;
      case 'select':
        return metadata.options.includes(value) ? value : metadata.options[0];
      case 'string':
        return String(value);
      default:
        return value;
    }
  }
}
```

## Testing Strategy

### Unit Tests:
- [ ] Test settings manager functionality
- [ ] Test settings storage operations
- [ ] Test settings validation
- [ ] Test default settings configuration
- [ ] Test settings persistence

### Integration Tests:
- [ ] Test settings manager integration with storage
- [ ] Test validation system integration
- [ ] Test settings loading and saving
- [ ] Test settings export/import

### Manual Testing:
- [ ] Verify settings persistence across sessions
- [ ] Test settings validation with invalid values
- [ ] Check default settings loading
- [ ] Test settings reset functionality
- [ ] Validate Local Storage usage

## Success Metrics
- **Performance**: Settings operations < 100ms
- **Memory**: Settings system < 5MB
- **Reliability**: 100% settings persistence success rate
- **Validation**: All settings properly validated
- **Integration**: Seamless with existing systems 