import { test, expect, type Page, type Locator } from "@playwright/test";
import { assertNonProductionApiTarget } from "../../support/env-guard";
import { MOCK_DEVICE_DETAILS_ID } from "../../support/device-mocks";
import {
  interceptVerifyCohort,
  interceptAssignCohortsToUser,
  MOCK_VERIFIED_COHORT_NAME,
} from "../../support/claim-mocks";
import {
  interceptDeviceDetailsTransition,
  interceptDeployDevice,
  interceptRecallDevice,
} from "../../support/deploy-mocks";

/**
 * Device lifecycle — Claim -> Deploy -> Recall, personal context.
 *
 * One connected journey rather than isolated per-step files: claim access
 * via cohort import (the only method-select option currently live — see
 * MethodSelectStep.tsx and commit 1f19d80ac; manual/QR entry-point claiming
 * still isn't reachable from the UI), then deploy and recall the same
 * fixture device on the details page, asserting the status/button swap
 * flips correctly at each transition.
 *
 * Cohort-import doesn't hand back a specific claimed device (it assigns a
 * whole cohort), so "the same device" across steps means the same
 * MOCK_DEVICE_DETAILS_ID fixture used for deploy and recall, not literally
 * the object the claim step touched — cohort import is treated as a valid
 * claim variant (ownership/access transfer) per product intent, not as a
 * stand-in for token-based single-device claiming.
 *
 * Hybrid interception throughout: navigation and auth are real; cohort
 * verification and the deploy/recall mutations are intercepted so runs are
 * deterministic and mutate nothing on the real backend. GET /api/devices/:id
 * is a stateful fixture that only flips status once the corresponding
 * mutation succeeds, so every status/button assertion is proven against a
 * real refetch.
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

async function openDeployWizard(page: Page): Promise<Locator> {
  await page.goto(`/devices/overview/${MOCK_DEVICE_DETAILS_ID}`);

  const deployButton = page.getByRole("button", { name: "Deploy Device" });
  await expect(deployButton).toBeEnabled({ timeout: 60_000 });
  await deployButton.click();

  const wizard = page.getByRole("dialog", { name: "Deploy device" });
  await expect(wizard).toBeVisible();
  return wizard;
}

/** Fills step 0 (Enter Device Details) and leaves the wizard on step 0. */
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

test("claims cohort access, deploys a device, and recalls it", async ({ page }) => {
  test.setTimeout(180_000);

  await interceptVerifyCohort(page, { success: true, name: MOCK_VERIFIED_COHORT_NAME });
  const assignCall = await interceptAssignCohortsToUser(page);
  const transition = await interceptDeviceDetailsTransition(page);
  const deployCall = await interceptDeployDevice(page, transition.markDeployed);
  const recallCall = await interceptRecallDevice(page, transition.markRecalled);

  await test.step("Claim: import cohort access", async () => {
    const wizard = await openClaimWizard(page);
    const cohortId = `e2e-lifecycle-cohort-${Date.now()}`;

    await expect(wizard.getByText("Import Cohort")).toBeVisible();
    await wizard.getByLabel("Cohort ID").fill(cohortId);
    await wizard.getByRole("button", { name: "Import", exact: true }).click();

    await expect(wizard.getByText("Confirm Cohort")).toBeVisible();
    await expect(wizard.getByText(MOCK_VERIFIED_COHORT_NAME)).toBeVisible();
    await wizard.getByRole("button", { name: "Confirm & Import" }).click();

    await expect(wizard.getByText("Cohort Assigned Successfully!")).toBeVisible({
      timeout: 30_000,
    });
    await wizard.getByRole("button", { name: "See devices" }).click();
    await expect(wizard).toBeHidden();

    expect(assignCall.payload()).toMatchObject({ cohort_ids: [cohortId] });
  });

  await test.step("Deploy: submit the Deploy Device wizard", async () => {
    const wizard = await openDeployWizard(page);
    await fillDeviceDetailsStep(page, wizard);
    await wizard.getByRole("button", { name: "Next", exact: true }).click();

    // Fixture has no previous sites, so this stays on the "New site" branch.
    await expect(
      wizard.getByText("No previous sites available for this device.")
    ).toBeVisible();
    await wizard.getByRole("button", { name: "Next", exact: true }).click();

    // Coordinates mode avoids depending on a live Mapbox autocomplete/map.
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

    // The dialog closes immediately on success; the success banner trails it
    // by ~300ms (see useBannerWithDelay), so both are asserted after close.
    await expect(wizard).toBeHidden({ timeout: 30_000 });
    await expect(
      page.getByText("e2e_deploy_device has been deployed successfully.")
    ).toBeVisible({ timeout: 30_000 });
    await deviceRefetch;

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
  });

  await test.step("Recall: submit the Recall Device dialog", async () => {
    await page.getByRole("button", { name: "Recall Device" }).click();

    const dialog = page.getByRole("dialog", { name: "Recall Device" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Selected device: E2E Deploy Device")).toBeVisible();

    await dialog.getByRole("button", { name: "Set Recall Type" }).click();
    await dialog.getByRole("option", { name: "Errors" }).click();

    const recallButton = dialog.getByRole("button", { name: "Recall Device", exact: true });
    await expect(recallButton).toBeEnabled();

    const deviceRefetch = page.waitForResponse(
      (r) =>
        r.url().includes(`/api/devices/${MOCK_DEVICE_DETAILS_ID}`) &&
        r.request().method() === "GET",
      { timeout: 30_000 }
    );
    await recallButton.click();

    await expect(dialog).toBeHidden({ timeout: 30_000 });
    await expect(
      page.getByText("E2E Deploy Device has been recalled successfully.")
    ).toBeVisible({ timeout: 30_000 });
    await deviceRefetch;

    // Status reverts (deployed -> recalled) and the button set swaps back —
    // the whole point of a lifecycle test: the loop closes, not just opens.
    await expect(page.getByRole("button", { name: "Deploy Device" })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole("button", { name: "Recall Device" })).toBeHidden();

    expect(recallCall.payload()).toMatchObject({ recallType: "errors" });
    expect(recallCall.url()).toContain("deviceName=e2e_deploy_device");
  });
});

test("claim: shows a verification error and never assigns when the cohort ID is invalid", async ({
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

test("claim: requires a cohort ID before importing can proceed", async ({ page }) => {
  test.setTimeout(90_000);

  const assignCall = await interceptAssignCohortsToUser(page);

  const wizard = await openClaimWizard(page);
  await wizard.getByRole("button", { name: "Import", exact: true }).click();

  await expect(wizard.getByText("Please enter a valid Cohort ID")).toBeVisible();
  expect(assignCall.wasCalled()).toBe(false);
});

test("deploy: blocks advancing past device details until required fields are filled", async ({
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

test("recall: requires a recall type before recalling can proceed", async ({ page }) => {
  test.setTimeout(90_000);

  const transition = await interceptDeviceDetailsTransition(page, {
    status: "deployed",
    isActive: true,
  });
  const recallCall = await interceptRecallDevice(page, transition.markRecalled);

  await page.goto(`/devices/overview/${MOCK_DEVICE_DETAILS_ID}`);
  const recallDeviceButton = page.getByRole("button", { name: "Recall Device" });
  await expect(recallDeviceButton).toBeEnabled({ timeout: 60_000 });
  await recallDeviceButton.click();

  const dialog = page.getByRole("dialog", { name: "Recall Device" });
  await expect(dialog).toBeVisible();

  // No recall type selected — the primary action stays disabled.
  await expect(
    dialog.getByRole("button", { name: "Recall Device", exact: true })
  ).toBeDisabled();
  expect(recallCall.wasCalled()).toBe(false);
});
