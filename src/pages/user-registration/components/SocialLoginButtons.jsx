import React from 'react';

import Icon from '../../../components/AppIcon';

const SocialLoginButtons = ({ onSocialLogin, isLoading }) => {
  const socialProviders = [
    {
      name: 'Google',
      icon: 'Chrome',
      bgColor: 'bg-white',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300',
      hoverBg: 'hover:bg-gray-50'
    },
    {
      name: 'LinkedIn',
      icon: 'Linkedin',
      bgColor: 'bg-blue-600',
      textColor: 'text-white',
      borderColor: 'border-blue-600',
      hoverBg: 'hover:bg-blue-700'
    },
    {
      name: 'Microsoft',
      icon: 'Square',
      bgColor: 'bg-gray-800',
      textColor: 'text-white',
      borderColor: 'border-gray-800',
      hoverBg: 'hover:bg-gray-900'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="text-center">
        <span className="text-sm text-muted-foreground">Sign up with</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {socialProviders?.map((provider) => (
          <button
            key={provider?.name}
            onClick={() => onSocialLogin(provider?.name?.toLowerCase())}
            disabled={isLoading}
            className={`
              flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border
              ${provider?.bgColor} ${provider?.textColor} ${provider?.borderColor}
              ${provider?.hoverBg} spring-animation
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
            `}
          >
            <Icon name={provider?.icon} size={18} />
            <span className="text-sm font-medium">{provider?.name}</span>
          </button>
        ))}
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
        </div>
      </div>
    </div>
  );
};

export default SocialLoginButtons;