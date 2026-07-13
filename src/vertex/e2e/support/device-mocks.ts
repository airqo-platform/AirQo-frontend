import type { Page } from "@playwright/test";

/**
 * Route interceptions for device mutation endpoints. The import wizard's GETs
 * (networks, cohorts) stay real; only the writes are fulfilled with mock
 * responses so runs are deterministic and leave no device records behind.
 * The captured payloads are the main assertion surface — they prove the
 * wizard assembled the request correctly across its steps.
 */

export interface CapturedCall<T = Record<string, unknown>> {
  wasCalled: () => boolean;
  /** Throws if the endpoint was never hit — call after awaiting the UI outcome. */
  payload: () => T;
  url: () => string;
}

export const MOCK_IMPORTED_DEVICE_ID = "e2e-mock-imported-device-id";

/** Intercepts POST /api/devices/soft (single-device import). */
export async function interceptImportDevice(page: Page): Promise<CapturedCall> {
  const captured: { payload?: Record<string, unknown>; url?: string } = {};

  await page.route("**/api/devices/soft", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    captured.payload = route.request().postDataJSON() as Record<string, unknown>;
    captured.url = route.request().url();
    const longName = String(captured.payload?.long_name ?? "e2e-device");
    await route.fulfill({
      status: 200,
      json: {
        success: true,
        message: "device created successfully",
        created_device: {
          _id: MOCK_IMPORTED_DEVICE_ID,
          name: longName.toLowerCase().replace(/\s+/g, "_"),
          long_name: longName,
        },
      },
    });
  });

  return toCapturedCall(captured, "POST /api/devices/soft");
}

export interface BulkImportMockDevice {
  long_name?: string;
  serial_number?: string;
  [key: string]: unknown;
}

export interface BulkImportMockResult {
  success: boolean;
  long_name?: string;
  serial_number?: string;
  error?: string;
  created_device?: { _id: string; name: string };
}

/**
 * Intercepts POST /api/devices/soft/bulk. `buildResults` receives the devices
 * from the captured payload and returns per-device results, letting tests
 * drive full-success or partial-failure responses.
 */
export async function interceptBulkImport(
  page: Page,
  buildResults: (devices: BulkImportMockDevice[]) => BulkImportMockResult[]
): Promise<CapturedCall> {
  const captured: { payload?: Record<string, unknown>; url?: string } = {};

  await page.route("**/api/devices/soft/bulk", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    captured.payload = route.request().postDataJSON() as Record<string, unknown>;
    captured.url = route.request().url();
    const devices = (captured.payload?.devices as BulkImportMockDevice[] | undefined) ?? [];
    const results = buildResults(devices);
    const imported = results.filter((r) => r.success).length;
    await route.fulfill({
      status: 200,
      json: {
        success: true,
        message: "bulk import processed",
        total: results.length,
        imported,
        failed: results.length - imported,
        results,
      },
    });
  });

  return toCapturedCall(captured, "POST /api/devices/soft/bulk");
}

/** Builds an all-success results array with deterministic created-device ids. */
export function allSucceed(devices: BulkImportMockDevice[]): BulkImportMockResult[] {
  return devices.map((device, index) => ({
    success: true,
    long_name: String(device.long_name ?? ""),
    serial_number: String(device.serial_number ?? ""),
    created_device: {
      _id: `e2e-mock-bulk-device-${index + 1}`,
      name: String(device.long_name ?? `device-${index + 1}`)
        .toLowerCase()
        .replace(/\s+/g, "_"),
    },
  }));
}

/** Intercepts POST /api/devices/cohorts/:id/assign-devices (post-import cohort assignment). */
export async function interceptCohortAssignment(page: Page): Promise<CapturedCall> {
  const captured: { payload?: Record<string, unknown>; url?: string } = {};

  await page.route(/\/api\/devices\/cohorts\/[^/]+\/assign-devices/, async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    captured.payload = route.request().postDataJSON() as Record<string, unknown>;
    captured.url = route.request().url();
    const deviceIds = (captured.payload?.device_ids as string[] | undefined) ?? [];
    await route.fulfill({
      status: 200,
      json: {
        success: true,
        message: "devices assigned to cohort",
        updated_cohort: {
          assigned: deviceIds,
          already_assigned: [],
        },
      },
    });
  });

  return toCapturedCall(captured, "POST /api/devices/cohorts/:id/assign-devices");
}

export const MOCK_DEVICE_DETAILS_ID = "d0d0d0d0d0d0d0d0d0d0d0d0";

/**
 * Fulfills GET /api/devices/:id for MOCK_DEVICE_DETAILS_ID with a fixture
 * device, so specs can open the device-details page in a deterministic
 * deployment state (deployed → Recall visible, otherwise → Deploy visible)
 * without depending on real seeded devices.
 */
export async function interceptDeviceDetails(
  page: Page,
  overrides: Record<string, unknown> = {}
): Promise<void> {
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
            name: "e2e_rbac_device",
            long_name: "E2E RBAC Device",
            serial_number: "E2E-RBAC-SN-001",
            network: "airqo",
            category: "lowcost",
            status: "not deployed",
            isActive: false,
            isOnline: false,
            createdAt: "2026-01-01T00:00:00.000Z",
            device_codes: [],
            cohorts: [],
            groups: [],
            pictures: [],
            ...overrides,
          },
        },
      });
    }
  );
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
