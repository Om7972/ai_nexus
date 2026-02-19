import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './ui/Header';
import Sidebar from './ui/Sidebar';
import NotificationDropdown from './ui/NotificationDropdown';
import SearchDropdown from './ui/SearchDropdown';
import UserProfileDropdown from './ui/UserProfileDropdown';
import { verifyToken } from '../store/slices/authSlice';

const Layout = ({ children, showSidebar = true, showHeader = true }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.userProfile.preferences);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check authentication on mount
    if (isAuthenticated) {
      dispatch(verifyToken());
    }

    // Handle responsive design
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch, isAuthenticated]);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
            Loading your workspace...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${theme}`}>
      <AnimatePresence>
        {showHeader && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Header
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
              isMobile={isMobile}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        {showSidebar && (
          <AnimatePresence>
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`${
                sidebarCollapsed ? 'w-16' : 'w-64'
              } transition-all duration-300 ease-in-out ${
                isMobile && !sidebarCollapsed ? 'fixed z-50 h-full' : ''
              }`}
            >
              <Sidebar
                collapsed={sidebarCollapsed}
                isMobile={isMobile}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
            </motion.div>
          </AnimatePresence>
        )}

        <main
          className={`flex-1 transition-all duration-300 ${
            showSidebar ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : ''
          } ${isMobile ? 'ml-0' : ''}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile overlay for sidebar */}
      {isMobile && showSidebar && !sidebarCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
};

export default Layout; 