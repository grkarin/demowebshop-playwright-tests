import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { logger } from '../utils/logger';
import { TEST_EMAIL, TEST_PASSWORD, hasCredentials } from '../utils/credentials';

/**
 * Login tests against the Demo Web Shop.
 *
 * The public Demo Web Shop has no built-in credentials, so the positive
 * "valid login" case reads them from the TEST_EMAIL / TEST_PASSWORD env
 * vars and is skipped when they are not provided. The negative case needs
 * no credentials and always runs.
 */

const log = logger.child('login.spec');

test.describe('Login', () => {
  test('shows an error for invalid credentials', async ({ page }) => {
    const loginPage = await new LoginPage(page).open();
    await loginPage.assertLoaded();

    await loginPage.login('not-a-user@example.com', 'wrong-password');

    expect(await loginPage.hasValidationError()).toBe(true);
    const errorText = await loginPage.validationErrorText();
    log.info(`Validation error shown: "${errorText}"`);
    expect(errorText.toLowerCase()).toContain('unsuccessful');

    // The user should not be logged in.
    expect(await loginPage.isLoggedIn()).toBe(false);
  });

  test('rejects an empty email with a validation message', async ({ page }) => {
    const loginPage = await new LoginPage(page).open();
    await loginPage.login('', 'some-password');

    // The Demo Web Shop has no inline required-validator on the email field,
    // so an empty email is rejected by the server with the top-level summary.
    expect(await loginPage.hasValidationError()).toBe(true);
    const errorText = await loginPage.validationErrorText();
    log.info(`Validation error shown: "${errorText}"`);
    expect(errorText.length).toBeGreaterThan(0);

    // The user should not be logged in.
    expect(await loginPage.isLoggedIn()).toBe(false);
  });

  test('logs in with valid credentials', async ({ page }) => {
    test.skip(
      !hasCredentials,
      'Set TEST_EMAIL and TEST_PASSWORD to run the valid-login test',
    );

    const home = await new HomePage(page).open();
    const loginPage = await home.goToLogin();
    await loginPage.assertLoaded();

    await loginPage.login(TEST_EMAIL!, TEST_PASSWORD!);

    expect(await loginPage.isLoggedIn()).toBe(true);
  });
});
