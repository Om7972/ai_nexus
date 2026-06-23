import { OpenAIAIProvider } from './openai.service.js';
import { ClaudeAIProvider } from './claude.service.js';
import { GeminiAIProvider } from './gemini.service.js';
import logger from '../../utils/logger.js';
import { trackUsage, verifySubscriptionLimits } from '../usageTracker.service.js';
import { getCachedResponse, cacheResponse } from '../optimization.service.js';

export class AIProviderFactory {
    constructor() {
        this.providers = {
            openai: new OpenAIAIProvider(process.env.OPENAI_API_KEY),
            claude: new ClaudeAIProvider(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY),
            gemini: new GeminiAIProvider(process.env.GEMINI_API_KEY),
        };
    }

    getProvider(modelString) {
        this.providers.openai.apiKey = process.env.OPENAI_API_KEY;
        this.providers.claude.apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
        this.providers.gemini.apiKey = process.env.GEMINI_API_KEY;

        if (!modelString) return this.providers.openai;
        const lowerModel = modelString.toLowerCase();
        if (lowerModel.includes('gpt') || lowerModel.includes('dall-e')) return this.providers.openai;
        if (lowerModel.includes('claude')) return this.providers.claude;
        if (lowerModel.includes('gemini')) return this.providers.gemini;
        return this.providers.openai;
    }

    async generateText(options) {
        const { model = 'gpt-4o', prompt, userId, feature = 'text-studio' } = options;

        // 1. Verify subscription and budget limits if userId is present
        if (userId) {
            await verifySubscriptionLimits(userId);
        }

        // 2. Check prompt caching
        const cachedContent = getCachedResponse(model, feature, prompt);
        if (cachedContent) {
            logger.info(`[AI Cache] Prompt hit in optimization cache for model: ${model}`);
            // Log a zero-cost cached hit usage record
            if (userId) {
                await trackUsage({
                    userId,
                    model: `${model} (cached)`,
                    feature,
                    promptTokens: 0,
                    completionTokens: 0,
                    latency: 2,
                    status: 'success'
                });
            }
            return {
                content: cachedContent,
                tokensUsed: 0,
                model: `${model} (cached)`,
                wasCached: true
            };
        }

        const startTime = Date.now();
        let primaryProvider = this.getProvider(model);

        try {
            logger.info(`[AI] Attempting text generation with primary provider for model: ${model}`);
            const result = await primaryProvider.generateText(options);
            const latency = Date.now() - startTime;

            // Save response in optimization cache
            cacheResponse(model, feature, prompt, result.content);

            // Track usage details
            if (userId) {
                const total = result.tokensUsed || 100;
                const promptTokens = Math.floor(total * 0.4);
                const completionTokens = total - promptTokens;

                await trackUsage({
                    userId,
                    model: result.model || model,
                    feature,
                    promptTokens,
                    completionTokens,
                    latency,
                    status: 'success'
                });
            }

            return result;
        } catch (error) {
            logger.error(`[AI] Primary provider failed: ${error.message}. Attempting fallback...`);

            // Try fallbacks
            const fallbackOrder = ['openai', 'gemini', 'claude'].filter(
                p => this.getProvider(model) !== this.providers[p]
            );

            for (const fallbackKey of fallbackOrder) {
                try {
                    const fallbackProvider = this.providers[fallbackKey];
                    const fallbackOptions = { ...options, model: undefined };
                    logger.info(`[AI] Fallback to ${fallbackKey}`);
                    const result = await fallbackProvider.generateText(fallbackOptions);
                    const latency = Date.now() - startTime;

                    result.wasFallback = true;

                    // Cache response
                    cacheResponse(model, feature, prompt, result.content);

                    if (userId) {
                        const total = result.tokensUsed || 100;
                        const promptTokens = Math.floor(total * 0.4);
                        const completionTokens = total - promptTokens;

                        await trackUsage({
                            userId,
                            model: result.model || `${fallbackKey}-fallback`,
                            feature,
                            promptTokens,
                            completionTokens,
                            latency,
                            status: 'success'
                        });
                    }

                    return result;
                } catch (fallbackError) {
                    logger.error(`[AI] Fallback ${fallbackKey} failed: ${fallbackError.message}`);
                }
            }

            // If everything fails, log the failure trace
            const latency = Date.now() - startTime;
            if (userId) {
                await trackUsage({
                    userId,
                    model,
                    feature,
                    promptTokens: 0,
                    completionTokens: 0,
                    latency,
                    status: 'failed',
                    errorMessage: error.message
                });
            }

            throw new Error(`All AI providers failed. Last error: ${error.message}`);
        }
    }

    async generateImage(options) {
        const { model = 'dall-e-3', prompt, userId, feature = 'image-lab' } = options;

        if (userId) {
            await verifySubscriptionLimits(userId);
        }

        const startTime = Date.now();
        const provider = this.getProvider(model);

        try {
            logger.info(`[AI] Attempting image generation with primary provider for model: ${model}`);
            const result = await provider.generateImage(options);
            const latency = Date.now() - startTime;

            if (userId) {
                await trackUsage({
                    userId,
                    model: result.toolUsed || model,
                    feature,
                    promptTokens: 0,
                    completionTokens: 0,
                    latency,
                    status: 'success'
                });
            }

            return result;
        } catch (error) {
            logger.error(`[AI] Primary image generation failed: ${error.message}. Attempting fallback...`);
            
            try {
                if (provider !== this.providers.openai) {
                    logger.info(`[AI] Image Fallback to openai`);
                    const result = await this.providers.openai.generateImage({ ...options, model: 'dall-e-3' });
                    const latency = Date.now() - startTime;

                    if (userId) {
                        await trackUsage({
                            userId,
                            model: 'dall-e-3 (fallback)',
                            feature,
                            promptTokens: 0,
                            completionTokens: 0,
                            latency,
                            status: 'success'
                        });
                    }

                    return result;
                }
            } catch (fallbackError) {
                logger.error(`[AI] Image Fallback failed: ${fallbackError.message}`);
            }

            const latency = Date.now() - startTime;
            if (userId) {
                await trackUsage({
                    userId,
                    model,
                    feature,
                    promptTokens: 0,
                    completionTokens: 0,
                    latency,
                    status: 'failed',
                    errorMessage: error.message
                });
            }

            throw new Error(`Image generation failed: ${error.message}`);
        }
    }
}

export const aiManager = new AIProviderFactory();
