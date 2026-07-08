import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { CareersPage } from '../../pages/careers.page';
import { createDriver, quitDriver, screenshotOnFailure } from '../../setup';

describe('Careers Page', function () {
  let careersPage: CareersPage;

  beforeEach(async function () {
    const driver = await createDriver();
    careersPage = new CareersPage(driver);
    await careersPage.open();
  });

  afterEach(async function () {
    await screenshotOnFailure.call(this, this.currentTest);
    await quitDriver();
  });

  it('/careers should load successfully', async function () {
    const loaded = await careersPage.isPageLoaded();
    expect(loaded).to.be.true;
  });

  it('should display navigation bar', async function () {
    const displayed = await careersPage.isDisplayed('nav');
    expect(displayed).to.be.true;
  });

  it('should display job listings section', async function () {
    const listings = await careersPage.getJobListings();
    expect(listings).to.be.an('array');
  });
});
