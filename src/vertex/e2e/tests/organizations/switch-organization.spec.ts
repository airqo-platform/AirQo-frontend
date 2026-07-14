import { test, expect } from "@playwright/test";
import {
  interceptUserDetails,
  resetAppBootState,
  rbacUser,
  expectRouteDenied,
  E2E_EXTERNAL_ORG_TITLE,
} from "../../support/rbac-mocks";
import { PERMISSIONS } from "../../../core/permissions/constants";

/**
 * Organization picker — real click-driven org switching.
 *
 * The RBAC suite (e2e/tests/rbac/context-gating.spec.ts) already proves that
 * booting in an external-org context denies personal-only routes, but it
 * gets there via `seedActiveGroup`, a localStorage shortcut that bypasses
 * the picker UI entirely. That leaves the picker itself — the thing a real
 * user actually clicks to change what data they can see — with zero
 * coverage. This spec drives the actual click path (open picker, pick an
 * org, confirm) and proves it produces the same access-control outcome,
 * closing the gap between "the context check works" and "the UI that sets
 * the context works." This is exactly TESTING.md's e2e trigger: proving
 * access control against a real session, not a component in isolation.
 *
 * Hybrid interception: auth, navigation, and the org list itself are real —
 * only the user-details GET is transformed in flight to inject a synthetic
 * external org (see rbac-mocks.ts), so the scenario needs no second test
 * account or backend seeding. Switching organizations is client-side only
 * (Redux + React Query cache invalidation, no backend "activate org" call),
 * so there is no mutation to intercept.
 */

test("switching organizations via the picker re-scopes access, and switching back restores it", async ({
  page,
}) => {
  test.setTimeout(180_000);

  await interceptUserDetails(
    page,
    rbacUser({
      grantPersonal: [PERMISSIONS.SITE.VIEW],
      externalOrg: { permissions: [PERMISSIONS.SITE.VIEW, PERMISSIONS.DEVICE.VIEW] },
    })
  );
  await resetAppBootState(page);

  await page.goto("/home");

  // Starts in the default (personal/AirQo) context — the personal-only page
  // is reachable before any switch.
  await page.goto("/sites/my-sites");
  await expect(page.getByRole("heading", { name: "My Sites" })).toBeVisible({
    timeout: 60_000,
  });

  const picker = page.getByRole("button", { name: "My Organizations" });

  await test.step("the picker lists every organization, including the injected external org", async () => {
    await expect(picker).toBeVisible({ timeout: 30_000 });
    await picker.click();

    const modal = page.getByRole("dialog", { name: "Organizations" });
    await expect(modal).toBeVisible();
    await expect(modal.getByText(E2E_EXTERNAL_ORG_TITLE.toUpperCase())).toBeVisible();

    // Search narrows the list without navigating away.
    await modal.getByPlaceholder("Search organizations...").fill("does-not-exist-org");
    await expect(modal.getByText("No organizations found.")).toBeVisible();
    await modal.getByPlaceholder("Search organizations...").fill("");
  });

  await test.step("switching to the external org denies the personal-only route", async () => {
    const modal = page.getByRole("dialog", { name: "Organizations" });
    await modal.getByText(E2E_EXTERNAL_ORG_TITLE.toUpperCase()).click();

    await expect(modal).toBeHidden();
    // The trigger reflects the new active org once the switch lands.
    await expect(picker).toContainText(E2E_EXTERNAL_ORG_TITLE.toUpperCase(), {
      timeout: 30_000,
    });

    // Same page, but the context flipped under it — the personal-only guard
    // must deny now, even though the external org's role also grants
    // SITE_VIEW (proving the denial is the context check, not a permission).
    await page.goto("/sites/my-sites");
    await expectRouteDenied(page);
  });

  await test.step("switching back to AirQo restores access", async () => {
    await picker.click();
    const modal = page.getByRole("dialog", { name: "Organizations" });
    await expect(modal).toBeVisible();
    await modal.getByText("AIRQO", { exact: true }).click();

    await expect(modal).toBeHidden();
    await expect(picker).toContainText("AIRQO", { timeout: 30_000 });

    await page.goto("/sites/my-sites");
    await expect(page.getByRole("heading", { name: "My Sites" })).toBeVisible({
      timeout: 60_000,
    });
  });
});
