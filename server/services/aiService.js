import TextGeneration from '../models/TextGeneration.js';
import ImageAsset from '../models/ImageAsset.js';
import AppError from '../utils/AppError.js';
import { aiManager } from './aiProviders/index.js';

/**
 * Generate text using a requested AI model.
 * Real implementation routing via the AI Provider Abstraction Layer (aiManager).
 */
export const generateText = async ({ prompt, tone, model, length, userId }) => {
    const generationResult = await aiManager.generateText({ prompt, tone, model, length });

    // Save to MongoDB
    const textGenRecord = await TextGeneration.create({
        user: userId,
        prompt,
        tone,
        model: generationResult.model,
        length,
        content: generationResult.content,
        tokensUsed: Math.floor(generationResult.tokensUsed)
    });

    return {
        id: textGenRecord._id,
        content: textGenRecord.content,
        tokensUsed: textGenRecord.tokensUsed,
        model: textGenRecord.model,
        createdAt: textGenRecord.createdAt,
        wasFallback: generationResult.wasFallback
    };
};

export const getHistory = async (userId) => {
    const history = await TextGeneration.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50);
    return history;
};

export const generateImage = async ({ prompt, resolution, model, userId }) => {
    const generationResult = await aiManager.generateImage({ prompt, resolution, model });

    const imageGenRecord = await ImageAsset.create({
        user: userId,
        prompt,
        type: 'generation',
        toolUsed: generationResult.toolUsed || model || 'dall-e-3',
        processedImageUrl: generationResult.imageUrl,
        resolution: generationResult.resolution || resolution
    });

    return imageGenRecord;
};

export const processImage = async ({ file, tool, prompt, resolution, userId, req }) => {
    // file is provided by multer locally
    const originalUrl = `${req.protocol}://${req.get('host')}/api/v1/uploads/${file.filename}`;

    // Simulating processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // In a real app we would call an AI endpoint using the originalUrl or buffer. 
    // Here we'll just mock a processed result using another unsplash image or just returning the same as "processed" to simulate effect
    const processedImageUrl = `https://picsum.photos/seed/${file.filename}/800/800`;

    const imageProcessRecord = await ImageAsset.create({
        user: userId,
        prompt,
        type: 'processing',
        toolUsed: tool,
        originalImageUrl: originalUrl,
        processedImageUrl: processedImageUrl,
        format: file.mimetype.split('/')[1],
        size: file.size,
        resolution: resolution || 'Original'
    });

    return imageProcessRecord;
};

export const getImageHistory = async (userId) => {
    return await ImageAsset.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50);
};
