import React from 'react';
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";
import Icon from '../AppIcon';
import { motion } from 'framer-motion';

const buttonVariants = cva(
    // Base — shared by all variants
    [
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium",
        "ring-offset-background select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "transition-all duration-normal ease-spring",
        "active:scale-[0.97]",
    ],
    {
        variants: {
            variant: {
                // Primary: Rose Taupe fill
                default:
                    "bg-primary text-primary-foreground shadow-sm hover:brightness-110 hover:shadow-md",
                // Outlined
                outline:
                    "border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground hover:border-rose-taupe/40",
                // Filled with vanilla
                secondary:
                    "bg-secondary text-secondary-foreground shadow-sm hover:bg-[--vanilla-hover] hover:shadow-md",
                // Ghost / text
                ghost:
                    "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
                // Underline link
                link:
                    "text-primary underline-offset-4 hover:underline p-0 h-auto",
                // Status
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm hover:brightness-110",
                success:
                    "bg-success text-success-foreground shadow-sm hover:brightness-110",
                warning:
                    "bg-warning text-warning-foreground shadow-sm hover:brightness-110",
                danger:
                    "bg-error text-error-foreground shadow-sm hover:brightness-110",
            },
            size: {
                xs: "h-7 rounded-md px-2.5 text-xs",
                sm: "h-9 rounded-md px-3",
                default: "h-10 px-4 py-2",
                lg: "h-11 rounded-md px-8",
                xl: "h-12 rounded-md px-10 text-base",
                icon: "h-10 w-10",
                "icon-sm": "h-8 w-8",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

// Loading spinner (matches button text colour)
const Spinner = () => (
    <svg
        className="animate-spin -ml-0.5 mr-2 h-4 w-4 shrink-0"
        fill="none" viewBox="0 0 24 24"
        aria-hidden="true"
    >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
);

const Button = React.forwardRef(({
    className,
    variant,
    size,
    asChild = false,
    children,
    loading = false,
    iconName = null,
    iconPosition = 'left',
    iconSize = null,
    fullWidth = false,
    disabled = false,
    ...props
}, ref) => {
    const Comp = asChild ? Slot : "button";

    const iconSizeMap = { xs: 12, sm: 14, default: 16, lg: 18, xl: 20, icon: 16, 'icon-sm': 14 };
    const calcIconSize = iconSize || iconSizeMap[size] || 16;

    const renderIcon = () => {
        if (!iconName) return null;
        try {
            return (
                <Icon
                    name={iconName}
                    size={calcIconSize}
                    aria-hidden="true"
                    className={cn(
                        children && iconPosition === 'left' && "mr-2",
                        children && iconPosition === 'right' && "ml-2",
                    )}
                />
            );
        } catch { return null; }
    };

    const inner = (
        <>
            {loading && <Spinner />}
            {!loading && iconName && iconPosition === 'left' && renderIcon()}
            {children}
            {!loading && iconName && iconPosition === 'right' && renderIcon()}
        </>
    );

    return (
        <Comp
            ref={ref}
            className={cn(
                buttonVariants({ variant, size, className }),
                fullWidth && "w-full",
            )}
            disabled={disabled || loading}
            aria-disabled={disabled || loading}
            aria-busy={loading}
            {...props}
        >
            {inner}
        </Comp>
    );
});

Button.displayName = "Button";
export default Button;