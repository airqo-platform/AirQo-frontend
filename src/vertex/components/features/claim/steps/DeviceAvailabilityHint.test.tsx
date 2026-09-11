import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  DeviceAvailabilityHint,
  DEVICE_AVAILABLE_HINT,
  DEVICE_CLAIMED_HINT,
  DEVICE_UNKNOWN_HINT,
} from "./DeviceAvailabilityHint";
import { useDeviceAvailability } from "@/core/hooks/useDevices";

vi.mock("@/core/hooks/useDevices", () => ({
  useDeviceAvailability: vi.fn(),
}));

type HookResult = ReturnType<typeof useDeviceAvailability>;

function mockAvailability(result: Partial<HookResult>) {
  vi.mocked(useDeviceAvailability).mockReturnValue({
    data: undefined,
    error: null,
    isFetching: false,
    ...result,
  } as HookResult);
}

function availability(available: boolean): HookResult["data"] {
  return {
    success: true,
    message: "",
    data: { available, status: available ? "unclaimed" : "claimed" },
  };
}

async function settleDebounce() {
  await act(async () => {
    vi.advanceTimersByTime(500);
  });
}

describe("DeviceAvailabilityHint", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not look up names the claim form would reject", async () => {
    mockAvailability({});
    render(<DeviceAvailabilityHint deviceName="a!" />);
    await settleDebounce();

    expect(useDeviceAvailability).toHaveBeenLastCalledWith("");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("looks up the trimmed name only after the user pauses typing", async () => {
    mockAvailability({});
    const { rerender } = render(<DeviceAvailabilityHint deviceName="" />);
    rerender(<DeviceAvailabilityHint deviceName="  airqo_g5241 " />);

    expect(useDeviceAvailability).toHaveBeenLastCalledWith("");
    await settleDebounce();
    expect(useDeviceAvailability).toHaveBeenLastCalledWith("airqo_g5241");
  });

  it("shows a checking state while the lookup is in flight", async () => {
    mockAvailability({ isFetching: true });
    render(<DeviceAvailabilityHint deviceName="airqo_g5241" />);
    await settleDebounce();

    expect(screen.getByRole("status")).toHaveTextContent("Checking device availability");
  });

  it("confirms an unclaimed device is available", async () => {
    mockAvailability({ data: availability(true) });
    render(<DeviceAvailabilityHint deviceName="airqo_g5241" />);
    await settleDebounce();

    expect(screen.getByRole("status")).toHaveTextContent(DEVICE_AVAILABLE_HINT);
  });

  it("warns when the device has already been claimed", async () => {
    mockAvailability({ data: availability(false) });
    render(<DeviceAvailabilityHint deviceName="airqo_g5241" />);
    await settleDebounce();

    expect(screen.getByRole("status")).toHaveTextContent(DEVICE_CLAIMED_HINT);
  });

  it("explains a 404 as an unknown device name", async () => {
    mockAvailability({ error: { response: { status: 404 } } as HookResult["error"] });
    render(<DeviceAvailabilityHint deviceName="airqo_g5241" />);
    await settleDebounce();

    expect(screen.getByRole("status")).toHaveTextContent(DEVICE_UNKNOWN_HINT);
  });

  it("stays silent on other lookup failures so it never blocks the claim", async () => {
    mockAvailability({ error: { response: { status: 500 } } as HookResult["error"] });
    render(<DeviceAvailabilityHint deviceName="airqo_g5241" />);
    await settleDebounce();

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("hides a stale result while the user is typing a different name", async () => {
    mockAvailability({ data: availability(true) });
    const { rerender } = render(<DeviceAvailabilityHint deviceName="airqo_g5241" />);
    await settleDebounce();
    expect(screen.getByRole("status")).toBeInTheDocument();

    rerender(<DeviceAvailabilityHint deviceName="airqo_g52" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
