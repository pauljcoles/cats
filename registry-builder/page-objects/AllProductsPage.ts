import { Page } from '@playwright/test';

/**
 * AllProductsPage - Generated Page Object
 * File: /home/pauljcoles/code/cats/ecom/simple-react-ecommerce/src/pages/AllProducts.tsx
 * Route: /allproducts
 * Interactive Elements: 1
 */
export class AllProductsPage {
  constructor(private page: Page) {} {
  
  // Selectors for interactive elements
  selectors = {
  select_allproducts: 'select', // select - fallback (confidence: 3/10)
  };

  async navigateTo(): Promise<void> {
    await this.page.goto('/allproducts');
    await this.waitForLoad();
  }
}