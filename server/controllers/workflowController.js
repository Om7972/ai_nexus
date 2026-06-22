import Workflow from '../models/Workflow.js';
import WorkflowExecution from '../models/WorkflowExecution.js';
import WorkflowVersion from '../models/WorkflowVersion.js';
import { executeWorkflow } from '../services/workflowEngine.js';

// @desc    Create new workflow
// @route   POST /api/workflows
// @access  Private
export const createWorkflow = async (req, res, next) => {
  try {
    const { name, description, nodes, edges, tags } = req.body;

    const workflow = await Workflow.create({
      name,
      description,
      nodes: nodes || [],
      edges: edges || [],
      tags: tags || [],
      owner: req.user._id
    });

    // Create initial version
    await WorkflowVersion.create({
      workflow: workflow._id,
      version: 1,
      name: workflow.name,
      description: workflow.description,
      nodes: workflow.nodes,
      edges: workflow.edges,
      createdBy: req.user._id,
      changeLog: 'Initial version'
    });

    res.status(201).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all workflows for user
// @route   GET /api/workflows
// @access  Private
export const getWorkflows = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = { owner: req.user._id };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search by name or description
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    const workflows = await Workflow.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v')
      .lean();

    const total = await Workflow.countDocuments(query);

    res.json({
      success: true,
      data: workflows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single workflow
// @route   GET /api/workflows/:id
// @access  Private
export const getWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    // Check ownership
    if (workflow.owner.toString() !== req.user._id.toString() && !workflow.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this workflow'
      });
    }

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update workflow
// @route   PATCH /api/workflows/:id
// @access  Private
export const updateWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    // Check ownership
    if (workflow.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this workflow'
      });
    }

    const { name, description, nodes, edges, status, tags, saveVersion, changeLog } = req.body;

    // Update fields
    if (name !== undefined) workflow.name = name;
    if (description !== undefined) workflow.description = description;
    if (nodes !== undefined) workflow.nodes = nodes;
    if (edges !== undefined) workflow.edges = edges;
    if (status !== undefined) workflow.status = status;
    if (tags !== undefined) workflow.tags = tags;

    // Save new version if requested
    if (saveVersion) {
      workflow.version += 1;
      
      await WorkflowVersion.create({
        workflow: workflow._id,
        version: workflow.version,
        name: workflow.name,
        description: workflow.description,
        nodes: workflow.nodes,
        edges: workflow.edges,
        createdBy: req.user._id,
        changeLog: changeLog || `Version ${workflow.version}`
      });
    }

    await workflow.save();

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete workflow
// @route   DELETE /api/workflows/:id
// @access  Private
export const deleteWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    // Check ownership
    if (workflow.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this workflow'
      });
    }

    await workflow.deleteOne();

    // Delete related versions and executions
    await WorkflowVersion.deleteMany({ workflow: workflow._id });
    await WorkflowExecution.deleteMany({ workflow: workflow._id });

    res.json({
      success: true,
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate workflow
// @route   POST /api/workflows/:id/duplicate
// @access  Private
export const duplicateWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    // Check if user has access
    if (workflow.owner.toString() !== req.user._id.toString() && !workflow.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to duplicate this workflow'
      });
    }

    const duplicatedWorkflow = await Workflow.duplicateWorkflow(workflow._id, req.user._id);

    // Create initial version for duplicated workflow
    await WorkflowVersion.create({
      workflow: duplicatedWorkflow._id,
      version: 1,
      name: duplicatedWorkflow.name,
      description: duplicatedWorkflow.description,
      nodes: duplicatedWorkflow.nodes,
      edges: duplicatedWorkflow.edges,
      createdBy: req.user._id,
      changeLog: `Duplicated from workflow: ${workflow.name}`
    });

    res.status(201).json({
      success: true,
      data: duplicatedWorkflow
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get workflow version history
// @route   GET /api/workflows/:id/versions
// @access  Private
export const getWorkflowVersions = async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    // Check ownership
    if (workflow.owner.toString() !== req.user._id.toString() && !workflow.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this workflow'
      });
    }

    const versions = await WorkflowVersion.find({ workflow: workflow._id })
      .sort({ version: -1 })
      .populate('createdBy', 'name email')
      .lean();

    res.json({
      success: true,
      data: versions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore workflow version
// @route   POST /api/workflows/:id/versions/:versionId/restore
// @access  Private
export const restoreWorkflowVersion = async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    // Check ownership
    if (workflow.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to restore this workflow'
      });
    }

    const version = await WorkflowVersion.findById(req.params.versionId);

    if (!version || version.workflow.toString() !== workflow._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Version not found'
      });
    }

    // Restore workflow to this version
    workflow.name = version.name;
    workflow.description = version.description;
    workflow.nodes = version.nodes;
    workflow.edges = version.edges;
    workflow.version += 1;

    await workflow.save();

    // Create new version entry
    await WorkflowVersion.create({
      workflow: workflow._id,
      version: workflow.version,
      name: workflow.name,
      description: workflow.description,
      nodes: workflow.nodes,
      edges: workflow.edges,
      createdBy: req.user._id,
      changeLog: `Restored from version ${version.version}`
    });

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Execute workflow
// @route   POST /api/workflows/:id/execute
// @access  Private
export const runWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    // Check ownership or public access
    if (workflow.owner.toString() !== req.user._id.toString() && !workflow.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to execute this workflow'
      });
    }

    const { input } = req.body;

    // Create execution record
    const execution = await WorkflowExecution.create({
      workflow: workflow._id,
      workflowVersion: workflow.version,
      owner: req.user._id,
      input,
      status: 'pending'
    });

    // Execute workflow asynchronously
    executeWorkflow(workflow, execution, input).catch(error => {
      console.error('Workflow execution error:', error);
    });

    // Update workflow stats
    workflow.executionCount += 1;
    workflow.lastExecutedAt = new Date();
    await workflow.save();

    res.status(202).json({
      success: true,
      message: 'Workflow execution started',
      data: {
        executionId: execution._id,
        status: execution.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get workflow execution
// @route   GET /api/workflows/executions/:executionId
// @access  Private
export const getWorkflowExecution = async (req, res, next) => {
  try {
    const execution = await WorkflowExecution.findById(req.params.executionId)
      .populate('workflow', 'name description');

    if (!execution) {
      return res.status(404).json({
        success: false,
        message: 'Execution not found'
      });
    }

    // Check ownership
    if (execution.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this execution'
      });
    }

    res.json({
      success: true,
      data: execution
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get workflow executions
// @route   GET /api/workflows/:id/executions
// @access  Private
export const getWorkflowExecutions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    // Check ownership
    if (workflow.owner.toString() !== req.user._id.toString() && !workflow.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this workflow'
      });
    }

    const query = { workflow: workflow._id };

    if (status) {
      query.status = status;
    }

    const executions = await WorkflowExecution.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-executionLogs -nodeExecutions')
      .lean();

    const total = await WorkflowExecution.countDocuments(query);

    res.json({
      success: true,
      data: executions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
