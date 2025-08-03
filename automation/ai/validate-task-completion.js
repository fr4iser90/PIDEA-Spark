#!/usr/bin/env node

/**
 * Validate Task Completion Module
 * 
 * Handles validation of AI responses for task completion
 * Reusable across different workflows
 */

export class ValidateTaskCompletion {
    constructor(log) {
        this.log = log;
    }

    async validateTaskCompletion(task, aiResponse) {
        try {
            // Check if AI gave a meaningful response
            if (!aiResponse || aiResponse.length < 100) {
                this.log('⚠️ AI response too short or empty', 'WARNING');
                return { success: false, reason: 'AI response too short' };
            }
            
            // Check for common success indicators in AI response
            const successIndicators = [
                'completed', 'success', 'done', 'finished', 'implemented', 
                'created', 'added', 'updated', 'working', 'functional'
            ];
            
            const hasSuccessIndicator = successIndicators.some(indicator => 
                aiResponse.toLowerCase().includes(indicator)
            );
            
            // Check for error indicators
            const errorIndicators = [
                'error', 'failed', 'cannot', 'unable', 'missing', 'not found',
                'invalid', 'broken', 'doesn\'t work', 'failed to'
            ];
            
            const hasErrorIndicator = errorIndicators.some(indicator => 
                aiResponse.toLowerCase().includes(indicator)
            );
            
            if (hasErrorIndicator) {
                this.log('❌ AI response contains error indicators', 'ERROR');
                return { success: false, reason: 'AI reported errors in response' };
            }
            
            if (hasSuccessIndicator) {
                this.log('✅ AI response indicates success', 'SUCCESS');
                return { success: true, result: { status: 'completed' } };
            }
            
            // If no clear indicators, assume success if response is substantial
            if (aiResponse.length > 500) {
                this.log('✅ AI provided substantial response, assuming success', 'SUCCESS');
                return { success: true, result: { status: 'completed' } };
            }
            
            this.log('⚠️ AI response unclear, marking as failed', 'WARNING');
            return { success: false, reason: 'Unclear AI response' };
            
        } catch (error) {
            this.log(`❌ Validation error: ${error.message}`, 'ERROR');
            return { success: false, reason: `Validation error: ${error.message}` };
        }
    }

    // Helper method to check if response contains specific keywords
    checkResponseKeywords(response, keywords) {
        return keywords.some(keyword => 
            response.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    // Helper method to get response quality score
    getResponseQualityScore(response) {
        if (!response || response.length < 50) return 0;
        if (response.length < 100) return 1;
        if (response.length < 300) return 2;
        if (response.length < 500) return 3;
        return 4; // High quality response
    }

    // Helper method to extract specific information from response
    extractTaskInfo(response) {
        const info = {
            hasCode: response.includes('```') || response.includes('function') || response.includes('class'),
            hasFilePaths: response.includes('/') || response.includes('\\'),
            hasCommands: response.includes('npm') || response.includes('git') || response.includes('node'),
            hasUrls: response.includes('http') || response.includes('www'),
            length: response.length
        };
        
        return info;
    }
}

export default ValidateTaskCompletion;
