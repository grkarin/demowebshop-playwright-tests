import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { logger } from '../utils/logger';
import { LoginPage } from '../pages/LoginPage';
import { TEST_EMAIL, TEST_PASSWORD, hasCredentials } from '../utils/credentials';

/**
 * End-to-end search → product → add-to-cart flow against the Demo Web Shop.
 */

const log = logger.child('search-add-to-cart.spec');

const SEARCH_TERM = 'book';

test.describe('Search and add to cart', () => {
  test('finds products for a search term', async ({ page }) => {
    const home = await new HomePage(page).open();
    await home.assertLoaded();

    const results = await home.searchFor(SEARCH_TERM);
    await results.assertLoaded();

    const count = await results.resultCount();
    log.info(`Search for "${SEARCH_TERM}" returned ${count} result(s)`);
    expect(count).toBeGreaterThan(0);
    expect(await results.hasNoResults()).toBe(false);
  });

  test('adds a searched product to the cart from its product page', async ({ page }) => {
    const home = await new HomePage(page).open();
    const results = await home.searchFor(SEARCH_TERM);
    await results.assertLoaded();
    expect(await results.resultCount()).toBeGreaterThan(0);

    const product = await results.openProduct(0);
    await product.assertLoaded();
    const productName = await product.name();
    log.info(`Opened product "${productName}"`);

    await product.addToCart(1);
    const notification = await product.notificationText();
    expect(notification.toLowerCase()).toContain('added');

    const cart = await product.goToCart();
    await cart.assertLoaded();

    expect(await cart.isEmpty()).toBe(false);
    expect(await cart.itemCount()).toBeGreaterThan(0);
    expect(await cart.containsProduct(productName)).toBe(true);
  });

  test('adds a product directly from the search results listing', async ({ page }) => {
    const home = await new HomePage(page).open();
    const results = await home.searchFor(SEARCH_TERM);
    await results.assertLoaded();

    const title = await results.titleAt(0);
    await results.addToCart(0);

    const notification = await results.notificationText();
    expect(notification.toLowerCase()).toContain('added');
    expect(await results.headerCartCount()).toBeGreaterThan(0);

    const cart = await results.goToCart();
    await cart.assertLoaded();
    expect(await cart.containsProduct(title)).toBe(true);
  });

  test('checks product added to cart is kept after login', async ({page}) => {
    test.skip(
      !hasCredentials,
      'Set TEST_EMAIL and TEST_PASSWORD to run the cart-persists-after-login test',
    );

    const home = await new HomePage(page).open();
    const results = await home.searchFor(SEARCH_TERM);
    await results.assertLoaded();

    const title = await results.titleAt(0);
    await results.addToCart(0);

    const notification = await results.notificationText();
    expect(notification.toLowerCase()).toContain('added');
    expect(await results.headerCartCount()).toBeGreaterThan(0);

    const loginPage = await new LoginPage(page).open()
    await loginPage.assertLoaded();

    await loginPage.login(TEST_EMAIL!, TEST_PASSWORD!);
    expect(await loginPage.isLoggedIn()).toBe(true);

    expect(await results.headerCartCount()).toBeGreaterThan(0);

    const cart = await results.goToCart();
    await cart.assertLoaded();
    expect(await cart.containsProduct(title)).toBe(true);
  })
});
