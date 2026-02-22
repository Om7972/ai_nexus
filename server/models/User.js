import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const { Schema, model } = mongoose;

// ── Schema ────────────────────────────────────────────────────────────────────
const userSchema = new Schema(
    {
        // ── Basic info ────────────────────────────────────────────────────────────
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [60, 'Name cannot exceed 60 characters'],
        },

        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
        },

        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false,
        },

        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },

        avatar: {
            type: String,
            default: '',
        },

        // ── Extended profile ───────────────────────────────────────────────────
        bio: {
            type: String,
            trim: true,
            maxlength: [300, 'Bio cannot exceed 300 characters'],
            default: '',
        },

        location: {
            type: String,
            trim: true,
            maxlength: [100, 'Location cannot exceed 100 characters'],
            default: '',
        },

        website: {
            type: String,
            trim: true,
            match: [/^https?:\/\/.+/, 'Website must be a valid URL'],
            default: '',
        },

        social: {
            github: { type: String, trim: true, default: '' },
            twitter: { type: String, trim: true, default: '' },
            linkedin: { type: String, trim: true, default: '' },
        },

        // ── Plan / Subscription ────────────────────────────────────────────────
        plan: {
            type: String,
            enum: ['free', 'pro', 'enterprise'],
            default: 'free',
            index: true,
        },

        // ── Usage counters ────────────────────────────────────────────────────
        usage: {
            aiRequestsToday: { type: Number, default: 0, min: 0 },
            aiRequestsTotal: { type: Number, default: 0, min: 0 },
            lastRequestAt: { type: Date, default: null },
        },

        // ── Email verification ────────────────────────────────────────────────────
        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        emailVerificationToken: {
            type: String,
            select: false,
        },

        emailVerificationExpires: {
            type: Date,
            select: false,
        },

        // ── Refresh token ─────────────────────────────────────────────────────────
        refreshToken: {
            type: String,
            select: false,
        },

        // ── Password security ─────────────────────────────────────────────────────
        passwordChangedAt: {
            type: Date,
            select: false,
        },

        passwordResetToken: {
            type: String,
            select: false,
        },

        passwordResetExpires: {
            type: Date,
            select: false,
        },

        // ── Account status ────────────────────────────────────────────────────────
        isActive: {
            type: Boolean,
            default: true,
            select: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ── Virtual back-references ───────────────────────────────────────────────────

/** Workspaces this user belongs to (populated via Workspace.members) */
userSchema.virtual('workspaces', {
    ref: 'Workspace',
    localField: '_id',
    foreignField: 'members.user',
    match: { deletedAt: null },
});

/** Projects this user created */
userSchema.virtual('projects', {
    ref: 'Project',
    localField: '_id',
    foreignField: 'createdBy',
    match: { deletedAt: null },
    options: { sort: { updatedAt: -1 } },
});

/** Full display name virtual */
userSchema.virtual('initials').get(function () {
    return this.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
});

// ── Pre-save: hash password ───────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    if (!this.isNew) {
        this.passwordChangedAt = new Date(Date.now() - 1000);
    }
    next();
});

// ── Pre-query: exclude inactive accounts ─────────────────────────────────────
userSchema.pre(/^find/, function (next) {
    this.find({ isActive: { $ne: false } });
    next();
});

// ═══════════════════════════════════════════════════════════════════════════════
// Instance Methods
// ═══════════════════════════════════════════════════════════════════════════════

/** Compare a plain-text password to the stored hash. */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

/** Returns true if the password was changed AFTER the JWT was issued. */
userSchema.methods.changedPasswordAfter = function (jwtIssuedAt) {
    if (this.passwordChangedAt) {
        const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
        return jwtIssuedAt < changedTimestamp;
    }
    return false;
};

/**
 * Generate a cryptographically secure password-reset token.
 * Stores the SHA-256 hash in the DB; returns the raw token for the email.
 */
userSchema.methods.createPasswordResetToken = function () {
    const rawToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return rawToken; // sent to user via email
};

/**
 * Generate an email verification token (valid 24 hours).
 */
userSchema.methods.createEmailVerificationToken = function () {
    const rawToken = crypto.randomBytes(32).toString('hex');

    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    return rawToken;
};

/** Strip all sensitive fields before serialising (for API responses to the owner). */
userSchema.methods.toSafeObject = function () {
    const obj = this.toObject({ virtuals: true });
    delete obj.password;
    delete obj.refreshToken;
    delete obj.passwordResetToken;
    delete obj.passwordResetExpires;
    delete obj.emailVerificationToken;
    delete obj.emailVerificationExpires;
    delete obj.passwordChangedAt;
    delete obj.isActive;
    return obj;
};

/**
 * Safe serialisation for PUBLIC profile views.
 * Exposes only non-sensitive fields.
 */
userSchema.methods.toPublicObject = function () {
    return {
        _id: this._id,
        name: this.name,
        avatar: this.avatar,
        bio: this.bio,
        location: this.location,
        website: this.website,
        social: this.social,
        plan: this.plan,
        role: this.role,
        initials: this.initials,
        createdAt: this.createdAt,
    };
};

const User = model('User', userSchema);
export default User;

