import { expect } from "chai";
import { WebDriver, By } from "selenium-webdriver";
import { createDriver, quitDriver, screenshotOnFailure } from "../../setup";
import { Config } from "../../config";

describe("Form Validation Edge Cases @auth", function () {
  let driver: WebDriver;
  this.timeout(30000);

  before(async function () {
    driver = await createDriver();
  });

  after(async function () {
    await quitDriver();
  });

  afterEach(async function () {
    if (this.currentTest?.state === "failed") {
      await screenshotOnFailure(this.currentTest.fullTitle());
    }
  });

  it("should show validation error for empty email on login @smoke", async function () {
    await driver.get(`${Config.BASE_URL}/user/login`);
    await new Promise((r) => setTimeout(r, 2000));
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await submitBtn.click();
    await new Promise((r) => setTimeout(r, 1000));
    const url = await driver.getCurrentUrl();
    expect(url).to.include("/login");
  });

  it("should show validation error for invalid email format on register", async function () {
    await driver.get(`${Config.BASE_URL}/user/creation/individual/register`);
    await new Promise((r) => setTimeout(r, 2000));
    const emailInput = await driver.findElement(By.css('input[placeholder="Enter your email"]'));
    await emailInput.sendKeys("not-an-email");
    const firstName = await driver.findElement(By.css('input[placeholder="Enter your first name"]'));
    await firstName.sendKeys("Test");
    const lastName = await driver.findElement(By.css('input[placeholder="Enter your last name"]'));
    await lastName.sendKeys("User");
    const password = await driver.findElement(By.css('input[placeholder="Create password"]'));
    await password.sendKeys("TestPassword123!");
    await new Promise((r) => setTimeout(r, 1000));
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    const isDisabled = await submitBtn.getAttribute("disabled");
    expect(isDisabled).to.not.be.null;
  });

  it("should reject weak password on register", async function () {
    await driver.get(`${Config.BASE_URL}/user/creation/individual/register`);
    await new Promise((r) => setTimeout(r, 2000));
    const firstName = await driver.findElement(By.css('input[placeholder="Enter your first name"]'));
    await firstName.sendKeys("Test");
    const lastName = await driver.findElement(By.css('input[placeholder="Enter your last name"]'));
    await lastName.sendKeys("User");
    const email = await driver.findElement(By.css('input[placeholder="Enter your email"]'));
    await email.sendKeys("weakpwd@test.com");
    const password = await driver.findElement(By.css('input[placeholder="Create password"]'));
    await password.sendKeys("weak");
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    const isDisabled = await submitBtn.getAttribute("disabled");
    expect(isDisabled).to.not.be.null;
  });

  it("should show password requirements hint on register", async function () {
    await driver.get(`${Config.BASE_URL}/user/creation/individual/register`);
    await new Promise((r) => setTimeout(r, 2000));
    const pageSource = await driver.getPageSource();
    expect(pageSource).to.include("Must be at least 8 characters");
  });

  it("should disable submit button when form is invalid on register", async function () {
    await driver.get(`${Config.BASE_URL}/user/creation/individual/register`);
    await new Promise((r) => setTimeout(r, 2000));
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    const isDisabled = await submitBtn.getAttribute("disabled");
    expect(isDisabled).to.not.be.null;
  });
});
