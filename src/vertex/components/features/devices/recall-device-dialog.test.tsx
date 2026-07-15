import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RecallDeviceDialog from "./recall-device-dialog";
import { useRecallDevice } from "@/core/hooks/useDevices";
import { useUserContext } from "@/core/hooks/useUserContext";

vi.mock("@/core/hooks/useDevices", () => ({
  useRecallDevice: vi.fn(),
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

// jsdom doesn't implement scrollIntoView, which ReusableSelectInput uses.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

function dialog() {
  return within(screen.getByRole("dialog"));
}

const USER_DETAILS = {
  _id: "user-1",
  firstName: "Belinda",
  lastName: "Kobusingye",
  email: "belinda@airqo.net",
  userName: "belinda",
};

function mockRecall(mutateAsync: (variables: unknown) => Promise<unknown>) {
  vi.mocked(useRecallDevice).mockReturnValue({
    mutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useRecallDevice>);
}

async function selectRecallType(user: ReturnType<typeof userEvent.setup>, label: string) {
  await user.click(dialog().getByRole("button", { name: /Set Recall Type/ }));
  await user.click(dialog().getByRole("option", { name: label }));
}

describe("RecallDeviceDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUserContext).mockReturnValue({
      userDetails: USER_DETAILS,
    } as unknown as ReturnType<typeof useUserContext>);
  });

  it("shows the selected device in the subtitle", () => {
    mockRecall(vi.fn());
    render(
      <RecallDeviceDialog
        open
        onOpenChange={vi.fn()}
        deviceName="e2e_device"
        deviceDisplayName="E2E Device"
      />
    );

    expect(dialog().getByText("Selected device: E2E Device")).toBeInTheDocument();
  });

  it("disables Recall Device until a recall type is selected", () => {
    mockRecall(vi.fn());
    render(<RecallDeviceDialog open onOpenChange={vi.fn()} deviceName="e2e_device" />);

    expect(dialog().getByRole("button", { name: "Recall Device" })).toBeDisabled();
  });

  it("recalls the device with the selected type and the signed-in user's details", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    mockRecall(mutateAsync);
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <RecallDeviceDialog
        open
        onOpenChange={onOpenChange}
        deviceName="e2e_device"
        deviceDisplayName="E2E Device"
      />
    );

    await selectRecallType(user, "Errors");
    await user.click(dialog().getByRole("button", { name: "Recall Device" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        deviceName: "e2e_device",
        recallData: expect.objectContaining({
          recallType: "errors",
          user_id: "user-1",
          firstName: "Belinda",
          lastName: "Kobusingye",
          email: "belinda@airqo.net",
          userName: "belinda",
        }),
      });
    });
    await waitFor(() => {
      expect(showBannerWithDelayMock).toHaveBeenCalledWith(
        {
          severity: "success",
          title: "Success",
          message: "E2E Device has been recalled successfully.",
          scoped: false,
        },
        300
      );
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("falls back to deviceName in messages when no display name is given", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    mockRecall(mutateAsync);
    const user = userEvent.setup();
    render(<RecallDeviceDialog open onOpenChange={vi.fn()} deviceName="e2e_device" />);

    await selectRecallType(user, "Disconnected");
    await user.click(dialog().getByRole("button", { name: "Recall Device" }));

    await waitFor(() => {
      expect(showBannerWithDelayMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "e2e_device has been recalled successfully.",
        }),
        300
      );
    });
  });

  it("shows an error banner and keeps the dialog open when the recall fails", async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error("Network Error"));
    mockRecall(mutateAsync);
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <RecallDeviceDialog open onOpenChange={onOpenChange} deviceName="e2e_device" />
    );

    await selectRecallType(user, "Errors");
    await user.click(dialog().getByRole("button", { name: "Recall Device" }));

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "error",
        message: "Recall Failed: Network Error",
        scoped: true,
      });
    });
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("disables the primary and secondary actions while recalling", () => {
    mockRecall(vi.fn());
    vi.mocked(useRecallDevice).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof useRecallDevice>);
    render(<RecallDeviceDialog open onOpenChange={vi.fn()} deviceName="e2e_device" />);

    expect(dialog().getByRole("button", { name: "Recalling..." })).toBeDisabled();
    expect(dialog().getByRole("button", { name: "Cancel" })).toBeDisabled();
  });
});
