/**
 * aiModelController.js  –  /api/v1/models
 *
 * Routes:
 *   GET    /               List models (public + filtered)
 *   POST   /               Create model  (admin)
 *   GET    /featured       Featured models
 *   GET    /:id            Model detail
 *   PATCH  /:id            Update model  (admin)
 *   DELETE /:id            Soft-delete   (admin)
 *   PATCH  /:id/restore    Restore       (admin)
 */

import AIModel from '../models/AIModel.js';
import ActivityLog, { LOG_ACTIONS } from '../models/ActivityLog.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { buildQuery, parseId } from '../utils/queryBuilder.js';

// ══════════════════════════════════════════════════════════════════════════════
// GET /models
// ══════════════════════════════════════════════════════════════════════════════
export const listModels = catchAsync(async (req, res) => {
    const isAdmin = req.user.role === 'admin';

    // Non-admins can only see public active models
    const baseFilter = isAdmin ? {} : { isPublic: true, isActive: true };

    const { data, meta } = await buildQuery(AIModel, req.query, {
        searchFields: ['name', 'description', 'tags'],
        defaultSort: '-isFeatured,-createdAt',
        allowedFilters: ['category', 'provider', 'isActive', 'isPublic', 'isFeatured', 'pricing.tier'],
        baseFilter,
        populate: [{ path: 'createdBy', select: 'name avatar' }],
    });

    sendPaginated(res, data, meta, 'AI Models retrieved.');
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /models/featured
// ══════════════════════════════════════════════════════════════════════════════
export const getFeaturedModels = catchAsync(async (req, res) => {
    const models = await AIModel.find({ isFeatured: true, isPublic: true, isActive: true })
        .sort('-createdAt')
        .limit(10)
        .lean();

    sendSuccess(res, 200, { models }, 'Featured models retrieved.');
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /models/:id
// ══════════════════════════════════════════════════════════════════════════════
export const getModel = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Model ID');

    let query = AIModel.findById(req.params.id)
        .populate('createdBy', 'name avatar');

    // Admins can find deleted models
    if (req.user.role === 'admin') {
        query = query.setOptions({ includeDeleted: true });
    }

    const model = await query;
    if (!model) return next(new AppError('AI Model not found.', 404));
    if (!model.isPublic && req.user.role !== 'admin') {
        return next(new AppError('This model is not publicly available.', 403));
    }

    sendSuccess(res, 200, { model });
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /models  (admin)
// ══════════════════════════════════════════════════════════════════════════════
export const createModel = catchAsync(async (req, res) => {
    const model = await AIModel.create({
        ...req.body,
        createdBy: req.user._id,
    });

    await ActivityLog.log({
        user: req.user._id,
        action: LOG_ACTIONS.AI_MODEL_CREATED,
        aiModel: model._id,
        ip: req.ip,
    });

    sendSuccess(res, 201, { model }, 'AI Model created successfully.');
});

// ══════════════════════════════════════════════════════════════════════════════
// PATCH /models/:id  (admin)
// ══════════════════════════════════════════════════════════════════════════════
export const updateModel = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Model ID');

    const ALLOWED = [
        'name', 'description', 'category', 'provider', 'version', 'tags',
        'defaultParameters', 'capabilities', 'pricing', 'maxContextLength',
        'isActive', 'isPublic', 'isFeatured',
    ];
    const updates = Object.fromEntries(
        Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );

    const model = await AIModel.findByIdAndUpdate(req.params.id, updates, {
        new: true, runValidators: true,
    }).setOptions({ includeDeleted: true });

    if (!model) return next(new AppError('AI Model not found.', 404));

    await ActivityLog.log({
        user: req.user._id,
        action: LOG_ACTIONS.AI_MODEL_UPDATED,
        aiModel: model._id,
        metadata: { updatedFields: Object.keys(updates) },
        ip: req.ip,
    });

    sendSuccess(res, 200, { model }, 'AI Model updated.');
});

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /models/:id  (admin – soft delete)
// ══════════════════════════════════════════════════════════════════════════════
export const deleteModel = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Model ID');

    const model = await AIModel.findById(req.params.id).setOptions({ includeDeleted: true });
    if (!model) return next(new AppError('AI Model not found.', 404));

    await model.softDelete();

    await ActivityLog.log({
        user: req.user._id,
        action: LOG_ACTIONS.AI_MODEL_DELETED,
        aiModel: model._id,
        ip: req.ip,
    });

    sendSuccess(res, 200, null, 'AI Model soft-deleted.');
});

// ══════════════════════════════════════════════════════════════════════════════
// PATCH /models/:id/restore  (admin)
// ══════════════════════════════════════════════════════════════════════════════
export const restoreModel = catchAsync(async (req, res, next) => {
    parseId(req.params.id, 'Model ID');

    const model = await AIModel.findById(req.params.id).setOptions({ includeDeleted: true });
    if (!model) return next(new AppError('AI Model not found.', 404));
    if (!model.deletedAt) return next(new AppError('Model is not deleted.', 400));

    await model.restore();

    await ActivityLog.log({
        user: req.user._id,
        action: LOG_ACTIONS.ADMIN_ACTION,
        aiModel: model._id,
        metadata: { action: 'restore' },
        ip: req.ip,
    });

    sendSuccess(res, 200, { model }, 'AI Model restored.');
});
