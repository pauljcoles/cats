import { Page } from '@playwright/test';

/**
 * TestPage - Generated Page Object
 * File: test/test-app/src/pages/TestPage.tsx
 * Route: /testpage
 * Interactive Elements: 17
 */
export class TestPage {
  constructor(private page: Page) {} {
  
  // Selectors for interactive elements
  selectors = {
  button_submit_form: 'button=Submit Form', // button - semantic (confidence: 10/10)
  input_enter_email: 'input[placeholder="Enter email"]', // input - attribute (confidence: 9/10)
  button_add_to_cart: 'button=Add to Cart', // button - semantic (confidence: 10/10)
  button_buy_now: 'button=Buy Now', // button - semantic (confidence: 10/10)
  a_view_products: 'link=View Products', // a - semantic (confidence: 10/10)
  input_search_products: 'input[placeholder="Search products..."]', // input - attribute (confidence: 9/10)
  input_enter_password: 'input[placeholder="Enter password"]', // input - attribute (confidence: 9/10)
  button_: 'button=×', // button - semantic (confidence: 10/10)
  select_select_country: '[aria-label="Select country"]', // select - attribute (confidence: 9/10)
  input_username: 'input[name="username"]', // input - attribute (confidence: 8/10)
  select_test: 'select', // select - fallback (confidence: 3/10)
  button_save: 'button=Save', // button - semantic (confidence: 10/10)
  input_text: 'input[type="text"]', // input - attribute (confidence: 7/10)
  button_generic_button_1: 'button=Generic Button 1', // button - semantic (confidence: 10/10)
  button_generic_button_2: 'button=Generic Button 2', // button - semantic (confidence: 10/10)
  input_text: 'input[type="text"]', // input - attribute (confidence: 7/10)
  select_test: 'select', // select - fallback (confidence: 3/10)
  };

  async navigateTo(): Promise<void> {
    await this.page.goto('/testpage');
    await this.waitForLoad();
  }

  async clickButton_submit_form(): Promise<void> {
    await this.page.locator('button=Submit Form').click();
  }

  async fillInput_enter_email(text: string): Promise<void> {
    await this.page.locator('input[placeholder="Enter email"]').fill(text);
  }

  async clickButton_add_to_cart(): Promise<void> {
    await this.page.locator('button=Add to Cart').click();
  }

  async clickButton_buy_now(): Promise<void> {
    await this.page.locator('button=Buy Now').click();
  }

  async fillInput_search_products(text: string): Promise<void> {
    await this.page.locator('input[placeholder="Search products..."]').fill(text);
  }

  async fillInput_enter_password(text: string): Promise<void> {
    await this.page.locator('input[placeholder="Enter password"]').fill(text);
  }

  async clickButton_(): Promise<void> {
    await this.page.locator('button=×').click();
  }

  async selectSelect_select_country(value: string): Promise<void> {
    await this.page.locator('[aria-label="Select country"]').selectOption(value);
  }

  async fillInput_username(text: string): Promise<void> {
    await this.page.locator('input[name="username"]').fill(text);
  }

  async clickButton_save(): Promise<void> {
    await this.page.locator('button=Save').click();
  }

  async clickButton_generic_button_1(): Promise<void> {
    await this.page.locator('button=Generic Button 1').click();
  }

  async clickButton_generic_button_2(): Promise<void> {
    await this.page.locator('button=Generic Button 2').click();
  }
}