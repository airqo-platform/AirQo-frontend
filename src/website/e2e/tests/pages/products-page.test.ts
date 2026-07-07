import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { ProductsPage } from '../../pages/products.page';
import { BasePage } from '../../pages/base.page';
import { createDriver, quitDriver, screenshotOnFailure } from '../../setup';

describe('Products Pages', function () {
  let productsPage: ProductsPage;
  let basePage: BasePage;

  const productSlugs = ['vertex', 'monitor', 'analytics', 'api'];

  beforeEach(async function () {
    const driver = await createDriver();
    productsPage = new ProductsPage(driver);
    basePage = new BasePage(driver);
  });

  afterEach(async function () {
    await screenshotOnFailure.call(this, this.currentTest);
    await quitDriver();
  });

  for (const slug of productSlugs) {
    it(`/products/${slug} should load successfully`, async function () {
      await productsPage.open(slug);
      const loaded = await productsPage.isPageLoaded();
      expect(loaded).to.be.true;
    });
  }

  it('each product page should have a title', async function () {
    await productsPage.open('vertex');
    const title = await productsPage.getPageTitle();
    expect(title).to.not.be.empty;
  });

  it('should navigate back to products listing from product page', async function () {
    await productsPage.open('vertex');
    const url = await basePage.driver.getCurrentUrl();
    expect(url).to.include('/products/vertex');
  });
});
