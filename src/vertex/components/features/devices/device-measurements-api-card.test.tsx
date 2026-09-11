import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DeviceMeasurementsApiCard, {
  HISTORICAL_DATA_DOCS_URL,
} from "./device-measurements-api-card";
import { useClipboard } from "@/core/hooks/useClipboard";

vi.mock("@/core/hooks/useClipboard", () => ({
  useClipboard: vi.fn(),
}));

describe("DeviceMeasurementsApiCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClipboard).mockReturnValue({ handleCopy: vi.fn() });
  });

  it("renders the recent and historical measurement API URLs for the device", () => {
    render(<DeviceMeasurementsApiCard deviceId="aq_g5_01" />);

    expect(
      screen.getByText(/devices\/aq_g5_01\/recent\?token=YOUR_TOKEN/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/devices\/aq_g5_01\/historical\?token=YOUR_TOKEN/)
    ).toBeInTheDocument();
  });

  it("links the historical endpoint to the partner docs in a new tab", () => {
    render(<DeviceMeasurementsApiCard deviceId="aq_g5_01" />);

    const link = screen.getByRole("link", { name: /learn more/i });
    expect(link).toHaveAttribute("href", HISTORICAL_DATA_DOCS_URL);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("copies the historical measurements URL when its copy button is clicked", async () => {
    const handleCopy = vi.fn();
    vi.mocked(useClipboard).mockReturnValue({ handleCopy });
    const user = userEvent.setup();
    render(<DeviceMeasurementsApiCard deviceId="aq_g5_01" />);

    const [, historicalCopyButton] = screen.getAllByRole("button");
    await user.click(historicalCopyButton);

    expect(handleCopy).toHaveBeenCalledWith(
      expect.stringContaining("devices/aq_g5_01/historical?token=YOUR_TOKEN")
    );
  });
});
