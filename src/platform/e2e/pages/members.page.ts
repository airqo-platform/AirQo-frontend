import { WebDriver, By } from "selenium-webdriver";
import { BasePage } from "./base.page";

export class MembersPage extends BasePage {
  private static readonly PAGE_TITLE = By.css("h1, h2");
  private static readonly TABLE_ROWS = By.css("table tbody tr");
  private static readonly TABLE_HEADERS = By.css("table thead th");
  private static readonly SEND_INVITES = By.xpath("//button[contains(text(), 'Send Invites')]");
  private static readonly ACTION_MENU = By.css("table tbody tr button");
  private static readonly VIEW_DETAILS = By.xpath("//div[contains(@role, 'menuitem')][contains(text(), 'View Details')]");
  private static readonly INVITE_DIALOG = By.xpath("//div[contains(@role, 'dialog')]");
  private static readonly EMAIL_INPUT_DIALOG = By.css('div[role="dialog"] input[type="email"]');
  private static readonly ADD_EMAIL = By.xpath("//div[contains(@role, 'dialog')]//button[contains(text(), 'Add Email')]");
  private static readonly SEND_INVITES_SUBMIT = By.xpath("//div[contains(@role, 'dialog')]//button[contains(text(), 'Send Invites')]");
  private static readonly CANCEL = By.xpath("//div[contains(@role, 'dialog')]//button[contains(text(), 'Cancel')]");

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToMembers(orgSlug: string): Promise<void> {
    await this.navigateTo(`/org/${orgSlug}/members`);
  }

  async getPageTitle(): Promise<string> {
    return this.getText(MembersPage.PAGE_TITLE);
  }

  async getMemberCount(): Promise<number> {
    const rows = await this.findAll(MembersPage.TABLE_ROWS);
    return rows.length;
  }

  async getTableHeaders(): Promise<string[]> {
    const headers = await this.findAll(MembersPage.TABLE_HEADERS);
    const texts: string[] = [];
    for (const h of headers) {
      texts.push(await h.getText());
    }
    return texts;
  }

  async clickSendInvites(): Promise<void> {
    await this.click(MembersPage.SEND_INVITES);
  }

  async isInviteDialogOpen(): Promise<boolean> {
    return this.isDisplayed(MembersPage.INVITE_DIALOG, 3);
  }

  async inviteMember(email: string): Promise<void> {
    await this.clickSendInvites();
    await this.typeText(MembersPage.EMAIL_INPUT_DIALOG, email);
    await this.click(MembersPage.SEND_INVITES_SUBMIT);
  }

  async openActionMenu(index = 0): Promise<void> {
    const triggers = await this.findAll(MembersPage.ACTION_MENU);
    if (index < triggers.length) {
      await triggers[index].click();
    }
  }

  async clickViewDetails(index = 0): Promise<void> {
    await this.openActionMenu(index);
    await this.click(MembersPage.VIEW_DETAILS);
  }
}
