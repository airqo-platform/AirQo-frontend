import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { By } from 'selenium-webdriver';

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
      By.css('nav .hidden.lg\\:flex button'),
    );
    const labels: string[] = [];
    for (const btn of dropdowns) {
      const text = await btn.getText();
      if (text) labels.push(text.trim());
    }
    expect(labels).to.include('Products');
    expect(labels).to.include('Solutions');
    expect(labels).to.include('Developers');
    expect(labels).to.include('Resources');
    expect(labels).to.include('About AirQo');
  });

  it('should expose technical documentation from Resources', async function () {
    await navbar.clickNavLink('Resources');
    expect(await navbar.isDropdownItemDisplayed('/resources?tab=technical')).to
      .be.true;
  });

  it('should open every desktop dropdown on hover and close after leaving', async function () {
    const menuTitles = [
      'Products',
      'Solutions',
      'Developers',
      'Resources',
      'About AirQo',
    ];
    const exploreLink = await navbar.driver.findElement(
      By.css('nav a[href="/explore-data"]'),
    );

    for (const title of menuTitles) {
      const menuId = `site-nav-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const trigger = await navbar.driver.findElement(
        By.css(`nav button[aria-controls="${menuId}"]`),
      );

      await navbar.driver.actions().move({ origin: trigger }).perform();
      await navbar.driver.wait(
        async () => (await trigger.getAttribute('aria-expanded')) === 'true',
        3000,
      );

      const dropdown = await navbar.driver.findElement(By.id(menuId));
      expect(await dropdown.isDisplayed()).to.be.true;

      const firstLink = await dropdown.findElement(By.css('a'));
      await navbar.driver.actions().move({ origin: firstLink }).perform();
      expect(await trigger.getAttribute('aria-expanded')).to.equal('true');
    }

    await navbar.driver.actions().move({ origin: exploreLink }).perform();
    await navbar.driver.wait(async () => {
      for (const title of menuTitles) {
        const menuId = `site-nav-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        const trigger = await navbar.driver.findElement(
          By.css(`nav button[aria-controls="${menuId}"]`),
        );
        if ((await trigger.getAttribute('aria-expanded')) === 'true') {
          return false;
        }
      }
      return true;
    }, 3000);
  });

  it('should expose products from Products', async function () {
    await navbar.clickNavLink('Products');
    expect(await navbar.isDropdownItemDisplayed('/products/monitor')).to.be
      .true;
  });

  it('should expose city solutions from Solutions', async function () {
    await navbar.clickNavLink('Solutions');
    expect(await navbar.isDropdownItemDisplayed('/solutions/african-cities')).to
      .be.true;
  });

  it('should expose About AirQo links from About AirQo', async function () {
    await navbar.clickNavLink('About AirQo');
    expect(await navbar.isDropdownItemDisplayed('/about-us')).to.be.true;
  });

  it('should keep only the selected navigation dropdown open', async function () {
    await navbar.clickNavLink('Products');
    expect(await navbar.isMenuExpanded('Products')).to.be.true;

    await navbar.clickNavLink('Resources');
    expect(await navbar.isMenuExpanded('Resources')).to.be.true;
    expect(await navbar.isMenuExpanded('Products')).to.be.false;
  });

  it('should close a dropdown after following a resource link', async function () {
    await navbar.clickNavLink('Resources');
    await navbar.clickDropdownItem('/resources?tab=technical');

    expect(await navbar.waitForUrlContains('tab=technical')).to.be.true;
    expect(await navbar.isMenuExpanded('Resources')).to.be.false;
    expect(await navbar.isDropdownItemDisplayed('/resources?tab=technical')).to
      .be.false;
  });

  it('should sync the Resources tab when navigating between dropdown links', async function () {
    await navbar.clickNavLink('Resources');
    await navbar.clickDropdownItem('/resources?tab=technical');
    expect(await navbar.waitForUrlContains('tab=technical')).to.be.true;
    expect(await navbar.isResourceTabSelected('Technical Reports')).to.be.true;

    await navbar.clickNavLink('Resources');
    await navbar.clickDropdownItem('/resources?tab=research');
    expect(await navbar.waitForUrlContains('tab=research')).to.be.true;
    expect(await navbar.isResourceTabSelected('Research Publications')).to.be
      .true;

    await navbar.clickNavLink('Resources');
    await navbar.clickDropdownItem('/resources?tab=guide,manual');
    expect(await navbar.waitForUrlContains('tab=guide')).to.be.true;
    expect(await navbar.isResourceTabSelected('Guides and Manuals')).to.be.true;
  });

  it('should close a dropdown on Escape and return focus to its trigger', async function () {
    await navbar.clickNavLink('Resources');
    await navbar.pressEscape();

    expect(await navbar.isMenuExpanded('Resources')).to.be.false;
    expect(await navbar.isFocusOnMenuTrigger('Resources')).to.be.true;
  });

  it('should navigate from a Resource link in the mobile drawer', async function () {
    await navbar.setViewport(534, 844);
    await navbar.openMobileNavigation();
    await navbar.clickMobileMenu('Resources');
    await navbar.clickMobileDropdownItem('/resources?tab=technical');

    expect(await navbar.waitForUrlContains('tab=technical', 30000)).to.be.true;
    expect(await navbar.isResourceTabSelected('Technical Reports')).to.be.true;
    expect(await navbar.isMobileNavigationDisplayed()).to.be.false;
  });

  it('should link Africa Clean Air Forum to the official annual forum page', async function () {
    await navbar.clickNavLink('About AirQo');
    const forumLink = await navbar.driver.findElement(
      By.css(
        '#site-nav-about-airqo a[href="https://cleanairafrica.org/about-the-annual-forum/"]',
      ),
    );
    expect(await navbar.isMenuExpanded('About AirQo')).to.be.true;
    expect(await forumLink.isDisplayed()).to.be.true;
    expect(await forumLink.getAttribute('target')).to.equal('_blank');
    expect(await forumLink.getAttribute('rel')).to.include('noopener');
  });

  it('should show the official forum link in the network coverage navigation drawer', async function () {
    await navbar.setViewport(534, 844);
    await navbar.navigateTo('/solutions/network-coverage');
    await navbar.click('button[aria-label="Open site navigation"]');

    const aboutSection = await navbar.driver.findElement(
      By.xpath(
        "//div[@role='dialog']//button[@aria-controls='nav-section-About AirQo']",
      ),
    );
    await aboutSection.click();

    const forumLink = await navbar.driver.findElement(
      By.css(
        '[role="dialog"] a[href="https://cleanairafrica.org/about-the-annual-forum/"]',
      ),
    );
    await navbar.driver.wait(async () => {
      const isExpanded =
        (await aboutSection.getAttribute('aria-expanded')) === 'true';
      const isAnimationComplete = await navbar.driver.executeScript(
        'const section = document.getElementById("nav-section-About AirQo"); return section && Math.abs(section.getBoundingClientRect().height - section.scrollHeight) <= 1',
      );
      return isExpanded && isAnimationComplete;
    }, 3000);
    await navbar.driver.executeScript(
      'arguments[0].scrollIntoView({ block: "center" })',
      forumLink,
    );
    await navbar.driver.wait(() => forumLink.isDisplayed(), 3000);
    expect(await forumLink.isDisplayed()).to.be.true;
    expect(await forumLink.getAttribute('target')).to.equal('_blank');
    expect(await forumLink.getAttribute('rel')).to.include('noopener');
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
