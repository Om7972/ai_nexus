/**
 * workspaceRoutes.js  –  /api/v1/workspaces
 */
import { Router } from 'express';
import { protect, isVerified } from '../middlewares/authMiddleware.js';
import * as ctrl from '../controllers/workspaceController.js';

const router = Router();

// All workspace routes: must be logged-in + email verified
router.use(protect, isVerified);

// ── Collection ────────────────────────────────────────────────────────────────
router.get('/', ctrl.listWorkspaces);
router.post('/', ctrl.createWorkspace);

// ── Individual workspace ──────────────────────────────────────────────────────
router.get('/:id', ctrl.getWorkspace);
router.patch('/:id', ctrl.updateWorkspace);
router.delete('/:id', ctrl.deleteWorkspace);

// ── Sub-resource: members ─────────────────────────────────────────────────────
router.get('/:id/members', ctrl.listMembers);
router.post('/:id/members', ctrl.addMember);
router.patch('/:id/members/:uid', ctrl.changeMemberRole);
router.delete('/:id/members/:uid', ctrl.removeMember);

// ── Sub-resource: projects ────────────────────────────────────────────────────
router.get('/:id/projects', ctrl.listWorkspaceProjects);

// ── Sub-resource: activity audit ─────────────────────────────────────────────
router.get('/:id/activity', ctrl.getWorkspaceActivity);

export default router;
