import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';
import { createDriver, quitDriver, screenshotOnFailure } from '../../setup';
import { RegisterPage } from '../../pages/register.page';

function generateRandomEmail(): string {
  const suffix = Math.random().toString(36).substring(2, 10);
  return `test_${suffix}@example.com`;
}

describe('Register Page @auth', function () {
  let driver: WebDriver;
  let registerPage: RegisterPage;

  this.timeout(30000);

  before(async function () {
    driver = await createDriver();
    registerPage = new RegisterPage(driver);
  });

  after(async function () {
    await quitDriver();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      await screenshotOnFailure(this.currentTest.fullTitle());
    }
  });

  it('should load the register page @smoke', async function () {
    await registerPage.navigateToRegister();
    const isDisplayed = await registerPage.isFormDisplayed();
    expect(isDisplayed).to.be.true;
  });

  it('should have all form fields', async function () {
    await registerPage.navigateToRegister();
    const count = await registerPage.getFormFieldCount();
    expect(count).to.be.at.least(4);
  });

  it('should display password hint', async function () {
    await registerPage.navigateToRegister();
    const hasHint = await registerPage.hasPasswordHint();
    expect(hasHint).to.be.true;
  });

  it('should display social auth providers', async function () {
    await registerPage.navigateToRegister();
    const hasProviders = await registerPage.hasSocialAuthProviders();
    expect(hasProviders).to.be.true;
  });

  it('should navigate to login page', async function () {
    await registerPage.navigateToRegister();
    await registerPage.clickLogin();
    await registerPage.waitForUrlContains('/login');
    const url = await registerPage.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('should register with valid data @smoke', async function () {
    await registerPage.navigateToRegister();
    const email = generateRandomEmail();
    await registerPage.register('Test', 'User', email, 'TestPassword123!');
    await registerPage.waitForUrlContains('/verify-email');
    const url = await registerPage.getCurrentUrl();
    expect(url).to.include('/verify-email');
  });

  it('should reject short password', async function () {
    await registerPage.navigateToRegister();
    await registerPage.fillForm('Test', 'User', 'test@example.com', 'short');
    await registerPage.submitRegistration();
    await new Promise(r => setTimeout(r, 2000));
    const url = await registerPage.getCurrentUrl();
    expect(url).to.include('/register');
  });
});
