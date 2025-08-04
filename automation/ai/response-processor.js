// Response processing functions (extracted from automation-workflow-cdp.js)
export async function detectAITyping(page, typingSelectors, cursorBlinkSelectors, streamingSelectors, log) {
    try {
        // Check for the specific "Generating" indicator
        const generatingElements = await page.$$('span:has-text("Generating")');
        if (generatingElements.length > 0) {
            return true;
        }
        
        // Check for various typing indicators (more specific)
        const localTypingSelectors = typingSelectors;
        
        for (const selector of localTypingSelectors) {
            try {
                const elements = await page.$$(selector);
                if (elements.length > 0) {
                    // Double-check that the element is actually visible and contains typing text
                    for (const element of elements) {
                        const text = await element.textContent();
                        const isVisible = await element.isVisible();
                        if (isVisible && text && (text.includes('Generating') || text.includes('Typing') || text.includes('Thinking'))) {
                            return true;
                        }
                    }
                }
            } catch (error) {
                // Skip invalid selectors
                continue;
            }
        }
        
        // Check for cursor blinking in response areas (only if visible)
        const localCursorBlinkSelectors = cursorBlinkSelectors;
        
        for (const selector of localCursorBlinkSelectors) {
            try {
                const elements = await page.$$(selector);
                if (elements.length > 0) {
                    return true;
                }
            } catch (error) {
                continue;
            }
        }
        
        // Check for streaming text indicators (only if visible)
        const localStreamingSelectors = streamingSelectors;
        
        for (const selector of localStreamingSelectors) {
            try {
                const elements = await page.$$(selector);
                if (elements.length > 0) {
                    return true;
                }
            } catch (error) {
                continue;
            }
        }
        
        return false;
        
    } catch (error) {
        log(`⚠️ Error detecting AI typing: ${error.message}`, 'WARNING');
        return false;
    }
}

export async function extractAIResponse(page, chatSelectors, log) {
    try {
        // Try multiple strategies to find the AI response
        const responseStrategies = [
            // Strategy 1: Direct AI message selectors
            async () => {
                const messages = await page.$$(chatSelectors.aiMessages);
                if (messages.length > 0) {
                    const lastMessage = messages[messages.length - 1];
                    return await lastMessage.textContent();
                }
                return null;
            },
            
            // Strategy 2: Look for markdown containers
            async () => {
                const markdownSelectors = [
                    'span.anysphere-markdown-container-root',
                    '.markdown-content',
                    '.response-markdown',
                    '[data-markdown="true"]'
                ];
                
                for (const selector of markdownSelectors) {
                    const elements = await page.$$(selector);
                    if (elements.length > 0) {
                        const lastElement = elements[elements.length - 1];
                        return await lastElement.textContent();
                    }
                }
                return null;
            },
            
            // Strategy 3: Look for any response-like content
            async () => {
                const responseSelectors = [
                    '.ai-response',
                    '.assistant-message',
                    '.response-message',
                    '.message.assistant',
                    '.chat-response'
                ];
                
                for (const selector of responseSelectors) {
                    const elements = await page.$$(selector);
                    if (elements.length > 0) {
                        const lastElement = elements[elements.length - 1];
                        return await lastElement.textContent();
                    }
                }
                return null;
            },
            
            // Strategy 4: Look for content in the last message container
            async () => {
                const messageContainers = await page.$$(chatSelectors.messagesContainer);
                if (messageContainers.length > 0) {
                    const lastContainer = messageContainers[messageContainers.length - 1];
                    return await lastContainer.textContent();
                }
                return null;
            },
            
            // Strategy 5: Look for any substantial text content that's not user input
            async () => {
                const allTextElements = await page.$$('p, div, span');
                let bestCandidate = null;
                let maxLength = 0;
                
                for (const element of allTextElements) {
                    const text = await element.textContent();
                    if (text && text.length > 200 && text.length > maxLength) {
                        // Check if it looks like an AI response (not user input)
                        const lowerText = text.toLowerCase();
                        if (!lowerText.includes('user:') && !lowerText.includes('me:') && 
                            !lowerText.includes('input:') && !lowerText.includes('prompt:')) {
                            bestCandidate = text;
                            maxLength = text.length;
                        }
                    }
                }
                
                return bestCandidate;
            }
        ];
        
        // Try each strategy until we find a response
        for (const strategy of responseStrategies) {
            try {
                const response = await strategy();
                if (response && response.trim().length > 0) {
                    return response.trim();
                }
            } catch (error) {
                continue;
            }
        }
        
        return null;
        
    } catch (error) {
        log(`⚠️ Error extracting AI response: ${error.message}`, 'WARNING');
        return null;
    }
}

export async function detectResponseComplete(page, currentText, lastLength, log) {
    try {
        // Check for "Completed" completion indicator (Cursor IDE)
        // const completedSelectors = [
        //     'span:has-text("Completed")',
        //     'div:has-text("Completed")',
        //     'span:has-text("file changed")',
        //     'div:has-text("file changed")',
        //     'span:has-text("files changed")',
        //     'div:has-text("files changed")'
        // ];
        
        // for (const selector of completedSelectors) {
        //     const elements = await page.$$(selector);
        //     if (elements.length > 0) {
        //         for (const element of elements) {
        //             const isVisible = await element.isVisible();
        //             if (isVisible) {
        //                 const text = await element.textContent();
        //                 if (text && (text.includes('Completed') || text.includes('file changed') || text.includes('files changed'))) {
        //                     log(`🔍 Detected completion: "${text}"`);
        //                     return true;
        //                 }
        //             }
        //         }
        //     }
        // }
        
        // Check for "X files edited" completion indicator
        const fileEditSelectors = [
            'span:has-text("file edited")',
            'span:has-text("files edited")',
            'div:has-text("file edited")',
            'div:has-text("files edited")'
        ];
        
        for (const selector of fileEditSelectors) {
            const elements = await page.$$(selector);
            if (elements.length > 0) {
                for (const element of elements) {
                    const isVisible = await element.isVisible();
                    if (isVisible) {
                        const text = await element.textContent();
                        if (text && (text.includes('file edited') || text.includes('files edited'))) {
                            log(`🔍 Detected file edit completion: "${text}"`);
                            return true;
                        }
                    }
                }
            }
        }
        
        // Check for "Running terminal command" - means AI is still working
        const runningSelectors = [
            'span:has-text("Running terminal command")',
            'div:has-text("Running terminal command")',
            'span:has-text("Generating")',
            'div:has-text("Generating")'
        ];
        
        for (const selector of runningSelectors) {
            const elements = await page.$$(selector);
            if (elements.length > 0) {
                for (const element of elements) {
                    const isVisible = await element.isVisible();
                    if (isVisible) {
                        const text = await element.textContent();
                        if (text && (text.includes('Running terminal command') || text.includes('Generating'))) {
                            log(`🔍 AI still working: "${text}"`);
                            return false; // Not complete yet
                        }
                    }
                }
            }
        }
        
        // Check for completion indicators
        const completionSelectors = [
            '.response-complete',
            '[data-complete="true"]',
            '.finished-response',
            '.response-done'
        ];
        
        for (const selector of completionSelectors) {
            const elements = await page.$$(selector);
            if (elements.length > 0) {
                return true;
            }
        }
        
        // Check if text has stopped growing and is substantial
        if (currentText && currentText.length > 100 && currentText.length === lastLength) {
            // Additional check: look for common response endings
            const responseEndings = [
                '```',
                '**Summary:**',
                '**Next Steps:**',
                '**Status:**',
                'completed',
                'finished',
                'done'
            ];
            
            const lowerText = currentText.toLowerCase();
            for (const ending of responseEndings) {
                if (lowerText.includes(ending.toLowerCase())) {
                    return true;
                }
            }
        }
        
        return false;
        
    } catch (error) {
        log(`⚠️ Error detecting response completion: ${error.message}`, 'WARNING');
        return false;
    }
}

export async function waitForAIResponse(page, chatSelectors, typingSelectors, cursorBlinkSelectors, streamingSelectors, errorSelectors, log, delay, options = {}) {
    log('⏳ Waiting for AI response to start...');
    
    // Configuration for planning workflow
    const maxStableChecks = options.maxStableChecks || 50; // Default 50, planning uses 20
    let stableCheckCount = 0;
    
    // Wait for response to start appearing
    await delay(3000);
    
    // Wait for response to complete
    let responseText = '';
    let lastLength = 0;
    
    while (true) {
        try {
            // Get the latest response text using enhanced extraction
            const currentText = await extractAIResponse(page, chatSelectors, log);
            
            if (currentText && currentText.length > lastLength) {
                responseText = currentText;
                lastLength = currentText.length;
                stableCheckCount = 0; // Reset stable count when text grows
                log(`📝 Response growing: ${currentText.length} characters`);
            } else if (currentText && currentText.length === lastLength && currentText.length > 0) {
                stableCheckCount++;
                log(`⏸️ Response stable (${stableCheckCount}/${maxStableChecks})`);
                
                // For planning workflow: force continue after max stable checks
                if (stableCheckCount >= maxStableChecks) {
                    log(`⏰ Max stable checks reached (${maxStableChecks}), forcing continuation`);
                    break;
                }
            } else if (!currentText) {
                // No response found yet, wait a bit longer
            }
            
            // Check if response appears to be complete FIRST (PRIORITY!)
            const isComplete = await detectResponseComplete(page, currentText, lastLength, log);
            
            // Break if completion is detected (files edited, etc.)
            if (isComplete) {
                log('✅ Response appears to be complete');
                break;
            }
            
            // Only then check for typing indicators
            const isTyping = await detectAITyping(page, typingSelectors, cursorBlinkSelectors, streamingSelectors, log);
            
            if (isTyping) {
                log('⌨️ AI is actively typing...');
                stableCheckCount = 0; // Reset stable count when typing
                await delay(2000);
                continue;
            }
            
            // If no response after 2 minutes, check if there's an error
            if (responseText.length === 0) {
                // Check for error messages or failed responses
                const localErrorSelectors = errorSelectors;
                
                for (const errorSelector of localErrorSelectors) {
                    const errors = await page.$$(errorSelector);
                    if (errors.length > 0) {
                        log('❌ Error detected in AI response', 'ERROR');
                        return '';
                    }
                }
            }
            
            await delay(1000);
            
        } catch (error) {
            log(`⚠️ Error while waiting for response: ${error.message}`, 'WARNING');
            await delay(2000);
        }
    }
    
    if (responseText.length === 0) {
        log('⚠️ No response received', 'WARNING');
    } else {
        log(`📥 Received response (${responseText.length} characters)`);
    }
    
    return responseText;
}
