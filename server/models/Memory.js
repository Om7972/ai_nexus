import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const memorySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: String,
      enum: ['preference', 'project', 'prompt', 'file', 'goal', 'conversation', 'snippet'],
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true
    },
    embedding: {
      type: [Number], // Store embedding vector for cosine similarity checks
      required: false,
      default: undefined
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    favorite: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Search text index
memorySchema.index({ content: 'text', tags: 'text' });

const Memory = model('Memory', memorySchema);
export default Memory;
