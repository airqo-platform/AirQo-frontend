import fs from "fs";
import { test, expect, type Page, type Locator } from "@playwright/test";
import { assertNonProductionApiTarget } from "../../support/env-guard";
import {
  interceptBulkImport,
  interceptCohortAssignment,
  allSucceed,
} from "../../support/device-mocks";

/**
 * Import External Device — bulk/CSV flow, personal context.
 *
 * Same hybrid-interception approach as the single-device spec: real auth,
 * navigation, and data GETs; POST /devices/soft/bulk and the cohort
 * assignment are intercepted. Field labels double as CSV headers via the
 * downloadable template, and the auto-mapper must map all of them.
 *
 * Seeding requirements are the same as the single-device spec
 * (see .env.e2e.example).
 */

// Keep in sync with EXPECTED_FIELDS labels in
// components/features/devices/import-steps/types.ts — the template contract.
const TEMPLATE_HEADERS = [
  "Device Name",
  "Serial Number",
  "Authentication Required",
  "Latitude",
  "Longitude",
  "Device Connection URL",
  "Description",
  "Device Number",
];

function buildCsv(rows: Array<Record<string, string>>): string {
  const lines = rows.map((row) =>
    TEMPLATE_HEADERS.map((header) => row[header] ?? "").join(",")
  );
  return [TEMPLATE_HEADERS.join(","), ...lines].join("\n") + "\n";
}

function twoDeviceCsv() {
  const stamp = Date.now();
  const devices = [1, 2].map((n) => ({
    "Device Name": `e2e-bulk-${stamp}-${n}`,
    "Serial Number": `E2E-BULK-SN-${stamp}-${n}`,
    "Authentication Required": "yes",
    "Device Connection URL": `https://api.example.com/v1/e2e-bulk-${n}`,
  }));
  return { devices, csv: buildCsv(devices) };
}

test.beforeAll(() => {
  assertNonProductionApiTarget();
});

async function openBulkImportWizard(page: Page): Promise<Locator> {
  await page.goto("/devices/my-devices");

  const importButton = page.getByRole("button", { name: "Import External Device" });
  await expect(importButton).toBeVisible({ timeout: 60_000 });
  await importButton.click();

  const wizard = page.getByRole("dialog", { name: "Import External Device" });
  await expect(wizard).toBeVisible();
  await wizard.getByRole("button", { name: /Import Multiple Devices/ }).click();
  return wizard;
}

/** Uploads CSV content, picks the first real manufacturer, and returns its name. */
async function uploadCsvAndSelectManufacturer(
  page: Page,
  wizard: Locator,
  csv: string,
  fileName: string
): Promise<string> {
  await wizard.locator("#bulk_file").setInputFiles({
    name: fileName,
    mimeType: "text/csv",
    buffer: Buffer.from(csv, "utf-8"),
  });
  // The chosen file name renders once parsing kicked off — a deterministic
  // signal that clicking Next won't race the CSV parse.
  await expect(wizard.getByText(fileName)).toBeVisible();

  const manufacturerTrigger = wizard.getByRole("button", { name: /^Sensor Manufacturer/ });
  await expect(manufacturerTrigger).toBeEnabled({ timeout: 30_000 });
  await manufacturerTrigger.click();
  const manufacturerOption = page.getByRole("option").first();
  await expect(manufacturerOption).toBeVisible({ timeout: 30_000 });
  const manufacturer = ((await manufacturerOption.textContent()) ?? "").trim();
  await manufacturerOption.click();
  return manufacturer;
}

/** Walks Map Fields → Preview → cohort selection → Confirmation. */
async function advanceToConfirmation(page: Page, wizard: Locator, deviceCount: number) {
  await wizard.getByRole("button", { name: "Next", exact: true }).click();
  await expect(
    wizard.getByText(`We found ${deviceCount} devices in your file.`)
  ).toBeVisible();

  await wizard.getByRole("button", { name: "Next", exact: true }).click();
  await wizard.getByRole("button", { name: "Next", exact: true }).click();

  const firstCohortOption = page
    .getByRole("option")
    .filter({ hasNotText: /create new cohort/i })
    .first();
  await wizard.getByRole("combobox").click();
  await expect(firstCohortOption).toBeVisible({ timeout: 30_000 });
  await firstCohortOption.click();
  await wizard.getByRole("button", { name: "Next", exact: true }).click();

  await expect(
    wizard.getByText(`You are about to import ${deviceCount} devices.`)
  ).toBeVisible();
}

test("provides a CSV template whose columns all auto-map", async ({ page }) => {
  test.setTimeout(180_000);

  const wizard = await openBulkImportWizard(page);

  // Download the template and verify its header contract.
  const downloadEvent = page.waitForEvent("download");
  await wizard.getByRole("button", { name: "Download CSV template" }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("vertex-device-import-template.csv");

  const templateContent = fs.readFileSync((await download.path())!, "utf-8");
  const [headerLine, exampleLine] = templateContent.trimEnd().split("\n");
  expect(headerLine).toBe(TEMPLATE_HEADERS.join(","));
  expect(exampleLine).toContain("Example Device 1");

  // Round-trip: upload the template itself and every column must auto-map.
  await uploadCsvAndSelectManufacturer(
    page,
    wizard,
    templateContent,
    "vertex-device-import-template.csv"
  );
  await wizard.getByRole("button", { name: "Next", exact: true }).click();
  await expect(wizard.getByText("We found 1 devices in your file.")).toBeVisible();

  for (const header of TEMPLATE_HEADERS) {
    await expect(wizard.getByLabel(`Map ${header}`)).toHaveValue(header);
  }

  // And the mapped example row survives into the preview.
  await wizard.getByRole("button", { name: "Next", exact: true }).click();
  await expect(wizard.getByText("Example Device 1")).toBeVisible();
});

test("imports multiple devices from a CSV file", async ({ page }) => {
  test.setTimeout(180_000);

  const bulkCall = await interceptBulkImport(page, allSucceed);
  const assignCall = await interceptCohortAssignment(page);
  const { devices, csv } = twoDeviceCsv();

  const wizard = await openBulkImportWizard(page);
  const manufacturer = await uploadCsvAndSelectManufacturer(page, wizard, csv, "devices.csv");
  await advanceToConfirmation(page, wizard, devices.length);

  const myDevicesRefetch = page.waitForRequest(
    (r) => r.url().includes("/api/devices/my-devices") && r.method() === "GET",
    { timeout: 60_000 }
  );
  await wizard.getByRole("button", { name: "Complete", exact: true }).click();

  await expect(
    page
      .getByText(/device\(s\) imported successfully|assigned to cohort successfully/)
      .first()
  ).toBeVisible({ timeout: 30_000 });
  await expect(wizard).toBeHidden();
  await myDevicesRefetch;

  const payload = bulkCall.payload();
  expect(typeof payload.user_id).toBe("string");
  expect(payload.network_override).toBe(manufacturer);
  expect(typeof payload.cohort_id).toBe("string");

  const sentDevices = payload.devices as Array<Record<string, unknown>>;
  expect(sentDevices).toHaveLength(devices.length);
  devices.forEach((device, index) => {
    expect(sentDevices[index]).toMatchObject({
      long_name: device["Device Name"],
      serial_number: device["Serial Number"],
      api_code: device["Device Connection URL"],
      network: manufacturer,
      category: "lowcost",
      authRequired: true,
    });
  });

  // Both mock-created devices get assigned to the chosen cohort.
  expect(assignCall.url()).toContain(String(payload.cohort_id));
  expect(assignCall.payload()).toMatchObject({
    device_ids: ["e2e-mock-bulk-device-1", "e2e-mock-bulk-device-2"],
  });
});

test("shows per-row results when part of the import fails", async ({ page }) => {
  test.setTimeout(180_000);

  const failureMessage = "Duplicate serial number";
  await interceptBulkImport(page, (devices) =>
    devices.map((device, index) =>
      index === 0
        ? allSucceed([device])[0]
        : {
            success: false,
            long_name: String(device.long_name ?? ""),
            serial_number: String(device.serial_number ?? ""),
            error: failureMessage,
          }
    )
  );
  const assignCall = await interceptCohortAssignment(page);
  const { devices, csv } = twoDeviceCsv();

  const wizard = await openBulkImportWizard(page);
  await uploadCsvAndSelectManufacturer(page, wizard, csv, "devices.csv");
  await advanceToConfirmation(page, wizard, devices.length);
  await wizard.getByRole("button", { name: "Complete", exact: true }).click();

  // Partial failure keeps the dialog open on the per-row results view.
  await expect(wizard.getByText("Partial Import Success")).toBeVisible({ timeout: 30_000 });
  await expect(
    wizard.getByText("1 of 2 devices imported. 1 failed.")
  ).toBeVisible({ timeout: 30_000 });
  await expect(wizard.getByText(failureMessage)).toBeVisible();
  await expect(wizard.getByText(devices[1]["Device Name"])).toBeVisible();

  // Only the successful device is assigned to the cohort.
  expect(assignCall.payload()).toMatchObject({
    device_ids: ["e2e-mock-bulk-device-1"],
  });
});
