import mongoose from 'mongoose';

const knowledgeFileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx', 'txt', 'csv'],
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  collection: {
    type: String,
    enum: ['personal', 'workspace', 'shared'],
    default: 'personal'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    }
  }],
  metadata: {
    pageCount: Number,
    wordCount: Number,
    author: String,
    createdDate: Date,
    language: String
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingError: String,
  chunkCount: {
    type: Number,
    default: 0
  },
  embeddingModel: {
    type: String,
    default: 'text-embedding-ada-002'
  },
  totalTokens: {
    type: Number,
    default: 0
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
knowledgeFileSchema.index({ owner: 1, createdAt: -1 });
knowledgeFileSchema.index({ collection: 1, owner: 1 });
knowledgeFileSchema.index({ filename: 'text', originalName: 'text', tags: 'text' });
knowledgeFileSchema.index({ processingStatus: 1 });

// Virtual for chunks
knowledgeFileSchema.virtual('chunks', {
  ref: 'Chunk',
  localField: '_id',
  foreignField: 'file'
});

// Method to check if user has access
knowledgeFileSchema.methods.hasAccess = function(userId) {
  if (this.owner.toString() === userId.toString()) {
    return true;
  }
  if (this.isPublic) {
    return true;
  }
  return this.sharedWith.some(share => share.user.toString() === userId.toString());
};

// Static method to get files accessible by user
knowledgeFileSchema.statics.getAccessibleFiles = function(userId, collection) {
  const query = {
    $or: [
      { owner: userId },
      { isPublic: true },
      { 'sharedWith.user': userId }
    ]
  };

  if (collection) {
    query.collection = collection;
  }

  return this.find(query);
};

const KnowledgeFile = mongoose.model('KnowledgeFile', knowledgeFileSchema);

export default KnowledgeFile;
