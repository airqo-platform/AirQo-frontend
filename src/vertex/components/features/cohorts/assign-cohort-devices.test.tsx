import { render, screen, waitFor, within } from "@testing-library/react";
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
  useBanner: () => ({ hideBanner: vi.fn(), showBanner: vi.fn() }),
}));

const showBannerWithDelayMock = vi.fn();
vi.mock("@/core/hooks/useBannerWithDelay", () => ({
  useBannerWithDelay: () => ({ showBannerWithDelay: showBannerWithDelayMock }),
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

    // Escape here should only close the MultiSelectCombobox's own dropdown
    // (a Radix Popover stacked on top), not the parent dialog — previously a
    // ReusableDialog bug meant this Escape press also closed (and reset) the
    // whole dialog, silently discarding the selections made above.
    await user.keyboard("{Escape}");

    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(dialog().getByRole("button", { name: "Add" })).not.toBeDisabled();
  });

  it("shows a success banner and closes on success", async () => {
    const assignSpy = vi.fn((variables, hookOptions, callOptions) => {
      hookOptions?.onSuccess?.(variables);
      callOptions?.onSuccess?.();
    });
    mockAssignDevices(assignSpy);
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

  it("closes the nested Create Cohort dialog and this one when cohort creation succeeds", async () => {
    mockAssignDevices(vi.fn());
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<AssignCohortDevicesDialog open onOpenChange={onOpenChange} />);

    const combos = dialog().getAllByRole("combobox");
    await user.click(combos[0]);
    await user.click(screen.getByRole("option", { name: "Create New Cohort" }));
    await user.click(screen.getByText("Simulate cohort created"));

    expect(screen.queryByTestId("create-cohort-dialog")).not.toBeInTheDocument();
  });
});
