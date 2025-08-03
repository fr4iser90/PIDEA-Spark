/**
 * Cursor IDE Selectors for CDP Automation
 * 
 * This module contains all the selectors needed to interact with Cursor IDE
 * through Chrome DevTools Protocol (CDP).
 */

// Cursor-specific chat selectors (extracted from automation-workflow-cdp.js)
export const cursorSelectors = {
    newChatButton: '[data-testid="new-chat-button"], .new-chat-button, button[aria-label*="New"], button[aria-label*="new"], .action-label.codicon.codicon-add-two[aria-label*="New Chat"], .codicon-add-two[role="button"]',
    input: '.aislash-editor-input[contenteditable="true"]',
    inputContainer: '.aislash-editor-container',
    userMessages: 'div.aislash-editor-input-readonly[contenteditable="false"][data-lexical-editor="true"]',
    aiMessages: 'span.anysphere-markdown-container-root',
    messagesContainer: 'div[style*="display: flex; flex-direction: column"]',
    chatContainer: '.aislash-container',
    isActive: '.aislash-container',
    isInputReady: '.aislash-editor-input[contenteditable="true"]'
};

// Typing indicator selectors
export const typingSelectors = [
    'span:has-text("Generating")',
    'span:has-text("Typing")',
    'span:has-text("Thinking")',
    '.typing-indicator:visible',
    '.loading-indicator:visible', 
    '[data-testid="typing"]:visible',
    '.cursor-typing:visible',
    '.aislash-typing:visible',
    '.typing-dots:visible',
    '.loading-dots:visible',
    '[aria-label*="typing"]:visible',
    '[title*="typing"]:visible',
    '.response-loading:visible',
    '.ai-typing:visible'
];

// Cursor blinking selectors
export const cursorBlinkSelectors = [
    '.cursor-blink:visible',
    '.typing-cursor:visible',
    '.response-cursor:visible'
];

// Streaming text selectors
export const streamingSelectors = [
    '[data-streaming="true"]:visible',
    '.streaming:visible',
    '.partial-response:visible',
    '.incomplete-response:visible'
];

// File edit completion selectors
export const fileEditSelectors = [
    'span:has-text("file edited")',
    'span:has-text("files edited")',
    'div:has-text("file edited")',
    'div:has-text("files edited")'
];

// Running command selectors
export const runningSelectors = [
    'span:has-text("Running terminal command")',
    'div:has-text("Running terminal command")',
    'span:has-text("Generating")',
    'div:has-text("Generating")'
];

// Completion indicator selectors
export const completionSelectors = [
    '.response-complete',
    '[data-complete="true"]',
    '.finished-response',
    '.response-done'
];

// Error selectors
export const errorSelectors = [
    '.error-message',
    '.failed-response',
    '[data-error="true"]',
    '.response-error'
];

// Markdown selectors
export const markdownSelectors = [
    'span.anysphere-markdown-container-root',
    '.markdown-content',
    '.response-markdown',
    '[data-markdown="true"]'
];

// Response selectors
export const responseSelectors = [
    '.ai-response',
    '.assistant-message',
    '.response-message',
    '.message.assistant',
    '.chat-response'
];
