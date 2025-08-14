import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SocialLogin = () => {
  const navigate = useNavigate();
  const [loadingProvider, setLoadingProvider] = useState(null);

  const socialProviders = [
    {
      name: 'Google',
      icon: 'Chrome',
      color: 'var(--color-destructive)',
      bgColor: 'bg-red-50 hover:bg-red-100'
    },
    {
      name: 'Microsoft',
      icon: 'Square',
      color: 'var(--color-primary)',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      name: 'GitHub',
      icon: 'Github',
      color: 'var(--color-foreground)',
      bgColor: 'bg-gray-50 hover:bg-gray-100'
    }
  ];

  const handleSocialLogin = async (provider) => {
    setLoadingProvider(provider?.name);

    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful social login
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', `user@${provider?.name?.toLowerCase()}.com`);
      localStorage.setItem('loginProvider', provider?.name);

      navigate('/main-dashboard');
    } catch (error) {
      console.error(`${provider?.name} login failed:`, error);
      alert(`${provider?.name} login failed. Please try again.`);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {socialProviders?.map((provider) => (
          <Button
            key={provider?.name}
            variant="outline"
            size="default"
            onClick={() => handleSocialLogin(provider)}
            loading={loadingProvider === provider?.name}
            disabled={loadingProvider !== null}
            fullWidth
            className="justify-center"
          >
            <div className="flex items-center space-x-3">
              <Icon 
                name={provider?.icon} 
                size={18} 
                color={provider?.color}
              />
              <span>Continue with {provider?.name}</span>
            </div>
          </Button>
        ))}
      </div>
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          By signing in, you agree to our{' '}
          <button className="text-primary hover:text-primary/80 spring-animation">
            Terms of Service
          </button>{' '}
          and{' '}
          <button className="text-primary hover:text-primary/80 spring-animation">
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
};

export default SocialLogin;