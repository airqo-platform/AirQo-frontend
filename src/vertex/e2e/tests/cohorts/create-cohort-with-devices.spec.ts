import { test, expect, type Page } from "@playwright/test";
import { assertNonProductionApiTarget } from "../../support/env-guard";
import { interceptCohortAssignment } from "../../support/device-mocks";
import {
  interceptCreateCohort,
  interceptCohortOwnerAssignment,
  interceptCohortDetails,
  MOCK_CREATED_COHORT_ID,
} from "../../support/cohort-create-mocks";

/**
 * "Create New Cohort" in AssignCohortDevicesDialog's cohort ComboBox closes
 * it and opens CreateCohortDialog with the selected devices preselected.
 * Proves that hand-off survives end to end.
 */

test.beforeAll(() => {
  assertNonProductionApiTarget();
});

/** Selects one device row (not "select all") and opens the Add-to-Cohort dialog. */
async function openAssignDialogWithSelectedDevices(page: Page) {
  await page.goto("/devices/overview");

  const firstRowCheckbox = page.getByRole("row").nth(1).getByRole("checkbox");
  await expect(firstRowCheckbox).toBeVisible({ timeout: 60_000 });
  await firstRowCheckbox.check();

  const addToCohort = page.getByRole("button", { name: "Add to Cohort" });
  await expect(addToCohort).toBeVisible();
  await addToCohort.click();

  const dialog = page.getByRole("dialog", { name: "Add devices to cohort" });
  await expect(dialog).toBeVisible();
  return dialog;
}

test("creating a cohort from within Assign Devices carries the device selection over and closes both dialogs", async ({
  page,
}) => {
  test.setTimeout(120_000);

  const createCall = await interceptCreateCohort(page);
  const assignCall = await interceptCohortAssignment(page);
  await interceptCohortOwnerAssignment(page);
  await interceptCohortDetails(page, MOCK_CREATED_COHORT_ID, {
    name: "E2E Devices Cohort",
  });

  const assignDialog = await openAssignDialogWithSelectedDevices(page);

  const selectedCountText = await assignDialog.getByText(/device\(s\) selected/).textContent();
  const selectedDeviceCount = Number(selectedCountText?.match(/^(\d+)/)?.[1] ?? "0");
  expect(selectedDeviceCount).toBeGreaterThan(0);

  await test.step("Create New Cohort from the cohort ComboBox hands off to the wizard", async () => {
    // "Create New Cohort" is a custom action inside the cohort combobox's
    // popover, queried unscoped since its portal renders to document.body,
    // outside the dialog's own DOM subtree.
    await assignDialog.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Create New Cohort" }).click();

    await expect(assignDialog).toBeHidden();
    await expect(page.getByRole("dialog", { name: "Create Cohort" })).toBeVisible();
  });

  // Title/aria-label changes per step, so the dialog is queried without a
  // name filter from here on — only one dialog is ever open at a time.
  const wizard = page.getByRole("dialog");

  await test.step("complete the Create Cohort wizard", async () => {
    await wizard.getByLabel(/Cohort name/).fill("E2E Devices Cohort");

    // Network is already pre-filled from the preselected device — not
    // touched here, since picking one clears the devices field.
    const networkName = (
      await wizard.getByRole("button", { name: /Sensor Manufacturer/ }).textContent()
    )?.trim();

    await wizard.getByRole("button", { name: "Review & Create" }).click();

    await expect(wizard.getByText("Review Cohort Details")).toBeVisible();
    await expect(wizard.getByText("E2E Devices Cohort")).toBeVisible();
    if (networkName) {
      await expect(wizard.getByText(networkName)).toBeVisible();
    }
    // Scoped to the count element — a bare getByText(number) would be
    // ambiguous against other digits on the page.
    await expect(wizard.getByText("Devices to be added:")).toBeVisible();
    await expect(wizard.locator(".text-2xl")).toHaveText(String(selectedDeviceCount));

    await wizard.getByRole("button", { name: "Confirm & Create" }).click();

    await expect(wizard.getByText("Cohort Created Successfully!")).toBeVisible({
      timeout: 30_000,
    });
    await expect(wizard.getByText("E2E Devices Cohort")).toBeVisible();
  });

  expect(createCall.payload()).toMatchObject({ name: "E2E Devices Cohort" });
  expect(assignCall.payload().device_ids).toHaveLength(selectedDeviceCount);
  expect(assignCall.url()).toContain(MOCK_CREATED_COHORT_ID);

  await test.step("Go to Cohort Details closes the wizard and navigates", async () => {
    await wizard.getByRole("button", { name: "Go to Cohort Details" }).click();

    // Closes via client-side navigation unmounting the page, which can
    // outlast the default 5s assertion timeout.
    await expect(wizard).toBeHidden({ timeout: 30_000 });
    await expect(page).toHaveURL(`/admin/cohorts/${MOCK_CREATED_COHORT_ID}`);
    // Scoped exact match: a bare substring match also catches the page's
    // satisfaction-survey banner ("Overall, how satisfied are you with E2E
    // Devices Cohort"), which is unrelated to this assertion.
    await expect(page.getByText("E2E Devices Cohort", { exact: true })).toBeVisible({
      timeout: 30_000,
    });
  });
});
