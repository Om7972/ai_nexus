import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const RegistrationForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    subscribeNewsletter: false
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password) => {
    const minLength = password?.length >= 8;
    const hasUpperCase = /[A-Z]/?.test(password);
    const hasLowerCase = /[a-z]/?.test(password);
    const hasNumbers = /\d/?.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/?.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const getPasswordStrength = (password) => {
    const validation = validatePassword(password);
    const score = Object.values(validation)?.filter(Boolean)?.length - 1; // Exclude isValid
    
    if (score <= 2) return { strength: 'Weak', color: 'bg-red-500', width: '33%' };
    if (score <= 4) return { strength: 'Medium', color: 'bg-yellow-500', width: '66%' };
    return { strength: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData?.fullName?.trim()?.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData?.password)?.isValid) {
      newErrors.password = 'Password must meet all requirements';
    }

    if (!formData?.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData?.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const passwordStrength = formData?.password ? getPasswordStrength(formData?.password) : null;
  const passwordValidation = formData?.password ? validatePassword(formData?.password) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Full Name"
        type="text"
        name="fullName"
        value={formData?.fullName}
        onChange={handleInputChange}
        placeholder="Enter your full name"
        error={errors?.fullName}
        required
        disabled={isLoading}
      />
      <Input
        label="Email Address"
        type="email"
        name="email"
        value={formData?.email}
        onChange={handleInputChange}
        placeholder="Enter your email address"
        error={errors?.email}
        required
        disabled={isLoading}
      />
      <div className="space-y-2">
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData?.password}
            onChange={handleInputChange}
            placeholder="Create a strong password"
            error={errors?.password}
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground spring-animation"
          >
            <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
          </button>
        </div>

        {formData?.password && passwordStrength && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Password strength:</span>
              <span className={`font-medium ${
                passwordStrength?.strength === 'Strong' ? 'text-green-600' :
                passwordStrength?.strength === 'Medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {passwordStrength?.strength}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${passwordStrength?.color}`}
                style={{ width: passwordStrength?.width }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {passwordValidation && (
                <>
                  <div className={`flex items-center space-x-1 ${passwordValidation?.minLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <Icon name={passwordValidation?.minLength ? "Check" : "X"} size={12} />
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${passwordValidation?.hasUpperCase ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <Icon name={passwordValidation?.hasUpperCase ? "Check" : "X"} size={12} />
                    <span>Uppercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${passwordValidation?.hasLowerCase ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <Icon name={passwordValidation?.hasLowerCase ? "Check" : "X"} size={12} />
                    <span>Lowercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${passwordValidation?.hasNumbers ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <Icon name={passwordValidation?.hasNumbers ? "Check" : "X"} size={12} />
                    <span>Number</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${passwordValidation?.hasSpecialChar ? 'text-green-600' : 'text-muted-foreground'} col-span-2`}>
                    <Icon name={passwordValidation?.hasSpecialChar ? "Check" : "X"} size={12} />
                    <span>Special character (!@#$%^&*)</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="relative">
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          value={formData?.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirm your password"
          error={errors?.confirmPassword}
          required
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-9 text-muted-foreground hover:text-foreground spring-animation"
        >
          <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={16} />
        </button>
      </div>
      <div className="space-y-4">
        <Checkbox
          label="I agree to the Terms of Service and Privacy Policy"
          name="agreeToTerms"
          checked={formData?.agreeToTerms}
          onChange={handleInputChange}
          error={errors?.agreeToTerms}
          required
          disabled={isLoading}
        />

        <Checkbox
          label="Subscribe to our newsletter for AI updates and tips"
          name="subscribeNewsletter"
          checked={formData?.subscribeNewsletter}
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        variant="default"
        size="lg"
        fullWidth
        loading={isLoading}
        disabled={isLoading}
        className="bg-secondary hover:bg-secondary/90 text-primary"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};

export default RegistrationForm;