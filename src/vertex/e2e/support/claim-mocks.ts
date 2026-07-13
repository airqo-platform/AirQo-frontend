import type { Page } from "@playwright/test";
import type { CapturedCall } from "./device-mocks";

/**
 * Route interceptions for the Add AirQo Device (claim) wizard's cohort-import
 * path — the only method-select option currently live in the UI (manual/QR/
 * bulk entries are commented out of MethodSelectStep pending completion).
 * Verify stays a GET so real cohort-ID validation is exercised; only the
 * assignment mutation is intercepted so runs never mutate real user/cohort
 * state.
 */

export const MOCK_VERIFIED_COHORT_NAME = "E2E Mock Cohort";

/** Intercepts GET /api/devices/cohorts/verify/:cohortId. */
export async function interceptVerifyCohort(
  page: Page,
  outcome:
    | { success: true; name?: string }
    | { success: false; message: string }
): Promise<void> {
  await page.route(/\/api\/devices\/cohorts\/verify\/[^/?]+/, async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    if (outcome.success) {
      await route.fulfill({
        status: 200,
        json: {
          success: true,
          message: "cohort verified successfully",
          cohort: { name: outcome.name ?? MOCK_VERIFIED_COHORT_NAME },
        },
      });
      return;
    }
    await route.fulfill({
      status: 200,
      json: { success: false, message: outcome.message },
    });
  });
}

/** Intercepts POST /api/users/:userId/cohorts/assign (personal-context cohort import). */
export async function interceptAssignCohortsToUser(page: Page): Promise<CapturedCall> {
  const captured: { payload?: Record<string, unknown>; url?: string } = {};

  await page.route(/\/api\/users\/[^/]+\/cohorts\/assign/, async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    captured.payload = route.request().postDataJSON() as Record<string, unknown>;
    captured.url = route.request().url();
    await route.fulfill({
      status: 200,
      json: { success: true, message: "cohorts assigned to user" },
    });
  });

  return {
    wasCalled: () => captured.payload !== undefined,
    payload: () => {
      if (captured.payload === undefined) {
        throw new Error(
          "POST /api/users/:userId/cohorts/assign was never called — the flow did not reach the mutation."
        );
      }
      return captured.payload;
    },
    url: () => {
      if (captured.url === undefined) {
        throw new Error(
          "POST /api/users/:userId/cohorts/assign was never called — the flow did not reach the mutation."
        );
      }
      return captured.url;
    },
  };
}
