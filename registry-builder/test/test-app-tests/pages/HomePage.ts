import { Page, Locator } from '@playwright/test';

/**
 * HomePage - Existing Page Object
 * Manually created page object for home page
 */
export class HomePage {
  readonly page: Page;
  readonly menuButton: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly getStartedButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.menuButton = page.getByTestId('menu-btn');
    this.searchInput = page.getByTestId('search-input');
    this.searchButton = page.getByTestId('search-btn');
    this.getStartedButton = page.getByRole('button', { name: 'Get Started' });
  }

  async navigateTo(): Promise<void> {
    await this.page.goto('/');
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }

  async openMenu(): Promise<void> {
    await this.menuButton.click();
  }
}
