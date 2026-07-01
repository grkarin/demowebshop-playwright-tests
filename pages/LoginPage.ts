import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Login page (/login) of the Demo Web Shop.
 */
export class LoginPage extends BasePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly rememberMeCheckbox: Locator;
  private readonly submitButton: Locator;
  private readonly validationSummary: Locator;

  constructor(page: Page) {
    super(page, 'LoginPage');
    this.emailInput = page.locator('#Email');
    this.passwordInput = page.locator('#Password');
    this.rememberMeCheckbox = page.locator('#RememberMe');
    this.submitButton = page.locator('.login-button');
    this.validationSummary = page.locator('.validation-summary-errors');
  }

  /** Open the login page directly. */
  async open(): Promise<this> {
    await this.goto('/login');
    return this;
  }

  /** Assert the login form is visible. */
  async assertLoaded(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  /** Fill the form and submit. Does not assert on the outcome. */
  async login(email: string, password: string, rememberMe = false): Promise<void> {
    this.log.info(`Submitting login for "${email}"`);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }
    await this.submitButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Whether the top-level validation summary (e.g. "Login was unsuccessful")
   * is currently displayed.
   */
  async hasValidationError(): Promise<boolean> {
    return this.validationSummary.isVisible();
  }

  /** Text of the validation summary, trimmed. */
  async validationErrorText(): Promise<string> {
    await expect(this.validationSummary).toBeVisible();
    return (await this.validationSummary.textContent())?.trim() ?? '';
  }

}
