import express from 'express';
import {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  createShareLink,
  revokeShareLink,
  addDocumentUser,
  removeDocumentUser,
  getDocumentVersions,
  restoreDocumentVersion
} from '../../controllers/documentController.js';
import { protect } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Document routes
router.route('/')
  .get(getDocuments)
  .post(createDocument);

router.route('/:id')
  .get(getDocument)
  .patch(updateDocument)
  .delete(deleteDocument);

// Share link routes
router.post('/:id/share', createShareLink);
router.delete('/:id/share/:shareId', revokeShareLink);

// User management routes
router.post('/:id/users', addDocumentUser);
router.delete('/:id/users/:userId', removeDocumentUser);

// Version routes
router.get('/:id/versions', getDocumentVersions);
router.post('/:id/versions/:versionId/restore', restoreDocumentVersion);

export default router;
