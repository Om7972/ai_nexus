import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/LoginForm';
import SocialLogin from './components/SocialLogin';
import LoginStats from './components/LoginStats';

const UserLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      navigate('/main-dashboard');
    }

    // Set page title
    document.title = 'Sign In - AI Nexus';
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="min-h-screen flex">
          {/* Left Side - Login Form */}
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
              <LoginHeader />
              
              <div className="bg-card rounded-2xl p-8 elevation-2">
                <SocialLogin />
                
                <div className="mt-8">
                  <LoginForm />
                </div>
              </div>

              {/* Mobile Stats */}
              <div className="lg:hidden mt-8">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-card rounded-lg elevation-1">
                    <div className="text-lg font-bold text-foreground">50K+</div>
                    <div className="text-xs text-muted-foreground">Active Users</div>
                  </div>
                  <div className="p-4 bg-card rounded-lg elevation-1">
                    <div className="text-lg font-bold text-foreground">99.9%</div>
                    <div className="text-xs text-muted-foreground">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Stats & Testimonial */}
          <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:px-8">
            <div className="w-full max-w-lg">
              <LoginStats />
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-card border-t border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {new Date()?.getFullYear()} AI Nexus. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <button className="text-sm text-muted-foreground hover:text-foreground spring-animation">
                Privacy Policy
              </button>
              <button className="text-sm text-muted-foreground hover:text-foreground spring-animation">
                Terms of Service
              </button>
              <button className="text-sm text-muted-foreground hover:text-foreground spring-animation">
                Support
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLogin;