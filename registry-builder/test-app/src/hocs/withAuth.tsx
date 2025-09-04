import React from 'react';
import { Button } from '../components/Button';

interface AuthState {
  isAuthenticated: boolean;
  user?: {
    id: string;
    name: string;
    role: string;
  };
}

// HOC pattern - wraps components with authentication
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole?: string
) {
  return function WithAuthComponent(props: P) {
    const [authState] = React.useState<AuthState>({
      isAuthenticated: false, // Simulate unauthenticated state
      user: undefined
    });

    const handleLogin = () => {
      console.log('Redirect to login');
    };

    const handleUpgrade = () => {
      console.log('Redirect to upgrade');
    };

    if (!authState.isAuthenticated) {
      return (
        <div className="auth-required" data-testid="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to access this page.</p>
          <Button
            variant="primary"
            onClick={handleLogin}
            data-testid="login-button"
            aria-label="Log in to continue"
          >
            Log In
          </Button>
        </div>
      );
    }

    if (requiredRole && authState.user?.role !== requiredRole) {
      return (
        <div className="insufficient-permissions" data-testid="insufficient-permissions">
          <h2>Insufficient Permissions</h2>
          <p>You need {requiredRole} access to view this page.</p>
          <Button
            variant="secondary"
            onClick={handleUpgrade}
            data-testid="upgrade-button"
            aria-label={`Upgrade to ${requiredRole} access`}
          >
            Request {requiredRole} Access
          </Button>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}