import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { BasePage } from '../../pages/base.page';
import { createDriver, quitDriver, screenshotOnFailure } from '../../setup';

describe('Home Page', function () {
  let page: BasePage;

  beforeEach(async function () {
    const driver = await createDriver();
    page = new BasePage(driver);
    await page.navigateTo('/home');
  });

  afterEach(async function () {
    await screenshotOnFailure.call(this, this.currentTest);
    await quitDriver();
  });

  it('should load with correct title containing AirQo', async function () {
    const title = await page.driver.getTitle();
    expect(title).to.include('AirQo');
  });

  it('should display the navbar', async function () {
    const displayed = await page.isDisplayed('nav');
    expect(displayed).to.be.true;
  });

  it('should display the footer', async function () {
    const displayed = await page.isDisplayed('footer');
    expect(displayed).to.be.true;
  });

  it('should have hero section visible', async function () {
    const displayed = await page.isDisplayed('[data-testid="hero-section"]');
    expect(displayed).to.be.true;
  });

  it('should have a meta description', async function () {
    const metaDesc = await page.driver.executeScript(
      'return document.querySelector("meta[name=\\"description\\"]")?.getAttribute("content")',
    );
    expect(metaDesc).to.be.a('string').and.to.have.length.greaterThan(0);
  });
});
