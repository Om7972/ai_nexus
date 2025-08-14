import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ServiceTile = ({ title, description, icon, path, usage, limit, color = 'secondary' }) => {
  const usagePercentage = limit ? Math.round((usage / limit) * 100) : 0;
  
  const getColorClasses = (colorType) => {
    switch (colorType) {
      case 'primary':
        return 'bg-primary/5 border-primary/20 hover:bg-primary/10';
      case 'success':
        return 'bg-success/5 border-success/20 hover:bg-success/10';
      case 'warning':
        return 'bg-warning/5 border-warning/20 hover:bg-warning/10';
      default:
        return 'bg-secondary/5 border-secondary/20 hover:bg-secondary/10';
    }
  };

  const getIconColor = (colorType) => {
    switch (colorType) {
      case 'primary':
        return 'var(--color-primary)';
      case 'success':
        return 'var(--color-success)';
      case 'warning':
        return 'var(--color-warning)';
      default:
        return 'var(--color-secondary)';
    }
  };

  return (
    <div className={`glass-morphism rounded-lg p-6 border spring-animation ${getColorClasses(color)}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-background">
            <Icon name={icon} size={24} color={getIconColor(color)} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>

      {limit && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Usage this month</span>
            <span className="font-medium text-foreground">{usage} / {limit}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                usagePercentage > 80 ? 'bg-warning' : 'bg-secondary'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{usagePercentage}% used</p>
        </div>
      )}

      <Link to={path}>
        <Button variant="outline" size="sm" iconName="ArrowRight" iconPosition="right" fullWidth>
          Launch Studio
        </Button>
      </Link>
    </div>
  );
};

export default ServiceTile;