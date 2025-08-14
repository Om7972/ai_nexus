import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentProjects = ({ projects }) => {
  const getProjectIcon = (type) => {
    switch (type) {
      case 'text': return 'FileText';
      case 'image': return 'Image';
      case 'data': return 'BarChart3';
      case 'chat': return 'MessageSquare';
      default: return 'File';
    }
  };

  const getProjectColor = (type) => {
    switch (type) {
      case 'text': return 'var(--color-secondary)';
      case 'image': return 'var(--color-warning)';
      case 'data': return 'var(--color-success)';
      case 'chat': return 'var(--color-primary)';
      default: return 'var(--color-muted-foreground)';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="glass-morphism rounded-lg p-6 elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Projects</h3>
        <Link to="/projects" className="text-sm text-secondary hover:text-secondary/80 spring-animation">
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {projects?.map((project) => (
          <div key={project?.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 spring-animation group">
            <div className="p-2 rounded-lg bg-background">
              <Icon name={getProjectIcon(project?.type)} size={16} color={getProjectColor(project?.type)} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {project?.name}
                </h4>
                <span className="text-xs text-muted-foreground">
                  {formatDate(project?.lastModified)}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {project?.description}
              </p>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground capitalize">
                  {project?.type} • {project?.status}
                </span>
                {project?.shared && (
                  <Icon name="Users" size={12} className="text-muted-foreground" />
                )}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              iconName="ExternalLink"
              iconSize={14}
              className="opacity-0 group-hover:opacity-100 spring-animation"
            />
          </div>
        ))}
      </div>
      {projects?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="FolderOpen" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-2">No recent projects</p>
          <Button variant="outline" size="sm" iconName="Plus" iconPosition="left">
            Create Project
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecentProjects;