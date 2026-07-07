import { WebDriver } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class SolutionsPage extends BasePage {
  constructor(driver: WebDriver) {
    super(driver);
  }

  async open(solutionSlug: string): Promise<void> {
    await this.navigateTo(`/solutions/${solutionSlug}`);
  }

  async isPageLoaded(): Promise<boolean> {
    const url = await this.driver.getCurrentUrl();
    return url.includes('/solutions/');
  }
}
