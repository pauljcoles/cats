// Main entry point with re-exports and complex imports
export { default as App } from './App';
export { LoginPage } from './pages/LoginPage';
export { ProductListPage } from './pages/ProductListPage';
export { AppRoutes, ROUTES, routes, loadRoute } from './routes/AppRoutes';
export { Button } from './components/Button';
export { FormField } from './components/FormField';
export { generateTestId, createPageTestId, getModalTestId } from './utils/testIds';