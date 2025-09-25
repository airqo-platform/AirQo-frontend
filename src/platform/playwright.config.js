/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: './tests/e2e',
  timeout: 120 * 1000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 30 * 1000,
    ignoreHTTPSErrors: true,
  },
  webServer: {
    command: 'yarn dev',
    cwd: __dirname,
    port: 3000,
    timeout: 120000,
    reuseExistingServer: true,
  },
};
