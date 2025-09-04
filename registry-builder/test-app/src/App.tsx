import React from 'react';
import { AppRoutes } from './routes/AppRoutes';
import { LoginPage } from './pages/LoginPage';
import { ProductListPage } from './pages/ProductListPage';

const App: React.FC = () => {
  return (
    <div className="app" data-testid="app-container">
      <header className="app-header" data-testid="app-header">
        <h1>Test Application</h1>
      </header>
      
      <main className="app-main" data-testid="app-main" role="main">
        <AppRoutes />
        
        {/* Example of conditional rendering with complex expressions */}
        <div className="demo-pages" data-testid="demo-pages">
          <LoginPage />
          <ProductListPage />
        </div>
      </main>
      
      <footer className="app-footer" data-testid="app-footer" role="contentinfo">
        <p>&copy; 2024 Test App</p>
      </footer>
    </div>
  );
};

export default App;