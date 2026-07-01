import { Page, Locator, expect } from '@playwright/test';
import { Logger, logger } from '../utils/logger';

/**
 * BasePage holds behaviour shared by every page object:
 *  - a reference to the Playwright `page`
 *  - a scoped logger
 *  - the global site header (search box, login/cart links) which is present
 *    on every page of the Demo Web Shop
 *  - small navigation/waiting helpers
 *
 * Concrete page objects extend this class and add page-specific locators
 * and actions.
 */
export abstract class BasePage {
  protected readonly page: Page;
  protected readonly log: Logger;

  // --- Shared header locators (present on every page) ---
  protected readonly searchInput: Locator;
  protected readonly searchButton: Locator;
  protected readonly loginLink: Locator;
  protected readonly logoutLink: Locator;
  protected readonly registerLink: Locator;
  protected readonly accountLink: Locator;
  protected readonly cartLink: Locator;
  protected readonly cartQuantity: Locator;
  protected readonly notificationBar: Locator;

  protected constructor(page: Page, scope: string) {
    this.page = page;
    this.log = logger.child(scope);

    // The search box markup is duplicated across responsive layouts (the id
    // is reused), so scope to the header search-box container to match exactly
    // one element and avoid a strict-mode violation.
    this.searchInput = page.locator('.search-box #small-searchterms');
    this.searchButton = page.locator('.search-box input.search-box-button');
    this.loginLink = page.locator('.header-links a.ico-login');
    this.logoutLink = page.locator('.header-links a.ico-logout');
    this.registerLink = page.locator('.header-links a.ico-register');
    this.accountLink = page.locator('.header-links a.account');
    this.cartLink = page.locator('#topcartlink a.ico-cart');
    this.cartQuantity = page.locator('#topcartlink .cart-qty');
    this.notificationBar = page.locator('#bar-notification');
  }

  /**
   * Navigate to a path relative to the base URL (defaults to home).
   * Relative paths are resolved against `baseURL` from playwright.config.ts;
   * absolute URLs are passed through unchanged.
   */
  async goto(path = '/'): Promise<void> {
    this.log.info(`Navigating to ${path}`);
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  /** Current page title. */
  async title(): Promise<string> {
    return this.page.title();
  }

  /**
   * Type a term into the header search box and submit. Returns nothing;
   * callers typically construct a SearchResultsPage afterwards.
   */
  async search(term: string): Promise<void> {
    this.log.info(`Searching for "${term}"`);
    await this.searchInput.fill(term);
    await this.searchButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Open the login page via the header link. */
  async openLogin(): Promise<void> {
    this.log.info('Opening login page from header');
    await this.loginLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Open the shopping cart via the header link. */
  async openCart(): Promise<void> {
    this.log.info('Opening cart from header');
    await this.cartLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Whether a user is currently logged in (logout link is visible). */
  async isLoggedIn(): Promise<boolean> {
    return this.logoutLink.isVisible();
  }

  /** Number of items shown in the header cart counter, e.g. "(2)" -> 2. */
  async headerCartCount(): Promise<number> {
    const raw = (await this.cartQuantity.textContent())?.trim() ?? '(0)';
    const match = raw.match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  /** Text of the green/red notification bar shown after cart actions. */
  async notificationText(): Promise<string> {
    await expect(this.notificationBar).toBeVisible();
    return (await this.notificationBar.locator('.content').textContent())?.trim() ?? '';
  }
}