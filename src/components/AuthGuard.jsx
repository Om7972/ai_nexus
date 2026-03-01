import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { verifyToken } from '../store/slices/authSlice';

const AuthGuard = ({ children, requireAuth = true, roles = [], redirectTo = '/user-login' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // If we have a token but aren't authenticated, verify it
    if (token && !isAuthenticated && !loading) {
      dispatch(verifyToken());
    }
  }, [dispatch, token, isAuthenticated, loading]);

  useEffect(() => {
    // Handle authentication requirements
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        // Save the intended destination for after login
        sessionStorage.setItem('redirectAfterLogin', location.pathname);
        navigate(redirectTo, { replace: true });
      } else if (!requireAuth && isAuthenticated) {
        // If user is authenticated but this route doesn't require auth (like login page)
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/main-dashboard';
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath, { replace: true });
      } else if (requireAuth && isAuthenticated && roles.length > 0) {
        // Role based verification
        const hasRole = roles.includes(user?.role);
        if (!hasRole) {
          navigate('/main-dashboard', { replace: true });
        }
      }
    }
  }, [isAuthenticated, loading, requireAuth, navigate, redirectTo, location.pathname, user?.role]);

  // Show loading state while checking authentication
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
            Verifying your session...
          </p>
        </motion.div>
      </div>
    );
  }

  // If authentication check is complete and requirements are met, render children
  if ((requireAuth && isAuthenticated) || (!requireAuth && !isAuthenticated)) {
    return children;
  }

  // Fallback loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
          Redirecting...
        </p>
      </motion.div>
    </div>
  );
};

export default AuthGuard; 