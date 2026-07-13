import { test, expect, type Page, type Locator } from "@playwright/test";
import { assertNonProductionApiTarget } from "../../support/env-guard";
import {
  interceptVerifyCohort,
  interceptAssignCohortsToUser,
  MOCK_VERIFIED_COHORT_NAME,
} from "../../support/claim-mocks";

/**
 * Add AirQo Device (claim) — cohort-import path, personal context.
 *
 * MethodSelectStep currently exposes a single live option, "Import from
 * Cohort" (manual-input/QR/bulk entries are commented out of ALL_METHODS
 * pending completion — see MethodSelectStep.tsx and commit 1f19d80ac). This
 * spec covers the flow that's actually reachable from the "Add AirQo Device"
 * button today: method-select -> cohort ID entry -> verify -> confirm ->
 * assignment -> success.
 *
 * Hybrid interception: navigation and auth run against the real backend;
 * cohort verification (GET) is intercepted so runs are deterministic without
 * depending on a real seeded cohort ID, and the assignment mutation (POST)
 * is intercepted so runs never mutate real user/cohort state.
 */

test.beforeAll(() => {
  assertNonProductionApiTarget();
});

async function openClaimWizard(page: Page): Promise<Locator> {
  await page.goto("/devices/my-devices");

  const claimButton = page.getByRole("button", { name: "Add AirQo Device" });
  await expect(claimButton).toBeVisible({ timeout: 60_000 });
  await claimButton.click();

  // Title/aria-label changes per step, so the dialog is queried without a
  // name filter — only one dialog is ever open at a time.
  const wizard = page.getByRole("dialog");
  await expect(wizard).toBeVisible();
  await wizard.getByRole("button", { name: /Import from Cohort/ }).click();
  return wizard;
}

test("claims device access via cohort import and assigns it to the user", async ({
  page,
}) => {
  test.setTimeout(120_000);

  await interceptVerifyCohort(page, { success: true, name: MOCK_VERIFIED_COHORT_NAME });
  const assignCall = await interceptAssignCohortsToUser(page);

  const wizard = await openClaimWizard(page);
  const cohortId = `e2e-cohort-${Date.now()}`;

  await expect(wizard.getByText("Import Cohort")).toBeVisible();
  await wizard.getByLabel("Cohort ID").fill(cohortId);
  await wizard.getByRole("button", { name: "Import", exact: true }).click();

  // Confirmation echoes the verified cohort's name, not the raw ID entered.
  await expect(wizard.getByText("Confirm Cohort")).toBeVisible();
  await expect(wizard.getByText(MOCK_VERIFIED_COHORT_NAME)).toBeVisible();

  const myDevicesRefetch = page.waitForRequest(
    (r) => r.url().includes("/api/devices/my-devices") && r.method() === "GET",
    { timeout: 60_000 }
  );
  await wizard.getByRole("button", { name: "Confirm & Import" }).click();

  await expect(wizard.getByText("Cohort Assigned Successfully!")).toBeVisible({
    timeout: 30_000,
  });
  await myDevicesRefetch;

  // The mutation must carry the cohort ID the user actually typed, not the
  // display name shown in the confirmation step.
  expect(assignCall.payload()).toMatchObject({ cohort_ids: [cohortId] });
});

test("shows a verification error and never assigns when the cohort ID is invalid", async ({
  page,
}) => {
  test.setTimeout(90_000);

  const invalidMessage = "Cohort not found";
  await interceptVerifyCohort(page, { success: false, message: invalidMessage });
  const assignCall = await interceptAssignCohortsToUser(page);

  const wizard = await openClaimWizard(page);
  await wizard.getByLabel("Cohort ID").fill("does-not-exist");
  await wizard.getByRole("button", { name: "Import", exact: true }).click();

  await expect(wizard.getByText(invalidMessage)).toBeVisible({ timeout: 30_000 });
  await expect(wizard.getByText("Confirm Cohort")).toBeHidden();
  expect(assignCall.wasCalled()).toBe(false);
});

test("requires a cohort ID before importing can proceed", async ({ page }) => {
  test.setTimeout(90_000);

  const assignCall = await interceptAssignCohortsToUser(page);

  const wizard = await openClaimWizard(page);
  await wizard.getByRole("button", { name: "Import", exact: true }).click();

  await expect(wizard.getByText("Please enter a valid Cohort ID")).toBeVisible();
  expect(assignCall.wasCalled()).toBe(false);
});
