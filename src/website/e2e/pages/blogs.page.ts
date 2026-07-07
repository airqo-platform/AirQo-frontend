import { By, WebDriver, WebElement } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class BlogsPage extends BasePage {
  constructor(driver: WebDriver) {
    super(driver);
  }

  async open(): Promise<void> {
    await this.navigateTo('/blogs');
  }

  async isPageLoaded(): Promise<boolean> {
    const url = await this.driver.getCurrentUrl();
    return url.includes('/blogs');
  }

  async getBlogPosts(): Promise<WebElement[]> {
    return await this.driver.findElements(
      By.css(
        'article, [data-testid="blog-post"], .blog-card, a[href*="/blogs/"]',
      ),
    );
  }

  async clickFirstBlogPost(): Promise<void> {
    const el = await this.driver.findElement(
      By.css('article a[href*="/blogs/"], a[href*="/blogs/"]'),
    );
    await el.click();
  }
}
