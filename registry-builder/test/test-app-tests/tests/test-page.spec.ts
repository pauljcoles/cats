import { test, expect } from '@playwright/test';
import { TestPage } from '../pages/TestPage';

test.describe('Test Page', () => {
  test('should submit form successfully', async ({ page }) => {
    const testPage = new TestPage(page);
    
    await testPage.navigateTo();
    await testPage.login('user@example.com', 'password123');
    
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should add item to cart', async ({ page }) => {
    const testPage = new TestPage(page);
    
    await testPage.navigateTo();
    await testPage.addToCart();
    
    await expect(page.getByText('Added to cart')).toBeVisible();
  });

  test('should handle form validation', async ({ page }) => {
    const testPage = new TestPage(page);
    
    await testPage.navigateTo();
    await testPage.login('', '');
    
    await expect(page.getByText('Email is required')).toBeVisible();
  });
});
