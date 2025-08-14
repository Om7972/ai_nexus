import React from 'react';
import { Link } from 'react-router-dom';

const LoginRedirect = () => {
  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link 
          to="/user-login" 
          className="text-primary hover:text-primary/80 font-medium underline spring-animation"
        >
          Sign in here
        </Link>
      </p>
    </div>
  );
};

export default LoginRedirect;