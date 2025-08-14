import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SuccessMessage = ({ email, onResendEmail, isResending }) => {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Icon name="CheckCircle" size={32} color="#10B981" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Account Created Successfully!</h2>
        <p className="text-muted-foreground">
          We've sent a verification email to{' '}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <div className="flex items-start space-x-3">
          <Icon name="Mail" size={20} color="var(--color-primary)" className="mt-0.5" />
          <div className="text-left space-y-1">
            <p className="text-sm font-medium text-foreground">Check your email</p>
            <p className="text-xs text-muted-foreground">
              Click the verification link in your email to activate your account and start using AI Nexus.
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <Icon name="Clock" size={20} color="var(--color-secondary)" className="mt-0.5" />
          <div className="text-left space-y-1">
            <p className="text-sm font-medium text-foreground">Email not received?</p>
            <p className="text-xs text-muted-foreground">
              Check your spam folder or wait a few minutes. The email should arrive within 5 minutes.
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <Button
          variant="outline"
          onClick={onResendEmail}
          loading={isResending}
          disabled={isResending}
          iconName="RefreshCw"
          iconPosition="left"
        >
          {isResending ? 'Sending...' : 'Resend Verification Email'}
        </Button>
        
        <p className="text-xs text-muted-foreground">
          Need help?{' '}
          <a 
            href="/support" 
            className="text-primary hover:text-primary/80 underline spring-animation"
          >
            Contact our support team
          </a>
        </p>
      </div>
    </div>
  );
};

export default SuccessMessage;