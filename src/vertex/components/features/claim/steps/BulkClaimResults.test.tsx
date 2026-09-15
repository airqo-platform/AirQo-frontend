import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { BulkClaimResults } from "./BulkClaimResults";
import { CLAIM_TOKEN_MISMATCH_MESSAGE, DEVICE_ALREADY_CLAIMED_MESSAGE } from "../utils";

describe("BulkClaimResults", () => {
  it("shows user-facing copy for known per-device claim failures", async () => {
    const user = userEvent.setup();
    render(
      <BulkClaimResults
        results={{
          successful_claims: [{ device_name: "airqo_1", success: true }],
          failed_claims: [
            { device_name: "airqo_2", error: "Device already claimed or not available" },
            { device_name: "airqo_3", error: "Invalid claim token" },
            { device_name: "airqo_4", error: "The specified cohort does not belong to you" },
          ],
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: /Failed Claims \(3\)/ }));

    expect(screen.getByText(DEVICE_ALREADY_CLAIMED_MESSAGE)).toBeInTheDocument();
    expect(screen.getByText(CLAIM_TOKEN_MISMATCH_MESSAGE)).toBeInTheDocument();
    expect(screen.getByText("The specified cohort does not belong to you")).toBeInTheDocument();
  });
});
