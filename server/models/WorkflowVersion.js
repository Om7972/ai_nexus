import mongoose from 'mongoose';

const workflowVersionSchema = new mongoose.Schema({
  workflow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  name: String,
  description: String,
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
    targetHandle: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  changeLog: String
}, {
  timestamps: true
});

// Compound index for workflow and version
workflowVersionSchema.index({ workflow: 1, version: -1 });

const WorkflowVersion = mongoose.model('WorkflowVersion', workflowVersionSchema);

export default WorkflowVersion;
