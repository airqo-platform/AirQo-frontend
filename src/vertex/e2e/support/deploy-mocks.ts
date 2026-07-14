import type { Page } from "@playwright/test";
import { MOCK_DEVICE_DETAILS_ID, type CapturedCall } from "./device-mocks";

/**
 * Route interceptions for the device-details Deploy and Recall flows.
 * GET /api/devices/:id is a stateful fixture (starts "not deployed", flips to
 * "deployed" on a successful deploy, flips to "recalled" on a successful
 * recall) so tests prove the page's status/button actually react to a real
 * refetch rather than asserting a static fixture. Both mutations are
 * intercepted so no real deployment/recall is created.
 */

export interface DeviceDetailsTransition {
  /** Flip the fixture to "deployed" — call from the deploy mutation's fulfill handler. */
  markDeployed: () => void;
  /** Flip the fixture to "recalled" — call from the recall mutation's fulfill handler. */
  markRecalled: () => void;
}

export async function interceptDeviceDetailsTransition(
  page: Page,
  overrides: Record<string, unknown> = {}
): Promise<DeviceDetailsTransition> {
  let status: "not deployed" | "deployed" | "recalled" = "not deployed";

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
            status,
            isActive: status === "deployed",
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

  return {
    markDeployed: () => { status = "deployed"; },
    markRecalled: () => { status = "recalled"; },
  };
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

/** Intercepts POST /api/devices/activities/recall?deviceName=:name. */
export async function interceptRecallDevice(
  page: Page,
  onSuccess?: () => void
): Promise<CapturedCall> {
  const captured: { payload?: Record<string, unknown>; url?: string } = {};

  await page.route("**/api/devices/activities/recall**", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    captured.payload = route.request().postDataJSON() as Record<string, unknown>;
    captured.url = route.request().url();
    onSuccess?.();
    await route.fulfill({
      status: 200,
      json: { success: true, message: "Device recalled successfully" },
    });
  });

  return {
    wasCalled: () => captured.payload !== undefined,
    payload: () => {
      if (captured.payload === undefined) {
        throw new Error(
          "POST /api/devices/activities/recall was never called — the flow did not reach the mutation."
        );
      }
      return captured.payload;
    },
    url: () => {
      if (captured.url === undefined) {
        throw new Error(
          "POST /api/devices/activities/recall was never called — the flow did not reach the mutation."
        );
      }
      return captured.url;
    },
  };
}
