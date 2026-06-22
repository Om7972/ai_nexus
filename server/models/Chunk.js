import mongoose from 'mongoose';

const chunkSchema = new mongoose.Schema({
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeFile',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 8000
  },
  chunkIndex: {
    type: Number,
    required: true
  },
  startOffset: Number,
  endOffset: Number,
  tokenCount: {
    type: Number,
    required: true
  },
  metadata: {
    pageNumber: Number,
    sectionTitle: String,
    paragraphIndex: Number
  },
  embedding: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Embedding'
  }
}, {
  timestamps: true
});

// Indexes
chunkSchema.index({ file: 1, chunkIndex: 1 });
chunkSchema.index({ file: 1, createdAt: -1 });

// Create embedding reference after chunk is saved
chunkSchema.post('save', async function() {
  // This will be triggered by the embedding generation service
});

const Chunk = mongoose.model('Chunk', chunkSchema);

export default Chunk;
