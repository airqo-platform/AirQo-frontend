import { By, WebDriver } from 'selenium-webdriver';
import { config } from '../config';
import fs from 'fs';
import path from 'path';

export class BasePage {
  protected driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async navigateTo(path: string): Promise<void> {
    await this.driver.get(`${config.BASE_URL}${path}`);
  }

  async find(selector: string) {
    return await this.driver.findElement(By.css(selector));
  }

  async click(selector: string): Promise<void> {
    const element = await this.find(selector);
    await element.click();
  }

  async typeText(selector: string, text: string): Promise<void> {
    const element = await this.find(selector);
    await element.sendKeys(text);
  }

  async isDisplayed(selector: string): Promise<boolean> {
    try {
      const element = await this.find(selector);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  async waitForUrlContains(
    text: string,
    timeout: number = 10000,
  ): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const currentUrl = await this.driver.getCurrentUrl();
      if (currentUrl.includes(text)) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return false;
  }

  async takeScreenshot(name: string): Promise<void> {
    const screenshotDir = config.SCREENSHOT_DIR;
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const screenshotPath = path.join(
      screenshotDir,
      `${name}-${Date.now()}.png`,
    );
    const screenshot = await this.driver.takeScreenshot();
    fs.writeFileSync(screenshotPath, screenshot, 'base64');
  }
}
