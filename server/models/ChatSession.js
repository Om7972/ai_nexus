import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  files: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeFile'
  }],
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    sources: [{
      chunk: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chunk'
      },
      file: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KnowledgeFile'
      },
      similarity: Number,
      content: String
    }],
    timestamp: {
      type: Date,
      default: Date.now
    },
    tokenUsage: {
      prompt: Number,
      completion: Number,
      total: Number
    }
  }],
  totalTokens: {
    type: Number,
    default: 0
  },
  model: {
    type: String,
    default: 'gpt-4'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
chatSessionSchema.index({ user: 1, createdAt: -1 });
chatSessionSchema.index({ user: 1, isActive: 1 });

// Method to add message
chatSessionSchema.methods.addMessage = function(role, content, sources = [], tokenUsage = null) {
  this.messages.push({
    role,
    content,
    sources,
    tokenUsage,
    timestamp: new Date()
  });

  if (tokenUsage) {
    this.totalTokens += tokenUsage.total;
  }

  // Update title based on first user message
  if (role === 'user' && this.messages.length === 1) {
    this.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
  }

  return this.save();
};

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;
