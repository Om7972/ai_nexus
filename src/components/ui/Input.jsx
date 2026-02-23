import React, { useId } from "react";
import { cn } from "../../utils/cn";
import { AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Input = React.forwardRef(({
    className,
    type = "text",
    label,
    description,
    error,
    success,
    required = false,
    id,
    prefix,
    suffix,
    ...props
}, ref) => {
    // Stable unique ID — no random on re-render
    const generatedId = useId();
    const inputId = id || generatedId;
    const errId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const hasError = Boolean(error);
    const hasSuccess = Boolean(success) && !hasError;

    if (type === "checkbox") {
        return (
            <input
                type="checkbox"
                ref={ref}
                id={inputId}
                className={cn(
                    "h-4 w-4 rounded border border-input bg-background",
                    "text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "micro-interaction",
                    className
                )}
                {...props}
            />
        );
    }

    if (type === "radio") {
        return (
            <input
                type="radio"
                ref={ref}
                id={inputId}
                className={cn(
                    "h-4 w-4 rounded-full border border-input bg-background",
                    "text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50 micro-interaction",
                    className
                )}
                {...props}
            />
        );
    }

    return (
        <div className="space-y-1.5">
            {/* Label */}
            {label && (
                <label
                    htmlFor={inputId}
                    className={cn(
                        "block text-sm font-medium leading-none",
                        hasError ? "text-destructive" : "text-foreground",
                        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    )}
                >
                    {label}
                    {required && (
                        <span className="text-destructive ml-1" aria-hidden="true">*</span>
                    )}
                </label>
            )}

            {/* Input wrapper (allows prefix/suffix icons) */}
            <div className="relative">
                {prefix && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                        {prefix}
                    </div>
                )}

                <input
                    type={type}
                    ref={ref}
                    id={inputId}
                    aria-required={required}
                    aria-invalid={hasError}
                    aria-describedby={cn(hasError && errId, description && hintId) || undefined}
                    className={cn(
                        "input-base",
                        prefix && "pl-9",
                        suffix && "pr-9",
                        hasError && "input-error",
                        hasSuccess && "border-success focus-visible:ring-success/30",
                        className
                    )}
                    {...props}
                />

                {/* Trailing icon: error/success state */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <AnimatePresence mode="wait">
                        {hasError && (
                            <motion.span
                                key="err"
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.7 }}
                                transition={{ duration: 0.15 }}
                            >
                                <AlertCircle size={16} className="text-destructive" aria-hidden="true" />
                            </motion.span>
                        )}
                        {hasSuccess && (
                            <motion.span
                                key="ok"
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.7 }}
                                transition={{ duration: 0.15 }}
                            >
                                <CheckCircle size={16} className="text-success" aria-hidden="true" />
                            </motion.span>
                        )}
                        {suffix && !hasError && !hasSuccess && (
                            <span className="text-muted-foreground">{suffix}</span>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Hint / Error message */}
            <AnimatePresence>
                {hasError && (
                    <motion.p
                        id={errId}
                        key="error"
                        role="alert"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                        className="text-xs text-destructive flex items-center gap-1"
                    >
                        {error}
                    </motion.p>
                )}
                {!hasError && description && (
                    <p id={hintId} className="text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </AnimatePresence>
        </div>
    );
});

Input.displayName = "Input";
export default Input;