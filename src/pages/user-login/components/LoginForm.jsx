import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../../store/slices/authSlice';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // ── Redirect once authenticated ───────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = sessionStorage.getItem('redirectAfterLogin') || '/main-dashboard';
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // ── Sync Redux errors ─────────────────────────────────────────────────────
  useEffect(() => {
    if (error) setGeneralError(error);
  }, [error]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter a valid email';
    if (!formData.password) errs.password = 'Password is required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (generalError) setGeneralError('');
    dispatch(clearError());
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setGeneralError('');
    const result = await dispatch(loginUser({ email: formData.email, password: formData.password }));

    if (loginUser.rejected.match(result)) {
      setGeneralError(result.payload || 'Login failed. Please try again.');
    }
    // On success, the isAuthenticated useEffect above handles navigation
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* General error */}
      {generalError && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} color="var(--color-destructive)" />
            <p className="text-sm text-destructive">{generalError}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          name="email"
          id="login-email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
          error={fieldErrors.email}
          required
          disabled={loading}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          id="login-password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange}
          error={fieldErrors.password}
          required
          disabled={loading}
        />
      </div>

      <div className="flex items-center justify-between">
        <Checkbox
          label="Remember me"
          checked={formData.rememberMe}
          onChange={handleInputChange}
          name="rememberMe"
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-primary hover:text-primary/80 spring-animation"
          disabled={loading}
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        variant="default"
        size="lg"
        loading={loading}
        fullWidth
        iconName="LogIn"
        iconPosition="left"
      >
        Sign In
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/user-registration')}
            className="text-primary hover:text-primary/80 font-medium spring-animation"
            disabled={loading}
          >
            Sign up here
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;