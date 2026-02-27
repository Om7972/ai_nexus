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
