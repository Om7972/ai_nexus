import { OpenAIAIProvider } from './openai.service.js';
import { ClaudeAIProvider } from './claude.service.js';
import { GeminiAIProvider } from './gemini.service.js';
import logger from '../../utils/logger.js';

export class AIProviderFactory {
    constructor() {
        // Will evaluate at instantiation
        this.providers = {
            openai: new OpenAIAIProvider(process.env.OPENAI_API_KEY),
            claude: new ClaudeAIProvider(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY),
            gemini: new GeminiAIProvider(process.env.GEMINI_API_KEY),
        };
    }

    // Lazy load the factory providers
    getProvider(modelString) {
        // Force refresh from env if missing
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
        const { model = 'gpt-4o' } = options;
        let primaryProvider = this.getProvider(model);

        try {
            logger.info(`[AI] Attempting text generation with primary provider for model: ${model}`);
            return await primaryProvider.generateText(options);
        } catch (error) {
            logger.error(`[AI] Primary provider failed: ${error.message}. Attempting fallback...`);

            // Fallback logic
            const fallbackOrder = ['openai', 'gemini', 'claude'].filter(
                p => this.getProvider(model) !== this.providers[p]
            );

            for (const fallbackKey of fallbackOrder) {
                try {
                    const fallbackProvider = this.providers[fallbackKey];
                    // Strip the model name so the fallback uses its own default model
                    const fallbackOptions = { ...options, model: undefined };
                    logger.info(`[AI] Fallback to ${fallbackKey}`);
                    const result = await fallbackProvider.generateText(fallbackOptions);
                    result.wasFallback = true;
                    return result;
                } catch (fallbackError) {
                    logger.error(`[AI] Fallback ${fallbackKey} failed: ${fallbackError.message}`);
                }
            }

            throw new Error(`All AI providers failed. Last error: ${error.message}`);
        }
    }

    async generateImage(options) {
        const { model = 'dall-e-3' } = options;
        const provider = this.getProvider(model);

        try {
            logger.info(`[AI] Attempting image generation with primary provider for model: ${model}`);
            return await provider.generateImage(options);
        } catch (error) {
            logger.error(`[AI] Primary image generation failed: ${error.message}. Attempting fallback...`);
            // Only OpenAI might be configured for images natively right now
            try {
                if (provider !== this.providers.openai) {
                    logger.info(`[AI] Image Fallback to openai`);
                    return await this.providers.openai.generateImage({ ...options, model: 'dall-e-3' });
                }
            } catch (fallbackError) {
                logger.error(`[AI] Image Fallback failed: ${fallbackError.message}`);
            }

            throw new Error(`Image generation failed: ${error.message}`);
        }
    }
}

export const aiManager = new AIProviderFactory();
