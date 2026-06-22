import mongoose from 'mongoose';

const collabCommentSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollabDocument',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  },
  position: {
    line: Number,
    column: Number,
    offset: Number
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollabComment'
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
collabCommentSchema.index({ document: 1, createdAt: -1 });
collabCommentSchema.index({ author: 1, createdAt: -1 });
collabCommentSchema.index({ parentComment: 1 });
collabCommentSchema.index({ mentions: 1 });

// Virtual for replies
collabCommentSchema.virtual('replies', {
  ref: 'CollabComment',
  localField: '_id',
  foreignField: 'parentComment'
});

// Method to add reaction
collabCommentSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from user
  this.reactions = this.reactions.filter(r => 
    r.user.toString() !== userId.toString() || r.emoji !== emoji
  );
  
  this.reactions.push({ user: userId, emoji });
  return this.save();
};

// Method to remove reaction
collabCommentSchema.methods.removeReaction = function(userId, emoji) {
  this.reactions = this.reactions.filter(r => 
    !(r.user.toString() === userId.toString() && r.emoji === emoji)
  );
  
  return this.save();
};

// Method to resolve comment
collabCommentSchema.methods.resolve = function(userId) {
  this.isResolved = true;
  this.resolvedBy = userId;
  this.resolvedAt = new Date();
  return this.save();
};

const CollabComment = mongoose.model('CollabComment', collabCommentSchema);

export default CollabComment;
