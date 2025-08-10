import { Page } from '@playwright/test';

/**
 * SingleProductPage - Generated Page Object
 * File: /home/pauljcoles/code/cats/ecom/simple-react-ecommerce/src/pages/SingleProduct.tsx
 * Route: /singleproduct
 * Interactive Elements: 3
 */
export class SingleProductPage {
  constructor(private page: Page) {} {
  
  // Selectors for interactive elements
  selectors = {
  button_add_to_cart: 'button=ADD TO CART', // button - semantic (confidence: 9/10)
  button_buy_now: 'button=BUY NOW', // button - semantic (confidence: 9/10)
  button_add_to_wishlist: 'button=ADD TO WISHLIST', // button - semantic (confidence: 9/10)
  };

  async navigateTo(): Promise<void> {
    await this.page.goto('/singleproduct');
    await this.waitForLoad();
  }

  async clickButton_add_to_cart(): Promise<void> {
    await this.page.locator('button=ADD TO CART').click();
  }

  async clickButton_buy_now(): Promise<void> {
    await this.page.locator('button=BUY NOW').click();
  }

  async clickButton_add_to_wishlist(): Promise<void> {
    await this.page.locator('button=ADD TO WISHLIST').click();
  }
}