import type { Page } from "@playwright/test";
import { MOCK_DEVICE_DETAILS_ID, type CapturedCall } from "./device-mocks";

/**
 * Route interceptions for the device-details Deploy flow. GET /api/devices/:id
 * is a stateful fixture (starts "not deployed", flips to "deployed" once the
 * deploy mutation succeeds) so the test can prove the page's status/button
 * actually react to a real refetch rather than asserting a static fixture.
 * The deploy mutation itself is intercepted so no real deployment is created.
 */

export interface DeviceDetailsTransition {
  /** Flip the fixture to "deployed" — call from the deploy mutation's fulfill handler. */
  markDeployed: () => void;
}

export async function interceptDeviceDetailsTransition(
  page: Page,
  overrides: Record<string, unknown> = {}
): Promise<DeviceDetailsTransition> {
  let deployed = false;

  await page.route(
    new RegExp(`/api/devices/${MOCK_DEVICE_DETAILS_ID}(\\?.*)?$`),
    async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        json: {
          message: "device fetched successfully",
          data: {
            _id: MOCK_DEVICE_DETAILS_ID,
            name: "e2e_deploy_device",
            long_name: "E2E Deploy Device",
            serial_number: "E2E-DEPLOY-SN-001",
            network: "airqo",
            category: "lowcost",
            status: deployed ? "deployed" : "not deployed",
            isActive: deployed,
            isOnline: false,
            createdAt: "2026-01-01T00:00:00.000Z",
            device_codes: [],
            cohorts: [],
            groups: [],
            pictures: [],
            previous_sites: [],
            ...overrides,
          },
        },
      });
    }
  );

  return { markDeployed: () => { deployed = true; } };
}

/** Intercepts POST /api/devices/activities/deploy/batch. */
export async function interceptDeployDevice(
  page: Page,
  onSuccess?: () => void
): Promise<CapturedCall> {
  const captured: { payload?: Record<string, unknown>; url?: string } = {};

  await page.route("**/api/devices/activities/deploy/batch", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    const body = route.request().postDataJSON() as Array<Record<string, unknown>>;
    captured.payload = body?.[0];
    captured.url = route.request().url();
    onSuccess?.();
    await route.fulfill({
      status: 200,
      json: { success: true, message: "Devices deployed successfully" },
    });
  });

  return {
    wasCalled: () => captured.payload !== undefined,
    payload: () => {
      if (captured.payload === undefined) {
        throw new Error(
          "POST /api/devices/activities/deploy/batch was never called — the flow did not reach the mutation."
        );
      }
      return captured.payload;
    },
    url: () => {
      if (captured.url === undefined) {
        throw new Error(
          "POST /api/devices/activities/deploy/batch was never called — the flow did not reach the mutation."
        );
      }
      return captured.url;
    },
  };
}
