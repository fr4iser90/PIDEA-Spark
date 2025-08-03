#!/usr/bin/env node

/**
 * Send to Cursor Module
 * 
 * Handles sending prompts to Cursor IDE via CDP
 * Reusable across different workflows
 */

import { cursorSelectors, typingSelectors, cursorBlinkSelectors, streamingSelectors, errorSelectors } from '../ui/selectors.js';
import { waitForAIResponse } from './response-processor.js';

export class SendToCursor {
    constructor(page, log, delay) {
        this.page = page;
        this.log = log;
        this.delay = delay;
    }

    async sendToCursor(prompt) {
        // Use imported selectors
        const chatSelectors = cursorSelectors;

        // 1. Try multiple strategies to start a new chat
        let newChatCreated = false;
        
        // Strategy 1: Try to click "New Chat" button
        try {
            await this.page.click(chatSelectors.newChatButton);
            this.log('🆕 Clicked New Chat button');
            newChatCreated = true;
            await this.delay(1000); // Wait for new chat to load
        } catch (error) {
            this.log('⚠️ Could not click New Chat button, trying keyboard shortcut', 'WARNING');
        }
        
        // Strategy 2: Try keyboard shortcut Ctrl+N
        if (!newChatCreated) {
            try {
                await this.page.keyboard.press('Control+n');
                this.log('⌨️ Used Ctrl+N shortcut for new chat');
                newChatCreated = true;
                await this.delay(1000); // Wait for new chat to load
            } catch (error) {
                this.log('⚠️ Could not use Ctrl+N shortcut, using existing chat', 'WARNING');
            }
        }
        
        // Strategy 3: Try to find and click the specific button from your example
        if (!newChatCreated) {
            try {
                await this.page.click('.action-label.codicon.codicon-add-two[aria-label*="New Chat"]');
                this.log('🆕 Clicked specific New Chat button');
                newChatCreated = true;
                await this.delay(1000);
            } catch (error) {
                this.log('⚠️ Could not find specific New Chat button, using existing chat', 'WARNING');
            }
        }

        // 2. Wait for chat input to be available
        await this.page.waitForSelector(chatSelectors.input);
        
        // 3. Find the input field
        const inputSelector = await this.page.$(chatSelectors.input);
        
        if (!inputSelector) {
            throw new Error('Could not find Cursor chat input');
        }
        
        // 4. Click input and paste the entire prompt at once
        await inputSelector.click();
        await inputSelector.fill(prompt); // Paste entire prompt at once!
        
        // 5. Send the message
        await inputSelector.press('Enter');
        
        this.log('📤 Prompt sent to Cursor, waiting for response...');
        
        // 6. Wait for response
        const response = await this.waitForAIResponse(chatSelectors);
        
        return response;
    }

    async waitForAIResponse(chatSelectors) {
        return waitForAIResponse(
            this.page, 
            chatSelectors, 
            typingSelectors, 
            cursorBlinkSelectors, 
            streamingSelectors, 
            errorSelectors, 
            this.log, 
            this.delay
        );
    }
}

export default SendToCursor;
