import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import CohortsEmptyState from "./cohorts-empty-state";

// Stub the claim wizard — unrelated to this empty state's own job.
vi.mock("../claim/claim-device-modal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="claim-device-modal" /> : null,
}));

describe("CohortsEmptyState", () => {
  it("renders the empty-state copy", () => {
    render(<CohortsEmptyState />);

    expect(screen.getByText("No Cohorts Found")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add AirQo Device" })
    ).toBeInTheDocument();
  });

  it("opens the claim device modal when Add AirQo Device is clicked", async () => {
    const user = userEvent.setup();
    render(<CohortsEmptyState />);

    expect(screen.queryByTestId("claim-device-modal")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add AirQo Device" }));
    expect(screen.getByTestId("claim-device-modal")).toBeInTheDocument();
  });
});
