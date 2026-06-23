import cron from 'node-cron';
import Cost from '../models/Cost.js';
import Usage from '../models/Usage.js';
import User from '../models/User.js';
import emailService from './emailService.js';
import logger from '../utils/logger.js';
import Memory from '../models/Memory.js';
import { generateWeeklyInsight } from './insight.service.js';

// Initialize Cron Jobs
export const initializeCronJobs = () => {
  // 1. Daily Reset Job: Run at midnight daily (00:00)
  cron.schedule('0 0 * * *', async () => {
    logger.info('⏰ Running Daily Budget and Alert Reset Cron Job...');
    try {
      // Set daily spend to 0, clear daily alerts from alertsSent
      const result = await Cost.updateMany(
        {},
        {
          $set: { dailySpend: 0.0, lastResetDaily: new Date() },
          $pull: { alertsSent: { type: 'daily' } }
        }
      );
      logger.info(`✅ Daily reset completed. Updated ${result.modifiedCount} cost accounts.`);
    } catch (error) {
      logger.error('💥 Error in Daily Reset Cron Job:', error);
    }
  });

  // 2. Monthly Reset & Usage Reports Job: Run at midnight on the 1st of every month (00:00, 1st)
  cron.schedule('0 0 1 * *', async () => {
    logger.info('⏰ Running Monthly Budget Reset and Dispatching Reports...');
    try {
      const startOfLastMonth = new Date();
      startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
      startOfLastMonth.setDate(1);
      startOfLastMonth.setHours(0, 0, 0, 0);

      const endOfLastMonth = new Date();
      endOfLastMonth.setDate(0); // Last day of previous month
      endOfLastMonth.setHours(23, 59, 59, 999);

      // Fetch all users to compile monthly reports
      const users = await User.find({ status: 'active' });

      for (const user of users) {
        // Retrieve usage summary for last month
        const usageStats = await Usage.aggregate([
          {
            $match: {
              user: user._id,
              status: 'success',
              createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
            }
          },
          {
            $group: {
              _id: '$model',
              totalRequests: { $sum: 1 },
              totalTokens: { $sum: '$totalTokens' },
              totalCost: { $sum: '$cost' }
            }
          }
        ]);

        if (usageStats.length > 0) {
          const totalCost = usageStats.reduce((sum, item) => sum + item.totalCost, 0);
          const totalTokens = usageStats.reduce((sum, item) => sum + item.totalTokens, 0);
          const modelBreakdown = usageStats
            .map((item) => `<li><strong>${item._id}</strong>: ${item.totalRequests} reqs, ${item.totalTokens.toLocaleString()} tokens ($${item.totalCost.toFixed(2)})</li>`)
            .join('');

          // Send monthly report email
          await emailService.sendEmail({
            to: user.email,
            subject: `📊 AI Nexus Monthly Cost & Usage Report`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2>Monthly Usage Report</h2>
                <p>Hi ${user.name || 'User'},</p>
                <p>Here is your usage report for last month:</p>
                <ul>
                  <li>Total Spend: <strong>$${totalCost.toFixed(2)} USD</strong></li>
                  <li>Total Tokens Consumed: <strong>${totalTokens.toLocaleString()} tokens</strong></li>
                </ul>
                <h3>Model Breakdown</h3>
                <ul>
                  ${modelBreakdown}
                </ul>
                <p>Thank you for using AI Nexus!</p>
              </div>
            `
          });
        }
      }

      // Reset monthly spend to 0, clear monthly alerts from alertsSent
      const resetResult = await Cost.updateMany(
        {},
        {
          $set: { monthlySpend: 0.0, lastResetMonthly: new Date() },
          $pull: { alertsSent: { type: 'monthly' } }
        }
      );
      logger.info(`✅ Monthly reset completed. Reset ${resetResult.modifiedCount} accounts.`);
    } catch (error) {
      logger.error('💥 Error in Monthly Reset Cron Job:', error);
    }
  });

  // 3. Hourly Alert Sweeper Job: Run at the start of every hour (0 * * * *)
  cron.schedule('0 * * * *', async () => {
    logger.info('⏰ Running Hourly Cost Alert Sweeper...');
    try {
      // Find cost documents where spend is high relative to budget
      const costs = await Cost.find({}).populate('user');
      for (const cost of costs) {
        if (!cost.user || !cost.emailNotifications) continue;

        const monthlyRatio = (cost.monthlySpend / cost.monthlyBudget) * 100;
        const dailyRatio = (cost.dailySpend / cost.dailyBudget) * 100;

        for (const threshold of cost.alertThresholds) {
          // Monthly check
          if (monthlyRatio >= threshold) {
            const alreadySent = cost.alertsSent.some(
              (a) => a.type === 'monthly' && a.threshold === threshold && (Date.now() - new Date(a.sentAt).getTime()) < 24 * 60 * 60 * 1000
            );
            if (!alreadySent) {
              cost.alertsSent.push({
                type: 'monthly',
                threshold,
                amount: cost.monthlySpend,
                sentAt: new Date()
              });
              await cost.save();

              await emailService.sendEmail({
                to: cost.user.email,
                subject: `⚠️ Alert: Monthly AI Spend Limit reached ${threshold}%`,
                html: `<p>Hi ${cost.user.name}, your monthly spend of <strong>$${cost.monthlySpend.toFixed(2)}</strong> has reached ${threshold}% of your budget limit ($${cost.monthlyBudget.toFixed(2)}).</p>`
              });
            }
          }

          // Daily check
          if (dailyRatio >= threshold) {
            const alreadySent = cost.alertsSent.some(
              (a) => a.type === 'daily' && a.threshold === threshold && (Date.now() - new Date(a.sentAt).getTime()) < 24 * 60 * 60 * 1000
            );
            if (!alreadySent) {
              cost.alertsSent.push({
                type: 'daily',
                threshold,
                amount: cost.dailySpend,
                sentAt: new Date()
              });
              await cost.save();

              await emailService.sendEmail({
                to: cost.user.email,
                subject: `⚠️ Alert: Daily AI Spend Limit reached ${threshold}%`,
                html: `<p>Hi ${cost.user.name}, your daily spend of <strong>$${cost.dailySpend.toFixed(2)}</strong> has reached ${threshold}% of your budget limit ($${cost.dailyBudget.toFixed(2)}).</p>`
              });
            }
          }
        }
      }
    } catch (error) {
      logger.error('💥 Error in Hourly Sweeper Cron Job:', error);
    }
  });

  // 4. Memory Cleanup Job: Run at 01:00 AM daily
  cron.schedule('0 1 * * *', async () => {
    logger.info('⏰ Running Memory Cleanup Job...');
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const result = await Memory.deleteMany({
        favorite: false,
        'metadata.autoExtracted': true,
        createdAt: { $lt: ninetyDaysAgo }
      });
      logger.info(`✅ Memory cleanup completed. Removed ${result.deletedCount} old un-favorited memories.`);
    } catch (error) {
      logger.error('💥 Error in Memory Cleanup Cron Job:', error);
    }
  });

  // 5. Weekly Insights Report Job: Run at 00:00 AM every Sunday (0 0 * * 0)
  cron.schedule('0 0 * * 0', async () => {
    logger.info('⏰ Running Weekly Memory Insights Generation...');
    try {
      const activeUsers = await User.find({ status: 'active' });
      for (const user of activeUsers) {
        try {
          await generateWeeklyInsight(user._id);
        } catch (err) {
          logger.error(`💥 Failed to generate weekly insights for user ${user._id}:`, err);
        }
      }
    } catch (error) {
      logger.error('💥 Error in Weekly Insights Cron Job:', error);
    }
  });

  logger.info('⏰ Cron Scheduler Jobs successfully initialized');
};
