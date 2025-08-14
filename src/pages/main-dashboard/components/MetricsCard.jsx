import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsCard = ({ title, value, subtitle, icon, trend, trendValue, color = 'primary' }) => {
  const getColorClasses = (colorType) => {
    switch (colorType) {
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-secondary/10 text-secondary border-secondary/20';
    }
  };

  const getTrendColor = (trendType) => {
    if (trendType === 'up') return 'text-success';
    if (trendType === 'down') return 'text-error';
    return 'text-muted-foreground';
  };

  return (
    <div className="glass-morphism rounded-lg p-6 elevation-1 spring-animation hover:elevation-2">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${getColorClasses(color)}`}>
          <Icon name={icon} size={20} />
        </div>
      </div>
      
      {trend && trendValue && (
        <div className="flex items-center mt-4 pt-4 border-t border-border">
          <Icon 
            name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'} 
            size={16} 
            className={getTrendColor(trend)}
          />
          <span className={`text-sm font-medium ml-1 ${getTrendColor(trend)}`}>
            {trendValue}
          </span>
          <span className="text-sm text-muted-foreground ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default MetricsCard;