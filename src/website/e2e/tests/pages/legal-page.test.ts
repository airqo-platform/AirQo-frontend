import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { LegalPage } from '../../pages/legal.page';
import { BasePage } from '../../pages/base.page';
import { createDriver, quitDriver, screenshotOnFailure } from '../../setup';

describe('Legal Pages', function () {
  let legalPage: LegalPage;

  const legalSlugs = ['terms-of-service', 'privacy-policy', 'cookies'];

  beforeEach(async function () {
    const driver = await createDriver();
    legalPage = new LegalPage(driver);
  });

  afterEach(async function () {
    await screenshotOnFailure.call(this, this.currentTest);
    await quitDriver();
  });

  for (const slug of legalSlugs) {
    it(`/legal/${slug} should load successfully`, async function () {
      await legalPage.open(slug);
      const loaded = await legalPage.isPageLoaded();
      expect(loaded).to.be.true;
    });
  }

  it('should display legal tabs', async function () {
    await legalPage.open('terms-of-service');
    const tabs = await legalPage.getTabLinks();
    expect(tabs).to.include('Terms of Service');
    expect(tabs).to.include('Privacy Policy');
    expect(tabs).to.include('Cookies Policy');
  });

  it('should navigate between tabs', async function () {
    await legalPage.open('terms-of-service');
    await legalPage.clickTab('Privacy Policy');
    const url = await legalPage.driver.getCurrentUrl();
    expect(url).to.include('/legal/privacy-policy');
  });
});
