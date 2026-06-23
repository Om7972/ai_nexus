import Memory from '../models/Memory.js';
import { generateEmbedding } from './embedding.service.js';
import { aiManager } from './aiProviders/index.js';
import logger from '../utils/logger.js';

/**
 * Creates and vectorizes a new memory entry
 */
export async function createMemory(userId, { category, content, tags = [], favorite = false, metadata = {} }) {
  try {
    const embedding = await generateEmbedding(content);
    
    const memory = await Memory.create({
      user: userId,
      category,
      content,
      embedding,
      tags,
      favorite,
      metadata
    });

    return memory;
  } catch (error) {
    logger.error(`[Memory Service] Create failed: ${error.message}`);
    throw error;
  }
}

/**
 * Scans text content, extracts key user preferences or facts, and indexes them
 * @param {string} userId
 * @param {string} textText
 */
export async function autoRememberInformation(userId, textText) {
  if (!textText || textText.trim().length < 15) return [];

  const extractionPrompt = `You are a memory synthesis agent. Read this content and identify any details that are worth remembering long-term (e.g. personal preferences, project names/details, saved prompt templates, goals, or general knowledge snippets).
Return a JSON array strictly. Each object must have:
- category: String (one of: "preference", "project", "prompt", "goal", "snippet")
- content: String (the fact written in third person, e.g. "User prefers dark mode layouts")
- tags: Array of Strings

Content to scan:
"${textText}"

Output ONLY a valid JSON array. If nothing is found, output [].`;

  try {
    const aiResponse = await aiManager.generateText({
      prompt: extractionPrompt,
      model: 'gemini-1.5-flash',
      userId,
      feature: 'memory-center'
    });

    const cleanJson = aiResponse.content.trim().replace(/^```json\s*/i, '').replace(/```$/, '');
    const facts = JSON.parse(cleanJson || '[]');

    const createdMemories = [];
    for (const fact of facts) {
      if (fact.category && fact.content) {
        const memory = await createMemory(userId, {
          category: fact.category.toLowerCase(),
          content: fact.content,
          tags: fact.tags || [],
          metadata: { autoExtracted: true, sourceSnippet: textText.slice(0, 100) }
        });
        createdMemories.push(memory);
      }
    }

    if (createdMemories.length > 0) {
      logger.info(`[Memory Service] Auto-remembered ${createdMemories.length} facts for user: ${userId}`);
    }

    return createdMemories;
  } catch (error) {
    logger.error(`[Memory Service] Auto-remember failed: ${error.message}`);
    return [];
  }
}
