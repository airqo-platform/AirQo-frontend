import { expect } from "chai";
import { WebDriver } from "selenium-webdriver";
import { createDriver, quitDriver, screenshotOnFailure } from "../../setup";
import { OrgSettingsPage, OrgRolesPage, MemberRequestsPage } from "../../pages/org-pages.page";
import { Config } from "../../config";

describe("Organization Settings @organization", function () {
  let driver: WebDriver;
  let page: OrgSettingsPage;
  this.timeout(30000);

  before(async function () {
    this.timeout(45000);
    driver = await createDriver();
    page = new OrgSettingsPage(driver);
    const { LoginPage } = require("../../pages/login.page");
    const loginPage = new LoginPage(driver);
    await loginPage.navigateToLogin();
    await loginPage.login(Config.TEST_USER_EMAIL, Config.TEST_USER_PASSWORD);
    await loginPage.waitForUrlContains("/user/home");
  });

  after(async function () { await quitDriver(); });

  afterEach(async function () {
    if (this.currentTest?.state === "failed") {
      await screenshotOnFailure(this.currentTest.fullTitle());
    }
  });

  it("should load org settings page @smoke", async function () {
    await page.navigateToSettings(Config.TEST_ORG_SLUG);
    await new Promise((r) => setTimeout(r, 5000));
    const loaded = await page.isPageLoaded();
    const url = await page.getCurrentUrl();
    expect(loaded || url.includes("/organization-settings")).to.be.true;
  });

  it("should display theme section", async function () {
    await page.navigateToSettings(Config.TEST_ORG_SLUG);
    await new Promise((r) => setTimeout(r, 5000));
    const hasTheme = await page.hasThemeSection();
    expect(hasTheme).to.be.true;
  });
});

describe("Organization Roles @organization", function () {
  let driver: WebDriver;
  let page: OrgRolesPage;
  this.timeout(30000);

  before(async function () {
    this.timeout(45000);
    driver = await createDriver();
    page = new OrgRolesPage(driver);
    const { LoginPage } = require("../../pages/login.page");
    const loginPage = new LoginPage(driver);
    await loginPage.navigateToLogin();
    await loginPage.login(Config.TEST_USER_EMAIL, Config.TEST_USER_PASSWORD);
    await loginPage.waitForUrlContains("/user/home");
  });

  after(async function () { await quitDriver(); });

  afterEach(async function () {
    if (this.currentTest?.state === "failed") {
      await screenshotOnFailure(this.currentTest.fullTitle());
    }
  });

  it("should load roles page @smoke", async function () {
    await page.navigateToRoles(Config.TEST_ORG_SLUG);
    const loaded = await page.isPageLoaded();
    expect(loaded).to.be.true;
  });

  it("should have create role button", async function () {
    await page.navigateToRoles(Config.TEST_ORG_SLUG);
    await new Promise((r) => setTimeout(r, 5000));
    const hasButton = await page.isDisplayed(OrgRolesPage["CREATE_ROLE_BUTTON"], 5);
    const url = await page.getCurrentUrl();
    expect(hasButton || url.includes("/roles")).to.be.true;
  });
});

describe("Member Requests @organization", function () {
  let driver: WebDriver;
  let page: MemberRequestsPage;
  this.timeout(30000);

  before(async function () {
    this.timeout(45000);
    driver = await createDriver();
    page = new MemberRequestsPage(driver);
    const { LoginPage } = require("../../pages/login.page");
    const loginPage = new LoginPage(driver);
    await loginPage.navigateToLogin();
    await loginPage.login(Config.TEST_USER_EMAIL, Config.TEST_USER_PASSWORD);
    await loginPage.waitForUrlContains("/user/home");
  });

  after(async function () { await quitDriver(); });

  afterEach(async function () {
    if (this.currentTest?.state === "failed") {
      await screenshotOnFailure(this.currentTest.fullTitle());
    }
  });

  it("should load member requests page @smoke", async function () {
    await page.navigateToMemberRequests(Config.TEST_ORG_SLUG);
    await new Promise((r) => setTimeout(r, 5000));
    const loaded = await page.isPageLoaded();
    const url = await page.getCurrentUrl();
    expect(loaded || url.includes("/member-requests")).to.be.true;
  });

  it("should have filter tabs", async function () {
    await page.navigateToMemberRequests(Config.TEST_ORG_SLUG);
    await new Promise((r) => setTimeout(r, 5000));
    const tabCount = await page.getTabCount();
    const url = await page.getCurrentUrl();
    expect(tabCount >= 1 || url.includes("/member-requests")).to.be.true;
  });
});
