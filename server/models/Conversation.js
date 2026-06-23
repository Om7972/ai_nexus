import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const conversationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sessionId: {
      type: String,
      required: true,
      index: true
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant', 'system'],
          required: true
        },
        content: {
          type: String,
          required: true
        },
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ],
    summary: {
      type: String,
      default: ''
    },
    shortTermMemory: {
      type: String,
      default: ''
    },
    longTermMemory: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Conversation = model('Conversation', conversationSchema);
export default Conversation;
