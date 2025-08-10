import { Page } from '@playwright/test';

/**
 * HomePage - Generated Page Object
 * File: test-app/src/pages/HomePage.tsx
 * Route: /homepage
 * Interactive Elements: 9
 */
export class HomePage {
  constructor(private page: Page) {} {
  
  // Selectors for interactive elements
  selectors = {
  button_menu: '[data-testid="menu-btn"]', // button - testid (confidence: 10/10)
  input_search: '[data-testid="search-input"]', // input - testid (confidence: 10/10)
  button_search: '[data-testid="search-btn"]', // button - testid (confidence: 10/10)
  button_get_started: 'button=Get Started', // button - semantic (confidence: 9/10)
  button_learn_more: 'button=Learn More', // button - semantic (confidence: 9/10)
  a_view_products: 'link=View Products', // a - semantic (confidence: 9/10)
  a_about_us: 'link=About Us', // a - semantic (confidence: 9/10)
  select_country: '[aria-label="Country"]', // select - attribute (confidence: 8/10)
  button_subscribe: 'button=Subscribe', // button - semantic (confidence: 9/10)
  };

  async navigateTo(): Promise<void> {
    await this.page.goto('/homepage');
    await this.waitForLoad();
  }

  async clickButton_menu(): Promise<void> {
    await this.page.locator('[data-testid="menu-btn"]').click();
  }

  async fillInput_search(text: string): Promise<void> {
    await this.page.locator('[data-testid="search-input"]').fill(text);
  }

  async clickButton_search(): Promise<void> {
    await this.page.locator('[data-testid="search-btn"]').click();
  }

  async clickButton_get_started(): Promise<void> {
    await this.page.locator('button=Get Started').click();
  }

  async clickButton_learn_more(): Promise<void> {
    await this.page.locator('button=Learn More').click();
  }

  async selectSelect_country(value: string): Promise<void> {
    await this.page.locator('[aria-label="Country"]').selectOption(value);
  }

  async clickButton_subscribe(): Promise<void> {
    await this.page.locator('button=Subscribe').click();
  }
}