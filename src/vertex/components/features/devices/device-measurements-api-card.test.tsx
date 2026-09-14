import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DeviceMeasurementsApiCard, {
  HISTORICAL_DATA_DOCS_URL,
  HISTORICAL_DATA_ENDPOINT,
  buildHistoricalRequestBody,
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

  it("renders the recent measurements URL for the device id", () => {
    render(<DeviceMeasurementsApiCard deviceId="65c8d4a2" deviceName="airqo_g5241" />);

    expect(
      screen.getByText(/devices\/65c8d4a2\/recent\?token=YOUR_TOKEN/)
    ).toBeInTheDocument();
  });

  it("shows the v3 data-download POST endpoint for historical data, not a per-device GET route", () => {
    render(<DeviceMeasurementsApiCard deviceId="65c8d4a2" deviceName="airqo_g5241" />);

    expect(screen.getByText("POST")).toBeInTheDocument();
    expect(
      screen.getByText(/api\/v3\/public\/analytics\/data-download\?token=YOUR_TOKEN/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/\/historical\?token=/)).not.toBeInTheDocument();
  });

  it("renders an example request body targeting the device by name", () => {
    render(<DeviceMeasurementsApiCard deviceId="65c8d4a2" deviceName="airqo_g5241" />);

    const body = JSON.parse(buildHistoricalRequestBody("airqo_g5241"));
    expect(body.device_names).toEqual(["airqo_g5241"]);
    expect(body).toMatchObject({ startDateTime: expect.any(String), endDateTime: expect.any(String) });
    expect(screen.getByText(/"device_names": \[/)).toBeInTheDocument();
    expect(screen.getByText(/"airqo_g5241"/)).toBeInTheDocument();
  });

  it("falls back to a placeholder when the device name is unknown", () => {
    render(<DeviceMeasurementsApiCard deviceId="65c8d4a2" />);

    expect(screen.getByText(/"DEVICE_NAME"/)).toBeInTheDocument();
  });

  it("links the historical endpoint to the partner docs in a new tab", () => {
    render(<DeviceMeasurementsApiCard deviceId="65c8d4a2" deviceName="airqo_g5241" />);

    const link = screen.getByRole("link", { name: /learn more/i });
    expect(link).toHaveAttribute("href", HISTORICAL_DATA_DOCS_URL);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("copies the endpoint and the request body from their copy buttons", async () => {
    const handleCopy = vi.fn();
    vi.mocked(useClipboard).mockReturnValue({ handleCopy });
    const user = userEvent.setup();
    render(<DeviceMeasurementsApiCard deviceId="65c8d4a2" deviceName="airqo_g5241" />);

    await user.click(screen.getByRole("button", { name: "Copy historical data API URL" }));
    expect(handleCopy).toHaveBeenLastCalledWith(HISTORICAL_DATA_ENDPOINT);

    await user.click(screen.getByRole("button", { name: "Copy historical data request body" }));
    expect(handleCopy).toHaveBeenLastCalledWith(buildHistoricalRequestBody("airqo_g5241"));
  });
});
