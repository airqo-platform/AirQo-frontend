import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { BasePage } from '../../pages/base.page';
import { createDriver, quitDriver, screenshotOnFailure } from '../../setup';

describe('Page Transitions', function () {
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

  it('should navigate from home to products and back', async function () {
    const homeUrl = await page.driver.getCurrentUrl();
    expect(homeUrl).to.include('/home');

    await page.navigateTo('/products');
    const url2 = await page.driver.getCurrentUrl();
    expect(url2).to.include('/products');

    await page.driver.navigate().back();
    await page.driver.sleep(500);
    const url3 = await page.driver.getCurrentUrl();
    expect(url3).to.include('/home');
  });

  it('should navigate from home to about and back', async function () {
    await page.navigateTo('/about-us');
    const url1 = await page.driver.getCurrentUrl();
    expect(url1).to.include('/about-us');

    await page.driver.navigate().back();
    await page.driver.sleep(500);
    const url2 = await page.driver.getCurrentUrl();
    expect(url2).to.not.include('/about-us');
  });

  it('browser back button should work', async function () {
    await page.navigateTo('/products/vertex');
    const url1 = await page.driver.getCurrentUrl();
    expect(url1).to.include('/products/vertex');

    await page.driver.navigate().back();
    await page.driver.sleep(500);
    const url2 = await page.driver.getCurrentUrl();
    expect(url2).to.not.include('/products/vertex');
  });

  it('URL should update correctly on navigation', async function () {
    await page.navigateTo('/blogs');
    const url = await page.driver.getCurrentUrl();
    expect(url).to.include('/blogs');
  });
});
