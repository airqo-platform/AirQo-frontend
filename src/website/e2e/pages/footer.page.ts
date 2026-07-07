import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class FooterPage extends BasePage {
  constructor(driver: WebDriver) {
    super(driver);
  }

  async isFooterDisplayed(): Promise<boolean> {
    return await this.isDisplayed('footer#WebsiteFooter, footer');
  }

  async getFooterLinks(): Promise<string[]> {
    const elements = await this.driver.findElements(By.css('footer a[href]'));
    const hrefs: string[] = [];
    for (const el of elements) {
      const href = await el.getAttribute('href');
      if (href) hrefs.push(href);
    }
    return hrefs;
  }

  async clickFooterLink(label: string): Promise<void> {
    const el = await this.driver.findElement(
      By.xpath(`//footer//a[contains(text(),'${label}')]`),
    );
    await el.click();
  }
}
