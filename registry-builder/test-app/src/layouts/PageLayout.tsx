import React from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  showSidebar?: boolean;
  breadcrumbs?: Array<{ label: string; href: string }>;
}

// Layout component that wraps page content - very common pattern
export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  showSidebar = true,
  breadcrumbs = []
}) => {
  return (
    <div className="page-layout" data-testid="page-layout">
      <Header />
      
      {breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}
      
      <main className="main-content" role="main">
        {title && (
          <h1 className="page-title" data-testid="page-title">
            {title}
          </h1>
        )}
        
        <div className="content-wrapper">
          {showSidebar && (
            <aside className="sidebar-wrapper">
              <Sidebar />
            </aside>
          )}
          
          <div className="page-content">
            {children}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};