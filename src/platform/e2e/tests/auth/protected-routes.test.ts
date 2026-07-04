import { expect } from 'chai';
import { WebDriver, until } from 'selenium-webdriver';
import { createDriver, quitDriver, screenshotOnFailure } from '../../setup';
import { Config } from '../../config';

const WAIT_SECONDS = 5;

const waitForRedirectToLogin = async (driver: WebDriver): Promise<void> => {
  await driver.wait(until.urlContains('/login'), WAIT_SECONDS * 1000);
};

describe('Protected Routes @auth', function () {
  let driver: WebDriver;
  this.timeout(30000);

  before(async function () {
    driver = await createDriver();
  });

  after(async function () {
    await quitDriver();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      await screenshotOnFailure(this.currentTest.fullTitle());
    }
  });

  it('should redirect unauthenticated user from /user/home to login @smoke', async function () {
    await driver.get(`${Config.BASE_URL}/user/home`);
    await waitForRedirectToLogin(driver);
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('should redirect unauthenticated user from /user/profile to login', async function () {
    await driver.get(`${Config.BASE_URL}/user/profile`);
    await waitForRedirectToLogin(driver);
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('should redirect unauthenticated user from /user/favorites to login', async function () {
    await driver.get(`${Config.BASE_URL}/user/favorites`);
    await waitForRedirectToLogin(driver);
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('should redirect unauthenticated user from /user/data-visualizer to login', async function () {
    await driver.get(`${Config.BASE_URL}/user/data-visualizer`);
    await waitForRedirectToLogin(driver);
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('should redirect unauthenticated user from /user/data-export to login', async function () {
    await driver.get(`${Config.BASE_URL}/user/data-export`);
    await waitForRedirectToLogin(driver);
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('should redirect unauthenticated user from /user/map to login', async function () {
    await driver.get(`${Config.BASE_URL}/user/map`);
    await waitForRedirectToLogin(driver);
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('should show 404 for non-existent route', async function () {
    await driver.get(`${Config.BASE_URL}/this-route-does-not-exist-xyz`);
    const pageSource = await driver.getPageSource();
    const is404 =
      pageSource.toLowerCase().includes('not found') ||
      pageSource.toLowerCase().includes('404') ||
      (await driver.getCurrentUrl()).includes('not-found');
    expect(is404).to.be.true;
  });
});
