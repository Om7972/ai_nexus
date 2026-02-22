/**
 * userRoutes.js  –  /api/v1/users
 */
import { Router } from 'express';
import { protect, isAdmin } from '../middlewares/authMiddleware.js';
import * as ctrl from '../controllers/userController.js';

const router = Router();

// All user routes require a valid JWT
router.use(protect);

// ── Self-service ──────────────────────────────────────────────────────────────
router.get('/me', ctrl.getMe);
router.patch('/me', ctrl.updateMe);
router.delete('/me', ctrl.deleteMe);
router.get('/me/activity', ctrl.getUserActivity);

// ── Admin-only ────────────────────────────────────────────────────────────────
router.get('/', isAdmin, ctrl.listUsers);
router.get('/:id', isAdmin, ctrl.getUserById);
router.patch('/:id', isAdmin, ctrl.updateUser);
router.delete('/:id', isAdmin, ctrl.deleteUser);
router.get('/:id/activity', isAdmin, ctrl.getUserActivity);

export default router;
