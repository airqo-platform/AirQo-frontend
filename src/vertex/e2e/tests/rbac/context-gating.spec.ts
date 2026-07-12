import { test, expect, type Page } from "@playwright/test";
import {
  interceptUserDetails,
  resetAppBootState,
  seedActiveGroup,
  rbacUser,
  E2E_EXTERNAL_ORG_ID,
  expectRouteDenied,
  FORBIDDEN_TEXT,
} from "../../support/rbac-mocks";
import { PERMISSIONS } from "../../../core/permissions/constants";
import { ADMIN_PANEL_PERMISSIONS } from "../../../core/permissions/adminAccess";

/**
 * RBAC — allowedContexts enforcement.
 *
 * Pages restricted to the personal context must deny a user whose active
 * organization is an external org, even when that org's role grants every
 * permission the guard asks for — the denial must come from the context
 * check alone.
 *
 * Mechanics: the user-details transform injects a synthetic external org
 * (E2E_EXTERNAL_ORG_ID) with generous permissions; a first boot captures the
 * real user id, then the "last active group" preference is seeded so the next
 * load boots with that org active (external-org context). See
 * support/rbac-mocks.ts.
 */

/**
 * Boots once in the default (personal) context to capture the user id, then
 * seeds the injected external org as the active group so every subsequent
 * navigation boots in external-org context.
 */
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

test("blocks /sites/my-sites from an external-org context even with SITE_VIEW", async ({ page }) => {
  // Two full page boots against the real backend — generous budget so
  // parallel-worker dev-server load can't starve the redirect wait.
  test.setTimeout(240_000);
  // The org role explicitly holds SITE_VIEW — the only thing missing is the
  // personal context, so a denial proves allowedContexts enforcement.
  await bootInExternalOrg(page, {
    externalOrg: {
      permissions: [PERMISSIONS.SITE.VIEW, PERMISSIONS.DEVICE.VIEW],
    },
    grantPersonal: [PERMISSIONS.SITE.VIEW],
  });

  await page.goto("/sites/my-sites");

  await page.waitForURL(/\/home(\?|$)/, { timeout: 120_000 });
});

test("allows /sites/my-sites from the personal context with SITE_VIEW (control)", async ({ page }) => {
  test.setTimeout(120_000);
  // Same permissions, personal (AirQo) context — the page must render,
  // proving the blocked case above is the context check and nothing else.
  await interceptUserDetails(
    page,
    rbacUser({ grantPersonal: [PERMISSIONS.SITE.VIEW] })
  );
  await resetAppBootState(page);

  await page.goto("/sites/my-sites");

  await expect(
    page.getByRole("heading", { name: "My Sites" })
  ).toBeVisible({ timeout: 60_000 });
  expect(page.url()).toContain("/sites/my-sites");
});

test("blocks /admin/networks from an external-org context even with admin permissions", async ({ page }) => {
  test.setTimeout(240_000);
  // AdminRouteGuard = ADMIN_PANEL_PERMISSIONS + allowedContexts ['personal'].
  // Grant the full admin permission set on the org role so the context check
  // is the only thing that can deny.
  await bootInExternalOrg(page, {
    externalOrg: { permissions: [...ADMIN_PANEL_PERMISSIONS] },
    grantPersonal: [...ADMIN_PANEL_PERMISSIONS],
  });

  await page.goto("/admin/networks");

  // Denial may surface as AdminRouteGuard's forbidden UI or as the layout's
  // context-aware redirect to /home — see expectRouteDenied.
  await expectRouteDenied(page);
});

test("allows /admin/networks from the personal context with admin permissions (control)", async ({ page }) => {
  test.setTimeout(120_000);
  await interceptUserDetails(
    page,
    rbacUser({ grantPersonal: [...ADMIN_PANEL_PERMISSIONS] })
  );
  await resetAppBootState(page);

  await page.goto("/admin/networks");

  await expect(page.getByText(FORBIDDEN_TEXT)).toBeHidden({ timeout: 60_000 });
  expect(page.url()).toContain("/admin/networks");
});
