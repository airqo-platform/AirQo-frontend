import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DecommissionDeviceDialog from "./decommission-device-dialog";
import { useDecommissionDevice } from "@/core/hooks/useDevices";
import { useUserContext } from "@/core/hooks/useUserContext";

vi.mock("@/core/hooks/useDevices", () => ({
  useDecommissionDevice: vi.fn(),
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

function mockDecommission(
  mutateAsync: (variables: unknown) => Promise<unknown>,
  isPending = false
) {
  vi.mocked(useDecommissionDevice).mockReturnValue({
    mutateAsync,
    isPending,
  } as unknown as ReturnType<typeof useDecommissionDevice>);
}

function confirmCheckbox() {
  return dialog().getByRole("checkbox", { name: /I understand/ });
}

describe("DecommissionDeviceDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUserContext).mockReturnValue({
      userDetails: USER_DETAILS,
    } as unknown as ReturnType<typeof useUserContext>);
  });

  it("shows the selected device and explains what decommissioning does", () => {
    mockDecommission(vi.fn());
    render(
      <DecommissionDeviceDialog
        open
        onOpenChange={vi.fn()}
        deviceName="aq_device_001"
        deviceDisplayName="AQ Device 001"
      />
    );

    expect(dialog().getByText("Selected device: AQ Device 001")).toBeInTheDocument();
    expect(
      dialog().getByText(/permanently retires the device on the platform/i)
    ).toBeInTheDocument();
    expect(dialog().getByText(/upstream data channel is not modified/i)).toBeInTheDocument();
  });

  it("keeps Decommission Device disabled until the user confirms", async () => {
    mockDecommission(vi.fn());
    const user = userEvent.setup();
    render(<DecommissionDeviceDialog open onOpenChange={vi.fn()} deviceName="aq_device_001" />);

    const submit = () => dialog().getByRole("button", { name: "Decommission Device" });
    expect(submit()).toBeDisabled();

    await user.click(confirmCheckbox());
    expect(submit()).toBeEnabled();
  });

  it("decommissions with the trimmed reason and the signed-in user's details", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    mockDecommission(mutateAsync);
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DecommissionDeviceDialog
        open
        onOpenChange={onOpenChange}
        deviceName="aq_device_001"
        deviceDisplayName="AQ Device 001"
      />
    );

    await user.type(
      dialog().getByLabelText(/Reason/),
      "  ThingSpeak channel deleted upstream  "
    );
    await user.click(confirmCheckbox());
    await user.click(dialog().getByRole("button", { name: "Decommission Device" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        deviceName: "aq_device_001",
        decommissionData: expect.objectContaining({
          reason: "ThingSpeak channel deleted upstream",
          user_id: "user-1",
          date: expect.any(String),
          firstName: "Belinda",
          lastName: "Kobusingye",
          email: "belinda@airqo.net",
          userName: "belinda",
        }),
      });
    });
    await waitFor(() => {
      expect(showBannerWithDelayMock).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "success",
          message: expect.stringContaining("AQ Device 001 has been decommissioned"),
        }),
        300
      );
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("omits the reason from the request when it is left blank", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    mockDecommission(mutateAsync);
    const user = userEvent.setup();
    render(<DecommissionDeviceDialog open onOpenChange={vi.fn()} deviceName="aq_device_001" />);

    await user.click(confirmCheckbox());
    await user.click(dialog().getByRole("button", { name: "Decommission Device" }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    const [{ decommissionData }] = mutateAsync.mock.calls[0] as [
      { decommissionData: Record<string, unknown> },
    ];
    expect(decommissionData).not.toHaveProperty("reason");
  });

  it("shows an error banner and keeps the dialog open when the request fails", async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error("Device is already decommissioned"));
    mockDecommission(mutateAsync);
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DecommissionDeviceDialog open onOpenChange={onOpenChange} deviceName="aq_device_001" />
    );

    await user.click(confirmCheckbox());
    await user.click(dialog().getByRole("button", { name: "Decommission Device" }));

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "error",
        message: "Decommission Failed: Device is already decommissioned",
        scoped: true,
      });
    });
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("disables both actions while the request is in flight", () => {
    mockDecommission(vi.fn(), true);
    render(<DecommissionDeviceDialog open onOpenChange={vi.fn()} deviceName="aq_device_001" />);

    expect(dialog().getByRole("button", { name: "Decommissioning..." })).toBeDisabled();
    expect(dialog().getByRole("button", { name: "Cancel" })).toBeDisabled();
  });
});
