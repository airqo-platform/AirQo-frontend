import type { Page } from "@playwright/test";
import type { CapturedCall } from "./device-mocks";

/** Route interceptions for Shipping "Prepare New Batch" — only the mutation is mocked. */

/**
 * Intercepts POST /api/devices/shipping-batches (the atomic create-batch
 * endpoint the Prepare New Batch modal submits to). GETs on the same path —
 * the batches table refetch — fall through to the real API.
 */
export async function interceptPrepareBulkForShipping(
  page: Page,
  message = "Shipping batch created successfully"
): Promise<CapturedCall> {
  const captured: { payload?: Record<string, unknown>; url?: string } = {};

  await page.route("**/api/devices/shipping-batches", async (route) => {
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
      status: 201,
      json: {
        success: true,
        message,
        batch_creation_results: {
          batch: {
            _id: "e2e-batch-id",
            batch_name: payload.batch_name ?? "",
            device_count: deviceNames.length,
            device_names: deviceNames,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
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
          "POST /api/devices/shipping-batches was never called — the flow did not reach the mutation."
        );
      }
      return captured.payload;
    },
    url: () => {
      if (captured.url === undefined) {
        throw new Error(
          "POST /api/devices/shipping-batches was never called — the flow did not reach the mutation."
        );
      }
      return captured.url;
    },
  };
}
