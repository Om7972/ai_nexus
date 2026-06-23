import Usage from '../models/Usage.js';
import Cost from '../models/Cost.js';
import Subscription from '../models/Subscription.js';
import { calculateCost } from './costCalculator.service.js';
import emailService from './emailService.js';
import User from '../models/User.js';

export const trackUsage = async ({
  userId,
  model,
  feature,
  promptTokens = 0,
  completionTokens = 0,
  latency = 0,
  status = 'success',
  errorMessage = null
}) => {
  try {
    const costAmount = calculateCost(model, promptTokens, completionTokens);
    const totalTokens = promptTokens + completionTokens;

    // Create the Usage log entry
    const usage = await Usage.create({
      user: userId,
      model,
      feature,
      promptTokens,
      completionTokens,
      totalTokens,
      cost: costAmount,
      latency,
      status,
      errorMessage
    });

    // If request failed, only update usage log but skip budget deductions
    if (status === 'failed') {
      return usage;
    }

    // Load or create User Cost budget details
    let userCost = await Cost.findOne({ user: userId });
    if (!userCost) {
      userCost = await Cost.create({ user: userId });
    }

    // Increment spends
    userCost.dailySpend += costAmount;
    userCost.monthlySpend += costAmount;
    await userCost.save();

    // Check budget alert levels and email notifications
    await checkBudgetAlerts(userId, userCost);

    return usage;
  } catch (error) {
    console.error('Error logging usage trace:', error);
    throw error;
  }
};

export const verifySubscriptionLimits = async (userId) => {
  // Retrieve subscription limits
  let sub = await Subscription.findOne({ user: userId });
  if (!sub) {
    // If not found, assign Free tier by default
    sub = await Subscription.create({
      user: userId,
      role: 'Free User',
      tokenLimitMonthly: 50000,
      requestLimitDaily: 100
    });
  }

  if (sub.status !== 'active') {
    throw new Error('Your subscription is currently inactive or suspended. Please update subscription details.');
  }

  // Get user cost/spend info
  let userCost = await Cost.findOne({ user: userId });
  if (!userCost) {
    userCost = await Cost.create({ user: userId });
  }

  // Check if daily spend exceeds budget limits
  if (userCost.dailySpend >= userCost.dailyBudget) {
    throw new Error(`Daily cost budget limit exceeded ($${userCost.dailySpend.toFixed(2)} / $${userCost.dailyBudget.toFixed(2)}). Please increase your Daily Budget in the Cost Center.`);
  }

  // Check if monthly spend exceeds budget limits
  if (userCost.monthlySpend >= userCost.monthlyBudget) {
    throw new Error(`Monthly cost budget limit exceeded ($${userCost.monthlySpend.toFixed(2)} / $${userCost.monthlyBudget.toFixed(2)}). Please upgrade your Monthly Budget limit.`);
  }

  // Check usage constraints from subscription tier
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Retrieve current token counts for current month
  const monthlyLogs = await Usage.aggregate([
    {
      $match: {
        user: userId,
        status: 'success',
        createdAt: { $gte: startOfMonth }
      }
    },
    {
      $group: {
        _id: null,
        tokens: { $sum: '$totalTokens' },
        requests: { $sum: 1 }
      }
    }
  ]);

  // Retrieve today's request count
  const dailyLogs = await Usage.countDocuments({
    user: userId,
    status: 'success',
    createdAt: { $gte: startOfToday }
  });

  const totalTokensUsed = monthlyLogs[0]?.tokens || 0;

  if (totalTokensUsed >= sub.tokenLimitMonthly) {
    throw new Error(`Monthly token allocation exhausted (${totalTokensUsed.toLocaleString()} / ${sub.tokenLimitMonthly.toLocaleString()}). Please upgrade subscription tier in the Cost Center.`);
  }

  if (dailyLogs >= sub.requestLimitDaily) {
    throw new Error(`Daily request volume limit reached (${dailyLogs} / ${sub.requestLimitDaily}). Please try again tomorrow or upgrade your account.`);
  }

  return {
    role: sub.role,
    monthlyLimit: sub.tokenLimitMonthly,
    tokensUsed: totalTokensUsed,
    dailyLimit: sub.requestLimitDaily,
    requestsUsed: dailyLogs
  };
};

const checkBudgetAlerts = async (userId, userCost) => {
  if (!userCost.emailNotifications) return;

  const user = await User.findById(userId);
  if (!user) return;

  const monthlyThresholdRatio = (userCost.monthlySpend / userCost.monthlyBudget) * 100;
  const dailyThresholdRatio = (userCost.dailySpend / userCost.dailyBudget) * 100;

  // Evaluate thresholds to see if alerts should be sent
  for (const percent of userCost.alertThresholds) {
    // Check monthly budget threshold
    if (monthlyThresholdRatio >= percent) {
      const alreadySent = userCost.alertsSent.some(
        (a) => a.type === 'monthly' && a.threshold === percent && (Date.now() - new Date(a.sentAt).getTime()) < 24 * 60 * 60 * 1000
      );

      if (!alreadySent) {
        userCost.alertsSent.push({
          type: 'monthly',
          threshold: percent,
          amount: userCost.monthlySpend,
          sentAt: new Date()
        });
        await userCost.save();

        // Dispatch email
        await emailService.sendEmail({
          to: user.email,
          subject: `⚠️ Alert: AI Nexus Monthly Budget reached ${percent}%`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2>Budget Alert notification</h2>
              <p>Hi ${user.name || 'User'},</p>
              <p>Your AI Nexus monthly spend has crossed <strong>${percent}%</strong> of your set budget limit.</p>
              <ul>
                <li>Current monthly spend: <strong>$${userCost.monthlySpend.toFixed(2)} USD</strong></li>
                <li>Monthly Budget Target: <strong>$${userCost.monthlyBudget.toFixed(2)} USD</strong></li>
              </ul>
              <p>To ensure uninterrupted service, please review your active pipelines or adjust budget limits in the Cost Center.</p>
            </div>
          `
        });
      }
    }

    // Check daily budget threshold
    if (dailyThresholdRatio >= percent) {
      const alreadySent = userCost.alertsSent.some(
        (a) => a.type === 'daily' && a.threshold === percent && (Date.now() - new Date(a.sentAt).getTime()) < 24 * 60 * 60 * 1000
      );

      if (!alreadySent) {
        userCost.alertsSent.push({
          type: 'daily',
          threshold: percent,
          amount: userCost.dailySpend,
          sentAt: new Date()
        });
        await userCost.save();

        // Dispatch email
        await emailService.sendEmail({
          to: user.email,
          subject: `⚠️ Alert: AI Nexus Daily Budget reached ${percent}%`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2>Budget Alert notification</h2>
              <p>Hi ${user.name || 'User'},</p>
              <p>Your AI Nexus daily spend has crossed <strong>${percent}%</strong> of your set budget limit.</p>
              <ul>
                <li>Current daily spend: <strong>$${userCost.dailySpend.toFixed(2)} USD</strong></li>
                <li>Daily Budget Target: <strong>$${userCost.dailyBudget.toFixed(2)} USD</strong></li>
              </ul>
              <p>To avoid workflow delays, please check your settings or update limits in the Cost Center.</p>
            </div>
          `
        });
      }
    }
  }
};
