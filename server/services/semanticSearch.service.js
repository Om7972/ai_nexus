import Memory from '../models/Memory.js';
import { generateEmbedding } from './embedding.service.js';
import logger from '../utils/logger.js';

/**
 * Calculates cosine similarity between two numeric vectors
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number} - Similarity score between -1 and 1
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

/**
 * Performs semantic similarity vector search over Mongoose memories
 * @param {object} options
 * @param {string} options.userId - User owning memories
 * @param {string} options.query - User search string
 * @param {string} [options.category] - Filter category
 * @param {number} [options.limit=10] - Result cap
 * @returns {Promise<Array>} - Rated memories list
 */
export async function searchUserMemories({ userId, query, category, limit = 10 }) {
  try {
    const queryEmbedding = await generateEmbedding(query);
    
    // Query filter
    const filter = { user: userId };
    if (category) {
      filter.category = category;
    }

    // Retrieve memories containing embeddings
    const candidates = await Memory.find(filter).lean();
    
    const results = candidates
      .map(mem => {
        let score = 0;
        if (mem.embedding && mem.embedding.length === queryEmbedding.length) {
          score = cosineSimilarity(queryEmbedding, mem.embedding);
        } else {
          // Fallback to text matching if embedding is missing
          score = mem.content.toLowerCase().includes(query.toLowerCase()) ? 0.3 : 0;
        }
        return { ...mem, score };
      })
      .filter(mem => mem.score > 0.15) // Similarity cutoff threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return results;
  } catch (error) {
    logger.error(`[Semantic Search] Failed: ${error.message}`);
    throw error;
  }
}
