import { Router } from 'express';
import {
  chat,
  uploadSource,
  getHistory,
  generateNotes,
  generateCitations,
  createMindmap
} from '../controllers/researchController.js';
import { protect } from '../middlewares/authMiddleware.js';
import knowledgeUpload from '../middlewares/knowledgeUpload.js';

const router = Router();

// Apply auth middleware to protect all research actions
router.use(protect);

router.post('/chat', chat);
router.post('/upload', knowledgeUpload.single('file'), uploadSource);
router.get('/history', getHistory);
router.post('/generate-notes', generateNotes);
router.post('/generate-citations', generateCitations);
router.post('/create-mindmap', createMindmap);

export default router;
