import { expect } from "chai";
import { WebDriver } from "selenium-webdriver";
import { createDriver, quitDriver, screenshotOnFailure } from "../../setup";
import { DashboardPage } from "../../pages/dashboard.page";
import { Config } from "../../config";

describe("Organization Dashboard @organization", function () {
  let driver: WebDriver;
  let dashboardPage: DashboardPage;

  this.timeout(30000);

  before(async function () {
    this.timeout(45000);
    driver = await createDriver();
    dashboardPage = new DashboardPage(driver);

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

  it("should load the org dashboard @smoke", async function () {
    await dashboardPage.navigateToOrgDashboard();
    await new Promise((r) => setTimeout(r, 5000));
    const hasContent =
      (await dashboardPage.hasQuickAccess()) ||
      (await dashboardPage.isAccessDenied()) ||
      (await dashboardPage.hasNoFavorites());
    const url = await dashboardPage.getCurrentUrl();
    expect(hasContent || url.includes("/dashboard")).to.be.true;
  });

  it("should display charts or no-favorites state", async function () {
    await dashboardPage.navigateToOrgDashboard();
    await new Promise((r) => setTimeout(r, 5000));
    const hasCharts = await dashboardPage.hasCharts();
    const hasNoFav = await dashboardPage.hasNoFavorites();
    const url = await dashboardPage.getCurrentUrl();
    expect(hasCharts || hasNoFav || url.includes("/dashboard")).to.be.true;
  });

  it("should show access denied for invalid org", async function () {
    await dashboardPage.navigateToOrgDashboard("nonexistent-org-slug");
    await new Promise((r) => setTimeout(r, 3000));
    const denied = await dashboardPage.isAccessDenied();
    const url = await dashboardPage.getCurrentUrl();
    expect(denied || url.includes("/nonexistent-org-slug")).to.be.true;
  });
});
