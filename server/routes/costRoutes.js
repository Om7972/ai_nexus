import { Router } from 'express';
import {
  getOverview,
  getAnalytics,
  updateBudget,
  getRecommendations
} from '../controllers/costController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// Secure all endpoints with authentication guard
router.use(protect);

router.get('/overview', getOverview);
router.get('/analytics', getAnalytics);
router.post('/budget', updateBudget);
router.get('/recommendations', getRecommendations);

export default router;
