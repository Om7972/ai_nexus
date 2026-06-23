import { Router } from 'express';
import {
  handleCreateMemory,
  handleGetMemories,
  handleDeleteMemory,
  handleSearchMemories,
  handleCreateGoal,
  handleGetGoals,
  handleUpdateGoal,
  handleCreateProject,
  handleGetProjects,
  handleGetInsights,
  handleTriggerSummary
} from '../controllers/memoryController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// Protect all Memory Engine APIs
router.use(protect);

router.post('/', handleCreateMemory);
router.get('/', handleGetMemories);
router.delete('/:id', handleDeleteMemory);
router.post('/search', handleSearchMemories);
router.get('/insights', handleGetInsights);
router.post('/insights/trigger', handleTriggerSummary);
router.post('/goals', handleCreateGoal);
router.get('/goals', handleGetGoals);
router.put('/goals/:id', handleUpdateGoal);
router.post('/projects', handleCreateProject);
router.get('/projects', handleGetProjects);

export default router;
