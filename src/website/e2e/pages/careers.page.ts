import { By, WebDriver, WebElement } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class CareersPage extends BasePage {
  constructor(driver: WebDriver) {
    super(driver);
  }

  async open(): Promise<void> {
    await this.navigateTo('/careers');
  }

  async isPageLoaded(): Promise<boolean> {
    const url = await this.driver.getCurrentUrl();
    return url.includes('/careers');
  }

  async getJobListings(): Promise<WebElement[]> {
    return await this.driver.findElements(
      By.css('a[href*="/careers/"], [data-testid="job-listing"], .job-card'),
    );
  }
}
