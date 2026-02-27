import * as aiService from '../services/aiService.js';
import catchAsync from '../utils/catchAsync.js';

export const generateText = catchAsync(async (req, res, next) => {
    const { prompt, tone, model, length } = req.body;
    const userId = req.user.id;

    // Call service to process parameters and interact with API/DB
    const result = await aiService.generateText({ prompt, tone, model, length, userId });

    res.status(200).json({
        success: true,
        data: result,
    });
});

export const getHistory = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const history = await aiService.getHistory(userId);

    res.status(200).json({
        success: true,
        count: history.length,
        data: history,
    });
});

export const generateImage = catchAsync(async (req, res, next) => {
    const { prompt, resolution, model } = req.body;
    const userId = req.user.id;

    const result = await aiService.generateImage({ prompt, resolution, model, userId });

    res.status(200).json({
        success: true,
        data: result,
    });
});

export const processImage = catchAsync(async (req, res, next) => {
    const { tool, prompt, resolution } = req.body;
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ success: false, message: 'Image file is required.' });
    }

    const result = await aiService.processImage({ file, tool, prompt, resolution, userId, req });

    res.status(200).json({
        success: true,
        data: result,
    });
});

export const getImageHistory = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const history = await aiService.getImageHistory(userId);

    res.status(200).json({
        success: true,
        count: history.length,
        data: history,
    });
});
