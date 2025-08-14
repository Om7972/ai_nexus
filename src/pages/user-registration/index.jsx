import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import SocialLoginButtons from './components/SocialLoginButtons';
import RegistrationForm from './components/RegistrationForm';
import TermsAndPrivacy from './components/TermsAndPrivacy';
import LoginRedirect from './components/LoginRedirect';
import SuccessMessage from './components/SuccessMessage';

const UserRegistration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Mock user data for demonstration
  const mockUsers = [
    { email: 'john.doe@example.com', password: 'SecurePass123!' },
    { email: 'jane.smith@company.com', password: 'MyPassword456@' },
    { email: 'admin@ainexus.com', password: 'AdminPass789#' }
  ];

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock social login success
      console.log(`Social login with ${provider}`);
      navigate('/main-dashboard');
    } catch (err) {
      setError(`Failed to sign up with ${provider}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (formData) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if email already exists (mock validation)
      const existingUser = mockUsers?.find(user => user?.email?.toLowerCase() === formData?.email?.toLowerCase());
      if (existingUser) {
        throw new Error('An account with this email already exists. Please use a different email or sign in.');
      }
      
      // Mock successful registration
      setUserEmail(formData?.email);
      setRegistrationSuccess(true);
      
      // Add to mock users array
      mockUsers?.push({
        email: formData?.email,
        password: formData?.password,
        fullName: formData?.fullName,
        subscribeNewsletter: formData?.subscribeNewsletter
      });
      
      console.log('Registration successful:', {
        email: formData?.email,
        fullName: formData?.fullName,
        subscribeNewsletter: formData?.subscribeNewsletter
      });
      
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Verification email resent to:', userEmail);
    } catch (err) {
      setError('Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToRegistration = () => {
    setRegistrationSuccess(false);
    setUserEmail('');
    setError('');
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - AI Nexus | Create Your AI-Powered Account</title>
        <meta name="description" content="Join AI Nexus today and unlock powerful AI tools for text generation, image processing, and data analysis. Create your free account in minutes." />
        <meta name="keywords" content="AI registration, sign up, AI platform, artificial intelligence, create account" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16 min-h-screen flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            {registrationSuccess ? (
              <div className="glass-morphism rounded-2xl p-8 elevation-2">
                <SuccessMessage 
                  email={userEmail}
                  onResendEmail={handleResendEmail}
                  isResending={isResending}
                />
                
                <div className="mt-8 pt-6 border-t border-border text-center">
                  <button
                    onClick={handleBackToRegistration}
                    className="text-sm text-muted-foreground hover:text-foreground spring-animation"
                  >
                    ← Back to registration
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-morphism rounded-2xl p-8 elevation-2">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                      <Icon name="Zap" size={24} color="var(--color-primary)" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-semibold text-foreground mb-2">
                    Create Your Account
                  </h1>
                  <p className="text-muted-foreground">
                    Join thousands of users leveraging AI for productivity
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Icon name="AlertCircle" size={20} color="#EF4444" className="mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Registration Error</p>
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Social Login */}
                <SocialLoginButtons 
                  onSocialLogin={handleSocialLogin}
                  isLoading={isLoading}
                />

                {/* Registration Form */}
                <div className="mt-6">
                  <RegistrationForm 
                    onSubmit={handleRegistration}
                    isLoading={isLoading}
                  />
                </div>

                {/* Terms and Privacy */}
                <div className="mt-8">
                  <TermsAndPrivacy />
                </div>

                {/* Login Redirect */}
                <div className="mt-6 pt-6 border-t border-border">
                  <LoginRedirect />
                </div>
              </div>
            )}

            {/* Features Preview */}
            {!registrationSuccess && (
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  What you'll get with AI Nexus:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center space-y-2 p-4 glass-morphism rounded-lg">
                    <Icon name="FileText" size={20} color="var(--color-secondary)" />
                    <span className="text-xs font-medium text-foreground">AI Text Studio</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-4 glass-morphism rounded-lg">
                    <Icon name="Image" size={20} color="var(--color-secondary)" />
                    <span className="text-xs font-medium text-foreground">Image Processing</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-4 glass-morphism rounded-lg">
                    <Icon name="BarChart3" size={20} color="var(--color-secondary)" />
                    <span className="text-xs font-medium text-foreground">Data Analytics</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default UserRegistration;