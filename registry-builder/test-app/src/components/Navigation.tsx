import React from 'react';
import { Link } from './Link';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { id: 'products', label: 'Products', href: '/products', icon: 'inventory' },
  { id: 'users', label: 'Users', href: '/users', icon: 'people' },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: 'chart' }
];

export const Navigation: React.FC = () => {
  return (
    <nav className="main-navigation" role="navigation">
      <ul className="nav-list">
        {NAV_ITEMS.map(item => (
          <li key={item.id} className="nav-item">
            <Link 
              href={item.href}
              className={`nav-link nav-link-${item.id}`}
              data-testid={`nav-${item.id}`}
              aria-label={`Navigate to ${item.label}`}
            >
              {item.icon && (
                <span 
                  className={`nav-icon icon-${item.icon}`}
                  aria-hidden="true"
                />
              )}
              <span className="nav-label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};