import mongoose from 'mongoose';

const collabProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'editor', 'viewer'],
      default: 'viewer'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'completed', 'on-hold'],
    default: 'active'
  },
  visibility: {
    type: String,
    enum: ['private', 'team', 'public'],
    default: 'team'
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  icon: String,
  startDate: Date,
  dueDate: Date,
  tags: [String],
  settings: {
    allowComments: {
      type: Boolean,
      default: true
    },
    requireApprovalForChanges: {
      type: Boolean,
      default: false
    },
    enableVersioning: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes
collabProjectSchema.index({ team: 1, createdAt: -1 });
collabProjectSchema.index({ owner: 1, createdAt: -1 });
collabProjectSchema.index({ 'members.user': 1 });
collabProjectSchema.index({ name: 'text', description: 'text' });
collabProjectSchema.index({ status: 1, team: 1 });

// Virtual for documents
collabProjectSchema.virtual('documents', {
  ref: 'CollabDocument',
  localField: '_id',
  foreignField: 'project'
});

// Method to check if user is member
collabProjectSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

// Method to get user role
collabProjectSchema.methods.getMemberRole = function(userId) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  return member ? member.role : null;
};

// Method to check permission
collabProjectSchema.methods.hasPermission = function(userId, requiredRole) {
  const roleHierarchy = { owner: 4, admin: 3, editor: 2, viewer: 1 };
  const userRole = this.getMemberRole(userId);
  
  if (!userRole) return false;
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

const CollabProject = mongoose.model('CollabProject', collabProjectSchema);

export default CollabProject;
