import React from 'react';

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
  'aria-label'?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const Link: React.FC<LinkProps> = ({ 
  href, 
  children, 
  className = '', 
  'data-testid': testId,
  'aria-label': ariaLabel,
  onClick 
}) => {
  return (
    <a
      href={href}
      className={`link ${className}`}
      data-testid={testId}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </a>
  );
};