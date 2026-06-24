import { WebDriver, By } from "selenium-webdriver";
import { BasePage } from "./base.page";

export class RegisterPage extends BasePage {
  private static readonly FIRST_NAME = By.css('input[placeholder="Enter your first name"]');
  private static readonly LAST_NAME = By.css('input[placeholder="Enter your last name"]');
  private static readonly EMAIL = By.css('input[placeholder="Enter your email"]');
  private static readonly PASSWORD = By.css('input[placeholder="Create password"]');
  private static readonly SUBMIT_BUTTON = By.css('button[type="submit"]');
  private static readonly LOGIN_LINK = By.linkText("Log in");
  private static readonly PASSWORD_HINT = By.xpath("//p[contains(text(), 'Must be at least 8 characters')]");
  private static readonly GOOGLE_AUTH = By.css('button[aria-label="Continue with Google"]');
  private static readonly GITHUB_AUTH = By.css('button[aria-label="Continue with GitHub"]');

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToRegister(): Promise<void> {
    await this.navigateTo("/user/creation/individual/register");
  }

  async fillForm(firstName: string, lastName: string, email: string, password: string): Promise<void> {
    await this.typeText(RegisterPage.FIRST_NAME, firstName);
    await this.typeText(RegisterPage.LAST_NAME, lastName);
    await this.typeText(RegisterPage.EMAIL, email);
    await this.typeText(RegisterPage.PASSWORD, password);
  }

  async submitRegistration(): Promise<void> {
    await this.click(RegisterPage.SUBMIT_BUTTON);
  }

  async register(firstName: string, lastName: string, email: string, password: string): Promise<void> {
    await this.fillForm(firstName, lastName, email, password);
    await this.submitRegistration();
  }

  async isFormDisplayed(): Promise<boolean> {
    return (
      (await this.isDisplayed(RegisterPage.FIRST_NAME)) &&
      (await this.isDisplayed(RegisterPage.LAST_NAME)) &&
      (await this.isDisplayed(RegisterPage.EMAIL)) &&
      (await this.isDisplayed(RegisterPage.PASSWORD))
    );
  }

  async hasPasswordHint(): Promise<boolean> {
    return this.isDisplayed(RegisterPage.PASSWORD_HINT, 3);
  }

  async clickLogin(): Promise<void> {
    await this.click(RegisterPage.LOGIN_LINK);
  }

  async hasSocialAuthProviders(): Promise<boolean> {
    return (await this.isDisplayed(RegisterPage.GOOGLE_AUTH, 3));
  }

  async getFormFieldCount(): Promise<number> {
    const inputs = await this.findAll(
      By.css('input[type="text"], input[type="email"], input[type="password"]')
    );
    return inputs.length;
  }
}
