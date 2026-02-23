/**
 * ThemeContext.jsx  –  Global dark/light mode + Toast context
 *
 * Provides:
 *   useTheme()  →  { theme, toggleTheme, isDark }
 *   useToast()  →  { toast, dismiss }
 *
 * Wrap <App /> with <ThemeProvider> and <ToastProvider>.
 * The ThemeProvider persists preference to localStorage and syncs
 * with the system `prefers-color-scheme` on first load.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ── Theme ─────────────────────────────────────────────────────────────────────

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('ai-nexus-theme');
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    const isDark = theme === 'dark';

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('ai-nexus-theme', theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
    return ctx;
};

// ── Toast ─────────────────────────────────────────────────────────────────────

const ToastContext = createContext(null);

const ICONS = {
    success: <CheckCircle size={18} className="text-success shrink-0 mt-0.5" />,
    error: <XCircle size={18} className="text-destructive shrink-0 mt-0.5" />,
    warning: <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />,
    info: <Info size={18} className="text-primary shrink-0 mt-0.5" />,
};

const DURATION = { success: 3000, info: 4000, warning: 5000, error: 6000 };

function ToastItem({ id, type = 'info', title, message, onDismiss }) {
    const timerRef = useRef(null);

    const start = useCallback(() => {
        timerRef.current = setTimeout(() => onDismiss(id), DURATION[type] ?? 4000);
    }, [id, type, onDismiss]);

    const pause = useCallback(() => clearTimeout(timerRef.current), []);

    useEffect(() => { start(); return pause; }, [start, pause]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 40, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.88 }}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className={`toast toast-${type}`}
            onMouseEnter={pause}
            onMouseLeave={start}
        >
            {ICONS[type]}
            <div className="flex-1 min-w-0">
                {title && <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>}
                {message && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{message}</p>}
            </div>
            <button
                onClick={() => onDismiss(id)}
                className="shrink-0 p-0.5 rounded-md text-muted-foreground hover:text-foreground micro-interaction focus-ring"
                aria-label="Dismiss notification"
            >
                <X size={14} />
            </button>
        </motion.div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback(({ type = 'info', title, message }) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        setToasts(prev => [...prev.slice(-4), { id, type, title, message }]); // max 5
        return id;
    }, []);

    // Convenience aliases
    toast.success = (title, message) => toast({ type: 'success', title, message });
    toast.error = (title, message) => toast({ type: 'error', title, message });
    toast.warning = (title, message) => toast({ type: 'warning', title, message });
    toast.info = (title, message) => toast({ type: 'info', title, message });

    return (
        <ToastContext.Provider value={{ toast, dismiss }}>
            {children}

            {/* Toast container – fixed, bottom-right */}
            <div
                aria-label="Notifications"
                role="region"
                className="fixed bottom-5 right-5 z-[200] flex flex-col gap-3 pointer-events-none"
            >
                <AnimatePresence mode="popLayout">
                    {toasts.map(t => (
                        <div key={t.id} className="pointer-events-auto">
                            <ToastItem {...t} onDismiss={dismiss} />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
};
