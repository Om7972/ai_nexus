import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = Router();

// All user routes require authentication
router.use(protect);

// ── Self-service routes ───────────────────────────────────────────────────────

/** @route  GET   /api/v1/users/me */
router.get('/me', userController.getMyProfile);

/** @route  PATCH /api/v1/users/me */
router.patch('/me', userController.updateMyProfile);

// ── Admin-only routes ─────────────────────────────────────────────────────────

/** @route  GET   /api/v1/users */
router.get('/', restrictTo('admin'), userController.getAllUsers);

/** @route  GET   /api/v1/users/:id */
router.get('/:id', restrictTo('admin'), userController.getUser);

/** @route  PATCH /api/v1/users/:id */
router.patch('/:id', restrictTo('admin'), userController.updateUser);

/** @route  DELETE /api/v1/users/:id */
router.delete('/:id', restrictTo('admin'), userController.deleteUser);

export default router;
