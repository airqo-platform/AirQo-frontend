import { expect } from "chai";
import { WebDriver } from "selenium-webdriver";
import { createDriver, quitDriver, screenshotOnFailure } from "../../setup";
import { MembersPage } from "../../pages/members.page";
import { Config } from "../../config";

describe("Organization Members @organization", function () {
  let driver: WebDriver;
  let membersPage: MembersPage;

  this.timeout(30000);

  before(async function () {
    driver = await createDriver();
    membersPage = new MembersPage(driver);

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

  it("should load the members page @smoke", async function () {
    await membersPage.navigateToMembers(Config.TEST_ORG_SLUG);
    const title = await membersPage.getPageTitle();
    expect(title.toUpperCase()).to.include("MEMBERS");
  });

  it("should display table headers", async function () {
    await membersPage.navigateToMembers(Config.TEST_ORG_SLUG);
    await new Promise((r) => setTimeout(r, 5000));
    const headers = await membersPage.getTableHeaders();
    expect(headers.length).to.be.greaterThan(0);
  });

  it("should have expected columns", async function () {
    await membersPage.navigateToMembers(Config.TEST_ORG_SLUG);
    await new Promise((r) => setTimeout(r, 5000));
    const headers = await membersPage.getTableHeaders();
    const headerText = headers.join(" ").toLowerCase();
    expect(headerText).to.include("user");
    expect(headerText).to.include("status");
  });

  it("should open invite dialog", async function () {
    await membersPage.navigateToMembers(Config.TEST_ORG_SLUG);
    const hasButton = await membersPage.isDisplayed(MembersPage["SEND_INVITES"], 3);
    if (hasButton) {
      await membersPage.clickSendInvites();
      const dialogOpen = await membersPage.isInviteDialogOpen();
      expect(dialogOpen).to.be.true;
    }
  });
});
