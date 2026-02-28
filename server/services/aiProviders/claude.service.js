export class ClaudeAIProvider {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.anthropic.com/v1';
    }

    async generateText({ prompt, model = 'claude-3-opus-20240229', tone, length }) {
        if (!this.apiKey) throw new Error('Anthropic API Key is missing. Please set ANTHROPIC_API_KEY in .env');

        let systemPrompt = `You are a helpful AI assistant.`;
        if (tone) systemPrompt += ` Please respond in a ${tone} tone.`;
        if (length === 'short') systemPrompt += ` Keep the response very concise and brief.`;
        if (length === 'long') systemPrompt += ` Provide a very detailed and comprehensive response.`;

        const max_tokens = length === 'short' ? 150 : (length === 'long' ? 2000 : 800);

        const response = await fetch(`${this.baseUrl}/messages`, {
            method: 'POST',
            headers: {
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                max_tokens,
                system: systemPrompt,
                messages: [
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Failed to generate text from Claude');
        }

        const data = await response.json();
        return {
            content: data.content[0].text,
            tokensUsed: data.usage.input_tokens + data.usage.output_tokens,
            model: data.model
        };
    }

    async generateImage({ prompt, resolution }) {
        throw new Error('Claude does not natively support image generation.');
    }
}
