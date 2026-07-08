import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class NavbarPage extends BasePage {
  constructor(driver: WebDriver) {
    super(driver);
  }

  async isNavbarDisplayed(): Promise<boolean> {
    return await this.isDisplayed('nav');
  }

  async isLogoDisplayed(): Promise<boolean> {
    return await this.isDisplayed('nav a[href="/home"] img');
  }

  async getNavLinks(): Promise<string[]> {
    const elements = await this.driver.findElements(
      By.css('nav .hidden.md\\:flex a, nav .hidden.md\\:flex button'),
    );
    const hrefs: string[] = [];
    for (const el of elements) {
      const href = await el.getAttribute('href');
      if (href) hrefs.push(href);
    }
    return hrefs;
  }

  async clickNavLink(label: string): Promise<void> {
    const el = await this.driver.findElement(
      By.xpath(
        `//nav//div[contains(@class,'hidden') and contains(@class,'md:flex')]//button[contains(.,'${label}')]`,
      ),
    );
    await el.click();
  }

  async clickLogo(): Promise<void> {
    await this.click('nav a[href="/home"]');
  }
}
