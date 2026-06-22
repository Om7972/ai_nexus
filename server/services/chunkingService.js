/**
 * Service for splitting text into chunks for embedding
 */
export class ChunkingService {
  /**
   * Split text into chunks with overlap
   */
  static splitText(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    let startIndex = 0;

    // Clean and normalize text
    text = text.trim().replace(/\s+/g, ' ');

    while (startIndex < text.length) {
      let endIndex = startIndex + chunkSize;

      // If not at the end, try to break at sentence boundary
      if (endIndex < text.length) {
        const sentenceEnd = this.findSentenceEnd(text, endIndex);
        if (sentenceEnd > startIndex && sentenceEnd < startIndex + chunkSize + 200) {
          endIndex = sentenceEnd;
        }
      }

      const chunk = text.substring(startIndex, endIndex).trim();
      
      if (chunk.length > 0) {
        chunks.push({
          content: chunk,
          startOffset: startIndex,
          endOffset: endIndex,
          tokenCount: this.estimateTokenCount(chunk)
        });
      }

      // Move start index with overlap
      startIndex = endIndex - overlap;
      
      // Ensure we make progress
      if (startIndex <= chunks[chunks.length - 1]?.startOffset) {
        startIndex = endIndex;
      }
    }

    return chunks;
  }

  /**
   * Find the nearest sentence ending
   */
  static findSentenceEnd(text, startPos) {
    const sentenceEnders = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];
    let nearestEnd = -1;
    let minDistance = Infinity;

    for (const ender of sentenceEnders) {
      const pos = text.indexOf(ender, startPos);
      if (pos !== -1) {
        const distance = pos - startPos;
        if (distance < minDistance) {
          minDistance = distance;
          nearestEnd = pos + ender.length;
        }
      }
    }

    return nearestEnd !== -1 ? nearestEnd : startPos + 100;
  }

  /**
   * Estimate token count (rough approximation)
   */
  static estimateTokenCount(text) {
    // Rough estimation: ~4 characters per token on average
    return Math.ceil(text.length / 4);
  }

  /**
   * Split text by semantic sections (paragraphs, headings)
   */
  static splitBySections(text, maxChunkSize = 1000) {
    const chunks = [];
    
    // Split by double newlines (paragraphs)
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    let currentChunk = '';
    let currentTokens = 0;

    for (const paragraph of paragraphs) {
      const paragraphTokens = this.estimateTokenCount(paragraph);

      // If paragraph alone exceeds max size, split it
      if (paragraphTokens > maxChunkSize) {
        if (currentChunk) {
          chunks.push({
            content: currentChunk.trim(),
            tokenCount: currentTokens
          });
          currentChunk = '';
          currentTokens = 0;
        }

        // Split large paragraph
        const subChunks = this.splitText(paragraph, maxChunkSize, 100);
        chunks.push(...subChunks);
        continue;
      }

      // If adding paragraph exceeds max size, save current chunk
      if (currentTokens + paragraphTokens > maxChunkSize && currentChunk) {
        chunks.push({
          content: currentChunk.trim(),
          tokenCount: currentTokens
        });
        currentChunk = paragraph;
        currentTokens = paragraphTokens;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        currentTokens += paragraphTokens;
      }
    }

    // Add remaining chunk
    if (currentChunk.trim()) {
      chunks.push({
        content: currentChunk.trim(),
        tokenCount: currentTokens
      });
    }

    return chunks;
  }

  /**
   * Main chunking method with smart strategy
   */
  static createChunks(text, strategy = 'semantic', chunkSize = 1000, overlap = 200) {
    if (strategy === 'semantic') {
      return this.splitBySections(text, chunkSize);
    } else {
      return this.splitText(text, chunkSize, overlap);
    }
  }
}

export default ChunkingService;
