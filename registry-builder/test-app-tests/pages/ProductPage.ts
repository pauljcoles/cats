import { Page, Locator } from '@playwright/test';

/**
 * ProductPage - Existing Page Object
 * Manually created page object for product page
 */
export class ProductPage {
  readonly page: Page;
  readonly addToCartButton: Locator;
  readonly buyNowButton: Locator;
  readonly sizeSelect: Locator;
  readonly colorSelect: Locator;
  readonly quantityInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.buyNowButton = page.getByTestId('buy-now');
    this.sizeSelect = page.getByTestId('size-select');
    this.colorSelect = page.getByTestId('color-select');
    this.quantityInput = page.getByTestId('quantity-input');
  }

  async navigateTo(productId: string): Promise<void> {
    await this.page.goto(`/product/${productId}`);
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async selectSize(size: string): Promise<void> {
    await this.sizeSelect.selectOption(size);
  }

  async selectColor(color: string): Promise<void> {
    await this.colorSelect.selectOption(color);
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.quantityInput.fill(quantity.toString());
  }
}
