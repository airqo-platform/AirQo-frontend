import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { SolutionsPage } from '../../pages/solutions.page';
import { createDriver, quitDriver, screenshotOnFailure } from '../../setup';

describe('Solutions Pages', function () {
  let solutionsPage: SolutionsPage;

  const solutionSlugs = ['communities', 'african-cities', 'research'];

  beforeEach(async function () {
    const driver = await createDriver();
    solutionsPage = new SolutionsPage(driver);
  });

  afterEach(async function () {
    await screenshotOnFailure.call(this, this.currentTest);
    await quitDriver();
  });

  for (const slug of solutionSlugs) {
    it(`/solutions/${slug} should load successfully`, async function () {
      await solutionsPage.open(slug);
      const loaded = await solutionsPage.isPageLoaded();
      expect(loaded).to.be.true;
    });
  }
});
