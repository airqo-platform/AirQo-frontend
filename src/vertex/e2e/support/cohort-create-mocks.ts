import type { Page } from "@playwright/test";
import type { CapturedCall } from "./device-mocks";

/**
 * Route interceptions for the "create cohort" mutation chain
 * (useCreateCohortWithDevices: POST /devices/cohorts, then optionally
 * POST /devices/cohorts/:id/assign-devices and an owner-assignment call).
 * GETs (devices, cohorts, networks lists) stay real; only writes are mocked.
 */

export const MOCK_CREATED_COHORT_ID = "e2e-mock-created-cohort-id";

/** Intercepts POST /api/devices/cohorts (cohort creation). */
export async function interceptCreateCohort(
  page: Page,
  overrides: { cohortId?: string } = {}
): Promise<CapturedCall> {
  const cohortId = overrides.cohortId ?? MOCK_CREATED_COHORT_ID;
  const captured: { payload?: Record<string, unknown>; url?: string } = {};

  await page.route("**/api/devices/cohorts", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    captured.payload = route.request().postDataJSON() as Record<string, unknown>;
    captured.url = route.request().url();
    await route.fulfill({
      status: 200,
      json: {
        success: true,
        message: "cohort created successfully",
        cohort: {
          _id: cohortId,
          name: captured.payload?.name,
          network: captured.payload?.network,
          cohort_tags: captured.payload?.cohort_tags ?? [],
        },
      },
    });
  });

  return toCapturedCall(captured, "POST /api/devices/cohorts");
}

/**
 * Intercepts the owner-assignment calls that follow cohort creation
 * (group or personal-user routing, depending on isExternalOrg/isAdminPage).
 * Neither branch is under test here, so both are fulfilled permissively
 * without capturing — this only exists to keep real writes from firing if
 * the signed-in e2e user happens to be external-org.
 */
export async function interceptCohortOwnerAssignment(page: Page): Promise<void> {
  await page.route(/\/api\/users\/groups\/[^/]+\/cohorts\/assign/, async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    await route.fulfill({ status: 200, json: { success: true, message: "assigned" } });
  });

  await page.route(/\/api\/users\/[^/]+\/cohorts\/assign/, async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    await route.fulfill({ status: 200, json: { success: true, message: "assigned" } });
  });
}

/**
 * Fulfills GET /api/devices/cohorts/:cohortId so the cohort-details page
 * (navigated to from the create-cohort success step) loads deterministically
 * for a cohort id that only exists as a mock, not in the real backend.
 */
export async function interceptCohortDetails(
  page: Page,
  cohortId: string,
  overrides: Record<string, unknown> = {}
): Promise<void> {
  await page.route(new RegExp(`/api/devices/cohorts/${cohortId}(\\?.*)?$`), async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      json: {
        success: true,
        message: "cohort details fetched successfully",
        cohorts: [
          {
            _id: cohortId,
            name: "e2e-mock-created-cohort",
            visibility: true,
            cohort_tags: [],
            devices: [],
            ...overrides,
          },
        ],
      },
    });
  });
}

function toCapturedCall(
  captured: { payload?: Record<string, unknown>; url?: string },
  label: string
): CapturedCall {
  return {
    wasCalled: () => captured.payload !== undefined,
    payload: () => {
      if (captured.payload === undefined) {
        throw new Error(`${label} was never called — the flow did not reach the mutation.`);
      }
      return captured.payload;
    },
    url: () => {
      if (captured.url === undefined) {
        throw new Error(`${label} was never called — the flow did not reach the mutation.`);
      }
      return captured.url;
    },
  };
}
