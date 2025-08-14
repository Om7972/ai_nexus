import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = ({ actions }) => {
  const getActionColor = (type) => {
    switch (type) {
      case 'primary': return 'bg-primary/10 text-primary border-primary/20';
      case 'secondary': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'success': return 'bg-success/10 text-success border-success/20';
      case 'warning': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="glass-morphism rounded-lg p-6 elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <Icon name="Zap" size={20} className="text-secondary" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions?.map((action) => (
          <div key={action?.id} className="group">
            {action?.path ? (
              <Link to={action?.path} className="block">
                <div className={`p-4 rounded-lg border spring-animation hover:scale-105 ${getActionColor(action?.type)}`}>
                  <div className="flex items-center space-x-3">
                    <Icon name={action?.icon} size={20} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{action?.title}</p>
                      <p className="text-xs opacity-80 truncate">{action?.description}</p>
                    </div>
                    <Icon name="ArrowRight" size={14} className="opacity-0 group-hover:opacity-100 spring-animation" />
                  </div>
                </div>
              </Link>
            ) : (
              <button
                onClick={action?.onClick}
                className={`w-full p-4 rounded-lg border spring-animation hover:scale-105 ${getActionColor(action?.type)}`}
              >
                <div className="flex items-center space-x-3">
                  <Icon name={action?.icon} size={20} />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-sm">{action?.title}</p>
                    <p className="text-xs opacity-80 truncate">{action?.description}</p>
                  </div>
                  <Icon name="ArrowRight" size={14} className="opacity-0 group-hover:opacity-100 spring-animation" />
                </div>
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <Button variant="outline" size="sm" iconName="Settings" iconPosition="left" fullWidth>
          Customize Actions
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;