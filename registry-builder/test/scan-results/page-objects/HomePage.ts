import { Page } from '@playwright/test';

/**
 * HomePage - Generated Page Object
 * File: test/test-app/src/pages/HomePage.tsx
 * Route: /homepage
 * Interactive Elements: 9
 */
export class HomePage {
  constructor(private page: Page) {} {
  
  // Selectors for interactive elements
  selectors = {
  button_menu: 'button=Menu', // button - semantic (confidence: 10/10)
  input_search: 'input[placeholder="Search..."]', // input - attribute (confidence: 9/10)
  button_search: 'button=Search', // button - semantic (confidence: 10/10)
  button_get_started: 'button=Get Started', // button - semantic (confidence: 10/10)
  button_learn_more: 'button=Learn More', // button - semantic (confidence: 10/10)
  a_view_products: 'link=View Products', // a - semantic (confidence: 10/10)
  a_about_us: 'link=About Us', // a - semantic (confidence: 10/10)
  select_country: '[aria-label="Country"]', // select - attribute (confidence: 9/10)
  button_subscribe: 'button=Subscribe', // button - semantic (confidence: 10/10)
  };

  async navigateTo(): Promise<void> {
    await this.page.goto('/homepage');
    await this.waitForLoad();
  }

  async clickButton_menu(): Promise<void> {
    await this.page.locator('button=Menu').click();
  }

  async fillInput_search(text: string): Promise<void> {
    await this.page.locator('input[placeholder="Search..."]').fill(text);
  }

  async clickButton_search(): Promise<void> {
    await this.page.locator('button=Search').click();
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