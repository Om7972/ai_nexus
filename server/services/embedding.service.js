import logger from '../utils/logger.js';

/**
 * Generate semantic embedding vector for a piece of text
 * @param {string} text - Content to vectorize
 * @returns {Promise<number[]>} - High-dimensional vector array
 */
export async function generateEmbedding(text) {
  if (!text || typeof text !== 'string') {
    return generateMockEmbedding('empty');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.warn('[Embedding Service] GEMINI_API_KEY is missing. Using mock embeddings.');
    return generateMockEmbedding(text);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: {
          parts: [{ text }]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google API returned status ${response.status}`);
    }

    const data = await response.json();
    if (data.embedding?.values) {
      return data.embedding.values;
    }
    
    throw new Error('Response did not contain embedding values');
  } catch (error) {
    logger.error(`[Embedding Service] API generation failed: ${error.message}. Falling back to mock vector.`);
    return generateMockEmbedding(text);
  }
}

/**
 * Generates a normalized, seed-deterministic vector mockup
 * @param {string} text - Input text
 * @returns {number[]} - Normalized float array
 */
function generateMockEmbedding(text) {
  const size = 768; // Matches Gemini's text-embedding-004 standard
  const values = new Array(size);
  
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  for (let i = 0; i < size; i++) {
    const seed = Math.sin(hash + i) * 10000;
    values[i] = seed - Math.floor(seed);
  }

  // L2 Normalization
  const magnitude = Math.sqrt(values.reduce((sum, v) => sum + v * v, 0)) || 1;
  return values.map(v => v / magnitude);
}
