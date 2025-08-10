import { Page } from '@playwright/test';

/**
 * CheckoutPage - Generated Page Object
 * File: test/test-app/src/pages/CheckoutPage.tsx
 * Route: /checkoutpage
 * Interactive Elements: 14
 */
export class CheckoutPage {
  constructor(private page: Page) {} {
  
  // Selectors for interactive elements
  selectors = {
  form_checkout: '[data-testid="shipping-form"]', // form - testid (confidence: 10/10)
  input_first_name: 'input[placeholder="First Name"]', // input - attribute (confidence: 9/10)
  input_last_name: 'input[placeholder="Last Name"]', // input - attribute (confidence: 9/10)
  input_address: 'input[placeholder="Address"]', // input - attribute (confidence: 9/10)
  input_city: 'input[placeholder="City"]', // input - attribute (confidence: 9/10)
  select_state: '[aria-label="State"]', // select - attribute (confidence: 9/10)
  input_zip_code: 'input[placeholder="ZIP Code"]', // input - attribute (confidence: 9/10)
  form_checkout: '[data-testid="payment-form"]', // form - testid (confidence: 10/10)
  input_card_number: 'input[placeholder="Card Number"]', // input - attribute (confidence: 9/10)
  input_mmyy: 'input[placeholder="MM/YY"]', // input - attribute (confidence: 9/10)
  input_cvv: 'input[placeholder="CVV"]', // input - attribute (confidence: 9/10)
  button_place_order: 'button=Place Order', // button - semantic (confidence: 10/10)
  button_back_to_cart: 'button=Back to Cart', // button - semantic (confidence: 10/10)
  a_edit_cart: 'link=Edit Cart', // a - semantic (confidence: 10/10)
  };

  async navigateTo(): Promise<void> {
    await this.page.goto('/checkoutpage');
    await this.waitForLoad();
  }

  async fillInput_first_name(text: string): Promise<void> {
    await this.page.locator('input[placeholder="First Name"]').fill(text);
  }

  async fillInput_last_name(text: string): Promise<void> {
    await this.page.locator('input[placeholder="Last Name"]').fill(text);
  }

  async fillInput_address(text: string): Promise<void> {
    await this.page.locator('input[placeholder="Address"]').fill(text);
  }

  async fillInput_city(text: string): Promise<void> {
    await this.page.locator('input[placeholder="City"]').fill(text);
  }

  async selectSelect_state(value: string): Promise<void> {
    await this.page.locator('[aria-label="State"]').selectOption(value);
  }

  async fillInput_zip_code(text: string): Promise<void> {
    await this.page.locator('input[placeholder="ZIP Code"]').fill(text);
  }

  async fillInput_card_number(text: string): Promise<void> {
    await this.page.locator('input[placeholder="Card Number"]').fill(text);
  }

  async fillInput_mmyy(text: string): Promise<void> {
    await this.page.locator('input[placeholder="MM/YY"]').fill(text);
  }

  async fillInput_cvv(text: string): Promise<void> {
    await this.page.locator('input[placeholder="CVV"]').fill(text);
  }

  async clickButton_place_order(): Promise<void> {
    await this.page.locator('button=Place Order').click();
  }

  async clickButton_back_to_cart(): Promise<void> {
    await this.page.locator('button=Back to Cart').click();
  }
}