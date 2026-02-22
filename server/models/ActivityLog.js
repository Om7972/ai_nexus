/**
 * ActivityLog.js – Mongoose model for Activity Logs
 *
 * Append-only audit trail.  Every significant action (login, AI request,
 * project create/delete, workspace changes, etc.) is recorded here.
 *
 * Relationships:
 *   ActivityLog  →  User       (actor who performed the action)
 *   ActivityLog  →  Workspace  (optional context)
 *   ActivityLog  →  Project    (optional context)
 *   ActivityLog  →  AIModel    (optional context)
 *
 * Design notes:
 *  - No deletedAt / soft-delete: audit logs are immutable by design.
 *  - TTL index auto-expires logs after 90 days (configurable).
 *  - Compound indexes optimised for the most common query patterns.
 */

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// ── Action enum (exhaustive list of loggable events) ──────────────────────────
export const LOG_ACTIONS = Object.freeze({
    // Auth
    AUTH_REGISTER: 'auth.register',
    AUTH_LOGIN: 'auth.login',
    AUTH_LOGOUT: 'auth.logout',
    AUTH_REFRESH: 'auth.refresh',
    AUTH_PASSWORD_RESET: 'auth.password_reset',
    AUTH_EMAIL_VERIFIED: 'auth.email_verified',

    // User
    USER_PROFILE_UPDATE: 'user.profile_update',
    USER_PASSWORD_CHANGE: 'user.password_change',
    USER_DELETE: 'user.delete',

    // Workspace
    WORKSPACE_CREATED: 'workspace.created',
    WORKSPACE_UPDATED: 'workspace.updated',
    WORKSPACE_DELETED: 'workspace.deleted',
    WORKSPACE_MEMBER_ADDED: 'workspace.member_added',
    WORKSPACE_MEMBER_REMOVED: 'workspace.member_removed',
    WORKSPACE_MEMBER_ROLE_CHANGED: 'workspace.member_role_changed',

    // Project
    PROJECT_CREATED: 'project.created',
    PROJECT_UPDATED: 'project.updated',
    PROJECT_DELETED: 'project.deleted',
    PROJECT_STATUS_CHANGED: 'project.status_changed',
    PROJECT_COLLABORATOR_ADDED: 'project.collaborator_added',
    PROJECT_MODEL_ATTACHED: 'project.model_attached',

    // AI
    AI_REQUEST_SENT: 'ai.request_sent',
    AI_REQUEST_FAILED: 'ai.request_failed',
    AI_MODEL_CREATED: 'ai.model_created',
    AI_MODEL_UPDATED: 'ai.model_updated',
    AI_MODEL_DELETED: 'ai.model_deleted',

    // Admin
    ADMIN_ACTION: 'admin.action',
});

// ── Main schema ───────────────────────────────────────────────────────────────
const activityLogSchema = new Schema(
    {
        // ── Actor ─────────────────────────────────────────────────────────────
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        // ── Action ────────────────────────────────────────────────────────────
        action: {
            type: String,
            required: [true, 'Action is required'],
            enum: Object.values(LOG_ACTIONS),
            index: true,
        },

        // ── Category (derived from action prefix for fast filtering) ──────────
        category: {
            type: String,
            enum: ['auth', 'user', 'workspace', 'project', 'ai', 'admin'],
            index: true,
        },

        // ── Target resources (optional, polymorphic) ──────────────────────────
        workspace: {
            type: Schema.Types.ObjectId,
            ref: 'Workspace',
            default: null,
            index: true,
        },

        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            default: null,
            index: true,
        },

        aiModel: {
            type: Schema.Types.ObjectId,
            ref: 'AIModel',
            default: null,
        },

        // ── Contextual data ───────────────────────────────────────────────────
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
            // e.g. { previousStatus: 'draft', newStatus: 'active' }
            //      { tokensUsed: 1024, responseMs: 423 }
            //      { targetUserId: '...' }
        },

        // ── HTTP context (for request-origin tracking) ────────────────────────
        ip: {
            type: String,
            trim: true,
        },

        userAgent: {
            type: String,
            trim: true,
            select: false, // Large field – only fetch when explicitly requested
        },

        // ── Outcome ───────────────────────────────────────────────────────────
        status: {
            type: String,
            enum: ['success', 'failure', 'pending'],
            default: 'success',
            index: true,
        },

        errorMessage: {
            type: String,
            trim: true,
            default: null,
        },

        // ── Performance ───────────────────────────────────────────────────────
        durationMs: {
            type: Number,
            min: 0,
            default: null,
        },
    },
    {
        timestamps: true,      // createdAt = when the event happened
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

// TTL: auto-expire logs after 90 days
activityLogSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 90 * 24 * 60 * 60, name: 'ttl_90_days' }
);

// Most common access patterns
activityLogSchema.index({ user: 1, createdAt: -1 });               // user activity feed
activityLogSchema.index({ workspace: 1, createdAt: -1 });          // workspace audit trail
activityLogSchema.index({ project: 1, createdAt: -1 });            // project history
activityLogSchema.index({ action: 1, createdAt: -1 });             // filter by event type
activityLogSchema.index({ category: 1, status: 1, createdAt: -1 });// by category + outcome
activityLogSchema.index({ user: 1, action: 1, createdAt: -1 });    // user + action drill-down

// ── Virtuals ──────────────────────────────────────────────────────────────────

/** Human-readable timestamp */
activityLogSchema.virtual('formattedDate').get(function () {
    return this.createdAt?.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
});

/** Whether this log entry represents a failure */
activityLogSchema.virtual('isFailure').get(function () {
    return this.status === 'failure';
});

// ── Pre-save: auto-derive category from action prefix ─────────────────────────
activityLogSchema.pre('save', function (next) {
    if (this.action && !this.category) {
        this.category = this.action.split('.')[0]; // 'auth.login' → 'auth'
    }
    next();
});

// ── Static factory methods ────────────────────────────────────────────────────

/**
 * Quick logger – call from controllers/services.
 * @example
 *   await ActivityLog.log({
 *     user: req.user._id,
 *     action: LOG_ACTIONS.AI_REQUEST_SENT,
 *     project: projectId,
 *     metadata: { tokensUsed: 512 },
 *     ip: req.ip,
 *   });
 */
activityLogSchema.statics.log = async function (data) {
    try {
        return await this.create(data);
    } catch (err) {
        // Never let logging crash the main flow
        console.error('[ActivityLog] Failed to write log:', err.message);
    }
};

/**
 * Paginated activity feed for a user.
 */
activityLogSchema.statics.feedForUser = function (userId, { page = 1, limit = 20, category } = {}) {
    const filter = { user: userId };
    if (category) filter.category = category;
    return this.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('workspace', 'name slug')
        .populate('project', 'name slug')
        .populate('aiModel', 'name category')
        .lean();
};

/**
 * Workspace-level audit trail.
 */
activityLogSchema.statics.auditForWorkspace = function (workspaceId, { page = 1, limit = 50 } = {}) {
    return this.find({ workspace: workspaceId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'name email avatar')
        .lean();
};

/**
 * Daily stats breakdown – used by the Analytics dashboard.
 */
activityLogSchema.statics.dailyStats = function (userId, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.aggregate([
        { $match: { user: userId, createdAt: { $gte: since } } },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    category: '$category',
                },
                count: { $sum: 1 },
                failures: { $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] } },
            },
        },
        { $sort: { '_id.date': 1 } },
    ]);
};

const ActivityLog = model('ActivityLog', activityLogSchema);
export { ActivityLog as default, LOG_ACTIONS as activityActions };
