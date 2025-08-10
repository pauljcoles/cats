import { Page, Locator } from '@playwright/test';

/**
 * TestPage - Existing Page Object
 * Manually created page object for comparison
 */
export class TestPage {
  readonly page: Page;
  readonly submitButton: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
  }

  async navigateTo(): Promise<void> {
    await this.page.goto('/testpage');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }
}
