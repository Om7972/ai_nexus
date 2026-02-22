/**
 * queryBuilder.js
 *
 * Reusable helper that converts Express query-string params into a
 * Mongoose query with pagination, sorting, field selection, and
 * keyword searching.
 *
 * Usage (in controllers):
 *   const { data, meta } = await buildQuery(Model, req.query, {
 *     searchFields: ['name', 'description'],
 *     defaultSort: '-createdAt',
 *     allowedFilters: ['status', 'type', 'plan'],
 *     populate: [{ path: 'createdBy', select: 'name avatar' }],
 *   });
 *
 * Supported query-string params:
 *   ?page=2&limit=20           → pagination
 *   ?sort=-createdAt,name      → sort (- prefix = desc)
 *   ?fields=name,status        → sparse field selection
 *   ?search=keyword            → text search across searchFields
 *   ?status=active&type=text   → exact-match field filters
 *   ?createdAfter=2024-01-01   → date range (createdAfter / createdBefore)
 */

import AppError from './AppError.js';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

/**
 * @param {import('mongoose').Model} Model
 * @param {object} query  – req.query
 * @param {object} opts
 * @param {string[]}  opts.searchFields    – fields to $regex-search
 * @param {string}    opts.defaultSort     – e.g. '-createdAt'
 * @param {string[]}  opts.allowedFilters  – whitelist of exact-match filter keys
 * @param {object[]}  opts.populate        – Mongoose populate configs
 * @param {object}    opts.baseFilter      – always-applied filter (e.g. { workspace: id })
 * @returns {Promise<{ data: any[], meta: object }>}
 */
export async function buildQuery(Model, query = {}, opts = {}) {
    const {
        searchFields = [],
        defaultSort = '-createdAt',
        allowedFilters = [],
        populate = [],
        baseFilter = {},
    } = opts;

    // ── 1. Pagination ─────────────────────────────────────────────────────────
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    // ── 2. Sorting ────────────────────────────────────────────────────────────
    // Accept: ?sort=-createdAt,name  → { createdAt: -1, name: 1 }
    const sortParam = query.sort || defaultSort;
    const sortObj = {};
    sortParam.split(',').forEach((field) => {
        const trimmed = field.trim();
        if (trimmed.startsWith('-')) {
            sortObj[trimmed.slice(1)] = -1;
        } else {
            sortObj[trimmed] = 1;
        }
    });

    // ── 3. Field selection ────────────────────────────────────────────────────
    // Accept: ?fields=name,status,createdAt
    const fieldsParam = query.fields;
    const projection = fieldsParam
        ? fieldsParam.split(',').join(' ')
        : null;

    // ── 4. Search (keyword → $or with $regex) ─────────────────────────────────
    const searchFilter = {};
    if (query.search && searchFields.length > 0) {
        const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        searchFilter.$or = searchFields.map((f) => ({
            [f]: { $regex: escaped, $options: 'i' },
        }));
    }

    // ── 5. Exact-match field filters (whitelisted) ────────────────────────────
    const fieldFilter = {};
    allowedFilters.forEach((key) => {
        if (query[key] !== undefined && query[key] !== '') {
            // Support comma-separated "in" lists: ?status=active,paused
            if (typeof query[key] === 'string' && query[key].includes(',')) {
                fieldFilter[key] = { $in: query[key].split(',').map((v) => v.trim()) };
            } else {
                fieldFilter[key] = query[key];
            }
        }
    });

    // ── 6. Date-range filters ─────────────────────────────────────────────────
    const dateFilter = {};
    if (query.createdAfter || query.createdBefore) {
        dateFilter.createdAt = {};
        if (query.createdAfter) dateFilter.createdAt.$gte = new Date(query.createdAfter);
        if (query.createdBefore) dateFilter.createdAt.$lte = new Date(query.createdBefore);
    }

    // ── 7. Build final filter ─────────────────────────────────────────────────
    const filter = {
        ...baseFilter,
        ...searchFilter,
        ...fieldFilter,
        ...dateFilter,
    };

    // ── 8. Execute (count + data in parallel) ─────────────────────────────────
    const [total, data] = await Promise.all([
        Model.countDocuments(filter),
        (() => {
            let q = Model.find(filter).sort(sortObj).skip(skip).limit(limit);
            if (projection) q = q.select(projection);
            populate.forEach((p) => { q = q.populate(p); });
            return q.lean();
        })(),
    ]);

    return {
        data,
        meta: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
        },
    };
}

/**
 * Parse and validate a MongoDB ObjectId query param.
 * Throws a 400 AppError if the value is not a valid ObjectId.
 */
export function parseId(id, label = 'ID') {
    if (!/^[a-f\d]{24}$/i.test(id)) {
        throw new AppError(`Invalid ${label}: "${id}" is not a valid ObjectId.`, 400);
    }
    return id;
}
