import React, { lazy } from 'react';
import { PageLayout } from '../layouts/PageLayout';

// Even more extreme case - page with conditional lazy loading and no direct elements
const AdminDashboard = lazy(() => import('../containers/AdminDashboardContainer'));
const UserManagement = lazy(() => import('../containers/UserManagementContainer'));
const SystemSettings = lazy(() => import('../containers/SystemSettingsContainer'));

interface AdminPageProps {
  section?: 'dashboard' | 'users' | 'settings';
  userRole: 'admin' | 'superadmin';
}

export const AdminPage: React.FC<AdminPageProps> = ({ 
  section = 'dashboard', 
  userRole 
}) => {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Admin', href: '/admin' }
  ];

  // This page has no direct interactive elements - everything comes from containers
  const renderContent = () => {
    switch (section) {
      case 'users':
        return <UserManagement userRole={userRole} />;
      case 'settings':
        return <SystemSettings userRole={userRole} />;
      default:
        return <AdminDashboard userRole={userRole} />;
    }
  };

  return (
    <PageLayout 
      title={`Admin - ${section.charAt(0).toUpperCase() + section.slice(1)}`}
      breadcrumbs={breadcrumbs}
      showSidebar={userRole === 'superadmin'}
    >
      <div className="admin-content" data-testid={`admin-${section}`}>
        {renderContent()}
      </div>
    </PageLayout>
  );
};