import mongoose from 'mongoose';

const workflowExecutionSchema = new mongoose.Schema({
  workflow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true
  },
  workflowVersion: {
    type: Number,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  duration: Number, // in milliseconds
  input: mongoose.Schema.Types.Mixed,
  output: mongoose.Schema.Types.Mixed,
  executionLogs: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    nodeId: String,
    nodeName: String,
    level: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info'
    },
    message: String,
    data: mongoose.Schema.Types.Mixed
  }],
  nodeExecutions: [{
    nodeId: String,
    nodeName: String,
    nodeType: String,
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed', 'skipped']
    },
    startTime: Date,
    endTime: Date,
    duration: Number,
    input: mongoose.Schema.Types.Mixed,
    output: mongoose.Schema.Types.Mixed,
    error: String
  }],
  error: {
    message: String,
    stack: String,
    nodeId: String
  },
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes for performance
workflowExecutionSchema.index({ workflow: 1, createdAt: -1 });
workflowExecutionSchema.index({ owner: 1, createdAt: -1 });
workflowExecutionSchema.index({ status: 1, createdAt: -1 });

// Method to add log entry
workflowExecutionSchema.methods.addLog = function(nodeId, nodeName, level, message, data = null) {
  this.executionLogs.push({
    nodeId,
    nodeName,
    level,
    message,
    data,
    timestamp: new Date()
  });
  return this.save();
};

// Method to update node execution
workflowExecutionSchema.methods.updateNodeExecution = function(nodeId, updates) {
  const nodeExecution = this.nodeExecutions.find(n => n.nodeId === nodeId);
  if (nodeExecution) {
    Object.assign(nodeExecution, updates);
  } else {
    this.nodeExecutions.push({ nodeId, ...updates });
  }
  return this.save();
};

// Method to complete execution
workflowExecutionSchema.methods.complete = function(output, error = null) {
  this.endTime = new Date();
  this.duration = this.endTime - this.startTime;
  this.status = error ? 'failed' : 'completed';
  this.output = output;
  if (error) {
    this.error = {
      message: error.message,
      stack: error.stack,
      nodeId: error.nodeId
    };
  }
  return this.save();
};

const WorkflowExecution = mongoose.model('WorkflowExecution', workflowExecutionSchema);

export default WorkflowExecution;
