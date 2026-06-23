import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const insightSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['weekly', 'project', 'suggestion'],
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      default: 0
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

const Insight = model('Insight', insightSchema);
export default Insight;
