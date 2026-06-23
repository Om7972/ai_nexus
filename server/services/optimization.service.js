import crypto from 'crypto';
import Usage from '../models/Usage.js';
import { getCheaperModelRecommendation } from './costCalculator.service.js';

// Simple In-Memory prompt cache
const PROMPT_CACHE = new Map();

// Helper to hash prompts for fast lookup
const getPromptHash = (model, feature, prompt) => {
  const data = `${model}:${feature}:${prompt}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

export const cacheResponse = (model, feature, prompt, response) => {
  const hash = getPromptHash(model, feature, prompt);
  PROMPT_CACHE.set(hash, {
    response,
    cachedAt: new Date()
  });

  // Limit cache size to 1000 items (simple eviction)
  if (PROMPT_CACHE.size > 1000) {
    const oldestKey = PROMPT_CACHE.keys().next().value;
    PROMPT_CACHE.delete(oldestKey);
  }
};

export const getCachedResponse = (model, feature, prompt) => {
  const hash = getPromptHash(model, feature, prompt);
  if (PROMPT_CACHE.has(hash)) {
    const entry = PROMPT_CACHE.get(hash);
    // Evict after 30 minutes
    if (Date.now() - entry.cachedAt.getTime() < 30 * 60 * 1000) {
      return entry.response;
    } else {
      PROMPT_CACHE.delete(hash);
    }
  }
  return null;
};

export const getOptimizationRecommendations = async (userId) => {
  try {
    // Group usage by model & feature to find high-cost items
    const stats = await Usage.aggregate([
      { $match: { user: userId, status: 'success' } },
      {
        $group: {
          _id: { model: '$model', feature: '$feature' },
          totalRequests: { $sum: 1 },
          totalTokens: { $sum: '$totalTokens' },
          totalCost: { $sum: '$cost' }
        }
      },
      { $sort: { totalCost: -1 } }
    ]);

    const recommendations = [];

    for (const item of stats) {
      const rec = getCheaperModelRecommendation(item._id.model);
      if (rec) {
        const potentialSavings = item.totalCost * (rec.savingsPercent / 100);
        recommendations.push({
          feature: item._id.feature,
          currentModel: item._id.model,
          recommendedModel: rec.alternative,
          currentCost: item.totalCost,
          potentialSavings,
          savingsPercent: rec.savingsPercent,
          reason: rec.reason
        });
      }
    }

    // Add general recommendations if list is empty
    if (recommendations.length === 0) {
      recommendations.push({
        feature: 'General',
        currentModel: 'gemini-1.5-pro',
        recommendedModel: 'gemini-1.5-flash',
        currentCost: 0,
        potentialSavings: 0,
        savingsPercent: 95,
        reason: 'Using Gemini 1.5 Flash instead of Pro saves up to 95% of token expenses for simple tasks such as short text generation and translations.'
      });
    }

    return recommendations;
  } catch (error) {
    console.error('Error generating optimization recommendations:', error);
    throw error;
  }
};

export const executeWithAutoFallback = async (model, fallbackModel, apiCallFn) => {
  try {
    // Attempt execution with primary model choice
    return await apiCallFn(model);
  } catch (error) {
    console.warn(`Primary model ${model} execution failed, trying fallback ${fallbackModel}:`, error.message);
    // Auto-fallback execution path
    return await apiCallFn(fallbackModel);
  }
};
