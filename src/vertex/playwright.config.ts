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
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",

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

  // Starts the Next.js dev server against whatever backend NEXT_PUBLIC_API_URL
  // points to (staging by default, see .env.example) — only the frontend runs locally.
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
