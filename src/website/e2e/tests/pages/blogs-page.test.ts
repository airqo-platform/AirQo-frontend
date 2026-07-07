import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { BlogsPage } from '../../pages/blogs.page';
import { BasePage } from '../../pages/base.page';
import { createDriver, quitDriver, screenshotOnFailure } from '../../setup';

describe('Blogs Page', function () {
  let blogsPage: BlogsPage;

  beforeEach(async function () {
    const driver = await createDriver();
    blogsPage = new BlogsPage(driver);
    await blogsPage.open();
  });

  afterEach(async function () {
    await screenshotOnFailure.call(this, this.currentTest);
    await quitDriver();
  });

  it('/blogs should load successfully', async function () {
    const loaded = await blogsPage.isPageLoaded();
    expect(loaded).to.be.true;
  });

  it('should have page title', async function () {
    const title = await blogsPage.driver.getTitle();
    expect(title).to.not.be.empty;
  });

  it('should have navigation bar', async function () {
    const displayed = await blogsPage.isDisplayed('nav');
    expect(displayed).to.be.true;
  });
});
