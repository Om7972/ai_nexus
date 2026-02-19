import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  CreditCard, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Crown,
  Shield,
  Zap
} from 'lucide-react';

const UserProfileDropdown = ({ user, onClose, onLogout }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const menuItems = [
    {
      label: 'Profile',
      icon: <User className="h-4 w-4" />,
      action: () => handleNavigation('/user-profile'),
      description: 'View and edit your profile'
    },
    {
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      action: () => handleNavigation('/user-settings'),
      description: 'Manage your preferences'
    },
    {
      label: 'Subscription',
      icon: <Crown className="h-4 w-4" />,
      action: () => handleNavigation('/subscription-management'),
      description: 'Manage your subscription',
      badge: 'Pro'
    },
    {
      label: 'Billing',
      icon: <CreditCard className="h-4 w-4" />,
      action: () => handleNavigation('/billing'),
      description: 'View billing history'
    },
    {
      label: 'Security',
      icon: <Shield className="h-4 w-4" />,
      action: () => handleNavigation('/security-settings'),
      description: 'Security and privacy settings'
    },
    {
      label: 'Help & Support',
      icon: <HelpCircle className="h-4 w-4" />,
      action: () => handleNavigation('/help-support'),
      description: 'Get help and contact support'
    }
  ];

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
    >
      {/* User Info Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-12 h-12 rounded-full" />
            ) : (
              <span className="text-white text-lg font-medium">
                {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.email || 'User'
              }
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                <Crown className="h-3 w-3 mr-1" />
                Pro Plan
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                <Zap className="h-3 w-3 mr-1" />
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className="w-full flex items-center justify-between px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="text-gray-400 dark:text-gray-500">
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">12</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Projects</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">89%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Usage</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">5</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Team</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfileDropdown; 