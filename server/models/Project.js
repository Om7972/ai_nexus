/**
 * Project.js – Mongoose model for Projects
 *
 * A Project belongs to a Workspace and groups AI tasks together.
 * Multiple AI Models can be attached to a single project.
 *
 * Relationships:
 *   Project  →   Workspace  (belongs to one workspace)
 *   Project  →   User       (createdBy, collaborators[])
 *   Project  ←→  AIModel    (many-to-many via modelConfigs[])
 *   Project  ←   ActivityLog (ref target)
 */

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// ── Embedded: per-model configuration override ────────────────────────────────
const modelConfigSchema = new Schema(
    {
        model: {
            type: Schema.Types.ObjectId,
            ref: 'AIModel',
            required: true,
        },
        // Project-level parameter overrides (merged with model defaults)
        parameters: {
            type: Schema.Types.Mixed,
            default: {},
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
        addedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

// ── Embedded: collaborator sub-schema ─────────────────────────────────────────
const collaboratorSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            enum: ['editor', 'viewer'],
            default: 'viewer',
        },
        addedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

// ── Embedded: project metadata / output tracking ──────────────────────────────
const outputSchema = new Schema(
    {
        type: {
            type: String,
            enum: ['text', 'image', 'data', 'code', 'audio'],
        },
        url: String,
        size: Number,          // bytes
        createdAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

// ── Main schema ───────────────────────────────────────────────────────────────
const projectSchema = new Schema(
    {
        // ── Identity ─────────────────────────────────────────────────────────
        name: {
            type: String,
            required: [true, 'Project name is required'],
            trim: true,
            minlength: [2, 'Project name must be at least 2 characters'],
            maxlength: [120, 'Project name cannot exceed 120 characters'],
        },

        slug: {
            type: String,
            trim: true,
            lowercase: true,
        },

        description: {
            type: String,
            trim: true,
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
            default: '',
        },

        thumbnail: {
            type: String,
            default: '',
        },

        // ── Classification ───────────────────────────────────────────────────
        type: {
            type: String,
            enum: ['text', 'image', 'data-analysis', 'code', 'multimodal', 'other'],
            default: 'other',
            index: true,
        },

        tags: {
            type: [String],
            default: [],
            set: (tags) => tags.map((t) => t.toLowerCase().trim()),
        },

        // ── Relationships ─────────────────────────────────────────────────────
        workspace: {
            type: Schema.Types.ObjectId,
            ref: 'Workspace',
            required: [true, 'Project must belong to a workspace'],
            index: true,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        collaborators: {
            type: [collaboratorSchema],
            default: [],
        },

        // ── AI model configs ──────────────────────────────────────────────────
        modelConfigs: {
            type: [modelConfigSchema],
            default: [],
            validate: [
                {
                    validator: function (arr) {
                        // Max 1 default model
                        const defaults = arr.filter((c) => c.isDefault);
                        return defaults.length <= 1;
                    },
                    message: 'Only one model can be set as default',
                },
            ],
        },

        // ── Content & Outputs ────────────────────────────────────────────────
        outputs: {
            type: [outputSchema],
            default: [],
        },

        // ── Settings & Status ────────────────────────────────────────────────
        status: {
            type: String,
            enum: ['draft', 'active', 'paused', 'completed', 'archived'],
            default: 'draft',
            index: true,
        },

        visibility: {
            type: String,
            enum: ['private', 'workspace', 'public'],
            default: 'private',
            index: true,
        },

        // ── Usage stats (denormalised) ────────────────────────────────────────
        stats: {
            aiRequestCount: { type: Number, default: 0, min: 0 },
            totalTokensUsed: { type: Number, default: 0, min: 0 },
            lastActivityAt: { type: Date, default: null },
        },

        // ── Soft delete ───────────────────────────────────────────────────────
        deletedAt: { type: Date, default: null, index: true },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
projectSchema.index({ name: 'text', description: 'text', tags: 'text' }); // full-text
projectSchema.index({ workspace: 1, status: 1, deletedAt: 1 });
projectSchema.index({ createdBy: 1, status: 1 });
projectSchema.index({ 'collaborators.user': 1 });
projectSchema.index({ workspace: 1, slug: 1 }, { unique: true, sparse: true });
projectSchema.index({ type: 1, visibility: 1, isActive: 1 });
projectSchema.index({ updatedAt: -1 }); // for "recently updated" queries

// ── Virtuals ──────────────────────────────────────────────────────────────────

/** Human-readable status */
projectSchema.virtual('statusLabel').get(function () {
    const labels = {
        draft: '📝 Draft',
        active: '✅ Active',
        paused: '⏸ Paused',
        completed: '🏁 Completed',
        archived: '🗄 Archived',
    };
    return labels[this.status] || this.status;
});

projectSchema.virtual('isDeleted').get(function () {
    return this.deletedAt !== null;
});

/** The default AI model config for this project */
projectSchema.virtual('defaultModel').get(function () {
    return this.modelConfigs.find((c) => c.isDefault) || this.modelConfigs[0] || null;
});

/** ActivityLog back-reference */
projectSchema.virtual('activityLogs', {
    ref: 'ActivityLog',
    localField: '_id',
    foreignField: 'project',
    options: { sort: { createdAt: -1 }, limit: 50 },
});

// ── Pre-save hooks ────────────────────────────────────────────────────────────

/** Auto-slug from name */
projectSchema.pre('save', function (next) {
    if (this.isModified('name') || this.isNew) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

/** Update lastActivityAt whenever stats.aiRequestCount changes */
projectSchema.pre('save', function (next) {
    if (this.isModified('stats.aiRequestCount')) {
        this.stats.lastActivityAt = new Date();
    }
    next();
});

// ── Exclude soft-deleted ──────────────────────────────────────────────────────
projectSchema.pre(/^find/, function (next) {
    if (!this.getOptions().includeDeleted) {
        this.find({ deletedAt: null });
    }
    next();
});

// ── Instance methods ──────────────────────────────────────────────────────────

/** Check if userId can access this project */
projectSchema.methods.canAccess = function (userId) {
    if (this.visibility === 'public') return true;
    if (this.createdBy.toString() === userId.toString()) return true;
    return this.collaborators.some(
        (c) => c.user.toString() === userId.toString()
    );
};

/** Add a collaborator (idempotent) */
projectSchema.methods.addCollaborator = function (userId, role = 'viewer') {
    const existing = this.collaborators.find(
        (c) => c.user.toString() === userId.toString()
    );
    if (existing) {
        existing.role = role;
    } else {
        this.collaborators.push({ user: userId, role });
    }
    return this.save({ validateBeforeSave: false });
};

/** Attach an AI model config (set it as default if first) */
projectSchema.methods.attachModel = function (modelId, parameters = {}) {
    const alreadyAttached = this.modelConfigs.some(
        (c) => c.model.toString() === modelId.toString()
    );
    if (!alreadyAttached) {
        this.modelConfigs.push({
            model: modelId,
            parameters,
            isDefault: this.modelConfigs.length === 0,
        });
    }
    return this.save({ validateBeforeSave: false });
};

/** Soft-delete */
projectSchema.methods.softDelete = async function () {
    this.deletedAt = new Date();
    this.isActive = false;
    this.status = 'archived';
    return this.save({ validateBeforeSave: false });
};

// ── Static helpers ────────────────────────────────────────────────────────────

/** Find all projects the user owns OR collaborates on */
projectSchema.statics.findForUser = function (userId, extraFilter = {}) {
    return this.find({
        $or: [
            { createdBy: userId },
            { 'collaborators.user': userId },
        ],
        ...extraFilter,
    });
};

const Project = model('Project', projectSchema);
export default Project;
