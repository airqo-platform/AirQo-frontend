import path from "path";
import { test as setup, expect } from "@playwright/test";

const authFile = path.resolve(__dirname, "../.auth/user.json");

/**
 * Runs once before the `chromium` project. Logs in through the real two-step
 * login form (email step, then password step — see app/login/page.tsx) and
 * persists cookies + localStorage so individual specs never have to log in.
 *
 * Requires E2E_USER_EMAIL / E2E_USER_PASSWORD (see .env.e2e.example).
 * Requires NEXT_PUBLIC_HCAPTCHA_SITE_KEY to be unset for the target env,
 * otherwise the password step renders an hCaptcha widget this script can't solve.
 */
setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "E2E_USER_EMAIL and E2E_USER_PASSWORD must be set (see e2e/.env.e2e.example) to run authenticated e2e tests."
    );
  }

  await page.goto("/login");

  await page.getByPlaceholder("Enter your email").fill(email);
  await page.getByRole("button", { name: "Continue with email" }).click();

  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/home|\/admin/, { timeout: 15_000 });

  await page.context().storageState({ path: authFile });
});
