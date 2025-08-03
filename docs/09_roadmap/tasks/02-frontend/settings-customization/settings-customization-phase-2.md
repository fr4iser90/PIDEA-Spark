# Settings & Customization – Phase 2: Settings UI

## Overview
Create the settings interface components with categories, navigation, form controls for different setting types, settings preview system, and settings reset functionality for the Vibe Fighter game.

## Objectives
- [ ] Create settings interface components
- [ ] Implement settings categories and navigation
- [ ] Add form controls for different setting types
- [ ] Create settings preview system
- [ ] Add settings reset functionality

## Deliverables
- File: `src/ui/settings/settings-ui.js` - Settings interface components
- File: `src/ui/settings/settings-forms.js` - Form controls for settings
- Feature: Settings interface with categories
- Feature: Navigation between settings sections
- Feature: Form controls for all setting types
- Feature: Settings preview and reset functionality

## Dependencies
- Requires: Phase 1 (Settings Foundation)
- Blocks: Phase 3 (Integration & Customization)

## Estimated Time
2 hours

## Success Criteria
- [ ] Settings interface responsive and intuitive
- [ ] Settings categories and navigation working
- [ ] Form controls functional for all setting types
- [ ] Settings preview system operational
- [ ] Settings reset functionality working
- [ ] All systems integrate with existing game engine
- [ ] Performance impact minimal

## Technical Implementation

### Settings UI System:
```javascript
class SettingsUI {
  constructor(settingsManager) {
    this.settingsManager = settingsManager;
    this.container = null;
    this.currentCategory = 'game';
    this.isVisible = false;
    this.previewMode = false;
    
    this.categories = [
      { id: 'game', name: 'Game Settings', icon: '🎮' },
      { id: 'audio', name: 'Audio Settings', icon: '🔊' },
      { id: 'controls', name: 'Control Settings', icon: '🎯' },
      { id: 'graphics', name: 'Graphics Settings', icon: '🎨' },
      { id: 'ui', name: 'UI Settings', icon: '🖥️' }
    ];
    
    this.createUI();
    this.setupEventListeners();
  }
  
  createUI() {
    this.container = document.createElement('div');
    this.container.className = 'settings-ui';
    this.container.innerHTML = `
      <div class="settings-overlay">
        <div class="settings-modal">
          <div class="settings-header">
            <h2>Settings</h2>
            <button class="close-button" aria-label="Close settings">×</button>
          </div>
          
          <div class="settings-content">
            <div class="settings-sidebar">
              <nav class="settings-nav">
                ${this.categories.map(category => `
                  <button class="nav-item ${category.id === this.currentCategory ? 'active' : ''}" 
                          data-category="${category.id}">
                    <span class="nav-icon">${category.icon}</span>
                    <span class="nav-text">${category.name}</span>
                  </button>
                `).join('')}
              </nav>
            </div>
            
            <div class="settings-main">
              <div class="settings-panel" id="game-panel">
                <h3>Game Settings</h3>
                <div class="settings-form"></div>
              </div>
              
              <div class="settings-panel" id="audio-panel">
                <h3>Audio Settings</h3>
                <div class="settings-form"></div>
              </div>
              
              <div class="settings-panel" id="controls-panel">
                <h3>Control Settings</h3>
                <div class="settings-form"></div>
              </div>
              
              <div class="settings-panel" id="graphics-panel">
                <h3>Graphics Settings</h3>
                <div class="settings-form"></div>
              </div>
              
              <div class="settings-panel" id="ui-panel">
                <h3>UI Settings</h3>
                <div class="settings-form"></div>
              </div>
            </div>
          </div>
          
          <div class="settings-footer">
            <div class="settings-actions">
              <button class="btn btn-secondary" id="reset-category">Reset Category</button>
              <button class="btn btn-secondary" id="reset-all">Reset All</button>
              <button class="btn btn-primary" id="apply-settings">Apply</button>
              <button class="btn btn-secondary" id="cancel-settings">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.container);
    
    // Initialize forms
    this.initializeForms();
  }
  
  initializeForms() {
    this.categories.forEach(category => {
      this.loadCategorySettings(category.id);
    });
  }
  
  loadCategorySettings(categoryId) {
    const settings = this.settingsManager.getSettingsByCategory(categoryId);
    const formContainer = this.container.querySelector(`#${categoryId}-panel .settings-form`);
    
    formContainer.innerHTML = '';
    
    Object.entries(settings).forEach(([key, setting]) => {
      const formControl = this.createFormControl(key, setting);
      formContainer.appendChild(formControl);
    });
  }
  
  createFormControl(key, setting) {
    const { value, metadata } = setting;
    const controlContainer = document.createElement('div');
    controlContainer.className = 'form-control';
    
    const label = document.createElement('label');
    label.textContent = metadata.label;
    label.setAttribute('for', key);
    
    const description = document.createElement('p');
    description.className = 'form-description';
    description.textContent = metadata.description;
    
    const input = this.createInput(key, value, metadata);
    
    controlContainer.appendChild(label);
    controlContainer.appendChild(description);
    controlContainer.appendChild(input);
    
    return controlContainer;
  }
  
  createInput(key, value, metadata) {
    switch (metadata.type) {
      case 'boolean':
        return this.createCheckbox(key, value, metadata);
      case 'range':
        return this.createRangeInput(key, value, metadata);
      case 'select':
        return this.createSelect(key, value, metadata);
      case 'string':
        return this.createTextInput(key, value, metadata);
      default:
        return this.createTextInput(key, value, metadata);
    }
  }
  
  createCheckbox(key, value, metadata) {
    const container = document.createElement('div');
    container.className = 'checkbox-container';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = key;
    checkbox.checked = value;
    checkbox.dataset.settingKey = key;
    
    const label = document.createElement('label');
    label.setAttribute('for', key);
    label.className = 'checkbox-label';
    
    container.appendChild(checkbox);
    container.appendChild(label);
    
    return container;
  }
  
  createRangeInput(key, value, metadata) {
    const container = document.createElement('div');
    container.className = 'range-container';
    
    const range = document.createElement('input');
    range.type = 'range';
    range.id = key;
    range.min = metadata.min;
    range.max = metadata.max;
    range.step = metadata.step || 1;
    range.value = value;
    range.dataset.settingKey = key;
    
    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'range-value';
    valueDisplay.textContent = value;
    
    // Update value display when range changes
    range.addEventListener('input', () => {
      valueDisplay.textContent = range.value;
    });
    
    container.appendChild(range);
    container.appendChild(valueDisplay);
    
    return container;
  }
  
  createSelect(key, value, metadata) {
    const select = document.createElement('select');
    select.id = key;
    select.dataset.settingKey = key;
    
    metadata.options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = option.charAt(0).toUpperCase() + option.slice(1);
      optionElement.selected = option === value;
      select.appendChild(optionElement);
    });
    
    return select;
  }
  
  createTextInput(key, value, metadata) {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = key;
    input.value = value;
    input.dataset.settingKey = key;
    
    if (metadata.placeholder) {
      input.placeholder = metadata.placeholder;
    }
    
    return input;
  }
  
  setupEventListeners() {
    // Navigation
    this.container.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        this.switchCategory(item.dataset.category);
      });
    });
    
    // Close button
    this.container.querySelector('.close-button').addEventListener('click', () => {
      this.hide();
    });
    
    // Action buttons
    this.container.querySelector('#reset-category').addEventListener('click', () => {
      this.resetCurrentCategory();
    });
    
    this.container.querySelector('#reset-all').addEventListener('click', () => {
      this.resetAllSettings();
    });
    
    this.container.querySelector('#apply-settings').addEventListener('click', () => {
      this.applySettings();
    });
    
    this.container.querySelector('#cancel-settings').addEventListener('click', () => {
      this.cancelSettings();
    });
    
    // Form inputs
    this.container.addEventListener('change', (event) => {
      if (event.target.dataset.settingKey) {
        this.handleSettingChange(event.target);
      }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }
  
  switchCategory(categoryId) {
    // Update navigation
    this.container.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.category === categoryId);
    });
    
    // Update panels
    this.container.querySelectorAll('.settings-panel').forEach(panel => {
      panel.style.display = panel.id === `${categoryId}-panel` ? 'block' : 'none';
    });
    
    this.currentCategory = categoryId;
  }
  
  handleSettingChange(input) {
    const key = input.dataset.settingKey;
    let value;
    
    switch (input.type) {
      case 'checkbox':
        value = input.checked;
        break;
      case 'range':
        value = parseFloat(input.value);
        break;
      case 'select-one':
        value = input.value;
        break;
      default:
        value = input.value;
    }
    
    // Update setting
    try {
      this.settingsManager.set(key, value);
      this.showNotification('Setting updated', 'success');
    } catch (error) {
      this.showNotification('Invalid setting value', 'error');
      // Revert the input
      this.revertInput(input, key);
    }
  }
  
  revertInput(input, key) {
    const currentValue = this.settingsManager.get(key);
    
    switch (input.type) {
      case 'checkbox':
        input.checked = currentValue;
        break;
      case 'range':
        input.value = currentValue;
        input.nextElementSibling.textContent = currentValue;
        break;
      case 'select-one':
        input.value = currentValue;
        break;
      default:
        input.value = currentValue;
    }
  }
  
  resetCurrentCategory() {
    const settings = this.settingsManager.getSettingsByCategory(this.currentCategory);
    
    Object.keys(settings).forEach(key => {
      this.settingsManager.reset(key);
    });
    
    this.loadCategorySettings(this.currentCategory);
    this.showNotification('Category reset', 'success');
  }
  
  resetAllSettings() {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      this.settingsManager.resetAll();
      this.initializeForms();
      this.showNotification('All settings reset', 'success');
    }
  }
  
  applySettings() {
    // Settings are applied immediately when changed
    this.showNotification('Settings applied', 'success');
    this.hide();
  }
  
  cancelSettings() {
    // Revert any unsaved changes
    this.settingsManager.loadSettings();
    this.initializeForms();
    this.hide();
  }
  
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  
  show() {
    this.container.style.display = 'block';
    this.isVisible = true;
    
    // Focus first input
    const firstInput = this.container.querySelector('input, select');
    if (firstInput) {
      firstInput.focus();
    }
  }
  
  hide() {
    this.container.style.display = 'none';
    this.isVisible = false;
  }
  
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  isOpen() {
    return this.isVisible;
  }
}
```

### Settings Forms System:
```javascript
class SettingsForms {
  constructor(settingsManager) {
    this.settingsManager = settingsManager;
    this.formValidators = new Map();
    this.setupValidators();
  }
  
  setupValidators() {
    // Range validators
    this.formValidators.set('range', (value, metadata) => {
      const num = parseFloat(value);
      return !isNaN(num) && num >= metadata.min && num <= metadata.max;
    });
    
    // Select validators
    this.formValidators.set('select', (value, metadata) => {
      return metadata.options.includes(value);
    });
    
    // String validators
    this.formValidators.set('string', (value, metadata) => {
      if (metadata.minLength && value.length < metadata.minLength) return false;
      if (metadata.maxLength && value.length > metadata.maxLength) return false;
      if (metadata.pattern) {
        const regex = new RegExp(metadata.pattern);
        return regex.test(value);
      }
      return true;
    });
  }
  
  validateForm(formData) {
    const errors = [];
    
    Object.entries(formData).forEach(([key, value]) => {
      const metadata = this.settingsManager.getMetadata(key);
      if (metadata) {
        const validator = this.formValidators.get(metadata.type);
        if (validator && !validator(value, metadata)) {
          errors.push({
            key,
            value,
            message: `Invalid value for ${metadata.label}`
          });
        }
      }
    });
    
    return errors;
  }
  
  createFormField(key, setting) {
    const { value, metadata } = setting;
    
    const field = {
      key,
      value,
      metadata,
      element: null,
      validator: this.formValidators.get(metadata.type)
    };
    
    field.element = this.createFieldElement(field);
    
    return field;
  }
  
  createFieldElement(field) {
    const container = document.createElement('div');
    container.className = 'form-field';
    
    const label = document.createElement('label');
    label.textContent = field.metadata.label;
    label.setAttribute('for', field.key);
    
    const input = this.createInputElement(field);
    const error = document.createElement('div');
    error.className = 'field-error';
    error.style.display = 'none';
    
    container.appendChild(label);
    container.appendChild(input);
    container.appendChild(error);
    
    return container;
  }
  
  createInputElement(field) {
    const { key, value, metadata } = field;
    
    switch (metadata.type) {
      case 'boolean':
        return this.createCheckboxElement(key, value);
      case 'range':
        return this.createRangeElement(key, value, metadata);
      case 'select':
        return this.createSelectElement(key, value, metadata);
      case 'string':
        return this.createTextElement(key, value, metadata);
      default:
        return this.createTextElement(key, value, metadata);
    }
  }
  
  createCheckboxElement(key, value) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = key;
    checkbox.checked = value;
    checkbox.dataset.settingKey = key;
    return checkbox;
  }
  
  createRangeElement(key, value, metadata) {
    const container = document.createElement('div');
    container.className = 'range-input-container';
    
    const range = document.createElement('input');
    range.type = 'range';
    range.id = key;
    range.min = metadata.min;
    range.max = metadata.max;
    range.step = metadata.step || 1;
    range.value = value;
    range.dataset.settingKey = key;
    
    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'range-value-display';
    valueDisplay.textContent = value;
    
    range.addEventListener('input', () => {
      valueDisplay.textContent = range.value;
    });
    
    container.appendChild(range);
    container.appendChild(valueDisplay);
    
    return container;
  }
  
  createSelectElement(key, value, metadata) {
    const select = document.createElement('select');
    select.id = key;
    select.dataset.settingKey = key;
    
    metadata.options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = this.formatOptionText(option);
      optionElement.selected = option === value;
      select.appendChild(optionElement);
    });
    
    return select;
  }
  
  createTextElement(key, value, metadata) {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = key;
    input.value = value;
    input.dataset.settingKey = key;
    
    if (metadata.placeholder) {
      input.placeholder = metadata.placeholder;
    }
    
    if (metadata.maxLength) {
      input.maxLength = metadata.maxLength;
    }
    
    return input;
  }
  
  formatOptionText(option) {
    return option.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
  
  validateField(field, value) {
    if (field.validator) {
      return field.validator(value, field.metadata);
    }
    return true;
  }
  
  showFieldError(field, message) {
    const errorElement = field.element.querySelector('.field-error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    field.element.classList.add('has-error');
  }
  
  hideFieldError(field) {
    const errorElement = field.element.querySelector('.field-error');
    errorElement.style.display = 'none';
    field.element.classList.remove('has-error');
  }
  
  getFormData(formElement) {
    const formData = {};
    const inputs = formElement.querySelectorAll('[data-setting-key]');
    
    inputs.forEach(input => {
      const key = input.dataset.settingKey;
      let value;
      
      switch (input.type) {
        case 'checkbox':
          value = input.checked;
          break;
        case 'range':
          value = parseFloat(input.value);
          break;
        case 'select-one':
          value = input.value;
          break;
        default:
          value = input.value;
      }
      
      formData[key] = value;
    });
    
    return formData;
  }
}
```

## Testing Strategy

### Unit Tests:
- [ ] Test settings UI functionality
- [ ] Test form controls for all types
- [ ] Test settings navigation
- [ ] Test settings validation
- [ ] Test settings reset functionality

### Integration Tests:
- [ ] Test UI integration with settings manager
- [ ] Test form integration with validation
- [ ] Test settings persistence through UI
- [ ] Test settings preview system

### Manual Testing:
- [ ] Verify settings UI displays correctly
- [ ] Test form controls and validation
- [ ] Check settings navigation between categories
- [ ] Test settings reset functionality
- [ ] Validate settings preview system

## Success Metrics
- **Performance**: UI interactions < 100ms
- **Memory**: UI system < 3MB
- **Usability**: Intuitive settings interface
- **Validation**: All form inputs properly validated
- **Integration**: Seamless with existing systems 