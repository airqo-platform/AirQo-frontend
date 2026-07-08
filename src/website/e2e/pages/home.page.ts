import { WebDriver } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  constructor(driver: WebDriver) {
    super(driver);
  }

  async open(): Promise<void> {
    await this.navigateTo('/home');
  }

  async isHeroSectionDisplayed(): Promise<boolean> {
    return await this.isDisplayed('[data-testid="hero-section"]');
  }

  async isNavbarDisplayed(): Promise<boolean> {
    return await this.isDisplayed('nav');
  }

  async isFooterDisplayed(): Promise<boolean> {
    return await this.isDisplayed('footer');
  }

  async clickGetStartedButton(): Promise<void> {
    await this.click('[data-testid="get-started-button"]');
  }

  async getPageTitle(): Promise<string> {
    return await this.driver.getTitle();
  }
}
