import {
  WebDriver,
  By,
  until,
  WebElement,
  Key,
  Actions,
} from 'selenium-webdriver';
import { Config } from '../config';

export class BasePage {
  protected driver: WebDriver;
  protected timeout: number;

  constructor(driver: WebDriver) {
    this.driver = driver;
    this.timeout = Config.IMPLICIT_WAIT;
  }

  async navigateTo(path: string): Promise<void> {
    await this.driver.get(`${Config.BASE_URL}${path}`);
  }

  async getCurrentUrl(): Promise<string> {
    return this.driver.getCurrentUrl();
  }

  async getTitle(): Promise<string> {
    return this.driver.getTitle();
  }

  async find(locator: By, timeout?: number): Promise<WebElement> {
    const waitTimeout = timeout || this.timeout;
    return this.driver.wait(until.elementLocated(locator), waitTimeout * 1000);
  }

  async findAll(locator: By): Promise<WebElement[]> {
    return this.driver.findElements(locator);
  }

  async click(locator: By, timeout?: number): Promise<void> {
    const waitTimeout = timeout || this.timeout;
    const element = await this.driver.wait(
      until.elementIsVisible(
        await this.driver.wait(
          until.elementLocated(locator),
          waitTimeout * 1000
        )
      ),
      waitTimeout * 1000
    );
    try {
      await element.click();
    } catch {
      await this.driver.executeScript('arguments[0].click();', element);
    }
  }

  async typeText(locator: By, text: string, clearFirst = true): Promise<void> {
    const element = await this.find(locator);
    if (clearFirst) {
      await element.clear();
    }
    await element.sendKeys(text);
  }

  async getText(locator: By, timeout?: number): Promise<string> {
    const element = await this.find(locator, timeout);
    return element.getText();
  }

  async isDisplayed(locator: By, timeout = 5): Promise<boolean> {
    try {
      await this.driver.wait(
        until.elementIsVisible(
          await this.driver.wait(until.elementLocated(locator), timeout * 1000)
        ),
        timeout * 1000
      );
      return true;
    } catch {
      return false;
    }
  }

  async waitForUrlContains(text: string, timeout = 10): Promise<void> {
    await this.driver.wait(until.urlContains(text), timeout * 1000);
  }

  async waitForText(locator: By, text: string, timeout = 10): Promise<void> {
    await this.driver.wait(
      until.elementTextIs(await this.find(locator), text),
      timeout * 1000
    );
  }

  async scrollTo(locator: By): Promise<void> {
    const element = await this.find(locator);
    await this.driver.executeScript(
      "arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});",
      element
    );
  }

  async getAttribute(locator: By, attribute: string): Promise<string | null> {
    const element = await this.find(locator);
    return element.getAttribute(attribute);
  }

  async pressEnter(): Promise<void> {
    await this.driver.actions().sendKeys(Key.ENTER).perform();
  }

  async executeJs(script: string, ...args: any[]): Promise<any> {
    return this.driver.executeScript(script, ...args);
  }

  async takeScreenshot(name: string): Promise<void> {
    const image = await this.driver.takeScreenshot();
    const fs = require('fs');
    const path = require('path');
    const dir = path.resolve(__dirname, './screenshots');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '_');
    fs.writeFileSync(path.join(dir, `${safeName}.png`), image, 'base64');
  }
}
