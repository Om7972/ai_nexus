/**
 * userController.js  –  /api/v1/users
 *
 * Routes:
 *   GET    /              List all users           (admin)
 *   GET    /me            Own profile              (auth)
 *   GET    /:id           User by ID               (admin | self)
 *   PATCH  /me            Update own profile       (auth)
 *   PATCH  /:id           Update any user          (admin)
 *   DELETE /me            Soft-delete own account  (auth)
 *   DELETE /:id           Deactivate user          (admin)
 *   GET    /me/activity   Own activity feed        (auth)
 *   GET    /:id/activity  Any user activity        (admin)
 */

import User from '../models/User.js';
import ActivityLog, { LOG_ACTIONS } from '../models/ActivityLog.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { buildQuery, parseId } from '../utils/queryBuilder.js';

// ── Field whitelist ───────────────────────────────────────────────────────────
const USER_FIELDS = ['name', 'avatar', 'bio', 'location', 'website', 'social'];
const ADMIN_FIELDS = [...USER_FIELDS, 'role', 'plan', 'isEmailVerified'];

const pick = (body, fields) =>
    Object.fromEntries(Object.entries(body).filter(([k]) => fields.includes(k)));

// ══════════════════════════════════════════════════════════════════════════════
// GET /users  (admin)
// ══════════════════════════════════════════════════════════════════════════════
export const listUsers = catchAsync(async (req, res) => {
    const { data, meta } = await buildQuery(User, req.query, {
        searchFields: ['name', 'email'],
        defaultSort: '-createdAt',
        allowedFilters: ['role', 'plan', 'isEmailVerified'],
    });
    sendPaginated(res, data, meta, 'Users retrieved.');
});

// keep legacy alias used by current userRoutes.js
export const getAllUsers = listUsers;

// ══════════════════════════════════════════════════════════════════════════════
// GET /users/me
// ══════════════════════════════════════════════════════════════════════════════
export const getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user) return next(new AppError('User not found.', 404));
    sendSuccess(res, 200, { user: user.toSafeObject() });
});

// legacy alias
export const getMyProfile = getMe;

// ══════════════════════════════════════════════════════════════════════════════
// GET /users/:id  (admin | self → full; others → public)
// ══════════════════════════════════════════════════════════════════════════════
export const getUserById = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'User ID');
    const isOwn = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.role === 'admin';

    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found.', 404));

    const payload = isOwn || isAdmin ? user.toSafeObject() : user.toPublicObject();
    sendSuccess(res, 200, { user: payload });
});

// legacy alias
export const getUser = getUserById;

// ══════════════════════════════════════════════════════════════════════════════
// PATCH /users/me
// ══════════════════════════════════════════════════════════════════════════════
export const updateMe = catchAsync(async (req, res) => {
    if (req.body.password || req.body.passwordConfirm) {
        throw new AppError('Use /auth/change-password to update your password.', 400);
    }
    if (req.body.role) throw new AppError('You cannot change your own role.', 403);

    const updates = pick(req.body, USER_FIELDS);
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true, runValidators: true,
    });

    await ActivityLog.log({
        user: req.user._id,
        action: LOG_ACTIONS.USER_PROFILE_UPDATE,
        metadata: { updatedFields: Object.keys(updates) },
        ip: req.ip,
    });

    sendSuccess(res, 200, { user: user.toSafeObject() }, 'Profile updated.');
});

// legacy alias
export const updateMyProfile = updateMe;

// ══════════════════════════════════════════════════════════════════════════════
// PATCH /users/:id  (admin)
// ══════════════════════════════════════════════════════════════════════════════
export const updateUser = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'User ID');
    const updates = pick(req.body, ADMIN_FIELDS);

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
        new: true, runValidators: true,
    });
    if (!user) return next(new AppError('User not found.', 404));

    await ActivityLog.log({
        user: req.user._id,
        action: LOG_ACTIONS.ADMIN_ACTION,
        metadata: { target: req.params.id, updatedFields: Object.keys(updates) },
        ip: req.ip,
    });

    sendSuccess(res, 200, { user: user.toSafeObject() }, 'User updated.');
});

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /users/me  (soft-delete own account)
// ══════════════════════════════════════════════════════════════════════════════
export const deleteMe = catchAsync(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    await ActivityLog.log({ user: req.user._id, action: LOG_ACTIONS.USER_DELETE, ip: req.ip });
    res.clearCookie('accessToken').clearCookie('refreshToken');
    sendSuccess(res, 200, null, 'Account deactivated.');
});

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /users/:id  (admin)
// ══════════════════════════════════════════════════════════════════════════════
export const deleteUser = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'User ID');
    if (req.user._id.toString() === req.params.id) {
        return next(new AppError('Use /users/me to manage your own account.', 400));
    }
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return next(new AppError('User not found.', 404));
    await ActivityLog.log({
        user: req.user._id,
        action: LOG_ACTIONS.ADMIN_ACTION,
        metadata: { action: 'deactivate', target: req.params.id },
        ip: req.ip,
    });
    sendSuccess(res, 200, null, 'User deactivated.');
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /users/me/activity  |  GET /users/:id/activity  (admin)
// ══════════════════════════════════════════════════════════════════════════════
export const getUserActivity = catchAsync(async (req, res) => {
    const targetId = req.params.id === 'me' ? req.user._id : req.params.id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);

    const [data, total] = await Promise.all([
        ActivityLog.feedForUser(targetId, { page, limit, category: req.query.category }),
        ActivityLog.countDocuments({ user: targetId }),
    ]);

    sendPaginated(res, data, { page, limit, total }, 'Activity feed retrieved.');
});
