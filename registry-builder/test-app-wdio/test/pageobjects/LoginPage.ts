/**
 * LoginPage - WebdriverIO Page Object
 * WDIO page object for login functionality
 */
export class LoginPage {
  /**
   * Get username input field
   */
  get usernameField() {
    return $('[name="username"]');
  }

  /**
   * Get password input field
   */
  get passwordField() {
    return $('[name="password"]');
  }

  /**
   * Get login button
   */
  get loginButton() {
    return $('button*=Login');
  }

  /**
   * Get remember me checkbox
   */
  get rememberMeCheckbox() {
    return $('[name="remember"]');
  }

  /**
   * Get forgot password link
   */
  get forgotPasswordLink() {
    return $('a*=Forgot Password');
  }

  /**
   * Navigate to login page
   */
  async open() {
    await browser.url('/login');
    await browser.waitUntil(
      async () => await this.loginButton.isDisplayed(),
      {
        timeout: 5000,
        timeoutMsg: 'Login page did not load'
      }
    );
  }

  /**
   * Perform login
   */
  async login(username: string, password: string, remember = false) {
    await this.usernameField.setValue(username);
    await this.passwordField.setValue(password);
    
    if (remember) {
      await this.rememberMeCheckbox.click();
    }
    
    await this.loginButton.click();
  }

  /**
   * Click forgot password
   */
  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  /**
   * Wait for login error message
   */
  async waitForError() {
    const errorMessage = $('.error-message');
    await errorMessage.waitForDisplayed({ timeout: 3000 });
    return await errorMessage.getText();
  }
}
