import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Shopping cart page (/cart) of the Demo Web Shop.
 */
export class CartPage extends BasePage {
  private readonly rows: Locator;
  private readonly emptyMessage: Locator;
  private readonly orderTotal: Locator;
  private readonly updateCartButton: Locator;
  private readonly termsCheckbox: Locator;

  constructor(page: Page) {
    super(page, 'CartPage');
    this.rows = page.locator('.cart-item-row');
    this.emptyMessage = page.locator('.order-summary-content .no-data, .order-summary-content');
    this.orderTotal = page.locator('.cart-total .product-price, .order-total .product-price');
    this.updateCartButton = page.locator('input[name="updatecart"]');
    this.termsCheckbox = page.locator('#termsofservice');
  }

  /** Open the cart page directly. */
  async open(): Promise<this> {
    await this.goto('/cart');
    return this;
  }

  /** Assert the cart page has loaded. */
  async assertLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/cart/);
  }

  /** Number of distinct line items in the cart. */
  async itemCount(): Promise<number> {
    return this.rows.count();
  }

  /** Whether the cart is empty. */
  async isEmpty(): Promise<boolean> {
    if ((await this.rows.count()) > 0) return false;
    const text = (await this.emptyMessage.first().textContent())?.toLowerCase() ?? '';
    return text.includes('empty');
  }

  /** Product names of all line items, in order. */
  async productNames(): Promise<string[]> {
    const names = await this.rows.locator('.product-name').allTextContents();
    return names.map((n) => n.trim());
  }

  /** Whether a line item with the given (case-insensitive) name is present. */
  async containsProduct(name: string): Promise<boolean> {
    const names = (await this.productNames()).map((n) => n.toLowerCase());
    return names.includes(name.toLowerCase());
  }

  /** Quantity entered for the line item at `index`. */
  async quantityAt(index = 0): Promise<number> {
    const value = await this.rows.nth(index).locator('.qty-input').inputValue();
    return Number(value);
  }

  /** The displayed order total text. */
  async total(): Promise<string> {
    return (await this.orderTotal.first().textContent())?.trim() ?? '';
  }

  /** Update the quantity of the line item at `index` and refresh the cart. */
  async updateQuantity(index: number, quantity: number): Promise<void> {
    this.log.info(`Updating quantity of item #${index} to ${quantity}`);
    await this.rows.nth(index).locator('.qty-input').fill(String(quantity));
    await this.updateCartButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Remove the line item at `index` and refresh the cart. */
  async removeItem(index = 0): Promise<void> {
    this.log.info(`Removing item #${index} from cart`);
    await this.rows.nth(index).locator('input[name="removefromcart"]').check();
    await this.updateCartButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
