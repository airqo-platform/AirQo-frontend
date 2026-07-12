import { test, expect, type Page } from "@playwright/test";
import {
  interceptUserDetails,
  resetAppBootState,
  rbacUser,
} from "../../support/rbac-mocks";
import { PERMISSIONS } from "../../../core/permissions/constants";
import { ADMIN_PANEL_PERMISSIONS } from "../../../core/permissions/adminAccess";

/**
 * RBAC — page-level route guards.
 *
 * Direct navigation to a RouteGuard-wrapped page without the required
 * permission must end in the guard's configured denial, which differs per
 * page:
 *  - showError (default): the forbidden UI renders in place, URL unchanged
 *    (/devices/overview, and /admin/* via AdminRouteGuard).
 *  - showError={false} + redirectTo: the user is redirected away
 *    (/sites/my-sites → /home).
 *
 * Only the user-details GET is transformed (support/rbac-mocks.ts); session,
 * routing, and rendering are real.
 */

const FORBIDDEN_TEXT = "Error code: 403 forbidden access";

async function bootWith(
  page: Page,
  options: Parameters<typeof rbacUser>[0]
): Promise<void> {
  await interceptUserDetails(page, rbacUser(options));
  await resetAppBootState(page);
}

test("shows the forbidden UI on /devices/overview without DEVICE_VIEW", async ({ page }) => {
  test.setTimeout(120_000);
  await bootWith(page, { strip: [PERMISSIONS.DEVICE.VIEW] });

  await page.goto("/devices/overview");

  await expect(page.getByText(FORBIDDEN_TEXT)).toBeVisible({ timeout: 60_000 });
  // showError guards deny in place — no redirect.
  expect(page.url()).toContain("/devices/overview");
});

test("renders /devices/overview normally with DEVICE_VIEW (control)", async ({ page }) => {
  test.setTimeout(120_000);
  await bootWith(page, { grantPersonal: [PERMISSIONS.DEVICE.VIEW] });

  await page.goto("/devices/overview");

  await expect(
    page.getByRole("heading", { name: "Devices", exact: true, level: 1 })
  ).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText(FORBIDDEN_TEXT)).toBeHidden();
});

test("redirects /sites/my-sites to /home without SITE_VIEW", async ({ page }) => {
  test.setTimeout(120_000);
  // This guard uses showError={false} redirectTo="/home" — the denial is a
  // redirect, not an in-place error.
  await bootWith(page, { strip: [PERMISSIONS.SITE.VIEW] });

  await page.goto("/sites/my-sites");

  await page.waitForURL(/\/home(\?|$)/, { timeout: 60_000 });
});

test("shows the forbidden UI on /admin/networks without admin panel permissions", async ({ page }) => {
  test.setTimeout(120_000);
  // AdminRouteGuard requires at least one of ADMIN_PANEL_PERMISSIONS; strip
  // them all (context is personal here, so the denial is purely permission-based).
  await bootWith(page, {
    strip: [...ADMIN_PANEL_PERMISSIONS],
    grantPersonal: [PERMISSIONS.DEVICE.VIEW],
  });

  await page.goto("/admin/networks");

  await expect(page.getByText(FORBIDDEN_TEXT)).toBeVisible({ timeout: 60_000 });
  expect(page.url()).toContain("/admin/networks");
});
