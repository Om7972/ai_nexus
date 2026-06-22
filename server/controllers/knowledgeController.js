import KnowledgeFile from '../models/KnowledgeFile.js';
import KnowledgeProcessingService from '../services/knowledgeProcessingService.js';
import ragService from '../services/ragService.js';
import path from 'path';
import fs from 'fs/promises';

// @desc    Upload knowledge file
// @route   POST /api/knowledge/upload
// @access  Private
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { collection = 'personal', tags } = req.body;

    // Get file extension
    const fileExt = path.extname(req.file.originalname).toLowerCase().substring(1);
    
    // Validate file type
    const allowedTypes = ['pdf', 'docx', 'txt', 'csv'];
    if (!allowedTypes.includes(fileExt)) {
      return res.status(400).json({
        success: false,
        message: `File type not supported. Allowed: ${allowedTypes.join(', ')}`
      });
    }

    // Create knowledge file record
    const knowledgeFile = await KnowledgeFile.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: fileExt,
      fileSize: req.file.size,
      filePath: req.file.path,
      collection,
      owner: req.user._id,
      tags: tags ? JSON.parse(tags) : [],
      processingStatus: 'pending'
    });

    // Process file asynchronously
    KnowledgeProcessingService.processFile(knowledgeFile._id)
      .catch(error => {
        console.error('File processing error:', error);
      });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully. Processing started.',
      data: knowledgeFile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all knowledge files
// @route   GET /api/knowledge/files
// @access  Private
export const getFiles = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      collection, 
      fileType, 
      status,
      search 
    } = req.query;

    // Build query
    let query = {
      $or: [
        { owner: req.user._id },
        { isPublic: true },
        { 'sharedWith.user': req.user._id }
      ]
    };

    if (collection) {
      query.collection = collection;
    }

    if (fileType) {
      query.fileType = fileType;
    }

    if (status) {
      query.processingStatus = status;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const files = await KnowledgeFile.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-filePath')
      .lean();

    const total = await KnowledgeFile.countDocuments(query);

    res.json({
      success: true,
      data: files,
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

// @desc    Get single file
// @route   GET /api/knowledge/files/:id
// @access  Private
export const getFile = async (req, res, next) => {
  try {
    const file = await KnowledgeFile.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('sharedWith.user', 'name email');

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check access
    if (!file.hasAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: file
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update file
// @route   PATCH /api/knowledge/files/:id
// @access  Private
export const updateFile = async (req, res, next) => {
  try {
    const file = await KnowledgeFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check ownership
    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this file'
      });
    }

    const { originalName, collection, tags, isPublic } = req.body;

    if (originalName) file.originalName = originalName;
    if (collection) file.collection = collection;
    if (tags) file.tags = tags;
    if (isPublic !== undefined) file.isPublic = isPublic;

    await file.save();

    res.json({
      success: true,
      data: file
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete file
// @route   DELETE /api/knowledge/files/:id
// @access  Private
export const deleteFile = async (req, res, next) => {
  try {
    const file = await KnowledgeFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check ownership
    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this file'
      });
    }

    // Delete file and all associated data
    await KnowledgeProcessingService.deleteFile(file._id);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search knowledge base
// @route   POST /api/knowledge/search
// @access  Private
export const searchKnowledge = async (req, res, next) => {
  try {
    const { query, fileIds, limit = 10, threshold = 0.7 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    // Verify user has access to specified files
    let accessibleFileIds = fileIds;
    if (fileIds && fileIds.length > 0) {
      const files = await KnowledgeFile.find({
        _id: { $in: fileIds },
        $or: [
          { owner: req.user._id },
          { isPublic: true },
          { 'sharedWith.user': req.user._id }
        ]
      });
      accessibleFileIds = files.map(f => f._id);
    } else {
      // Search all accessible files
      const files = await KnowledgeFile.getAccessibleFiles(req.user._id);
      accessibleFileIds = files.map(f => f._id);
    }

    const results = await ragService.semanticSearch(
      query,
      accessibleFileIds,
      parseInt(limit),
      parseFloat(threshold)
    );

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Chat with knowledge base
// @route   POST /api/knowledge/chat
// @access  Private
export const chatWithKnowledge = async (req, res, next) => {
  try {
    const { message, sessionId, fileIds } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Verify file access
    let accessibleFileIds = fileIds;
    if (fileIds && fileIds.length > 0) {
      const files = await KnowledgeFile.find({
        _id: { $in: fileIds },
        $or: [
          { owner: req.user._id },
          { isPublic: true },
          { 'sharedWith.user': req.user._id }
        ]
      });
      accessibleFileIds = files.map(f => f._id);
    }

    // Pass userId for session creation
    const modifiedFileIds = accessibleFileIds || [req.user._id];

    const result = await ragService.chat(sessionId, message, modifiedFileIds);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat sessions
// @route   GET /api/knowledge/chat/sessions
// @access  Private
export const getChatSessions = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const sessions = await ragService.listChatSessions(req.user._id, parseInt(limit));

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat session
// @route   GET /api/knowledge/chat/sessions/:id
// @access  Private
export const getChatSession = async (req, res, next) => {
  try {
    const session = await ragService.getChatHistory(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Check ownership
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete chat session
// @route   DELETE /api/knowledge/chat/sessions/:id
// @access  Private
export const deleteChatSession = async (req, res, next) => {
  try {
    const session = await ragService.getChatHistory(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Check ownership
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await ragService.deleteChatSession(req.params.id);

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get statistics
// @route   GET /api/knowledge/stats
// @access  Private
export const getStatistics = async (req, res, next) => {
  try {
    const stats = await KnowledgeProcessingService.getStatistics(req.user._id);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reprocess file
// @route   POST /api/knowledge/files/:id/reprocess
// @access  Private
export const reprocessFile = async (req, res, next) => {
  try {
    const file = await KnowledgeFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check ownership
    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Reprocess asynchronously
    KnowledgeProcessingService.reprocessFile(file._id)
      .catch(error => {
        console.error('Reprocessing error:', error);
      });

    res.json({
      success: true,
      message: 'File reprocessing started'
    });
  } catch (error) {
    next(error);
  }
};
