import express from 'express';
import {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  updateMemberRole,
  getTeamActivities
} from '../../controllers/teamController.js';
import { protect } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Team routes
router.route('/')
  .get(getTeams)
  .post(createTeam);

router.route('/:id')
  .get(getTeam)
  .patch(updateTeam)
  .delete(deleteTeam);

// Member management routes
router.route('/:id/members')
  .post(addMember);

router.route('/:id/members/:userId')
  .delete(removeMember)
  .patch(updateMemberRole);

// Activity routes
router.get('/:id/activities', getTeamActivities);

export default router;
