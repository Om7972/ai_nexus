import mongoose from 'mongoose';

const documentVersionSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollabDocument',
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  title: String,
  content: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changeDescription: String,
  metadata: {
    wordCount: Number,
    characterCount: Number
  }
}, {
  timestamps: true
});

// Indexes
documentVersionSchema.index({ document: 1, version: -1 });
documentVersionSchema.index({ document: 1, createdAt: -1 });

// Compound unique index to prevent duplicate versions
documentVersionSchema.index({ document: 1, version: 1 }, { unique: true });

const DocumentVersion = mongoose.model('DocumentVersion', documentVersionSchema);

export default DocumentVersion;
