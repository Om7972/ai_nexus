import Memory from '../models/Memory.js';
import Goal from '../models/Goal.js';
import MemoryProject from '../models/MemoryProject.js';
import Insight from '../models/Insight.js';
import { aiManager } from './aiProviders/index.js';
import logger from '../utils/logger.js';

/**
 * Compiles a weekly summary report based on recent memories, goals, and projects
 */
export async function generateWeeklyInsight(userId) {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Retrieve active details
    const recentMemories = await Memory.find({ user: userId, createdAt: { $gte: oneWeekAgo } }).select('category content tags').lean();
    const activeGoals = await Goal.find({ user: userId, status: 'active' }).lean();
    const projects = await MemoryProject.find({ user: userId }).lean();

    const summaryInput = {
      recentMemories: recentMemories.map(m => `[${m.category}] ${m.content} (tags: ${m.tags.join(',')})`),
      activeGoals: activeGoals.map(g => `${g.title} (Progress: ${g.progress}%)`),
      activeProjects: projects.map(p => `${p.name}: ${p.description} (status: ${p.status})`)
    };

    const prompt = `You are a productivity insights coach. Analyze the user's weekly activities and goals details:
${JSON.stringify(summaryInput, null, 2)}

Produce a concise weekly insights report containing:
1. Executive Summary of focus areas
2. Top 3 suggestions for next steps
3. Suggested next action list for their goals

Format your output in clean Markdown.`;

    const aiRes = await aiManager.generateText({
      prompt,
      model: 'gemini-1.5-flash',
      userId,
      feature: 'memory-center'
    });

    const newInsight = await Insight.create({
      user: userId,
      type: 'weekly',
      content: aiRes.content,
      score: 95,
      metadata: { period: 'weekly' }
    });

    return newInsight;
  } catch (error) {
    logger.error(`[Insight Service] Weekly generation failed: ${error.message}`);
    throw error;
  }
}

/**
 * Computes next actions based on goals
 */
export async function generateGoalActionSuggestions(userId, goalId) {
  try {
    const goal = await Goal.findOne({ user: userId, _id: goalId });
    if (!goal) throw new Error('Goal not found');

    const prompt = `For the following goal: "${goal.title}" (Status: ${goal.status}, Current Progress: ${goal.progress}%).
Suggest 3-5 specific, small, actionable next steps to complete this goal.
Return only a JSON array of strings. Example: ["Step 1", "Step 2"]`;

    const aiRes = await aiManager.generateText({
      prompt,
      model: 'gemini-1.5-flash',
      userId,
      feature: 'memory-center'
    });

    const cleanJson = aiRes.content.trim().replace(/^```json\s*/i, '').replace(/```$/, '');
    const steps = JSON.parse(cleanJson || '[]');

    goal.nextActions = steps;
    await goal.save();
    return goal;
  } catch (error) {
    logger.error(`[Insight Service] Goal suggestion failed: ${error.message}`);
    return null;
  }
}
