import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class LegalPage extends BasePage {
  constructor(driver: WebDriver) {
    super(driver);
  }

  async open(legalSlug: string): Promise<void> {
    await this.navigateTo(`/legal/${legalSlug}`);
  }

  async isPageLoaded(): Promise<boolean> {
    const url = await this.driver.getCurrentUrl();
    return url.includes('/legal/');
  }

  async getTabLinks(): Promise<string[]> {
    const elements = await this.driver.findElements(
      By.css('div.flex.border-b button'),
    );
    const labels: string[] = [];
    for (const el of elements) {
      const text = await el.getText();
      if (text) labels.push(text.trim());
    }
    return labels;
  }

  async clickTab(label: string): Promise<void> {
    const el = await this.driver.findElement(
      By.xpath(
        `//div[contains(@class,'border-b')]//button[contains(text(),'${label}')]`,
      ),
    );
    await el.click();
  }
}
