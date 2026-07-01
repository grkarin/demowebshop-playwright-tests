import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartPage } from './CartPage';

/**
 * Product detail page of the Demo Web Shop. Some products have configurable
 * options; this page object covers the common case (name, price, quantity
 * and the add-to-cart action).
 */
export class ProductPage extends BasePage {
  private readonly productName: Locator;
  private readonly productPrice: Locator;
  private readonly quantityInput: Locator;
  private readonly addToCartButton: Locator;

  constructor(page: Page) {
    super(page, 'ProductPage');
    this.productName = page.locator('.product-name h1');
    this.productPrice = page.locator('.product-essential .price-value-1, .product-essential .product-price span');
    // ids are dynamic (e.g. #add-to-cart-button-31), so match by prefix/class.
    this.quantityInput = page.locator('input.qty-input');
    this.addToCartButton = page.locator('input.add-to-cart-button');
  }

  /** Assert the product detail view has loaded. */
  async assertLoaded(): Promise<void> {
    await expect(this.productName).toBeVisible();
    await expect(this.addToCartButton).toBeVisible();
  }

  /** The product name as shown in the page heading. */
  async name(): Promise<string> {
    return (await this.productName.textContent())?.trim() ?? '';
  }

  /** The displayed product price text (e.g. "1500.00"). */
  async price(): Promise<string> {
    return (await this.productPrice.first().textContent())?.trim() ?? '';
  }

  /** Set the quantity field, if present. */
  async setQuantity(quantity: number): Promise<void> {
    if (await this.quantityInput.count()) {
      await this.quantityInput.fill(String(quantity));
    }
  }

  /**
   * Add the product to the cart and wait for the success notification.
   * Optionally set a quantity first.
   */
  async addToCart(quantity?: number): Promise<void> {
    if (quantity != null) {
      await this.setQuantity(quantity);
    }
    this.log.info('Adding product to cart');
    await this.addToCartButton.click();
    await expect(this.notificationBar).toBeVisible();
  }

  /** Navigate to the cart and return its page object. */
  async goToCart(): Promise<CartPage> {
    await this.openCart();
    return new CartPage(this.page);
  }
}
