import { test, expect, type Page, type Locator } from "@playwright/test";
import { assertNonProductionApiTarget } from "../../support/env-guard";
import {
  interceptUserDetails,
  resetAppBootState,
  rbacUser,
} from "../../support/rbac-mocks";
import { interceptPrepareBulkForShipping } from "../../support/shipping-mocks";
import { PERMISSIONS } from "../../../core/permissions/constants";

/**
 * Admin Shipping — Prepare New Batch. Permissions are transformed in flight
 * (see rbac-mocks.ts) so this doesn't depend on the seeded account's real
 * grants; the prepare-bulk mutation is mocked, other GETs stay real.
 */

test.beforeAll(() => {
  assertNonProductionApiTarget();
});

async function bootAsShippingAdmin(page: Page): Promise<void> {
  await interceptUserDetails(
    page,
    rbacUser({
      grantPersonal: [
        PERMISSIONS.SHIPPING.VIEW,
        PERMISSIONS.SHIPPING.CREATE,
        PERMISSIONS.NETWORK.VIEW,
      ],
    })
  );
  await resetAppBootState(page);
}

async function openPrepareBatchModal(page: Page): Promise<Locator> {
  await page.goto("/admin/shipping");

  const prepareButton = page.getByRole("button", { name: "Prepare New Batch" });
  await expect(prepareButton).toBeEnabled({ timeout: 60_000 });
  await prepareButton.click();

  const modal = page.getByRole("dialog", { name: "Prepare New Batch for Shipping" });
  await expect(modal).toBeVisible();
  return modal;
}

test("prepares a batch from manually added device names", async ({ page }) => {
  test.setTimeout(120_000);

  await bootAsShippingAdmin(page);
  const prepareCall = await interceptPrepareBulkForShipping(page, "2 devices prepared for shipping");

  const modal = await openPrepareBatchModal(page);
  const deviceInput = modal.getByPlaceholder(/Enter device name/);

  await deviceInput.fill("airqo_e2e_ship_1");
  await modal.getByRole("button", { name: "Add", exact: true }).click();
  await deviceInput.fill("airqo_e2e_ship_2");
  await deviceInput.press("Enter");

  // Re-adding a device already in the list is rejected rather than silently
  // deduplicated or double-counted.
  await deviceInput.fill("airqo_e2e_ship_1");
  await modal.getByRole("button", { name: "Add", exact: true }).click();
  await expect(modal.getByText("Device already added")).toBeVisible();

  await expect(modal.getByText("2 devices added")).toBeVisible();

  const batchName = `E2E Batch ${Date.now()}`;
  await modal.getByPlaceholder("Madagascar batch 01").fill(batchName);
  await modal.getByRole("radio", { name: "Hex" }).check();

  const batchesRefetch = page.waitForResponse(
    (r) => r.url().includes("/api/devices/shipping-batches") && r.request().method() === "GET",
    { timeout: 30_000 }
  );
  await modal.getByRole("button", { name: "Prepare 2 Devices" }).click();

  await expect(modal).toBeHidden({ timeout: 30_000 });
  await expect(page.getByText("2 devices prepared for shipping")).toBeVisible({
    timeout: 30_000,
  });
  await batchesRefetch;

  expect(prepareCall.payload()).toMatchObject({
    device_names: ["airqo_e2e_ship_1", "airqo_e2e_ship_2"],
    token_type: "hex",
    batch_name: batchName,
  });
});

test("prepares a batch from an imported CSV column", async ({ page }) => {
  test.setTimeout(120_000);

  await bootAsShippingAdmin(page);
  const prepareCall = await interceptPrepareBulkForShipping(page);

  const modal = await openPrepareBatchModal(page);

  const csv =
    "Serial,Device Name,Notes\n" +
    "SN-001,airqo_e2e_csv_1,ok\n" +
    "SN-002,airqo_e2e_csv_2,ok\n";
  await modal.locator('input[type="file"]').setInputFiles({
    name: "ship-devices.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csv, "utf-8"),
  });

  await expect(modal.getByText("Select Device Name Column")).toBeVisible();
  // Column 2 ("Device Name") rather than the auto-selected first column.
  await modal.getByRole("radio", { name: "Device Name" }).check();
  await modal.getByRole("button", { name: "Import Device Names" }).click();

  await expect(modal.getByText("Imported 2 devices")).toBeVisible();
  await expect(modal.getByText("2 devices added")).toBeVisible();

  const batchName = `E2E CSV Batch ${Date.now()}`;
  await modal.getByPlaceholder("Madagascar batch 01").fill(batchName);
  await modal.getByRole("button", { name: "Prepare 2 Devices" }).click();

  await expect(modal).toBeHidden({ timeout: 30_000 });

  expect(prepareCall.payload()).toMatchObject({
    device_names: ["airqo_e2e_csv_1", "airqo_e2e_csv_2"],
    batch_name: batchName,
  });
});

test("blocks preparing a batch with no devices added", async ({ page }) => {
  test.setTimeout(90_000);

  await bootAsShippingAdmin(page);
  const prepareCall = await interceptPrepareBulkForShipping(page);

  const modal = await openPrepareBatchModal(page);
  await modal.getByPlaceholder("Madagascar batch 01").fill("Empty Batch");

  const submitButton = modal.getByRole("button", { name: "Prepare 0 Devices" });
  await expect(submitButton).toBeDisabled();
  expect(prepareCall.wasCalled()).toBe(false);
});
