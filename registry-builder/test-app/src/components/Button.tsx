import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  'data-testid'?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  children,
  onClick,
  'data-testid': testId
}) => {
  const className = `btn btn-${variant} btn-${size}`;
  const dynamicTestId = testId || `button-${variant}-${size}`;
  
  return (
    <button
      className={className}
      data-testid={dynamicTestId}
      onClick={onClick}
      disabled={loading}
      aria-busy={loading}
      aria-label={loading ? 'Loading...' : undefined}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};