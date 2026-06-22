import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchActivities } from '../../store/slices/collaborationSlice';
import {
  FiFileText,
  FiMessageSquare,
  FiUsers,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
} from 'react-icons/fi';

const getActivityIcon = (action) => {
  const iconMap = {
    document_created: FiFileText,
    document_updated: FiEdit,
    document_deleted: FiTrash2,
    comment_added: FiMessageSquare,
    comment_resolved: FiCheckCircle,
    team_member_added: FiUsers,
    project_created: FiFileText,
  };
  
  const Icon = iconMap[action] || FiFileText;
  return <Icon className="w-4 h-4" />;
};

const getActivityColor = (action) => {
  if (action.includes('created')) return 'from-green-500 to-emerald-500';
  if (action.includes('updated') || action.includes('added')) return 'from-blue-500 to-cyan-500';
  if (action.includes('deleted') || action.includes('removed')) return 'from-red-500 to-pink-500';
  if (action.includes('resolved')) return 'from-purple-500 to-violet-500';
  return 'from-gray-500 to-gray-600';
};

const ActivityFeed = () => {
  const dispatch = useDispatch();
  const { selectedTeam, activities, activitiesLoading } = useSelector(
    (state) => state.collaboration
  );

  useEffect(() => {
    if (selectedTeam) {
      dispatch(fetchActivities({ type: 'team', id: selectedTeam._id, limit: 50 }));
    }
  }, [selectedTeam, dispatch]);

  if (activitiesLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <motion.div
          key={activity._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
        >
          <div className="flex gap-3">
            {/* Icon */}
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getActivityColor(
                activity.action
              )} flex items-center justify-center text-white flex-shrink-0`}
            >
              {getActivityIcon(activity.action)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">
                <span className="font-medium">{activity.user?.name || 'Someone'}</span>
                {' '}
                <span className="text-gray-400">{activity.description}</span>
              </p>
              
              {activity.document && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  in {activity.document.title}
                </p>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ActivityFeed;
