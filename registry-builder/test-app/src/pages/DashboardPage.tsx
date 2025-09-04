import React from 'react';
import { PageLayout } from '../layouts/PageLayout';
import { DashboardContainer } from '../containers/DashboardContainer';

// Page component that's just a wrapper - minimal content, just imports
export const DashboardPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' }
  ];

  return (
    <PageLayout 
      title="Dashboard"
      breadcrumbs={breadcrumbs}
      showSidebar={true}
    >
      <DashboardContainer />
    </PageLayout>
  );
};