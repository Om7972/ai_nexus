import React from 'react';
import Icon from '../../../components/AppIcon';

const SystemStatus = ({ services }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'text-success';
      case 'degraded': return 'text-warning';
      case 'outage': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'operational':
        return `${baseClasses} bg-success/10 text-success`;
      case 'degraded':
        return `${baseClasses} bg-warning/10 text-warning`;
      case 'outage':
        return `${baseClasses} bg-error/10 text-error`;
      default:
        return `${baseClasses} bg-muted text-muted-foreground`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational': return 'CheckCircle';
      case 'degraded': return 'AlertTriangle';
      case 'outage': return 'XCircle';
      default: return 'Circle';
    }
  };

  const overallStatus = services?.every(s => s?.status === 'operational') 
    ? 'operational' 
    : services?.some(s => s?.status === 'outage') 
    ? 'outage' :'degraded';

  return (
    <div className="glass-morphism rounded-lg p-6 elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">System Status</h3>
        <div className={`flex items-center space-x-2 ${getStatusColor(overallStatus)}`}>
          <Icon name={getStatusIcon(overallStatus)} size={16} />
          <span className="text-sm font-medium capitalize">{overallStatus}</span>
        </div>
      </div>
      <div className="space-y-3">
        {services?.map((service) => (
          <div key={service?.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
            <div className="flex items-center space-x-3">
              <Icon name={service?.icon} size={16} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{service?.name}</p>
                {service?.lastIncident && (
                  <p className="text-xs text-muted-foreground">
                    Last incident: {service?.lastIncident}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {service?.responseTime && (
                <span className="text-xs text-muted-foreground">
                  {service?.responseTime}ms
                </span>
              )}
              <span className={getStatusBadge(service?.status)}>
                {service?.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last updated</span>
          <span className="text-foreground font-medium">
            {new Date()?.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;