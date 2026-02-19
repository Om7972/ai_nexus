import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock, 
  Settings,
  Filter,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  clearAllNotifications,
  updateNotificationPreferences 
} from '../store/slices/notificationSlice';

const NotificationCenter = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, preferences } = useSelector((state) => state.notifications);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);

  const filters = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'important', label: 'Important', count: notifications.filter(n => n.important).length },
    { id: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length },
    { id: 'project', label: 'Projects', count: notifications.filter(n => n.type === 'project').length },
    { id: 'security', label: 'Security', count: notifications.filter(n => n.type === 'security').length }
  ];

  const getNotificationIcon = (type, priority) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
    if (priority === 'medium') return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
    if (type === 'success') return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
    if (type === 'error') return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
    return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleDeleteNotification = (notificationId) => {
    dispatch(deleteNotification(notificationId));
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notification.read;
    if (activeFilter === 'important') return notification.important;
    return notification.type === activeFilter;
  });

  const renderNotification = (notification, index) => (
    <motion.div
      key={notification.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className={`p-4 border-l-4 ${getNotificationColor(notification.type, notification.priority)} ${
        !notification.read ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
      } hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type, notification.priority)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {notification.message}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTimeAgo(notification.timestamp)}
                </span>
                {notification.category && (
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                    {notification.category}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {!notification.read && (
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Mark as read"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleDeleteNotification(notification.id)}
                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Delete notification"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex items-center space-x-2 mt-3">
              {notification.actions.map((action, actionIndex) => (
                <button
                  key={actionIndex}
                  onClick={action.onClick}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    action.primary
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Notification Preferences
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
            <p className="text-sm text-gray-500">Receive notifications via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={(e) => dispatch(updateNotificationPreferences({ 
                emailNotifications: e.target.checked 
              }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
            <p className="text-sm text-gray-500">Show browser notifications</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.pushNotifications}
              onChange={(e) => dispatch(updateNotificationPreferences({ 
                pushNotifications: e.target.checked 
              }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Sound Alerts</p>
            <p className="text-sm text-gray-500">Play sound for new notifications</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.soundAlerts}
              onChange={(e) => dispatch(updateNotificationPreferences({ 
                soundAlerts: e.target.checked 
              }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          {/* Notification Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {showSettings ? (
                <div className="p-4">
                  {renderSettings()}
                </div>
              ) : (
                <>
                  {/* Filters */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                      {filters.map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setActiveFilter(filter.id)}
                          className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            activeFilter === filter.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          <span>{filter.label}</span>
                          {filter.count > 0 && (
                            <span className="bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 text-xs px-1.5 py-0.5 rounded-full">
                              {filter.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {filteredNotifications.length > 0 && (
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        Mark all as read
                      </button>
                      <button
                        onClick={handleClearAll}
                        className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                  )}

                  {/* Notifications List */}
                  <div className="flex-1 overflow-y-auto">
                    {filteredNotifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <Bell className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                          {activeFilter === 'all' ? 'No notifications yet' : `No ${activeFilter} notifications`}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          {activeFilter === 'all' 
                            ? 'You\'re all caught up!' 
                            : 'Check back later for new notifications'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        <AnimatePresence>
                          {filteredNotifications.map((notification, index) => 
                            renderNotification(notification, index)
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter; 