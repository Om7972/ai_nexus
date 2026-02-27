import TextGeneration from '../models/TextGeneration.js';
import AppError from '../utils/AppError.js';

/**
 * Generate text using a requested AI model.
 * Stub/Mock implementation with fallback to real API if keys are provided.
 */
export const generateText = async ({ prompt, tone, model, length, userId }) => {
    let generatedContent = '';
    let tokensUsed = 0;

    // A real implementation would conditionally call OpenAI/Anthropic/Gemini APIs here:
    // const apiKey = process.env.OPENAI_API_KEY;
    // if (!apiKey) ... (fallback to mock or throw error)

    // For this demonstration, we'll provide a high-quality simulated response based on the inputs
    // using a timeout to simulate network latency, since proper API keys may not be present yet.
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulated content generation based on tone and length
    const getSimulatedLength = (len) => {
        if (len === 'short') return 'Here is a brief, concise response.';
        if (len === 'long') return 'Here is a very detailed, comprehensive response containing multiple paragraphs and deep insights on the topic you asked about, expanding the scope as requested.';
        return 'Here is a moderately detailed response covering the key points efficiently.';
    };

    const getSimulatedTone = (t) => {
        switch (t.toLowerCase()) {
            case 'casual': return `Hey there! Sure thing, let's talk about it.`;
            case 'creative': return `Imagine a world where your ideas take flight. Let's explore your prompt creatively.`;
            case 'technical': return `Analyzing the input parameters... The system architectural requirements dictate:`;
            case 'professional':
            default: return `Thank you for your inquiry. Below is the professional analysis based on your prompt.`;
        }
    };

    generatedContent = `${getSimulatedTone(tone)}

${getSimulatedLength(length)}

Regarding your prompt: "${prompt}"

(Simulated AI output generated using the selected model: ${model}). In a production environment with valid API keys for OpenAI/Claude/Gemini configured in the .env file, this text would be replaced by the actual model's response.`;

    // Simulate token count
    tokensUsed = Math.floor(Math.random() * 200) + 50 + (prompt.length / 4);

    // Save to MongoDB
    const textGenRecord = await TextGeneration.create({
        user: userId,
        prompt,
        tone,
        model,
        length,
        content: generatedContent,
        tokensUsed: Math.floor(tokensUsed)
    });

    return {
        id: textGenRecord._id,
        content: textGenRecord.content,
        tokensUsed: textGenRecord.tokensUsed,
        model: textGenRecord.model,
        createdAt: textGenRecord.createdAt
    };
};

export const getHistory = async (userId) => {
    const history = await TextGeneration.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50);
    return history;
};
