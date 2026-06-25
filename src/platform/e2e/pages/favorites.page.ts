import { WebDriver, By } from "selenium-webdriver";
import { BasePage } from "./base.page";

export class FavoritesPage extends BasePage {
  protected static readonly PAGE_TITLE = By.css("h1, h2");
  protected static readonly MANAGE_FAVORITES = By.xpath("//button[contains(text(), 'Manage Favorites') or contains(text(), 'Favorites')]");
  protected static readonly NO_FAVORITES = By.xpath("//p[contains(text(), 'No favorite') or contains(text(), 'no favorite')]");
  protected static readonly CHART = By.css("svg, canvas");
  protected static readonly ADD_LOCATION = By.xpath("//button[contains(text(), 'Add')]");
  protected static readonly DATE_RANGE = By.css('[placeholder*="date"], [placeholder*="Date"]');
  protected static readonly FILTER_BUTTONS = By.css("button[class*='filter']");

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
  protected static readonly TITLE = By.xpath("//h1[contains(text(), 'Not Found') or contains(text(), '404')]");
  protected static readonly GO_HOME = By.xpath("//button[contains(text(), 'Go Home')]");
  protected static readonly GO_BACK = By.xpath("//button[contains(text(), 'Go Back')]");

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
