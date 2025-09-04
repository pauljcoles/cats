import React from 'react';
import { LoginPage } from '../pages/LoginPage';
import { ProductListPage } from '../pages/ProductListPage';

// Route configuration with complex imports and dynamic loading
export const ROUTES = {
  LOGIN: '/login',
  PRODUCTS: '/products',
  HOME: '/'
} as const;

interface Route {
  path: string;
  component: React.ComponentType;
  name: string;
  requiresAuth?: boolean;
}

export const routes: Route[] = [
  {
    path: ROUTES.LOGIN,
    component: LoginPage,
    name: 'Login',
    requiresAuth: false
  },
  {
    path: ROUTES.PRODUCTS,
    component: ProductListPage,
    name: 'Products',
    requiresAuth: true
  }
];

// Dynamic route loading example
export const loadRoute = async (routeName: string): Promise<React.ComponentType | null> => {
  switch (routeName) {
    case 'login':
      return (await import('../pages/LoginPage')).LoginPage;
    case 'products':
      return (await import('../pages/ProductListPage')).ProductListPage;
    default:
      return null;
  }
};

export const AppRoutes: React.FC = () => {
  return (
    <div className="app-routes" data-testid="app-routes-container">
      {/* This would be replaced with actual router logic */}
      <nav className="main-navigation" data-testid="main-nav">
        <ul role="menubar">
          {routes.map(route => (
            <li key={route.path} role="none">
              <a 
                href={route.path}
                role="menuitem"
                data-testid={`nav-link-${route.name.toLowerCase()}`}
                aria-label={`Navigate to ${route.name}`}
              >
                {route.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};