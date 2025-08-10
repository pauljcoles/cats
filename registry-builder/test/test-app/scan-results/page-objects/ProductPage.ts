import { Page } from '@playwright/test';

/**
 * ProductPage - Generated Page Object
 * File: test-app/src/pages/ProductPage.tsx
 * Route: /productpage
 * Interactive Elements: 9
 */
export class ProductPage {
  constructor(private page: Page) {} {
  
  // Selectors for interactive elements
  selectors = {
  button_add_to_cart: '[data-testid="add-to-cart"]', // button - testid (confidence: 10/10)
  button_buy_now: '[data-testid="buy-now"]', // button - testid (confidence: 10/10)
  button_add_to_wishlist: 'button=Add to Wishlist', // button - semantic (confidence: 9/10)
  form_product: 'form', // form - fallback (confidence: 3/10)
  select_size: '[data-testid="size-select"]', // select - testid (confidence: 10/10)
  select_color: '[data-testid="color-select"]', // select - testid (confidence: 10/10)
  input_number: '[data-testid="quantity-input"]', // input - testid (confidence: 10/10)
  button_write_review: 'button=Write Review', // button - semantic (confidence: 9/10)
  a_view_all_reviews: 'link=View All Reviews', // a - semantic (confidence: 9/10)
  };

  async navigateTo(): Promise<void> {
    await this.page.goto('/productpage');
    await this.waitForLoad();
  }

  async clickButton_add_to_cart(): Promise<void> {
    await this.page.locator('[data-testid="add-to-cart"]').click();
  }

  async clickButton_buy_now(): Promise<void> {
    await this.page.locator('[data-testid="buy-now"]').click();
  }

  async clickButton_add_to_wishlist(): Promise<void> {
    await this.page.locator('button=Add to Wishlist').click();
  }

  async selectSelect_size(value: string): Promise<void> {
    await this.page.locator('[data-testid="size-select"]').selectOption(value);
  }

  async selectSelect_color(value: string): Promise<void> {
    await this.page.locator('[data-testid="color-select"]').selectOption(value);
  }

  async fillInput_number(text: string): Promise<void> {
    await this.page.locator('[data-testid="quantity-input"]').fill(text);
  }

  async clickButton_write_review(): Promise<void> {
    await this.page.locator('button=Write Review').click();
  }
}