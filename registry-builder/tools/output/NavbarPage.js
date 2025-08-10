// Navbar Page Object - Generated from Registry
class NavbarPage {
  constructor(page) {
    this.page = page;
  }
  
  selectors = {
  input_search_for_a_product: 'input[type="text"]', // input - Priority: high
  span_login: '[data-testid="span-login"]', // span - Priority: high
  div_element: '[data-testid="div-element"]', // div - Priority: high
  div_element: '[data-testid="div-element"]', // div - Priority: high
  };
  
  // Helper methods
  async waitForLoad() {
    // Add component-specific wait logic
  }
  
  // Add your page methods here
}

module.exports = NavbarPage;
