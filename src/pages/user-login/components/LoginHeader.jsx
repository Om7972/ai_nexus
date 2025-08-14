import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const LoginHeader = () => {
  return (
    <div className="text-center space-y-6">
      {/* Logo */}
      <Link to="/" className="inline-flex items-center space-x-3">
        <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center elevation-1">
          <Icon name="Zap" size={24} color="var(--color-primary)" />
        </div>
        <div className="text-left">
          <h1 className="text-2xl font-bold text-foreground">AI Nexus</h1>
          <p className="text-sm text-muted-foreground">Intelligent Solutions Platform</p>
        </div>
      </Link>

      {/* Welcome Message */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Sign in to your account to access your AI-powered dashboard and continue your projects.
        </p>
      </div>

      {/* Security Badge */}
      <div className="inline-flex items-center space-x-2 px-4 py-2 bg-secondary/10 rounded-full">
        <Icon name="Shield" size={16} color="var(--color-secondary)" />
        <span className="text-sm text-secondary font-medium">Secured with 256-bit SSL encryption</span>
      </div>
    </div>
  );
};

export default LoginHeader;