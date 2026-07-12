import { test, expect, type Page, type Locator } from "@playwright/test";
import { assertNonProductionApiTarget } from "../../support/env-guard";
import { clearPersistedQueryCache } from "../../support/app-state";
import {
  interceptImportDevice,
  interceptCohortAssignment,
  MOCK_IMPORTED_DEVICE_ID,
} from "../../support/device-mocks";

/**
 * Import External Device — single-device flow, personal context.
 *
 * Hybrid interception: navigation, auth, and data GETs (networks, cohorts)
 * run against the real backend; the two mutations (device import, cohort
 * assignment) are intercepted so runs are deterministic and create nothing.
 * The captured POST payload is the core assertion — it proves the wizard
 * carried state correctly across Device Details → Group Devices → Confirmation.
 *
 * Seeding requirements for the E2E account (documented in .env.e2e.example):
 * - personal context (active group "airqo") with DEVICE.VIEW permission
 * - at least one personal cohort
 * - at least one non-airqo sensor manufacturer (network) visible
 */

test.beforeAll(() => {
  assertNonProductionApiTarget();
});

/**
 * Navigates to My Devices and opens the import wizard on the single-device
 * path. Returns the dialog locator — the page behind the modal has its own
 * "Next" (table pagination), so all wizard interaction must be dialog-scoped.
 */
async function openSingleImportWizard(page: Page): Promise<Locator> {
  await page.goto("/devices/my-devices");

  const importButton = page.getByRole("button", { name: "Import External Device" });
  await expect(importButton).toBeVisible({ timeout: 60_000 });
  await importButton.click();

  const wizard = page.getByRole("dialog", { name: "Import External Device" });
  await expect(wizard).toBeVisible();
  await wizard.getByRole("button", { name: /Import Single Device/ }).click();
  return wizard;
}

/** Fills the required Device Details fields and returns what was entered. */
async function fillDeviceDetails(page: Page, wizard: Locator) {
  const deviceName = `e2e-import-${Date.now()}`;
  const serialNumber = `E2E-SN-${Date.now()}`;
  const connectionUrl = "https://api.example.com/v1/e2e-import-test";

  await wizard.getByLabel("Device Name").fill(deviceName);
  await wizard.getByLabel("Serial Number").fill(serialNumber);
  await wizard.getByLabel("Device Connection URL").fill(connectionUrl);

  // Sensor Manufacturer is a custom listbox (button + role=option items),
  // populated from the real networks API — pick the first available one.
  const manufacturerTrigger = wizard.getByRole("button", { name: /^Sensor Manufacturer/ });
  await expect(manufacturerTrigger).toBeEnabled({ timeout: 30_000 });
  await manufacturerTrigger.click();
  const manufacturerOption = page.getByRole("option").first();
  await expect(manufacturerOption).toBeVisible({ timeout: 30_000 });
  const manufacturer = ((await manufacturerOption.textContent()) ?? "").trim();
  await manufacturerOption.click();

  return { deviceName, serialNumber, connectionUrl, manufacturer };
}

test("imports a single external device and refreshes device data", async ({ page }) => {
  test.setTimeout(180_000);

  const importCall = await interceptImportDevice(page);
  const assignCall = await interceptCohortAssignment(page);

  // The app hydrates React Query state from persisted localStorage (carried
  // in storageState); clear it so the cohort requests we wait on must fire.
  await clearPersistedQueryCache(page);

  // The personal-cohorts GET can fire as early as page load (useMyDevices
  // shares the query), so start listening before navigating.
  const personalCohortsResponse = page.waitForResponse(
    (r) => /\/api\/users\/[^/]+\/cohorts(\?|$)/.test(r.url()) && r.request().method() === "GET",
    { timeout: 90_000 }
  );

  const wizard = await openSingleImportWizard(page);
  const entered = await fillDeviceDetails(page, wizard);

  // Moving to Group Devices triggers the scoped cohorts fetch.
  const cohortsSummaryResponse = page.waitForResponse(
    (r) =>
      r.url().includes("/api/devices/cohorts/summary") &&
      r.request().method() === "GET" &&
      r.ok(),
    { timeout: 60_000 }
  );
  await wizard.getByRole("button", { name: "Next", exact: true }).click();

  const personalCohortIds: string[] =
    ((await personalCohortsResponse.then((r) => r.json())) as { cohorts?: string[] })
      .cohorts ?? [];
  if (personalCohortIds.length === 0) {
    throw new Error(
      "The e2e account has no personal cohorts. Seed at least one cohort for this account " +
        "on staging before running this spec (see .env.e2e.example)."
    );
  }

  const summary = (await cohortsSummaryResponse.then((r) => r.json())) as {
    cohorts?: { _id: string; name: string }[];
  };
  const summaryCohorts = summary.cohorts ?? [];

  // Scoping contract: in personal context every rendered cohort option must
  // belong to the user's own cohort IDs — the client-side filter is the
  // defense against cross-organization leakage. (The ComboBox popover portals
  // to <body>, so options are page-scoped, not dialog-scoped.)
  await wizard.getByRole("combobox").click();
  const firstCohortOption = page
    .getByRole("option")
    .filter({ hasNotText: /create new cohort/i })
    .first();
  await expect(firstCohortOption).toBeVisible({ timeout: 30_000 });

  const renderedNames = (await page.getByRole("option").allTextContents())
    .map((t) => t.trim())
    .filter((t) => t && !/create new cohort/i.test(t));
  expect(renderedNames.length).toBeGreaterThan(0);

  const allowedNames = summaryCohorts
    .filter((c) => personalCohortIds.includes(c._id))
    .map((c) => c.name);
  for (const name of renderedNames) {
    expect(allowedNames).toContain(name);
  }

  // Select the first cohort and continue to Confirmation.
  const selectedCohortName = renderedNames[0];
  const selectedCohortId = summaryCohorts.find((c) => c.name === selectedCohortName)?._id;
  expect(selectedCohortId).toBeTruthy();
  await page.getByRole("option", { name: selectedCohortName, exact: true }).click();
  await wizard.getByRole("button", { name: "Next", exact: true }).click();

  // Confirmation summary must echo state gathered across earlier steps.
  await expect(wizard.getByText("Device Summary")).toBeVisible();
  await expect(wizard.getByText(entered.deviceName, { exact: true })).toBeVisible();
  await expect(wizard.getByText(entered.serialNumber, { exact: true })).toBeVisible();
  await expect(wizard.getByText(entered.manufacturer, { exact: true }).first()).toBeVisible();
  await expect(wizard.getByText(selectedCohortName, { exact: true }).first()).toBeVisible();

  // Success invalidates the myDevices query — the refetch proves the page's
  // data context refreshes. Register the waiter before completing.
  const myDevicesRefetch = page.waitForRequest(
    (r) => r.url().includes("/api/devices/my-devices") && r.method() === "GET",
    { timeout: 60_000 }
  );
  await wizard.getByRole("button", { name: "Complete", exact: true }).click();

  // Fast mode: modal closes and a success banner appears. The import and
  // cohort-assignment banners fire 300ms apart and may replace each other,
  // so accept either.
  await expect(
    page.getByText(/has been imported successfully|assigned to cohort successfully/).first()
  ).toBeVisible({ timeout: 30_000 });
  await expect(wizard).toBeHidden();
  await myDevicesRefetch;

  // The strongest assertion: the wizard assembled the mutation payload
  // correctly from three steps of dialog state.
  expect(importCall.payload()).toMatchObject({
    long_name: entered.deviceName,
    serial_number: entered.serialNumber,
    api_code: entered.connectionUrl,
    network: entered.manufacturer,
    category: "lowcost",
    authRequired: true,
    cohort_id: selectedCohortId,
  });
  expect(typeof importCall.payload().user_id).toBe("string");
  expect(importCall.payload().user_id).toBeTruthy();

  // And the follow-up assignment targeted the chosen cohort with the created device.
  expect(assignCall.url()).toContain(String(selectedCohortId));
  expect(assignCall.payload()).toMatchObject({
    device_ids: [MOCK_IMPORTED_DEVICE_ID],
  });
});

test("blocks completion until a cohort is assigned", async ({ page }) => {
  test.setTimeout(120_000);

  // Safety net: even though this test never completes the wizard, keep the
  // mutation intercepted so a regression can't write to the backend.
  const importCall = await interceptImportDevice(page);

  const wizard = await openSingleImportWizard(page);
  await fillDeviceDetails(page, wizard);
  await wizard.getByRole("button", { name: "Next", exact: true }).click();

  // On non-admin pages the cohort is mandatory.
  await expect(
    wizard.getByText("You must assign the imported device(s) to a cohort.")
  ).toBeVisible({ timeout: 30_000 });

  await wizard.getByRole("button", { name: "Next", exact: true }).click();

  await expect(wizard.getByText("Please assign the device to a cohort.")).toBeVisible();
  await expect(wizard.getByText("Device Summary")).toBeHidden();
  expect(importCall.wasCalled()).toBe(false);
});
