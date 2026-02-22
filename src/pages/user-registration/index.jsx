import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import SocialLoginButtons from './components/SocialLoginButtons';
import RegistrationForm from './components/RegistrationForm';
import TermsAndPrivacy from './components/TermsAndPrivacy';
import LoginRedirect from './components/LoginRedirect';
import SuccessMessage from './components/SuccessMessage';

const UserRegistration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated, message } = useSelector((state) => state.auth);

  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [localError, setLocalError] = useState('');

  // ── If registration auto-logged in the user, go straight to dashboard ──────
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/main-dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // ── Sync Redux errors to local state ─────────────────────────────────────
  useEffect(() => {
    if (error) setLocalError(error);
  }, [error]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  // ── Social login (kept as stub – replace with OAuth provider) ────────────
  const handleSocialLogin = async (provider) => {
    setLocalError(`Social login with ${provider} is not yet configured.`);
  };

  // ── Main registration handler ─────────────────────────────────────────────
  const handleRegistration = async (formData) => {
    setLocalError('');
    dispatch(clearError());

    const result = await dispatch(
      registerUser({
        name: formData.fullName,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword || formData.password,
      })
    );

    if (registerUser.fulfilled.match(result)) {
      // isAuthenticated effect above will handle redirect.
      // If server requires email verification (returns no accessToken), show success screen.
      if (!result.payload?.accessToken) {
        setUserEmail(formData.email);
        setRegistrationSuccess(true);
      }
      // If accessToken present → isAuthenticated becomes true → useEffect navigates away
    } else {
      setLocalError(result.payload || 'Registration failed. Please try again.');
    }
  };

  // ── Resend verification email ─────────────────────────────────────────────
  const handleResendEmail = async () => {
    try {
      const { default: axios } = await import('axios');
      await axios.post('/api/v1/auth/resend-verification', {}, { withCredentials: true });
    } catch {
      setLocalError('Failed to resend verification email. Please try again.');
    }
  };

  const handleBackToRegistration = () => {
    setRegistrationSuccess(false);
    setUserEmail('');
    setLocalError('');
    dispatch(clearError());
  };

  const displayError = localError || error;

  return (
    <>
      <Helmet>
        <title>Sign Up - AI Nexus | Create Your AI-Powered Account</title>
        <meta
          name="description"
          content="Join AI Nexus today and unlock powerful AI tools for text generation, image processing, and data analysis. Create your free account in minutes."
        />
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
                  isResending={loading}
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
                {displayError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Icon name="AlertCircle" size={20} color="#EF4444" className="mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Registration Error</p>
                        <p className="text-sm text-red-600 mt-1">{displayError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Social Login */}
                <SocialLoginButtons onSocialLogin={handleSocialLogin} isLoading={loading} />

                {/* Registration Form */}
                <div className="mt-6">
                  <RegistrationForm onSubmit={handleRegistration} isLoading={loading} />
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