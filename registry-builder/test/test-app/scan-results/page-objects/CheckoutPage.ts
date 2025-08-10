import { Page } from '@playwright/test';

/**
 * CheckoutPage - Generated Page Object
 * File: test-app/src/pages/CheckoutPage.tsx
 * Route: /checkoutpage
 * Interactive Elements: 14
 */
export class CheckoutPage {
  constructor(private page: Page) {} {
  
  // Selectors for interactive elements
  selectors = {
  form_checkout: '[data-testid="shipping-form"]', // form - testid (confidence: 10/10)
  input_first_name: '[data-testid="first-name"]', // input - testid (confidence: 10/10)
  input_last_name: '[data-testid="last-name"]', // input - testid (confidence: 10/10)
  input_address: '[data-testid="address"]', // input - testid (confidence: 10/10)
  input_city: '[data-testid="city"]', // input - testid (confidence: 10/10)
  select_state: '[data-testid="state-select"]', // select - testid (confidence: 10/10)
  input_zip_code: '[data-testid="zip-code"]', // input - testid (confidence: 10/10)
  form_checkout: '[data-testid="payment-form"]', // form - testid (confidence: 10/10)
  input_card_number: '[data-testid="card-number"]', // input - testid (confidence: 10/10)
  input_mmyy: '[data-testid="expiry"]', // input - testid (confidence: 10/10)
  input_cvv: '[data-testid="cvv"]', // input - testid (confidence: 10/10)
  button_place_order: '[data-testid="place-order"]', // button - testid (confidence: 10/10)
  button_back_to_cart: 'button=Back to Cart', // button - semantic (confidence: 9/10)
  a_edit_cart: 'link=Edit Cart', // a - semantic (confidence: 9/10)
  };

  async navigateTo(): Promise<void> {
    await this.page.goto('/checkoutpage');
    await this.waitForLoad();
  }

  async fillInput_first_name(text: string): Promise<void> {
    await this.page.locator('[data-testid="first-name"]').fill(text);
  }

  async fillInput_last_name(text: string): Promise<void> {
    await this.page.locator('[data-testid="last-name"]').fill(text);
  }

  async fillInput_address(text: string): Promise<void> {
    await this.page.locator('[data-testid="address"]').fill(text);
  }

  async fillInput_city(text: string): Promise<void> {
    await this.page.locator('[data-testid="city"]').fill(text);
  }

  async selectSelect_state(value: string): Promise<void> {
    await this.page.locator('[data-testid="state-select"]').selectOption(value);
  }

  async fillInput_zip_code(text: string): Promise<void> {
    await this.page.locator('[data-testid="zip-code"]').fill(text);
  }

  async fillInput_card_number(text: string): Promise<void> {
    await this.page.locator('[data-testid="card-number"]').fill(text);
  }

  async fillInput_mmyy(text: string): Promise<void> {
    await this.page.locator('[data-testid="expiry"]').fill(text);
  }

  async fillInput_cvv(text: string): Promise<void> {
    await this.page.locator('[data-testid="cvv"]').fill(text);
  }

  async clickButton_place_order(): Promise<void> {
    await this.page.locator('[data-testid="place-order"]').click();
  }

  async clickButton_back_to_cart(): Promise<void> {
    await this.page.locator('button=Back to Cart').click();
  }
}