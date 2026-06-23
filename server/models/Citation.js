import mongoose from 'mongoose';

const citationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResearchSession',
    required: true
  },
  source: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResearchSource'
  },
  title: {
    type: String,
    required: true
  },
  authors: [{
    type: String
  }],
  publisher: {
    type: String
  },
  publishYear: {
    type: String
  },
  url: {
    type: String
  },
  formattedCitations: {
    apa: String,
    mla: String,
    chicago: String,
    ieee: String
  }
}, {
  timestamps: true
});

citationSchema.index({ user: 1, session: 1 });

const Citation = mongoose.model('Citation', citationSchema);
export default Citation;
