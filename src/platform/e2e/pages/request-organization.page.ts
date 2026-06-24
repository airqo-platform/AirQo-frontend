import { WebDriver, By } from "selenium-webdriver";
import { BasePage } from "./base.page";

export class RequestOrganizationPage extends BasePage {
  private static readonly PROJECT_NAME = By.css('input[name="project_name"], input[placeholder*="project"]');
  private static readonly CITY = By.css('input[name="city"], input[placeholder*="city"]');
  private static readonly COUNTRY = By.css('select[name="country"], [role="combobox"]');
  private static readonly CONTACT_NAME = By.css('input[name="contact_name"], input[placeholder*="contact"]');
  private static readonly CONTACT_EMAIL = By.css('input[name="contact_email"], input[type="email"]');
  private static readonly ORG_TYPE = By.css('select[name="organization_type"], [role="combobox"]');
  private static readonly USE_CASE = By.css('textarea[name="use_case"], textarea');
  private static readonly FUNDER = By.css('input[name="funder"], input[placeholder*="funder"]');
  private static readonly SUBMIT_BUTTON = By.css('button[type="submit"]');
  private static readonly SUCCESS_DIALOG = By.xpath("//div[contains(@role, 'dialog')][contains(., 'Success')]");
  private static readonly ERROR_MESSAGE = By.css(".text-destructive");
  private static readonly CHECKLIST = By.css("[class*='checklist']");

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToRequestOrg(): Promise<void> {
    await this.navigateTo("/request-organization");
  }

  async fillForm(data: {
    projectName?: string;
    city?: string;
    contactName?: string;
    contactEmail?: string;
    useCase?: string;
    funder?: string;
  }): Promise<void> {
    if (data.projectName) await this.typeText(RequestOrganizationPage.PROJECT_NAME, data.projectName);
    if (data.city) await this.typeText(RequestOrganizationPage.CITY, data.city);
    if (data.contactName) await this.typeText(RequestOrganizationPage.CONTACT_NAME, data.contactName);
    if (data.contactEmail) await this.typeText(RequestOrganizationPage.CONTACT_EMAIL, data.contactEmail);
    if (data.useCase) await this.typeText(RequestOrganizationPage.USE_CASE, data.useCase);
    if (data.funder) await this.typeText(RequestOrganizationPage.FUNDER, data.funder);
  }

  async submitForm(): Promise<void> {
    await this.click(RequestOrganizationPage.SUBMIT_BUTTON);
  }

  async isFormDisplayed(): Promise<boolean> {
    return this.isDisplayed(RequestOrganizationPage.PROJECT_NAME, 5);
  }

  async hasSuccessDialog(): Promise<boolean> {
    return this.isDisplayed(RequestOrganizationPage.SUCCESS_DIALOG, 5);
  }

  async hasError(): Promise<boolean> {
    return this.isDisplayed(RequestOrganizationPage.ERROR_MESSAGE, 3);
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(RequestOrganizationPage.ERROR_MESSAGE);
  }
}
