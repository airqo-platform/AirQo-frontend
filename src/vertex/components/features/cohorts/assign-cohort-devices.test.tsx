import { render, screen, waitFor, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AssignCohortDevicesDialog } from "./assign-cohort-devices";
import { useAssignDevicesToCohort, useCohorts, useGroupCohorts } from "@/core/hooks/useCohorts";
import { useDevices } from "@/core/hooks/useDevices";
import { useUserContext } from "@/core/hooks/useUserContext";
import { setupPointerEventMock, setupResizeObserverMock } from "@/test/utils/domMocks";
import type { PreselectedDevice } from "./create-cohort";

setupPointerEventMock();
setupResizeObserverMock();

vi.mock("@/core/hooks/useCohorts", () => ({
  useCohorts: vi.fn(),
  useGroupCohorts: vi.fn(),
  useAssignDevicesToCohort: vi.fn(),
}));

vi.mock("@/core/hooks/useDevices", () => ({
  useDevices: vi.fn(),
}));

vi.mock("@/core/hooks/useUserContext", () => ({
  useUserContext: vi.fn(),
}));

vi.mock("@/context/banner-context", () => ({
  BannerSlot: () => null,
  useBanner: () => ({ hideBanner: vi.fn(), showBanner: showBannerMock }),
}));

const showBannerMock = vi.fn();
const showBannerWithDelayMock = vi.fn();
vi.mock("@/core/hooks/useBannerWithDelay", () => ({
  useBannerWithDelay: () => ({ showBannerWithDelay: showBannerWithDelayMock }),
}));

let parsedDevicesCallback: ((names: string[]) => void) | null = null;
vi.mock("./device-name-parser", () => ({
  DeviceNameParser: ({
    onDevicesParsed,
    shouldBlock,
    tooltipMessage,
  }: {
    onDevicesParsed: (names: string[]) => void;
    shouldBlock?: boolean;
    tooltipMessage?: string;
  }) => {
    parsedDevicesCallback = onDevicesParsed;
    return (
      <button
        type="button"
        disabled={shouldBlock}
        title={tooltipMessage}
        onClick={() => onDevicesParsed(["AirQo G1"])}
      >
        Import from CSV
      </button>
    );
  },
}));

// CreateCohortDialog has its own dedicated test file — stub it here so this
// file stays focused on AssignCohortDevicesDialog's own wiring, including
// how it hands off to (and closes itself for) the nested dialog.
const createCohortDialogSpy = vi.fn();
vi.mock("./create-cohort", () => ({
  CreateCohortDialog: (props: {
    open: boolean;
    preselectedDevices?: PreselectedDevice[];
    onSuccess?: () => void;
  }) => {
    createCohortDialogSpy(props);
    return props.open ? (
      <div data-testid="create-cohort-dialog">
        {props.preselectedDevices?.map((d) => d.label).join(",")}
        <button onClick={() => props.onSuccess?.()}>Simulate cohort created</button>
      </div>
    ) : null;
  },
}));

function dialog() {
  return within(screen.getByRole("dialog"));
}

function mockAssignDevices(
  assignSpy: (variables: unknown, hookOptions: unknown, callOptions: unknown) => void
) {
  vi.mocked(useAssignDevicesToCohort).mockImplementation((hookOptions) =>
    ({
      mutate: (variables: unknown, callOptions: unknown) =>
        assignSpy(variables, hookOptions, callOptions),
      isPending: false,
    }) as unknown as ReturnType<typeof useAssignDevicesToCohort>
  );
}

/**
 * Drives the assign mutation to success with a given API breakdown, so the
 * banner assertions exercise the response → message mapping rather than the
 * submitted device count.
 */
function respondWith(updated_cohort: {
  assigned: string[];
  already_assigned: string[];
}) {
  return vi.fn((variables, hookOptions, callOptions) => {
    hookOptions?.onSuccess?.({ success: true, updated_cohort }, variables);
    callOptions?.onSuccess?.();
  });
}

const DEVICE_A = { _id: "device-1", name: "airqo_g1", long_name: "AirQo G1" };
const DEVICE_B = { _id: "device-2", name: "airqo_g2", long_name: "AirQo G2" };

describe("AssignCohortDevicesDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUserContext).mockReturnValue({
      isExternalOrg: false,
      activeGroup: null,
    } as unknown as ReturnType<typeof useUserContext>);
    vi.mocked(useCohorts).mockReturnValue({
      cohorts: [{ _id: "cohort-1", name: "Kampala Cohort" }],
      isFetching: false,
    } as unknown as ReturnType<typeof useCohorts>);
    vi.mocked(useGroupCohorts).mockReturnValue({
      data: [],
      isFetching: false,
    } as unknown as ReturnType<typeof useGroupCohorts>);
    vi.mocked(useDevices).mockReturnValue({
      devices: [DEVICE_A, DEVICE_B],
      isFetching: false,
    } as unknown as ReturnType<typeof useDevices>);
  });

  it("disables Add until a cohort and at least one device are selected", () => {
    mockAssignDevices(vi.fn());
    render(<AssignCohortDevicesDialog open onOpenChange={vi.fn()} />);

    expect(dialog().getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("assigns the selected devices to the chosen cohort", async () => {
    const assignSpy = vi.fn();
    mockAssignDevices(assignSpy);
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<AssignCohortDevicesDialog open onOpenChange={onOpenChange} />);

    const combos = dialog().getAllByRole("combobox");
    await user.click(combos[0]);
    await user.click(screen.getByRole("option", { name: "Kampala Cohort" }));
    await waitFor(() => {
      expect(combos[0]).toHaveTextContent("Kampala Cohort");
    });

    await user.click(combos[1]);
    await user.click(screen.getByText("AirQo G1"));
    await user.keyboard("{Escape}");

    const addButton = dialog().getByRole("button", { name: "Add" });
    await user.click(addButton);

    expect(assignSpy).toHaveBeenCalledWith(
      { cohortId: "cohort-1", deviceIds: ["device-1"] },
      expect.anything(),
      expect.anything()
    );
  });

  it("does not close the dialog when Escape dismisses the devices dropdown, not the dialog itself", async () => {
    mockAssignDevices(vi.fn());
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<AssignCohortDevicesDialog open onOpenChange={onOpenChange} />);

    const combos = dialog().getAllByRole("combobox");
    await user.click(combos[0]);
    await user.click(screen.getByRole("option", { name: "Kampala Cohort" }));
    await user.click(combos[1]);
    await user.click(screen.getByText("AirQo G1"));

    // Regression: Escape should only close the dropdown, not the dialog.
    await user.keyboard("{Escape}");

    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(dialog().getByRole("button", { name: "Add" })).not.toBeDisabled();
  });

  it("shows a success banner and closes on success", async () => {
    mockAssignDevices(
      respondWith({ assigned: ["device-1"], already_assigned: [] })
    );
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(
      <AssignCohortDevicesDialog
        open
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
        cohortId="cohort-1"
        selectedDevices={[DEVICE_A] as never}
      />
    );

    await user.click(dialog().getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(showBannerWithDelayMock).toHaveBeenCalledWith({
        severity: "success",
        message: "1 device(s) assigned to cohort successfully",
        scoped: false,
      });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("says the device was already assigned instead of claiming success", async () => {
    // Regression: the banner used to be built from the submitted id count, so a
    // no-op assignment still reported "1 device(s) assigned ... successfully".
    mockAssignDevices(
      respondWith({ assigned: [], already_assigned: ["device-1"] })
    );
    const user = userEvent.setup();
    render(
      <AssignCohortDevicesDialog
        open
        onOpenChange={vi.fn()}
        cohortId="cohort-1"
        selectedDevices={[DEVICE_A] as never}
      />
    );

    await user.click(dialog().getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(showBannerWithDelayMock).toHaveBeenCalledWith({
        severity: "info",
        message: "Device is already assigned to this cohort",
        scoped: false,
      });
    });
  });

  it("reports the assigned and skipped counts separately for a partial assignment", async () => {
    mockAssignDevices(
      respondWith({ assigned: ["device-1"], already_assigned: ["device-2"] })
    );
    const user = userEvent.setup();
    render(
      <AssignCohortDevicesDialog
        open
        onOpenChange={vi.fn()}
        cohortId="cohort-1"
        selectedDevices={[DEVICE_A, DEVICE_B] as never}
      />
    );

    await user.click(dialog().getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(showBannerWithDelayMock).toHaveBeenCalledWith({
        severity: "success",
        message:
          "1 device(s) assigned to cohort successfully, 1 already assigned and skipped",
        scoped: false,
      });
    });
  });

  it("opens Create New Cohort with the currently-selected devices preselected, closing this dialog", async () => {
    mockAssignDevices(vi.fn());
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<AssignCohortDevicesDialog open onOpenChange={onOpenChange} />);

    const combos = dialog().getAllByRole("combobox");
    await user.click(combos[1]);
    await user.click(screen.getByText("AirQo G1"));
    await user.keyboard("{Escape}");

    // "Create New Cohort" is a custom action item inside the cohort ComboBox's popover.
    await user.click(combos[0]);
    await user.click(screen.getByRole("option", { name: "Create New Cohort" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByTestId("create-cohort-dialog")).toHaveTextContent("AirQo G1");
  });

  it("leaves the nested Create Cohort dialog open on success, so its own Success step is reachable", async () => {
    // Regression: force-closing it here would skip past its Success step.
    mockAssignDevices(vi.fn());
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<AssignCohortDevicesDialog open onOpenChange={onOpenChange} />);

    const combos = dialog().getAllByRole("combobox");
    await user.click(combos[0]);
    await user.click(screen.getByRole("option", { name: "Create New Cohort" }));
    await user.click(screen.getByText("Simulate cohort created"));

    expect(screen.getByTestId("create-cohort-dialog")).toBeInTheDocument();
  });

  it("imports devices in bulk via DeviceNameParser and merges them into the selection", async () => {
    const assignSpy = vi.fn();
    mockAssignDevices(assignSpy);
    const user = userEvent.setup();
    render(
      <AssignCohortDevicesDialog
        open
        onOpenChange={vi.fn()}
        cohortId="cohort-1"
      />
    );

    expect(dialog().getByRole("button", { name: "Add" })).toBeDisabled();

    // Click "Import from CSV", triggering onDevicesParsed with valid device names
    await user.click(dialog().getByRole("button", { name: "Import from CSV" }));

    // Add button should now be enabled as device is selected
    await waitFor(() => {
      expect(dialog().getByRole("button", { name: "Add" })).not.toBeDisabled();
    });

    expect(showBannerMock).toHaveBeenCalledWith({
      severity: "success",
      message: "Imported 1 device successfully.",
      scoped: true,
    });

    await user.click(dialog().getByRole("button", { name: "Add" }));

    expect(assignSpy).toHaveBeenCalledWith(
      { cohortId: "cohort-1", deviceIds: ["device-1"] },
      expect.anything(),
      expect.anything()
    );
  });

  it("reports not-found count when some parsed devices do not match", async () => {
    mockAssignDevices(vi.fn());
    render(
      <AssignCohortDevicesDialog
        open
        onOpenChange={vi.fn()}
        cohortId="cohort-1"
      />
    );

    // Call parser with one valid and one unknown device name
    await act(async () => {
      parsedDevicesCallback?.(["AirQo G1", "non_existent_device_xyz"]);
    });

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "warning",
        message: "Imported 1 device. 1 not found.",
        scoped: true,
      });
    });

    expect(dialog().getByRole("button", { name: "Add" })).not.toBeDisabled();
  });

  it("warns when no parsed devices match any known device", async () => {
    mockAssignDevices(vi.fn());
    render(
      <AssignCohortDevicesDialog
        open
        onOpenChange={vi.fn()}
        cohortId="cohort-1"
      />
    );

    // Call parser with unknown devices only
    await act(async () => {
      parsedDevicesCallback?.(["unknown_dev_1", "unknown_dev_2"]);
    });

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "warning",
        message: "No matching devices found. Please ensure the devices exist.",
        scoped: true,
      });
    });

    expect(dialog().getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("preserves existing device selections when importing additional devices", async () => {
    const assignSpy = vi.fn();
    mockAssignDevices(assignSpy);
    const user = userEvent.setup();
    render(
      <AssignCohortDevicesDialog
        open
        onOpenChange={vi.fn()}
        cohortId="cohort-1"
        selectedDevices={[DEVICE_A] as never}
      />
    );

    // Import device B
    await act(async () => {
      parsedDevicesCallback?.(["airqo_g2"]);
    });

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "success",
        message: "Imported 1 device successfully.",
        scoped: true,
      });
    });

    await user.click(dialog().getByRole("button", { name: "Add" }));

    expect(assignSpy).toHaveBeenCalledWith(
      { cohortId: "cohort-1", deviceIds: ["device-1", "device-2"] },
      expect.anything(),
      expect.anything()
    );
  });

  it("resolves imported device names against complete device pool even when combobox search filter is active", async () => {
    const assignSpy = vi.fn();
    mockAssignDevices(assignSpy);
    const user = userEvent.setup();

    const DEVICE_C = { _id: "device-3", name: "airqo_g3", long_name: "AirQo G3" };

    // Query with search returns only DEVICE_A, while the complete pool (limit: 2000) returns all devices
    vi.mocked(useDevices).mockImplementation((options) => {
      if (options?.search) {
        return {
          devices: [DEVICE_A],
          isFetching: false,
        } as unknown as ReturnType<typeof useDevices>;
      }
      return {
        devices: [DEVICE_A, DEVICE_B, DEVICE_C],
        isFetching: false,
      } as unknown as ReturnType<typeof useDevices>;
    });

    render(
      <AssignCohortDevicesDialog
        open
        onOpenChange={vi.fn()}
        cohortId="cohort-1"
      />
    );

    // Filter combobox by typing in the search input
    const combos = dialog().getAllByRole("combobox");
    await user.click(combos[1]);
    const searchInput = screen.getByPlaceholderText("Search or add new input...");
    await user.type(searchInput, "g1");

    // Wait for the 300ms debounce to trigger useDevices with search: "g1"
    await waitFor(() => {
      expect(useDevices).toHaveBeenCalledWith(
        expect.objectContaining({ search: "g1" })
      );
    });

    // Dismiss the combobox popover
    await user.keyboard("{Escape}");

    // Bulk import a device outside the active search: "AirQo G3"
    await act(async () => {
      parsedDevicesCallback?.(["AirQo G3"]);
    });

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "success",
        message: "Imported 1 device successfully.",
        scoped: true,
      });
    });

    const addButton = dialog().getByRole("button", { name: "Add" });
    expect(addButton).not.toBeDisabled();
    await user.click(addButton);

    expect(assignSpy).toHaveBeenCalledWith(
      { cohortId: "cohort-1", deviceIds: ["device-3"] },
      expect.anything(),
      expect.anything()
    );
  });

  it("warns when no devices are available to match against in an empty device pool", async () => {
    vi.mocked(useDevices).mockReturnValue({
      devices: [],
      isFetching: false,
    } as unknown as ReturnType<typeof useDevices>);

    render(
      <AssignCohortDevicesDialog
        open
        onOpenChange={vi.fn()}
        cohortId="cohort-1"
      />
    );

    await act(async () => {
      parsedDevicesCallback?.(["AirQo G1"]);
    });

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "warning",
        message: "No devices available to match against. Please wait for devices to load.",
        scoped: true,
      });
    });
  });

  it("blocks the CSV import button when complete devices are still loading and pool is empty", () => {
    vi.mocked(useDevices).mockReturnValue({
      devices: [],
      isFetching: true,
    } as unknown as ReturnType<typeof useDevices>);

    render(
      <AssignCohortDevicesDialog
        open
        onOpenChange={vi.fn()}
        cohortId="cohort-1"
      />
    );

    expect(dialog().getByRole("button", { name: "Import from CSV" })).toBeDisabled();
  });

  it("accepts a partial match when exactly one device matches unambiguously", async () => {
    const assignSpy = vi.fn();
    mockAssignDevices(assignSpy);
    const user = userEvent.setup();

    render(
      <AssignCohortDevicesDialog
        open
        onOpenChange={vi.fn()}
        cohortId="cohort-1"
      />
    );

    // "_g1" has length 3, is not an exact match, and uniquely matches DEVICE_A ("airqo_g1")
    await act(async () => {
      parsedDevicesCallback?.(["_g1"]);
    });

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "success",
        message: "Imported 1 device successfully.",
        scoped: true,
      });
    });

    const addButton = dialog().getByRole("button", { name: "Add" });
    expect(addButton).not.toBeDisabled();
    await user.click(addButton);

    expect(assignSpy).toHaveBeenCalledWith(
      { cohortId: "cohort-1", deviceIds: ["device-1"] },
      expect.anything(),
      expect.anything()
    );
  });

  it("leaves ambiguous partial matches unmatched when multiple devices contain the search string", async () => {
    mockAssignDevices(vi.fn());

    render(
      <AssignCohortDevicesDialog
        open
        onOpenChange={vi.fn()}
        cohortId="cohort-1"
      />
    );

    // "AirQo" matches both DEVICE_A ("AirQo G1") and DEVICE_B ("AirQo G2")
    // Because it is ambiguous, neither should be matched
    await act(async () => {
      parsedDevicesCallback?.(["AirQo"]);
    });

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "warning",
        message: "No matching devices found. Please ensure the devices exist.",
        scoped: true,
      });
    });

    expect(dialog().getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("does not match via partial contains when input length is less than 3 characters", async () => {
    mockAssignDevices(vi.fn());

    render(
      <AssignCohortDevicesDialog
        open
        onOpenChange={vi.fn()}
        cohortId="cohort-1"
      />
    );

    // "G" has length 1 (< 3) and is not an exact match for any device
    await act(async () => {
      parsedDevicesCallback?.(["G"]);
    });

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "warning",
        message: "No matching devices found. Please ensure the devices exist.",
        scoped: true,
      });
    });

    expect(dialog().getByRole("button", { name: "Add" })).toBeDisabled();
  });
});
