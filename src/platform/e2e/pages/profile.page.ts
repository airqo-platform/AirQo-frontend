import { WebDriver, By } from "selenium-webdriver";
import { BasePage } from "./base.page";

export class ProfilePage extends BasePage {
  private static readonly TAB_BUTTONS = By.css("nav button");
  private static readonly FIRST_NAME = By.css('input[placeholder="Enter your first name"]');
  private static readonly LAST_NAME = By.css('input[placeholder="Enter your last name"]');
  private static readonly EMAIL = By.css('input[placeholder="Enter your email"]');
  private static readonly PHONE = By.css('input[placeholder="Enter your phone number"]');
  private static readonly JOB_TITLE = By.css('input[placeholder="Enter your job title"]');
  private static readonly BIO = By.css('textarea[placeholder="Tell us about yourself..."]');
  private static readonly SAVE_BUTTON = By.xpath("//button[contains(text(), 'Save Changes')]");
  private static readonly CURRENT_PASSWORD = By.css('input[placeholder="Enter your current password"]');
  private static readonly NEW_PASSWORD = By.css('input[placeholder="Enter your new password"]');
  private static readonly CONFIRM_PASSWORD = By.css('input[placeholder="Confirm your new password"]');
  private static readonly CHANGE_PASSWORD = By.xpath("//button[contains(text(), 'Change Password')]");

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToProfile(): Promise<void> {
    await this.navigateTo("/user/profile");
  }

  async getTabCount(): Promise<number> {
    const tabs = await this.findAll(ProfilePage.TAB_BUTTONS);
    return tabs.length;
  }

  async clickTab(index: number): Promise<void> {
    const tabs = await this.findAll(ProfilePage.TAB_BUTTONS);
    if (index < tabs.length) {
      await tabs[index].click();
    }
  }

  async clickProfileTab(): Promise<void> {
    await this.clickTab(0);
  }

  async clickSecurityTab(): Promise<void> {
    await this.clickTab(1);
  }

  async clickApiTab(): Promise<void> {
    await this.clickTab(2);
  }

  async clickSubscriptionTab(): Promise<void> {
    await this.clickTab(3);
  }

  async clickTeamInvitesTab(): Promise<void> {
    await this.clickTab(4);
  }

  async clickThemeTab(): Promise<void> {
    await this.clickTab(5);
  }

  async isProfileFormDisplayed(): Promise<boolean> {
    return this.isDisplayed(ProfilePage.FIRST_NAME);
  }

  async isSecurityFormDisplayed(): Promise<boolean> {
    return this.isDisplayed(ProfilePage.CURRENT_PASSWORD);
  }

  async isEmailDisabled(): Promise<boolean> {
    const email = await this.find(ProfilePage.EMAIL);
    const disabled = await email.getAttribute("disabled");
    return disabled !== null;
  }

  async fillProfile(firstName?: string, lastName?: string, phone?: string, jobTitle?: string): Promise<void> {
    if (firstName) await this.typeText(ProfilePage.FIRST_NAME, firstName);
    if (lastName) await this.typeText(ProfilePage.LAST_NAME, lastName);
    if (phone) await this.typeText(ProfilePage.PHONE, phone);
    if (jobTitle) await this.typeText(ProfilePage.JOB_TITLE, jobTitle);
  }

  async saveProfile(): Promise<void> {
    await this.click(ProfilePage.SAVE_BUTTON);
  }

  async changePassword(current: string, newPass: string, confirm: string): Promise<void> {
    await this.typeText(ProfilePage.CURRENT_PASSWORD, current);
    await this.typeText(ProfilePage.NEW_PASSWORD, newPass);
    await this.typeText(ProfilePage.CONFIRM_PASSWORD, confirm);
    await this.click(ProfilePage.CHANGE_PASSWORD);
  }
}
