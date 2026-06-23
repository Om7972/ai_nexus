import mongoose from 'mongoose';

const researchNoteSchema = new mongoose.Schema({
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
    required: true,
    default: 'New Note'
  },
  content: {
    type: String,
    default: ''
  },
  folder: {
    type: String,
    default: 'General'
  },
  tags: [{
    type: String
  }],
  sourcesLinked: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResearchSource'
  }]
}, {
  timestamps: true
});

researchNoteSchema.index({ user: 1 });

const ResearchNote = mongoose.model('ResearchNote', researchNoteSchema);
export default ResearchNote;
