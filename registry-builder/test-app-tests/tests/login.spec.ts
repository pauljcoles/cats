import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login Flow', () => {
  test('should login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.navigateTo();
    await loginPage.login('testuser', 'password123');
    
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.navigateTo();
    await loginPage.login('invalid', 'wrong');
    
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});
