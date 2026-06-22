import CollabActivity from '../models/CollabActivity.js';
import Team from '../models/Team.js';
import CollabProject from '../models/CollabProject.js';
import CollabDocument from '../models/CollabDocument.js';

// @desc    Get team activities
// @route   GET /api/v1/collaboration/activities/team/:teamId
// @access  Private
export const getTeamActivities = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { limit = 50, skip = 0, actionType } = req.query;

    // Check if user is team member
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (!team.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const query = { team: teamId };

    if (actionType) {
      query.action = actionType;
    }

    const activities = await CollabActivity.find(query)
      .populate('user', 'name email avatar')
      .populate('targetUser', 'name email avatar')
      .populate('project', 'name')
      .populate('document', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await CollabActivity.countDocuments(query);

    res.json({
      success: true,
      data: activities,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project activities
// @route   GET /api/v1/collaboration/activities/project/:projectId
// @access  Private
export const getProjectActivities = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { limit = 50, skip = 0, actionType } = req.query;

    // Check if user has access to project
    const project = await CollabProject.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (!project.isMember(req.user._id) && project.visibility !== 'public') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const query = { project: projectId };

    if (actionType) {
      query.action = actionType;
    }

    const activities = await CollabActivity.find(query)
      .populate('user', 'name email avatar')
      .populate('targetUser', 'name email avatar')
      .populate('document', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await CollabActivity.countDocuments(query);

    res.json({
      success: true,
      data: activities,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get document activities
// @route   GET /api/v1/collaboration/activities/document/:documentId
// @access  Private
export const getDocumentActivities = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { limit = 50, skip = 0, actionType } = req.query;

    // Check if user has access to document
    const document = await CollabDocument.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (!document.hasAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const query = { document: documentId };

    if (actionType) {
      query.action = actionType;
    }

    const activities = await CollabActivity.find(query)
      .populate('user', 'name email avatar')
      .populate('targetUser', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await CollabActivity.countDocuments(query);

    res.json({
      success: true,
      data: activities,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's recent activities
// @route   GET /api/v1/collaboration/activities/user
// @access  Private
export const getUserActivities = async (req, res, next) => {
  try {
    const { limit = 50, skip = 0, actionType } = req.query;

    const query = { user: req.user._id };

    if (actionType) {
      query.action = actionType;
    }

    const activities = await CollabActivity.find(query)
      .populate('team', 'name avatar')
      .populate('project', 'name')
      .populate('document', 'title')
      .populate('targetUser', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await CollabActivity.countDocuments(query);

    res.json({
      success: true,
      data: activities,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity statistics for team
// @route   GET /api/v1/collaboration/activities/team/:teamId/stats
// @access  Private
export const getTeamActivityStats = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { days = 30 } = req.query;

    // Check if user is team member
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (!team.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get activity counts by action type
    const activityByType = await CollabActivity.aggregate([
      {
        $match: {
          team: team._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get most active users
    const mostActiveUsers = await CollabActivity.aggregate([
      {
        $match: {
          team: team._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$user',
          activityCount: { $sum: 1 }
        }
      },
      {
        $sort: { activityCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          activityCount: 1,
          'user.name': 1,
          'user.email': 1,
          'user.avatar': 1
        }
      }
    ]);

    // Get daily activity counts
    const dailyActivity = await CollabActivity.aggregate([
      {
        $match: {
          team: team._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get total activity count
    const totalActivities = await CollabActivity.countDocuments({
      team: team._id,
      createdAt: { $gte: startDate }
    });

    res.json({
      success: true,
      data: {
        totalActivities,
        activityByType,
        mostActiveUsers,
        dailyActivity,
        period: {
          days: parseInt(days),
          startDate,
          endDate: new Date()
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete old activities (cleanup)
// @route   DELETE /api/v1/collaboration/activities/cleanup
// @access  Private (Admin only)
export const cleanupOldActivities = async (req, res, next) => {
  try {
    const { days = 90 } = req.body;

    // This should have admin check - for now checking if user has any teams
    const teams = await Team.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.role': 'owner' }
      ]
    });

    if (teams.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = await CollabActivity.deleteMany({
      team: { $in: teams.map(t => t._id) },
      createdAt: { $lt: cutoffDate }
    });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} activities older than ${days} days`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
