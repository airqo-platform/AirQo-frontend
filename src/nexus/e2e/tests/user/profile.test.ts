import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';
import { createDriver, quitDriver, screenshotOnFailure } from '../../setup';
import { ProfilePage } from '../../pages/profile.page';
import { Config } from '../../config';

describe('Profile Page @user', function () {
  let driver: WebDriver;
  let profilePage: ProfilePage;

  this.timeout(30000);

  before(async function () {
    this.timeout(45000);
    driver = await createDriver();
    profilePage = new ProfilePage(driver);

    const { LoginPage } = require('../../pages/login.page');
    const loginPage = new LoginPage(driver);
    await loginPage.navigateToLogin();
    await loginPage.login(Config.TEST_USER_EMAIL, Config.TEST_USER_PASSWORD);
    await loginPage.waitForUrlContains('/user/home');
  });

  after(async function () {
    await quitDriver();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      await screenshotOnFailure(this.currentTest.fullTitle());
    }
  });

  it('should load the profile page @smoke', async function () {
    await profilePage.navigateToProfile();
    const isDisplayed = await profilePage.isProfileFormDisplayed();
    expect(isDisplayed).to.be.true;
  });

  it('should display all tabs', async function () {
    await profilePage.navigateToProfile();
    const tabCount = await profilePage.getTabCount();
    expect(tabCount).to.be.at.least(6);
  });

  it('should have profile form fields', async function () {
    await profilePage.navigateToProfile();
    expect(await profilePage.isDisplayed(ProfilePage['FIRST_NAME'])).to.be.true;
    expect(await profilePage.isDisplayed(ProfilePage['LAST_NAME'])).to.be.true;
    expect(await profilePage.isDisplayed(ProfilePage['EMAIL'])).to.be.true;
  });

  it('should have email field disabled', async function () {
    await profilePage.navigateToProfile();
    const disabled = await profilePage.isEmailDisabled();
    expect(disabled).to.be.true;
  });

  it('should navigate to security tab', async function () {
    await profilePage.navigateToProfile();
    await profilePage.clickSecurityTab();
    const isDisplayed = await profilePage.isSecurityFormDisplayed();
    expect(isDisplayed).to.be.true;
  });

  it('should show password fields in security tab', async function () {
    await profilePage.navigateToProfile();
    await profilePage.clickSecurityTab();
    expect(await profilePage.isDisplayed(ProfilePage['CURRENT_PASSWORD'])).to.be
      .true;
    expect(await profilePage.isDisplayed(ProfilePage['NEW_PASSWORD'])).to.be
      .true;
    expect(await profilePage.isDisplayed(ProfilePage['CONFIRM_PASSWORD'])).to.be
      .true;
  });

  it('should navigate to API tab @smoke', async function () {
    await profilePage.navigateToProfile();
    await profilePage.clickApiTab();
    const url = await profilePage.getCurrentUrl();
    expect(url).to.include('/user/profile');
  });

  it('should navigate to subscription tab', async function () {
    await profilePage.navigateToProfile();
    await profilePage.clickSubscriptionTab();
    const url = await profilePage.getCurrentUrl();
    expect(url).to.include('/user/profile');
  });

  it('should navigate to theme tab', async function () {
    await profilePage.navigateToProfile();
    await profilePage.clickThemeTab();
    const url = await profilePage.getCurrentUrl();
    expect(url).to.include('/user/profile');
  });
});
