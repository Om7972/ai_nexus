import React from 'react';
import { motion } from 'framer-motion';
import { FolderSearch } from 'lucide-react';
import { cn } from '../../utils/cn';

const EmptyState = ({
    icon: Icon = FolderSearch,
    title = 'No data available',
    description = 'There are no active records to display at this time.',
    action,
    className
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/60 bg-card/30 min-h-[300px]",
                className
            )}
        >
            <div className="w-20 h-20 bg-accent/50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-primary/5">
                <Icon className="w-10 h-10 text-muted-foreground/60 drop-shadow-sm" />
            </div>
            <h3 className="text-xl font-bold text-foreground tracking-tight mb-2">
                {title}
            </h3>
            <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed mb-8 font-medium">
                {description}
            </p>
            {action && (
                <div className="empty-state-action">
                    {action}
                </div>
            )}
        </motion.div>
    );
};

export default EmptyState;
