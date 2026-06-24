import * as fs from "fs";
import * as path from "path";
import { Builder, WebDriver, Browser } from "selenium-webdriver";
import { Config } from "./config";

let driver: WebDriver;

export async function createDriver(): Promise<WebDriver> {
  const browser = Config.BROWSER.toLowerCase();
  let options: any;

  if (browser === "chrome") {
    const chrome = require("selenium-webdriver/chrome");
    options = new chrome.Options();
    options.addArguments("--window-size=1920,1080");
    options.addArguments("--disable-gpu");
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-dev-shm-usage");
    options.addArguments("--disable-search-engine-choice-screen");
    if (Config.HEADLESS) {
      options.addArguments("--headless=new");
    }
  } else if (browser === "firefox") {
    const firefox = require("selenium-webdriver/firefox");
    options = new firefox.Options();
    options.addArguments("--width=1920");
    options.addArguments("--height=1080");
    if (Config.HEADLESS) {
      options.addArguments("--headless");
    }
  } else if (browser === "edge") {
    const edge = require("selenium-webdriver/edge");
    options = new edge.Options();
    options.addArguments("--window-size=1920,1080");
    if (Config.HEADLESS) {
      options.addArguments("--headless=new");
    }
  }

  const builder = new Builder().forBrowser(browser === "chrome" ? Browser.CHROME : browser === "firefox" ? Browser.FIREFOX : Browser.EDGE);

  if (options) {
    builder.setChromeOptions(options);
    builder.setFirefoxOptions(options);
  }

  driver = await builder.build();
  await driver.manage().setTimeouts({ implicit: Config.IMPLICIT_WAIT * 1000 });
  await driver.manage().window().maximize();

  return driver;
}

export async function quitDriver(): Promise<void> {
  if (driver) {
    await driver.quit();
  }
}

export function getDriver(): WebDriver {
  return driver;
}

export async function screenshotOnFailure(testName: string): Promise<void> {
  if (!driver) return;
  const screenshotDir = path.resolve(__dirname, "../screenshots");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filepath = path.join(screenshotDir, `${testName}_${timestamp}.png`);
  const image = await driver.takeScreenshot();
  fs.writeFileSync(filepath, image, "base64");
  console.log(`Screenshot saved: ${filepath}`);
}
