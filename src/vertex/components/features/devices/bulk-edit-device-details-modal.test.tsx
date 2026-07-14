import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BulkEditDevicesModal from "./bulk-edit-device-details-modal";
import { useUpdateDeviceBulk } from "@/core/hooks/useDevices";

vi.mock("@/core/hooks/useDevices", () => ({
  useUpdateDeviceBulk: vi.fn(),
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

const DEVICE_IDS = ["device-1", "device-2", "device-3"];

function dialog() {
  return within(screen.getByRole("dialog"));
}

// ReusableDialog auto-focuses the first focusable element 100ms after
// opening; typing that straddles that window gets its focus yanked back
// mid-field, interleaving keystrokes. Wait it out before typing.
async function settleDialogFocus() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
}

function mockBulkUpdate(
  spy: (variables: unknown, hookOptions: unknown, callOptions: unknown) => void
) {
  vi.mocked(useUpdateDeviceBulk).mockImplementation((hookOptions) =>
    ({
      mutate: (variables: unknown, callOptions: unknown) =>
        spy(variables, hookOptions, callOptions),
      isPending: false,
    }) as unknown as ReturnType<typeof useUpdateDeviceBulk>
  );
}

async function selectField(user: ReturnType<typeof userEvent.setup>, label: string) {
  await user.click(dialog().getByRole("button", { name: /Select field to update/ }));
  await user.click(dialog().getByRole("option", { name: label }));
}

describe("BulkEditDevicesModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("disables Continue until a field and a value are chosen", async () => {
    mockBulkUpdate(vi.fn());
    const user = userEvent.setup();
    render(<BulkEditDevicesModal open onClose={vi.fn()} deviceIds={DEVICE_IDS} />);
    await settleDialogFocus();

    expect(dialog().getByRole("button", { name: "Continue" })).toBeDisabled();

    await selectField(user, "Category");
    expect(dialog().getByRole("button", { name: "Continue" })).toBeDisabled();

    await user.click(await dialog().findByRole("button", { name: /^Category/ }));
    await user.click(dialog().getByRole("option", { name: "Reference Monitor" }));
    expect(dialog().getByRole("button", { name: "Continue" })).not.toBeDisabled();
  });

  it("requires a non-blank trimmed value for the Network field", async () => {
    mockBulkUpdate(vi.fn());
    const user = userEvent.setup();
    render(<BulkEditDevicesModal open onClose={vi.fn()} deviceIds={DEVICE_IDS} />);
    await settleDialogFocus();

    await selectField(user, "Network");
    const networkField = await dialog().findByLabelText("Network");
    await user.type(networkField, "   ");
    expect(dialog().getByRole("button", { name: "Continue" })).toBeDisabled();

    await user.type(networkField, "airqo");
    expect(dialog().getByRole("button", { name: "Continue" })).not.toBeDisabled();
  });

  it("walks category through confirm and submits the bulk update, closing on success", async () => {
    const updateSpy = vi.fn((variables, hookOptions, callOptions) => {
      hookOptions?.onSuccess?.();
      callOptions?.onSuccess?.();
    });
    mockBulkUpdate(updateSpy);
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<BulkEditDevicesModal open onClose={onClose} deviceIds={DEVICE_IDS} />);
    await settleDialogFocus();

    await selectField(user, "Category");
    await user.click(await dialog().findByRole("button", { name: /^Category/ }));
    await user.click(dialog().getByRole("option", { name: "Low Cost" }));
    await user.click(dialog().getByRole("button", { name: "Continue" }));

    expect(dialog().getByText("You are about to update:")).toBeInTheDocument();
    expect(dialog().getByText("category")).toBeInTheDocument();
    expect(dialog().getByText('"lowcost"')).toBeInTheDocument();
    expect(dialog().getByText(/This will affect/)).toBeInTheDocument();
    expect(dialog().getByText("3")).toBeInTheDocument();

    await user.click(dialog().getByRole("button", { name: "Confirm Update" }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        { deviceIds: DEVICE_IDS, updateData: { category: "lowcost" } },
        expect.anything(),
        expect.anything()
      );
    });
    expect(showBannerWithDelayMock).toHaveBeenCalledWith({
      severity: "success",
      message: "Devices updated successfully.",
      scoped: false,
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Back returns to the field step without submitting", async () => {
    mockBulkUpdate(vi.fn());
    const user = userEvent.setup();
    render(<BulkEditDevicesModal open onClose={vi.fn()} deviceIds={DEVICE_IDS} />);
    await settleDialogFocus();

    await selectField(user, "Network");
    await user.type(await dialog().findByLabelText("Network"), "airqo");
    await user.click(dialog().getByRole("button", { name: "Continue" }));
    await user.click(dialog().getByRole("button", { name: "Back" }));

    expect(await dialog().findByLabelText("Network")).toHaveValue("airqo");
  });

  it("submits a boolean value for Auth Required", async () => {
    const updateSpy = vi.fn();
    mockBulkUpdate(updateSpy);
    const user = userEvent.setup();
    render(<BulkEditDevicesModal open onClose={vi.fn()} deviceIds={DEVICE_IDS} />);
    await settleDialogFocus();

    await selectField(user, "Auth Required");
    await user.click(await dialog().findByRole("button", { name: /^Auth Required/ }));
    await user.click(dialog().getByRole("option", { name: "True" }));
    await user.click(dialog().getByRole("button", { name: "Continue" }));
    await user.click(dialog().getByRole("button", { name: "Confirm Update" }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        { deviceIds: DEVICE_IDS, updateData: { authRequired: true } },
        expect.anything(),
        expect.anything()
      );
    });
  });

  it("shows an error banner and stays open when the update fails", async () => {
    const updateSpy = vi.fn((variables, hookOptions) => {
      hookOptions?.onError?.(new Error("Network Error"));
    });
    mockBulkUpdate(updateSpy);
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<BulkEditDevicesModal open onClose={onClose} deviceIds={DEVICE_IDS} />);
    await settleDialogFocus();

    await selectField(user, "Network");
    await user.type(await dialog().findByLabelText("Network"), "airqo");
    await user.click(dialog().getByRole("button", { name: "Continue" }));
    await user.click(dialog().getByRole("button", { name: "Confirm Update" }));

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "error",
        message: "Bulk update failed: Network Error",
        scoped: true,
      });
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("resets the field selection when Cancel is clicked and the dialog is reopened", async () => {
    mockBulkUpdate(vi.fn());
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <BulkEditDevicesModal open onClose={onClose} deviceIds={DEVICE_IDS} />
    );

    await selectField(user, "Network");
    await user.type(await dialog().findByLabelText("Network"), "airqo");
    await user.click(dialog().getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(<BulkEditDevicesModal open onClose={onClose} deviceIds={DEVICE_IDS} />);
    expect(
      dialog().getByRole("button", { name: /Select field to update/ })
    ).toHaveTextContent("Choose field");
  });
});
