import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';
import { createDriver, quitDriver, screenshotOnFailure } from '../../setup';
import { FavoritesPage } from '../../pages/favorites.page';
import { Config } from '../../config';

describe('Favorites / Analytics @user', function () {
  let driver: WebDriver;
  let page: FavoritesPage;
  this.timeout(30000);

  before(async function () {
    this.timeout(45000);
    driver = await createDriver();
    page = new FavoritesPage(driver);

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

  it('should load the favorites page @smoke', async function () {
    await page.navigateToFavorites();
    const loaded = await page.isPageLoaded();
    expect(loaded).to.be.true;
  });

  it('should display charts or empty state', async function () {
    await page.navigateToFavorites();
    const hasCharts = await page.hasCharts();
    const hasNoFav = await page.hasNoFavorites();
    expect(hasCharts || hasNoFav).to.be.true;
  });
});
