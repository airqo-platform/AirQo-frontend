import { WebDriver, By } from "selenium-webdriver";
import { BasePage } from "./base.page";

export class HomePage extends BasePage {
  protected static readonly WELCOME_HEADING = By.css("h1");
  protected static readonly DOWNLOAD_DATA = By.xpath("//a[contains(., 'Download Data')]|//button[contains(., 'Download Data')]");
  protected static readonly MY_FAVORITES = By.xpath("//a[contains(., 'My Favorites')]|//button[contains(., 'My Favorites')]");
  protected static readonly REQUEST_ORG = By.xpath("//a[contains(., 'Request New Organization')]|//button[contains(., 'Request New Organization')]");
  protected static readonly DATA_ACCESS = By.xpath("//a[contains(., 'Data Access')]|//button[contains(., 'Data Access')]");
  protected static readonly START_HERE = By.css('[data-testid="get-started-button"]');
  protected static readonly SHOW_VIDEO = By.css('[data-testid="show-video-button"]');
  protected static readonly VIDEO_THUMBNAIL = By.css('[data-testid="video-thumbnail"]');

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToHome(): Promise<void> {
    await this.navigateTo("/user/home");
  }

  async getWelcomeText(): Promise<string> {
    return this.getText(HomePage.WELCOME_HEADING);
  }

  async isWelcomeDisplayed(): Promise<boolean> {
    return this.isDisplayed(HomePage.WELCOME_HEADING);
  }

  async clickDownloadData(): Promise<void> {
    await this.click(HomePage.DOWNLOAD_DATA);
  }

  async clickMyFavorites(): Promise<void> {
    await this.click(HomePage.MY_FAVORITES);
  }

  async clickRequestOrganization(): Promise<void> {
    await this.click(HomePage.REQUEST_ORG);
  }

  async clickStartHere(): Promise<void> {
    await this.click(HomePage.START_HERE);
  }

  async clickShowVideo(): Promise<void> {
    await this.click(HomePage.SHOW_VIDEO);
  }

  async hasQuickAccessButtons(): Promise<boolean> {
    return (
      (await this.isDisplayed(HomePage.DOWNLOAD_DATA, 3)) ||
      (await this.isDisplayed(HomePage.MY_FAVORITES, 3)) ||
      (await this.isDisplayed(HomePage.DATA_ACCESS, 3))
    );
  }

  async hasVideoThumbnail(): Promise<boolean> {
    return this.isDisplayed(HomePage.VIDEO_THUMBNAIL, 3);
  }
}
