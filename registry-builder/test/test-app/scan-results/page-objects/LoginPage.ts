import { Page } from '@playwright/test';

/**
 * LoginPage - Generated Page Object
 * File: test-app/src/pages/LoginPage.tsx
 * Route: /loginpage
 * Interactive Elements: 8
 */
export class LoginPage {
  constructor(private page: Page) {} {
  
  // Selectors for interactive elements
  selectors = {
  form_login: 'form', // form - fallback (confidence: 3/10)
  input_username: '[data-testid="username-input"]', // input - testid (confidence: 10/10)
  input_password: '[data-testid="password-input"]', // input - testid (confidence: 10/10)
  button_login: '[data-testid="login-btn"]', // button - testid (confidence: 10/10)
  button_forgot_password: 'button=Forgot Password', // button - semantic (confidence: 9/10)
  a_create_account: 'link=Create Account', // a - semantic (confidence: 9/10)
  select_language: '[aria-label="Language"]', // select - attribute (confidence: 8/10)
  input_checkbox: 'input[type="checkbox"]', // input - attribute (confidence: 6/10)
  };

  async navigateTo(): Promise<void> {
    await this.page.goto('/loginpage');
    await this.waitForLoad();
  }

  async fillInput_username(text: string): Promise<void> {
    await this.page.locator('[data-testid="username-input"]').fill(text);
  }

  async fillInput_password(text: string): Promise<void> {
    await this.page.locator('[data-testid="password-input"]').fill(text);
  }

  async clickButton_login(): Promise<void> {
    await this.page.locator('[data-testid="login-btn"]').click();
  }

  async clickButton_forgot_password(): Promise<void> {
    await this.page.locator('button=Forgot Password').click();
  }

  async selectSelect_language(value: string): Promise<void> {
    await this.page.locator('[aria-label="Language"]').selectOption(value);
  }
}