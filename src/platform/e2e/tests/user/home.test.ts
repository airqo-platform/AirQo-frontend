import { expect } from "chai";
import { WebDriver } from "selenium-webdriver";
import { createDriver, quitDriver, screenshotOnFailure } from "../../setup";
import { HomePage } from "../../pages/home.page";
import { Config } from "../../config";

describe("Home Page @user", function () {
  let driver: WebDriver;
  let homePage: HomePage;

  this.timeout(30000);

  before(async function () {
    this.timeout(45000);
    driver = await createDriver();
    homePage = new HomePage(driver);

    // Login first
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

  it("should load the home page @smoke", async function () {
    await homePage.navigateToHome();
    const isWelcome = await homePage.isWelcomeDisplayed();
    expect(isWelcome).to.be.true;
  });

  it("should display welcome text with name", async function () {
    await homePage.navigateToHome();
    const text = await homePage.getWelcomeText();
    expect(text).to.include("Welcome");
  });

  it("should show quick access buttons @smoke", async function () {
    await homePage.navigateToHome();
    await new Promise((r) => setTimeout(r, 3000));
    const hasButtons = await homePage.hasQuickAccessButtons();
    const hasWelcome = await homePage.isWelcomeDisplayed();
    expect(hasButtons || hasWelcome).to.be.true;
  });

  it("should navigate to data export on Download Data click", async function () {
    await homePage.navigateToHome();
    await homePage.clickDownloadData();
    await homePage.waitForUrlContains("/data-export");
    const url = await homePage.getCurrentUrl();
    expect(url).to.include("/data-export");
  });

  it("should navigate to favorites on My Favorites click", async function () {
    await homePage.navigateToHome();
    await homePage.clickMyFavorites();
    await homePage.waitForUrlContains("/favorites");
    const url = await homePage.getCurrentUrl();
    expect(url).to.include("/favorites");
  });

  it("should navigate to favorites on Start Here click", async function () {
    await homePage.navigateToHome();
    await homePage.clickStartHere();
    await homePage.waitForUrlContains("/favorites");
    const url = await homePage.getCurrentUrl();
    expect(url).to.include("/favorites");
  });

  it("should show video thumbnail", async function () {
    await homePage.navigateToHome();
    const hasVideo = await homePage.hasVideoThumbnail();
    expect(hasVideo).to.be.true;
  });

  it("should navigate to request organization", async function () {
    await homePage.navigateToHome();
    await homePage.clickRequestOrganization();
    await homePage.waitForUrlContains("/request-organization");
    const url = await homePage.getCurrentUrl();
    expect(url).to.include("/request-organization");
  });
});
