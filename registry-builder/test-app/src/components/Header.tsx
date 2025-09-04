import React from 'react';
import { Navigation } from './Navigation';
import { UserMenu } from './UserMenu';
import { SearchBar } from './SearchBar';

export const Header: React.FC = () => {
  return (
    <header className="main-header" data-testid="main-header">
      <div className="header-content">
        <div className="header-left">
          <Navigation />
        </div>
        <div className="header-center">
          <SearchBar />
        </div>
        <div className="header-right">
          <UserMenu />
        </div>
      </div>
    </header>
  );
};