import User from '../models/User.js';
import AppError from '../utils/AppError.js';

// ── List users (admin) ────────────────────────────────────────────────────────

/**
 * Return a paginated list of users.
 * @param {{ page?: number, limit?: number, sort?: string, search?: string }} query
 */
export const getAllUsers = async ({ page = 1, limit = 20, sort = '-createdAt', search = '' } = {}) => {
    const skip = (page - 1) * limit;

    const filter = search
        ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
        : {};

    const [users, total] = await Promise.all([
        User.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        User.countDocuments(filter),
    ]);

    return { users, total, page: Number(page), limit: Number(limit) };
};

// ── Get single user ───────────────────────────────────────────────────────────

export const getUserById = async (id) => {
    const user = await User.findById(id).lean();
    if (!user) throw new AppError('User not found.', 404);
    return user;
};

// ── Update user ───────────────────────────────────────────────────────────────

/**
 * Allows updating name and avatar only.
 * Password changes go through authService.changePassword.
 */
export const updateUser = async (id, { name, avatar }) => {
    const allowed = {};
    if (name !== undefined) allowed.name = name;
    if (avatar !== undefined) allowed.avatar = avatar;

    const user = await User.findByIdAndUpdate(id, allowed, {
        new: true,
        runValidators: true,
    });
    if (!user) throw new AppError('User not found.', 404);
    return user.toSafeObject();
};

// ── Delete user ───────────────────────────────────────────────────────────────

export const deleteUser = async (id) => {
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new AppError('User not found.', 404);
};
