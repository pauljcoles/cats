import React from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { MainContent } from '../components/MainContent';
import { Footer } from '../components/Footer';

// Container page with no direct content - just composition
export const DashboardContainer: React.FC = () => {
  return (
    <>
      <Header />
      <div className="dashboard-layout">
        <Sidebar />
        <MainContent />
      </div>
      <Footer />
    </>
  );
};