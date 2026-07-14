import type { Page } from "@playwright/test";
import type { CapturedCall } from "./device-mocks";

/**
 * Route interceptions for the admin Shipping "Prepare New Batch" flow.
 * Only the prepare-bulk mutation is intercepted so runs never create a real
 * shipping batch or claim tokens on the backend; the status summary and
 * batches table GETs stay real (hybrid interception).
 */

/** Intercepts POST /api/devices/prepare-bulk-for-shipping. */
export async function interceptPrepareBulkForShipping(
  page: Page,
  message = "Bulk shipping preparation completed"
): Promise<CapturedCall> {
  const captured: { payload?: Record<string, unknown>; url?: string } = {};

  await page.route("**/api/devices/prepare-bulk-for-shipping", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    const payload = route.request().postDataJSON() as {
      device_names?: string[];
      token_type?: string;
      batch_name?: string;
    };
    captured.payload = payload;
    captured.url = route.request().url();

    const deviceNames = payload.device_names ?? [];
    await route.fulfill({
      status: 200,
      json: {
        success: true,
        message,
        bulk_preparation_results: {
          successful_preparations: deviceNames.map((name) => ({
            device_name: name,
            claim_token: `e2e-token-${name}`,
          })),
          failed_preparations: [],
          summary: {
            total_requested: deviceNames.length,
            successful_count: deviceNames.length,
            failed_count: 0,
          },
        },
      },
    });
  });

  return {
    wasCalled: () => captured.payload !== undefined,
    payload: () => {
      if (captured.payload === undefined) {
        throw new Error(
          "POST /api/devices/prepare-bulk-for-shipping was never called — the flow did not reach the mutation."
        );
      }
      return captured.payload;
    },
    url: () => {
      if (captured.url === undefined) {
        throw new Error(
          "POST /api/devices/prepare-bulk-for-shipping was never called — the flow did not reach the mutation."
        );
      }
      return captured.url;
    },
  };
}
