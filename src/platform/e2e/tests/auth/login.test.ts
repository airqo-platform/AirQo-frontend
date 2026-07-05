import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';
import { createDriver, quitDriver, screenshotOnFailure } from '../../setup';
import { LoginPage } from '../../pages/login.page';
import { Config } from '../../config';

describe('Login Page @auth', function () {
  let driver: WebDriver;
  let loginPage: LoginPage;

  this.timeout(30000);

  before(async function () {
    this.timeout(45000);
    driver = await createDriver();
    loginPage = new LoginPage(driver);
  });

  after(async function () {
    await quitDriver();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      await screenshotOnFailure(this.currentTest.fullTitle());
    }
  });

  it('should load the login page @smoke', async function () {
    await loginPage.navigateToLogin();
    const isEmailStep = await loginPage.isEmailStep();
    expect(isEmailStep).to.be.true;
  });

  it('should show two-step login flow', async function () {
    await loginPage.navigateToLogin();
    await loginPage.enterEmail(Config.TEST_USER_EMAIL);
    await loginPage.clickContinue();
    const isPasswordStep = await loginPage.isPasswordStep();
    expect(isPasswordStep).to.be.true;
  });

  it('should login with valid credentials @smoke', async function () {
    await loginPage.navigateToLogin();
    await loginPage.login(Config.TEST_USER_EMAIL, Config.TEST_USER_PASSWORD);
    await loginPage.waitForUrlContains('/user/home');
    const url = await loginPage.getCurrentUrl();
    expect(url).to.include('/user/home');
  });

  it('should toggle password visibility', async function () {
    await loginPage.navigateToLogin();
    await loginPage.enterEmail(Config.TEST_USER_EMAIL);
    await loginPage.clickContinue();
    await loginPage.isPasswordStep();

    let isVisible = await loginPage.isPasswordVisible();
    expect(isVisible).to.be.false;

    await loginPage.togglePasswordVisibility();
    isVisible = await loginPage.isPasswordVisible();
    expect(isVisible).to.be.true;
  });

  it('should navigate to register page', async function () {
    await loginPage.navigateToLogin();
    await loginPage.clickRegister();
    await loginPage.waitForUrlContains('/register');
    const url = await loginPage.getCurrentUrl();
    expect(url).to.include('/register');
  });

  it('should navigate to forgot password page', async function () {
    await loginPage.navigateToLogin();
    await loginPage.enterEmail(Config.TEST_USER_EMAIL);
    await loginPage.clickContinue();
    await loginPage.isPasswordStep();
    await loginPage.clickForgotPassword();
    await loginPage.waitForUrlContains('/forgotPwd');
    const url = await loginPage.getCurrentUrl();
    expect(url).to.include('/forgotPwd');
  });

  it('should display social auth providers', async function () {
    await loginPage.navigateToLogin();
    const hasProviders = await loginPage.hasSocialAuthProviders();
    expect(hasProviders).to.be.true;
  });

  it('should stay on login with invalid credentials', async function () {
    await loginPage.navigateToLogin();
    await loginPage.login('nonexistent@example.com', 'WrongPassword123!');
    await new Promise(r => setTimeout(r, 3000));
    const url = await loginPage.getCurrentUrl();
    expect(url).to.include('/login');
  });
});
