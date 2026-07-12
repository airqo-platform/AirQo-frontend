import { test, expect, type Page } from "@playwright/test";
import {
  interceptUserDetails,
  resetAppBootState,
  seedActiveGroup,
  rbacUser,
  E2E_EXTERNAL_ORG_ID,
} from "../../support/rbac-mocks";
import { PERMISSIONS } from "../../../core/permissions/constants";

/**
 * RBAC — resource-scoped denial.
 *
 * The subtlest check: the user genuinely holds the permission — but on a
 * different organization than the one the action targets. Permission checks
 * are scoped to the active organization (the resource context), so a grant
 * on the AirQo group must NOT satisfy a check made while an external org is
 * active, and vice versa.
 *
 * Setup per test: the AirQo group role holds the permission, the injected
 * external org's role does not (or holds a different one). The same user,
 * same session, is then exercised in both scopes. The personal-context
 * control proves the grant is real — so the denial in org context can only
 * come from resource scoping, not a missing permission.
 */

const DEVICE = PERMISSIONS.DEVICE;
const FORBIDDEN_TEXT = "Error code: 403 forbidden access";

async function bootInExternalOrg(
  page: Page,
  options: Parameters<typeof rbacUser>[0]
): Promise<void> {
  const intercept = await interceptUserDetails(page, rbacUser(options));
  await resetAppBootState(page);

  await page.goto("/home");
  const userId = await intercept.userId();
  await seedActiveGroup(page, userId, E2E_EXTERNAL_ORG_ID);
}

// DEVICE_UPDATE held on AirQo only; the org role has view access but no
// update. Whether the actions are usable must follow the ACTIVE org's role.
const updateOnAirqoOnly = {
  strip: [DEVICE.UPDATE],
  grantPersonal: [DEVICE.VIEW, DEVICE.UPDATE, DEVICE.CLAIM],
  externalOrg: { permissions: [DEVICE.VIEW] },
};

test("denies device actions in an org where the role lacks DEVICE_UPDATE, despite holding it on AirQo", async ({ page }) => {
  // Two full page boots against the real backend — generous budget so
  // parallel-worker dev-server load can't starve the waits.
  test.setTimeout(240_000);
  await bootInExternalOrg(page, updateOnAirqoOnly);

  await page.goto("/devices/overview");

  // The page itself renders — the org role holds DEVICE_VIEW…
  await expect(
    page.getByRole("heading", { name: "Devices", exact: true, level: 1 })
  ).toBeVisible({ timeout: 120_000 });

  // …but the mutating actions are denied: DEVICE_UPDATE exists on the user's
  // AirQo membership, not on this organization's role.
  await expect(
    page.getByRole("button", { name: "Import External Device" })
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Add AirQo Device" })
  ).toBeDisabled();
});

test("allows the same device actions in the personal scope that holds DEVICE_UPDATE (control)", async ({ page }) => {
  test.setTimeout(120_000);
  // Identical grants — but booted in the personal (AirQo) context, the scope
  // that actually holds DEVICE_UPDATE.
  await interceptUserDetails(page, rbacUser(updateOnAirqoOnly));
  await resetAppBootState(page);

  await page.goto("/devices/overview");

  await expect(
    page.getByRole("button", { name: "Import External Device" })
  ).toBeEnabled({ timeout: 60_000 });
  await expect(
    page.getByRole("button", { name: "Add AirQo Device" })
  ).toBeEnabled();
});

test("denies a route in an org whose role lacks DEVICE_VIEW, despite holding it on AirQo", async ({ page }) => {
  test.setTimeout(240_000);
  // Route-guard flavour of the same scoping rule: DEVICE_VIEW held on AirQo
  // must not open /devices/overview while an org without it is active.
  await bootInExternalOrg(page, {
    strip: [DEVICE.VIEW],
    grantPersonal: [DEVICE.VIEW],
    externalOrg: { permissions: [PERMISSIONS.SITE.VIEW] },
  });

  await page.goto("/devices/overview");

  await expect(page.getByText(FORBIDDEN_TEXT)).toBeVisible({ timeout: 120_000 });
  expect(page.url()).toContain("/devices/overview");
});
