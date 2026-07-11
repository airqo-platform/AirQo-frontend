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
      "E2E_USER_EMAIL and E2E_USER_PASSWORD must be set (see .env.e2e.example) to run authenticated e2e tests."
    );
  }

  await page.goto("/login");

  await page.getByPlaceholder("Enter your email").fill(email);
  await page.getByRole("button", { name: "Continue with email" }).click();

  await page.getByLabel("Password", { exact: true }).fill(password);

  // On a cold dev server the app's short post-login session poll can time out
  // and show "Could not confirm session. Please try again." even though the
  // sign-in succeeded. The form keeps its values, so do what a user would:
  // click Login again (up to 3 attempts).
  const loginButton = page.getByRole("button", { name: "Login" });
  const sessionError = page.getByText("Could not confirm session. Please try again.");

  for (let attempt = 1; attempt <= 3; attempt++) {
    await loginButton.click();

    const urlWait = page
      .waitForURL(/\/home|\/admin/, { timeout: 30_000 })
      .then(() => "ok" as const)
      .catch(() => "timeout" as const);
    const errorWait = sessionError
      .waitFor({ state: "visible", timeout: 30_000 })
      .then(() => "retry" as const)
      .catch(() => "gone" as const);

    let outcome = await Promise.race([urlWait, errorWait]);
    if (outcome === "gone") outcome = await urlWait;

    if (outcome === "ok") break;
    if (outcome === "retry" && attempt < 3) continue;
    throw new Error(
      `Login did not complete after ${attempt} attempt(s) (last outcome: ${outcome}).`
    );
  }

  await expect(page).toHaveURL(/\/home|\/admin/);

  await page.context().storageState({ path: authFile });
});
