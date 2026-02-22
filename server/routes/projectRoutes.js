/**
 * projectRoutes.js  –  /api/v1/projects
 */
import { Router } from 'express';
import { protect, isVerified } from '../middlewares/authMiddleware.js';
import * as ctrl from '../controllers/projectController.js';

const router = Router();

// All project routes: must be logged-in + email verified
router.use(protect, isVerified);

// ── Collection ────────────────────────────────────────────────────────────────
router.get('/', ctrl.listProjects);
router.post('/', ctrl.createProject);

// ── Individual project ────────────────────────────────────────────────────────
router.get('/:id', ctrl.getProject);
router.patch('/:id', ctrl.updateProject);
router.delete('/:id', ctrl.deleteProject);

// ── Nested: AI models ─────────────────────────────────────────────────────────
router.post('/:id/models', ctrl.attachModel);
router.delete('/:id/models/:modelId', ctrl.detachModel);

// ── Nested: collaborators ─────────────────────────────────────────────────────
router.post('/:id/collaborators', ctrl.addCollaborator);
router.delete('/:id/collaborators/:userId', ctrl.removeCollaborator);

// ── Sub-resource: activity ────────────────────────────────────────────────────
router.get('/:id/activity', ctrl.getProjectActivity);

export default router;
