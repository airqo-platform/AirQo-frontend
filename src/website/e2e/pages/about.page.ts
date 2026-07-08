import { WebDriver } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class AboutPage extends BasePage {
  constructor(driver: WebDriver) {
    super(driver);
  }

  async open(): Promise<void> {
    await this.navigateTo('/about-us');
  }

  async isPageLoaded(): Promise<boolean> {
    const url = await this.driver.getCurrentUrl();
    return url.includes('/about-us');
  }

  async isTeamSectionDisplayed(): Promise<boolean> {
    const text = await this.driver.getPageSource();
    return (
      text.includes('team') ||
      text.includes('Team') ||
      text.includes('about') ||
      text.includes('About')
    );
  }
}
