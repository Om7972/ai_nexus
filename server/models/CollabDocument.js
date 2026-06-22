import mongoose from 'mongoose';

const collabDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    default: ''
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollabProject',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['document', 'spreadsheet', 'presentation', 'whiteboard'],
    default: 'document'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  version: {
    type: Number,
    default: 1
  },
  shareLink: {
    token: String,
    expiresAt: Date,
    requireAuth: {
      type: Boolean,
      default: true
    }
  },
  activeUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    socketId: String,
    cursor: {
      line: Number,
      column: Number
    },
    selection: {
      start: { line: Number, column: Number },
      end: { line: Number, column: Number }
    },
    lastActiveAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    wordCount: {
      type: Number,
      default: 0
    },
    characterCount: {
      type: Number,
      default: 0
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastEditedAt: Date
  }
}, {
  timestamps: true
});

// Indexes
collabDocumentSchema.index({ project: 1, createdAt: -1 });
collabDocumentSchema.index({ owner: 1, createdAt: -1 });
collabDocumentSchema.index({ 'shareLink.token': 1 });
collabDocumentSchema.index({ title: 'text', content: 'text' });

// Virtual for comments
collabDocumentSchema.virtual('comments', {
  ref: 'CollabComment',
  localField: '_id',
  foreignField: 'document'
});

// Virtual for versions
collabDocumentSchema.virtual('versions', {
  ref: 'DocumentVersion',
  localField: '_id',
  foreignField: 'document'
});

// Method to add active user
collabDocumentSchema.methods.addActiveUser = function(userId, socketId) {
  // Remove if already exists
  this.activeUsers = this.activeUsers.filter(u => 
    u.user.toString() !== userId.toString()
  );
  
  this.activeUsers.push({
    user: userId,
    socketId,
    lastActiveAt: new Date()
  });
  
  return this.save();
};

// Method to remove active user
collabDocumentSchema.methods.removeActiveUser = function(userId) {
  this.activeUsers = this.activeUsers.filter(u => 
    u.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Method to update cursor position
collabDocumentSchema.methods.updateCursor = function(userId, cursor, selection) {
  const user = this.activeUsers.find(u => 
    u.user.toString() === userId.toString()
  );
  
  if (user) {
    if (cursor) user.cursor = cursor;
    if (selection) user.selection = selection;
    user.lastActiveAt = new Date();
    return this.save();
  }
};

// Method to clean up inactive users (older than 5 minutes)
collabDocumentSchema.methods.cleanupInactiveUsers = function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  this.activeUsers = this.activeUsers.filter(u => 
    u.lastActiveAt > fiveMinutesAgo
  );
  
  return this.save();
};

const CollabDocument = mongoose.model('CollabDocument', collabDocumentSchema);

export default CollabDocument;
