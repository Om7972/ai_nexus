import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const memoryProjectSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'completed', 'on_hold'],
      default: 'planning',
      index: true
    },
    tags: {
      type: [String],
      default: []
    },
    summary: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const MemoryProject = model('MemoryProject', memoryProjectSchema);
export default MemoryProject;
