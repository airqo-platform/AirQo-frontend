import { WebDriver, By } from "selenium-webdriver";
import { BasePage } from "./base.page";

export class FavoritesPage extends BasePage {
  private static readonly PAGE_TITLE = By.css("h1, h2");
  private static readonly MANAGE_FAVORITES = By.xpath("//button[contains(text(), 'Manage Favorites') or contains(text(), 'Favorites')]");
  private static readonly NO_FAVORITES = By.xpath("//p[contains(text(), 'No favorite') or contains(text(), 'no favorite')]");
  private static readonly CHART = By.css("svg, canvas");
  private static readonly ADD_LOCATION = By.xpath("//button[contains(text(), 'Add')]");
  private static readonly DATE_RANGE = By.css('[placeholder*="date"], [placeholder*="Date"]');
  private static readonly FILTER_BUTTONS = By.css("button[class*='filter']");

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToFavorites(): Promise<void> {
    await this.navigateTo("/user/favorites");
  }

  async hasCharts(): Promise<boolean> {
    return this.isDisplayed(FavoritesPage.CHART, 10);
  }

  async hasNoFavorites(): Promise<boolean> {
    return this.isDisplayed(FavoritesPage.NO_FAVORITES, 5);
  }

  async clickManageFavorites(): Promise<boolean> {
    if (await this.isDisplayed(FavoritesPage.MANAGE_FAVORITES, 3)) {
      await this.click(FavoritesPage.MANAGE_FAVORITES);
      return true;
    }
    return false;
  }

  async isPageLoaded(): Promise<boolean> {
    return (
      (await this.isDisplayed(FavoritesPage.CHART, 10)) ||
      (await this.isDisplayed(FavoritesPage.NO_FAVORITES, 5)) ||
      (await this.isDisplayed(FavoritesPage.PAGE_TITLE, 5))
    );
  }
}

export class NotFoundPage extends BasePage {
  private static readonly TITLE = By.xpath("//h1[contains(text(), 'Not Found') or contains(text(), '404')]");
  private static readonly GO_HOME = By.xpath("//button[contains(text(), 'Go Home')]");
  private static readonly GO_BACK = By.xpath("//button[contains(text(), 'Go Back')]");

  constructor(driver: WebDriver) {
    super(driver);
  }

  async isDisplayed404(): Promise<boolean> {
    return this.isDisplayed(NotFoundPage.TITLE, 5);
  }

  async clickGoHome(): Promise<void> {
    await this.click(NotFoundPage.GO_HOME);
  }

  async clickGoBack(): Promise<void> {
    await this.click(NotFoundPage.GO_BACK);
  }
}
