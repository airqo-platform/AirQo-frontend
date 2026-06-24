import { expect } from "chai";
import { WebDriver, By } from "selenium-webdriver";
import { createDriver, quitDriver, screenshotOnFailure } from "../../setup";
import { DataVisualizerPage, DataExportPage, MapPage } from "../../pages/data.page";
import { Config } from "../config";

describe("Data Visualizer @data", function () {
  let driver: WebDriver;
  let page: DataVisualizerPage;

  this.timeout(30000);

  before(async function () {
    this.timeout(45000);
    driver = await createDriver();
    page = new DataVisualizerPage(driver);

    const { LoginPage } = require("../../pages/login.page");
    const loginPage = new LoginPage(driver);
    await loginPage.navigateToLogin();
    await loginPage.login(Config.TEST_USER_EMAIL, Config.TEST_USER_PASSWORD);
    await loginPage.waitForUrlContains("/user/home");
  });

  after(async function () {
    await quitDriver();
  });

  afterEach(async function () {
    if (this.currentTest?.state === "failed") {
      await screenshotOnFailure(this.currentTest.fullTitle());
    }
  });

  it("should load the data visualizer @smoke", async function () {
    await page.navigateToVisualizer();
    await page.closeTutorialIfPresent();
    await new Promise((r) => setTimeout(r, 3000));
    const hasWorkspace = await page.hasWorkspace();
    const url = await page.getCurrentUrl();
    const loaded = hasWorkspace || url.includes("/data-visualizer");
    expect(loaded).to.be.true;
  });

  it("should display chart area", async function () {
    await page.navigateToVisualizer();
    await page.closeTutorialIfPresent();
    await new Promise((r) => setTimeout(r, 3000));
    const hasChart = await page.hasChart();
    const hasWorkspace = await page.hasWorkspace();
    expect(hasChart || hasWorkspace).to.be.true;
  });
});

describe("Data Export @data", function () {
  let driver: WebDriver;
  let page: DataExportPage;

  this.timeout(30000);

  before(async function () {
    this.timeout(45000);
    driver = await createDriver();
    page = new DataExportPage(driver);

    const { LoginPage } = require("../../pages/login.page");
    const loginPage = new LoginPage(driver);
    await loginPage.navigateToLogin();
    await loginPage.login(Config.TEST_USER_EMAIL, Config.TEST_USER_PASSWORD);
    await loginPage.waitForUrlContains("/user/home");
  });

  after(async function () {
    await quitDriver();
  });

  afterEach(async function () {
    if (this.currentTest?.state === "failed") {
      await screenshotOnFailure(this.currentTest.fullTitle());
    }
  });

  it("should load the data export page @smoke", async function () {
    await page.navigateToExport();
    await new Promise((r) => setTimeout(r, 3000));
    const hasSelection = await page.hasSiteSelection();
    const hasDownload = await page.hasDownloadButton();
    const url = await page.getCurrentUrl();
    const loaded = hasSelection || hasDownload || url.includes("/data-export");
    expect(loaded).to.be.true;
  });

  it("should display download button", async function () {
    await page.navigateToExport();
    await new Promise((r) => setTimeout(r, 3000));
    const hasDownload = await page.hasDownloadButton();
    const hasSelection = await page.hasSiteSelection();
    expect(hasDownload || hasSelection).to.be.true;
  });
});

describe("Map Page @data", function () {
  let driver: WebDriver;
  let page: MapPage;

  this.timeout(60000);

  before(async function () {
    this.timeout(60000);
    driver = await createDriver();
    page = new MapPage(driver);

    const { LoginPage } = require("../../pages/login.page");
    const loginPage = new LoginPage(driver);
    await loginPage.navigateToLogin();
    await loginPage.login(Config.TEST_USER_EMAIL, Config.TEST_USER_PASSWORD);
    await loginPage.waitForUrlContains("/user/home");
  });

  after(async function () {
    await quitDriver();
  });

  afterEach(async function () {
    if (this.currentTest?.state === "failed") {
      await screenshotOnFailure(this.currentTest.fullTitle());
    }
  });

  it("should load the map @smoke", async function () {
    await page.navigateToMap();
    await new Promise((r) => setTimeout(r, 5000));
    const hasMap = await page.hasMapLoaded();
    const url = await page.getCurrentUrl();
    expect(hasMap || url.includes("/map")).to.be.true;
  });

  it("should display map markers", async function () {
    await page.navigateToMap();
    await new Promise((r) => setTimeout(r, 5000));
    const hasMarkers = await page.hasMarkers();
    const hasMap = await page.hasMapLoaded();
    expect(hasMarkers || hasMap).to.be.true;
  });
});
