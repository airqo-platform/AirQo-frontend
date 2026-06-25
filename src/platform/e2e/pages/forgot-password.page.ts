import { WebDriver, By } from "selenium-webdriver";
import { BasePage } from "./base.page";

export class ForgotPasswordPage extends BasePage {
  protected static readonly EMAIL_INPUT = By.css('input[type="email"]');
  protected static readonly SUBMIT_BUTTON = By.css('button[type="submit"]');
  protected static readonly SUCCESS_TEXT = By.xpath("//p[contains(text(), 'Password reset email sent successfully')]");
  protected static readonly TRY_AGAIN_BUTTON = By.xpath("//button[contains(text(), 'Try Again')]");
  protected static readonly LOGIN_LINK = By.xpath("//a[contains(text(), 'Login')]");
  protected static readonly ERROR_MESSAGE = By.css(".text-destructive");

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
    return this.isDisplayed(ForgotPasswordPage.SUCCESS_TEXT, 5);
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
}
