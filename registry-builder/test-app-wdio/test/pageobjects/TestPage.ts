/**
 * TestPage - WebdriverIO Page Object
 * Existing WDIO page object for comparison
 */
export class TestPage {
  /**
   * Get submit button element
   */
  get submitButton() {
    return $('[data-testid="submit-btn"]');
  }

  /**
   * Get email input element
   */
  get emailInput() {
    return $('[data-testid="email-input"]');
  }

  /**
   * Get password input element
   */
  get passwordInput() {
    return $('[placeholder="Enter password"]');
  }

  /**
   * Get add to cart button
   */
  get addToCartButton() {
    return $('button*=Add to Cart');
  }

  /**
   * Get search input
   */
  get searchInput() {
    return $('[placeholder="Search products..."]');
  }

  /**
   * Get country select dropdown
   */
  get countrySelect() {
    return $('[aria-label="Select country"]');
  }

  /**
   * Navigate to test page
   */
  async open() {
    await browser.url('/testpage');
    await this.waitForLoad();
  }

  /**
   * Wait for page to load
   */
  async waitForLoad() {
    await browser.waitUntil(
      async () => {
        return await browser.execute(() => document.readyState === 'complete');
      },
      {
        timeout: 10000,
        timeoutMsg: 'Page did not load within 10 seconds'
      }
    );
  }

  /**
   * Submit login form
   */
  async submitLogin(email: string, password: string) {
    await this.emailInput.setValue(email);
    await this.passwordInput.setValue(password);
    await this.submitButton.click();
  }

  /**
   * Add item to cart
   */
  async addToCart() {
    await this.addToCartButton.click();
  }

  /**
   * Search for products
   */
  async searchProducts(query: string) {
    await this.searchInput.setValue(query);
    await browser.keys('Enter');
  }

  /**
   * Select country
   */
  async selectCountry(country: string) {
    await this.countrySelect.selectByVisibleText(country);
  }
}
