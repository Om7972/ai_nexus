import mongoose from 'mongoose';

const embeddingSchema = new mongoose.Schema({
  chunk: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chunk',
    required: true,
    unique: true
  },
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeFile',
    required: true
  },
  vector: {
    type: [Number],
    required: true
  },
  model: {
    type: String,
    default: 'text-embedding-ada-002'
  },
  dimensions: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for vector similarity search
embeddingSchema.index({ file: 1 });
embeddingSchema.index({ chunk: 1 });

// Method to calculate cosine similarity
embeddingSchema.statics.cosineSimilarity = function(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
};

// Method to find similar embeddings
embeddingSchema.statics.findSimilar = async function(queryVector, fileIds = null, limit = 10, threshold = 0.7) {
  const query = fileIds ? { file: { $in: fileIds } } : {};
  
  const embeddings = await this.find(query)
    .populate({
      path: 'chunk',
      populate: {
        path: 'file',
        select: 'filename originalName fileType collection'
      }
    })
    .lean();

  // Calculate similarity scores
  const results = embeddings.map(emb => ({
    ...emb,
    similarity: this.cosineSimilarity(queryVector, emb.vector)
  }));

  // Filter by threshold and sort by similarity
  return results
    .filter(r => r.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
};

const Embedding = mongoose.model('Embedding', embeddingSchema);

export default Embedding;
