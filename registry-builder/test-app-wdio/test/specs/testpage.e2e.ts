import { TestPage } from '../pageobjects/TestPage';

describe('Test Page Functionality', () => {
  let testPage: TestPage;

  beforeEach(async () => {
    testPage = new TestPage();
    await testPage.open();
  });

  it('should submit login form successfully', async () => {
    await testPage.submitLogin('user@example.com', 'password123');
    
    // Wait for redirect or success message
    await browser.waitUntil(
      async () => {
        const url = await browser.getUrl();
        return url.includes('/dashboard');
      },
      {
        timeout: 5000,
        timeoutMsg: 'Login did not redirect to dashboard'
      }
    );
    
    expect(await browser.getUrl()).toContain('/dashboard');
  });

  it('should add item to cart', async () => {
    await testPage.addToCart();
    
    // Wait for cart notification or update
    const cartNotification = $('.cart-notification');
    await cartNotification.waitForDisplayed({ timeout: 3000 });
    
    expect(await cartNotification.getText()).toContain('Added to cart');
  });

  it('should search for products', async () => {
    const searchQuery = 'laptop';
    await testPage.searchProducts(searchQuery);
    
    // Wait for search results
    await browser.waitUntil(
      async () => {
        const url = await browser.getUrl();
        return url.includes('search') || url.includes(searchQuery);
      },
      {
        timeout: 5000,
        timeoutMsg: 'Search results did not load'
      }
    );
    
    const searchResults = $('.search-results');
    await expect(searchResults).toBeDisplayed();
  });

  it('should select country from dropdown', async () => {
    await testPage.selectCountry('United States');
    
    // Verify selection
    const selectedValue = await testPage.countrySelect.getValue();
    expect(selectedValue).toBe('US');
  });

  it('should handle form validation errors', async () => {
    // Try to submit with empty fields
    await testPage.submitLogin('', '');
    
    // Check for validation errors
    const errorMessage = $('.validation-error');
    await errorMessage.waitForDisplayed({ timeout: 3000 });
    
    expect(await errorMessage.getText()).toContain('required');
  });
});
