import 'mocha';
import { expect } from 'chai';
import { Builder, WebDriver, By, until, Browser, Key } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { Config } from '../../config';

/**
 * End-to-end coverage for the new Air Quality Rankings and Air Quality
 * Analytics pages (plus the underlying group chart configuration flows).
 * Self-contained: creates a chart, exercises every setting, then deletes it.
 */

const BASE = Config.BASE_URL;
const EMAIL = Config.TEST_USER_EMAIL;
const PASSWORD = Config.TEST_USER_PASSWORD;
const CHART_TITLE = `E2E Test Chart ${Date.now()}`;

describe('Air Quality pages (end-to-end)', function () {
  this.timeout(180_000);

  let driver: WebDriver;
  let browserLogs: string[] = [];

  before(async () => {
    const options = new chrome.Options();
    options.addArguments('--window-size=1920,1080');
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--headless=new');
    options.setLoggingPrefs({ browser: 'ALL' });
    driver = await new Builder()
      .forBrowser(Browser.CHROME)
      .setChromeOptions(options)
      .build();
    await driver.manage().setTimeouts({ implicit: 15_000, pageLoad: 60_000 });

    // Login up-front so any subset of tests can run; retry on transient
    // network failures against the staging API.
    let loggedIn = false;
    for (let attempt = 1; attempt <= 3 && !loggedIn; attempt++) {
      try {
        await login();
        loggedIn = true;
      } catch (error) {
        console.log(`\nLogin attempt ${attempt} failed: ${(error as Error).message}`);
        if (attempt === 3) throw error;
        await driver.sleep(5000);
      }
    }

    // Remove any leftover E2E charts from previous runs so the page starts clean
    await driver.get(`${BASE}/user/air-quality/analytics`);
    await driver.wait(until.elementLocated(By.xpath("//h1[contains(normalize-space(), 'Air Quality Analytics')]")), 60_000);
    await driver.sleep(2000);
    for (let round = 0; round < 6; round++) {
      const hasLeftover = await driver.executeScript(
        `return [...document.querySelectorAll('h3')].some(h => h.innerText.includes('E2E Test Chart'));`
      );
      if (!hasLeftover) break;
      await driver.executeScript(`
        const title = [...document.querySelectorAll('h3')].find(h => h.innerText.includes('E2E Test Chart'));
        const tileRoot = title?.closest('div')?.parentElement?.parentElement?.parentElement;
        [...(tileRoot?.querySelectorAll('button') || [])].find(b => b.innerText.trim() === 'More')?.click();
      `);
      await driver.sleep(700);
      await driver.executeScript(`
        const del = [...document.querySelectorAll('[role="menu"] button')].find(b => b.innerText.trim() === 'Delete chart');
        del && del.click();
      `);
      await driver.sleep(700);
      await driver.executeScript(`
        const yes = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'Yes, delete');
        yes && yes.click();
      `);
      await driver.sleep(2000);
    }
  });

  after(async () => {
    if (driver) await driver.quit();
    // Surface any real console errors collected during the run (ignore known dev noise)
    const noise = /Download the React DevTools|Extra attributes from the server|preloaded using link preload/;
    const real = browserLogs.filter(
      l => l.includes('SEVERE') && !noise.test(l)
    );
    if (real.length > 0) {
      console.log('\n=== BROWSER CONSOLE ERRORS ===');
      real.forEach(l => console.log(l.slice(0, 500)));
    }
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed' && driver) {
      try {
        const dump = await driver.executeScript(`
          const dialogs = [...document.querySelectorAll('div[role="dialog"]')].map(d => d.querySelector('h2')?.innerText ?? '(no h2)');
          const overlay = document.querySelector('nextjs-portal')?.innerText || '';
          const bodyText = document.body.innerText || '';
          return JSON.stringify({
            url: location.pathname,
            dialogs,
            overlay: overlay.slice(0, 2000),
            bodyText: bodyText.slice(0, 1500),
          });
        `);
        console.log(`\n[AFTER-FAIL DUMP] ${dump}`);
      } catch {
        /* page gone */
      }
    }
  });

  // â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const find = (by: By, timeout = 20) =>
    driver.wait(until.elementLocated(by), timeout * 1000);
  const click = async (by: By, timeout = 20) => {
    const el = await driver.wait(
      until.elementIsVisible(await find(by, timeout)),
      timeout * 1000
    );
    try {
      await el.click();
    } catch {
      await driver.executeScript('arguments[0].click();', el);
    }
  };
  const text = async (by: By, timeout = 20) =>
    (await find(by, timeout)).getText();
  const type = async (by: By, value: string, timeout = 20) => {
    const el = await find(by, timeout);
    await el.clear();
    await el.sendKeys(value);
  };
  const visible = async (by: By, timeout = 10) => {
    try {
      await driver.wait(until.elementIsVisible(await find(by, timeout)), timeout * 1000);
      return true;
    } catch {
      return false;
    }
  };
  const jsClick = (by: By) => driver.findElement(by).then(el => driver.executeScript('arguments[0].click();', el));
  const screenshot = (name: string) =>
    driver.takeScreenshot().then(img => {
      const fs = require('fs');
      const dir = require('path').resolve(__dirname, '../screenshots');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(require('path').join(dir, `${name}.png`), img, 'base64');
    });
  const assertNoRawIds = async (label: string) => {
    const body = await driver.findElement(By.css('body')).getText();
    const ids = body.match(/\b[0-9a-f]{24}\b/g) ?? [];
    expect(ids, `${label}: raw object ids visible on page`).to.have.length(0);
  };
  const captureLogs = async () => {
    try {
      const logs = await driver.manage().logs().get('browser');
      logs.forEach(l => browserLogs.push(`[${l.level.name}] ${l.message}`));
    } catch {
      /* logging unavailable */
    }
  };
  const waitFor = async (by: By, timeout = 30) => {
    await driver.wait(until.elementLocated(by), timeout * 1000);
    await driver.wait(until.elementIsVisible(await find(by, 5)), timeout * 1000);
  };
  // Wait for the chart-config dialog body to be fully rendered (dev-mode
  // compiles can lag: the header h2 appears before the form fields).
  const waitForDialogReady = async () => {
    try {
      await waitFor(By.xpath("//div[@role='dialog']//h2"), 45);
      await waitFor(
        By.xpath("//div[@role='dialog']//input[@placeholder='e.g. PM2.5 levels across Kampala']"),
        45
      );
      await waitFor(
        By.xpath("//div[@role='dialog']//input[@placeholder='e.g. Hourly PM2.5 for selected sites']"),
        45
      );
    } catch (error) {
      const dump = await driver.executeScript(`
        const dlg = document.querySelector('div[role="dialog"]');
        if (!dlg) return 'NO DIALOG IN DOM';
        return JSON.stringify({
          h2: dlg.querySelector('h2')?.innerText ?? null,
          inputs: [...dlg.querySelectorAll('input')].map(i => i.placeholder || i.getAttribute('aria-label') || i.type),
          dialogs: document.querySelectorAll('div[role="dialog"]').length,
        });
      `);
      console.log(`\n[DIALOG DUMP on failure]\n${dump}\n`);
      throw error;
    }
  };

  // â”€â”€ login â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const login = async () => {
    await driver.get(`${BASE}/user/login`);
    await waitFor(By.css('input[type="email"]'));
    await type(By.css('input[type="email"]'), EMAIL);
    await click(By.css('button[type="submit"]'));
    await waitFor(By.css('input[type="password"]'));
    await type(By.css('input[type="password"]'), PASSWORD);
    await click(By.css('button[type="submit"]'));
    await driver.wait(until.urlContains('/user/home'), 60_000);
    await captureLogs();
  };

  // â”€â”€ Rankings page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  it('Rankings: renders live leaderboard with legend, filters, summary cards and table', async () => {
    await driver.get(`${BASE}/user/air-quality/rankings`);
    await waitFor(By.xpath("//h1[contains(normalize-space(), 'Air Quality Rankings')]"), 60);

    // Page-level AQI legend with ranges
    expect(await visible(By.xpath("//button[contains(., 'AQI legend')]"))).to.be.true;
    expect(await visible(By.xpath("//*[normalize-space()='Good']"))).to.be.true;
    expect(await visible(By.xpath("//*[normalize-space()='Hazardous']"))).to.be.true;

    // Tabs
    expect(await visible(By.xpath("//*[@role='radio' and normalize-space()='Live rankings']"))).to.be.true;
    expect(await visible(By.xpath("//*[@role='radio' and normalize-space()='Historical comparison']"))).to.be.true;

    // Filters
    expect(await visible(By.xpath("//*[@role='radio' and normalize-space()='Country']"))).to.be.true;
    expect(await visible(By.xpath("//*[@role='radio' and normalize-space()='City']"))).to.be.true;
    expect(await visible(By.xpath("//*[@role='radio' and normalize-space()='Worst first']"))).to.be.true;
    expect(await visible(By.xpath("//select[@aria-label='Number of entries']"))).to.be.true;

    // Summary cards
    await waitFor(By.xpath("//*[normalize-space()='Most polluted']"), 30);
    expect(await visible(By.xpath("//*[normalize-space()='Cleanest air']"))).to.be.true;
    expect(await visible(By.xpath("//*[normalize-space()='Locations ranked']"))).to.be.true;

    // Leaderboard table with rows
    await waitFor(By.xpath("//h2[contains(normalize-space(), 'Live rankings')]"), 30);
    const rows = await driver.findElements(By.xpath("//h2[contains(normalize-space(), 'Live rankings')]/ancestor::div[1]/following-sibling::div//tbody/tr"));
    expect(rows.length).to.be.greaterThan(0);

    await captureLogs();
  });

  it('Rankings: level/sort/limit filters update the table', async () => {
    await driver.get(`${BASE}/user/air-quality/rankings`);
    await waitFor(By.xpath("//h2[contains(normalize-space(), 'Live rankings')]"), 60);

    // Switch to City
    await click(By.xpath("//*[@role='radio' and normalize-space()='City']"));
    await driver.sleep(2000);
    const cityRows = await driver.findElements(By.xpath("//h2[contains(normalize-space(), 'Live rankings')]/ancestor::div[1]/following-sibling::div//tbody/tr"));
    expect(cityRows.length).to.be.greaterThan(0);

    // Switch to Cleanest first
    await click(By.xpath("//*[@role='radio' and normalize-space()='Cleanest first']"));
    await driver.sleep(2000);
    const firstCell = await text(By.xpath("//h2[contains(normalize-space(), 'Live rankings')]/ancestor::div[1]/following-sibling::div//tbody/tr[1]/td[2]"));
    expect(firstCell.trim().length).to.be.greaterThan(0);

    // Change limit to Top 10
    await click(By.xpath("//select[@aria-label='Number of entries']"));
    await driver.findElement(By.xpath("//select[@aria-label='Number of entries']/option[normalize-space()='Top 10']")).click();
    await driver.sleep(2000);
    const top10Rows = await driver.findElements(By.xpath("//h2[contains(normalize-space(), 'Live rankings')]/ancestor::div[1]/following-sibling::div//tbody/tr"));
    expect(top10Rows.length).to.be.greaterThan(0);
    expect(top10Rows.length).to.be.at.most(10);

    await captureLogs();
  });

  it('Rankings: historical comparison tab renders year filters, chart and table', async () => {
    await driver.get(`${BASE}/user/air-quality/rankings`);
    await waitFor(By.xpath("//*[@role='radio' and normalize-space()='Historical comparison']"), 60);
    await click(By.xpath("//*[@role='radio' and normalize-space()='Historical comparison']"));

    // Year range selects (SelectField buttons show the current year values)
    await waitFor(By.xpath("//button[normalize-space()='2024' or normalize-space()='2026']"), 45);
    expect(await visible(By.xpath("//button[normalize-space()='2024']"))).to.be.true;
    expect(await visible(By.xpath("//button[normalize-space()='2026']"))).to.be.true;
    await waitFor(By.xpath("//h2[contains(normalize-space(), 'Year-by-year comparison')]"), 45);
    // Chart title is a CardTitle (h3), not h2
    expect(await visible(By.xpath("//h3[contains(normalize-space(), 'PM2.5 trends by year')]"))).to.be.true;

    const table = await driver.findElements(By.xpath("//h2[contains(normalize-space(), 'Year-by-year comparison')]/ancestor::div[2]//table/tbody/tr"));
    expect(table.length).to.be.greaterThan(0);

    await captureLogs();
  });

  // â”€â”€ Analytics page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  it('Analytics: page renders with view switcher, legend and add-chart affordance', async () => {
    await driver.get(`${BASE}/user/air-quality/analytics`);
    await waitFor(By.xpath("//h1[contains(normalize-space(), 'Air Quality Analytics')]"), 60);
    await waitFor(By.xpath("//button[normalize-space()='Add chart']"), 30);

    // The AQI legend renders once charts exist; the empty state shows the CTA
    const hasCharts = await visible(By.xpath("//*[@role='radio' and normalize-space()='Grid view']"), 5);
    if (hasCharts) {
      expect(await visible(By.xpath("//*[@role='radio' and normalize-space()='Full view']"))).to.be.true;
      expect(await visible(By.xpath("//*[@role='radio' and normalize-space()='Compare table']"))).to.be.true;
      expect(await visible(By.xpath("//button[contains(., 'AQI legend')]"))).to.be.true;
    } else {
      expect(await visible(By.xpath("//*[contains(normalize-space(), 'No charts yet')]"))).to.be.true;
    }

    await captureLogs();
  });

  it('Analytics: add chart dialog exposes every configuration setting', async () => {
    await driver.get(`${BASE}/user/air-quality/analytics`);
    await waitFor(By.xpath("//h1[contains(normalize-space(), 'Air Quality Analytics')]"), 60);

    // Open the add-chart dialog (empty state CTA or header button)
    await click(By.xpath("//button[normalize-space()='Add chart']"));
    await waitForDialogReady();

    // Title + subtitle inputs
    expect(await visible(By.xpath("//div[@role='dialog']//input[@placeholder='e.g. PM2.5 levels across Kampala']"))).to.be.true;
    expect(await visible(By.xpath("//div[@role='dialog']//input[@placeholder='e.g. Hourly PM2.5 for selected sites']"))).to.be.true;

    // Selects
    expect(await visible(By.xpath("//div[@role='dialog']//button[normalize-space()='PM2.5']"))).to.be.true;
    expect(await visible(By.xpath("//div[@role='dialog']//button[normalize-space()='Daily']"))).to.be.true;
    expect(await visible(By.xpath("//div[@role='dialog']//button[normalize-space()='Line']"))).to.be.true;

    // Date range picker
    expect(await visible(By.xpath("//div[@role='dialog']//button[contains(., '-')]"))).to.be.true;

    // Series color: Default + presets + custom
    expect(await visible(By.xpath("//div[@role='dialog']//button[normalize-space()='Default']"))).to.be.true;
    const colorButtons = await driver.findElements(By.xpath("//div[@role='dialog']//button[starts-with(@aria-label,'Use color')]"));
    expect(colorButtons.length).to.be.greaterThan(0);
    // input[type=color] reports isDisplayed=false in headless Selenium despite
    // being rendered — assert presence + functionality instead
    const customColorInputs = await driver.findElements(By.xpath("//div[@role='dialog']//input[@aria-label='Custom series color']"));
    expect(customColorInputs.length).to.be.greaterThan(0);

    // Toggles
    expect(await visible(By.xpath("//div[@role='dialog']//*[normalize-space()='Show legend']"))).to.be.true;
    expect(await visible(By.xpath("//div[@role='dialog']//*[normalize-space()='Show grid']"))).to.be.true;
    expect(await visible(By.xpath("//div[@role='dialog']//*[normalize-space()='Show tooltips']"))).to.be.true;

    // Sites picker with server-side search/pagination
    expect(await visible(By.xpath("//div[@role='dialog']//*[@role='radio' and normalize-space()='Sites']"))).to.be.true;
    expect(await visible(By.xpath("//div[@role='dialog']//*[@role='radio' and normalize-space()='Devices']"))).to.be.true;

    // Save disabled until title + site selected
    const saveBtn = await find(By.xpath("//div[@role='dialog']//button[normalize-space()='Add chart']"));
    expect(await saveBtn.isEnabled()).to.be.false;

    await captureLogs();
  });

  it('Analytics: create a chart with two sites and verify the tile renders', async () => {
    await driver.get(`${BASE}/user/air-quality/analytics`);
    await waitFor(By.xpath("//h1[contains(normalize-space(), 'Air Quality Analytics')]"), 60);
    await click(By.xpath("//button[normalize-space()='Add chart']"));
    await waitForDialogReady();

    // Title + subtitle
    await type(
      By.xpath("//div[@role='dialog']//input[@placeholder='e.g. PM2.5 levels across Kampala']"),
      CHART_TITLE
    );
    await type(
      By.xpath("//div[@role='dialog']//input[@placeholder='e.g. Hourly PM2.5 for selected sites']"),
      'E2E subtitle'
    );

    // Change pollutant to PM10 to verify the select works
    await click(By.xpath("//div[@role='dialog']//button[normalize-space()='PM2.5']"));
    await click(By.xpath("//div[@role='dialog']//*[@role='option' and normalize-space()='PM10']"));
    expect(await visible(By.xpath("//div[@role='dialog']//button[normalize-space()='PM10']"))).to.be.true;

    // Change chart type to Area
    await click(By.xpath("//div[@role='dialog']//button[normalize-space()='Line']"));
    await click(By.xpath("//div[@role='dialog']//*[@role='option' and normalize-space()='Area']"));

    // Pick a color preset
    await click(By.xpath("//div[@role='dialog']//button[starts-with(@aria-label,'Use color')][2]"));

    // Select two sites from the sites table (sequential clicks like a user)
    await waitFor(By.xpath("//div[@role='dialog']//input[starts-with(@aria-label,'Select item')]"), 30);
    const checkboxes = await driver.findElements(
      By.xpath("//div[@role='dialog']//input[starts-with(@aria-label,'Select item')]")
    );
    expect(checkboxes.length).to.be.greaterThan(0);
    for (let i = 0; i < Math.min(2, checkboxes.length); i++) {
      await driver.executeScript(
        `const box = document.querySelector('div[role="dialog"] input[aria-label^="Select item"]:not(:checked)');
         if (box) box.click();`
      );
      await driver.sleep(300);
    }
    // Selected count reflects both sites
    await waitFor(By.xpath("//div[@role='dialog']//*[contains(normalize-space(), 'Selected (2)')]"), 15);

    // Save
    const saveBtn = await find(By.xpath("//div[@role='dialog']//button[normalize-space()='Add chart']"));
    await driver.wait(until.elementIsEnabled(saveBtn), 15_000);
    await click(By.xpath("//div[@role='dialog']//button[normalize-space()='Add chart']"));

    // Tile appears with title
    await waitFor(By.xpath(`//h3[normalize-space()='${CHART_TITLE}']`), 45);
    expect(await visible(By.xpath(`//h3[normalize-space()='${CHART_TITLE}']`))).to.be.true;

    // More menu present with all CTAs
    await click(By.xpath(`//h3[normalize-space()='${CHART_TITLE}']/ancestor::div[2]//button[normalize-space()='More']`));
    expect(await visible(By.xpath("//*[@role='menu']//button[normalize-space()='Edit chart']"))).to.be.true;
    expect(await visible(By.xpath("//*[@role='menu']//button[normalize-space()='Delete chart']"))).to.be.true;
    expect(await visible(By.xpath("//*[@role='menu']//button[contains(., 'Edit title')]"))).to.be.true;
    expect(await visible(By.xpath("//*[@role='menu']//button[normalize-space()='Refresh Data']"))).to.be.true;
    expect(await visible(By.xpath("//*[@role='menu']//button[normalize-space()='Export as PDF']"))).to.be.true;
    expect(await visible(By.xpath("//*[@role='menu']//button[normalize-space()='Export as PNG']"))).to.be.true;

    // Menu closes when an item is clicked (no overlay stacking)
    await click(By.xpath("//*[@role='menu']//button[normalize-space()='Edit chart']"));
    await waitFor(By.xpath("//div[@role='dialog']//h2[normalize-space()='Edit chart configuration']"), 30);
    const menuStillOpen = await visible(By.xpath("//*[@role='menu']//button[normalize-space()='Edit chart']"), 3);
    expect(menuStillOpen).to.be.false;

    // Edit dialog pre-selects the saved sites (2)
    await waitFor(By.xpath("//div[@role='dialog']//*[contains(normalize-space(), 'Selected (2)')]"), 15);
    // Cancel the edit
    await click(By.xpath("//div[@role='dialog']//button[normalize-space()='Cancel']"));

    // Forecast collapsible section
    await driver.executeScript(`window.scrollTo(0, document.body.scrollHeight)`);
    const forecastBtn = await find(By.xpath(`//h3[normalize-space()='${CHART_TITLE}']/ancestor::div[4]//button[contains(., 'Forecast')]`), 15);
    await forecastBtn.click();
    await waitFor(By.xpath("//h3[normalize-space()='Air Quality Forecast']"), 20);
    expect(await visible(By.xpath("//button[normalize-space()='daily']"))).to.be.true;
    expect(await visible(By.xpath("//button[normalize-space()='hourly']"))).to.be.true;

    await captureLogs();
  });

  it('Analytics: inline title edit persists from the chart header', async () => {
    await driver.get(`${BASE}/user/air-quality/analytics`);
    await waitFor(By.xpath(`//h3[normalize-space()='${CHART_TITLE}']`), 60);

    await click(By.xpath(`//h3[normalize-space()='${CHART_TITLE}']/ancestor::div[2]//button[normalize-space()='More']`));
    await click(By.xpath("//*[@role='menu']//button[contains(., 'Edit title')]"));

    // Inline editor replaces the header (no dialog)
    await waitFor(By.xpath("//input[@aria-label='Chart title']"), 20);
    await type(By.xpath("//input[@aria-label='Chart title']"), `${CHART_TITLE} (edited)`);
    await click(By.xpath("//button[normalize-space()='Save']"));

    await waitFor(By.xpath(`//h3[normalize-space()='${CHART_TITLE} (edited)']`), 30);

    await captureLogs();
  });

  it('Analytics: view modes â€” full view and comparison table', async () => {
    await driver.get(`${BASE}/user/air-quality/analytics`);
    await waitFor(By.xpath(`//h3[contains(normalize-space(), '${CHART_TITLE}')]`), 60);

    // Full view
    await click(By.xpath("//*[@role='radio' and normalize-space()='Full view']"));
    await driver.sleep(1500);
    expect(await visible(By.xpath(`//h3[contains(normalize-space(), '${CHART_TITLE}')]`))).to.be.true;

    // Compare table
    await click(By.xpath("//*[@role='radio' and normalize-space()='Compare table']"));
    await waitFor(By.xpath("//h2[contains(normalize-space(), 'Location comparison')]"), 30);
    expect(await visible(By.xpath("//select[@aria-label='Comparison pollutant']"))).to.be.true;

    // Table rows exist (sites from the chart)
    const rows = await driver.findElements(By.xpath("//h2[contains(normalize-space(), 'Location comparison')]/ancestor::div[3]//tbody/tr"));
    expect(rows.length).to.be.greaterThan(0);

    // Sort by PM2.5 column
    await click(By.xpath("//h2[contains(normalize-space(), 'Location comparison')]/ancestor::div[3]//button[contains(., 'PM2.5')]"));
    await driver.sleep(1000);

    // No raw ids anywhere
    await assertNoRawIds('analytics comparison table');

    // Back to grid
    await click(By.xpath("//*[@role='radio' and normalize-space()='Grid view']"));
    await waitFor(By.xpath(`//h3[contains(normalize-space(), '${CHART_TITLE}')]`), 15);

    await captureLogs();
  });

  it('Analytics: delete chart with inline confirmation', async () => {
    await driver.get(`${BASE}/user/air-quality/analytics`);
    await waitFor(By.xpath(`//h3[contains(normalize-space(), '${CHART_TITLE}')]`), 60);

    // Arm the inline delete confirmation via the tile's More menu (scoped to
    // this chart's tile — executeScript approach proven by the cleanup script)
    const armDelete = `
      const title = [...document.querySelectorAll('h3')].find(h => h.innerText.includes('${CHART_TITLE}'));
      const tileRoot = title?.closest('div')?.parentElement?.parentElement?.parentElement;
      [...(tileRoot?.querySelectorAll('button') || [])].find(b => b.innerText.trim() === 'More')?.click();
    `;
    await driver.executeScript(armDelete);
    await driver.sleep(700);
    await driver.executeScript(`
      const del = [...document.querySelectorAll('[role="menu"] button')].find(b => b.innerText.trim() === 'Delete chart');
      del && del.click();
    `);

    // Menu closes and the tile shows an inline confirm strip
    await waitFor(By.xpath(`//h3[contains(normalize-space(), '${CHART_TITLE}')]/ancestor::div[4]//*[normalize-space()='Delete this chart?']`), 15);
    const menuStillOpen = await visible(By.xpath("//*[@role='menu']//button[normalize-space()='Delete chart']"), 3);
    expect(menuStillOpen).to.be.false;

    // Cancel keeps the chart
    await driver.executeScript(`
      const title = [...document.querySelectorAll('h3')].find(h => h.innerText.includes('${CHART_TITLE}'));
      const tileRoot = title?.closest('div')?.parentElement?.parentElement?.parentElement;
      [...(tileRoot?.querySelectorAll('button') || [])].find(b => b.innerText.trim() === 'Keep chart')?.click();
    `);
    await driver.sleep(1000);
    expect(await visible(By.xpath(`//h3[contains(normalize-space(), '${CHART_TITLE}')]`))).to.be.true;

    // Delete for real
    await driver.executeScript(armDelete);
    await driver.sleep(700);
    await driver.executeScript(`
      const del = [...document.querySelectorAll('[role="menu"] button')].find(b => b.innerText.trim() === 'Delete chart');
      del && del.click();
    `);
    await driver.sleep(700);
    await driver.executeScript(`
      const yes = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'Yes, delete');
      yes && yes.click();
    `);

    // Chart disappears
    await driver.sleep(4000);
    const stillThere = await visible(By.xpath(`//h3[contains(normalize-space(), '${CHART_TITLE}')]`), 3);
    expect(stillThere).to.be.false;

    await captureLogs();
  });
});



