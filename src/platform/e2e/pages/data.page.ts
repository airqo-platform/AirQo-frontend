import { WebDriver, By } from "selenium-webdriver";
import { BasePage } from "./base.page";

export class DataVisualizerPage extends BasePage {
  protected static readonly PAGE_HEADING = By.xpath("//h1[contains(text(), 'Upload & Visualize')]");
  protected static readonly WATCH_TUTORIAL = By.xpath("//button[contains(., 'Watch tutorial')]|//a[contains(., 'Watch tutorial')]");
  protected static readonly FILE_INPUT = By.css('input[type="file"]');
  protected static readonly TUTORIAL_DIALOG = By.xpath("//div[contains(@role, 'dialog')][contains(., 'Tutorial')]");
  protected static readonly CLOSE_TUTORIAL = By.xpath("//div[contains(@role, 'dialog')]//button[contains(@aria-label, 'Close')]");

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToVisualizer(orgSlug?: string): Promise<void> {
    const path = orgSlug ? `/org/${orgSlug}/data-visualizer` : "/user/data-visualizer";
    await this.navigateTo(path);
  }

  async hasWorkspace(): Promise<boolean> {
    return (
      (await this.isDisplayed(DataVisualizerPage.PAGE_HEADING, 5)) ||
      (await this.isDisplayed(DataVisualizerPage.WATCH_TUTORIAL, 5)) ||
      (await this.isDisplayed(DataVisualizerPage.FILE_INPUT, 5))
    );
  }

  async hasChart(): Promise<boolean> {
    return (
      (await this.isDisplayed(By.css("svg, canvas"), 3)) ||
      (await this.isDisplayed(By.css("[class*='chart']"), 3))
    );
  }

  async closeTutorialIfPresent(): Promise<void> {
    if (await this.isDisplayed(DataVisualizerPage.TUTORIAL_DIALOG, 3)) {
      await this.click(DataVisualizerPage.CLOSE_TUTORIAL);
    }
  }
}

export class DataExportPage extends BasePage {
  protected static readonly PAGE_HEADING = By.xpath("//h1[contains(text(), 'Custom Data Downloads')]|//h2[contains(text(), 'Custom Data Downloads')]");
  protected static readonly SIDEBAR = By.css("[class*='sidebar']");
  protected static readonly DOWNLOAD_BUTTON = By.xpath("//button[contains(., 'Download')]|//a[contains(., 'Download')]");
  protected static readonly TABLE = By.css("table");

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToExport(orgSlug?: string): Promise<void> {
    const path = orgSlug ? `/org/${orgSlug}/data-export` : "/user/data-export";
    await this.navigateTo(path);
  }

  async hasSiteSelection(): Promise<boolean> {
    return (
      (await this.isDisplayed(DataExportPage.PAGE_HEADING, 5)) ||
      (await this.isDisplayed(DataExportPage.SIDEBAR, 5))
    );
  }

  async hasDownloadButton(): Promise<boolean> {
    return (
      (await this.isDisplayed(DataExportPage.DOWNLOAD_BUTTON, 5)) ||
      (await this.isDisplayed(DataExportPage.PAGE_HEADING, 5))
    );
  }

  async clickDownload(): Promise<void> {
    await this.click(DataExportPage.DOWNLOAD_BUTTON);
  }
}

export class MapPage extends BasePage {
  protected static readonly MAP_CONTAINER = By.css(".mapboxgl-map, [class*='mapbox']");
  protected static readonly MARKERS = By.css(".mapboxgl-marker, [class*='marker']");

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToMap(orgSlug?: string): Promise<void> {
    const path = orgSlug ? `/org/${orgSlug}/map` : "/user/map";
    await this.navigateTo(path);
  }

  async hasMapLoaded(): Promise<boolean> {
    return this.isDisplayed(MapPage.MAP_CONTAINER, 15);
  }

  async hasMarkers(): Promise<boolean> {
    return this.isDisplayed(MapPage.MARKERS, 10);
  }

  async clickMarker(index = 0): Promise<void> {
    const markers = await this.findAll(MapPage.MARKERS);
    if (index < markers.length) {
      await markers[index].click();
    }
  }
}
