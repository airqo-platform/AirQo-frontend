import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class ResetPasswordPage extends BasePage {
  protected static readonly PASSWORD_INPUT = By.css(
    'input[placeholder*="password"]'
  );
  protected static readonly CONFIRM_PASSWORD_INPUT = By.css(
    'input[placeholder*="Confirm"]'
  );
  protected static readonly SUBMIT_BUTTON = By.css('button[type="submit"]');
  protected static readonly INVALID_LINK_STATE = By.xpath(
    "//*[contains(text(), 'Invalid Reset Link') or contains(text(), 'invalid') or contains(text(), 'expired')]"
  );
  protected static readonly SUCCESS_STATE = By.xpath(
    "//h2[contains(text(), 'Password Reset') or contains(text(), 'Success')]"
  );
  protected static readonly COUNTDOWN_TEXT = By.xpath(
    "//p[contains(text(), 'seconds')]"
  );
  protected static readonly LOGIN_LINK = By.linkText('click here to login');
  protected static readonly ERROR_MESSAGE = By.css('.text-destructive');
  protected static readonly PASSWORD_TOGGLE = By.css(
    'button[aria-label="Show password"]'
  );

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToResetPassword(token?: string): Promise<void> {
    const url = token
      ? `/user/forgotPwd/reset?token=${token}`
      : '/user/forgotPwd/reset';
    await this.navigateTo(url);
  }

  async isInvalidLinkState(): Promise<boolean> {
    return this.isDisplayed(ResetPasswordPage.INVALID_LINK_STATE, 5);
  }

  async isSuccessState(): Promise<boolean> {
    return this.isDisplayed(ResetPasswordPage.SUCCESS_STATE, 5);
  }

  async enterPassword(password: string): Promise<void> {
    await this.typeText(ResetPasswordPage.PASSWORD_INPUT, password);
  }

  async enterConfirmPassword(password: string): Promise<void> {
    await this.typeText(ResetPasswordPage.CONFIRM_PASSWORD_INPUT, password);
  }

  async resetPassword(password: string): Promise<void> {
    await this.enterPassword(password);
    await this.enterConfirmPassword(password);
    await this.click(ResetPasswordPage.SUBMIT_BUTTON);
  }

  async hasError(): Promise<boolean> {
    return this.isDisplayed(ResetPasswordPage.ERROR_MESSAGE, 3);
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(ResetPasswordPage.ERROR_MESSAGE);
  }

  async hasCountdown(): Promise<boolean> {
    return this.isDisplayed(ResetPasswordPage.COUNTDOWN_TEXT, 3);
  }

  async clickLoginLink(): Promise<void> {
    await this.click(ResetPasswordPage.LOGIN_LINK);
  }
}
