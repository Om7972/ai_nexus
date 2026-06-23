import catchAsync from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';
import Usage from '../models/Usage.js';
import Cost from '../models/Cost.js';
import Subscription from '../models/Subscription.js';
import { getOptimizationRecommendations } from '../services/optimization.service.js';

export const getOverview = catchAsync(async (req, res) => {
  const userId = req.user._id;

  // Retrieve user budget details
  let userCost = await Cost.findOne({ user: userId });
  if (!userCost) {
    userCost = await Cost.create({ user: userId });
  }

  // Retrieve user subscription tier
  let userSub = await Subscription.findOne({ user: userId });
  if (!userSub) {
    userSub = await Subscription.create({
      user: userId,
      role: 'Free User',
      tokenLimitMonthly: 50000,
      requestLimitDaily: 100
    });
  }

  // Aggregate user total lifetime stats
  const totalStats = await Usage.aggregate([
    { $match: { user: userId, status: 'success' } },
    {
      $group: {
        _id: null,
        totalTokens: { $sum: '$totalTokens' },
        totalCost: { $sum: '$cost' },
        totalRequests: { $sum: 1 }
      }
    }
  ]);

  // Aggregate most used model
  const modelStats = await Usage.aggregate([
    { $match: { user: userId, status: 'success' } },
    {
      $group: {
        _id: '$model',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);

  // Aggregate cost by feature
  const featureStats = await Usage.aggregate([
    { $match: { user: userId, status: 'success' } },
    {
      $group: {
        _id: '$feature',
        cost: { $sum: '$cost' }
      }
    }
  ]);

  const overviewData = {
    totalTokens: totalStats[0]?.totalTokens || 0,
    totalCost: totalStats[0]?.totalCost || 0,
    totalRequests: totalStats[0]?.totalRequests || 0,
    dailySpend: userCost.dailySpend,
    monthlySpend: userCost.monthlySpend,
    dailyBudget: userCost.dailyBudget,
    monthlyBudget: userCost.monthlyBudget,
    mostUsedModel: modelStats[0]?._id || 'gemini-1.5-flash',
    subscriptionTier: userSub.role,
    tokenLimitMonthly: userSub.tokenLimitMonthly,
    requestLimitDaily: userSub.requestLimitDaily,
    costByFeature: featureStats.map(item => ({
      feature: item._id,
      cost: Number(item.cost.toFixed(4))
    }))
  };

  sendSuccess(res, 200, overviewData, 'Cost overview fetched successfully');
});

export const getAnalytics = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { period = '30d' } = req.query;

  const daysToFetch = period === '7d' ? 7 : period === '14d' ? 14 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysToFetch);
  startDate.setHours(0, 0, 0, 0);

  // Group by day for Line Chart
  const dailyUsage = await Usage.aggregate([
    {
      $match: {
        user: userId,
        status: 'success',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        cost: { $sum: '$cost' },
        tokens: { $sum: '$totalTokens' },
        requests: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Model breakdown for Pie Chart
  const modelBreakdown = await Usage.aggregate([
    {
      $match: {
        user: userId,
        status: 'success',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$model',
        cost: { $sum: '$cost' },
        tokens: { $sum: '$totalTokens' }
      }
    }
  ]);

  // Feature breakdown for Bar Chart
  const featureBreakdown = await Usage.aggregate([
    {
      $match: {
        user: userId,
        status: 'success',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$feature',
        cost: { $sum: '$cost' },
        tokens: { $sum: '$totalTokens' }
      }
    }
  ]);

  const analyticsData = {
    daily: dailyUsage.map(item => ({
      date: item._id,
      cost: Number(item.cost.toFixed(4)),
      tokens: item.tokens,
      requests: item.requests
    })),
    models: modelBreakdown.map(item => ({
      model: item._id,
      cost: Number(item.cost.toFixed(4)),
      tokens: item.tokens
    })),
    features: featureBreakdown.map(item => ({
      feature: item._id,
      cost: Number(item.cost.toFixed(4)),
      tokens: item.tokens
    }))
  };

  sendSuccess(res, 200, analyticsData, 'Usage and cost analytics fetched successfully');
});

export const updateBudget = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { dailyBudget, monthlyBudget, emailNotifications, alertThresholds } = req.body;

  let userCost = await Cost.findOne({ user: userId });
  if (!userCost) {
    userCost = new Cost({ user: userId });
  }

  if (dailyBudget !== undefined) userCost.dailyBudget = Number(dailyBudget);
  if (monthlyBudget !== undefined) userCost.monthlyBudget = Number(monthlyBudget);
  if (emailNotifications !== undefined) userCost.emailNotifications = Boolean(emailNotifications);
  if (alertThresholds !== undefined) userCost.alertThresholds = alertThresholds;

  await userCost.save();

  sendSuccess(res, 200, userCost, 'Budgets successfully updated');
});

export const getRecommendations = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const recommendations = await getOptimizationRecommendations(userId);
  sendSuccess(res, 200, recommendations, 'Smart suggestions retrieved successfully');
});
