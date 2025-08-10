import { Page, Locator } from '@playwright/test';

/**
 * CheckoutPage - Existing Page Object
 * Manually created page object for checkout page
 */
export class CheckoutPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly stateSelect: Locator;
  readonly zipCodeInput: Locator;
  readonly cardNumberInput: Locator;
  readonly expiryInput: Locator;
  readonly cvvInput: Locator;
  readonly placeOrderButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.getByTestId('first-name');
    this.lastNameInput = page.getByTestId('last-name');
    this.addressInput = page.getByTestId('address');
    this.cityInput = page.getByTestId('city');
    this.stateSelect = page.getByTestId('state-select');
    this.zipCodeInput = page.getByTestId('zip-code');
    this.cardNumberInput = page.getByTestId('card-number');
    this.expiryInput = page.getByTestId('expiry');
    this.cvvInput = page.getByTestId('cvv');
    this.placeOrderButton = page.getByTestId('place-order');
  }

  async navigateTo(): Promise<void> {
    await this.page.goto('/checkout');
  }

  async fillShippingInfo(info: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  }): Promise<void> {
    await this.firstNameInput.fill(info.firstName);
    await this.lastNameInput.fill(info.lastName);
    await this.addressInput.fill(info.address);
    await this.cityInput.fill(info.city);
    await this.stateSelect.selectOption(info.state);
    await this.zipCodeInput.fill(info.zipCode);
  }

  async fillPaymentInfo(cardNumber: string, expiry: string, cvv: string): Promise<void> {
    await this.cardNumberInput.fill(cardNumber);
    await this.expiryInput.fill(expiry);
    await this.cvvInput.fill(cvv);
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
  }
}
