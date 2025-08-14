import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecommendationCard = ({ recommendations }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-error';
      case 'medium': return 'border-l-warning';
      case 'low': return 'border-l-success';
      default: return 'border-l-secondary';
    }
  };

  const getPriorityBadge = (priority) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (priority) {
      case 'high':
        return `${baseClasses} bg-error/10 text-error`;
      case 'medium':
        return `${baseClasses} bg-warning/10 text-warning`;
      case 'low':
        return `${baseClasses} bg-success/10 text-success`;
      default:
        return `${baseClasses} bg-secondary/10 text-secondary`;
    }
  };

  return (
    <div className="glass-morphism rounded-lg p-6 elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recommendations</h3>
        <Icon name="Lightbulb" size={20} className="text-warning" />
      </div>
      <div className="space-y-4">
        {recommendations?.map((rec) => (
          <div key={rec?.id} className={`p-4 rounded-lg border-l-4 bg-background/50 ${getPriorityColor(rec?.priority)}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Icon name={rec?.icon} size={16} className="text-muted-foreground mt-0.5" />
                <h4 className="font-medium text-foreground text-sm">{rec?.title}</h4>
              </div>
              <span className={getPriorityBadge(rec?.priority)}>
                {rec?.priority}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              {rec?.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                {rec?.impact && (
                  <span className="flex items-center space-x-1">
                    <Icon name="TrendingUp" size={12} />
                    <span>{rec?.impact}</span>
                  </span>
                )}
                {rec?.timeToComplete && (
                  <span className="flex items-center space-x-1">
                    <Icon name="Clock" size={12} />
                    <span>{rec?.timeToComplete}</span>
                  </span>
                )}
              </div>
              
              {rec?.actionPath ? (
                <Link to={rec?.actionPath}>
                  <Button variant="outline" size="xs" iconName="ArrowRight" iconPosition="right">
                    {rec?.actionText || 'Take Action'}
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="outline" 
                  size="xs" 
                  iconName="ArrowRight" 
                  iconPosition="right"
                  onClick={rec?.onAction}
                >
                  {rec?.actionText || 'Take Action'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      {recommendations?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-3" />
          <p className="text-muted-foreground">All caught up!</p>
          <p className="text-sm text-muted-foreground">No recommendations at this time.</p>
        </div>
      )}
    </div>
  );
};

export default RecommendationCard;