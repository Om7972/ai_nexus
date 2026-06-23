import express from 'express';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  updateProjectMemberRole,
  getProjectActivities
} from '../../controllers/collaborationProjectController.js';
import { protect } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Project routes
router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProject)
  .patch(updateProject)
  .delete(deleteProject);

// Member management routes
router.route('/:id/members')
  .post(addProjectMember);

router.route('/:id/members/:userId')
  .delete(removeProjectMember)
  .patch(updateProjectMemberRole);

// Activity routes
router.get('/:id/activities', getProjectActivities);

export default router;
