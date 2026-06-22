import express from 'express';
import {
  uploadFile,
  getFiles,
  getFile,
  updateFile,
  deleteFile,
  searchKnowledge,
  chatWithKnowledge,
  getChatSessions,
  getChatSession,
  deleteChatSession,
  getStatistics,
  reprocessFile
} from '../controllers/knowledgeController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { knowledgeUpload } from '../middlewares/knowledgeUpload.js';
import { validate } from '../middlewares/validate.js';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const searchSchema = z.object({
  body: z.object({
    query: z.string().min(1).max(1000),
    fileIds: z.array(z.string()).optional(),
    limit: z.number().int().min(1).max(50).optional(),
    threshold: z.number().min(0).max(1).optional()
  })
});

const chatSchema = z.object({
  body: z.object({
    message: z.string().min(1).max(2000),
    sessionId: z.string().optional(),
    fileIds: z.array(z.string()).optional()
  })
});

const updateFileSchema = z.object({
  body: z.object({
    originalName: z.string().min(1).max(255).optional(),
    collection: z.enum(['personal', 'workspace', 'shared']).optional(),
    tags: z.array(z.string()).optional(),
    isPublic: z.boolean().optional()
  })
});

// All routes require authentication
router.use(protect);

// File operations
router.post('/upload', knowledgeUpload.single('file'), uploadFile);
router.get('/files', getFiles);
router.get('/files/:id', getFile);
router.patch('/files/:id', validate(updateFileSchema), updateFile);
router.delete('/files/:id', deleteFile);
router.post('/files/:id/reprocess', reprocessFile);

// Search and chat
router.post('/search', validate(searchSchema), searchKnowledge);
router.post('/chat', validate(chatSchema), chatWithKnowledge);

// Chat sessions
router.get('/chat/sessions', getChatSessions);
router.get('/chat/sessions/:id', getChatSession);
router.delete('/chat/sessions/:id', deleteChatSession);

// Statistics
router.get('/stats', getStatistics);

export default router;
