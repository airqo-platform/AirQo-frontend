import { expect } from "chai";
import { WebDriver } from "selenium-webdriver";
import { createDriver, quitDriver, screenshotOnFailure } from "../../setup";
import { SystemAdminPage } from "../../pages/admin.page";
import { Config } from "../../config";

describe("System Admin @admin", function () {
  let driver: WebDriver;
  let adminPage: SystemAdminPage;

  this.timeout(30000);

  before(async function () {
    this.timeout(45000);
    driver = await createDriver();
    adminPage = new SystemAdminPage(driver);

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

  it("should load clients page @smoke", async function () {
    await adminPage.navigateToClients();
    const title = await adminPage.getPageTitle();
    expect(title).to.be.a("string");
  });

  it("should display data table or create button on clients", async function () {
    await adminPage.navigateToClients();
    const hasTable = await adminPage.hasDataTable();
    const hasCreate = await adminPage.hasCreateButton();
    expect(hasTable || hasCreate).to.be.true;
  });

  it("should load feedback page", async function () {
    await adminPage.navigateToFeedback();
    const title = await adminPage.getPageTitle();
    expect(title).to.be.a("string");
  });

  it("should load roles & permissions page", async function () {
    await adminPage.navigateToRolesPermissions();
    const title = await adminPage.getPageTitle();
    expect(title).to.be.a("string");
  });

  it("should load security page", async function () {
    await adminPage.navigateToSecurity();
    const title = await adminPage.getPageTitle();
    expect(title).to.be.a("string");
  });

  it("should load surveys page", async function () {
    await adminPage.navigateToSurveys();
    const title = await adminPage.getPageTitle();
    expect(title).to.be.a("string");
  });

  it("should load user statistics page", async function () {
    await adminPage.navigateToUserStatistics();
    const title = await adminPage.getPageTitle();
    expect(title).to.be.a("string");
  });
});
