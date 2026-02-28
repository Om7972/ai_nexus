export class OpenAIAIProvider {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.openai.com/v1';
    }

    async generateText({ prompt, model = 'gpt-4o', tone, length }) {
        if (!this.apiKey) throw new Error('OpenAI API Key is missing. Please set OPENAI_API_KEY in .env');

        let systemPrompt = `You are a helpful AI assistant.`;
        if (tone) systemPrompt += ` Please respond in a ${tone} tone.`;
        if (length === 'short') systemPrompt += ` Keep the response very concise and brief.`;
        if (length === 'long') systemPrompt += ` Provide a very detailed and comprehensive response.`;

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                max_tokens: length === 'short' ? 150 : (length === 'long' ? 2000 : 800)
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Failed to generate text from OpenAI');
        }

        const data = await response.json();
        return {
            content: data.choices[0].message.content,
            tokensUsed: data.usage.total_tokens,
            model: data.model
        };
    }

    async generateImage({ prompt, resolution = '1024x1024' }) {
        if (!this.apiKey) throw new Error('OpenAI API Key is missing. Please set OPENAI_API_KEY in .env');

        const response = await fetch(`${this.baseUrl}/images/generations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'dall-e-3',
                prompt,
                n: 1,
                size: resolution
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Failed to generate image from OpenAI');
        }

        const data = await response.json();
        return {
            imageUrl: data.data[0].url,
            toolUsed: 'dall-e-3',
            resolution
        };
    }
}
