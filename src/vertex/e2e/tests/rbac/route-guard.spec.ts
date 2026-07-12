import { test, expect, type Page } from "@playwright/test";
import {
  interceptUserDetails,
  resetAppBootState,
  rbacUser,
  expectRouteDenied,
  FORBIDDEN_TEXT,
} from "../../support/rbac-mocks";
import { PERMISSIONS } from "../../../core/permissions/constants";
import { ADMIN_PANEL_PERMISSIONS } from "../../../core/permissions/adminAccess";

/**
 * RBAC — page-level route guards.
 *
 * Direct navigation to a RouteGuard-wrapped page without the required
 * permission must be denied. Two app layers enforce this and race each
 * other: RouteGuard (in-place forbidden UI when showError, redirect when
 * showError={false}) and useContextAwareRouting in the authenticated layout
 * (replaces the URL with /home for routes whose sidebar entry is
 * permission-hidden). Denial assertions therefore accept either surface —
 * see expectRouteDenied in support/rbac-mocks.ts.
 *
 * Only the user-details GET is transformed (support/rbac-mocks.ts); session,
 * routing, and rendering are real.
 */

async function bootWith(
  page: Page,
  options: Parameters<typeof rbacUser>[0]
): Promise<void> {
  await interceptUserDetails(page, rbacUser(options));
  await resetAppBootState(page);
}

test("denies /devices/overview without DEVICE_VIEW", async ({ page }) => {
  test.setTimeout(180_000);
  await bootWith(page, { strip: [PERMISSIONS.DEVICE.VIEW] });

  await page.goto("/devices/overview");

  await expectRouteDenied(page);
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

test("denies /admin/networks without admin panel permissions", async ({ page }) => {
  test.setTimeout(180_000);
  // AdminRouteGuard requires at least one of ADMIN_PANEL_PERMISSIONS; strip
  // them all (context is personal here, so the denial is purely permission-based).
  await bootWith(page, {
    strip: [...ADMIN_PANEL_PERMISSIONS],
    grantPersonal: [PERMISSIONS.DEVICE.VIEW],
  });

  await page.goto("/admin/networks");

  await expectRouteDenied(page);
});
