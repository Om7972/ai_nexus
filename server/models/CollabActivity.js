import mongoose from 'mongoose';

const collabActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollabProject'
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollabDocument'
  },
  action: {
    type: String,
    required: true,
    enum: [
      'team_created', 'team_updated', 'team_deleted',
      'team_member_added', 'team_member_removed', 'team_member_role_changed',
      'project_created', 'project_updated', 'project_archived',
      'project_member_added', 'project_member_removed',
      'document_created', 'document_updated', 'document_deleted',
      'document_published', 'document_shared',
      'comment_added', 'comment_resolved',
      'version_created', 'version_restored'
    ]
  },
  description: {
    type: String,
    required: true
  },
  metadata: mongoose.Schema.Types.Mixed,
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
collabActivitySchema.index({ team: 1, createdAt: -1 });
collabActivitySchema.index({ project: 1, createdAt: -1 });
collabActivitySchema.index({ document: 1, createdAt: -1 });
collabActivitySchema.index({ user: 1, createdAt: -1 });
collabActivitySchema.index({ createdAt: -1 });

// Static method to log activity
collabActivitySchema.statics.log = async function(data) {
  return this.create(data);
};

// Static method to get activities for team
collabActivitySchema.statics.getTeamActivities = function(teamId, limit = 50, skip = 0) {
  return this.find({ team: teamId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('user', 'name email avatar')
    .populate('targetUser', 'name email')
    .lean();
};

// Static method to get activities for project
collabActivitySchema.statics.getProjectActivities = function(projectId, limit = 50, skip = 0) {
  return this.find({ project: projectId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('user', 'name email avatar')
    .populate('targetUser', 'name email')
    .lean();
};

const CollabActivity = mongoose.model('CollabActivity', collabActivitySchema);

export default CollabActivity;
