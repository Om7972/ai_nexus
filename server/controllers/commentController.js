import CollabComment from '../models/CollabComment.js';
import CollabDocument from '../models/CollabDocument.js';
import CollabActivity from '../models/CollabActivity.js';

// @desc    Create comment
// @route   POST /api/v1/collaboration/comments
// @access  Private
export const createComment = async (req, res, next) => {
  try {
    const { document, content, position, mentions, parentComment } = req.body;

    // Check if user has access to document
    const documentDoc = await CollabDocument.findById(document);
    if (!documentDoc) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (!documentDoc.hasAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to document'
      });
    }

    const comment = await CollabComment.create({
      document,
      author: req.user._id,
      content,
      position,
      mentions,
      parentComment
    });

    await comment.populate('author', 'name email avatar');

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: documentDoc.team,
      project: documentDoc.project,
      document,
      action: 'comment_added',
      description: `Added comment on document "${documentDoc.title}"`,
      metadata: { commentId: comment._id }
    });

    // Emit socket event for real-time updates
    // (Socket service will handle this)

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for document
// @route   GET /api/v1/collaboration/comments
// @access  Private
export const getComments = async (req, res, next) => {
  try {
    const { document, parentComment, resolved } = req.query;

    if (!document) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required'
      });
    }

    // Check if user has access to document
    const documentDoc = await CollabDocument.findById(document);
    if (!documentDoc) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (!documentDoc.hasAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to document'
      });
    }

    const query = { document };

    // Filter by parent comment (get replies or top-level comments)
    if (parentComment) {
      query.parentComment = parentComment;
    } else {
      query.parentComment = null; // Only top-level comments
    }

    // Filter by resolved status
    if (resolved !== undefined) {
      query.isResolved = resolved === 'true';
    }

    const comments = await CollabComment.find(query)
      .populate('author', 'name email avatar')
      .populate('resolvedBy', 'name email avatar')
      .populate('mentions', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single comment with replies
// @route   GET /api/v1/collaboration/comments/:id
// @access  Private
export const getComment = async (req, res, next) => {
  try {
    const comment = await CollabComment.findById(req.params.id)
      .populate('author', 'name email avatar')
      .populate('resolvedBy', 'name email avatar')
      .populate('mentions', 'name email avatar')
      .populate('document', 'title');

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check access to document
    const document = await CollabDocument.findById(comment.document._id);
    if (!document.hasAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get replies
    const replies = await CollabComment.find({ parentComment: comment._id })
      .populate('author', 'name email avatar')
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      success: true,
      data: {
        ...comment.toObject(),
        replies
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update comment
// @route   PATCH /api/v1/collaboration/comments/:id
// @access  Private
export const updateComment = async (req, res, next) => {
  try {
    const comment = await CollabComment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Only author can edit
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own comments'
      });
    }

    const { content } = req.body;

    if (content) {
      comment.content = content;
      comment.isEdited = true;
    }

    await comment.save();

    await comment.populate('author', 'name email avatar');

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/v1/collaboration/comments/:id
// @access  Private
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await CollabComment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Only author can delete
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments'
      });
    }

    // Delete all replies first
    await CollabComment.deleteMany({ parentComment: comment._id });

    await comment.deleteOne();

    // Log activity
    const document = await CollabDocument.findById(comment.document);
    if (document) {
      await CollabActivity.log({
        user: req.user._id,
        team: document.team,
        project: document.project,
        document: document._id,
        action: 'comment_deleted',
        description: `Deleted comment`
      });
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve comment
// @route   POST /api/v1/collaboration/comments/:id/resolve
// @access  Private
export const resolveComment = async (req, res, next) => {
  try {
    const comment = await CollabComment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check document access
    const document = await CollabDocument.findById(comment.document);
    if (!document.hasAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    comment.isResolved = true;
    comment.resolvedBy = req.user._id;
    comment.resolvedAt = new Date();

    await comment.save();
    await comment.populate('resolvedBy', 'name email avatar');

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: document.team,
      project: document.project,
      document: document._id,
      action: 'comment_resolved',
      description: `Resolved comment`,
      metadata: { commentId: comment._id }
    });

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unresolve comment
// @route   POST /api/v1/collaboration/comments/:id/unresolve
// @access  Private
export const unresolveComment = async (req, res, next) => {
  try {
    const comment = await CollabComment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check document access
    const document = await CollabDocument.findById(comment.document);
    if (!document.hasAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    comment.isResolved = false;
    comment.resolvedBy = null;
    comment.resolvedAt = null;

    await comment.save();

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: document.team,
      project: document.project,
      document: document._id,
      action: 'comment_unresolved',
      description: `Reopened comment`,
      metadata: { commentId: comment._id }
    });

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add reaction to comment
// @route   POST /api/v1/collaboration/comments/:id/reactions
// @access  Private
export const addReaction = async (req, res, next) => {
  try {
    const comment = await CollabComment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check document access
    const document = await CollabDocument.findById(comment.document);
    if (!document.hasAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required'
      });
    }

    // Check if user already reacted with this emoji
    const existingReaction = comment.reactions.find(
      r => r.user.toString() === req.user._id.toString() && r.emoji === emoji
    );

    if (existingReaction) {
      return res.status(400).json({
        success: false,
        message: 'You already reacted with this emoji'
      });
    }

    comment.reactions.push({
      user: req.user._id,
      emoji
    });

    await comment.save();
    await comment.populate('reactions.user', 'name email avatar');

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove reaction from comment
// @route   DELETE /api/v1/collaboration/comments/:id/reactions/:reactionId
// @access  Private
export const removeReaction = async (req, res, next) => {
  try {
    const comment = await CollabComment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check document access
    const document = await CollabDocument.findById(comment.document);
    if (!document.hasAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const reaction = comment.reactions.id(req.params.reactionId);

    if (!reaction) {
      return res.status(404).json({
        success: false,
        message: 'Reaction not found'
      });
    }

    // Only reaction owner can remove it
    if (reaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only remove your own reactions'
      });
    }

    reaction.deleteOne();
    await comment.save();

    res.json({
      success: true,
      message: 'Reaction removed successfully'
    });
  } catch (error) {
    next(error);
  }
};
