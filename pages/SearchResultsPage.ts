import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ProductPage } from './ProductPage';
import { CartPage } from './CartPage';

/**
 * Search results page (/search) of the Demo Web Shop. Lists matching
 * products; each item can be opened to its product page or added to the
 * cart directly from the listing.
 */
export class SearchResultsPage extends BasePage {
  private readonly results: Locator;
  private readonly noResultMessage: Locator;

  constructor(page: Page) {
    super(page, 'SearchResultsPage');
    this.results = page.locator('.search-results .product-item');
    this.noResultMessage = page.locator('.no-result');
  }

  /** Assert that the results listing (or a no-result message) has rendered. */
  async assertLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/search/);
  }

  /** Number of products returned by the search. */
  async resultCount(): Promise<number> {
    return this.results.count();
  }

  /** Whether the "no products were found" message is shown. */
  async hasNoResults(): Promise<boolean> {
    return this.noResultMessage.isVisible();
  }

  /** Visible product titles, in listing order. */
  async productTitles(): Promise<string[]> {
    const titles = await this.results.locator('.product-title a').allTextContents();
    return titles.map((t) => t.trim());
  }

  private nthResult(index: number): Locator {
    return this.results.nth(index);
  }

  /** Title text of the result at `index`. */
  async titleAt(index = 0): Promise<string> {
    return (await this.nthResult(index).locator('.product-title a').textContent())?.trim() ?? '';
  }

  /** Open the product at `index` and return its page object. */
  async openProduct(index = 0): Promise<ProductPage> {
    const title = await this.titleAt(index);
    this.log.info(`Opening product "${title}" (result #${index})`);
    await this.nthResult(index).locator('.product-title a').click();
    await this.page.waitForLoadState('domcontentloaded');
    return new ProductPage(this.page);
  }

  /**
   * Add the product at `index` to the cart directly from the listing
   * (without visiting the product page).
   */
  async addToCart(index = 0): Promise<void> {
    const title = await this.titleAt(index);
    this.log.info(`Adding "${title}" to cart from search results`);
    await this.nthResult(index).locator('input.product-box-add-to-cart-button').click();
    await expect(this.notificationBar).toBeVisible();
  }

  /** Navigate to the cart via the header link and return its page object. */
  async goToCart(): Promise<CartPage> {
    await this.openCart();
    return new CartPage(this.page);
  }
}
