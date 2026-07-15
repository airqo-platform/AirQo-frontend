import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UnassignCohortDevicesDialog } from "./unassign-cohort-devices";
import {
  useCohortDetails,
  useCohorts,
  useUnassignDevicesFromCohort,
} from "@/core/hooks/useCohorts";
import { setupPointerEventMock, setupResizeObserverMock } from "@/test/utils/domMocks";
import type { Device } from "@/app/types/devices";

setupPointerEventMock();
setupResizeObserverMock();

vi.mock("@/core/hooks/useCohorts", () => ({
  useCohorts: vi.fn(),
  useCohortDetails: vi.fn(),
  useUnassignDevicesFromCohort: vi.fn(),
}));

vi.mock("@/context/banner-context", () => ({
  BannerSlot: () => null,
  useBanner: () => ({ hideBanner: vi.fn(), showBanner: vi.fn() }),
}));

const showBannerWithDelayMock = vi.fn();
vi.mock("@/core/hooks/useBannerWithDelay", () => ({
  useBannerWithDelay: () => ({ showBannerWithDelay: showBannerWithDelayMock }),
}));

const DEVICE_A = { _id: "device-1", name: "airqo_g1", long_name: "AirQo G1" } as Device;
const DEVICE_B = { _id: "device-2", name: "airqo_g2", long_name: "AirQo G2" } as Device;

function dialog() {
  return within(screen.getByRole("dialog"));
}

function mockUnassign(
  unassignSpy: (variables: unknown, hookOptions: unknown, callOptions: unknown) => void
) {
  vi.mocked(useUnassignDevicesFromCohort).mockImplementation((hookOptions) =>
    ({
      mutate: (variables: unknown, callOptions: unknown) =>
        unassignSpy(variables, hookOptions, callOptions),
      isPending: false,
    }) as unknown as ReturnType<typeof useUnassignDevicesFromCohort>
  );
}

describe("UnassignCohortDevicesDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCohorts).mockReturnValue({
      cohorts: [{ _id: "cohort-1", name: "Kampala Cohort" }],
    } as unknown as ReturnType<typeof useCohorts>);
    vi.mocked(useCohortDetails).mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useCohortDetails>);
  });

  it("pre-fills the cohort and devices when provided, and locks the cohort field", () => {
    mockUnassign(vi.fn());
    render(
      <UnassignCohortDevicesDialog
        open
        onOpenChange={vi.fn()}
        cohortId="cohort-1"
        selectedDevices={[DEVICE_A, DEVICE_B]}
      />
    );

    expect(dialog().getAllByRole("combobox")[0]).toBeDisabled();
    expect(dialog().getByText("2 device(s) selected")).toBeInTheDocument();
  });

  it("disables Remove until a cohort and at least one device are selected", () => {
    mockUnassign(vi.fn());
    render(<UnassignCohortDevicesDialog open onOpenChange={vi.fn()} />);

    expect(dialog().getByRole("button", { name: "Remove" })).toBeDisabled();
  });

  it("populates devices from the fetched cohort when none were pre-selected", async () => {
    mockUnassign(vi.fn());
    vi.mocked(useCohortDetails).mockReturnValue({
      data: { devices: [DEVICE_A, DEVICE_B] },
    } as unknown as ReturnType<typeof useCohortDetails>);
    const user = userEvent.setup();
    render(<UnassignCohortDevicesDialog open onOpenChange={vi.fn()} />);

    const combos = dialog().getAllByRole("combobox");
    await user.click(combos[0]);
    await user.click(screen.getByText("Kampala Cohort"));

    await user.click(combos[1]);
    expect(screen.getByText("AirQo G1")).toBeInTheDocument();
    expect(screen.getByText("AirQo G2")).toBeInTheDocument();
  });

  it("removes the selected devices from the cohort", async () => {
    const unassignSpy = vi.fn();
    mockUnassign(unassignSpy);
    const user = userEvent.setup();
    render(
      <UnassignCohortDevicesDialog
        open
        onOpenChange={vi.fn()}
        cohortId="cohort-1"
        selectedDevices={[DEVICE_A]}
      />
    );

    await user.click(dialog().getByRole("button", { name: "Remove" }));

    expect(unassignSpy).toHaveBeenCalledWith(
      { cohortId: "cohort-1", device_ids: ["device-1"] },
      expect.anything(),
      expect.anything()
    );
  });

  it("shows a success banner and closes the dialog once devices are removed", async () => {
    const unassignSpy = vi.fn((variables, hookOptions, callOptions) => {
      hookOptions?.onSuccess?.(variables);
      callOptions?.onSuccess?.();
    });
    mockUnassign(unassignSpy);
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(
      <UnassignCohortDevicesDialog
        open
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
        cohortId="cohort-1"
        selectedDevices={[DEVICE_A]}
      />
    );

    await user.click(dialog().getByRole("button", { name: "Remove" }));

    await waitFor(() => {
      expect(showBannerWithDelayMock).toHaveBeenCalledWith({
        severity: "success",
        message: "1 device(s) removed from cohort successfully",
        scoped: false,
      });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
