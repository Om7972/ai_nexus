import express from 'express';
import {
  getTeamActivities,
  getProjectActivities,
  getDocumentActivities,
  getUserActivities,
  getTeamActivityStats,
  cleanupOldActivities
} from '../../controllers/activityController.js';
import { protect } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Activity feed routes
router.get('/team/:teamId', getTeamActivities);
router.get('/project/:projectId', getProjectActivities);
router.get('/document/:documentId', getDocumentActivities);
router.get('/user', getUserActivities);

// Stats routes
router.get('/team/:teamId/stats', getTeamActivityStats);

// Cleanup route (admin only)
router.delete('/cleanup', cleanupOldActivities);

export default router;
