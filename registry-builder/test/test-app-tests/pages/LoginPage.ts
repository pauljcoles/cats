import { Page, Locator } from '@playwright/test';

/**
 * LoginPage - Existing Page Object
 * Another manually created page object
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameField: Locator;
  readonly passwordField: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameField = page.getByTestId('username-input');
    this.passwordField = page.getByTestId('password-input');
    this.loginButton = page.getByTestId('login-btn');
  }

  async navigateTo(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.loginButton.click();
  }
}
