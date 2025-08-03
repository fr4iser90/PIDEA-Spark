import { chromium } from 'playwright';

// Browser management functions (extracted from automation-workflow-cdp.js)
export async function initializeBrowser(cdpPort, log) {
    try {
        log(`🌐 Connecting to browser via CDP port ${cdpPort}`);
        
        // Connect to existing browser instance
        const browser = await chromium.connectOverCDP(`http://localhost:${cdpPort}`);
        log('🔗 CDP connection established');
        
        // Verify connection and get context
        const contexts = browser.contexts();
        log(`📋 Found ${contexts.length} browser contexts`);
        
        if (contexts.length === 0) {
            throw new Error('No browser contexts found');
        }
        
        // Get the first context and page
        const context = contexts[0];
        const pages = await context.pages();
        const page = pages[0];
        log('🎯 Connected to Cursor IDE');
        
        return { browser, page };
        
    } catch (error) {
        log(`❌ Failed to connect to browser: ${error.message}`, 'ERROR');
        log('💡 Make sure Chrome is running with --remote-debugging-port=9222', 'INFO');
        log('🔧 Try running: google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug', 'INFO');
        throw error;
    }
} 