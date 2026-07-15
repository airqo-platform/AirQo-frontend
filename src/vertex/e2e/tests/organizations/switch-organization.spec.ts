import { test, expect } from "@playwright/test";
import {
  interceptUserDetails,
  resetAppBootState,
  rbacUser,
  E2E_EXTERNAL_ORG_TITLE,
} from "../../support/rbac-mocks";
import { PERMISSIONS } from "../../../core/permissions/constants";

/**
 * Organization picker — real click-driven org switching. The RBAC suite
 * proves the context check itself via a localStorage shortcut
 * (seedActiveGroup); this drives the actual picker UI a user clicks.
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

    // A navigation right after a live switch goes through
    // useContextAwareRouting's redirect-on-switch path (-> /home), not
    // RouteGuard's in-place 403.
    await page.goto("/sites/my-sites");
    await page.waitForURL(/\/home(\?|$)/, { timeout: 120_000 });
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
