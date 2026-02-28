export class GeminiAIProvider {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    }

    async generateText({ prompt, model = 'gemini-1.5-pro', tone, length }) {
        if (!this.apiKey) throw new Error('Gemini API Key is missing. Please set GEMINI_API_KEY in .env');

        let finalPrompt = `You are a helpful AI assistant.\n`;
        if (tone) finalPrompt += `Please respond in a ${tone} tone.\n`;
        if (length === 'short') finalPrompt += `Keep the response very concise and brief.\n`;
        if (length === 'long') finalPrompt += `Provide a very detailed and comprehensive response.\n`;
        finalPrompt += `\nUser Prompt: ${prompt}`;

        // Fallback for generic name
        model = model === 'gemini' ? 'gemini-1.5-pro' : model;

        const response = await fetch(`${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    { parts: [{ text: finalPrompt }] }
                ],
                generationConfig: {
                    maxOutputTokens: length === 'short' ? 150 : (length === 'long' ? 2000 : 800)
                }
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Failed to generate text from Gemini');
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const inputTokens = data.usageMetadata?.promptTokenCount || 0;
        const outputTokens = data.usageMetadata?.candidatesTokenCount || 0;

        return {
            content,
            tokensUsed: inputTokens + outputTokens,
            model: model
        };
    }

    async generateImage({ prompt, resolution }) {
        throw new Error('Gemini generic integration does not natively support image generation.');
    }
}
