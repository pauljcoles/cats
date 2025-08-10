

/**
 * AllProductsPage - Generated Page Object
 * File: /home/pauljcoles/code/cats/ecom/simple-react-ecommerce/src/pages/AllProducts.tsx
 * Route: /allproducts
 * Interactive Elements: 1
 */
class AllProductsPage {
  constructor(page) {
    this.page = page;
  }

  // Selectors for interactive elements
  selectors = {
    select_allproducts: 'select', // select - fallback (confidence: 3/10)
  };

  navigateTo() {
    cy.visit('/allproducts');
    this.waitForLoad();
  }
}

module.exports = AllProductsPage;