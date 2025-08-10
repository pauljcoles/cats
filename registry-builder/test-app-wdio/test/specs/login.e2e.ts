import { LoginPage } from '../pageobjects/LoginPage';

describe('Login Page Tests', () => {
  let loginPage: LoginPage;

  beforeEach(async () => {
    loginPage = new LoginPage();
    await loginPage.open();
  });

  it('should login with valid credentials', async () => {
    await loginPage.login('testuser', 'password123');
    
    // Wait for successful login redirect
    await browser.waitUntil(
      async () => {
        const url = await browser.getUrl();
        return url.includes('/dashboard') || url.includes('/home');
      },
      {
        timeout: 10000,
        timeoutMsg: 'Login redirect did not occur'
      }
    );
    
    expect(await browser.getUrl()).not.toContain('/login');
  });

  it('should show error for invalid credentials', async () => {
    await loginPage.login('invalid', 'wrongpassword');
    
    const errorMessage = await loginPage.waitForError();
    expect(errorMessage).toContain('Invalid credentials');
  });

  it('should remember login when checkbox is checked', async () => {
    await loginPage.login('testuser', 'password123', true);
    
    // Verify remember me was checked
    const isChecked = await loginPage.rememberMeCheckbox.isSelected();
    expect(isChecked).toBe(true);
  });

  it('should navigate to forgot password page', async () => {
    await loginPage.clickForgotPassword();
    
    await browser.waitUntil(
      async () => {
        const url = await browser.getUrl();
        return url.includes('/forgot-password');
      },
      {
        timeout: 5000,
        timeoutMsg: 'Forgot password page did not load'
      }
    );
    
    expect(await browser.getUrl()).toContain('/forgot-password');
  });

  it('should validate required fields', async () => {
    // Try to login with empty fields
    await loginPage.loginButton.click();
    
    // Check for HTML5 validation or custom validation
    const usernameValidation = await browser.execute(() => {
      const field = document.querySelector('[name="username"]') as HTMLInputElement;
      return field?.validationMessage || field?.getAttribute('aria-invalid');
    });
    
    expect(usernameValidation).toBeTruthy();
  });
});
