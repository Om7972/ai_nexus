import KnowledgeFile from '../models/KnowledgeFile.js';
import Chunk from '../models/Chunk.js';
import Embedding from '../models/Embedding.js';
import TextExtractor from './textExtractor.js';
import ChunkingService from './chunkingService.js';
import embeddingService from './embeddingService.js';

/**
 * Main service for processing uploaded knowledge files
 */
export class KnowledgeProcessingService {
  /**
   * Process uploaded file end-to-end
   */
  static async processFile(fileId) {
    const file = await KnowledgeFile.findById(fileId);
    
    if (!file) {
      throw new Error('File not found');
    }

    try {
      // Update status
      file.processingStatus = 'processing';
      await file.save();

      console.log(`Processing file: ${file.originalName}`);

      // Step 1: Extract text
      const { text, metadata } = await TextExtractor.extract(file.filePath, file.fileType);
      
      // Update file metadata
      file.metadata = { ...file.metadata, ...metadata };
      await file.save();

      console.log(`Extracted ${text.length} characters`);

      // Step 2: Create chunks
      const chunkData = ChunkingService.createChunks(text, 'semantic', 1000, 200);
      
      console.log(`Created ${chunkData.length} chunks`);

      // Step 3: Save chunks to database
      const chunks = [];
      for (let i = 0; i < chunkData.length; i++) {
        const chunk = await Chunk.create({
          file: file._id,
          content: chunkData[i].content,
          chunkIndex: i,
          startOffset: chunkData[i].startOffset,
          endOffset: chunkData[i].endOffset,
          tokenCount: chunkData[i].tokenCount
        });
        chunks.push(chunk);
      }

      // Step 4: Generate embeddings
      console.log('Generating embeddings...');
      const texts = chunkData.map(c => c.content);
      const vectors = await embeddingService.generateEmbeddings(texts);

      // Step 5: Save embeddings
      const embeddingPromises = chunks.map((chunk, i) => 
        Embedding.create({
          chunk: chunk._id,
          file: file._id,
          vector: vectors[i],
          model: embeddingService.model,
          dimensions: embeddingService.dimensions
        })
      );

      await Promise.all(embeddingPromises);

      // Update file status
      file.processingStatus = 'completed';
      file.chunkCount = chunks.length;
      file.totalTokens = chunkData.reduce((sum, c) => sum + c.tokenCount, 0);
      await file.save();

      console.log(`Processing completed for file: ${file.originalName}`);

      return {
        success: true,
        chunkCount: chunks.length,
        totalTokens: file.totalTokens
      };

    } catch (error) {
      console.error('Processing error:', error);
      
      // Update file with error
      file.processingStatus = 'failed';
      file.processingError = error.message;
      await file.save();

      throw error;
    }
  }

  /**
   * Reprocess file (delete old chunks and embeddings, create new ones)
   */
  static async reprocessFile(fileId) {
    // Delete existing chunks and embeddings
    await Chunk.deleteMany({ file: fileId });
    await Embedding.deleteMany({ file: fileId });

    // Process file again
    return this.processFile(fileId);
  }

  /**
   * Delete file and all associated data
   */
  static async deleteFile(fileId) {
    // Delete chunks
    await Chunk.deleteMany({ file: fileId });
    
    // Delete embeddings
    await Embedding.deleteMany({ file: fileId });
    
    // Delete file record
    const file = await KnowledgeFile.findByIdAndDelete(fileId);
    
    // Delete physical file
    if (file && file.filePath) {
      try {
        const fs = await import('fs/promises');
        await fs.unlink(file.filePath);
      } catch (error) {
        console.error('Error deleting physical file:', error.message);
      }
    }

    return file;
  }

  /**
   * Get processing statistics
   */
  static async getStatistics(userId) {
    const files = await KnowledgeFile.find({ owner: userId });
    
    const stats = {
      totalFiles: files.length,
      totalChunks: files.reduce((sum, f) => sum + (f.chunkCount || 0), 0),
      totalTokens: files.reduce((sum, f) => sum + (f.totalTokens || 0), 0),
      byStatus: {
        pending: files.filter(f => f.processingStatus === 'pending').length,
        processing: files.filter(f => f.processingStatus === 'processing').length,
        completed: files.filter(f => f.processingStatus === 'completed').length,
        failed: files.filter(f => f.processingStatus === 'failed').length
      },
      byCollection: {
        personal: files.filter(f => f.collection === 'personal').length,
        workspace: files.filter(f => f.collection === 'workspace').length,
        shared: files.filter(f => f.collection === 'shared').length
      },
      byType: {
        pdf: files.filter(f => f.fileType === 'pdf').length,
        docx: files.filter(f => f.fileType === 'docx').length,
        txt: files.filter(f => f.fileType === 'txt').length,
        csv: files.filter(f => f.fileType === 'csv').length
      }
    };

    return stats;
  }
}

export default KnowledgeProcessingService;
