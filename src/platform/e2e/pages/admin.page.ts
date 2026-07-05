import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class SystemAdminPage extends BasePage {
  protected static readonly PAGE_TITLE = By.css('h1, h2');
  protected static readonly DATA_TABLE = By.css('table');
  protected static readonly CREATE_BUTTON = By.xpath(
    "//button[contains(text(), 'Create') or contains(text(), 'New')]"
  );
  protected static readonly SEARCH_INPUT = By.css(
    'input[type="search"], input[placeholder*="Search"]'
  );

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToClients(): Promise<void> {
    await this.navigateTo('/system/clients');
  }

  async navigateToEmailConfigs(): Promise<void> {
    await this.navigateTo('/system/email-configs');
  }

  async navigateToFeedback(): Promise<void> {
    await this.navigateTo('/system/feedback');
  }

  async navigateToOrgRequests(): Promise<void> {
    await this.navigateTo('/system/org-requests');
  }

  async navigateToRolesPermissions(): Promise<void> {
    await this.navigateTo('/system/roles-permissions');
  }

  async navigateToSecurity(): Promise<void> {
    await this.navigateTo('/system/security');
  }

  async navigateToSurveys(): Promise<void> {
    await this.navigateTo('/system/surveys');
  }

  async navigateToUserStatistics(): Promise<void> {
    await this.navigateTo('/system/user-statistics');
  }

  async getPageTitle(): Promise<string> {
    return this.getText(SystemAdminPage.PAGE_TITLE);
  }

  async hasDataTable(): Promise<boolean> {
    return this.isDisplayed(SystemAdminPage.DATA_TABLE, 5);
  }

  async hasCreateButton(): Promise<boolean> {
    return this.isDisplayed(SystemAdminPage.CREATE_BUTTON, 3);
  }

  async clickCreate(): Promise<void> {
    await this.click(SystemAdminPage.CREATE_BUTTON);
  }

  async search(query: string): Promise<void> {
    await this.typeText(SystemAdminPage.SEARCH_INPUT, query);
    await this.pressEnter();
  }
}
