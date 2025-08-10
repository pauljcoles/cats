import { Page } from '@playwright/test';

/**
 * LoginPage - Generated Page Object
 * File: test/test-app/src/pages/LoginPage.tsx
 * Route: /loginpage
 * Interactive Elements: 8
 */
export class LoginPage {
  constructor(private page: Page) {} {
  
  // Selectors for interactive elements
  selectors = {
  form_login: 'form', // form - fallback (confidence: 3/10)
  input_username: 'input[placeholder="Username"]', // input - attribute (confidence: 9/10)
  input_password: 'input[placeholder="Password"]', // input - attribute (confidence: 9/10)
  button_login: 'button=Login', // button - semantic (confidence: 10/10)
  button_forgot_password: 'button=Forgot Password', // button - semantic (confidence: 10/10)
  a_create_account: 'link=Create Account', // a - semantic (confidence: 10/10)
  select_language: '[aria-label="Language"]', // select - attribute (confidence: 9/10)
  input_checkbox: 'input[type="checkbox"]', // input - attribute (confidence: 7/10)
  };

  async navigateTo(): Promise<void> {
    await this.page.goto('/loginpage');
    await this.waitForLoad();
  }

  async fillInput_username(text: string): Promise<void> {
    await this.page.locator('input[placeholder="Username"]').fill(text);
  }

  async fillInput_password(text: string): Promise<void> {
    await this.page.locator('input[placeholder="Password"]').fill(text);
  }

  async clickButton_login(): Promise<void> {
    await this.page.locator('button=Login').click();
  }

  async clickButton_forgot_password(): Promise<void> {
    await this.page.locator('button=Forgot Password').click();
  }

  async selectSelect_language(value: string): Promise<void> {
    await this.page.locator('[aria-label="Language"]').selectOption(value);
  }
}