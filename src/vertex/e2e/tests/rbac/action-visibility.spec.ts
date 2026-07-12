import { test, expect, type Page } from "@playwright/test";
import {
  interceptUserDetails,
  resetAppBootState,
  rbacUser,
} from "../../support/rbac-mocks";
import {
  interceptDeviceDetails,
  MOCK_DEVICE_DETAILS_ID,
} from "../../support/device-mocks";
import { PERMISSIONS } from "../../../core/permissions/constants";

/**
 * RBAC — permission-gated action visibility.
 *
 * Each device action entry point (claim, import, deploy, recall, maintain) is
 * tested individually: a user whose role lacks exactly that permission gets a
 * disabled action button, while a sibling action they DO hold stays enabled.
 * The sibling assertion is the control — it proves the denial is per-permission
 * gating, not the page failing wholesale.
 *
 * Real session and routing; only the user-details GET is transformed (see
 * support/rbac-mocks.ts) and, for the details page, the device GET is a
 * fixture so the deployment state (which decides Deploy vs Recall visibility)
 * is deterministic.
 */

const DEVICE = PERMISSIONS.DEVICE;

async function bootWith(
  page: Page,
  options: Parameters<typeof rbacUser>[0]
): Promise<void> {
  await interceptUserDetails(page, rbacUser(options));
  await resetAppBootState(page);
}

test.describe("claim — Add AirQo Device", () => {
  test("is disabled on My Devices for a user without DEVICE_CLAIM", async ({ page }) => {
    test.setTimeout(120_000);
    await bootWith(page, {
      strip: [DEVICE.CLAIM],
      grantPersonal: [DEVICE.VIEW, DEVICE.UPDATE],
    });

    await page.goto("/devices/my-devices");

    // Control first: the import button is disabled while the devices query
    // is loading, so waiting for it to become enabled proves the page has
    // settled — only then is the claim button's disabled state attributable
    // to the missing permission rather than the loading state.
    await expect(
      page.getByRole("button", { name: "Import External Device" })
    ).toBeEnabled({ timeout: 60_000 });

    await expect(
      page.getByRole("button", { name: "Add AirQo Device" })
    ).toBeDisabled();
  });

  test("is enabled and opens the claim modal for a user with DEVICE_CLAIM", async ({ page }) => {
    test.setTimeout(120_000);
    await bootWith(page, {
      grantPersonal: [DEVICE.VIEW, DEVICE.CLAIM],
    });

    await page.goto("/devices/my-devices");

    const claimButton = page.getByRole("button", { name: "Add AirQo Device" });
    await expect(claimButton).toBeEnabled({ timeout: 60_000 });
    await claimButton.click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 30_000 });
  });
});

test.describe("import & claim — Devices overview", () => {
  test("import is disabled for a user without DEVICE_UPDATE", async ({ page }) => {
    test.setTimeout(120_000);
    await bootWith(page, {
      strip: [DEVICE.UPDATE],
      grantPersonal: [DEVICE.VIEW, DEVICE.CLAIM],
    });

    await page.goto("/devices/overview");

    // Control first: claim gates on DEVICE_CLAIM, which this user holds.
    await expect(
      page.getByRole("button", { name: "Add AirQo Device" })
    ).toBeEnabled({ timeout: 60_000 });
    await expect(
      page.getByRole("button", { name: "Import External Device" })
    ).toBeDisabled();
  });

  test("claim is disabled for a user without DEVICE_CLAIM", async ({ page }) => {
    test.setTimeout(120_000);
    await bootWith(page, {
      strip: [DEVICE.CLAIM],
      grantPersonal: [DEVICE.VIEW, DEVICE.UPDATE],
    });

    await page.goto("/devices/overview");

    // Control first: import gates on DEVICE_UPDATE, which this user holds.
    await expect(
      page.getByRole("button", { name: "Import External Device" })
    ).toBeEnabled({ timeout: 60_000 });
    await expect(
      page.getByRole("button", { name: "Add AirQo Device" })
    ).toBeDisabled();
  });

  test("import opens the wizard for a user with DEVICE_UPDATE", async ({ page }) => {
    test.setTimeout(120_000);
    await bootWith(page, {
      grantPersonal: [DEVICE.VIEW, DEVICE.UPDATE, DEVICE.CLAIM],
    });

    await page.goto("/devices/overview");

    const importButton = page.getByRole("button", { name: "Import External Device" });
    await expect(importButton).toBeEnabled({ timeout: 60_000 });
    await importButton.click();
    await expect(
      page.getByRole("dialog", { name: "Import External Device" })
    ).toBeVisible({ timeout: 30_000 });
  });
});

test.describe("deploy / recall / maintain — device details", () => {
  test("deploy is disabled for a user without DEVICE_DEPLOY", async ({ page }) => {
    test.setTimeout(120_000);
    await interceptDeviceDetails(page, { status: "not deployed" });
    await bootWith(page, {
      strip: [DEVICE.DEPLOY],
      grantPersonal: [DEVICE.VIEW, DEVICE.MAINTAIN],
    });

    await page.goto(`/devices/overview/${MOCK_DEVICE_DETAILS_ID}`);

    // This page has no RouteGuard, so buttons render (disabled) while user
    // details are still loading. Wait for the control — an action they DO
    // hold — to become enabled first: that proves permissions have loaded,
    // making the disabled assertion below meaningful rather than a snapshot
    // of the loading state.
    await expect(
      page.getByRole("button", { name: "Add Maintenance Log" })
    ).toBeEnabled({ timeout: 60_000 });

    await expect(
      page.getByRole("button", { name: "Deploy Device" })
    ).toBeDisabled();
  });

  test("recall is disabled for a user without DEVICE_RECALL", async ({ page }) => {
    test.setTimeout(120_000);
    await interceptDeviceDetails(page, { status: "deployed", isActive: true });
    await bootWith(page, {
      strip: [DEVICE.RECALL],
      grantPersonal: [DEVICE.VIEW, DEVICE.MAINTAIN],
    });

    await page.goto(`/devices/overview/${MOCK_DEVICE_DETAILS_ID}`);

    // Control first — see the deploy test for why.
    await expect(
      page.getByRole("button", { name: "Add Maintenance Log" })
    ).toBeEnabled({ timeout: 60_000 });
    await expect(
      page.getByRole("button", { name: "Recall Device" })
    ).toBeDisabled();
  });

  test("maintenance log is disabled for a user without DEVICE_MAINTAIN", async ({ page }) => {
    test.setTimeout(120_000);
    await interceptDeviceDetails(page, { status: "not deployed" });
    await bootWith(page, {
      strip: [DEVICE.MAINTAIN],
      grantPersonal: [DEVICE.VIEW, DEVICE.DEPLOY],
    });

    await page.goto(`/devices/overview/${MOCK_DEVICE_DETAILS_ID}`);

    // Control first — see the deploy test for why.
    await expect(
      page.getByRole("button", { name: "Deploy Device" })
    ).toBeEnabled({ timeout: 60_000 });
    await expect(
      page.getByRole("button", { name: "Add Maintenance Log" })
    ).toBeDisabled();
  });
});
