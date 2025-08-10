import { Page } from '@playwright/test';

/**
 * ProductPage - Generated Page Object
 * File: test/test-app/src/pages/ProductPage.tsx
 * Route: /productpage
 * Interactive Elements: 9
 */
export class ProductPage {
  constructor(private page: Page) {} {
  
  // Selectors for interactive elements
  selectors = {
  button_add_to_cart: 'button=Add to Cart', // button - semantic (confidence: 10/10)
  button_buy_now: 'button=Buy Now', // button - semantic (confidence: 10/10)
  button_add_to_wishlist: 'button=Add to Wishlist', // button - semantic (confidence: 10/10)
  form_product: 'form', // form - fallback (confidence: 3/10)
  select_size: '[aria-label="Size"]', // select - attribute (confidence: 9/10)
  select_color: '[aria-label="Color"]', // select - attribute (confidence: 9/10)
  input_number: 'input[type="number"]', // input - attribute (confidence: 7/10)
  button_write_review: 'button=Write Review', // button - semantic (confidence: 10/10)
  a_view_all_reviews: 'link=View All Reviews', // a - semantic (confidence: 10/10)
  };

  async navigateTo(): Promise<void> {
    await this.page.goto('/productpage');
    await this.waitForLoad();
  }

  async clickButton_add_to_cart(): Promise<void> {
    await this.page.locator('button=Add to Cart').click();
  }

  async clickButton_buy_now(): Promise<void> {
    await this.page.locator('button=Buy Now').click();
  }

  async clickButton_add_to_wishlist(): Promise<void> {
    await this.page.locator('button=Add to Wishlist').click();
  }

  async selectSelect_size(value: string): Promise<void> {
    await this.page.locator('[aria-label="Size"]').selectOption(value);
  }

  async selectSelect_color(value: string): Promise<void> {
    await this.page.locator('[aria-label="Color"]').selectOption(value);
  }

  async clickButton_write_review(): Promise<void> {
    await this.page.locator('button=Write Review').click();
  }
}