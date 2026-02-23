/**
 * AIModel.js – Mongoose model for AI Models
 *
 * Represents an AI capability (text generation, image processing, data analysis, etc.)
 * that can be attached to Projects and Workspaces.
 *
 * Relationships:
 *   AIModel  ←→  Project    (many-to-many via Project.models[])
 *   AIModel  →   User       (createdBy – admin who registered the model)
 *   AIModel  ←   ActivityLog (ref target)
 */

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// ── Embedded: pricing tier sub-schema ────────────────────────────────────────
const pricingSchema = new Schema(
    {
        tier: {
            type: String,
            enum: ['free', 'pro', 'enterprise'],
            default: 'free',
        },
        creditsPerRequest: { type: Number, default: 1, min: 0 },
        maxRequestsPerDay: { type: Number, default: 100, min: 1 },
    },
    { _id: false }
);

// ── Embedded: capability/feature sub-schema ───────────────────────────────────
const capabilitySchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        enabled: { type: Boolean, default: true },
    },
    { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────────
const aiModelSchema = new Schema(
    {
        // ── Identity ─────────────────────────────────────────────────────────
        name: {
            type: String,
            required: [true, 'Model name is required'],
            trim: true,
            minlength: [2, 'Model name must be at least 2 characters'],
            maxlength: [100, 'Model name cannot exceed 100 characters'],
        },

        slug: {
            type: String,
            lowercase: true,
            trim: true,
            // Auto-generated from name in pre-save hook; unique enforced via index below
        },

        description: {
            type: String,
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },

        // ── Classification ───────────────────────────────────────────────────
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: [
                'text-generation',
                'image-processing',
                'data-analysis',
                'code-generation',
                'audio-processing',
                'multimodal',
                'embedding',
                'classification',
            ],
            index: true,
        },

        provider: {
            type: String,
            required: [true, 'Provider is required'],
            trim: true,
            // e.g. 'Google', 'OpenAI', 'Anthropic', 'Internal'
        },

        version: {
            type: String,
            default: '1.0.0',
            trim: true,
        },

        tags: {
            type: [String],
            default: [],
            set: (tags) => tags.map((t) => t.toLowerCase().trim()),
        },

        // ── Configuration ─────────────────────────────────────────────────────
        apiEndpoint: {
            type: String,
            trim: true,
            select: false, // Internal — not exposed to clients
        },

        apiKeyRef: {
            type: String,
            trim: true,
            select: false, // Reference to env var name, not actual key
        },

        defaultParameters: {
            type: Schema.Types.Mixed,
            default: {},
            // e.g. { temperature: 0.7, maxTokens: 2048 }
        },

        capabilities: {
            type: [capabilitySchema],
            default: [],
        },

        // ── Limits & Pricing ──────────────────────────────────────────────────
        pricing: {
            type: pricingSchema,
            default: () => ({}),
        },

        maxContextLength: {
            type: Number,
            default: 4096,
        },

        // ── Status & Visibility ───────────────────────────────────────────────
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        isPublic: {
            type: Boolean,
            default: true,
            // false = admin/enterprise only
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        // ── Metrics (denormalised for fast reads) ─────────────────────────────
        stats: {
            totalRequests: { type: Number, default: 0 },
            successRate: { type: Number, default: 100, min: 0, max: 100 },
            avgResponseMs: { type: Number, default: 0 },
        },

        // ── Ownership ─────────────────────────────────────────────────────────
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // ── Soft delete ───────────────────────────────────────────────────────
        deletedAt: { type: Date, default: null, index: true },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
aiModelSchema.index({ name: 'text', description: 'text', tags: 'text' }); // full-text search
aiModelSchema.index({ slug: 1 }, { unique: true });                        // unique slug
aiModelSchema.index({ category: 1, isActive: 1, deletedAt: 1 });
aiModelSchema.index({ provider: 1, isActive: 1 });
aiModelSchema.index({ isFeatured: 1, isPublic: 1 });

// ── Virtuals ──────────────────────────────────────────────────────────────────

/** Computed display label: "Provider – Name vX.Y.Z" */
aiModelSchema.virtual('displayName').get(function () {
    return `${this.provider} – ${this.name} v${this.version}`;
});

/** True if the model has been soft-deleted */
aiModelSchema.virtual('isDeleted').get(function () {
    return this.deletedAt !== null;
});

// ── Pre-save hooks ────────────────────────────────────────────────────────────

/** Auto-generate slug from name */
aiModelSchema.pre('save', function (next) {
    if (this.isModified('name') || this.isNew) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

// ── Query helpers: exclude soft-deleted by default ────────────────────────────
aiModelSchema.pre(/^find/, function (next) {
    if (!this.getOptions().includeDeleted) {
        this.find({ deletedAt: null });
    }
    next();
});

// ── Instance methods ──────────────────────────────────────────────────────────

/** Soft-delete the model */
aiModelSchema.methods.softDelete = async function () {
    this.deletedAt = new Date();
    this.isActive = false;
    return this.save({ validateBeforeSave: false });
};

/** Restore from soft delete */
aiModelSchema.methods.restore = async function () {
    this.deletedAt = null;
    this.isActive = true;
    return this.save({ validateBeforeSave: false });
};

/** Increment request stats atomically */
aiModelSchema.statics.recordRequest = async function (modelId, responseMs, success) {
    return this.findByIdAndUpdate(modelId, {
        $inc: {
            'stats.totalRequests': 1,
            'stats.avgResponseMs': responseMs,
        },
    });
};

const AIModel = model('AIModel', aiModelSchema);
export default AIModel;
