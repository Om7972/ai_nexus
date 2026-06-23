/**
 * projectController.js  –  /api/v1/projects
 *
 * Routes:
 *   GET    /               Browse projects (own + collaborating + public)
 *   POST   /               Create project
 *   GET    /:id            Get project detail
 *   PATCH  /:id            Update project (owner | editor | admin)
 *   DELETE /:id            Soft-delete    (owner | admin)
 *   POST   /:id/models     Attach AI model to project
 *   DELETE /:id/models/:modelId  Detach model
 *   POST   /:id/collaborators    Add collaborator
 *   DELETE /:id/collaborators/:userId  Remove collaborator
 *   GET    /:id/activity   Project activity log
 */

import Project from '../models/Project.js';
import Workspace from '../models/Workspace.js';
import ActivityLog, { LOG_ACTIONS } from '../models/ActivityLog.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { buildQuery, parseId } from '../utils/queryBuilder.js';

// ── Permission helper ─────────────────────────────────────────────────────────
function assertCanEdit(project, userId, userRole) {
    const isOwner = project.createdBy.toString() === userId.toString();
    const isEditor = project.collaborators?.some(
        (c) => c.user.toString() === userId.toString() && c.role === 'editor'
    );
    if (!isOwner && !isEditor && userRole !== 'admin') {
        throw new AppError('You do not have permission to edit this project.', 403);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// GET /projects
// ══════════════════════════════════════════════════════════════════════════════
export const listProjects = catchAsync(async (req, res) => {
    const isAdmin = req.user.role === 'admin';

    // Admin sees all; users see own + collaborative + public
    const baseFilter = isAdmin ? {} : {
        $or: [
            { createdBy: req.user._id },
            { 'collaborators.user': req.user._id },
            { visibility: 'public' },
        ],
    };

    const { data, meta } = await buildQuery(Project, req.query, {
        searchFields: ['name', 'description', 'tags'],
        defaultSort: '-updatedAt',
        allowedFilters: ['type', 'status', 'visibility'],
        baseFilter,
        populate: [
            { path: 'createdBy', select: 'name avatar' },
            { path: 'workspace', select: 'name slug' },
        ],
    });

    sendPaginated(res, data, meta, 'Projects retrieved.');
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /projects
// ══════════════════════════════════════════════════════════════════════════════
export const createProject = catchAsync(async (req, res, next) => {
    const { name, description, type, visibility, tags, workspace: workspaceId } = req.body;

    if (!workspaceId) return next(new AppError('workspace is required.', 400));
    parseId(workspaceId, 'Workspace ID');

    // Verify user is a member of the workspace
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return next(new AppError('Workspace not found.', 404));
    if (!workspace.hasRole(req.user._id, 'member') && req.user.role !== 'admin') {
        return next(new AppError('You are not a member of this workspace.', 403));
    }

    const project = await Project.create({
        name, description, type, visibility, tags,
        workspace: workspaceId,
        createdBy: req.user._id,
    });

    // Increment workspace project counter
    await Workspace.findByIdAndUpdate(workspaceId, { $inc: { 'usage.projectCount': 1 } });

    await ActivityLog.log({
        user: req.user._id,
        action: LOG_ACTIONS.PROJECT_CREATED,
        workspace: workspaceId,
        project: project._id,
        ip: req.ip,
    });

    sendSuccess(res, 201, { project }, 'Project created successfully.');
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /projects/:id
// ══════════════════════════════════════════════════════════════════════════════
export const getProject = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Project ID');

    const project = await Project.findById(req.params.id)
        .populate('createdBy', 'name avatar email')
        .populate('workspace', 'name slug plan')
        .populate('modelConfigs.model', 'name category provider')
        .populate('collaborators.user', 'name avatar');

    if (!project) return next(new AppError('Project not found.', 404));

    // Access check
    if (!project.canAccess(req.user._id) && req.user.role !== 'admin') {
        return next(new AppError('You do not have access to this project.', 403));
    }

    sendSuccess(res, 200, { project });
});

// ══════════════════════════════════════════════════════════════════════════════
// PATCH /projects/:id
// ══════════════════════════════════════════════════════════════════════════════
export const updateProject = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Project ID');

    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError('Project not found.', 404));
    assertCanEdit(project, req.user._id, req.user.role);

    const ALLOWED = ['name', 'description', 'type', 'visibility', 'tags', 'status', 'thumbnail'];
    const updates = Object.fromEntries(
        Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );

    const prevStatus = project.status;
    const updated = await Project.findByIdAndUpdate(req.params.id, updates, {
        new: true, runValidators: true,
    });

    const action = updates.status && updates.status !== prevStatus
        ? LOG_ACTIONS.PROJECT_STATUS_CHANGED
        : LOG_ACTIONS.PROJECT_UPDATED;

    await ActivityLog.log({
        user: req.user._id, action,
        project: project._id,
        workspace: project.workspace,
        metadata: { updatedFields: Object.keys(updates), prevStatus, newStatus: updates.status },
        ip: req.ip,
    });

    sendSuccess(res, 200, { project: updated }, 'Project updated.');
});

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /projects/:id
// ══════════════════════════════════════════════════════════════════════════════
export const deleteProject = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Project ID');

    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError('Project not found.', 404));

    const isOwner = project.createdBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
        return next(new AppError('Only the project owner or an admin can delete this project.', 403));
    }

    await project.softDelete();
    await Workspace.findByIdAndUpdate(project.workspace, { $inc: { 'usage.projectCount': -1 } });

    await ActivityLog.log({
        user: req.user._id,
        action: LOG_ACTIONS.PROJECT_DELETED,
        project: project._id,
        workspace: project.workspace,
        ip: req.ip,
    });

    sendSuccess(res, 200, null, 'Project deleted.');
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /projects/:id/models  – attach an AI model
// ══════════════════════════════════════════════════════════════════════════════
export const attachModel = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Project ID');
    const { modelId, parameters } = req.body;
    if (!modelId) return next(new AppError('modelId is required.', 400));
    parseId(modelId, 'Model ID');

    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError('Project not found.', 404));
    assertCanEdit(project, req.user._id, req.user.role);

    await project.attachModel(modelId, parameters || {});

    await ActivityLog.log({
        user: req.user._id,
        action: LOG_ACTIONS.PROJECT_MODEL_ATTACHED,
        project: project._id,
        aiModel: modelId,
        ip: req.ip,
    });

    sendSuccess(res, 200, { project }, 'Model attached to project.');
});

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /projects/:id/models/:modelId  – detach a model
// ══════════════════════════════════════════════════════════════════════════════
export const detachModel = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Project ID');
    parseId(req.params.modelId, 'Model ID');

    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError('Project not found.', 404));
    assertCanEdit(project, req.user._id, req.user.role);

    project.modelConfigs = project.modelConfigs.filter(
        (c) => c.model.toString() !== req.params.modelId
    );
    await project.save({ validateBeforeSave: false });

    sendSuccess(res, 200, { project }, 'Model detached from project.');
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /projects/:id/collaborators  – add collaborator
// ══════════════════════════════════════════════════════════════════════════════
export const addCollaborator = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Project ID');
    const { userId, role } = req.body;
    if (!userId) return next(new AppError('userId is required.', 400));
    parseId(userId, 'User ID');

    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError('Project not found.', 404));
    assertCanEdit(project, req.user._id, req.user.role);

    if (project.createdBy.toString() === userId) {
        return next(new AppError('The project owner is already an implicit collaborator.', 400));
    }

    await project.addCollaborator(userId, role || 'viewer');

    await ActivityLog.log({
        user: req.user._id,
        action: LOG_ACTIONS.PROJECT_COLLABORATOR_ADDED,
        project: project._id,
        metadata: { targetUser: userId, role },
        ip: req.ip,
    });

    sendSuccess(res, 200, { project }, 'Collaborator added.');
});

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /projects/:id/collaborators/:userId
// ══════════════════════════════════════════════════════════════════════════════
export const removeCollaborator = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Project ID');
    parseId(req.params.userId, 'User ID');

    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError('Project not found.', 404));
    assertCanEdit(project, req.user._id, req.user.role);

    project.collaborators = project.collaborators.filter(
        (c) => c.user.toString() !== req.params.userId
    );
    await project.save({ validateBeforeSave: false });

    sendSuccess(res, 200, { project }, 'Collaborator removed.');
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /projects/:id/activity
// ══════════════════════════════════════════════════════════════════════════════
export const getProjectActivity = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Project ID');

    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError('Project not found.', 404));
    if (!project.canAccess(req.user._id) && req.user.role !== 'admin') {
        return next(new AppError('Access denied.', 403));
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);

    const [data, total] = await Promise.all([
        ActivityLog.find({ project: req.params.id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('user', 'name avatar')
            .lean(),
        ActivityLog.countDocuments({ project: req.params.id }),
    ]);

    sendPaginated(res, data, { page, limit, total }, 'Project activity retrieved.');
});
