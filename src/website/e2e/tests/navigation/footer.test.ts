import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { FooterPage } from '../../pages/footer.page';
import { BasePage } from '../../pages/base.page';
import { createDriver, quitDriver, screenshotOnFailure } from '../../setup';

describe('Footer', function () {
  let footer: FooterPage;

  beforeEach(async function () {
    const driver = await createDriver();
    footer = new FooterPage(driver);
    await footer.navigateTo('/home');
  });

  afterEach(async function () {
    await screenshotOnFailure.call(this, this.currentTest);
    await quitDriver();
  });

  it('should display the footer on home page', async function () {
    const displayed = await footer.isFooterDisplayed();
    expect(displayed).to.be.true;
  });

  it('should contain product links', async function () {
    const links = await footer.getFooterLinks();
    const productLinks = links.filter((l) => l.includes('/products/'));
    expect(productLinks).to.not.be.empty;
  });

  it('should contain solution links', async function () {
    const links = await footer.getFooterLinks();
    const solutionLinks = links.filter((l) => l.includes('/solutions/'));
    expect(solutionLinks).to.not.be.empty;
  });

  it('should contain company/about links', async function () {
    const links = await footer.getFooterLinks();
    const aboutLinks = links.filter(
      (l) => l.includes('/about-us') || l.includes('/careers'),
    );
    expect(aboutLinks).to.not.be.empty;
  });

  it('should not display footer on /contact page', async function () {
    const base = new BasePage(footer.driver);
    await base.navigateTo('/contact');
    const displayed = await footer.isFooterDisplayed();
    expect(displayed).to.be.false;
  });
});
