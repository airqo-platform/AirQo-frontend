import { By, Key, WebDriver } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class NavbarPage extends BasePage {
  constructor(driver: WebDriver) {
    super(driver);
  }

  async isNavbarDisplayed(): Promise<boolean> {
    return await this.isDisplayed('nav');
  }

  async isLogoDisplayed(): Promise<boolean> {
    return await this.isDisplayed('nav a[href="/home"]');
  }

  async getNavLinks(): Promise<string[]> {
    const elements = await this.driver.findElements(
      By.css('nav .hidden.lg\\:flex a, nav .hidden.lg\\:flex button'),
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
        `//nav//div[contains(@class,'hidden') and contains(@class,'lg:flex')]//button[contains(.,'${label}')]`,
      ),
    );
    await el.click();
  }

  async isDropdownItemDisplayed(href: string): Promise<boolean> {
    return await this.isDisplayed(`nav a[href="${href}"]`);
  }

  async clickLogo(): Promise<void> {
    await this.click('nav a[href="/home"]');
  }

  async isMenuExpanded(label: string): Promise<boolean> {
    const menuId = `site-nav-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const trigger = await this.driver.findElement(
      By.css(`nav button[aria-controls="${menuId}"]`),
    );
    return (await trigger.getAttribute('aria-expanded')) === 'true';
  }

  async clickDropdownItem(href: string): Promise<void> {
    const link = await this.driver.findElement(By.css(`nav a[href="${href}"]`));
    await link.click();
  }

  async pressEscape(): Promise<void> {
    await this.driver.actions().sendKeys(Key.ESCAPE).perform();
  }

  async isFocusOnMenuTrigger(label: string): Promise<boolean> {
    const menuId = `site-nav-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    return (await this.driver.executeScript(
      'return document.activeElement?.getAttribute("aria-controls") === arguments[0]',
      menuId,
    )) as boolean;
  }

  async isResourceTabSelected(label: string): Promise<boolean> {
    const tab = await this.driver.findElement(
      By.xpath(`//button[contains(normalize-space(.), "${label}")]`),
    );
    return (await tab.getAttribute('aria-pressed')) === 'true';
  }

  async setViewport(width: number, height: number): Promise<void> {
    await this.driver.manage().window().setRect({ width, height, x: 0, y: 0 });
  }

  async openMobileNavigation(): Promise<void> {
    await this.click('button[aria-label="Open navigation menu"]');
  }

  async clickMobileMenu(label: string): Promise<void> {
    const menuId = `mobile-site-nav-${label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}`;
    await this.click(`button[aria-controls="${menuId}"]`);
  }

  async clickMobileDropdownItem(href: string): Promise<void> {
    await this.click(`#mobile-site-navigation a[href="${href}"]`);
  }

  async isMobileNavigationDisplayed(): Promise<boolean> {
    return await this.isDisplayed('#mobile-site-navigation');
  }
}
