import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { SearchResultsPage } from './SearchResultsPage';
import { LoginPage } from './LoginPage';

/**
 * Landing page of the Demo Web Shop. Mostly a jumping-off point: it can
 * navigate to itself, run a header search, and open the login page.
 */
export class HomePage extends BasePage {
  private readonly logoLink: Locator;
  private readonly featuredProducts: Locator;

  constructor(page: Page) {
    super(page, 'HomePage');
    this.logoLink = page.locator('.header-logo a');
    this.featuredProducts = page.locator('.product-grid .product-item');
  }

  /** Open the home page. */
  async open(): Promise<this> {
    await this.goto('/');
    return this;
  }

  /** Assert that the home page has loaded. */
  async assertLoaded(): Promise<void> {
    await expect(this.logoLink).toBeVisible();
    await expect(this.searchInput).toBeVisible();
  }

  /** Number of featured products rendered on the landing page. */
  async featuredProductCount(): Promise<number> {
    return this.featuredProducts.count();
  }

  /** Run a header search and return the results page object. */
  async searchFor(term: string): Promise<SearchResultsPage> {
    await this.search(term);
    return new SearchResultsPage(this.page);
  }

  /** Navigate to the login page and return its page object. */
  async goToLogin(): Promise<LoginPage> {
    await this.openLogin();
    return new LoginPage(this.page);
  }
}