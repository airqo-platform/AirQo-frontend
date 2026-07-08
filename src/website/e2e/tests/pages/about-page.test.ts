import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { AboutPage } from '../../pages/about.page';
import { createDriver, quitDriver, screenshotOnFailure } from '../../setup';

describe('About Page', function () {
  let aboutPage: AboutPage;

  beforeEach(async function () {
    const driver = await createDriver();
    aboutPage = new AboutPage(driver);
    await aboutPage.open();
  });

  afterEach(async function () {
    await screenshotOnFailure.call(this, this.currentTest);
    await quitDriver();
  });

  it('/about-us should load successfully', async function () {
    const loaded = await aboutPage.isPageLoaded();
    expect(loaded).to.be.true;
  });

  it('should have content sections', async function () {
    const hasContent = await aboutPage.isTeamSectionDisplayed();
    expect(hasContent).to.be.true;
  });

  it('should display navigation bar', async function () {
    const displayed = await aboutPage.isDisplayed('nav');
    expect(displayed).to.be.true;
  });
});
