import mongoose from 'mongoose';

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workflow name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  nodes: [{
    id: String,
    type: String,
    position: {
      x: Number,
      y: Number
    },
    data: mongoose.Schema.Types.Mixed
  }],
  edges: [{
    id: String,
    source: String,
    target: String,
    sourceHandle: String,
    targetHandle: String,
    animated: Boolean,
    style: mongoose.Schema.Types.Mixed
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft'
  },
  version: {
    type: Number,
    default: 1
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  executionCount: {
    type: Number,
    default: 0
  },
  lastExecutedAt: Date
}, {
  timestamps: true
});

// Index for faster queries
workflowSchema.index({ owner: 1, createdAt: -1 });
workflowSchema.index({ name: 'text', description: 'text' });

// Virtual for version history
workflowSchema.virtual('versionHistory', {
  ref: 'WorkflowVersion',
  localField: '_id',
  foreignField: 'workflow'
});

// Method to increment version
workflowSchema.methods.incrementVersion = async function() {
  this.version += 1;
  return this.save();
};

// Static method to duplicate workflow
workflowSchema.statics.duplicateWorkflow = async function(workflowId, userId) {
  const originalWorkflow = await this.findById(workflowId);
  if (!originalWorkflow) {
    throw new Error('Workflow not found');
  }

  const duplicatedWorkflow = new this({
    name: `${originalWorkflow.name} (Copy)`,
    description: originalWorkflow.description,
    nodes: originalWorkflow.nodes,
    edges: originalWorkflow.edges,
    owner: userId,
    tags: originalWorkflow.tags
  });

  return duplicatedWorkflow.save();
};

const Workflow = mongoose.model('Workflow', workflowSchema);

export default Workflow;
