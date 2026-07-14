import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CohortMeasurementsApiCard from "./cohort-measurements-api-card";
import { useClipboard } from "@/core/hooks/useClipboard";

vi.mock("@/core/hooks/useClipboard", () => ({
  useClipboard: vi.fn(),
}));

describe("CohortMeasurementsApiCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the recent and historical measurement API URLs for the cohort", () => {
    vi.mocked(useClipboard).mockReturnValue({ handleCopy: vi.fn() });
    render(<CohortMeasurementsApiCard cohortId="cohort-1" />);

    expect(
      screen.getByText(/measurements\/cohorts\/cohort-1\/recent\?token=YOUR_TOKEN/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/measurements\/cohorts\/cohort-1\/historical\?token=YOUR_TOKEN/)
    ).toBeInTheDocument();
  });

  it("copies the recent measurements URL when clicked", async () => {
    const handleCopy = vi.fn();
    vi.mocked(useClipboard).mockReturnValue({ handleCopy });
    const user = userEvent.setup();
    render(<CohortMeasurementsApiCard cohortId="cohort-1" />);

    await user.click(
      screen.getByRole("button", { name: "Copy recent cohort measurements API URL" })
    );
    expect(handleCopy).toHaveBeenCalledWith(
      expect.stringContaining("measurements/cohorts/cohort-1/recent?token=YOUR_TOKEN")
    );
  });

  it("copies the historical measurements URL when clicked", async () => {
    const handleCopy = vi.fn();
    vi.mocked(useClipboard).mockReturnValue({ handleCopy });
    const user = userEvent.setup();
    render(<CohortMeasurementsApiCard cohortId="cohort-1" />);

    await user.click(
      screen.getByRole("button", { name: "Copy historical cohort measurements API URL" })
    );
    expect(handleCopy).toHaveBeenCalledWith(
      expect.stringContaining("measurements/cohorts/cohort-1/historical?token=YOUR_TOKEN")
    );
  });
});
