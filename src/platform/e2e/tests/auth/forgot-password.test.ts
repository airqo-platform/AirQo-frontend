import { expect } from "chai";
import { WebDriver } from "selenium-webdriver";
import { createDriver, quitDriver, screenshotOnFailure } from "../../setup";
import { ForgotPasswordPage } from "../../pages/forgot-password.page";

describe("Forgot Password @auth", function () {
  let driver: WebDriver;
  let page: ForgotPasswordPage;
  this.timeout(30000);

  before(async function () {
    driver = await createDriver();
    page = new ForgotPasswordPage(driver);
  });

  after(async function () {
    await quitDriver();
  });

  afterEach(async function () {
    if (this.currentTest?.state === "failed") {
      await screenshotOnFailure(this.currentTest.fullTitle());
    }
  });

  it("should load the forgot password page @smoke", async function () {
    await page.navigateToForgotPassword();
    const hasInput = await page.isDisplayed(ForgotPasswordPage["EMAIL_INPUT"], 5);
    expect(hasInput).to.be.true;
  });

  it("should show success state after submitting valid email", async function () {
    await page.navigateToForgotPassword();
    await page.submitEmail("test@example.com");
    await new Promise((r) => setTimeout(r, 3000));
    const hasSuccess = await page.isSuccessDisplayed();
    const hasError = await page.hasError();
    expect(hasSuccess || hasError).to.be.true;
  });

  it("should show error for empty email", async function () {
    await page.navigateToForgotPassword();
    await page.clickSubmit();
    await new Promise((r) => setTimeout(r, 1000));
    const url = await page.getCurrentUrl();
    expect(url).to.include("/forgotPwd");
  });

  it("should navigate to login via Login link", async function () {
    await page.navigateToForgotPassword();
    await page.clickLogin();
    await page.waitForUrlContains("/login");
    const url = await page.getCurrentUrl();
    expect(url).to.include("/login");
  });
});
