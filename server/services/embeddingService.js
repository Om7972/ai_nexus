import axios from 'axios';

/**
 * Service for generating embeddings
 */
export class EmbeddingService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = 'text-embedding-ada-002';
    this.dimensions = 1536;
    this.cache = new Map(); // Simple in-memory cache
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text) {
    // Check cache first
    const cacheKey = this.getCacheKey(text);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // If API key is not set, return mock embedding
      if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
        console.warn('OpenAI API key not set. Using mock embeddings.');
        return this.generateMockEmbedding(text);
      }

      const response = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
          input: text,
          model: this.model
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const embedding = response.data.data[0].embedding;

      // Cache the result
      this.cache.set(cacheKey, embedding);

      return embedding;
    } catch (error) {
      console.error('Embedding generation error:', error.message);
      // Fallback to mock embedding
      return this.generateMockEmbedding(text);
    }
  }

  /**
   * Generate embeddings for multiple texts (batch)
   */
  async generateEmbeddings(texts) {
    // Process in batches of 20 (OpenAI limit)
    const batchSize = 20;
    const embeddings = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      try {
        if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
          const batchEmbeddings = batch.map(text => this.generateMockEmbedding(text));
          embeddings.push(...batchEmbeddings);
          continue;
        }

        const response = await axios.post(
          'https://api.openai.com/v1/embeddings',
          {
            input: batch,
            model: this.model
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const batchEmbeddings = response.data.data.map(item => item.embedding);
        embeddings.push(...batchEmbeddings);

        // Cache results
        batch.forEach((text, idx) => {
          const cacheKey = this.getCacheKey(text);
          this.cache.set(cacheKey, batchEmbeddings[idx]);
        });

        // Rate limiting - wait 1 second between batches
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Batch embedding generation error:', error.message);
        // Fallback to mock embeddings for failed batch
        const mockBatch = batch.map(text => this.generateMockEmbedding(text));
        embeddings.push(...mockBatch);
      }
    }

    return embeddings;
  }

  /**
   * Generate mock embedding for development/testing
   */
  generateMockEmbedding(text) {
    // Generate deterministic mock embedding based on text
    const vector = new Array(this.dimensions).fill(0);
    
    // Use simple hash to create pseudo-random but consistent values
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const index = (charCode * i) % this.dimensions;
      vector[index] = (vector[index] + Math.sin(charCode)) / 2;
    }

    // Normalize vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => magnitude > 0 ? val / magnitude : val);
  }

  /**
   * Generate cache key from text
   */
  getCacheKey(text) {
    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `${this.model}_${hash}`;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize() {
    return this.cache.size;
  }
}

// Singleton instance
const embeddingService = new EmbeddingService();

export default embeddingService;
