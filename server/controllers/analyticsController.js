import catchAsync from '../utils/catchAsync.js';
import * as analyticsService from '../services/analyticsService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getOverview = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    const data = await analyticsService.getDashboardOverview(req.user._id, startDate, endDate);
    sendSuccess(res, 200, data, 'Overview fetched successfully');
});

export const getUsageStats = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    const data = await analyticsService.getUsageData(req.user._id, startDate, endDate);
    sendSuccess(res, 200, data, 'Usage statistics fetched successfully');
});
