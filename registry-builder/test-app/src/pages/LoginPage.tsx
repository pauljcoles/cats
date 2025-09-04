import React, { useState } from 'react';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { generateTestId, createPageTestId } from '../utils/testIds';

interface LoginFormData {
  email: string;
  password: string;
}

const LOGIN_FORM_FIELDS = ['email', 'password'] as const;

export const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const handleFieldChange = (field: keyof LoginFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log('Login attempt:', formData);
    }, 2000);
  };

  const pageTestId = (element: string) => createPageTestId('login', element);
  const formTestId = generateTestId('login-form', 'submit');

  return (
    <div className="login-page" data-testid={pageTestId('container')}>
      {/* Loading state */}
      {isLoading && (
        <div 
          className="loading-spinner" 
          data-testid="loader"
          role="status"
          aria-live="polite"
        >
          <span>Loading...</span>
        </div>
      )}
      
      <div className="login-header">
        <h1 data-testid={pageTestId('title')}>Welcome Back</h1>
        <p data-testid={pageTestId('subtitle')}>Sign in to your account</p>
      </div>

      <form 
        className="login-form" 
        onSubmit={handleSubmit}
        data-testid={pageTestId('form')}
        aria-labelledby="login-title"
      >
        <FormField
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleFieldChange('email')}
          placeholder="Enter your email"
          required
          error={errors.email}
        />

        <FormField
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleFieldChange('password')}
          placeholder="Enter your password"
          required
          error={errors.password}
        />

        <div className="form-actions">
          <Button
            variant="primary"
            size="lg"
            loading={isLoading}
            data-testid={formTestId}
          >
            Sign In
          </Button>
          
          <button
            type="button"
            className="link-button"
            data-testid={generateTestId('forgot-password', 'link')}
          >
            Forgot your password?
          </button>
        </div>
      </form>

      <div className="login-footer">
        <p>
          Don't have an account?{' '}
          <a 
            href="/signup" 
            data-testid={generateTestId('signup', 'link')}
            aria-label="Create a new account"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};