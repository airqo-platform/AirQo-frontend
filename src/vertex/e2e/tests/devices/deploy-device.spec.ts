import { test, expect, type Page, type Locator } from "@playwright/test";
import { assertNonProductionApiTarget } from "../../support/env-guard";
import { MOCK_DEVICE_DETAILS_ID } from "../../support/device-mocks";
import {
  interceptDeviceDetailsTransition,
  interceptDeployDevice,
} from "../../support/deploy-mocks";

/**
 * Device lifecycle — Deploy, personal context.
 *
 * The fixture device has no previous sites, so the wizard always takes the
 * "new site" branch (3 steps: device details -> deployment type -> location)
 * rather than the shorter "previous site" branch (2 steps). Hybrid
 * interception: navigation and auth are real; GET /api/devices/:id is a
 * stateful fixture (starts "not deployed", flips to "deployed" once the
 * deploy mutation succeeds) so the status/button swap is proven against a
 * real refetch, not a static snapshot. The deploy mutation itself is
 * intercepted so no real deployment is created.
 */

test.beforeAll(() => {
  assertNonProductionApiTarget();
});

async function openDeployWizard(page: Page): Promise<Locator> {
  await page.goto(`/devices/overview/${MOCK_DEVICE_DETAILS_ID}`);

  const deployButton = page.getByRole("button", { name: "Deploy Device" });
  await expect(deployButton).toBeEnabled({ timeout: 60_000 });
  await deployButton.click();

  const wizard = page.getByRole("dialog", { name: "Deploy device" });
  await expect(wizard).toBeVisible();
  return wizard;
}

/** Fills step 0 (Enter Device Details) and advances to step 1. */
async function fillDeviceDetailsStep(page: Page, wizard: Locator) {
  await wizard.getByRole("button", { name: "Pick a date" }).click();
  const today = String(new Date().getDate());
  await page.getByRole("gridcell", { name: today, exact: true }).click();

  await wizard.getByRole("spinbutton", { name: "Height (meters)" }).fill("3");

  await wizard.getByRole("button", { name: "Mount Type" }).click();
  await wizard.getByRole("option", { name: "Pole" }).click();

  await wizard.getByRole("button", { name: "Power Type" }).click();
  await wizard.getByRole("option", { name: "Solar" }).click();
}

test("deploys a device and flips its status from Deploy to Recall", async ({ page }) => {
  test.setTimeout(120_000);

  const transition = await interceptDeviceDetailsTransition(page);
  const deployCall = await interceptDeployDevice(page, transition.markDeployed);

  const wizard = await openDeployWizard(page);
  await fillDeviceDetailsStep(page, wizard);
  await wizard.getByRole("button", { name: "Next", exact: true }).click();

  // Deployment type: fixture has no previous sites, so this stays on "New site".
  await expect(wizard.getByText("No previous sites available for this device.")).toBeVisible();
  await wizard.getByRole("button", { name: "Next", exact: true }).click();

  // Location: coordinates mode avoids depending on a live Mapbox autocomplete/map.
  await wizard.getByRole("button", { name: "Switch to Coordinates" }).click();
  await wizard.getByRole("textbox", { name: "Latitude" }).fill("0.3476");
  await wizard.getByRole("textbox", { name: "Longitude" }).fill("32.5825");
  await wizard.getByRole("textbox", { name: "Custom Site Name" }).fill("E2E Deploy Site");

  const deployButton = wizard.getByRole("button", { name: "Deploy", exact: true });
  await expect(deployButton).toBeEnabled();

  const deviceRefetch = page.waitForResponse(
    (r) =>
      r.url().includes(`/api/devices/${MOCK_DEVICE_DETAILS_ID}`) &&
      r.request().method() === "GET",
    { timeout: 30_000 }
  );
  await deployButton.click();

  // The dialog closes immediately on success; the success banner is delayed
  // ~300ms behind it (see useBannerWithDelay), so both are asserted after close.
  await expect(wizard).toBeHidden({ timeout: 30_000 });
  await expect(
    page.getByText("e2e_deploy_device has been deployed successfully.")
  ).toBeVisible({ timeout: 30_000 });
  await deviceRefetch;

  // The button swap and the underlying status are both driven by the
  // refetched device — asserting both catches a regression in either layer.
  await expect(page.getByRole("button", { name: "Recall Device" })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByRole("button", { name: "Deploy Device" })).toBeHidden();

  expect(deployCall.payload()).toMatchObject({
    deviceName: "e2e_deploy_device",
    mountType: "pole",
    powerType: "solar",
    height: 3,
    latitude: 0.3476,
    longitude: 32.5825,
    site_name: "E2E Deploy Site",
    network: "airqo",
  });
  expect(typeof deployCall.payload().user_id).toBe("string");
  expect(deployCall.payload().user_id).toBeTruthy();
});

test("blocks advancing past device details until required fields are filled", async ({
  page,
}) => {
  test.setTimeout(90_000);

  const transition = await interceptDeviceDetailsTransition(page);
  const deployCall = await interceptDeployDevice(page, transition.markDeployed);

  const wizard = await openDeployWizard(page);

  // No date, height, mount type, or power type filled — Next must not advance.
  await wizard.getByRole("button", { name: "Next", exact: true }).click();

  await expect(
    page.getByText("Incomplete Details: Please fill in all required device details.")
  ).toBeVisible({ timeout: 30_000 });
  await expect(wizard.getByText("No previous sites available for this device.")).toBeHidden();
  expect(deployCall.wasCalled()).toBe(false);
});
