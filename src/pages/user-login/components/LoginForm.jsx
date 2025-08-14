import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  // Mock credentials for authentication
  const mockCredentials = {
    email: 'admin@ainexus.com',
    password: 'Admin123!',
    mfaCode: '123456'
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (showMFA && !mfaCode) {
      newErrors.mfaCode = 'Verification code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check credentials
      if (formData?.email !== mockCredentials?.email || formData?.password !== mockCredentials?.password) {
        setErrors({ general: 'Invalid email or password. Please try again.' });
        setIsLoading(false);
        return;
      }

      // Show MFA if not already shown
      if (!showMFA) {
        setShowMFA(true);
        setIsLoading(false);
        return;
      }

      // Validate MFA code
      if (mfaCode !== mockCredentials?.mfaCode) {
        setErrors({ mfaCode: 'Invalid verification code. Please try again.' });
        setIsLoading(false);
        return;
      }

      // Successful login
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', formData?.email);
      if (formData?.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      navigate('/main-dashboard');
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // In a real app, this would trigger password reset flow
    alert('Password reset link would be sent to your email address.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors?.general && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} color="var(--color-destructive)" />
            <p className="text-sm text-destructive">{errors?.general}</p>
          </div>
        </div>
      )}
      <div className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData?.email}
          onChange={handleInputChange}
          error={errors?.email}
          required
          disabled={isLoading}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData?.password}
          onChange={handleInputChange}
          error={errors?.password}
          required
          disabled={isLoading}
        />

        {showMFA && (
          <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Icon name="Shield" size={16} color="var(--color-secondary)" />
              <h3 className="text-sm font-medium text-foreground">Two-Factor Authentication</h3>
            </div>
            <Input
              label="Verification Code"
              type="text"
              placeholder="Enter 6-digit code"
              value={mfaCode}
              onChange={(e) => setMfaCode(e?.target?.value)}
              error={errors?.mfaCode}
              description="Enter the 6-digit code from your authenticator app"
              required
              disabled={isLoading}
              maxLength={6}
            />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <Checkbox
          label="Remember me"
          checked={formData?.rememberMe}
          onChange={handleInputChange}
          name="rememberMe"
          disabled={isLoading}
        />

        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-primary hover:text-primary/80 spring-animation"
          disabled={isLoading}
        >
          Forgot password?
        </button>
      </div>
      <Button
        type="submit"
        variant="default"
        size="lg"
        loading={isLoading}
        fullWidth
        iconName={showMFA ? "Shield" : "LogIn"}
        iconPosition="left"
      >
        {showMFA ? 'Verify & Sign In' : 'Sign In'}
      </Button>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/user-registration')}
            className="text-primary hover:text-primary/80 font-medium spring-animation"
            disabled={isLoading}
          >
            Sign up here
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;