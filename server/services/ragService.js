import Embedding from '../models/Embedding.js';
import ChatSession from '../models/ChatSession.js';
import embeddingService from './embeddingService.js';
import axios from 'axios';

/**
 * RAG (Retrieval-Augmented Generation) Service
 */
export class RAGService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = 'gpt-4';
  }

  /**
   * Search for relevant chunks using semantic similarity
   */
  async semanticSearch(query, fileIds = null, limit = 5, threshold = 0.7) {
    // Generate embedding for query
    const queryVector = await embeddingService.generateEmbedding(query);

    // Find similar embeddings
    const results = await Embedding.findSimilar(queryVector, fileIds, limit, threshold);

    return results.map(r => ({
      chunkId: r.chunk._id,
      fileId: r.chunk.file._id,
      filename: r.chunk.file.filename,
      content: r.chunk.content,
      similarity: r.similarity,
      metadata: r.chunk.metadata
    }));
  }

  /**
   * Generate answer using RAG pipeline
   */
  async chat(sessionId, userMessage, fileIds = null) {
    try {
      // Get or create chat session
      let session = sessionId ? await ChatSession.findById(sessionId) : null;
      
      if (!session && fileIds) {
        session = await ChatSession.create({
          user: fileIds[0], // Assuming userId is passed
          files: fileIds
        });
      }

      // Step 1: Semantic search for relevant context
      const searchResults = await this.semanticSearch(userMessage, fileIds, 5, 0.65);

      // Step 2: Build context from search results
      const context = this.buildContext(searchResults);

      // Step 3: Create messages for LLM
      const messages = this.buildMessages(session, userMessage, context);

      // Step 4: Call LLM
      const response = await this.callLLM(messages);

      // Step 5: Extract sources for citation
      const sources = searchResults.map(r => ({
        chunk: r.chunkId,
        file: r.fileId,
        similarity: r.similarity,
        content: r.content.substring(0, 200) + '...'
      }));

      // Step 6: Save messages to session
      if (session) {
        await session.addMessage('user', userMessage);
        await session.addMessage('assistant', response.content, sources, response.tokenUsage);
      }

      return {
        answer: response.content,
        sources: searchResults,
        tokenUsage: response.tokenUsage,
        sessionId: session?._id
      };

    } catch (error) {
      console.error('RAG chat error:', error);
      throw new Error(`Chat failed: ${error.message}`);
    }
  }

  /**
   * Build context string from search results
   */
  buildContext(searchResults) {
    if (searchResults.length === 0) {
      return 'No relevant context found in the knowledge base.';
    }

    const contextParts = searchResults.map((result, index) => {
      return `[Source ${index + 1}] (${result.filename}, similarity: ${result.similarity.toFixed(2)})\n${result.content}`;
    });

    return contextParts.join('\n\n---\n\n');
  }

  /**
   * Build message array for LLM
   */
  buildMessages(session, userMessage, context) {
    const messages = [];

    // System message with RAG instructions
    messages.push({
      role: 'system',
      content: `You are a helpful AI assistant that answers questions based on the provided context from documents. 

Instructions:
- Answer the question using ONLY the information from the provided context
- If the context doesn't contain enough information, say so clearly
- Cite sources using [Source N] notation when referencing specific information
- Be concise but thorough
- If asked about something not in the context, state that it's not in the available documents

Context:
${context}`
    });

    // Add previous conversation history (last 5 messages for context window management)
    if (session && session.messages.length > 0) {
      const recentMessages = session.messages.slice(-5);
      recentMessages.forEach(msg => {
        if (msg.role !== 'system') {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    return messages;
  }

  /**
   * Call LLM API
   */
  async callLLM(messages) {
    // Check if API key is configured
    if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
      console.warn('OpenAI API key not set. Using mock response.');
      return this.generateMockResponse(messages);
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        content: response.data.choices[0].message.content,
        tokenUsage: {
          prompt: response.data.usage.prompt_tokens,
          completion: response.data.usage.completion_tokens,
          total: response.data.usage.total_tokens
        }
      };
    } catch (error) {
      console.error('LLM call error:', error.message);
      return this.generateMockResponse(messages);
    }
  }

  /**
   * Generate mock response for development
   */
  generateMockResponse(messages) {
    const lastMessage = messages[messages.length - 1];
    const context = messages.find(m => m.role === 'system')?.content || '';
    
    const hasContext = context.includes('[Source');
    
    let response = '';
    if (hasContext) {
      response = `Based on the provided documents, here's what I found:\n\n`;
      response += `Regarding your question: "${lastMessage.content}"\n\n`;
      response += `According to [Source 1], this information is available in the knowledge base. `;
      response += `The documents suggest relevant insights that address your query.\n\n`;
      response += `Note: This is a mock response. Configure OpenAI API key for actual AI responses.`;
    } else {
      response = `I don't have enough context in the knowledge base to answer that question. Please upload relevant documents first.\n\n`;
      response += `Note: This is a mock response. Configure OpenAI API key for actual AI responses.`;
    }

    return {
      content: response,
      tokenUsage: {
        prompt: 100,
        completion: 50,
        total: 150
      }
    };
  }

  /**
   * Get chat history
   */
  async getChatHistory(sessionId) {
    const session = await ChatSession.findById(sessionId)
      .populate('files', 'filename originalName')
      .lean();

    return session;
  }

  /**
   * List chat sessions for user
   */
  async listChatSessions(userId, limit = 20) {
    const sessions = await ChatSession.find({ user: userId, isActive: true })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate('files', 'filename originalName')
      .lean();

    return sessions;
  }

  /**
   * Delete chat session
   */
  async deleteChatSession(sessionId) {
    await ChatSession.findByIdAndDelete(sessionId);
  }
}

// Singleton instance
const ragService = new RAGService();

export default ragService;
