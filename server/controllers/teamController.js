import Team from '../models/Team.js';
import CollabActivity from '../models/CollabActivity.js';

// @desc    Create team
// @route   POST /api/v1/collaboration/teams
// @access  Private
export const createTeam = async (req, res, next) => {
  try {
    const { name, description, settings } = req.body;

    const team = await Team.create({
      name,
      description,
      owner: req.user._id,
      members: [{
        user: req.user._id,
        role: 'owner'
      }],
      settings
    });

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: team._id,
      action: 'team_created',
      description: `Created team "${name}"`
    });

    res.status(201).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all teams for user
// @route   GET /api/v1/collaboration/teams
// @access  Private
export const getTeams = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const query = {
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ],
      isActive: true
    };

    if (search) {
      query.$text = { $search: search };
    }

    const teams = await Team.find(query)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Team.countDocuments(query);

    res.json({
      success: true,
      data: teams,
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

// @desc    Get single team
// @route   GET /api/v1/collaboration/teams/:id
// @access  Private
export const getTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is member
    if (!team.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update team
// @route   PATCH /api/v1/collaboration/teams/:id
// @access  Private
export const updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check permission (only admin or owner can update)
    if (!team.hasPermission(req.user._id, 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const { name, description, settings } = req.body;

    if (name) team.name = name;
    if (description) team.description = description;
    if (settings) team.settings = { ...team.settings, ...settings };

    await team.save();

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: team._id,
      action: 'team_updated',
      description: `Updated team "${team.name}"`
    });

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete team
// @route   DELETE /api/v1/collaboration/teams/:id
// @access  Private
export const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Only owner can delete
    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only team owner can delete team'
      });
    }

    await team.deleteOne();

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: team._id,
      action: 'team_deleted',
      description: `Deleted team "${team.name}"`
    });

    res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add team member
// @route   POST /api/v1/collaboration/teams/:id/members
// @access  Private
export const addMember = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check permission
    if (!team.hasPermission(req.user._id, 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const { userId, role = 'viewer' } = req.body;

    await team.addMember(userId, role);

    const updatedTeam = await Team.findById(team._id)
      .populate('members.user', 'name email avatar');

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: team._id,
      action: 'team_member_added',
      description: `Added member to team`,
      targetUser: userId
    });

    res.json({
      success: true,
      data: updatedTeam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove team member
// @route   DELETE /api/v1/collaboration/teams/:id/members/:userId
// @access  Private
export const removeMember = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check permission
    if (!team.hasPermission(req.user._id, 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    // Cannot remove owner
    if (team.owner.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove team owner'
      });
    }

    await team.removeMember(req.params.userId);

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: team._id,
      action: 'team_member_removed',
      description: `Removed member from team`,
      targetUser: req.params.userId
    });

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update member role
// @route   PATCH /api/v1/collaboration/teams/:id/members/:userId
// @access  Private
export const updateMemberRole = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check permission
    if (!team.hasPermission(req.user._id, 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const { role } = req.body;

    // Cannot change owner role
    if (team.owner.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change owner role'
      });
    }

    await team.updateMemberRole(req.params.userId, role);

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: team._id,
      action: 'team_member_role_changed',
      description: `Changed member role to ${role}`,
      targetUser: req.params.userId,
      metadata: { newRole: role }
    });

    res.json({
      success: true,
      message: 'Member role updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get team activities
// @route   GET /api/v1/collaboration/teams/:id/activities
// @access  Private
export const getTeamActivities = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is member
    if (!team.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { limit = 50, skip = 0 } = req.query;

    const activities = await CollabActivity.getTeamActivities(
      team._id,
      parseInt(limit),
      parseInt(skip)
    );

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};
