import { WebDriver, By } from "selenium-webdriver";
import { BasePage } from "./base.page";

export class OrgSettingsPage extends BasePage {
  private static readonly PAGE_TITLE = By.css("h1, h2");
  private static readonly GROUP_NAME_INPUT = By.css('input[placeholder*="name"], input[name*="name"]');
  private static readonly DESCRIPTION_INPUT = By.css('textarea, input[placeholder*="description"]');
  private static readonly SAVE_BUTTON = By.xpath("//button[contains(text(), 'Save')]");
  private static readonly LEAVE_ORG_BUTTON = By.xpath("//button[contains(text(), 'Leave')]");
  private static readonly DELETE_ORG_BUTTON = By.xpath("//button[contains(text(), 'Delete')]");
  private static readonly THEME_SECTION = By.xpath("//h3[contains(text(), 'Theme') or contains(text(), 'theme')]");

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToSettings(orgSlug: string): Promise<void> {
    await this.navigateTo(`/org/${orgSlug}/organization-settings`);
  }

  async isPageLoaded(): Promise<boolean> {
    return this.isDisplayed(OrgSettingsPage.PAGE_TITLE, 5);
  }

  async getPageTitle(): Promise<string> {
    return this.getText(OrgSettingsPage.PAGE_TITLE);
  }

  async hasThemeSection(): Promise<boolean> {
    return this.isDisplayed(OrgSettingsPage.THEME_SECTION, 3);
  }
}

export class OrgRolesPage extends BasePage {
  private static readonly PAGE_TITLE = By.css("h1, h2");
  private static readonly CREATE_ROLE_BUTTON = By.xpath("//button[contains(text(), 'Create') or contains(text(), 'New Role')]");
  private static readonly ROLES_TABLE = By.css("table");
  private static readonly ROLE_NAME = By.css("table tbody tr td:first-child");
  private static readonly SEARCH_INPUT = By.css('input[placeholder*="Search"]');
  private static readonly ROLE_DIALOG = By.xpath("//div[contains(@role, 'dialog')]");
  private static readonly ROLE_NAME_INPUT = By.css('div[role="dialog"] input');
  private static readonly DIALOG_SUBMIT = By.xpath("//div[contains(@role, 'dialog')]//button[contains(text(), 'Create') or contains(text(), 'Save')]");
  private static readonly PERMISSION_COUNT = By.css("table tbody tr td:nth-child(2)");
  private static readonly USER_COUNT = By.css("table tbody tr td:nth-child(3)");

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToRoles(orgSlug: string): Promise<void> {
    await this.navigateTo(`/org/${orgSlug}/roles`);
  }

  async isPageLoaded(): Promise<boolean> {
    return (
      (await this.isDisplayed(OrgRolesPage.ROLES_TABLE, 5)) ||
      (await this.isDisplayed(OrgRolesPage.PAGE_TITLE, 5))
    );
  }

  async clickCreateRole(): Promise<void> {
    await this.click(OrgRolesPage.CREATE_ROLE_BUTTON);
  }

  async isCreateDialogOpen(): Promise<boolean> {
    return this.isDisplayed(OrgRolesPage.ROLE_DIALOG, 3);
  }

  async createRole(name: string): Promise<void> {
    await this.clickCreateRole();
    await this.typeText(OrgRolesPage.ROLE_NAME_INPUT, name);
    await this.click(OrgRolesPage.DIALOG_SUBMIT);
  }

  async getRoleCount(): Promise<number> {
    const rows = await this.findAll(By.css("table tbody tr"));
    return rows.length;
  }

  async searchRoles(query: string): Promise<void> {
    if (await this.isDisplayed(OrgRolesPage.SEARCH_INPUT, 3)) {
      await this.typeText(OrgRolesPage.SEARCH_INPUT, query);
    }
  }
}

export class MemberRequestsPage extends BasePage {
  private static readonly PAGE_TITLE = By.css("h1, h2");
  private static readonly REQUESTS_TABLE = By.css("table");
  private static readonly APPROVE_BUTTON = By.xpath("//button[contains(text(), 'Approve')]");
  private static readonly REJECT_BUTTON = By.xpath("//button[contains(text(), 'Reject')]");
  private static readonly TABS = By.css("nav button, [role='tablist'] button");
  private static readonly STATUS_BADGE = By.css("[class*='badge'], [class*='status']");
  private static readonly CONFIRM_DIALOG = By.xpath("//div[contains(@role, 'dialog')]");
  private static readonly CONFIRM_APPROVE = By.xpath("//div[contains(@role, 'dialog')]//button[contains(text(), 'Approve')]");
  private static readonly CONFIRM_REJECT = By.xpath("//div[contains(@role, 'dialog')]//button[contains(text(), 'Reject')]");
  private static readonly REJECT_REASON = By.css('div[role="dialog"] textarea, div[role="dialog"] input');

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToMemberRequests(orgSlug: string): Promise<void> {
    await this.navigateTo(`/org/${orgSlug}/member-requests`);
  }

  async isPageLoaded(): Promise<boolean> {
    return this.isDisplayed(MemberRequestsPage.PAGE_TITLE, 5) ||
           this.isDisplayed(MemberRequestsPage.REQUESTS_TABLE, 5);
  }

  async getTabCount(): Promise<number> {
    const tabs = await this.findAll(MemberRequestsPage.TABS);
    return tabs.length;
  }

  async clickTab(index: number): Promise<void> {
    const tabs = await this.findAll(MemberRequestsPage.TABS);
    if (index < tabs.length) await tabs[index].click();
  }

  async hasRequests(): Promise<boolean> {
    return this.isDisplayed(MemberRequestsPage.REQUESTS_TABLE, 5);
  }
}
