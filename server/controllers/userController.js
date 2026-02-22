import * as userService from '../services/userService.js';
import catchAsync from '../utils/catchAsync.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import AppError from '../utils/AppError.js';

// ── GET /api/v1/users  (admin) ────────────────────────────────────────────────
export const getAllUsers = catchAsync(async (req, res) => {
    const { page, limit, sort, search } = req.query;
    const { users, total, page: p, limit: l } = await userService.getAllUsers({ page, limit, sort, search });
    sendPaginated(res, users, { page: p, limit: l, total });
});

// ── GET /api/v1/users/:id ─────────────────────────────────────────────────────
export const getUser = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    sendSuccess(res, 200, { user });
});

// ── GET /api/v1/users/me ──────────────────────────────────────────────────────
// Convenience alias – same as auth/me but under the users resource
export const getMyProfile = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.user._id);
    sendSuccess(res, 200, { user });
});

// ── PATCH /api/v1/users/me ────────────────────────────────────────────────────
export const updateMyProfile = catchAsync(async (req, res) => {
    // Prevent users from escalating their own role
    if (req.body.role) {
        throw new AppError('You cannot change your own role.', 403);
    }

    const user = await userService.updateUser(req.user._id, req.body);
    sendSuccess(res, 200, { user }, 'Profile updated successfully.');
});

// ── PATCH /api/v1/users/:id  (admin) ─────────────────────────────────────────
export const updateUser = catchAsync(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);
    sendSuccess(res, 200, { user }, 'User updated successfully.');
});

// ── DELETE /api/v1/users/:id  (admin) ────────────────────────────────────────
export const deleteUser = catchAsync(async (req, res) => {
    await userService.deleteUser(req.params.id);
    sendSuccess(res, 204, null, 'User deleted.');
});
