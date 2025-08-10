/**
 * AllProductsPage - Generated WDIO Page Object
 * File: /home/pauljcoles/code/cats/ecom/simple-react-ecommerce/src/pages/AllProducts.tsx
 * Route: /allproducts
 * Interactive Elements: 1
 */
class AllProductsPage {

  /**
   * Get select_allproducts element
   * select - fallback (confidence: 3/10)
   */
  get select_allproducts() {
    return $('select');
  }

  /**
   * Navigate to AllProducts page
   */
  async open() {
    await browser.url('/allproducts');
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
        timeoutMsg: 'AllProducts page did not load within 10 seconds'
      }
    );
  }


}

module.exports = AllProductsPage;