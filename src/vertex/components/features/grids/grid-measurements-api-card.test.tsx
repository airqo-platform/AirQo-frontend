import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import GridMeasurementsApiCard from "./grid-measurements-api-card";
import { useClipboard } from "@/core/hooks/useClipboard";
import type { Grid } from "@/app/types/grids";

vi.mock("@/core/hooks/useClipboard", () => ({
  useClipboard: vi.fn(),
}));

const GRID: Grid = {
  _id: "grid-1",
  name: "Kampala Grid",
  admin_level: "City",
  visibility: true,
  network: "airqo",
  long_name: "Kampala Grid",
  createdAt: "2026-06-01T00:00:00.000Z",
  sites: [],
  numberOfSites: 3,
};

describe("GridMeasurementsApiCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a loading spinner instead of the URLs while loading", () => {
    vi.mocked(useClipboard).mockReturnValue({ handleCopy: vi.fn() });
    render(<GridMeasurementsApiCard grid={GRID} loading />);

    expect(screen.queryByText("Grid Measurements API")).not.toBeInTheDocument();
  });

  it("renders the recent and historical measurement API URLs for the grid", () => {
    vi.mocked(useClipboard).mockReturnValue({ handleCopy: vi.fn() });
    render(<GridMeasurementsApiCard grid={GRID} loading={false} />);

    expect(
      screen.getByText(/measurements\/grid-1\?token=YOUR_TOKEN/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/measurements\/grids\/grid-1\?token=YOUR_TOKEN/)
    ).toBeInTheDocument();
  });

  it("copies the recent measurements URL when its copy button is clicked", async () => {
    const handleCopy = vi.fn();
    vi.mocked(useClipboard).mockReturnValue({ handleCopy });
    const user = userEvent.setup();
    render(<GridMeasurementsApiCard grid={GRID} loading={false} />);

    const [recentCopyButton] = screen.getAllByRole("button");
    await user.click(recentCopyButton);

    expect(handleCopy).toHaveBeenCalledWith(
      expect.stringContaining("measurements/grid-1?token=YOUR_TOKEN")
    );
  });
});
