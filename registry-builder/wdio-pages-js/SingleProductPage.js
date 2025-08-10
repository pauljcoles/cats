/**
 * SingleProductPage - Generated WDIO Page Object
 * File: /home/pauljcoles/code/cats/ecom/simple-react-ecommerce/src/pages/SingleProduct.tsx
 * Route: /singleproduct
 * Interactive Elements: 3
 */
class SingleProductPage {

  /**
   * Get button_add_to_cart element
   * button - semantic (confidence: 9/10)
   */
  get button_add_to_cart() {
    return $('button=ADD TO CART');
  }

  /**
   * Get button_buy_now element
   * button - semantic (confidence: 9/10)
   */
  get button_buy_now() {
    return $('button=BUY NOW');
  }

  /**
   * Get button_add_to_wishlist element
   * button - semantic (confidence: 9/10)
   */
  get button_add_to_wishlist() {
    return $('button=ADD TO WISHLIST');
  }

  /**
   * Navigate to SingleProduct page
   */
  async open() {
    await browser.url('/singleproduct');
    await this.waitForLoad();
  }

  /**
   * Wait for page to load
   */
  async waitForLoad() {
    // Add page-specific wait logic here
    await browser.waitUntil(
      async () => {
        // Example: wait for a key element to be displayed
        // return await this.someKeyElement.isDisplayed();
        return true;
      },
      {
        timeout: 10000,
        timeoutMsg: 'SingleProduct page did not load within 10 seconds'
      }
    );
  }

  /**
   * Click button_add_to_cart
   */
  async clickButton_add_to_cart() {
    await this.button_add_to_cart.click();
  }

  /**
   * Click button_buy_now
   */
  async clickButton_buy_now() {
    await this.button_buy_now.click();
  }

  /**
   * Click button_add_to_wishlist
   */
  async clickButton_add_to_wishlist() {
    await this.button_add_to_wishlist.click();
  }
}

module.exports = SingleProductPage;