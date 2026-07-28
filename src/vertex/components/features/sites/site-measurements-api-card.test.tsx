import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SiteMeasurementsApiCard from "./site-measurements-api-card";
import { useClipboard } from "@/core/hooks/useClipboard";

vi.mock("@/core/hooks/useClipboard", () => ({
  useClipboard: vi.fn(),
}));

describe("SiteMeasurementsApiCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the recent and historical measurement API URLs for the site", () => {
    vi.mocked(useClipboard).mockReturnValue({ handleCopy: vi.fn() });
    render(<SiteMeasurementsApiCard siteId="site-1" />);

    expect(
      screen.getByText(/measurements\/sites\/site-1\/recent\?token=YOUR_TOKEN/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/measurements\/sites\/site-1\/historical\?token=YOUR_TOKEN/)
    ).toBeInTheDocument();
  });

  it("copies the recent measurements URL when clicked", async () => {
    const handleCopy = vi.fn();
    vi.mocked(useClipboard).mockReturnValue({ handleCopy });
    const user = userEvent.setup();
    render(<SiteMeasurementsApiCard siteId="site-1" />);

    await user.click(
      screen.getByRole("button", { name: "Copy recent measurements API URL" })
    );
    expect(handleCopy).toHaveBeenCalledWith(
      expect.stringContaining("measurements/sites/site-1/recent?token=YOUR_TOKEN")
    );
  });

  it("copies the historical measurements URL when clicked", async () => {
    const handleCopy = vi.fn();
    vi.mocked(useClipboard).mockReturnValue({ handleCopy });
    const user = userEvent.setup();
    render(<SiteMeasurementsApiCard siteId="site-1" />);

    await user.click(
      screen.getByRole("button", { name: "Copy historical measurements API URL" })
    );
    expect(handleCopy).toHaveBeenCalledWith(
      expect.stringContaining("measurements/sites/site-1/historical?token=YOUR_TOKEN")
    );
  });
});
