import { test, expect } from "@playwright/test";

// Runs in the `public` project (no auth, no dependency on the setup project) —
// see playwright.config.ts. Use this file as the template for any test that
// must exercise a signed-out route.

test.describe("login page", () => {
  test("renders the email step", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByPlaceholder("Enter your email")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue with email" })
    ).toBeVisible();
  });

  test("rejects a too-short password on the password step", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.getByPlaceholder("Enter your email").fill("user@example.com");
    await page.getByRole("button", { name: "Continue with email" }).click();

    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await page.getByLabel("Password", { exact: true }).fill("short");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(
      page.getByText("Password must be at least 8 characters long")
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
