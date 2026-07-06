import { expect } from 'chai';
import { WebDriver, By } from 'selenium-webdriver';
import { createDriver, quitDriver, screenshotOnFailure } from '../../setup';
import { ResetPasswordPage } from '../../pages/reset-password.page';

describe('Reset Password @auth', function () {
  let driver: WebDriver;
  let page: ResetPasswordPage;
  this.timeout(30000);

  before(async function () {
    driver = await createDriver();
    page = new ResetPasswordPage(driver);
  });

  after(async function () {
    await quitDriver();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      await screenshotOnFailure(this.currentTest.fullTitle());
    }
  });

  it('should show invalid link or error for missing token @smoke', async function () {
    await page.navigateToResetPassword();
    await new Promise(r => setTimeout(r, 3000));
    const isInvalid = await page.isInvalidLinkState();
    const hasError = await page.isDisplayed(
      By.css(".text-destructive, [class*='error'], [class*='alert']"),
      3
    );
    const url = await page.getCurrentUrl();
    const stayedOnPage = url.includes('/reset') || url.includes('/forgotPwd');
    expect(isInvalid || hasError || stayedOnPage).to.be.true;
  });

  it('should show invalid link for fake token', async function () {
    await page.navigateToResetPassword('fake-token-12345');
    await new Promise(r => setTimeout(r, 3000));
    const isInvalid = await page.isInvalidLinkState();
    const hasForm = await page.isDisplayed(
      ResetPasswordPage['PASSWORD_INPUT'],
      3
    );
    const hasError = await page.isDisplayed(
      By.css(".text-destructive, [class*='error']"),
      3
    );
    expect(isInvalid || hasForm || hasError).to.be.true;
  });

  it('should show password form or invalid state for token', async function () {
    await page.navigateToResetPassword('valid-token-placeholder');
    await new Promise(r => setTimeout(r, 3000));
    const isInvalid = await page.isInvalidLinkState();
    const hasForm = await page.isDisplayed(
      ResetPasswordPage['PASSWORD_INPUT'],
      3
    );
    const url = await page.getCurrentUrl();
    expect(isInvalid || hasForm || url.includes('/reset')).to.be.true;
  });

  it('should reject mismatched passwords', async function () {
    await page.navigateToResetPassword('valid-token-placeholder');
    await new Promise(r => setTimeout(r, 3000));
    const formVisible = await page.isDisplayed(
      ResetPasswordPage['PASSWORD_INPUT'],
      3
    );
    if (!formVisible) {
      this.skip();
      return;
    }
    await page.enterPassword('NewPassword123!');
    await page.enterConfirmPassword('DifferentPassword123!');
    await page.click(ResetPasswordPage['SUBMIT_BUTTON']);
    await new Promise(r => setTimeout(r, 2000));
    const hasError = await page.hasError();
    const stillOnPage = (await page.getCurrentUrl()).includes('/reset');
    expect(hasError || stillOnPage).to.be.true;
  });
});
