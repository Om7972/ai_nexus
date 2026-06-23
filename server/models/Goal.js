import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const goalSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'abandoned'],
      default: 'pending',
      index: true
    },
    dueDate: {
      type: Date,
      required: false
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    nextActions: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const Goal = model('Goal', goalSchema);
export default Goal;
