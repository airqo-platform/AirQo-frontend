import { WebDriver, By } from "selenium-webdriver";
import { BasePage } from "./base.page";
import { Config } from "../config";

export class DashboardPage extends BasePage {
  protected static readonly LOADING = By.xpath("//p[contains(text(), 'Loading dashboard')]");
  protected static readonly ACCESS_DENIED = By.xpath("//h2[contains(text(), 'Organization not found')]");
  protected static readonly LINE_CHART = By.xpath("//h3[contains(text(), 'Air Pollution Trends')]");
  protected static readonly BAR_CHART = By.xpath("//h3[contains(text(), 'Air Pollution Levels Distribution')]");
  protected static readonly NO_FAVORITES = By.xpath("//p[contains(text(), 'No favorite locations yet')]|//h3[contains(text(), 'No favorite')]");
  protected static readonly MANAGE_FAVORITES = By.xpath("//button[contains(., 'Manage Favorites')]|//a[contains(., 'Manage Favorites')]");
  protected static readonly ADD_FAVORITE = By.xpath("//button[contains(., 'Add favorite')]|//a[contains(., 'Add favorite')]");
  protected static readonly SUGGESTED_LOCATIONS = By.xpath("//h2[contains(text(), 'Suggested')]|//h3[contains(text(), 'Suggested')]");

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToOrgDashboard(orgSlug?: string): Promise<void> {
    const slug = orgSlug || Config.TEST_ORG_SLUG;
    await this.navigateTo(`/org/${slug}/dashboard`);
  }

  async isAccessDenied(): Promise<boolean> {
    return this.isDisplayed(DashboardPage.ACCESS_DENIED, 5);
  }

  async hasCharts(): Promise<boolean> {
    return (
      (await this.isDisplayed(DashboardPage.LINE_CHART, 3)) ||
      (await this.isDisplayed(DashboardPage.BAR_CHART, 3))
    );
  }

  async hasNoFavorites(): Promise<boolean> {
    return (
      (await this.isDisplayed(DashboardPage.NO_FAVORITES, 3)) ||
      (await this.isDisplayed(DashboardPage.SUGGESTED_LOCATIONS, 3))
    );
  }

  async hasQuickAccess(): Promise<boolean> {
    return (
      (await this.hasCharts()) ||
      (await this.hasNoFavorites()) ||
      (await this.isDisplayed(DashboardPage.MANAGE_FAVORITES, 3))
    );
  }

  async clickManageFavorites(): Promise<void> {
    await this.click(DashboardPage.MANAGE_FAVORITES);
  }

  async clickAddFavorite(): Promise<void> {
    await this.click(DashboardPage.ADD_FAVORITE);
  }
}
