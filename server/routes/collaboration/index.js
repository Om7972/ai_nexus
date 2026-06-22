import express from 'express';
import teamRoutes from './teamRoutes.js';
import projectRoutes from './projectRoutes.js';
import documentRoutes from './documentRoutes.js';
import commentRoutes from './commentRoutes.js';
import activityRoutes from './activityRoutes.js';

const router = express.Router();

// Mount sub-routes
router.use('/teams', teamRoutes);
router.use('/projects', projectRoutes);
router.use('/documents', documentRoutes);
router.use('/comments', commentRoutes);
router.use('/activities', activityRoutes);

export default router;
