import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { BasePage } from '../../pages/base.page';
import { createDriver, quitDriver, screenshotOnFailure } from '../../setup';

describe('Header Navigation', function () {
  let basePage: BasePage;

  beforeEach(async function () {
    const driver = await createDriver();
    basePage = new BasePage(driver);
    await basePage.navigateTo('/home');
  });

  afterEach(async function () {
    await screenshotOnFailure.call(this, this.currentTest);
    await quitDriver();
  });

  it('should display the navigation bar', async function () {
    const isDisplayed = await basePage.isDisplayed('nav');
    expect(isDisplayed).to.be.true;
  });

  it('should have logo link', async function () {
    const isLogoDisplayed = await basePage.isDisplayed('nav a[href="/home"]');
    expect(isLogoDisplayed).to.be.true;
  });

  it('should have Home link', async function () {
    const isHomeLinkDisplayed = await basePage.isDisplayed('a[href="/home"]');
    expect(isHomeLinkDisplayed).to.be.true;
  });

  it('should have About link', async function () {
    const isAboutLinkDisplayed = await basePage.isDisplayed('a[href="/about"]');
    expect(isAboutLinkDisplayed).to.be.true;
  });

  it('should have Products link', async function () {
    const isProductsLinkDisplayed = await basePage.isDisplayed(
      'a[href="/products"]',
    );
    expect(isProductsLinkDisplayed).to.be.true;
  });

  it('should navigate to Home when clicking Home link', async function () {
    await basePage.click('a[href="/home"]');
    const urlContainsHome = await basePage.waitForUrlContains('/home');
    expect(urlContainsHome).to.be.true;
  });

  it('should navigate to About when clicking About link', async function () {
    await basePage.click('a[href="/about"]');
    const urlContainsAbout = await basePage.waitForUrlContains('/about');
    expect(urlContainsAbout).to.be.true;
  });
});
