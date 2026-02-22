/**
 * Workspace.js – Mongoose model for Workspaces
 *
 * A Workspace is a shared environment where teams collaborate on Projects.
 * Users join Workspaces with specific roles (owner/admin/member/viewer).
 *
 * Relationships:
 *   Workspace  →   User       (owner, createdBy)
 *   Workspace  ←→  User       (members[] embedded sub-doc)
 *   Workspace  ←   Project    (one workspace has many projects)
 *   Workspace  ←   ActivityLog (ref target)
 */

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// ── Embedded: workspace member sub-schema ─────────────────────────────────────
const memberSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            enum: ['owner', 'admin', 'member', 'viewer'],
            default: 'member',
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
        invitedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { _id: false }
);

// ── Embedded: workspace settings sub-schema ───────────────────────────────────
const settingsSchema = new Schema(
    {
        allowPublicProjects: { type: Boolean, default: false },
        defaultAIModel: {
            type: Schema.Types.ObjectId,
            ref: 'AIModel',
            default: null,
        },
        maxProjects: { type: Number, default: 10, min: 1 },
        maxMembers: { type: Number, default: 5, min: 1 },
        allowedAICategories: {
            type: [String],
            default: ['text-generation', 'image-processing', 'data-analysis'],
        },
    },
    { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────────
const workspaceSchema = new Schema(
    {
        // ── Identity ─────────────────────────────────────────────────────────
        name: {
            type: String,
            required: [true, 'Workspace name is required'],
            trim: true,
            minlength: [2, 'Workspace name must be at least 2 characters'],
            maxlength: [80, 'Workspace name cannot exceed 80 characters'],
        },

        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
            default: '',
        },

        avatar: {
            type: String,
            default: '',
        },

        // ── Plan / Tier ───────────────────────────────────────────────────────
        plan: {
            type: String,
            enum: ['free', 'pro', 'enterprise'],
            default: 'free',
            index: true,
        },

        // ── Membership ────────────────────────────────────────────────────────
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        members: {
            type: [memberSchema],
            default: [],
            validate: [
                {
                    validator: function (arr) {
                        return arr.length <= this.settings?.maxMembers;
                    },
                    message: 'Workspace has reached its member limit',
                },
            ],
        },

        // ── Settings ──────────────────────────────────────────────────────────
        settings: {
            type: settingsSchema,
            default: () => ({}),
        },

        // ── Usage counters (denormalised) ─────────────────────────────────────
        usage: {
            projectCount: { type: Number, default: 0, min: 0 },
            totalAIRequests: { type: Number, default: 0, min: 0 },
            storageUsedMB: { type: Number, default: 0, min: 0 },
        },

        // ── Visibility ────────────────────────────────────────────────────────
        isPublic: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        // ── Soft delete ───────────────────────────────────────────────────────
        deletedAt: { type: Date, default: null, index: true },

        // ── Ownership ─────────────────────────────────────────────────────────
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
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
workspaceSchema.index({ name: 'text', description: 'text' });     // full-text
workspaceSchema.index({ owner: 1, isActive: 1, deletedAt: 1 });
workspaceSchema.index({ 'members.user': 1 });                      // find workspaces for a user
workspaceSchema.index({ plan: 1, isPublic: 1 });
workspaceSchema.index({ slug: 1 }, { unique: true });

// ── Virtuals ──────────────────────────────────────────────────────────────────

/** Total number of members */
workspaceSchema.virtual('memberCount').get(function () {
    return this.members.length;
});

/** True if soft-deleted */
workspaceSchema.virtual('isDeleted').get(function () {
    return this.deletedAt !== null;
});

// Virtual: projects (populated from Project model via ref)
workspaceSchema.virtual('projects', {
    ref: 'Project',
    localField: '_id',
    foreignField: 'workspace',
    match: { deletedAt: null },
});

// ── Pre-save hooks ────────────────────────────────────────────────────────────

/** Auto-generate slug from name + random suffix to ensure uniqueness */
workspaceSchema.pre('save', function (next) {
    if (this.isModified('name') || this.isNew) {
        const base = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        // Append short random suffix to prevent collisions
        if (this.isNew) {
            const suffix = Math.random().toString(36).slice(2, 6);
            this.slug = `${base}-${suffix}`;
        } else {
            this.slug = base;
        }
    }
    next();
});

// ── Default owner as first member ─────────────────────────────────────────────
workspaceSchema.pre('save', function (next) {
    if (this.isNew && this.owner) {
        const alreadyMember = this.members.some(
            (m) => m.user.toString() === this.owner.toString()
        );
        if (!alreadyMember) {
            this.members.push({ user: this.owner, role: 'owner' });
        }
    }
    next();
});

// ── Exclude soft-deleted from default queries ─────────────────────────────────
workspaceSchema.pre(/^find/, function (next) {
    if (!this.getOptions().includeDeleted) {
        this.find({ deletedAt: null });
    }
    next();
});

// ── Instance methods ──────────────────────────────────────────────────────────

/** Check if a userId is a member with at least the given role */
workspaceSchema.methods.hasRole = function (userId, minRole = 'viewer') {
    const hierarchy = ['viewer', 'member', 'admin', 'owner'];
    const member = this.members.find(
        (m) => m.user.toString() === userId.toString()
    );
    if (!member) return false;
    return hierarchy.indexOf(member.role) >= hierarchy.indexOf(minRole);
};

/** Add a member (or update existing role) */
workspaceSchema.methods.addMember = function (userId, role = 'member', invitedBy = null) {
    const existing = this.members.find(
        (m) => m.user.toString() === userId.toString()
    );
    if (existing) {
        existing.role = role;
    } else {
        this.members.push({ user: userId, role, invitedBy });
    }
    return this.save({ validateBeforeSave: false });
};

/** Remove a member */
workspaceSchema.methods.removeMember = function (userId) {
    this.members = this.members.filter(
        (m) => m.user.toString() !== userId.toString()
    );
    return this.save({ validateBeforeSave: false });
};

/** Soft-delete */
workspaceSchema.methods.softDelete = async function () {
    this.deletedAt = new Date();
    this.isActive = false;
    return this.save({ validateBeforeSave: false });
};

const Workspace = model('Workspace', workspaceSchema);
export default Workspace;
