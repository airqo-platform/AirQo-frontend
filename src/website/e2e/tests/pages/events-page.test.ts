import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { EventsPage } from '../../pages/events.page';
import { createDriver, quitDriver, screenshotOnFailure } from '../../setup';

describe('Events Page', function () {
  let eventsPage: EventsPage;

  beforeEach(async function () {
    const driver = await createDriver();
    eventsPage = new EventsPage(driver);
    await eventsPage.open();
  });

  afterEach(async function () {
    await screenshotOnFailure.call(this, this.currentTest);
    await quitDriver();
  });

  it('/events should load successfully', async function () {
    const loaded = await eventsPage.isPageLoaded();
    expect(loaded).to.be.true;
  });

  it('should display navigation bar', async function () {
    const displayed = await eventsPage.isDisplayed('nav');
    expect(displayed).to.be.true;
  });

  it('should display event cards section', async function () {
    const cards = await eventsPage.getEventCards();
    expect(cards).to.be.an('array');
  });
});
