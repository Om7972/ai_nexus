import CollabDocument from '../models/CollabDocument.js';
import CollabProject from '../models/CollabProject.js';
import DocumentVersion from '../models/DocumentVersion.js';
import CollabActivity from '../models/CollabActivity.js';

// @desc    Create document
// @route   POST /api/v1/collaboration/documents
// @access  Private
export const createDocument = async (req, res, next) => {
  try {
    const { title, content, type, project } = req.body;

    // Check if user has access to project
    const projectDoc = await CollabProject.findById(project);
    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (!projectDoc.hasPermission(req.user._id, 'editor')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to create documents in this project'
      });
    }

    const document = await CollabDocument.create({
      title,
      content,
      type,
      project,
      team: projectDoc.team,
      owner: req.user._id
    });

    // Create initial version
    await DocumentVersion.create({
      document: document._id,
      content,
      createdBy: req.user._id,
      changeDescription: 'Initial version'
    });

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: projectDoc.team,
      project,
      document: document._id,
      action: 'document_created',
      description: `Created document "${title}"`
    });

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all documents
// @route   GET /api/v1/collaboration/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, project, type, search } = req.query;

    const query = {
      $or: [
        { owner: req.user._id },
        { 'permissions.user': req.user._id }
      ]
    };

    if (project) {
      query.project = project;
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const documents = await CollabDocument.find(query)
      .populate('project', 'name')
      .populate('owner', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content') // Don't send full content in list
      .lean();

    const total = await CollabDocument.countDocuments(query);

    res.json({
      success: true,
      data: documents,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document
// @route   GET /api/v1/collaboration/documents/:id
// @access  Private
export const getDocument = async (req, res, next) => {
  try {
    const document = await CollabDocument.findById(req.params.id)
      .populate('project', 'name team')
      .populate('owner', 'name email avatar')
      .populate('permissions.user', 'name email avatar')
      .populate('activeUsers.user', 'name email avatar');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check access
    if (!document.hasAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update document
// @route   PATCH /api/v1/collaboration/documents/:id
// @access  Private
export const updateDocument = async (req, res, next) => {
  try {
    const document = await CollabDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check permission
    if (!document.canEdit(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const { title, content, metadata } = req.body;
    const oldContent = document.content;

    if (title) document.title = title;
    if (content !== undefined) {
      document.content = content;
      document.version += 1;
    }
    if (metadata) document.metadata = { ...document.metadata, ...metadata };

    await document.save();

    // Create version if content changed
    if (content !== undefined && content !== oldContent) {
      await DocumentVersion.create({
        document: document._id,
        version: document.version,
        content,
        createdBy: req.user._id,
        changeDescription: req.body.changeDescription || 'Content updated'
      });
    }

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: document.team,
      project: document.project,
      document: document._id,
      action: 'document_updated',
      description: `Updated document "${document.title}"`
    });

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/v1/collaboration/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await CollabDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Only owner can delete
    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only document owner can delete document'
      });
    }

    await document.deleteOne();

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: document.team,
      project: document.project,
      action: 'document_deleted',
      description: `Deleted document "${document.title}"`
    });

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create share link
// @route   POST /api/v1/collaboration/documents/:id/share
// @access  Private
export const createShareLink = async (req, res, next) => {
  try {
    const document = await CollabDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check permission
    if (!document.canEdit(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const { expiresInDays = 7, allowedUsers = [] } = req.body;

    const shareLink = await document.createShareLink(expiresInDays, allowedUsers);

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: document.team,
      project: document.project,
      document: document._id,
      action: 'document_shared',
      description: `Created share link for document "${document.title}"`,
      metadata: { expiresInDays }
    });

    res.json({
      success: true,
      data: shareLink
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Revoke share link
// @route   DELETE /api/v1/collaboration/documents/:id/share/:shareId
// @access  Private
export const revokeShareLink = async (req, res, next) => {
  try {
    const document = await CollabDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check permission
    if (!document.canEdit(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    await document.revokeShareLink(req.params.shareId);

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: document.team,
      project: document.project,
      document: document._id,
      action: 'document_share_revoked',
      description: `Revoked share link for document "${document.title}"`
    });

    res.json({
      success: true,
      message: 'Share link revoked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add user to document
// @route   POST /api/v1/collaboration/documents/:id/users
// @access  Private
export const addDocumentUser = async (req, res, next) => {
  try {
    const document = await CollabDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check permission
    if (!document.canEdit(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const { userId, permission = 'view' } = req.body;

    await document.addUser(userId, permission);

    const updatedDocument = await CollabDocument.findById(document._id)
      .populate('permissions.user', 'name email avatar');

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: document.team,
      project: document.project,
      document: document._id,
      action: 'document_user_added',
      description: `Added user to document`,
      targetUser: userId,
      metadata: { permission }
    });

    res.json({
      success: true,
      data: updatedDocument
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove user from document
// @route   DELETE /api/v1/collaboration/documents/:id/users/:userId
// @access  Private
export const removeDocumentUser = async (req, res, next) => {
  try {
    const document = await CollabDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check permission
    if (!document.canEdit(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    await document.removeUser(req.params.userId);

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: document.team,
      project: document.project,
      document: document._id,
      action: 'document_user_removed',
      description: `Removed user from document`,
      targetUser: req.params.userId
    });

    res.json({
      success: true,
      message: 'User removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get document versions
// @route   GET /api/v1/collaboration/documents/:id/versions
// @access  Private
export const getDocumentVersions = async (req, res, next) => {
  try {
    const document = await CollabDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check access
    if (!document.hasAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { limit = 20, skip = 0 } = req.query;

    const versions = await DocumentVersion.find({ document: document._id })
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await DocumentVersion.countDocuments({ document: document._id });

    res.json({
      success: true,
      data: versions,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore document version
// @route   POST /api/v1/collaboration/documents/:id/versions/:versionId/restore
// @access  Private
export const restoreDocumentVersion = async (req, res, next) => {
  try {
    const document = await CollabDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check permission
    if (!document.canEdit(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const version = await DocumentVersion.findById(req.params.versionId);

    if (!version || version.document.toString() !== document._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Version not found'
      });
    }

    // Save current state as version before restoring
    await DocumentVersion.create({
      document: document._id,
      version: document.version,
      content: document.content,
      createdBy: req.user._id,
      changeDescription: 'Backup before version restore'
    });

    // Restore version
    document.content = version.content;
    document.version += 1;
    await document.save();

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: document.team,
      project: document.project,
      document: document._id,
      action: 'document_version_restored',
      description: `Restored document to version ${version.version}`,
      metadata: { versionId: version._id, version: version.version }
    });

    res.json({
      success: true,
      data: document,
      message: 'Version restored successfully'
    });
  } catch (error) {
    next(error);
  }
};
