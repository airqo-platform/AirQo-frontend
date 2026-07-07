import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { ContactPage } from '../../pages/contact.page';
import { createDriver, quitDriver, screenshotOnFailure } from '../../setup';

describe('Contact Page', function () {
  let contactPage: ContactPage;

  beforeEach(async function () {
    const driver = await createDriver();
    contactPage = new ContactPage(driver);
    await contactPage.open();
  });

  afterEach(async function () {
    await screenshotOnFailure.call(this, this.currentTest);
    await quitDriver();
  });

  it('/contact should load successfully', async function () {
    const loaded = await contactPage.isPageLoaded();
    expect(loaded).to.be.true;
  });

  it('should display contact options', async function () {
    const displayed = await contactPage.isFormDisplayed();
    expect(displayed).to.be.true;
  });

  it('should display navigation bar', async function () {
    const displayed = await contactPage.isDisplayed('nav');
    expect(displayed).to.be.true;
  });

  it('should not display footer', async function () {
    const displayed = await contactPage.isDisplayed('footer');
    expect(displayed).to.be.false;
  });
});
