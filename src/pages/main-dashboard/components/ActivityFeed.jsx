import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'text': return 'FileText';
      case 'image': return 'Image';
      case 'data': return 'BarChart3';
      case 'upload': return 'Upload';
      case 'download': return 'Download';
      case 'share': return 'Share';
      default: return 'Activity';
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'processing': return 'text-warning';
      case 'failed': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-success/10 text-success`;
      case 'processing':
        return `${baseClasses} bg-warning/10 text-warning`;
      case 'failed':
        return `${baseClasses} bg-error/10 text-error`;
      default:
        return `${baseClasses} bg-muted text-muted-foreground`;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="glass-morphism rounded-lg p-6 elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <Icon name="Activity" size={20} className="text-muted-foreground" />
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities?.map((activity) => (
          <div key={activity?.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 spring-animation">
            <div className={`p-2 rounded-lg bg-background ${getActivityColor(activity?.status)}`}>
              <Icon name={getActivityIcon(activity?.type)} size={16} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity?.title}
                </p>
                <span className={getStatusBadge(activity?.status)}>
                  {activity?.status}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {activity?.description}
              </p>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(activity?.timestamp)}
                </span>
                {activity?.duration && (
                  <span className="text-xs text-muted-foreground">
                    {activity?.duration}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {activities?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Activity" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;