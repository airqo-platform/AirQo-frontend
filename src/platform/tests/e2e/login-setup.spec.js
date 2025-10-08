import { test, expect } from '@playwright/test';

test('authenticated session with groups should render and not stay on setup overlay', async ({
  page,
}) => {
  // Simulate authenticated session and return user with groups immediately
  await page.route('**/api/auth/session', (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        user: { id: 'u-playwright', name: 'Playwright User', email: 'p@test' },
      }),
      contentType: 'application/json',
    }),
  );

  // Intercept the exact backend call used by fetchUserGroups: GET /users/:id
  await page.route('**/users/*', (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        success: true,
        users: [
          {
            _id: 'u-playwright',
            firstName: 'Playwright',
            lastName: 'User',
            name: 'Playwright User',
            email: 'p@test',
            userName: 'puser',
            groups: [
              {
                _id: 'g1',
                grp_title: 'AirQo',
                grp_slug: 'airqo',
                grp_profile_picture: null,
              },
            ],
          },
        ],
      }),
      contentType: 'application/json',
    }),
  );

  // Visit the root page; with an authenticated session and groups, the app should
  // not stay stuck on the 'Setting up your workspace' overlay.
  await page.goto('/');

  // Wait for either navigation to Home OR the setup overlay to be gone.
  // Using Promise.race gives us a deterministic outcome without assuming the overlay appears.
  const waitForEither = Promise.race([
    page.waitForURL('**/user/Home', { timeout: 30000 }),
    page.waitForSelector('text=Setting up your workspace', {
      state: 'hidden',
      timeout: 30000,
    }),
  ]);

  await waitForEither;

  // If we ended up on Home, assert the URL; otherwise, ensure the overlay isn't stuck.
  if (page.url().includes('/user/Home')) {
    expect(page.url()).toContain('/user/Home');
  } else {
    const overlay = page.locator('text=Setting up your workspace');
    await expect(overlay).toBeHidden({ timeout: 1000 });
  }
});
