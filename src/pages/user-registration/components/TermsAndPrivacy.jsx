import React from 'react';

const TermsAndPrivacy = () => {
  return (
    <div className="text-center space-y-2">
      <p className="text-xs text-muted-foreground">
        By creating an account, you agree to our{' '}
        <a 
          href="/terms" 
          className="text-primary hover:text-primary/80 underline spring-animation"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of Service
        </a>{' '}
        and{' '}
        <a 
          href="/privacy" 
          className="text-primary hover:text-primary/80 underline spring-animation"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </a>
      </p>
      
      <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
        <span className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>SSL Secured</span>
        </span>
        <span className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span>GDPR Compliant</span>
        </span>
        <span className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-purple-500 rounded-full" />
          <span>SOC 2 Certified</span>
        </span>
      </div>
    </div>
  );
};

export default TermsAndPrivacy;