import { Builder, By, WebDriver } from 'selenium-webdriver';
import { config } from './config';
import fs from 'fs';
import path from 'path';

let driver: WebDriver;

export async function createDriver(): Promise<WebDriver> {
  const chrome = require('selenium-webdriver/chrome');
  const options = new chrome.Options();

  if (config.HEADLESS) {
    options.addArguments('--headless');
  }

  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');

  const builder = new Builder()
    .forBrowser(config.BROWSER)
    .setChromeOptions(options);
  const driverPath = process.env.CHROMEDRIVER_PATH;

  if (driverPath && config.BROWSER === 'chrome') {
    builder.setChromeService(new chrome.ServiceBuilder(driverPath));
  }

  driver = await builder.build();

  await driver.manage().window().setRect({
    width: 1440,
    height: 1000,
    x: 0,
    y: 0,
  });

  await driver.manage().setTimeouts({
    implicit: config.IMPLICIT_WAIT,
    pageLoad: config.PAGE_LOAD_TIMEOUT,
  });

  return driver;
}

export async function quitDriver(): Promise<void> {
  if (driver) {
    await driver.quit();
  }
}

export async function screenshotOnFailure(this: any, test: any) {
  if (test.state === 'failed') {
    const screenshotDir = config.SCREENSHOT_DIR;
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const screenshotPath = path.join(
      screenshotDir,
      `${test.title}-${Date.now()}.png`,
    );
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync(screenshotPath, screenshot, 'base64');
    console.log(`Screenshot saved: ${screenshotPath}`);
  }
}

export function getDriver(): WebDriver {
  return driver;
}
