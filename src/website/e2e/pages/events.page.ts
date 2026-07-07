import { By, WebDriver, WebElement } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class EventsPage extends BasePage {
  constructor(driver: WebDriver) {
    super(driver);
  }

  async open(): Promise<void> {
    await this.navigateTo('/events');
  }

  async isPageLoaded(): Promise<boolean> {
    const url = await this.driver.getCurrentUrl();
    return url.includes('/events');
  }

  async getEventCards(): Promise<WebElement[]> {
    return await this.driver.findElements(
      By.css('a[href*="/events/"], [data-testid="event-card"], .event-card'),
    );
  }
}
