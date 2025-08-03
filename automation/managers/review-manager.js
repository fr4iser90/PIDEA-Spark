// Review Manager for Cursor Automation CDP Project
import { generateReviewPrompt } from './prompts.js';
import fs from 'fs';
import path from 'path';

export class ReviewManager {
    constructor(config, log) {
        this.config = config;
        this.log = log;
        this.orchestratorPath = path.join(config.tasksDir, 'system', 'orchestrator.md');
    }

    async performInitialReview(taskQueue, completedTasks, failedTasks) {
        this.log('🔍 Starting initial project review...');
        
        try {
            // Generate review prompt
            const reviewPrompt = generateReviewPrompt(taskQueue, completedTasks, failedTasks);
            
            // Send to AI for review (this would be done via CDP in the main workflow)
            this.log('📋 Review prompt generated, ready for AI analysis');
            
            return {
                prompt: reviewPrompt,
                status: 'ready_for_ai_review'
            };
            
        } catch (error) {
            this.log(`💥 Error in review generation: ${error.message}`, 'ERROR');
            return {
                status: 'error',
                error: error.message
            };
        }
    }

    async processReviewResponse(aiResponse) {
        this.log('📝 Processing AI review response...');
        
        try {
            // Parse JSON response
            const reviewData = this.parseReviewResponse(aiResponse);
            
            if (!reviewData) {
                this.log('❌ Failed to parse review response', 'ERROR');
                return { status: 'failed', reason: 'invalid_response' };
            }

            // Log critical issues
            if (reviewData.critical_issues && reviewData.critical_issues.length > 0) {
                this.logCriticalIssues(reviewData.critical_issues);
            }

            // Log recommendations
            if (reviewData.recommendations && reviewData.recommendations.length > 0) {
                this.logRecommendations(reviewData.recommendations);
            }

            return {
                status: 'completed',
                canProceed: reviewData.can_proceed_with_automation,
                nextReviewNeeded: reviewData.next_review_needed,
                criticalIssues: reviewData.critical_issues
            };

        } catch (error) {
            this.log(`💥 Error processing review response: ${error.message}`, 'ERROR');
            return { status: 'error', error: error.message };
        }
    }

    parseReviewResponse(aiResponse) {
        try {
            // Extract JSON from AI response
            const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
            if (!jsonMatch) {
                this.log('⚠️ No JSON found in AI response', 'WARNING');
                return null;
            }

            const jsonStr = jsonMatch[1];
            return JSON.parse(jsonStr);

        } catch (error) {
            this.log(`💥 Error parsing review JSON: ${error.message}`, 'ERROR');
            return null;
        }
    }

    logCriticalIssues(issues) {
        this.log('🚨 CRITICAL ISSUES FOUND:', 'ERROR');
        for (const issue of issues) {
            this.log(`   • ${issue.type}: ${issue.description}`, 'ERROR');
            this.log(`     Affected tasks: ${issue.affected_tasks.join(', ')}`, 'ERROR');
            this.log(`     Action: ${issue.recommended_action}`, 'ERROR');
        }
    }

    logRecommendations(recommendations) {
        this.log('💡 RECOMMENDATIONS:', 'INFO');
        for (const rec of recommendations) {
            this.log(`   • ${rec}`);
        }
    }

    async validateReviewCompletion() {
        this.log('✅ Review phase completed successfully');
        return {
            status: 'completed',
            timestamp: new Date().toISOString()
        };
    }
} 