/**
 * Skeleton.jsx  –  Reusable skeleton loader components
 *
 * Usage:
 *   <Skeleton />                      — single line
 *   <Skeleton width="60%" />          — with custom width
 *   <SkeletonCard />                  — card shaped block
 *   <SkeletonText lines={3} />        — paragraph block
 *   <SkeletonTable rows={5} cols={4}/>— table placeholder
 *   <SkeletonAvatar size="lg" />      — circular avatar
 */

import React from 'react';
import { cn } from '../../utils/cn';

// ── Base block ────────────────────────────────────────────────────────────────
export function Skeleton({ className, width, height, style, ...props }) {
    return (
        <div
            role="status"
            aria-label="Loading…"
            className={cn('skeleton', className)}
            style={{ width, height: height ?? '1rem', ...style }}
            {...props}
        />
    );
}

// ── Circular avatar ───────────────────────────────────────────────────────────
const AVATAR_SIZES = { sm: 32, md: 40, lg: 48, xl: 64 };

export function SkeletonAvatar({ size = 'md', className }) {
    const px = typeof size === 'number' ? size : AVATAR_SIZES[size] ?? 40;
    return (
        <Skeleton
            className={cn('rounded-full shrink-0', className)}
            width={px}
            height={px}
        />
    );
}

// ── Text paragraph ────────────────────────────────────────────────────────────
export function SkeletonText({ lines = 3, className }) {
    return (
        <div className={cn('space-y-2', className)} aria-label="Loading text…">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    // Last line is shorter for realism
                    width={i === lines - 1 ? '65%' : '100%'}
                />
            ))}
        </div>
    );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function SkeletonCard({ className, showAvatar = false }) {
    return (
        <div
            role="status"
            aria-label="Loading card…"
            className={cn('card p-5 space-y-4', className)}
        >
            {showAvatar && (
                <div className="flex items-center gap-3">
                    <SkeletonAvatar />
                    <div className="flex-1 space-y-1.5">
                        <Skeleton width="45%" />
                        <Skeleton width="30%" height="0.75rem" />
                    </div>
                </div>
            )}
            {!showAvatar && <Skeleton width="55%" height="1.25rem" />}
            <SkeletonText lines={3} />
            <div className="flex gap-2 pt-1">
                <Skeleton width={80} height="2rem" className="rounded-md" />
                <Skeleton width={64} height="2rem" className="rounded-md" />
            </div>
        </div>
    );
}

// ── Table ─────────────────────────────────────────────────────────────────────
export function SkeletonTable({ rows = 5, cols = 4, className }) {
    return (
        <div
            role="status"
            aria-label="Loading table…"
            className={cn('overflow-hidden rounded-lg border border-border', className)}
        >
            {/* Header */}
            <div className="flex gap-4 px-4 py-3 border-b border-border bg-muted/50">
                {Array.from({ length: cols }).map((_, c) => (
                    <Skeleton key={c} className="flex-1" height="0.875rem" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, r) => (
                <div
                    key={r}
                    className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0"
                >
                    {Array.from({ length: cols }).map((_, c) => (
                        <Skeleton
                            key={c}
                            className="flex-1"
                            height="0.875rem"
                            width={c === 0 ? '80%' : undefined}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

// ── List item (sidebar / feed) ────────────────────────────────────────────────
export function SkeletonListItem({ className }) {
    return (
        <div className={cn('flex items-center gap-3 py-2', className)}>
            <SkeletonAvatar size="sm" />
            <div className="flex-1 space-y-1.5">
                <Skeleton width="55%" />
                <Skeleton width="35%" height="0.75rem" />
            </div>
        </div>
    );
}

// ── Dashboard stat card ───────────────────────────────────────────────────────
export function SkeletonStat({ className }) {
    return (
        <div className={cn('card p-5 space-y-3', className)}>
            <div className="flex items-center justify-between">
                <Skeleton width="40%" height="0.875rem" />
                <Skeleton width={32} height={32} className="rounded-lg" />
            </div>
            <Skeleton width="55%" height="1.75rem" />
            <Skeleton width="45%" height="0.75rem" />
        </div>
    );
}

export default Skeleton;
