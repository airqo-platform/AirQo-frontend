import path from "path";
import dotenv from "dotenv";
import { defineConfig, devices } from "@playwright/test";

// Local-only env for e2e (test account creds, base URL). Never required in CI —
// CI supplies these as real environment/secret variables instead.
dotenv.config({ path: path.resolve(__dirname, ".env.e2e"), quiet: true });

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const authFile = path.resolve(__dirname, "e2e/.auth/user.json");

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // HTML report always generated (consumed by `npm run test:e2e:report`);
  // in CI, "github" annotations plus a JUnit file for Codecov Test Analytics
  // (flaky-test tracking); plain "list" console output locally.
  reporter: process.env.CI
    ? [
        ["html", { open: "never" }],
        ["github"],
        ["junit", { outputFile: "test-results/junit.xml" }],
      ]
    : [
        ["html", { open: "never" }],
        ["list"],
      ],

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    // Logs in once via the real UI and persists the session (cookies + localStorage)
    // to authFile. The `chromium` project depends on this so tests don't re-login per file.
    {
      name: "setup",
      testDir: "./e2e/setup",
      testMatch: /.*\.setup\.ts/,
    },
    // Tests that must run signed out (login page, public routes). No storageState,
    // no dependency on `setup`, so these run even without E2E_USER_EMAIL/PASSWORD set.
    {
      name: "public",
      testDir: "./e2e/tests/public",
      use: { ...devices["Desktop Chrome"] },
    },
    // Authenticated tests — everything under e2e/tests except tests/public.
    {
      name: "chromium",
      testDir: "./e2e/tests",
      testIgnore: "**/public/**",
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
      dependencies: ["setup"],
    },
  ],

  // Starts the Next.js app against whatever backend NEXT_PUBLIC_API_URL points
  // to (staging by default, see .env.example) — only the frontend runs locally.
  // CI serves a production build instead of the dev server: faster page loads
  // (no on-demand compilation) and closer to what ships.
  webServer: {
    command: process.env.CI ? "npm run build && npm run start" : "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    // A developer's .env.local often points NEXTAUTH_URL/cookie domain at the
    // deployed staging host; a session cookie scoped to .airqo.net is rejected
    // by the browser on localhost, breaking login. Real env vars beat .env.local
    // in Next.js, so pin auth to the local server for the e2e run only.
    env: {
      NEXTAUTH_URL: baseURL,
      NEXTAUTH_COOKIE_DOMAIN: "",
      // No-op when HTTP_PROXY/HTTPS_PROXY aren't set (most environments);
      // in sandboxes that require an explicit proxy for outbound internet,
      // makes axios and native fetch route through it — see the file for
      // why (Node's http/fetch/axios each need to be told about it
      // explicitly, in ways that differ from each other and from curl).
      NODE_OPTIONS: [process.env.NODE_OPTIONS, `--require "${path.resolve(__dirname, "e2e/setup/proxy-bootstrap.cjs")}"`]
        .filter(Boolean)
        .join(" "),
    },
  },
});
