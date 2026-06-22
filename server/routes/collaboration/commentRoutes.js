import express from 'express';
import {
  createComment,
  getComments,
  getComment,
  updateComment,
  deleteComment,
  resolveComment,
  unresolveComment,
  addReaction,
  removeReaction
} from '../../controllers/commentController.js';
import { protect } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Comment routes
router.route('/')
  .get(getComments)
  .post(createComment);

router.route('/:id')
  .get(getComment)
  .patch(updateComment)
  .delete(deleteComment);

// Resolve/unresolve routes
router.post('/:id/resolve', resolveComment);
router.post('/:id/unresolve', unresolveComment);

// Reaction routes
router.post('/:id/reactions', addReaction);
router.delete('/:id/reactions/:reactionId', removeReaction);

export default router;
