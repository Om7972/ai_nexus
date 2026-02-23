/**
 * EmptyState.jsx  –  Consistent empty-state component
 *
 * Usage:
 *   <EmptyState
 *     icon={<Inbox />}
 *     title="No projects yet"
 *     description="Get started by creating your first project."
 *     action={<Button onClick={…}>New Project</Button>}
 *   />
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export function EmptyState({
    icon,
    title,
    description,
    action,
    className,
    compact = false,
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
                'empty-state',
                compact && 'py-8',
                className
            )}
            role="status"
            aria-label={title}
        >
            {icon && (
                <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.08, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                    className="empty-state-icon"
                    aria-hidden="true"
                >
                    {React.cloneElement(icon, { size: compact ? 28 : 36 })}
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="space-y-1.5"
            >
                {title && (
                    <h3 className={cn(
                        'font-semibold text-foreground',
                        compact ? 'text-base' : 'text-lg'
                    )}>
                        {title}
                    </h3>
                )}
                {description && (
                    <p className={cn(
                        'text-muted-foreground max-w-xs mx-auto text-balance leading-relaxed',
                        compact ? 'text-xs' : 'text-sm'
                    )}>
                        {description}
                    </p>
                )}
            </motion.div>

            {action && (
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.3 }}
                    className="mt-5"
                >
                    {action}
                </motion.div>
            )}
        </motion.div>
    );
}

export default EmptyState;
