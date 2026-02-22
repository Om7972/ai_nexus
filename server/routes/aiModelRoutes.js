/**
 * aiModelRoutes.js  –  /api/v1/models
 */
import { Router } from 'express';
import { protect, isAdmin } from '../middlewares/authMiddleware.js';
import * as ctrl from '../controllers/aiModelController.js';

const router = Router();

// All model routes require authentication
router.use(protect);

// ── Public reads (any logged-in user) ─────────────────────────────────────────
router.get('/featured', ctrl.getFeaturedModels);
router.get('/', ctrl.listModels);
router.get('/:id', ctrl.getModel);

// ── Admin-only writes ─────────────────────────────────────────────────────────
router.post('/', isAdmin, ctrl.createModel);
router.patch('/:id', isAdmin, ctrl.updateModel);
router.delete('/:id', isAdmin, ctrl.deleteModel);
router.patch('/:id/restore', isAdmin, ctrl.restoreModel);

export default router;
