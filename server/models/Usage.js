import mongoose from 'mongoose';

const usageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  model: {
    type: String,
    required: true,
    index: true
  },
  feature: {
    type: String,
    required: true,
    index: true
  },
  promptTokens: {
    type: Number,
    default: 0
  },
  completionTokens: {
    type: Number,
    default: 0
  },
  totalTokens: {
    type: Number,
    default: 0
  },
  cost: {
    type: Number,
    default: 0
  },
  latency: {
    type: Number,
    default: 0 // in ms
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success',
    index: true
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for analytical filters
usageSchema.index({ user: 1, createdAt: -1 });
usageSchema.index({ createdAt: -1 });

const Usage = mongoose.model('Usage', usageSchema);

export default Usage;
