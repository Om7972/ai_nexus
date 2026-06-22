import express from 'express';
import {
  createWorkflow,
  getWorkflows,
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
  duplicateWorkflow,
  getWorkflowVersions,
  restoreWorkflowVersion,
  runWorkflow,
  getWorkflowExecution,
  getWorkflowExecutions
} from '../controllers/workflowController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const createWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    nodes: z.array(z.any()).optional(),
    edges: z.array(z.any()).optional(),
    tags: z.array(z.string()).optional()
  })
});

const updateWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    nodes: z.array(z.any()).optional(),
    edges: z.array(z.any()).optional(),
    status: z.enum(['draft', 'active', 'archived']).optional(),
    tags: z.array(z.string()).optional(),
    saveVersion: z.boolean().optional(),
    changeLog: z.string().optional()
  })
});

const executeWorkflowSchema = z.object({
  body: z.object({
    input: z.any().optional()
  })
});

// All routes require authentication
router.use(protect);

// Workflow CRUD
router.post('/', validate(createWorkflowSchema), createWorkflow);
router.get('/', getWorkflows);
router.get('/:id', getWorkflow);
router.patch('/:id', validate(updateWorkflowSchema), updateWorkflow);
router.delete('/:id', deleteWorkflow);

// Workflow operations
router.post('/:id/duplicate', duplicateWorkflow);
router.get('/:id/versions', getWorkflowVersions);
router.post('/:id/versions/:versionId/restore', restoreWorkflowVersion);

// Workflow execution
router.post('/:id/execute', validate(executeWorkflowSchema), runWorkflow);
router.get('/:id/executions', getWorkflowExecutions);
router.get('/executions/:executionId', getWorkflowExecution);

export default router;
