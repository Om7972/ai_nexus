import React from 'react';
import Icon from '../../../components/AppIcon';

const LoginStats = () => {
  const stats = [
    {
      icon: 'Users',
      value: '50K+',
      label: 'Active Users',
      color: 'var(--color-secondary)'
    },
    {
      icon: 'Zap',
      value: '1M+',
      label: 'AI Tasks Completed',
      color: 'var(--color-primary)'
    },
    {
      icon: 'Award',
      value: '99.9%',
      label: 'Uptime Guarantee',
      color: 'var(--color-success)'
    },
    {
      icon: 'Globe',
      value: '150+',
      label: 'Countries Served',
      color: 'var(--color-accent)'
    }
  ];

  return (
    <div className="hidden lg:block">
      <div className="grid grid-cols-2 gap-6">
        {stats?.map((stat, index) => (
          <div key={index} className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-card rounded-lg flex items-center justify-center elevation-1">
              <Icon name={stat?.icon} size={20} color={stat?.color} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stat?.value}</div>
              <div className="text-sm text-muted-foreground">{stat?.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 p-6 bg-card rounded-xl elevation-1">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Icon name="Quote" size={16} color="var(--color-secondary)" />
          </div>
          <div>
            <p className="text-sm text-foreground italic mb-2">
              "AI Nexus has transformed how we handle data analysis and content creation. The platform's intuitive interface and powerful AI capabilities have increased our productivity by 300%."
            </p>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                <Icon name="User" size={12} color="var(--color-primary)" />
              </div>
              <div>
                <div className="text-xs font-medium text-foreground">Sarah Johnson</div>
                <div className="text-xs text-muted-foreground">CTO, TechCorp</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginStats;