import { WebDriver } from 'selenium-webdriver';
import { BasePage } from './base.page';
import { Config } from '../config';

export class DashboardPage extends BasePage {
  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToOrgDashboard(orgSlug?: string): Promise<void> {
    const slug = orgSlug || Config.TEST_ORG_SLUG;
    await this.navigateTo(`/org/${slug}/dashboard`);
  }

}
