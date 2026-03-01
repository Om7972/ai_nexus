import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './ui/Header';
import Sidebar from './ui/Sidebar';
import Breadcrumb from './ui/Breadcrumb';
import CommandPalette from './CommandPalette';
import { verifyToken } from '../store/slices/authSlice';
import { useTheme } from '../context/ThemeContext';
import { SkeletonStat } from './ui/Skeleton';

// ── Page transition variants ──────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 14 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
};

// ── Full-screen loader ────────────────────────────────────────────────────────
function AppLoader() {
  return (
    <div
      className="min-h-screen subtle-gradient flex items-center justify-center"
      role="status"
      aria-label="Loading workspace…"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
        className="text-center space-y-6 p-8"
      >
        {/* Animated logo mark */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl gradient-primary shadow-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">AI</span>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="absolute -inset-1 rounded-2xl border-2 border-primary/30 border-t-primary"
            />
          </div>
        </div>

        {/* Skeleton stats preview */}
        <div className="grid grid-cols-2 gap-3 w-64">
          <SkeletonStat />
          <SkeletonStat />
        </div>

        <p className="text-sm text-muted-foreground animate-pulse">
          Loading your workspace…
        </p>
      </motion.div>
    </div>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
const Layout = ({ children, showSidebar = true, showHeader = true }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { isAuthenticated, loading } = useSelector(s => s.auth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handle = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(true);
    };
    handle();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  if (loading) return <AppLoader />;

  const sidebarW = showSidebar
    ? (sidebarCollapsed ? 'ml-16' : 'ml-64')
    : '';

  return (
    <div
      className="min-h-screen bg-background transition-colors duration-300"
      data-theme={theme}
    >
      <CommandPalette />
      {/* Header */}
      <AnimatePresence>
        {showHeader && (
          <motion.div
            key="header"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <Header />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(v => !v)}
          />
        )}

        {/* Mobile overlay */}
        <AnimatePresence>
          {isMobile && showSidebar && !sidebarCollapsed && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
              onClick={() => setSidebarCollapsed(true)}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Page content */}
        <main
          id="main-content"
          className={`flex-1 min-w-0 transition-[margin] duration-300 ease-spring ${isMobile ? '' : sidebarW
            }`}
          tabIndex={-1}
        >
          <motion.div
            key="page"
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="p-5 sm:p-6 min-h-[calc(100vh-64px)]"
          >
            {showHeader && showSidebar && <Breadcrumb />}
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;