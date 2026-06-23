import mongoose from 'mongoose';

const researchSourceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResearchSession'
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['url', 'pdf', 'docx', 'txt', 'youtube'],
    required: true
  },
  rawContent: {
    type: String,
    default: ''
  },
  url: {
    type: String
  },
  fileUrl: {
    type: String
  },
  summary: {
    type: String,
    default: ''
  },
  keyPoints: [{
    type: String
  }],
  faqs: [{
    question: String,
    answer: String
  }],
  flashcards: [{
    front: String,
    back: String
  }],
  metadata: {
    author: String,
    publishDate: String,
    publisher: String,
    confidenceScore: {
      type: Number,
      default: 0.85
    },
    duration: Number // For videos
  }
}, {
  timestamps: true
});

researchSourceSchema.index({ user: 1, session: 1 });

const ResearchSource = mongoose.model('ResearchSource', researchSourceSchema);
export default ResearchSource;
