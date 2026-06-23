import mongoose from 'mongoose';

const researchSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Untitled Research Project'
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
    linkedSources: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchSource'
    }],
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  activeSources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResearchSource'
  }]
}, {
  timestamps: true
});

researchSessionSchema.index({ user: 1, updatedAt: -1 });

const ResearchSession = mongoose.model('ResearchSession', researchSessionSchema);
export default ResearchSession;
