import CollabProject from '../models/CollabProject.js';
import Team from '../models/Team.js';
import CollabActivity from '../models/CollabActivity.js';

// @desc    Create project
// @route   POST /api/v1/collaboration/projects
// @access  Private
export const createProject = async (req, res, next) => {
  try {
    const { name, description, team, visibility, tags } = req.body;

    // Check if user is team member
    const teamDoc = await Team.findById(team);
    if (!teamDoc) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (!teamDoc.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this team'
      });
    }

    const project = await CollabProject.create({
      name,
      description,
      team,
      owner: req.user._id,
      members: [{
        user: req.user._id,
        role: 'owner'
      }],
      visibility,
      tags
    });

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team,
      project: project._id,
      action: 'project_created',
      description: `Created project "${name}"`
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects
// @route   GET /api/v1/collaboration/projects
// @access  Private
export const getProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, team, status, search } = req.query;

    const query = {
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id },
        { visibility: 'public' }
      ]
    };

    if (team) {
      query.team = team;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const projects = await CollabProject.find(query)
      .populate('team', 'name avatar')
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await CollabProject.countDocuments(query);

    res.json({
      success: true,
      data: projects,
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

// @desc    Get single project
// @route   GET /api/v1/collaboration/projects/:id
// @access  Private
export const getProject = async (req, res, next) => {
  try {
    const project = await CollabProject.findById(req.params.id)
      .populate('team', 'name avatar')
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check access
    if (project.visibility === 'private' && !project.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PATCH /api/v1/collaboration/projects/:id
// @access  Private
export const updateProject = async (req, res, next) => {
  try {
    const project = await CollabProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permission
    if (!project.hasPermission(req.user._id, 'editor')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const { name, description, status, visibility, tags, settings } = req.body;

    if (name) project.name = name;
    if (description) project.description = description;
    if (status) project.status = status;
    if (visibility) project.visibility = visibility;
    if (tags) project.tags = tags;
    if (settings) project.settings = { ...project.settings, ...settings };

    await project.save();

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: project.team,
      project: project._id,
      action: 'project_updated',
      description: `Updated project "${project.name}"`
    });

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/v1/collaboration/projects/:id
// @access  Private
export const deleteProject = async (req, res, next) => {
  try {
    const project = await CollabProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Only owner can delete
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can delete project'
      });
    }

    await project.deleteOne();

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: project.team,
      project: project._id,
      action: 'project_deleted',
      description: `Deleted project "${project.name}"`
    });

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add project member
// @route   POST /api/v1/collaboration/projects/:id/members
// @access  Private
export const addProjectMember = async (req, res, next) => {
  try {
    const project = await CollabProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permission
    if (!project.hasPermission(req.user._id, 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const { userId, role = 'viewer' } = req.body;

    await project.addMember(userId, role);

    const updatedProject = await CollabProject.findById(project._id)
      .populate('members.user', 'name email avatar');

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: project.team,
      project: project._id,
      action: 'project_member_added',
      description: `Added member to project`,
      targetUser: userId
    });

    res.json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove project member
// @route   DELETE /api/v1/collaboration/projects/:id/members/:userId
// @access  Private
export const removeProjectMember = async (req, res, next) => {
  try {
    const project = await CollabProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permission
    if (!project.hasPermission(req.user._id, 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    // Cannot remove owner
    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove project owner'
      });
    }

    await project.removeMember(req.params.userId);

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: project.team,
      project: project._id,
      action: 'project_member_removed',
      description: `Removed member from project`,
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

// @desc    Update project member role
// @route   PATCH /api/v1/collaboration/projects/:id/members/:userId
// @access  Private
export const updateProjectMemberRole = async (req, res, next) => {
  try {
    const project = await CollabProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permission
    if (!project.hasPermission(req.user._id, 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const { role } = req.body;

    // Cannot change owner role
    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change owner role'
      });
    }

    await project.updateMemberRole(req.params.userId, role);

    // Log activity
    await CollabActivity.log({
      user: req.user._id,
      team: project.team,
      project: project._id,
      action: 'project_member_role_changed',
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

// @desc    Get project activities
// @route   GET /api/v1/collaboration/projects/:id/activities
// @access  Private
export const getProjectActivities = async (req, res, next) => {
  try {
    const project = await CollabProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check access
    if (!project.isMember(req.user._id) && project.visibility !== 'public') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { limit = 50, skip = 0 } = req.query;

    const activities = await CollabActivity.getProjectActivities(
      project._id,
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
