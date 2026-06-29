import { expect } from "chai";
import { WebDriver } from "selenium-webdriver";
import { createDriver, quitDriver, screenshotOnFailure } from "../../setup";
import { RequestOrganizationPage } from "../../pages/request-organization.page";
import { Config } from "../../config";

describe("Request Organization @user", function () {
  let driver: WebDriver;
  let page: RequestOrganizationPage;
  this.timeout(30000);

  before(async function () {
    this.timeout(45000);
    driver = await createDriver();
    page = new RequestOrganizationPage(driver);

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

  it("should load the request organization page @smoke", async function () {
    await page.navigateToRequestOrg();
    const isDisplayed = await page.isFormDisplayed();
    expect(isDisplayed).to.be.true;
  });

  it("should show validation errors for empty submission", async function () {
    await page.navigateToRequestOrg();
    await page.submitForm();
    await new Promise((r) => setTimeout(r, 2000));
    const url = await page.getCurrentUrl();
    expect(url).to.include("/request-organization");
  });

  it("should reject short use case (< 10 chars)", async function () {
    await page.navigateToRequestOrg();
    await page.fillForm({
      projectName: "Test Project",
      city: "Kampala",
      contactName: "Test User",
      contactEmail: "test@example.com",
      useCase: "Short",
    });
    await page.submitForm();
    await new Promise((r) => setTimeout(r, 2000));
    const hasError = await page.hasError();
    const stillOnPage = (await page.getCurrentUrl()).includes("/request-organization");
    expect(hasError || stillOnPage).to.be.true;
  });

  it("should reject invalid email format", async function () {
    await page.navigateToRequestOrg();
    await page.fillForm({
      projectName: "Test Project",
      city: "Kampala",
      contactName: "Test User",
      contactEmail: "not-an-email",
      useCase: "This is a valid use case description for testing",
    });
    await page.submitForm();
    await new Promise((r) => setTimeout(r, 2000));
    const hasError = await page.hasError();
    const stillOnPage = (await page.getCurrentUrl()).includes("/request-organization");
    expect(hasError || stillOnPage).to.be.true;
  });
});
