import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';
import { createDriver, quitDriver, screenshotOnFailure } from '../../setup';
import { HomePage } from '../../pages/home.page';
import { LoginPage } from '../../pages/login.page';
import { Config } from '../../config';

/**
 * Opt-in coverage for the adaptive homepage. The default suite keeps asserting
 * the checklist homepage while NEXT_PUBLIC_HOME_V2_ENABLED is false.
 *
 * Run against a build that has the homepage enabled. Set E2E_HOME_DEMO=true
 * only when the app under test is a non-production build, since the
 * `?homeDemo=` states are ignored in production builds.
 */
const homeV2Enabled = process.env.E2E_HOME_V2 === 'true';
const homeDemoEnabled = process.env.E2E_HOME_DEMO === 'true';

(homeV2Enabled ? describe : describe.skip)('Adaptive home @user', function () {
  let driver: WebDriver;
  let homePage: HomePage;

  this.timeout(30000);

  before(async function () {
    this.timeout(45000);
    driver = await createDriver();
    homePage = new HomePage(driver);

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

  it('renders the discovery homepage when the v2 flag is enabled', async function () {
    await homePage.navigateToHome();
    expect(await homePage.isAdaptiveHome()).to.equal(true);
  });

  (homeDemoEnabled ? it : it.skip)(
    'opens returning demo artifacts without writing them',
    async function () {
      await homePage.navigateTo('/user/home?homeDemo=returning');
      expect(await homePage.hasText('Continue your work')).to.equal(true);
      expect(await homePage.hasText('Updates from your places')).to.equal(true);
    }
  );

  (homeDemoEnabled ? it : it.skip)(
    'keeps the error demo usable',
    async function () {
      await homePage.navigateTo('/user/home?homeDemo=error');
      expect(
        await homePage.hasText('Some personalized updates are unavailable')
      ).to.equal(false);
      expect(await homePage.isAdaptiveHome()).to.equal(true);
    }
  );

  const outcomes: Array<[string, string]> = [
    ['Compare places', '/user/air-quality/analytics'],
    ['Analyze trends', '/user/air-quality/analytics'],
    ['Explore a location', '/user/map'],
    ['Visualize my data', '/user/data-visualizer'],
    ['Export data', '/user/data-export'],
    ['Compare cities and countries', '/user/air-quality/rankings'],
  ];

  outcomes.forEach(([label, href]) => {
    it(`opens ${label}`, async function () {
      await homePage.navigateToHome();
      await homePage.openOutcome(label);
      await homePage.waitForUrlContains(href);
      expect(await homePage.getCurrentUrl()).to.include(href);
    });
  });
});
