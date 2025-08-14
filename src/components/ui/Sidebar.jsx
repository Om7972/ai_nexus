import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Sidebar = ({ isCollapsed = false, onToggleCollapse }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const location = useLocation();

  const isAuthPage = location?.pathname === '/user-login' || location?.pathname === '/user-registration';

  if (isAuthPage) {
    return null;
  }

  const navigationItems = [
    { 
      name: 'Dashboard', 
      path: '/main-dashboard', 
      icon: 'LayoutDashboard',
      description: 'Overview & metrics'
    },
    { 
      name: 'Text Studio', 
      path: '/ai-text-generation-studio', 
      icon: 'FileText',
      description: 'Content generation'
    },
    { 
      name: 'Image Lab', 
      path: '/ai-image-processing-lab', 
      icon: 'Image',
      description: 'Visual processing'
    },
    { 
      name: 'Data Workspace', 
      path: '/ai-data-analysis-workspace', 
      icon: 'BarChart3',
      description: 'Analytics & insights'
    },
  ];

  const recentProjects = [
    { name: 'Marketing Copy', type: 'text', lastUsed: '2 hours ago' },
    { name: 'Product Images', type: 'image', lastUsed: '1 day ago' },
    { name: 'Sales Analysis', type: 'data', lastUsed: '3 days ago' },
  ];

  const getProjectIcon = (type) => {
    switch (type) {
      case 'text': return 'FileText';
      case 'image': return 'Image';
      case 'data': return 'BarChart3';
      default: return 'File';
    }
  };

  return (
    <aside className={`fixed left-0 top-16 bottom-0 z-40 glass-morphism border-r border-border transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <h2 className="text-sm font-semibold text-foreground">Navigation</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            iconName={isCollapsed ? "ChevronRight" : "ChevronLeft"}
            iconSize={16}
          />
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems?.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium spring-animation group ${
                location?.pathname === item?.path
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              title={isCollapsed ? item?.name : ''}
            >
              <Icon name={item?.icon} size={18} />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item?.name}</div>
                  <div className="text-xs opacity-70 truncate">{item?.description}</div>
                </div>
              )}
              {location?.pathname === item?.path && (
                <div className="w-2 h-2 bg-secondary rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Recent Projects */}
        {!isCollapsed && (
          <div className="p-4 border-t border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Recent Projects
            </h3>
            <div className="space-y-2">
              {recentProjects?.map((project, index) => (
                <button
                  key={index}
                  className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-sm text-foreground hover:bg-accent hover:text-accent-foreground spring-animation"
                >
                  <Icon name={getProjectIcon(project?.type)} size={16} />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-medium truncate">{project?.name}</div>
                    <div className="text-xs text-muted-foreground">{project?.lastUsed}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className={`p-4 border-t border-border ${isCollapsed ? 'px-2' : ''}`}>
            <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg bg-secondary/10 ${
              isCollapsed ? 'justify-center' : ''
            }`}>
              <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">Processing</div>
                  <div className="text-xs text-muted-foreground">AI task in progress...</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className={`p-4 border-t border-border ${isCollapsed ? 'px-2' : ''}`}>
          {isCollapsed ? (
            <div className="space-y-2">
              <Button variant="ghost" size="icon" iconName="Plus" iconSize={16} title="New Project" />
              <Button variant="ghost" size="icon" iconName="Upload" iconSize={16} title="Upload" />
            </div>
          ) : (
            <div className="space-y-2">
              <Button variant="outline" size="sm" iconName="Plus" iconPosition="left" fullWidth>
                New Project
              </Button>
              <Button variant="ghost" size="sm" iconName="Upload" iconPosition="left" fullWidth>
                Upload Files
              </Button>
            </div>
          )}
        </div>

        {/* Usage Stats */}
        {!isCollapsed && (
          <div className="p-4 border-t border-border">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">API Usage</span>
                <span className="text-foreground font-medium">75%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-secondary h-2 rounded-full" style={{ width: '75%' }} />
              </div>
              <div className="text-xs text-muted-foreground">
                7,500 / 10,000 requests this month
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;