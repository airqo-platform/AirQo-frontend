import { WebDriver, By } from "selenium-webdriver";
import { BasePage } from "./base.page";

export class LoginPage extends BasePage {
  protected static readonly EMAIL_INPUT = By.css('input[type="email"]');
  protected static readonly PASSWORD_INPUT = By.css('input[type="password"]');
  protected static readonly SUBMIT_BUTTON = By.css('button[type="submit"]');
  protected static readonly REGISTER_LINK = By.linkText("Register");
  protected static readonly FORGOT_PASSWORD_LINK = By.linkText("Forgot Password?");
  protected static readonly PASSWORD_TOGGLE = By.css('button[aria-label="Show password"]');
  protected static readonly GOOGLE_AUTH = By.css('button[aria-label="Sign in with Google"]');
  protected static readonly GITHUB_AUTH = By.css('button[aria-label="Sign in with GitHub"]');
  protected static readonly LINKEDIN_AUTH = By.css('button[aria-label="Sign in with LinkedIn"]');
  protected static readonly X_AUTH = By.css('button[aria-label="Sign in with X"]');
  protected static readonly ERROR_MESSAGE = By.css(".text-destructive");

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToLogin(): Promise<void> {
    await this.navigateTo("/user/login");
  }

  async enterEmail(email: string): Promise<void> {
    await this.typeText(LoginPage.EMAIL_INPUT, email);
  }

  async clickContinue(): Promise<void> {
    await this.click(LoginPage.SUBMIT_BUTTON);
  }

  async enterPassword(password: string): Promise<void> {
    await this.typeText(LoginPage.PASSWORD_INPUT, password);
  }

  async clickLogin(): Promise<void> {
    await this.click(LoginPage.SUBMIT_BUTTON);
  }

  async login(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
    await this.clickContinue();
    await this.enterPassword(password);
    await this.clickLogin();
  }

  async togglePasswordVisibility(): Promise<void> {
    await this.click(LoginPage.PASSWORD_TOGGLE);
  }

  async isPasswordVisible(): Promise<boolean> {
    const input = await this.find(LoginPage.PASSWORD_INPUT);
    const type = await input.getAttribute("type");
    return type === "text";
  }

  async isEmailStep(): Promise<boolean> {
    return this.isDisplayed(LoginPage.EMAIL_INPUT);
  }

  async isPasswordStep(): Promise<boolean> {
    return this.isDisplayed(LoginPage.PASSWORD_INPUT);
  }

  async clickRegister(): Promise<void> {
    await this.click(LoginPage.REGISTER_LINK);
  }

  async clickForgotPassword(): Promise<void> {
    await this.click(LoginPage.FORGOT_PASSWORD_LINK);
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(LoginPage.ERROR_MESSAGE);
  }

  async hasSocialAuthProviders(): Promise<boolean> {
    const google = await this.isDisplayed(LoginPage.GOOGLE_AUTH, 3);
    const github = await this.isDisplayed(LoginPage.GITHUB_AUTH, 3);
    const linkedin = await this.isDisplayed(LoginPage.LINKEDIN_AUTH, 3);
    const x = await this.isDisplayed(LoginPage.X_AUTH, 3);
    return google && github && linkedin && x;
  }
}
