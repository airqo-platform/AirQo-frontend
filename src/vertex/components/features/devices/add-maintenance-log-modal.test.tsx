import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AddMaintenanceLogModal from "./add-maintenance-log-modal";
import { useAddMaintenanceLog } from "@/core/hooks/useDevices";
import { useUserContext } from "@/core/hooks/useUserContext";
import { setupPointerEventMock, setupResizeObserverMock } from "@/test/utils/domMocks";

setupPointerEventMock();
setupResizeObserverMock();

vi.mock("@/core/hooks/useDevices", () => ({
  useAddMaintenanceLog: vi.fn(),
}));

vi.mock("@/core/hooks/useUserContext", () => ({
  useUserContext: vi.fn(),
}));

const showBannerMock = vi.fn();
vi.mock("@/context/banner-context", () => ({
  BannerSlot: () => null,
  useBanner: () => ({ hideBanner: vi.fn(), showBanner: showBannerMock }),
}));

const showBannerWithDelayMock = vi.fn();
vi.mock("@/core/hooks/useBannerWithDelay", () => ({
  useBannerWithDelay: () => ({ showBannerWithDelay: showBannerWithDelayMock }),
}));

// jsdom doesn't implement scrollIntoView, which the tag combobox uses.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const USER_DETAILS = {
  _id: "user-1",
  firstName: "Belinda",
  lastName: "Kobusingye",
  email: "belinda@airqo.net",
};

function dialog() {
  return within(screen.getByRole("dialog"));
}

// ReusableDialog auto-focuses the first focusable element 100ms after
// opening; typing that straddles that window gets its focus yanked back
// mid-field. Wait it out before typing.
async function settleDialogFocus() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
}

function mockAddLog(mutateAsync: (variables: unknown) => Promise<unknown>) {
  vi.mocked(useAddMaintenanceLog).mockReturnValue({
    mutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useAddMaintenanceLog>);
}

async function selectTag(user: ReturnType<typeof userEvent.setup>, tag: string) {
  await user.click(dialog().getByRole("combobox"));
  await user.click(screen.getByRole("option", { name: tag }));
  await user.keyboard("{Escape}");
}

describe("AddMaintenanceLogModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUserContext).mockReturnValue({
      userDetails: USER_DETAILS,
    } as unknown as ReturnType<typeof useUserContext>);
  });

  it("shows the device name in the title and defaults to today's date and Preventive type", async () => {
    mockAddLog(vi.fn());
    render(
      <AddMaintenanceLogModal open onOpenChange={vi.fn()} deviceName="e2e_device" />
    );
    await settleDialogFocus();

    expect(
      screen.getByRole("dialog", { name: "Add Maintenance Log for e2e_device" })
    ).toBeInTheDocument();
    expect(dialog().queryByRole("button", { name: /Pick a date/ })).not.toBeInTheDocument();
    expect(dialog().getByText("Preventive")).toHaveClass("font-semibold");
  });

  it("blocks submission and shows an error banner when no tags are selected", async () => {
    const mutateAsync = vi.fn();
    mockAddLog(mutateAsync);
    const user = userEvent.setup();
    render(
      <AddMaintenanceLogModal open onOpenChange={vi.fn()} deviceName="e2e_device" />
    );
    await settleDialogFocus();

    await user.click(dialog().getByRole("button", { name: "Save Log" }));

    expect(showBannerMock).toHaveBeenCalledWith({
      severity: "error",
      message: "Please fill all required fields",
      scoped: true,
    });
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("submits the log with selected tags, description, and the signed-in user's details", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    mockAddLog(mutateAsync);
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <AddMaintenanceLogModal
        open
        onOpenChange={onOpenChange}
        deviceName="e2e_device"
      />
    );
    await settleDialogFocus();

    await selectTag(user, "Site update check");
    await user.type(dialog().getByRole("textbox"), "Replaced the enclosure seal.");
    await user.click(dialog().getByRole("button", { name: "Save Log" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        deviceName: "e2e_device",
        logData: expect.objectContaining({
          tags: ["site update check"],
          description: "Replaced the enclosure seal.",
          maintenanceType: "preventive",
          userName: "belinda@airqo.net",
          email: "belinda@airqo.net",
          firstName: "Belinda",
          lastName: "Kobusingye",
          user_id: "user-1",
        }),
      });
    });
    await waitFor(() => {
      expect(showBannerWithDelayMock).toHaveBeenCalledWith(
        {
          severity: "success",
          title: "Success",
          message: "Maintenance log for e2e_device has been added successfully.",
          scoped: false,
        },
        300
      );
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("toggles to Corrective and submits that maintenance type", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    mockAddLog(mutateAsync);
    const user = userEvent.setup();
    render(
      <AddMaintenanceLogModal open onOpenChange={vi.fn()} deviceName="e2e_device" />
    );
    await settleDialogFocus();

    await user.click(dialog().getByRole("switch"));
    expect(dialog().getByText("Corrective")).toHaveClass("font-semibold");

    await selectTag(user, "Device equipment check");
    await user.click(dialog().getByRole("button", { name: "Save Log" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          logData: expect.objectContaining({ maintenanceType: "corrective" }),
        })
      );
    });
  });

  it("shows an error banner and stays open when saving fails", async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error("Network Error"));
    mockAddLog(mutateAsync);
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <AddMaintenanceLogModal open onOpenChange={onOpenChange} deviceName="e2e_device" />
    );
    await settleDialogFocus();

    await selectTag(user, "Site update check");
    await user.click(dialog().getByRole("button", { name: "Save Log" }));

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "error",
        message: "Failed to Add Maintenance Log: Network Error",
        scoped: true,
      });
    });
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("resets tags, description, and maintenance type when the modal is closed and reopened", async () => {
    mockAddLog(vi.fn());
    const user = userEvent.setup();
    const { rerender } = render(
      <AddMaintenanceLogModal open onOpenChange={vi.fn()} deviceName="e2e_device" />
    );
    await settleDialogFocus();

    await selectTag(user, "Site update check");
    await user.type(dialog().getByRole("textbox"), "Some notes");
    await user.click(dialog().getByRole("switch"));

    rerender(
      <AddMaintenanceLogModal
        open={false}
        onOpenChange={vi.fn()}
        deviceName="e2e_device"
      />
    );
    rerender(
      <AddMaintenanceLogModal open onOpenChange={vi.fn()} deviceName="e2e_device" />
    );
    await settleDialogFocus();

    expect(dialog().getByText("Select or add tags...")).toBeInTheDocument();
    expect(dialog().getByRole("textbox")).toHaveValue("");
    expect(dialog().getByText("Preventive")).toHaveClass("font-semibold");
  });
});
