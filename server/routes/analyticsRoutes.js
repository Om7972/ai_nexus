import { Router } from 'express';
import { getOverview, getUsageStats } from '../controllers/analyticsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// Protect all analytics endpoints
router.use(protect);

router.get('/overview', getOverview);
router.get('/usage', getUsageStats);

export default router;
