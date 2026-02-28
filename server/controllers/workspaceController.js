/**
 * workspaceController.js  –  /api/v1/workspaces
 *
 * Routes:
 *   GET    /                  Workspaces for current user
 *   POST   /                  Create workspace
 *   GET    /:id               Get workspace detail
 *   PATCH  /:id               Update workspace  (owner | admin)
 *   DELETE /:id               Soft-delete       (owner | admin)
 *   GET    /:id/members       List members
 *   POST   /:id/members       Add member
 *   PATCH  /:id/members/:uid  Change member role
 *   DELETE /:id/members/:uid  Remove member
 *   GET    /:id/projects      Projects in workspace
 *   GET    /:id/activity      Workspace activity log
 */

import Workspace from '../models/Workspace.js';
import Project from '../models/Project.js';
import TextGeneration from '../models/TextGeneration.js';
import ImageAsset from '../models/ImageAsset.js';
import ActivityLog, { LOG_ACTIONS } from '../models/ActivityLog.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { buildQuery, parseId } from '../utils/queryBuilder.js';

// ── Permission helpers ────────────────────────────────────────────────────────
async function requireWorkspace(id, next) {
    const w = await Workspace.findById(id)
        .populate('members.user', 'name avatar email');
    if (!w) { next(new AppError('Workspace not found.', 404)); return null; }
    return w;
}

function assertRole(workspace, userId, minRole, next) {
    if (!workspace.hasRole(userId, minRole)) {
        next(new AppError(`Requires at least "${minRole}" role in this workspace.`, 403));
        return false;
    }
    return true;
}

// ══════════════════════════════════════════════════════════════════════════════
// GET /workspaces
// ══════════════════════════════════════════════════════════════════════════════
export const listWorkspaces = catchAsync(async (req, res) => {
    const isAdmin = req.user.role === 'admin';
    const baseFilter = isAdmin ? {} : { 'members.user': req.user._id };

    const { data, meta } = await buildQuery(Workspace, req.query, {
        searchFields: ['name', 'description'],
        defaultSort: '-createdAt',
        allowedFilters: ['plan', 'isPublic'],
        baseFilter,
        populate: [{ path: 'owner', select: 'name avatar' }],
    });

    sendPaginated(res, data, meta, 'Workspaces retrieved.');
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /workspaces
// ══════════════════════════════════════════════════════════════════════════════
export const createWorkspace = catchAsync(async (req, res) => {
    const { name, description, plan, isPublic } = req.body;

    const workspace = await Workspace.create({
        name, description, plan, isPublic,
        owner: req.user._id,
        createdBy: req.user._id,
    });

    await ActivityLog.log({
        user: req.user._id,
        action: LOG_ACTIONS.WORKSPACE_CREATED,
        workspace: workspace._id,
        ip: req.ip,
    });

    sendSuccess(res, 201, { workspace }, 'Workspace created successfully.');
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /workspaces/:id
// ══════════════════════════════════════════════════════════════════════════════
export const getWorkspace = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Workspace ID');

    const workspace = await Workspace.findById(req.params.id)
        .populate('owner', 'name avatar email')
        .populate('members.user', 'name avatar email')
        .populate('settings.defaultAIModel', 'name category');

    if (!workspace) return next(new AppError('Workspace not found.', 404));

    // Must be a member or admin, or workspace is public
    const canView = workspace.isPublic
        || req.user.role === 'admin'
        || workspace.hasRole(req.user._id, 'viewer');

    if (!canView) return next(new AppError('Access denied.', 403));

    sendSuccess(res, 200, { workspace });
});

// ══════════════════════════════════════════════════════════════════════════════
// PATCH /workspaces/:id  (owner | admin)
// ══════════════════════════════════════════════════════════════════════════════
export const updateWorkspace = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Workspace ID');

    const workspace = await requireWorkspace(req.params.id, next);
    if (!workspace) return;
    if (!assertRole(workspace, req.user._id, 'admin', next) && req.user.role !== 'admin') return;

    const ALLOWED = ['name', 'description', 'avatar', 'plan', 'isPublic', 'settings'];
    const updates = Object.fromEntries(
        Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );

    const updated = await Workspace.findByIdAndUpdate(req.params.id, updates, {
        new: true, runValidators: true,
    });

    await ActivityLog.log({
        user: req.user._id,
        action: LOG_ACTIONS.WORKSPACE_UPDATED,
        workspace: workspace._id,
        metadata: { updatedFields: Object.keys(updates) },
        ip: req.ip,
    });

    sendSuccess(res, 200, { workspace: updated }, 'Workspace updated.');
});

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /workspaces/:id  (owner only | admin)
// ══════════════════════════════════════════════════════════════════════════════
export const deleteWorkspace = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Workspace ID');

    const workspace = await requireWorkspace(req.params.id, next);
    if (!workspace) return;

    const isOwner = workspace.owner._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
        return next(new AppError('Only the owner or an admin can delete this workspace.', 403));
    }

    await workspace.softDelete();

    await ActivityLog.log({
        user: req.user._id,
        action: LOG_ACTIONS.WORKSPACE_DELETED,
        workspace: workspace._id,
        ip: req.ip,
    });

    sendSuccess(res, 200, null, 'Workspace deleted.');
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /workspaces/:id/members
// ══════════════════════════════════════════════════════════════════════════════
export const listMembers = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Workspace ID');

    const workspace = await Workspace.findById(req.params.id)
        .populate('members.user', 'name avatar email plan role');
    if (!workspace) return next(new AppError('Workspace not found.', 404));
    if (!workspace.hasRole(req.user._id, 'viewer') && req.user.role !== 'admin') {
        return next(new AppError('Access denied.', 403));
    }

    sendSuccess(res, 200, { members: workspace.members, total: workspace.members.length });
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /workspaces/:id/members  – add member (admin of workspace)
// ══════════════════════════════════════════════════════════════════════════════
export const addMember = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Workspace ID');
    const { userId, role } = req.body;
    if (!userId) return next(new AppError('userId is required.', 400));
    parseId(userId, 'User ID');

    const workspace = await requireWorkspace(req.params.id, next);
    if (!workspace) return;
    if (!assertRole(workspace, req.user._id, 'admin', next) && req.user.role !== 'admin') return;

    await workspace.addMember(userId, role || 'member', req.user._id);

    await ActivityLog.log({
        user: req.user._id,
        action: LOG_ACTIONS.WORKSPACE_MEMBER_ADDED,
        workspace: workspace._id,
        metadata: { targetUser: userId, role },
        ip: req.ip,
    });

    sendSuccess(res, 200, { members: workspace.members }, 'Member added.');
});

// ══════════════════════════════════════════════════════════════════════════════
// PATCH /workspaces/:id/members/:uid  – change member role
// ══════════════════════════════════════════════════════════════════════════════
export const changeMemberRole = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Workspace ID');
    parseId(req.params.uid, 'User ID');

    const { role } = req.body;
    const ROLES = ['viewer', 'member', 'admin', 'owner'];
    if (!role || !ROLES.includes(role)) {
        return next(new AppError(`role must be one of: ${ROLES.join(', ')}`, 400));
    }

    const workspace = await requireWorkspace(req.params.id, next);
    if (!workspace) return;
    if (!assertRole(workspace, req.user._id, 'admin', next) && req.user.role !== 'admin') return;

    const member = workspace.members.find(
        (m) => m.user._id.toString() === req.params.uid
    );
    if (!member) return next(new AppError('User is not a member of this workspace.', 404));

    member.role = role;
    await workspace.save({ validateBeforeSave: false });

    await ActivityLog.log({
        user: req.user._id,
        action: LOG_ACTIONS.WORKSPACE_MEMBER_ROLE_CHANGED,
        workspace: workspace._id,
        metadata: { targetUser: req.params.uid, newRole: role },
        ip: req.ip,
    });

    sendSuccess(res, 200, { members: workspace.members }, 'Member role updated.');
});

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /workspaces/:id/members/:uid  – remove member
// ══════════════════════════════════════════════════════════════════════════════
export const removeMember = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Workspace ID');
    parseId(req.params.uid, 'User ID');

    const workspace = await requireWorkspace(req.params.id, next);
    if (!workspace) return;

    // Members can leave themselves; admins can remove others
    const isSelf = req.user._id.toString() === req.params.uid;
    if (!isSelf && !assertRole(workspace, req.user._id, 'admin', next) && req.user.role !== 'admin') {
        return;
    }

    // Cannot remove the owner
    if (workspace.owner._id.toString() === req.params.uid) {
        return next(new AppError('Cannot remove the workspace owner.', 400));
    }

    await workspace.removeMember(req.params.uid);

    await ActivityLog.log({
        user: req.user._id,
        action: LOG_ACTIONS.WORKSPACE_MEMBER_REMOVED,
        workspace: workspace._id,
        metadata: { targetUser: req.params.uid },
        ip: req.ip,
    });

    sendSuccess(res, 200, null, isSelf ? 'You have left the workspace.' : 'Member removed.');
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /workspaces/:id/projects  – projects in this workspace
// ══════════════════════════════════════════════════════════════════════════════
export const listWorkspaceProjects = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Workspace ID');

    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return next(new AppError('Workspace not found.', 404));
    if (!workspace.hasRole(req.user._id, 'viewer') && req.user.role !== 'admin') {
        return next(new AppError('Access denied.', 403));
    }

    const { data, meta } = await buildQuery(Project, req.query, {
        searchFields: ['name', 'description'],
        defaultSort: '-updatedAt',
        allowedFilters: ['status', 'type', 'visibility'],
        baseFilter: { workspace: req.params.id },
        populate: [{ path: 'createdBy', select: 'name avatar' }],
    });

    sendPaginated(res, data, meta, 'Projects retrieved.');
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /workspaces/:id/activity
// ══════════════════════════════════════════════════════════════════════════════
export const getWorkspaceActivity = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Workspace ID');

    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return next(new AppError('Workspace not found.', 404));
    if (!workspace.hasRole(req.user._id, 'viewer') && req.user.role !== 'admin') {
        return next(new AppError('Access denied.', 403));
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);

    const [data, total] = await Promise.all([
        ActivityLog.auditForWorkspace(req.params.id, { page, limit }),
        ActivityLog.countDocuments({ workspace: req.params.id }),
    ]);

    sendPaginated(res, data, { page, limit, total }, 'Workspace activity retrieved.');
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /workspaces/:id/texts
// ══════════════════════════════════════════════════════════════════════════════
export const listWorkspaceTexts = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Workspace ID');

    const workspace = await requireWorkspace(req.params.id, next);
    if (!workspace) return;
    if (!workspace.hasRole(req.user._id, 'viewer') && req.user.role !== 'admin') {
        return next(new AppError('Access denied.', 403));
    }

    const { data, meta } = await buildQuery(TextGeneration, req.query, {
        defaultSort: '-createdAt',
        baseFilter: { workspace: req.params.id },
        populate: [{ path: 'user', select: 'name avatar' }],
    });

    sendPaginated(res, data, meta, 'Workspace text generations retrieved.');
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /workspaces/:id/images
// ══════════════════════════════════════════════════════════════════════════════
export const listWorkspaceImages = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Workspace ID');

    const workspace = await requireWorkspace(req.params.id, next);
    if (!workspace) return;
    if (!workspace.hasRole(req.user._id, 'viewer') && req.user.role !== 'admin') {
        return next(new AppError('Access denied.', 403));
    }

    const { data, meta } = await buildQuery(ImageAsset, req.query, {
        defaultSort: '-createdAt',
        baseFilter: { workspace: req.params.id },
        populate: [{ path: 'user', select: 'name avatar' }],
    });

    sendPaginated(res, data, meta, 'Workspace image assets retrieved.');
});
