

/**
 * SingleProductPage - Generated Page Object
 * File: /home/pauljcoles/code/cats/ecom/simple-react-ecommerce/src/pages/SingleProduct.tsx
 * Route: /singleproduct
 * Interactive Elements: 3
 */
class SingleProductPage {
  constructor(page) {
    this.page = page;
  }

  // Selectors for interactive elements
  selectors = {
    button_add_to_cart: 'button=ADD TO CART', // button - semantic (confidence: 9/10)
    button_buy_now: 'button=BUY NOW', // button - semantic (confidence: 9/10)
    button_add_to_wishlist: 'button=ADD TO WISHLIST', // button - semantic (confidence: 9/10)
  };

  navigateTo() {
    cy.visit('/singleproduct');
    this.waitForLoad();
  }

  clickButton_add_to_cart() {
    cy.get('button=ADD TO CART').click();
  }

  clickButton_buy_now() {
    cy.get('button=BUY NOW').click();
  }

  clickButton_add_to_wishlist() {
    cy.get('button=ADD TO WISHLIST').click();
  }
}

module.exports = SingleProductPage;