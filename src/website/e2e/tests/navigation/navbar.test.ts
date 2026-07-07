import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { NavbarPage } from '../../pages/navbar.page';
import { createDriver, quitDriver, screenshotOnFailure } from '../../setup';

describe('Navbar', function () {
  let navbar: NavbarPage;

  beforeEach(async function () {
    const driver = await createDriver();
    navbar = new NavbarPage(driver);
    await navbar.navigateTo('/home');
  });

  afterEach(async function () {
    await screenshotOnFailure.call(this, this.currentTest);
    await quitDriver();
  });

  it('should display the navbar on home page', async function () {
    const displayed = await navbar.isNavbarDisplayed();
    expect(displayed).to.be.true;
  });

  it('should display the logo', async function () {
    const displayed = await navbar.isLogoDisplayed();
    expect(displayed).to.be.true;
  });

  it('should have logo linking to /home', async function () {
    const logoLink = await navbar.find('nav a[href="/home"]');
    const href = await logoLink.getAttribute('href');
    expect(href).to.include('/home');
  });

  it('should have main nav dropdown menus', async function () {
    const dropdowns = await navbar.driver.findElements(
      By.css('nav .hidden.md\\:flex button'),
    );
    const labels: string[] = [];
    for (const btn of dropdowns) {
      const text = await btn.getText();
      if (text) labels.push(text.trim());
    }
    expect(labels).to.include('Products');
    expect(labels).to.include('Solutions');
    expect(labels).to.include('About');
    expect(labels).to.include('Developers');
  });

  it('should have Blogs link', async function () {
    const blogsLink = await navbar.find('nav a[href="/blogs"]');
    expect(blogsLink).to.not.be.null;
  });

  it('should navigate to /products when clicking Products', async function () {
    await navbar.clickNavLink('Products');
    const url = await navbar.driver.getCurrentUrl();
    expect(url).to.include('/products');
  });

  it('should navigate to /solutions when clicking Solutions', async function () {
    await navbar.clickNavLink('Solutions');
    const url = await navbar.driver.getCurrentUrl();
    expect(url).to.include('/solutions');
  });

  it('should navigate to /about-us when clicking About', async function () {
    await navbar.clickNavLink('About');
    const url = await navbar.driver.getCurrentUrl();
    expect(url).to.include('/about');
  });

  it('should have navbar on products page', async function () {
    await navbar.navigateTo('/products/vertex');
    const displayed = await navbar.isNavbarDisplayed();
    expect(displayed).to.be.true;
  });

  it('should have navbar on about-us page', async function () {
    await navbar.navigateTo('/about-us');
    const displayed = await navbar.isNavbarDisplayed();
    expect(displayed).to.be.true;
  });
});
