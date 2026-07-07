import { WebDriver } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class ProductsPage extends BasePage {
  constructor(driver: WebDriver) {
    super(driver);
  }

  async open(productSlug: string): Promise<void> {
    await this.navigateTo(`/products/${productSlug}`);
  }

  async isPageLoaded(): Promise<boolean> {
    const url = await this.driver.getCurrentUrl();
    return url.includes('/products/');
  }

  async getPageTitle(): Promise<string> {
    return await this.driver.getTitle();
  }
}
