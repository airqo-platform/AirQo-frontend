import { WebDriver, By } from "selenium-webdriver";
import { BasePage } from "./base.page";

export class ForgotPasswordPage extends BasePage {
  protected static readonly EMAIL_INPUT = By.css('input[type="email"]');
  protected static readonly SUBMIT_BUTTON = By.css('button[type="submit"]');
  protected static readonly SUCCESS_BANNER = By.xpath("//div[contains(@class, 'green') or contains(@class, 'success')]");
  protected static readonly ERROR_MESSAGE = By.css(".text-destructive");
  protected static readonly TRY_AGAIN_BUTTON = By.xpath("//button[contains(text(), 'Try Again')]");
  protected static readonly LOGIN_LINK = By.linkText("Login");
  protected static readonly BACK_LINK = By.linkText("Back to Login");

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToForgotPassword(): Promise<void> {
    await this.navigateTo("/user/forgotPwd");
  }

  async enterEmail(email: string): Promise<void> {
    await this.typeText(ForgotPasswordPage.EMAIL_INPUT, email);
  }

  async clickSubmit(): Promise<void> {
    await this.click(ForgotPasswordPage.SUBMIT_BUTTON);
  }

  async submitEmail(email: string): Promise<void> {
    await this.enterEmail(email);
    await this.clickSubmit();
  }

  async isSuccessDisplayed(): Promise<boolean> {
    return this.isDisplayed(ForgotPasswordPage.SUCCESS_BANNER, 5);
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(ForgotPasswordPage.ERROR_MESSAGE);
  }

  async hasError(): Promise<boolean> {
    return this.isDisplayed(ForgotPasswordPage.ERROR_MESSAGE, 3);
  }

  async clickTryAgain(): Promise<void> {
    await this.click(ForgotPasswordPage.TRY_AGAIN_BUTTON);
  }

  async clickLogin(): Promise<void> {
    await this.click(ForgotPasswordPage.LOGIN_LINK);
  }

  async clickBackToLogin(): Promise<void> {
    await this.click(ForgotPasswordPage.BACK_LINK);
  }
}
